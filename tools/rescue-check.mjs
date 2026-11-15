import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
mkdirSync(path.join(root,'.work'),{recursive:true});
const temp=mkdtempSync(path.join(root,'.work','rescue-check-'));
function run(command,args){const result=spawnSync(command,args,{cwd:root,windowsHide:true,encoding:'utf8',timeout:90000});if(result.stdout)process.stdout.write(result.stdout);if(result.stderr)process.stderr.write(result.stderr);if(result.error||result.status!==0)throw result.error||Error(`${command} exited ${result.status}`);}
try {
  const tests=path.join(temp,'rescue-policy'+(process.platform==='win32'?'.exe':''));
  run('rustc',['--edition=2021','--test','src-tauri/src/rescue_core.rs','-o',tests]);run(tests,[]);
  if(process.platform==='win32'){
    const probe=path.join(temp,'rescue-probe.exe');run('rustc',['--edition=2021','tools/rescue-probe.rs','-o',probe]);run(probe,[]);
  }
}finally{if(path.resolve(temp).startsWith(path.join(root,'.work')+path.sep))rmSync(temp,{recursive:true,force:true});}
