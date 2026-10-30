// Close only the disposable browser launched by a test. Edge may relaunch
// itself on Windows, so killing the original ChildProcess alone leaks its
// browser, renderer and GPU processes. The private debugging endpoint still
// reaches that exact test profile after a relaunch.
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function closeTestBrowser(browser, profile) {
  let socket;
  try {
    const [port, endpoint] = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').trim().split(/\r?\n/);
    if (/^\d+$/.test(port) && endpoint?.startsWith('/devtools/browser/')) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 3000);
        const finish = () => { clearTimeout(timer); resolve(); };
        socket = new WebSocket(`ws://127.0.0.1:${port}${endpoint}`);
        socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
        socket.onclose = finish;
        socket.onerror = finish;
      });
    }
  } catch { /* Startup may have failed before a debugging port was written. */ }
  finally { try { socket?.close(); } catch {} }

  for (let i = 0; browser && browser.exitCode === null && browser.signalCode === null && i < 15; i++) await pause(100);
  if (browser?.pid && browser.exitCode === null && browser.signalCode === null) {
    if (process.platform === 'win32') {
      await new Promise((resolve) => execFile('taskkill', ['/PID', String(browser.pid), '/T', '/F'], { windowsHide: true, timeout: 3000 }, resolve));
    } else browser.kill();
  }
}

module.exports = { closeTestBrowser };
