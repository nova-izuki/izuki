import { useState } from 'react';
import { SphereCanvas } from './VoiceSphere';
import { useIzuki } from '../lib/store';
import { Segmented } from './ui';
import { AvatarStudio } from './AvatarStudio';
import { faceFor } from '../lib/avatar';

export function OrbStudio() {
  const style=useIzuki(s=>s.settings.orb_style);
  const response=useIzuki(s=>s.settings.orb_response ?? 1);
  const patch=useIzuki(s=>s.patchSettings);
  const settings=useIzuki(s=>s.settings);
  const [state,setState]=useState<'listening'|'thinking'|'speaking'>('speaking');
  const [light,setLight]=useState(false);
  return <div className="mt-3 overflow-hidden rounded-[18px] border border-white/15">
    <div className="flex items-center justify-center" style={{background:light?'#e6edf0':'radial-gradient(ellipse at 50% 50%, #202c3b, #0c111a)'}}>
      <SphereCanvas state={state} demo={state==='speaking'} preview size={200} style={style} response={response} face={faceFor(settings)} />
    </div>
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs">Orb Studio</strong><button type="button" className="izk-pill px-2 py-1 text-[11px]" aria-pressed={light} onClick={()=>setLight(v=>!v)}>{light?'Light surface':'Dark surface'}</button></div>
      <Segmented value={state} onChange={setState} size="sm" options={[{value:'listening',label:'Rest'},{value:'thinking',label:'Thinking'},{value:'speaking',label:'Voice demo'}]} />
      {style!=='liquid' && <label className="block text-[11px] text-izk-muted">Motion intensity · {Math.round(response*100)}%
        <input aria-label="Orb motion intensity" type="range" min="0.5" max="1.5" step="0.1" value={response} onChange={e=>patch({orb_response:Number(e.target.value)})} className="mt-2 block w-full accent-izk-teal" />
        <span className="flex justify-between"><span>Gentle</span><span>Expressive</span></span>
      </label>}
      {(style==='holo3d'||style==='avatar') && <p className="text-[10.5px] leading-relaxed text-izk-muted">The face follows your pointer, blinks, talks with the voice and smiles with the mood. On Auto it's a man for a male voice and a woman for a female one.</p>}
      <p className="text-[10.5px] leading-relaxed text-izk-muted">Silent visual demo · no microphone, model calls or credits. Live motion follows sound; reduced-motion settings are respected.</p>
    </div>
    {(style==='holo3d'||style==='avatar') && <AvatarStudio />}
  </div>;
}
