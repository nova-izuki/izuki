// Only validates/checks a user-supplied PC link. Never sends a task to it.
(() => {
  function parse(value) {
    try {
      let url=new URL(String(value).trim());
      if(url.origin==='https://nova-izuki.github.io'&&url.pathname==='/izuki/app/') url=new URL(new URLSearchParams(url.hash.slice(1)).get('pc')||'');
      if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!/^\/[a-zA-Z0-9_-]{20,}\/?$/.test(url.pathname))return null;
      return url.href.replace(/\/$/,'')+'/';
    }catch{return null;}
  }
  async function check(value) {
    const link=parse(value);
    if(!link)throw new Error('Use the full private Call Izuki link, or the phone-app pairing link copied from your PC.');
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),8000);
    try {
      let r=await fetch(link+'health',{signal:controller.signal,cache:'no-store'});
      if(r.status===404) { r=await fetch(link+'caps',{signal:controller.signal,cache:'no-store'});const v=await r.json();if(r.ok&&typeof v.hear==='boolean')return {link,version:'older PC build'}; }
      else { const v=await r.json();if(r.ok&&v.ok===true&&v.service==='izuki')return {link,version:String(v.version||'')}; }
      throw new Error('This link no longer reaches Izuki. Scan the current QR on your PC.');
    }catch(error) {
      if(error.name==='AbortError')throw new Error('Your PC did not answer within 8 seconds. Keep it awake with Call Izuki enabled, then scan the current QR.');
      if(error instanceof TypeError || error instanceof SyntaxError)throw new Error('The call tunnel is unreachable. Check both devices’ internet connections and scan the fresh QR.');
      throw error;
    }finally{clearTimeout(timeout);}
  }
  window.IzukiPairing={parse,check};
})();
