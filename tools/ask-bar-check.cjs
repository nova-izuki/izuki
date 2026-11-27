// The Alt+Space ask bar (AskBar.tsx) in a real browser: opens, takes typing, sends
// through the normal chat pipeline, shows the answer, closes on Esc.
// Browser integration test against actual React components. Uses its own dev
// server/cache, or IZUKI_TEST_ORIGIN for an already-running local server.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { closeTestBrowser } = require('./browser-cleanup.cjs');
const root = path.resolve(__dirname, '..');
let origin = process.env.IZUKI_TEST_ORIGIN;
const edge = process.env.IZUKI_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let browser, ws, profile, server, cacheDir;
(async () => {
  if (!origin) {
    const { createServer } = await import('vite');
    // A fresh dependency cache every run. A leftover cache from an older run
    // served a mismatched react-dom chunk ("does not provide an export named
    // 't'"), so the fixture never mounted and every wait timed out. The entry
    // needs forward slashes too: Vite's dependency scanner skipped a Windows
    // path, then re-optimised mid-load and reloaded the page under the test.
    fs.mkdirSync(path.join(root, '.work'), {recursive:true});
    cacheDir = fs.mkdtempSync(path.join(root,'.work','vite-askbar-'));
    server = await createServer({ configFile:path.join(root,'vite.config.ts'), cacheDir, optimizeDeps:{force:true,entries:['ask-bar.html'].map(name=>path.join(root,'tools/fixtures',name).split(path.sep).join('/'))}, server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false} });
    await server.listen(); origin=server.resolvedUrls.local[0].replace(/\/$/,'');
  }
  profile = fs.mkdtempSync(path.join(root, '.work', 'askbar-browser-'));
  browser = spawn(edge, ['--headless=new','--disable-gpu','--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {windowsHide:true,stdio:'ignore'});
  const portFile = path.join(profile,'DevToolsActivePort');
  for(let i=0;i<240&&!fs.existsSync(portFile);i++) await pause(250);
  assert(fs.existsSync(portFile),'Edge did not start');
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0].trim();
  const page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let seq=0;const pending=new Map(),errors=[];
  ws.onmessage=(event)=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description||'').join(' ').slice(0,1000));if(m.method==='Network.loadingFailed')errors.push(m.params.errorText);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  const call=(method,params={},timeout=30000)=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error(`${method} timed out`));},timeout);pending.set(id,(m)=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result);});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async(expression)=>{let r;try{r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});}catch(e){throw Error(`${e.message}: ${expression.slice(0,180)}`);}if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  // While Vite optimises dependencies the renderer can be busy, and
  // Runtime.evaluate times out instead of answering. That is a slow page, so
  // keep polling to the deadline rather than failing on the first timeout.
  const wait=async(expression)=>{const until=Date.now()+180000;let last=null;while(Date.now()<until){try{if(await evaluate(`Boolean(${expression})`))return;}catch(e){if(/SyntaxError|not a valid selector/.test(e.message))throw e;last=e;}await pause(150);}throw Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${errors.join('\n')}`);};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:origin+'/tools/fixtures/ask-bar.html'},90000);
  await wait('window.testReady');
  const shot=async(name)=>{const out=process.env.IZUKI_SHOTS;if(!out)return;fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));};
  await evaluate('window.openBar()');
  await wait('document.querySelector("[role=dialog][aria-label=\'Ask Izuki\'] input")');
  await pause(500);
  assert.deepEqual(await evaluate('window.testCalls.interactive'),[true],'the overlay takes the mouse and keys while typing');
  assert(await evaluate('document.activeElement && document.activeElement.tagName==="INPUT"'),'the box has the keyboard');
  assert(await evaluate('document.querySelectorAll("[role=dialog] button").length===3'),'three ideas to try');
  await shot('1-open.png');
  await call('Input.insertText',{text:'search for pizza places near me'});
  await pause(80);
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:String.fromCharCode(13)});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  await wait('window.testCalls.asks.length===1');
  assert.equal(await evaluate('window.testCalls.asks[0].text'),'search for pizza places near me');
  assert.deepEqual(await evaluate('window.testCalls.interactive'),[true,false],'sending gives the mouse back at once (the agent may click)');
  await wait('document.body.innerText.includes("Thinking")');
  await evaluate('window.reply("Here\'s Google for “pizza places near me”.")');
  await wait('document.body.innerText.includes("Here\'s Google")');
  await shot('2-answer.png');
  await evaluate('window.finish()');
  await pause(200);
  assert(await evaluate('!!document.querySelector("[role=dialog]")'),'the answer stays up a while after it finishes');
  // Open again, Esc closes it and gives the mouse back.
  await evaluate('window.openBar()');
  await wait('document.querySelector("[role=dialog] input")');
  await pause(300);
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
  await wait('!document.querySelector("[role=dialog]")');
  assert.equal(await evaluate('window.testCalls.interactive.at(-1)'),false,'Esc gives the mouse back');
  // A chip sends straight away.
  await evaluate('window.openBar()');
  await wait('document.querySelectorAll("[role=dialog] button").length===3');
  await pause(300);
  await evaluate('document.querySelector("[role=dialog] button").click()');
  await wait('window.testCalls.asks.length===2');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Ask bar browser: opens with the keyboard, three ideas, Enter sends through runChat and gives the mouse back, the answer shows under the question and stays, Esc closes, an idea sends at once.');
})().catch((error)=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  try{ws?.close();}catch{}
  await closeTestBrowser(browser, profile);
  if(server)await server.close();
  await pause(500);
  if(profile&&path.resolve(profile).startsWith(path.join(root,'.work')+path.sep))try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
  if(cacheDir)try{fs.rmSync(cacheDir,{recursive:true,force:true});}catch{}
});
