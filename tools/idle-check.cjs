// What keeps running while Izuki sits idle? The overlay covers the whole
// screen, so anything that redraws there costs a core and the graphics chip
// (AGENTS.md: the idle budget is 14% of one core in all). This loads the
// built pages (npm run build) in a headless Edge, with the app's stand-in
// settings (no real account, mic or desktop), waits for them to settle, then
// watches them idle and reports:
//   - endless animations still running (CSS or Web Animations), by element;
//   - animation frames requested per second (a loop that never sleeps);
//   - timers firing, and script/layout/paint time per second.
// node tools/idle-check.cjs        report, and fail on an endless loop
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn, execFileSync } = require('child_process');
const { closeTestBrowser } = require('./browser-cleanup.cjs');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const edge = process.env.IZUKI_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const SETTLE_MS = 8000, WATCH_MS = 10000;

// Counts animation frames and timer callbacks from the very first script.
const PROBE = `(() => {
  const s = window.__idle = { frames: 0, timers: 0, since: performance.now() };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => { s.frames++; cb(t); });
  const si = window.setInterval.bind(window), st = window.setTimeout.bind(window);
  window.setInterval = (cb, ms, ...a) => si(typeof cb === 'function' ? (...x) => { s.timers++; cb(...x); } : cb, ms, ...a);
  window.setTimeout = (cb, ms, ...a) => st(typeof cb === 'function' ? (...x) => { s.timers++; cb(...x); } : cb, ms, ...a);
})();`;

const RUNNING = `document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().endTime === Infinity).map((a) => {
  const el = a.effect.target; const name = a.animationName || (a.id || 'web animation');
  const where = el ? (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : '')) : '?';
  const box = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  const visible = !!box && box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  return name + ' on ' + where + (visible ? '' : ' (not visible)');
})`;

(async () => {
  if (!fs.existsSync(path.join(dist, 'overlay.html'))) throw new Error('Build first: npm run build');
  const server = http.createServer((req, res) => {
    let file = path.resolve(dist, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(dist)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    try {
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.wasm': 'application/wasm' })[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'izuki-idle-check-'));
  const browser = spawn(edge, ['--headless=new', '--disable-background-networking', '--no-first-run', '--no-default-browser-check', '--use-fake-ui-for-media-stream', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--window-size=1280,720', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const report = [];
  let failed = false;
  try {
    // Edge may still be writing the file when it appears (EBUSY): retry.
    const portFile = path.join(profile, 'DevToolsActivePort');
    let port = '';
    for (let i = 0; i < 240 && !/^\d+$/.test(port); i++) {
      try { port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim(); } catch { await pause(250); }
    }
    if (!/^\d+$/.test(port)) throw new Error('the browser did not start within 60 s');
    for (const pageName of ['overlay.html', 'index.html']) {
      const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((r, no) => { ws.onopen = r; ws.onerror = no; });
      let seq = 0; const pending = new Map();
      ws.onmessage = (e) => { const m = JSON.parse(String(e.data)); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
      const call = (method, params = {}) => new Promise((resolve, reject) => {
        const id = ++seq; pending.set(id, (m) => (m.error ? reject(Error(method + ': ' + m.error.message)) : resolve(m.result)));
        ws.send(JSON.stringify({ id, method, params }));
      });
      const run = async (expression) => (await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
      await call('Page.enable'); await call('Performance.enable');
      await call('Page.addScriptToEvaluateOnNewDocument', { source: PROBE });
      await call('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/${pageName}` });
      await pause(SETTLE_MS);
      const metric = async () => Object.fromEntries((await call('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
      const a = await metric(); const c0 = await run('({...window.__idle, now: performance.now()})');
      await pause(WATCH_MS);
      const b = await metric(); const c1 = await run('({...window.__idle, now: performance.now()})');
      const secs = (c1.now - c0.now) / 1000;
      const per = (k) => (b[k] - a[k]) / secs;
      const running = await run(RUNNING);
      // A page that failed to load would look perfectly idle: prove it rendered.
      const elements = await run("document.querySelectorAll('#root *, body > *').length");
      // (The overlay draws only from the app's live events — hand, island,
      // captions — so outside the desktop app it's empty: reported, not passed.)
      if (elements < 15) { report.push(`${pageName}: only ${elements} element(s) rendered outside the desktop app, so its idle cost can't be measured here`); continue; }
      const frames = (c1.frames - c0.frames) / secs, timers = (c1.timers - c0.timers) / secs;
      report.push(`${pageName} (${elements} elements): script ${(per('ScriptDuration') * 1000).toFixed(1)} ms/s, style+layout ${((per('RecalcStyleDuration') + per('LayoutDuration')) * 1000).toFixed(1)} ms/s, all tasks ${(per('TaskDuration') * 1000).toFixed(1)} ms/s, ${frames.toFixed(1)} animation frames/s, ${timers.toFixed(1)} timer calls/s`);
      report.push(running.length ? '  endless animations running:\n    ' + running.join('\n    ') : '  no endless animation running');
      // An idle page must truly rest: a frame loop that never sleeps redraws
      // all the time (on the overlay, the whole screen).
      if (frames > 2 || running.some((r) => !r.endsWith('(not visible)'))) failed = true;
      ws.close();
    }
  } finally {
    await closeTestBrowser(browser, profile);
    // Last resort: any Edge still running from this test's own profile (a
    // relaunched browser outlives its launcher) is closed, never left behind.
    if (process.platform === 'win32') {
      try {
        execFileSync('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${path.basename(profile)}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { windowsHide: true, timeout: 15000 });
      } catch {}
    }
    browser.unref();
    server.close();
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch {}
  }
  console.log(report.join('\n'));
  if (failed) { console.error('An idle page keeps animating (see above).'); process.exitCode = 1; }
})().catch((e) => { console.error(e); process.exitCode = 1; });
