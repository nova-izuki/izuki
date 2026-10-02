import { useEffect, useState } from 'react';
import { api, call, on, IS_TAURI } from '../lib/ipc';
import { useIzuki } from '../lib/store';
import { Row, Toggle } from './ui';

type State = { phase:string; version:string; downloaded:number; total:number|null; checked_at:number; error:string|null };
const initial:State={phase:'',version:'',downloaded:0,total:null,checked_at:0,error:null};
export function UpdateControls({compact=false}:{compact?:boolean}) {
  const [status,setStatus]=useState(initial),[error,setError]=useState(''),[dismissed,setDismissed]=useState('');
  const [pending,setPending]=useState(false);
  const auto=useIzuki(s=>s.settings.automatic_update_checks ?? true),patch=useIzuki(s=>s.patchSettings);
  useEffect(()=>{let alive=true, off:(()=>void)|undefined;
    void on<State>('izuki://update-status',v=>{if(alive)setStatus(v);}).then(async f=>{if(!alive){f();return;}off=f;const v=await call<State>('update_status',undefined,()=>initial);if(alive)setStatus(v);}).catch(e=>{if(alive)setError(String(e));});
    return()=>{alive=false;off?.();};
  },[]);
  const busy=pending||['checking','downloading','installing'].includes(status.phase);
  const run=async(cmd:string)=>{
    if(cmd==='install_update'&&!window.confirm(`Install Izuki ${status.version} now? Save your work first. Izuki will close while the installer runs.`))return;
    setPending(true);setError('');
    try { const value=await call<State|undefined>(cmd,cmd==='install_update'?{version:status.version}:undefined,()=>{throw new Error('Updates install only in the desktop app.');});if(value)setStatus(value); }
    catch(e){setError(String(e));}finally{setPending(false);}
  };
  if(compact&&(!status.version||dismissed===status.version))return null;
  const labels:Record<string,string>={checking:'Checking for updates…',current:'You have the latest published version.',available:`Izuki ${status.version} is available.`,downloading:`Downloading ${status.total?Math.min(100,Math.round(status.downloaded/status.total*100))+'%':(status.downloaded/1048576).toFixed(1)+' MB'}…`,ready:`Izuki ${status.version} is verified and ready to install.`,installing:'Starting the installer…',error:'Update needs attention.'};
  return <div className={compact?'mx-[18px] mt-2 rounded-2xl border border-izk-teal/25 bg-izk-teal/10 p-3 text-xs':'space-y-3 text-xs'}>
    {!compact&&<Row label="Automatic update checks" hint="Check after startup and every six hours. Downloads and installation need your click."><Toggle checked={auto} onChange={v=>patch({automatic_update_checks:v})}/></Row>}
    <p role="status">{labels[status.phase]||'Check for signed desktop updates without visiting the website.'}</p>
    {(error||status.error)&&<p role="alert" className="mt-2 break-words text-izk-danger">{error||status.error}</p>}
    <div className="mt-2 flex flex-wrap gap-2">
      {!compact&&<button type="button" className="izk-pill px-3 py-2" disabled={busy||!IS_TAURI} onClick={()=>void run('check_updates')}>Check now</button>}
      {status.version&&status.phase!=='ready'&&<button type="button" className="izk-btn-primary px-3 py-2" disabled={busy||!IS_TAURI} onClick={()=>void run('download_update')}>Download update</button>}
      {status.phase==='ready'&&<button type="button" className="izk-btn-primary px-3 py-2" disabled={busy||!IS_TAURI} onClick={()=>void run('install_update')}>Install &amp; close Izuki</button>}
      <button type="button" className="izk-pill px-3 py-2" onClick={()=>void api.openUrl('https://nova-izuki.github.io/izuki/#download')}>Website</button>
      {compact&&!busy&&<button type="button" className="izk-pill px-3 py-2" onClick={()=>setDismissed(status.version)}>Later</button>}
    </div>
    {!compact&&<p className="text-[11px] text-izk-muted">Never installs on a timer. Active screen tasks block installation. Save any unsent drafts before confirming. {status.checked_at?`Last checked ${new Date(status.checked_at).toLocaleString()}.`:''}</p>}
  </div>;
}
