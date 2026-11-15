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
    cacheDir = fs.mkdtempSync(path.join(root,'.work','vite-island-'));
    server = await createServer({ configFile:path.join(root,'vite.config.ts'), cacheDir, optimizeDeps:{force:true,entries:['notch.html'].map(name=>path.join(root,'tools/fixtures',name).split(path.sep).join('/'))}, server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false} });
    await server.listen(); origin=server.resolvedUrls.local[0].replace(/\/$/,'');
  }
  profile = fs.mkdtempSync(path.join(root, '.work', 'island-browser-'));
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
  const wait=async(expression,timeout=180000)=>{const until=Date.now()+timeout;let last=null;while(Date.now()<until){try{if(await evaluate(`Boolean(${expression})`))return;}catch(e){if(/SyntaxError|not a valid selector/.test(e.message))throw e;last=e;}await pause(150);}throw Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${errors.join('\n')}`);};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});

  await call('Page.bringToFront');
  await call('Page.navigate',{url:origin+'/tools/fixtures/notch.html'},90000);
  await wait('window.notchReady && document.querySelector(".izk-notch-mini")');
  // A button's default activation needs the matching text payload too; a bare
  // keyDown/keyUp never produces the click Chromium gives a real key press.
  const key=async(key,code,n)=>{const text=n===13?'\r':n===32?' ':undefined;await call('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n,...(text?{text,unmodifiedText:text}:{})});await call('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n});};
  const click=async(selector,button='left')=>{const r=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await call('Input.dispatchMouseEvent',{type:'mousePressed',...r,button,clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button,clickCount:1});};
  for(const activation of ['Enter','Space','click']){
    await evaluate(`document.querySelector('.izk-notch-mini').focus()`);
    assert.equal(await evaluate('document.activeElement.tagName'),'BUTTON');
    assert.match(await evaluate('document.activeElement.getAttribute("aria-label")'),/Open Izuki Island/);
    if(activation==='click')await click('.izk-notch-mini');else await key(activation==='Space'?' ':activation,activation==='Space'?'Space':'Enter',activation==='Space'?32:13);
    await wait('document.querySelector(".izk-island-open")',10000);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.izk-island'),'::before').content`),'none','rectangular glow escaped notch');
    const shoulder=await evaluate(`(()=>{const r=document.querySelector('.izk-island').getBoundingClientRect();return document.elementFromPoint(r.left+1,r.top+1)?.closest('.izk-island')===null})()`);
    assert.equal(shoulder,true,'transparent shoulder blocked desktop');
    await evaluate(`document.querySelector('.izk-island [role=tab]').focus()`);await key('Escape','Escape',27);
    await wait('document.querySelector(".izk-notch-mini") && !document.querySelector(".izk-island-open")');
  }
  // Existing fixes stay effective, including actual pointer dispatch to the menu.
  await click('.izk-notch-mini');await wait('document.querySelector(".izk-island-open")');
  await click('.izk-island-subtitle','right');await wait('document.querySelector("[role=menu]")');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('[role=menu]')).pointerEvents`),'auto');
  await click('[role=menu] button:nth-child(1)');
  await wait('!document.querySelector("[role=menu]")');
  await wait('document.querySelector(".izk-notch-mini")');
  await evaluate('mountNotch({shadow:false})');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.izk-notch-shell')).filter`),'none');
  await evaluate('mountNotch({shadow:true})');
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.izk-notch-shell')).filter`),'none');
  // Hover remains available after adding keyboard/click activation.
  await evaluate(`(()=>{const r=document.querySelector('.izk-notch-mini').getBoundingClientRect();window.izukiPoint(r.left+r.width/2,r.top+20)})()`);
  await wait('document.querySelector(".izk-island-open")');
  const sharp=require('sharp');
  const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const results=[];
  for(const look of ['notch','float'])for(const desktop of ['#ffffff','#808080'])for(const opacity of [50,94,100]){
    await evaluate(`document.body.style.background=${JSON.stringify(desktop)};mountNotch({look:${JSON.stringify(look)},lightGlass:true,blur:0,opacity:${opacity}})`);
    await pause(200);
    const targets=await evaluate(`(()=>{const nodes=[document.querySelector('.izk-island-subtitle'),...document.querySelectorAll('[role=tab][aria-selected=false]')];return nodes.map(n=>{const r=n.getBoundingClientRect(),color=getComputedStyle(n).color;n.dataset.contrastHide='';return {x:r.x,y:r.y,w:r.width,h:r.height,color}})})()`);
    await evaluate(`(()=>{const s=document.createElement('style');s.id='hide-copy';s.textContent='[data-contrast-hide] {color:transparent!important;text-shadow:none!important}';document.head.append(s)})()`);
    const screenshot=Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64');
    for(const r of targets){
      const rgba=r.color.match(/[\d.]+/g).map(Number),alpha=rgba[3]??1;
      const {data,info}=await sharp(screenshot).extract({left:Math.ceil(r.x)+2,top:Math.ceil(r.y)+2,width:Math.floor(r.w)-4,height:Math.floor(r.h)-4}).removeAlpha().raw().toBuffer({resolveWithObject:true});
      let worst=Infinity;
      for(let p=0;p<data.length;p+=info.channels){const bg=[data[p],data[p+1],data[p+2]],fg=bg.map((b,i)=>rgba[i]*alpha+b*(1-alpha));worst=Math.min(worst,(lum(fg)+.05)/(lum(bg)+.05));}
      assert(worst>=4.5,`${look}/${desktop}/${opacity} copy contrast ${worst.toFixed(2)} is below 4.5`);
      results.push({look,desktop,opacity,contrast:Number(worst.toFixed(2))});
    }
    await evaluate(`document.querySelector('#hide-copy').remove();document.querySelectorAll('[data-contrast-hide]').forEach(n=>delete n.dataset.contrastHide)`);
  }
  fs.writeFileSync(path.join(root,'.work','notch-contrast.json'),JSON.stringify(results,null,2));
  fs.writeFileSync(path.join(root,'.work','notch-review.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  assert.equal(errors.length,0,errors.join('\n'));
  console.log(`Notch browser checks passed: Enter/Space/click, hover, transparent shoulders, no rectangular glow, actual menu click, Shadow toggle, ${results.length} rendered contrast checks (minimum ${Math.min(...results.map(r=>r.contrast))}:1).`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  try{ws?.close()}catch{}
  await closeTestBrowser(browser, profile);
  if(server)await server.close();
  if(profile)fs.rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:250});
  if(cacheDir)fs.rmSync(cacheDir,{recursive:true,force:true,maxRetries:12,retryDelay:250});
});
