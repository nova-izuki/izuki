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
  for (let i = 0; i < 80 && !fs.existsSync(portFile); i++) await pause(250);
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
  console.log('Browser: private fields, stale targets, one submission, toolbar and video controls pass.');
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
  assert(await evaluate('!!document.getElementById("apps-refresh")'));
  assert.deepEqual(errors, [], 'browser JavaScript errors');
  console.log('Phone: home/new chat, settings, four orb preferences and account controls pass without JavaScript exceptions.');
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
