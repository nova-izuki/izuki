// Read-only compatibility check: never launches a model turn or reads credentials.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const FLAGS = ['--json', '--ephemeral', '--sandbox', '--cd', '--color'];
export function probe(binary = 'codex', run = execFileSync) {
  const report = { cliAvailable: false, version: null, flagsSupported: false, authenticated: false,
    readyForManualTrial: false, automaticDispatch: false, runtimeTaskTested: false, problems: [] };
  const invoke = (args) => run(binary, args, { encoding: 'utf8', timeout: 15000,
    maxBuffer: 512 * 1024, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const version = /^codex-cli\s+([0-9A-Za-z.+-]+)\s*$/m.exec(invoke(['--version']))?.[1];
    if (!version) { report.problems.push('unrecognized-cli'); return report; }
    report.cliAvailable = true;
    report.version = version;
  } catch { report.problems.push('cli-unavailable'); return report; }
  try {
    const help = invoke(['exec', '--help']);
    report.flagsSupported = FLAGS.every((flag) => new RegExp(`${flag}\\b`).test(help));
    if (!report.flagsSupported) report.problems.push('unsupported-exec-interface');
  } catch { report.problems.push('exec-help-unavailable'); }
  try { invoke(['login', 'status']); report.authenticated = true; }
  catch { report.problems.push('authentication-unavailable'); }
  report.readyForManualTrial = report.flagsSupported && report.authenticated;
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = probe(process.env.CODEX_BINARY || 'codex');
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.readyForManualTrial ? 0 : 1;
}
