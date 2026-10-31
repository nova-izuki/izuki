// The in-page answer card, and the click that must reply before navigating.
// Real headless Edge, a blank page, and the functions from smart.js and
// background.js exactly as they ship. Run: node tools/bubble-check.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { closeTestBrowser } = require('./browser-cleanup.cjs');
const root = path.resolve(__dirname, '..');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser, profile, ws;
(async () => {
  const smart = fs.readFileSync(path.join(root, 'extension', 'smart.js'), 'utf8');
  const bubbleSrc = smart.slice(smart.indexOf('function drawBubble'), smart.indexOf('\nchrome.runtime.onMessage'));
  const background = fs.readFileSync(path.join(root, 'extension', 'background.js'), 'utf8');
  const clickSrc = background.slice(background.indexOf('function clickEl'), background.indexOf('\nfunction typeEl'));
  assert(bubbleSrc.includes('__izukiBubbleDodge'), 'the card must expose its dodge hook');
  assert(clickSrc.includes('__izukiBubbleDodge'), 'a click must ask the card to move');
  fs.mkdirSync(path.join(root, '.work'), { recursive: true });
  profile = fs.mkdtempSync(path.join(root, '.work', 'bubble-'));
  browser = spawn(process.env.IZUKI_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'],
    { windowsHide: true, stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let n = 0; n < 240 && !fs.existsSync(portFile); n++) await pause(250);
  assert(fs.existsSync(portFile), 'test browser did not start');
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0; const pending = new Map(), errors = [];
  ws.onmessage = (e) => { const m = JSON.parse(String(e.data)); if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); pending.get(m.id)?.(m); };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const key = ++id, timer = setTimeout(() => { pending.delete(key); reject(Error(method + ' timed out')); }, 15000);
    pending.set(key, (m) => { clearTimeout(timer); pending.delete(key); m.error ? reject(Error(m.error.message)) : resolve(m.result); });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
  const run = async (expression) => {
    const out = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (out.exceptionDetails) throw Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
    return out.result.value;
  };
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 900, height: 700, deviceScaleFactor: 1, mobile: false });
  const card = await run(`(() => {
    ${bubbleSrc}
    drawBubble('Izuki', 'A short answer.', {});
    const host = document.getElementById('izuki-bubble-host');
    const box = host.shadowRoot.querySelector('.b').getBoundingClientRect();
    return { host: getComputedStyle(host).pointerEvents, card: getComputedStyle(host.shadowRoot.querySelector('.b')).pointerEvents, width: box.width, height: box.height };
  })()`);
  assert.equal(card.host, 'none', 'empty space around the card must not swallow page clicks');
  assert.equal(card.card, 'auto', 'the card itself still needs its buttons');
  assert(card.width > 100 && card.height > 20, 'the card must render');
  const dodged = await run(`(() => {
    const card = document.getElementById('izuki-bubble-host').shadowRoot.querySelector('.b');
    const before = card.getBoundingClientRect();
    globalThis.__izukiBubbleDodge({ left: before.left, right: before.right, top: before.top, bottom: before.bottom });
    const after = card.getBoundingClientRect();
    return { moved: after.left !== before.left || after.top !== before.top, overlap: after.left < before.right && after.right > before.left && after.top < before.bottom && after.bottom > before.top };
  })()`);
  assert.deepEqual(dodged, { moved: true, overlap: false }, 'the card must move off the control, not just resize');
  const dragged = await run(`(() => {
    const host = document.getElementById('izuki-bubble-host'), card = host.shadowRoot.querySelector('.b'), header = host.shadowRoot.querySelector('.h');
    const before = card.getBoundingClientRect();
    header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, clientX: before.left + 20, clientY: before.top + 8 }));
    header.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 7, clientX: before.left + 150, clientY: before.top + 120 }));
    header.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, clientX: before.left + 150, clientY: before.top + 120 }));
    const after = card.getBoundingClientRect();
    return { dx: after.left - before.left, dy: after.top - before.top };
  })()`);
  assert(dragged.dx > 60 && dragged.dy > 60, 'the header must drag the card');
  // Two kinds of click. One that stays on the page is clicked *first* and
  // reported after: no gap in which a look could see nothing changed and
  // click again. One that leaves the page (a link) can't reply after it has
  // gone, so it replies first — saying how long until the click — and the
  // app waits that long before looking. Either way, exactly one click.
  const order = await run(`(async () => {
    ${clickSrc}
    const press = (el) => { let n = 0; el.addEventListener('click', (e) => { n += 1; if (el.tagName === 'A') e.preventDefault(); }); return () => n; };
    const button = document.createElement('button');
    button.setAttribute('data-izuki-id', 'bubble-stay');
    button.textContent = 'Show answer';
    document.body.appendChild(button);
    const buttonPresses = press(button);
    const stayReport = await clickEl('bubble-stay');
    const stayAtReport = buttonPresses();
    const link = document.createElement('a');
    link.href = '/next-question';
    link.setAttribute('data-izuki-id', 'bubble-next');
    link.textContent = 'Next';
    document.body.appendChild(link);
    const linkPresses = press(link);
    const leaveReport = await clickEl('bubble-next');
    const leaveAtReport = linkPresses();
    await new Promise((resolve) => setTimeout(resolve, 200));
    const result = { stayReport, stayAtReport, stayLater: buttonPresses(), leaveReport, leaveAtReport, leaveLater: linkPresses() };
    button.remove(); link.remove();
    return result;
  })()`);
  assert.deepEqual(order, {
    stayReport: true, stayAtReport: 1, stayLater: 1,
    leaveReport: { deferred: 90 }, leaveAtReport: 0, leaveLater: 1,
  }, 'a click that stays is made before it is reported; one that leaves says how long, and still happens exactly once');
  assert.deepEqual(errors, []);
  console.log('bubble: ok — click-through host, self-dodge, drag; a click that stays is made before its reply, one that leaves replies with its wait, each exactly once');
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  try { ws?.close(); } catch {}
  await closeTestBrowser(browser, profile);
  if (profile && path.resolve(profile).startsWith(path.join(root, '.work') + path.sep)) try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch {}
});
