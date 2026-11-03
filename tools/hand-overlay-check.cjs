// Real components in disposable Edge. --desktop shows a real Windows window;
// native Tauri verification is separately documented, never implied by this.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { closeTestBrowser } = require('./browser-cleanup.cjs');
const root = path.resolve(__dirname, '..');
const edge = process.env.IZUKI_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let server, browser, ws, profile, cache;
(async () => {
  fs.mkdirSync(path.join(root, '.work'), {recursive:true});
  cache=fs.mkdtempSync(path.join(root,'.work','hand-vite-'));
  profile=fs.mkdtempSync(path.join(root,'.work','hand-browser-'));
  const { createServer } = await import('vite');
  const native=process.argv.includes('--native');
  server=await createServer({configFile:path.join(root,'vite.config.ts'),cacheDir:cache,
    plugins:native?[{name:'isolated-hand-fixture',configureServer(s){s.middlewares.use((req,_res,next)=>{if(req.url?.split('?')[0]==='/overlay.html')req.url='/tools/fixtures/action-hand.html';next()})}}]:[],
    optimizeDeps:{entries:['action-hand.html',...(!native?['hand-canvas.html']:[])].map(name=>path.join(root,'tools/fixtures',name).split(path.sep).join('/'))},server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false}});
  await server.listen();
  const origin=server.resolvedUrls.local[0];
  const desktop=process.argv.includes('--desktop');
  let port='';
  let nativeOutput='';
  if(native){
    assert.equal(process.platform,'win32');
    assert.ok(process.env.IZUKI_HAND_TEST_HOST,'Set IZUKI_HAND_TEST_HOST to the compiled hand_overlay_probe executable');
    const reservation=require('node:net').createServer();await new Promise(r=>reservation.listen(0,'127.0.0.1',r));port=String(reservation.address().port);await new Promise(r=>reservation.close(r));
    browser=spawn(process.env.IZUKI_HAND_TEST_HOST,[origin],{windowsHide:true,env:{...process.env,WEBVIEW2_USER_DATA_FOLDER:profile,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:'--remote-debugging-port='+port},stdio:['ignore','pipe','pipe']});
    browser.stdout.on('data',d=>nativeOutput+=d);browser.stderr.on('data',d=>nativeOutput+=d);
  } else {
    browser=spawn(edge,[...(desktop?[]:['--headless=new']),'--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size=720,480','about:blank'],{windowsHide:true,stdio:'ignore'});
    for(let i=0;i<240&&!/^\d+$/.test(port);i++){try{port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0].trim()}catch{}if(!/^\d+$/.test(port))await pause(250)}
  }
  assert.match(port,/^\d+$/,'Edge failed to start');
  let page;
  if(native){
    for(let i=0;i<240&&!page;i++){
      try{page=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(p=>p.type==='page'&&p.url.includes('overlay.html'))}catch{}
      if(!page)await pause(250);
    }
    assert.ok(page,'Native WebView2 did not start: '+nativeOutput.slice(-1200));
    assert.ok(nativeOutput.includes('NATIVE: real overlay click-through and no-focus assertions passed'),nativeOutput);
  }else page=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  let sequence=0; const pending=new Map();
  ws.onmessage=e=>{const message=JSON.parse(String(e.data));if(pending.has(message.id)){pending.get(message.id)(message);pending.delete(message.id)}};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'))},30000);pending.set(id,m=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result)});ws.send(JSON.stringify({id,method,params}))});
  const run=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
  const stats=()=>run('handTest.stats()');
  const wait=async(expected)=>{for(let i=0;i<100;i++){if((await stats()).visible===expected)return;await pause(50)}assert.fail('Hand visibility did not become '+expected)};
  if(!native)await call('Page.navigate',{url:origin+'tools/fixtures/action-hand.html'});
  for(let i=0;i<160;i++){if(await run('!!window.testReady'))break;await pause(250)}
  assert.equal(await run('!!window.testReady'),true,'Fixture failed to mount');
  await run('handTest.point()'); await pause(100); assert.equal((await stats()).visible,false,'Disabled must ignore actions');
  await run('handTest.enable(true)'); await pause(100); assert.equal((await stats()).visible,false,'Enabling must not replay an old action');
  await run('handTest.point()'); await wait(true);
  assert.equal(await run("getComputedStyle(document.querySelector('[data-izk-action-hand]')).pointerEvents"),'none');
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:150,y:140,button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:150,y:140,button:'left',clickCount:1});
  assert.equal((await stats()).inputs,1,'Action visual must not intercept a click');
  await run("document.getElementById('typing').focus()"); await call('Input.insertText',{text:'still typing'});
  assert.equal((await stats()).text,'still typing');
  await wait(false);
  const before=(await stats()).frames; await pause(250); assert.equal((await stats()).frames,before,'Idle must stop animation frames');
  for(const stop of ['stop','switched','ended','finished','closed','reopened']){
    await run('handTest.point()');await wait(true);await run(`handTest.${stop}()`);await wait(false);
  }
  if(native){
    await run('handTest.point({duration_ms:3000})');await wait(true);
    assert.equal(await run("import('/node_modules/@tauri-apps/api/core.js').then(m=>m.invoke('probe_switch_window'))"),true,'A real native foreground switch must occur');
    await wait(false);
  }
  await run('handTest.point()');await wait(true);await run('handTest.enable(false)');await wait(false);
  await run('handTest.enable(true)');await pause(100);assert.equal((await stats()).visible,false);
  await run('handTest.point({x:NaN})');await pause(100);assert.equal((await stats()).visible,false);
  await run('handTest.point({duration_ms:999999})');await wait(true);await pause(3700);await wait(false);
  assert.equal((await stats()).cameras,0,'Hand visual must never acquire a camera');
  await run('handTest.point()');await wait(true);await run('handTest.unmount()');await wait(false);
  const idle=(await stats()).frames;await pause(250);assert.equal((await stats()).frames,idle,'Unmount must cancel animations');
  if(!native){
    await call('Page.navigate',{url:origin+'tools/fixtures/hand-canvas.html'});
    for(let i=0;i<240;i++){if(await run('!!window.canvasTest'))break;await pause(250)}
    assert.equal(await run('!!window.canvasTest'),true,'Actual OverlayCanvas fixture must mount');
    await pause(150);
    for(const mode of ['follow','preview']){
      await run(`canvasTest.open('${mode}')`);await pause(150);
      assert.equal(await run('canvasTest.count()'),0,'No idle follower in '+mode);
      await run('canvasTest.point()');await pause(150);
      assert.equal(await run('canvasTest.count()'),0,'Disabled action setting respected in '+mode);
    }
    await run('canvasTest.preference(true)');await pause(150);await run('canvasTest.point()');await pause(150);
    assert.equal(await run('canvasTest.count()'),1,'Actual canvas must wire the optional action visual');
    await run('canvasTest.preference(false)');await pause(150);
    assert.equal(await run('canvasTest.count()'),0,'Actual settings change clears the visual');
    await run('canvasTest.unmount()');
  }
  console.log(`Hand overlay: disabled/idle/expiry/stop/window switch/session/close/reopen/toggle/unmount/input/camera checks passed (${native?'native Windows Tauri/WebView2':desktop?'Windows desktop Edge':'headless Edge'}).`);
  if(native)await run("setTimeout(()=>import('/node_modules/@tauri-apps/api/core.js').then(m=>m.invoke('probe_finish')),50);true");
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{
  try{ws?.close()}catch{}await closeTestBrowser(browser,profile);await server?.close();
  for(const folder of [profile,cache])if(folder){
    // WebView2/Edge exits asynchronously and Defender may briefly hold a cache
    // file after Browser.close. Only remove our fresh directories in .work.
    assert.ok(path.resolve(folder).startsWith(path.join(root,'.work')+path.sep));
    for(let attempt=0;;attempt++){
      try{fs.rmSync(folder,{recursive:true,force:true});break}
      catch(e){if(!['EPERM','EBUSY','ENOTEMPTY'].includes(e.code)||attempt>=20)throw e;await pause(500)}
    }
  }
});
