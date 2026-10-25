// Browser integration test against actual React components. Uses its own dev
// server/cache, or IZUKI_TEST_ORIGIN for an already-running local server.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
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
    cacheDir = fs.mkdtempSync(path.join(root,'.work','vite-island-'));
    server = await createServer({ configFile:path.join(root,'vite.config.ts'), cacheDir, optimizeDeps:{force:true,entries:[path.join(root,'tools/fixtures/island-chat.html').split(path.sep).join('/')]}, server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false} });
    await server.listen(); origin=server.resolvedUrls.local[0].replace(/\/$/,'');
  }
  profile = fs.mkdtempSync(path.join(root, '.work', 'island-browser-'));
  browser = spawn(edge, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {windowsHide:true,stdio:'ignore'});
  const portFile = path.join(profile,'DevToolsActivePort');
  for(let i=0;i<240&&!fs.existsSync(portFile);i++) await pause(250);
  assert(fs.existsSync(portFile),'Edge did not start');
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0].trim();
  const page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let seq=0;const pending=new Map(),errors=[];
  ws.onmessage=(event)=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description||'').join(' ').slice(0,1000));if(m.method==='Network.loadingFailed')errors.push(m.params.errorText);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error(`${method} timed out`));},30000);pending.set(id,(m)=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result);});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async(expression)=>{let r;try{r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});}catch(e){throw Error(`${e.message}: ${expression.slice(0,180)}`);}if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  // While Vite optimises dependencies the renderer can be busy, and
  // Runtime.evaluate times out instead of answering. That is a slow page, so
  // keep polling to the deadline rather than failing on the first timeout.
  const wait=async(expression)=>{const until=Date.now()+180000;let last=null;while(Date.now()<until){try{if(await evaluate(`Boolean(${expression})`))return;}catch(e){last=e;}await pause(150);}throw Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${errors.join('\n')}`);};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:origin+'/tools/fixtures/island-chat.html'},90000);
  await wait('window.testReady && document.querySelector("#izuki-island-chat-dock input:not([type=file])")');
  console.log('Island fixture ready.');
  const send=async(text)=>{
    await evaluate(`(()=>{const input=document.querySelector('#izuki-island-chat-dock input:not([type=file])')||document.querySelector('section[aria-label="Island chat window"] input:not([type=file])');input.focus();})()`);
    await call('Input.insertText',{text});
    await pause(80);
    // Chrome only fires the input's implicit form submission when the key
    // event carries the printable text and native code, so send both.
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:String.fromCharCode(13)});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  };
  await send('First test question');
  await wait('window.testCalls.asks.length===1');
  console.log('First question started.');
  await evaluate(`window.originalInput=document.querySelector('#izuki-island-chat-dock input:not([type=file])');[...document.querySelectorAll('button')].find(b=>b.textContent==='Pop out').click()`);
  await wait(`document.querySelector('section[aria-label="Island chat window"] input:not([type=file])')`);
  assert(await evaluate(`window.originalInput===document.querySelector('section[aria-label="Island chat window"] input:not([type=file])')`),'detaching remounted chat');
  console.log('Detached the live conversation.');
  assert.equal(await evaluate(`localStorage.getItem('izuki.island-chats.v1')`),null,'incomplete answers should not create history');
  await evaluate('window.finishAsk()');
  await wait(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')||'[]').length===1`);
  const id=await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1'))[0].id`);
  await evaluate(`document.querySelector('[aria-label="Dock in Island"]').click()`);
  await wait(`window.originalInput===document.querySelector('#izuki-island-chat-dock input:not([type=file])')`);
  await send('Follow-up test question');
  await wait('window.testCalls.asks.length===2');
  await evaluate('window.finishAsk()');
  await wait(`JSON.parse(localStorage.getItem('izuki.island-chats.v1'))[0].turns.length===4`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length`),1,'follow-up spammed history');
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1'))[0].id`),id);
  assert.equal(await evaluate('window.testCalls.config'),0,'Island chat opened main app');
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue in Chat')).click()`);
  await wait(`document.querySelector('section[aria-label="Island chat window"]')`);
  await evaluate(`document.querySelector('[aria-label="Minimize Island chat"]').click()`);
  await wait(`document.querySelector('[aria-label="Open Island chat bubble"]')`);
  const box=await evaluate(`(()=>{const r=document.querySelector('[aria-label="Open Island chat bubble"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:box.x,y:box.y,button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x,y:box.y,button:'left',clickCount:1});
  await wait(`document.querySelector('section[aria-label="Island chat window"]')`);
  await evaluate(`document.querySelector('[aria-label="Close and return to Island"]').click()`);
  await wait(`document.querySelector('#izuki-island-chat-dock input:not([type=file])') && !document.querySelector('section[aria-label="Island chat window"]')`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length`),1);
  await call('Page.reload');
  await wait(`document.body.innerText.includes('Follow-up test question')`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length`),1,'reopening duplicated history');
  await wait(`document.querySelector('[aria-label="Conversation transcript"]')`);
  const scrolling=await evaluate(`(()=>{const node=document.querySelector('[aria-label="Conversation transcript"]');node.scrollTop=100;return {top:node.scrollTop,scroll:node.scrollHeight,height:node.clientHeight,hit:!!node.closest('[data-izk-hit]')}})()`);
  assert(scrolling.top>0&&scrolling.scroll>scrolling.height&&scrolling.hit,'transcript cannot scroll');
  await evaluate(`document.querySelector('[aria-label="All saved chats"]').click()`);
  await evaluate(`document.querySelector('[aria-label="Pin"]').click()`);
  await wait(`document.querySelector('[aria-label="Unpin"]')`);
  await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Clear all history');b.click();})()`);
  await pause(80);
  await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Tap again'));b.click();})()`);
  await wait(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length===0`);
  assert.equal(await evaluate(`localStorage.getItem('izuki.island-active-chat.v1')`),null);
  assert.equal(errors.length,0,errors.join('\n'));
  fs.writeFileSync(path.join(root,'.work','island-chat-check.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('Browser checks passed: in-flight detachment without remount, docking, follow-ups, one history entry, bubble reopen, active-thread restore, transcript scrolling, clear history, no main-app navigation.');
})().catch((error)=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  try{ws?.close();browser?.kill();}catch{}
  if(server)await server.close();
  await pause(500);
  if(profile&&path.resolve(profile).startsWith(path.join(root,'.work')+path.sep))try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
  if(cacheDir)try{fs.rmSync(cacheDir,{recursive:true,force:true});}catch{}
});
