// The extension's question page script on real pages in headless Edge: it
// picks and presses Next only where the page itself says practice, and never
// presses Submit. (workspace-check.mjs covers the runner; this covers the
// page's own decision and the real clicks.)
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {closeTestBrowser}=require('./browser-cleanup.cjs');
const root=path.resolve(__dirname,'..'),pause=(ms)=>new Promise((r)=>setTimeout(r,ms));

const question=(n,type='radio')=>`<fieldset class="question"><legend>Question ${n}: which of these is a network of infected devices?</legend>
  <label><input type="${type}" name="q${n}" value="a"> Firewall</label><label><input type="${type}" name="q${n}" value="b"> Botnet</label><label><input type="${type}" name="q${n}" value="c"> Proxy</label></fieldset>`;
const page=(title,top,buttons,extra='')=>`<!doctype html><meta charset="utf-8"><title>${title}</title><body><h1>${top}</h1>${extra}${question(1)}${question(2,'checkbox')}
  ${buttons}<script>window.pressed=[];document.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pressed.push(b.textContent.trim());});</script></body>`;
const PAGES={
  practice:page('Practice Quiz: Networking','Practice quiz — self-check, ungraded','<button>Next</button><button>Finish</button>'),
  graded:page('Quiz 3: Networking','Quiz 3','<button>Next</button><button>Submit quiz</button>','<p>1 pts</p>'),
  // The page says practice, but a timer (hidden or not) is a grading sign.
  timed:page('Practice Quiz','Practice quiz','<button>Next</button>','<div class="timer" hidden>Time remaining 9:58</div>'),
  // A long page whose only grading sign is the button at the very bottom.
  long:page('Practice test','Practice test','<button>Next</button><button>Submit quiz</button>',`<p>${'Read the passage carefully. '.repeat(700)}</p>`),
  unclear:page('Quiz 4','Quiz 4','<button>Next</button>'),
  finishOnly:page('Practice Quiz','Practice quiz','<button>Finish</button>'),
};
let server,browser,profile,ws;
(async()=>{
  server=http.createServer((req,res)=>{
    const name=new URL(req.url,'http://localhost').pathname.slice(1);
    if(name==='assess.js'||name==='question-page.js'){res.setHeader('Content-Type','text/javascript');return res.end(fs.readFileSync(path.join(root,'extension',name)));}
    if(PAGES[name]){res.setHeader('Content-Type','text/html');return res.end(PAGES[name]);}
    res.writeHead(404);res.end();
  });
  await new Promise((r)=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  fs.mkdirSync(path.join(root,'.work'),{recursive:true});
  profile=fs.mkdtempSync(path.join(root,'.work','question-page-'));
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
  await call('Runtime.enable');await call('Page.enable');
  // Load a page, then the two scripts the worker injects (classifier optional).
  const open=async(name,classifier=true)=>{
    await call('Page.navigate',{url:`${base}/${name}`});
    for(let n=0;n<100&&await run('document.readyState')!=='complete';n++)await pause(50);
    for(const file of classifier?['assess.js','question-page.js']:['question-page.js'])
      await run(`new Promise((ok,fail)=>{const s=document.createElement('script');s.src='${base}/${file}';s.onload=ok;s.onerror=fail;document.head.append(s);})`);
    await run(`IzukiQuestionPage('install',{runId:'r'})`);
  };
  const op=(name,args={})=>run(`IzukiQuestionPage(${JSON.stringify(name)},${JSON.stringify({...args,runId:'r'})})`);
  const ticked=()=>run(`[...document.querySelectorAll('input')].map(i=>i.checked?i.name+i.value:'').filter(Boolean)`);

  // Practice: pick the radio, pick two checkboxes, press Next — never Finish.
  await open('practice');
  let read=await op('read');
  assert.equal(read.kind,'practice');assert.equal(read.state,'question');
  assert.equal((await op('select',{questionId:read.question.id,choices:[2],pageId:'stale'})).changed,true,'a pick against an older read is refused');
  assert.deepEqual(await ticked(),[]);
  let out=await op('select',{questionId:read.question.id,choices:[2],pageId:read.pageId});
  assert.equal(out.ok,true,out.text);assert.deepEqual(await ticked(),['q1b']);
  read=await op('read');assert.equal(read.question.multiple,true);
  assert.equal((await op('select',{questionId:read.question.id,choices:[9],pageId:read.pageId})).ok,false,'an option that isn\'t there is refused');
  out=await op('select',{questionId:read.question.id,choices:[1,2],pageId:read.pageId});
  assert.equal(out.ok,true,out.text);assert.deepEqual(await ticked(),['q1b','q2a','q2b']);
  read=await op('read');assert.equal(read.state,'next');
  out=await op('advance',{pageId:read.pageId});assert.equal(out.ok,true,out.text);
  assert.deepEqual(await run('pressed'),['Next'],'Next pressed, Finish not');

  // Only Finish on the page: advance refuses rather than submitting.
  await open('finishOnly');
  read=await op('read');
  for(const choices of [[2],[1]]){read=await op('read');if(read.state==='question')await op('select',{questionId:read.question.id,choices,pageId:read.pageId});}
  read=await op('read');
  out=await op('advance',{pageId:read.pageId});
  assert.equal(out.ok,false,'no Next: nothing pressed');assert.deepEqual(await run('pressed'),[],'Finish is never pressed');

  // Graded, timed, long-with-Submit-at-the-bottom and unclear pages: refused,
  // and nothing changes on the page.
  for(const name of ['graded','timed','long','unclear']){
    await open(name);read=await op('read');
    assert.equal(read.kind,'graded',`${name} reads as graded`);
    out=await op('select',{questionId:read.question.id,choices:[2],pageId:read.pageId});
    assert.equal(out.ok,false,`${name}: the pick is refused`);assert.match(out.text,/graded or unclear/);
    assert.deepEqual(await ticked(),[],`${name}: nothing is ticked`);
    assert.equal((await op('advance',{pageId:read.pageId})).ok,false);assert.deepEqual(await run('pressed'),[]);
  }

  // A practice page without the classifier loaded: refused too.
  await open('practice',false);read=await op('read');
  assert.equal(read.kind,'graded');
  assert.equal((await op('select',{questionId:read.question.id,choices:[2],pageId:read.pageId})).ok,false);assert.deepEqual(await ticked(),[]);

  assert.deepEqual(errors,[]);
  console.log('Question page: practice pages picked (radio and checkboxes) and Next pressed; stale reads and missing options refused; Finish/Submit never pressed; graded, timed, long and unclear pages and a missing classifier refused with nothing ticked.');
})().catch((e)=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  try{ws?.close();}catch{}await closeTestBrowser(browser,profile);server?.closeAllConnections();server?.close();
  if(profile&&path.resolve(profile).startsWith(path.join(root,'.work')+path.sep))try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200});}catch{}
});
