// Shared, local-only navigation. No model calls, analytics or background polling.
(() => {
  let lite = matchMedia('(prefers-reduced-motion: reduce)').matches || !!navigator.connection?.saveData;
  try { const saved=localStorage.getItem('izuki.surface.lite'); if(saved!==null)lite=saved==='1'; } catch {}
  document.documentElement.dataset.surface = lite ? 'lite' : 'full';
  window.IzukiSurface = { lite };
  document.addEventListener('DOMContentLoaded', () => {
    const app = document.body.dataset.izukiSurface === 'companion';
    const actions = app ? [
      ['home','Home','Your companion, reminders and quick starts'],
      ['new','New chat','Start fresh; your draft stays until you send or clear it'],
      ['apps','Connected apps','Find email, calendar and social connections'],
      ['voice','Voice & audio','Keys, voice settings and languages'],
      ['orb','Orb Studio','Preview styles and motion intensity'],
      ['reminder','Write a reminder','Prepare a reminder request — review before sending'],
      ['export','Export this chat','Save the current conversation as a text file'],
      ['downloads','Get the apps','Windows, Android and iPhone downloads'],
    ] : [
      ['try','Try the demo','A scripted preview, not live device control'],
      ['app','Desktop app','Explore the PC companion'],
      ['features','Features','Screen control, teaching and connected tools'],
      ['platforms','Choose your device','Windows, Android, iPhone or browser'],
      ['phone','Phone companion','See phone setup and requirements'],
      ['how','Get started','Installation and first-run setup'],
      ['support','Help & support','Contact and project links'],
      ['web','Open web companion','Chat, voice and connected apps'],
    ];
    actions.push(['visuals', lite?'Use full visuals':'Use lighter visuals', 'Saves your choice and reloads this page']);
    const dialog=document.createElement('dialog'); dialog.className='surface-finder';dialog.id='surface-finder';
    dialog.setAttribute('aria-labelledby','surface-title');
    const head=document.createElement('div');head.className='surface-finder-head';
    const title=document.createElement('h2');title.id='surface-title';title.textContent='Find your next step';
    const close=document.createElement('button');close.type='button';close.textContent='Close';close.className='surface-small';
    close.onclick=()=>dialog.close();head.append(title,close);
    const input=document.createElement('input');input.type='search';input.placeholder='Search apps, voice, downloads…';input.setAttribute('aria-label','Search Izuki shortcuts');input.autocomplete='off';
    const results=document.createElement('div');results.className='surface-results';
    const count=document.createElement('p');count.className='surface-caption';count.setAttribute('aria-live','polite');
    dialog.append(head,input,results,count);document.body.append(dialog);
    function choose(id) {
      dialog.close();
      if(id==='visuals') {
        try { localStorage.setItem('izuki.surface.lite',lite?'0':'1'); }
        catch { count.textContent='Your browser could not save this preference.';dialog.showModal();return; }
        location.reload();return;
      }
      if(app) window.dispatchEvent(new CustomEvent('izuki-shortcut',{detail:id}));
      else if(id==='web') location.href='app/';
      else { const target=document.getElementById(id);target?.scrollIntoView({behavior:lite?'instant':'smooth',block:'start'}); }
    }
    function render() {
      const words=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const matches=actions.filter(a=>words.every(w=>a.join(' ').toLowerCase().includes(w)));
      results.replaceChildren();
      for(const [id,label,description] of matches) {
        const button=document.createElement('button');button.type='button';button.dataset.shortcut=id;
        const strong=document.createElement('strong');strong.textContent=label;
        const sub=document.createElement('span');sub.textContent=description;
        button.append(strong,sub);button.onclick=()=>choose(id);results.append(button);
      }
      count.textContent=matches.length ? matches.length+' shortcuts · Enter opens the first result · Esc closes' : 'No matches. Try “voice”, “apps” or “downloads”.';
    }
    function open() { input.value='';render();if(!dialog.open)dialog.showModal();input.focus(); }
    document.querySelectorAll('[data-open-finder]').forEach(b=>b.addEventListener('click',open));
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    input.addEventListener('input',render);
    input.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='Enter'){e.preventDefault();results.querySelector('button')?.click();}if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus();}});
    results.addEventListener('keydown',e=>{
      const buttons=[...results.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}
    });
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?dialog.close():open();}});
  });
})();
