// Run after: cargo build --example single_instance_probe (in src-tauri).
// This launches isolated, windowless test processes, never the installed app.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const binary = path.join(root, 'src-tauri/target/debug/examples/single_instance_probe.exe');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function exercise(race) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'izuki-instance-test-'));
  const env = {...process.env, IZUKI_INSTANCE_PROBE_DIR: dir, IZUKI_INSTANCE_PROBE_ID: 'com.izuki.instance-probe.' + randomUUID()};
  const children = [];
  const launch = () => {
    const child = spawn(binary, [], {env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    let output = '';
    child.stdout.on('data', b => { output += b; });
    child.stderr.on('data', b => { output += b; });
    const exit = new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', (code, signal) => resolve({code, signal, output})); });
    children.push(child);
    return exit;
  };
  try {
    const first = launch();
    if (!race) {
      for(let i=0;i<150&&!fs.existsSync(path.join(dir,'owner'));i++) await pause(100);
      assert(fs.existsSync(path.join(dir,'owner')), 'first process initialized');
    }
    const second = launch();
    const results = await Promise.all([first, second]);
    for(const result of results) assert.equal(result.code, 0, JSON.stringify(result));
    assert(fs.existsSync(path.join(dir,'owner')), 'one primary initialized');
    assert(fs.existsSync(path.join(dir,'notified')), 'second launch notified the primary');
    console.log(`${race ? 'Concurrent' : 'Repeated'} launch: one owner, second exits, primary notified.`);
  } finally {
    // Only processes created by this probe are eligible for cleanup.
    for(const child of children) if(child.exitCode === null) child.kill();
  }
}
(async()=>{ assert.equal(process.platform,'win32'); assert(fs.existsSync(binary),'Build the example first'); await exercise(false); await exercise(true); })().catch(e=>{console.error(e);process.exitCode=1;});
