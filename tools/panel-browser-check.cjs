// Actual panel modules in installed Edge, with disposable Chrome API fixtures.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {closeTestBrowser}=require('./browser-cleanup.cjs');
const root=path.resolve(__dirname,'..'),pause=(ms)=>new Promise((r)=>setTimeout(r,ms));
let server,browser,profile,ws;
(async()=>{
  server=http.createServer((req,res)=>{
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    try{
      let body=fs.readFileSync(file);
      if(name==='/extension/sidepanel.html')body=body.toString().replace('<script type="module"','<script src="/extension/workspace-state.js"></script><script src="/extension/question-page.js"></script><script src="/tools/fixtures/panel-mock.js"></script><script type="module"');
      res.setHeader('Content-Type',path.extname(file)==='.js'?'text/javascript':path.extname(file)==='.html'?'text/html':'application/octet-stream');res.end(body);
    }catch{res.writeHead(404);res.end();}
  });
  await new Promise((r)=>server.listen(0,'127.0.0.1',r));
  fs.mkdirSync(path.join(root,'.work'),{recursive:true});
  profile=fs.mkdtempSync(path.join(root,'.work','panel-browser-'));
  browser=spawn(process.env.IZUKI_TEST_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  const portFile=path.join(profile,'DevToolsActivePort');
  for(let n=0;n<240&&!fs.existsSync(portFile);n++)await pause(250);
  assert(fs.existsSync(portFile),'test browser did not start');
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0].trim();
  const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  let id=0;const pending=new Map(),errors=[];
  ws.onmessage=(e)=>{const m=JSON.parse(String(e.data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);pending.get(m.id)?.(m);};
  const call=(method,params={})=>new Promise((r,j)=>{const key=++id,t=setTimeout(()=>{pending.delete(key);j(Error(method+' timed out'));},15000);pending.set(key,(m)=>{clearTimeout(t);pending.delete(key);m.error?j(Error(m.error.message)):r(m.result);});ws.send(JSON.stringify({id:key,method,params}));});
  const run=async(expression)=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const wait=async(expression)=>{for(let n=0;n<120;n++){if(await run(`Boolean(${expression})`))return;await pause(100);}throw Error('Not ready: '+expression);};
  await call('Runtime.enable');await call('Page.enable');await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/extension/sidepanel.html`});
  await wait('document.querySelectorAll("#provider option").length===10');
  const ask=async(text)=>run(`document.getElementById('q').value=${JSON.stringify(text)};document.getElementById('ask').requestSubmit();`);
  await ask('what is a botnet?');await wait('panelTest.asks.length===1');
  const first=await run('panelTest.asks[0].body.requestId');
  assert(first,'the request must have a backend cancellation id');
  await run('document.getElementById("new").click();panelTest.reply("An obsolete answer.");');
  await pause(100);assert.equal(await run('document.getElementById("log").textContent.includes("obsolete")'),false);
  await wait('panelTest.stops.length===1');assert.equal(await run('panelTest.stops[0].requestId'),first);
  await ask('explain the current chapter');await wait('panelTest.asks.length===2');await run('panelTest.reply("A fresh chapter answer.")');
  await wait('document.getElementById("log").textContent.includes("fresh chapter")');
  assert.equal(await run('panelTest.stores.session["izkPanel:7"].history.length'),2,'one completed turn pair, no stale history');
  await run('document.getElementById("share").checked=false');const readCount=await run('panelTest.reads.length');
  await ask('hello without my page');await wait('panelTest.asks.length===3');
  assert.equal(await run('panelTest.reads.length'),readCount,'unshared page must not be read');
  assert.equal(await run('panelTest.asks[2].body.text'),'');await run('panelTest.reply("Hello.")');await wait('!document.getElementById("send").disabled');
  await run('const p=document.getElementById("provider");p.value="any";p.dispatchEvent(new Event("change"));');
  await wait('document.querySelectorAll("#provider-tabs option").length===2');
  await run('const t=document.getElementById("provider-tabs");t.value="2";t.dispatchEvent(new Event("change"));document.getElementById("connect").click();');
  await wait('document.getElementById("connection-help").textContent.includes("Connected to your")');
  await ask('question for my custom AI');await wait('panelTest.handed.length===1');
  assert.equal(await run('panelTest.handed[0].id'),2,'only the chosen custom AI tab receives the prompt');
  await run('document.getElementById("share").checked=true;document.getElementById("follow-questions").checked=true;document.getElementById("follow-questions").dispatchEvent(new Event("change"));');
  await wait('panelTest.handed.length===2');await pause(4300);
  assert.equal(await run('panelTest.handed.length'),2,'unchanged questions must not be sent again');
  await run('panelTest.pages[0].url="https://course.example/chapter6"');
  await wait('!document.getElementById("follow-questions").checked');
  assert.equal(await run('panelTest.handed.length'),2,'navigation pauses auto sharing');
  await run('document.getElementById("q").value="Open the project instructions";document.getElementById("task-open").click();');
  assert.equal(await run('document.getElementById("task-review").open'),true,'desktop tasks need a visible entry point');
  assert.equal(await run('document.getElementById("task-text").value'),'Open the project instructions');
  await run('document.getElementById("task-run").click()');
  await wait('panelTest.tasks.length===2');
  assert.equal(await run('panelTest.tasks[0].body.prompt'),'Open the project instructions');
  assert.equal(await run('panelTest.tasks[1].body.reviewToken'),'fixture-review');
  assert.equal(await run('panelTest.tasks[0].body.requestId===panelTest.tasks[1].body.requestId'),true);
  await wait('document.getElementById("log").textContent.includes("reviewed fixture task finished")');
  // Two ChatGPT tabs: connect to the second, close it, and the connection
  // must not quietly move the next question into the first.
  await run(`panelTest.pages.push({id:4,windowId:7,active:false,url:"https://chatgpt.com/c/first",title:"ChatGPT first"},{id:5,windowId:7,active:false,url:"https://chatgpt.com/c/second",title:"ChatGPT second"});`);
  await run('(()=>{const pick=document.getElementById("provider");pick.value="chatgpt";pick.dispatchEvent(new Event("change"));})();');
  await wait('document.querySelectorAll("#provider-tabs option").length===2');
  await run('(()=>{const pick=document.getElementById("provider-tabs");pick.value="5";pick.dispatchEvent(new Event("change"));document.getElementById("connect").click();})();');
  await wait('document.getElementById("connection-help").textContent.includes("Connected to your ChatGPT")');
  await run('panelTest.pages=panelTest.pages.filter((t)=>t.id!==5);chrome.tabs.onRemoved.handlers.forEach((fn)=>fn(5));');
  await wait('document.getElementById("connection-help").textContent.includes("Press Connect")');
  // The page under the panel moved during the follow-mode check; let the
  // panel see it before asking, so this tests the connection, not the page.
  await run('panelTest.pages[0].title="Chapter 6";chrome.tabs.onUpdated.handlers.forEach((fn)=>fn(1,{title:"Chapter 6",status:"complete"}));');
  await wait('document.getElementById("ptitle").textContent==="Chapter 6"');
  const beforeClose = await run('panelTest.handed.length');
  await ask('which chat is this');
  await pause(800);
  const logText = await run('document.getElementById("log").textContent');
  assert(logText.includes('Connect before sharing'), 'the connection warning must be shown; got: ' + logText.slice(-300));
  assert(logText.includes('Try again'), 'a failed handoff can be retried without retyping');
  assert.equal(await run('panelTest.handed.length'), beforeClose, 'a closed tab must never hand the question to another conversation');
  // The real typing function against an editor that drops what it is given:
  // nothing typed can never be called sent, and Send is never pressed.
  const typed = await run(`(async () => {
    const { typeIntoComposer } = await import('/extension/providers.js');
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:0;left:0;width:300px;height:200px;z-index:9999';
    const box = document.createElement('div');
    box.setAttribute('contenteditable','true');
    box.style.cssText = 'width:280px;height:40px;display:block';
    const send = document.createElement('button');
    send.setAttribute('aria-label','Send');
    send.style.cssText = 'width:40px;height:20px;display:block';
    let clicks = 0;
    send.addEventListener('click', () => { clicks += 1; });
    box.addEventListener('input', () => { box.textContent = ''; });
    host.append(box, send);
    document.body.appendChild(host);
    const out = await typeIntoComposer('Explain the chapter for me', ['div[contenteditable="true"]'], ['button[aria-label="Send"]'], true, location.origin);
    host.remove();
    return { out, clicks };
  })()`);
  assert.deepEqual(typed.out, { ok: false, why: 'no-text' }, 'a message that never landed must not be reported as sent');
  assert.equal(typed.clicks, 0, 'Send must not be pressed when the message box is empty');
  // Esc has to end a desktop task from anywhere in the panel, as it promises.
  await run('document.getElementById("q").value="Summarise the page into my notes";document.getElementById("task-open").click();document.getElementById("task-run").click();');
  await wait('panelTest.tasks.filter((t)=>t.route==="run").length===2');
  await run('document.getElementById("log").focus();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true}));');
  await wait('panelTest.stops.filter((s)=>s.kind==="task").length===1');
  await wait('document.getElementById("stop").hidden===true');
  await wait('document.getElementById("log").textContent.includes("Stopped")');
  // Auto-connect: a Gemini tab opened while the panel is up is used without
  // pressing Connect, and turning the switch off is remembered.
  const readsBefore = await run('panelTest.reads.length');
  await run(`panelTest.pages.push({id:6,windowId:7,active:false,url:"https://gemini.google.com/app",title:"Gemini"});(()=>{const pick=document.getElementById("provider");pick.value="gemini";pick.dispatchEvent(new Event("change"));})();`);
  await wait('document.getElementById("connection-help").textContent.includes("Connected by itself")');
  assert.equal(await run('document.getElementById("answer-who").textContent'),'Gemini tab','the folded line must name the tab that answers');
  assert.equal(await run('panelTest.reads.length'), readsBefore, 'connecting must not read the page');
  await run('const box=document.getElementById("auto-connect");box.checked=false;box.dispatchEvent(new Event("change"));');
  await wait('Boolean(panelTest.stores.local.izkConnect) && panelTest.stores.local.izkConnect.autoConnect===false');
  // A long answer is a card: it says who wrote it, starts folded, and opens whole.
  await run('(()=>{const pick=document.getElementById("provider");pick.value="izuki";pick.dispatchEvent(new Event("change"));})();');
  await wait('document.getElementById("answer-who").textContent==="Izuki on this PC"');
  const asked = await run('panelTest.asks.length');
  await ask('give me the whole chapter');
  await wait(`panelTest.asks.length===${asked+1}`);
  await run('panelTest.reply("A long sentence you actually want to read. ".repeat(120))');
  await wait('document.querySelector(".msg.it.answer.clip .more")');
  assert.equal(await run('[...document.querySelectorAll(".msg.it.answer")].at(-1).querySelector(".answer-head").textContent.includes("Izuki")'),true,'an answer must say who wrote it');
  await run('[...document.querySelectorAll(".msg.it.answer")].at(-1).querySelector(".more").click()');
  const opened = await run('(()=>{const card=[...document.querySelectorAll(".msg.it.answer")].at(-1);return {clip:card.classList.contains("clip"),wide:card.classList.contains("wide"),label:card.querySelector(".more").textContent};})()');
  assert.deepEqual(opened,{clip:false,wide:true,label:"Fold it back up"},'the whole answer must open wide, with a way back');
  // Completed conversations appear once and can be reopened without the app.
  await wait('document.querySelectorAll(".recent-chat").length>=1');
  const histories=await run('document.querySelectorAll(".recent-chat").length');
  await run('document.getElementById("new").click();');
  await pause(100);assert.equal(await run('document.querySelectorAll(".recent-chat").length'),histories,'opening a new empty chat must not add history');
  await run('document.querySelector(".recent-chat").click()');await wait('document.querySelector(".msg.it.answer")');
  await run('document.getElementById("float-panel").click()');await wait('panelTest.workspaces.some(p=>p.op==="float")');
  // A chat command is an explicit start; following page text remains read-only.
  await ask('answer all these questions');await wait('panelTest.workspaces.some(p=>p.op==="quizStart")');
  // There is no submission option any more: the request can't carry one.
  assert.equal(await run('panelTest.workspaces.find(p=>p.op==="quizStart").submitAtEnd'),undefined,'a quiz run has no way to ask for submission');
  assert.equal(await run('document.getElementById("pin-page").checked'),true);
  const lab={title:'Fixture lab',requirements:['Save a report'],steps:[{title:'Save report',action:'Save report.docx in the lab folder.',check:'Reopen report.docx and check its title.',requirements:[1],final:false}],deliverables:[{name:'report.docx',step:1}]};
  await run(`(()=>{const p=document.getElementById('provider');p.value='any';p.dispatchEvent(new Event('change'));})();`);
  await wait('document.querySelectorAll("#provider-tabs option").length>=2');
  await run(`document.getElementById('provider-tabs').value='2';document.getElementById('provider-tabs').dispatchEvent(new Event('change'));document.getElementById('connect').click();`);
  await wait('document.getElementById("connection-help").textContent.includes("Connected to your")');
  await run(`panelTest.providerReply=${JSON.stringify(JSON.stringify(lab))};document.getElementById('lab-tools').open=true;document.getElementById('lab-plan').click();`);
  await wait('document.querySelectorAll("[data-lab-step]").length===1');
  assert.equal(await run('panelTest.workspaces.filter(p=>p.op==="labStart").length'),0,'receiving an AI plan is not approval to act');
  await run('document.getElementById("lab-start").click()');await wait('panelTest.workspaces.some(p=>p.op==="labStart")');
  assert.equal(await run('panelTest.workspaces.find(p=>p.op==="labStart").plan.steps[0].instruction'),lab.steps[0].action+'\nVerify: '+lab.steps[0].check,'run exactly the visible reviewed instruction');
  // There's no submission switch any more, so nothing asks for one.
  assert.equal(await run('panelTest.workspaces.find(p=>p.op==="labStart").allowSubmit'),undefined);
  assert.equal(await run('!!document.getElementById("lab-submit")||!!document.getElementById("quiz-submit")'),false,'no submission switches in the panel');
  await wait('document.getElementById("lab-status").textContent.includes("needs review")');
  assert.equal(await run('document.getElementById("lab-coverage").textContent.includes("0/1 deliverables verified")'),true);
  // Real DOM: the page reader reads the question, and refuses to answer it.
  // select and advance used to tick the radio and press Next; now both are
  // refused before the page is touched, so the radio stays clear and Next is
  // never pressed — checked here on a live page, not a stub.
  const questionDOM=await run(`(async()=>{
    const host=document.createElement('div');host.style.cssText='position:fixed;inset:0;background:white;z-index:99999';
    host.innerHTML='<fieldset id="fixture-question"><legend>Which option describes infected devices controlled together?</legend><label><input type="radio" name="fixture-choice">Firewall</label><label><input type="radio" name="fixture-choice">Botnet</label></fieldset><button id="fixture-next">Next</button>';
    document.body.append(host);let next=0;host.querySelector('button').onclick=()=>next++;
    const page=globalThis.IzukiQuestionPage;await page('install',{runId:'dom-test'});
    const first=await page('read',{runId:'dom-test'});
    const stale=await page('select',{runId:'dom-test',question:{...first.question,stem:'A changed question'},choices:[2]});
    const selected=await page('select',{runId:'dom-test',question:first.question,choices:[2]});
    const after=await page('read',{runId:'dom-test'});
    const moved=await page('advance',{runId:'dom-test',pageId:after.pageId,proof:after});
    const written=document.createElement('textarea');host.querySelector('fieldset').append(written);
    const blocked=await page('advance',{runId:'dom-test',pageId:after.pageId,proof:after});
    await page('stop',{runId:'dom-test'});const stopped=await page('read',{runId:'dom-test'});
    const ticked=[...host.querySelectorAll('input[type=radio]')].some(r=>r.checked);
    host.remove();return {first:first.state,options:first.question.options,stale:stale.ok,selected:selected.ok,moved:moved.ok,blocked:blocked.ok,stopped:stopped.ok,next,ticked,refusal:selected.text};
  })()`);
  assert.match(questionDOM.refusal||'',/doesn't choose or submit/,'select is refused, not merely failing');
  delete questionDOM.refusal;
  assert.deepEqual(questionDOM,{first:'question',options:['Firewall','Botnet'],stale:false,selected:false,moved:false,blocked:false,stopped:false,next:0,ticked:false});
  const readback=await run(`(async()=>{
    await import('/extension/providers.js');
    const host=document.createElement('div');host.style.cssText='position:fixed;inset:0;background:white;z-index:99999';
    host.innerHTML='<div data-message-author-role="user">Do not read me as the answer</div><div data-message-author-role="assistant">The real assistant answer.</div><div data-message-author-role="assistant" hidden>Hidden stale answer</div>';
    document.body.append(host);const result=globalThis.IzukiProviderDOM.readAssistant(['[data-message-author-role="assistant"]'],['[data-message-author-role="user"]'],location.origin);host.remove();return result;
  })()`);
  assert.equal(readback.text,'The real assistant answer.');assert.equal(readback.count,1);assert.equal(readback.user,'Do not read me as the answer');
  await run('document.getElementById("clear-chats").click()');await wait('document.querySelectorAll(".recent-chat").length===0');
  // The case the owner actually described: the Gemini tab is already open
  // when the panel starts. A fresh panel must use it with no Connect press.
  await run('localStorage.setItem("panelTest:gemini","1");localStorage.setItem("panelTest:fresh","1");localStorage.setItem("panelTest:connect",JSON.stringify({providerId:"gemini",autoConnect:true}));');
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/extension/sidepanel.html`});
  await wait('window.panelTest && window.panelTest.fresh');
  await wait('document.getElementById("provider").value==="gemini"');
  await wait('document.getElementById("connection-help").textContent.includes("Connected by itself")');
  assert.equal(await run('document.getElementById("answer-who").textContent'),'Gemini tab','a fresh panel must name the tab it found');
  assert.equal(await run('panelTest.handed.length'),0,'finding the tab must not send anything');
  for (const width of [360, 390]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    assert.equal(await run('document.documentElement.scrollWidth<=innerWidth+1'),true,'the panel must fit a narrow sidebar');
    assert.equal(await run('document.getElementById("log").getBoundingClientRect().height>=80'),true,'chat must retain readable space');
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(root,'.work','panel-browser-check.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('Panel browser checks passed: scoped cancel, stale-answer rejection, one history pair, unshared page privacy, custom AI handoff, automatic question dedupe, navigation pause, visible task review and token handoff, no silent retarget after a tab closes, honest no-text handoff, Esc ending a desktop task, quiet auto-connect to an open AI tab, and answers that open whole.');
})().catch((e)=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  try{ws?.close();}catch{}await closeTestBrowser(browser,profile);server?.closeAllConnections();server?.close();
  if(profile&&path.resolve(profile).startsWith(path.join(root,'.work')+path.sep))try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200});}catch{}
});
