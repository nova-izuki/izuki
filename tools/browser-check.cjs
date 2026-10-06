// Real-browser regression checks using the already installed Edge. No downloads.
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn, execFileSync } = require('child_process');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const edge = process.env.IZUKI_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let browser, server, ws, profile;
const fixture = '<!doctype html><body><button id="target">Continue</button><form id="form"><input id="name" aria-label="Name"><input type="password" value="private-test-value"><button>Submit</button></form><video style="width:320px;height:180px"></video><script>window.submits=0;form.onsubmit=e=>{e.preventDefault();window.submits++}</script><script src="/src-tauri/src/browser-page.js"></script>';

(async () => {
  assert(fs.existsSync(edge), 'Set IZUKI_TEST_BROWSER to an installed Chromium browser.');
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/fixture') { res.setHeader('Content-Type', 'text/html'); res.end(fixture); return; }
    let file = path.resolve(root, '.' + pathname);
    if (pathname.startsWith('/assets/')) file = path.resolve(root, 'dist', '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'izuki-browser-check-'));
  browser = spawn(edge, ['--headless=new', '--disable-gpu', '--disable-background-networking', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  // A busy CI machine can take a while to start a browser: up to a minute.
  for (let i = 0; i < 240 && !fs.existsSync(portFile); i++) await pause(250);
  if (!fs.existsSync(portFile)) throw new Error('the browser did not start within 60 s (' + edge + ')');
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, reject) => { ws.onopen = r; ws.onerror = reject; });
  let seq = 0; const pending = new Map(), errors = [];
  ws.onmessage = (e) => {
    const message = JSON.parse(String(e.data));
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
  };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq, timeout = setTimeout(() => { pending.delete(id); reject(Error(method + ' timed out')); }, 20_000);
    pending.set(id, (m) => { clearTimeout(timeout); m.error ? reject(Error(m.error.message)) : resolve(m.result); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const navigate = async (route, ready) => {
    const nav = await call('Page.navigate', { url: `http://127.0.0.1:${server.address().port}${route}` });
    if (nav.errorText) throw Error(nav.errorText);
    for (let i = 0; i < 50; i++) { if (await evaluate(ready)) return; await pause(200); }
    throw Error('Page did not become ready: ' + route + ' ' + JSON.stringify({ errors, page: await evaluate('({url:location.href,title:document.title,text:document.body?.innerText?.slice(0,500)})') }));
  };
  await call('Runtime.enable'); await call('Page.enable');
  await navigate('/fixture', '!!window.__izukiPage');
  const snap = JSON.parse(await evaluate('window.__izukiPage.snapshot()'));
  assert(!JSON.stringify(snap).includes('private-test-value'), 'password leaked into snapshot');
  assert(snap.password);
  assert(await evaluate('!!document.getElementById("__izuki_nav")'), 'toolbar missing');
  const field = Number(snap.items.find((x) => x.includes('[field] Name')).split('.')[0]);
  assert.equal(await evaluate(`window.__izukiPage.type(${field}, 'Solomon', true)`), 'ok');
  assert.equal(await evaluate('window.submits'), 1, 'form submitted more than once');
  await evaluate('window.__izukiPage.snapshot(); document.getElementById("target").textContent="Delete"');
  assert.match(await evaluate('window.__izukiPage.click(1)'), /page changed/i);
  assert.equal(JSON.parse(await evaluate('window.__izukiPage.video("slow")')).rate, 0.75);
  assert.equal(JSON.parse(await evaluate('window.__izukiPage.video("pause")')).paused, true);
  const oldVideo = JSON.parse(await evaluate('window.__izukiPage.video("read")'));
  assert(oldVideo.bounds.w > 0 && oldVideo.bounds.h > 0, 'video bounds missing');
  await evaluate('document.querySelector("video").replaceWith(document.querySelector("video").cloneNode())');
  assert.match(JSON.parse(await evaluate(`window.__izukiPage.video('play', ${JSON.stringify(oldVideo.videoId)})`)).error, /video changed/i);
  await evaluate('document.querySelector("video").volume=.8; window.__izukiPage.duckMedia(true); window.__izukiPage.duckMedia(true)');
  assert(Math.abs(await evaluate('document.querySelector("video").volume') - .16) < .0001, 'duck heartbeat compounded volume');
  await evaluate('window.__izukiPage.duckMedia(false)');
  assert.equal(await evaluate('document.querySelector("video").volume'), .8, 'original volume not restored');
  await evaluate('window.__izukiPage.duckMedia(true); document.querySelector("video").volume=.4; window.__izukiPage.duckMedia(false)');
  assert.equal(await evaluate('document.querySelector("video").volume'), .4, 'user volume adjustment was overwritten');
  console.log('Browser: private fields, stale targets, one submission, toolbar and video controls pass.');
  await evaluate(`(async () => {
    const { drawWaterOrb } = await import('/docs/app/water-orb.js');
    document.body.innerHTML = '<main style="display:flex;gap:24px;padding:30px;background:#333"><canvas width="320" height="320" style="background:#0c141d"></canvas><canvas width="320" height="320" style="background:#e9eef1"></canvas></main>';
    for (const c of document.querySelectorAll('canvas')) drawWaterOrb(c.getContext('2d'), 320, 1.8, .35, .15, true);
  })()`);
  assert(await evaluate('document.querySelector("canvas").getContext("2d").getImageData(160,160,1,1).data[3] < 60'), 'water centre is too opaque');
  const preview = await call('Page.captureScreenshot', { format: 'png' });
  const previewPath = path.join(os.tmpdir(), 'izuki-water-preview.png');
  fs.writeFileSync(previewPath, Buffer.from(preview.data, 'base64'));
  console.log('Water preview: ' + previewPath);
  await call('Emulation.setDeviceMetricsOverride', {width:1000,height:700,deviceScaleFactor:1,mobile:false});
  const materials = await evaluate(`(async()=>{
    const water=await import('/docs/app/water-orb.js'), looks=await import('/docs/app/orb-materials.js'), motion=await import('/docs/app/orb-motion.js');
    document.body.innerHTML='<main style="display:flex;flex-wrap:wrap;background:#0c141d;padding:20px;color:white">'+['Fluid / voice','Star crystal','Tidal pearl'].map(t=>'<section><h3>'+t+'</h3><canvas width="280" height="280"></canvas></section>').join('')+'</main>';
    const canvases=[...document.querySelectorAll('canvas')],s=motion.createOrbMotion();
    for(let i=0;i<90;i++)motion.stepOrbMotion(s,1/60,.85,'speaking');
    water.drawWaterOrb(canvases[0].getContext('2d'),280,1,.8,0,false,s);
    looks.drawConstellationOrb(canvases[1].getContext('2d'),280,1,.8);
    looks.drawRippleOrb(canvases[2].getContext('2d'),280,1,.8);
    return canvases.map(c=>{const d=c.getContext('2d').getImageData(0,0,280,280).data;return d.filter((v,i)=>i%4===3&&v>20).length});
  })()`);
  assert(materials.every(n=>n>1500),'premium materials failed to render');
  fs.writeFileSync(path.join(os.tmpdir(),'izuki-orb-materials.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await navigate('/docs/app/', '!!window.izukiApps && !!document.getElementById("open-settings")');
  assert(await evaluate('!!document.getElementById("go-home") && !!document.getElementById("new-chat")'), 'phone home/new-chat controls missing');
  await evaluate('localStorage.setItem("izuki.history", JSON.stringify([{role:"user",text:"Keep this conversation"},{role:"model",text:"I will."}]))');
  await navigate('/docs/app/', '!!document.body && document.body.innerText.includes("Keep this conversation")');
  await evaluate('document.getElementById("go-home").click()');
  assert(await evaluate('document.body.innerText.includes("Resume your last chat")'), 'home did not preserve the active chat');
  await evaluate('document.getElementById("new-chat").click()');
  assert(!await evaluate('document.body.innerText.includes("Resume your last chat")'), 'new chat did not clear the active chat');
  await evaluate('document.getElementById("open-settings").click()');
  for (const style of ['liquid', 'ferrofluid', 'ripple', 'constellation']) {
    await evaluate(`document.getElementById('orb-style').value='${style}';document.getElementById('orb-style').dispatchEvent(new Event('change'))`);
    assert.equal(await evaluate('localStorage.getItem("izuki.orbStyle")'), style);
  }
  // A 3D face: the picker shows the faces and the customise panel.
  await evaluate(`document.getElementById('orb-style').value='model:holo-female';document.getElementById('orb-style').dispatchEvent(new Event('change'))`);
  assert.equal(await evaluate('localStorage.getItem("izuki.orbStyle")'), 'model:holo-female');
  for (let i = 0; i < 120 && !(await evaluate('document.querySelectorAll("#face-grid .face-tile").length >= 5')); i++) await pause(250);
  assert(await evaluate('document.querySelectorAll("#face-grid .face-tile").length >= 5'), '3D face grid did not appear');
  assert(await evaluate('!document.getElementById("face-tune").hidden'), 'face customise panel did not appear');
  await evaluate(`document.getElementById('orb-style').value='liquid';document.getElementById('orb-style').dispatchEvent(new Event('change'))`);
  assert(await evaluate('!!document.getElementById("apps-refresh")'));
  await evaluate('document.getElementById("orb-preview").scrollIntoView({block:"center"})');
  await pause(250);
  assert(await evaluate('document.getElementById("orb-preview").getContext("2d").getImageData(0,0,100,100).data.some((v,i)=>i%4===3&&v>0)'), 'visible Orb Studio should render');
  await evaluate('document.getElementById("orb-response").value="0.7";document.getElementById("orb-response").dispatchEvent(new Event("input"))');
  assert.equal(await evaluate('localStorage.getItem("izuki.orbResponse")'),'0.7');
  await evaluate('document.getElementById("orb-surface").click()');
  assert(await evaluate('document.getElementById("orb-studio").classList.contains("light")'));
  await call('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:false});
  await evaluate('document.getElementById("orb-studio").scrollIntoView({block:"center"})');
  await pause(250);
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Orb Studio must fit a phone');
  fs.writeFileSync(path.join(os.tmpdir(),'izuki-orb-studio-phone.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  assert.deepEqual(errors, [], 'browser JavaScript errors');
  console.log('Phone: home/new chat, settings, four orb preferences and account controls pass without JavaScript exceptions.');
  const nativeMock = await call('Page.addScriptToEvaluateOnNewDocument', { source: `window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>"ios",Plugins:{IzukiDevice:{takeLaunchPrompt:async()=>({prompt:"A draft from Siri"}),haptic:async()=>({done:true})}}};` });
  await navigate('/docs/app/', 'document.getElementById("text")?.value === "A draft from Siri"');
  await evaluate('document.getElementById("open-settings").click()');
  assert(await evaluate('document.getElementById("native-controls").hidden && !document.getElementById("native-device").hidden && document.getElementById("web-install").hidden'), 'iPhone must not show Android controls or PWA installation');
  assert.equal(await evaluate('document.getElementById("siri-url").textContent'), 'izuki://ask?q=');
  await evaluate('document.getElementById("test-haptic").click()');
  await pause(100);
  assert(await evaluate('document.getElementById("native-feedback").textContent.startsWith("Tap sent")'));
  await evaluate('document.getElementById("close-settings").click()');
  for (const width of [320, 390, 768]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await pause(150);
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'phone layout overflow at ' + width);
    assert(await evaluate('[...document.querySelectorAll("header button")].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})'), 'phone toolbar overflow at ' + width);
  }
  fs.writeFileSync(path.join(os.tmpdir(), 'izuki-phone-glass-preview.png'), Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  await call('Page.removeScriptToEvaluateOnNewDocument', { identifier: nativeMock.identifier });
  await navigate('/dist/index.html', '!!document.querySelector(".izk-finder-trigger")');
  assert(await evaluate('(() => { const bar=document.getElementById("draw-command");return !!bar && bar.parentElement.firstElementChild===bar && bar.getBoundingClientRect().top<innerHeight; })()'), 'typing must be first in the Draw panel, not buried under voice settings');
  await evaluate('document.querySelector(".izk-finder-trigger").click()');
  await evaluate(`const input=document.querySelector('.izk-finder input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'screen');input.dispatchEvent(new Event('input',{bubbles:true}));`);
  await pause(150);
  assert(await evaluate('document.querySelector(".izk-finder-results").textContent.includes("Screen control")'));
  await evaluate('[...document.querySelectorAll(".izk-finder-results button")].find(b=>b.textContent.startsWith("Screen control")).click()');
  // The settings tab loads lazily: wait for it (a busy PC can take a few seconds).
  let focused = '';
  for (let i = 0; i < 60 && focused !== 'settings-execution'; i++) { await pause(100); focused = await evaluate('document.activeElement.id'); }
  assert.equal(focused, 'settings-execution', 'feature finder must navigate and focus the section');
  await evaluate('window.dispatchEvent(new KeyboardEvent("keydown",{key:"k",ctrlKey:true,bubbles:true}))');
  assert(await evaluate('document.querySelector(".izk-finder").open'), 'Ctrl+K should open the finder');
  fs.writeFileSync(path.join(os.tmpdir(), 'izuki-desktop-glass-preview.png'), Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  console.log('Native iPhone settings, Siri draft, small-phone glass layout and desktop feature finder pass.');
  await navigate('/docs/', 'document.readyState === "complete" && !!document.getElementById("features")');
  assert(await evaluate('document.getElementById("features").textContent.includes("Two ways to take control")'));
  assert(await evaluate('[...document.querySelectorAll("a.dl")].every(a => a.href.endsWith("/releases/latest/download/Izuki-Setup.exe"))'));
  for (const width of [390, 1280]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await pause(300);
    const layout = await evaluate('({ scrollWidth: document.documentElement.scrollWidth, innerWidth, offenders: [...document.querySelectorAll("body *")].map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, id: el.id, className: String(el.className), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), overflow: getComputedStyle(el).overflowX }; }).filter(x => x.right > innerWidth + 1 || x.left < -1).slice(0, 12) })');
    assert(layout.scrollWidth <= layout.innerWidth + 1, 'landing page horizontal overflow at ' + width + ': ' + JSON.stringify(layout));
  }
  assert.deepEqual(errors, [], 'landing page JavaScript errors');
  console.log('Website: updated feature cards, download links and mobile/desktop widths pass.');
})().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => {
  ws?.close();
  if (browser?.pid && process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(browser.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); } catch {} }
  else browser?.kill();
  server?.closeAllConnections(); server?.close();
  // Only our freshly generated, empty-credential test profile is eligible.
  if (profile && path.resolve(profile).startsWith(path.join(os.tmpdir(), 'izuki-browser-check-'))) {
    await pause(500);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch { console.log('Test profile retained at ' + profile); }
  }
});
