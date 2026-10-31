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
      if(name==='/extension/sidepanel.html')body=body.toString().replace('<script type="module"','<script src="/tools/fixtures/panel-mock.js"></script><script type="module"');
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
  for (const width of [360, 390]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    assert.equal(await run('document.documentElement.scrollWidth<=innerWidth+1'),true,'the panel must fit a narrow sidebar');
    assert.equal(await run('document.getElementById("log").getBoundingClientRect().height>=80'),true,'chat must retain readable space');
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(root,'.work','panel-browser-check.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('Panel browser checks passed: scoped cancel, stale-answer rejection, one history pair, unshared page privacy, custom AI handoff, automatic question dedupe, navigation pause, visible task review and token handoff, no silent retarget after a tab closes, honest no-text handoff, Esc ending a desktop task.');
})().catch((e)=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  try{ws?.close();}catch{}await closeTestBrowser(browser,profile);server?.closeAllConnections();server?.close();
  if(profile&&path.resolve(profile).startsWith(path.join(root,'.work')+path.sep))try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200});}catch{}
});
