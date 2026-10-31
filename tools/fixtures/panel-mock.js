// Disposable browser fixture. No real account, page, microphone or desktop API.
const event = () => ({ handlers:[], addListener(fn) { this.handlers.push(fn); }, fire(...args) { this.handlers.forEach((fn) => fn(...args)); } });
// Marks a genuinely new document, so a test can wait for the reload instead
// of reading the page it is replacing.
const freshLoad = localStorage.getItem('panelTest:fresh') === '1';
localStorage.removeItem('panelTest:fresh');
const stores = { session:{}, local:{} };
try { Object.assign(stores.local, { izkConnect: JSON.parse(localStorage.getItem('panelTest:connect') || 'null') }); } catch {}
const storage = (kind) => ({
  async get(key) { return { [key]:stores[kind][key] }; },
  async set(value) { Object.assign(stores[kind], value); },
  async remove(key) { delete stores[kind][key]; },
});
window.panelTest = {
  active:1, fresh:freshLoad, reads:[], asks:[], stops:[], handed:[], tasks:[], stores,
  question:'Which option describes a network of infected devices?',
  pages:[{id:1,windowId:7,active:true,url:'https://course.example/chapter5',title:'Chapter 5'}, {id:2,windowId:7,active:false,url:'https://assistant.example/chat',title:'My custom AI'}],
  // A reload can start with a tab already open, the way the real panel opens
  // beside a Gemini tab that was there first.
  ...(localStorage.getItem('panelTest:gemini') === '1' ? { pages:[{id:1,windowId:7,active:true,url:'https://course.example/chapter5',title:'Chapter 5'}, {id:6,windowId:7,active:false,url:'https://gemini.google.com/app',title:'Gemini'}] } : {}),
  reply(text='A botnet.') { this.asks.at(-1).resolve(new Response(JSON.stringify({ok:true,text}), {headers:{'Content-Type':'application/json'}})); },
};
const m = window.panelTest;
window.chrome = {
  windows:{ getCurrent:async()=>({id:7}), onFocusChanged:event() },
  tabs:{
    query:async(q)=> (q.active ? m.pages.filter((t)=>t.id===m.active) : m.pages).map((t)=>({...t})),
    get:async(id)=> { const page=m.pages.find((t)=>t.id===id); if(!page)throw Error('closed'); return {...page}; },
    onActivated:event(),onUpdated:event(),onRemoved:event(),
  },
  storage:{session:storage('session'),local:storage('local'),onChanged:event()},
  runtime:{sendMessage:async()=>{}},
  scripting:{executeScript:async({target,func,args=[]})=>{
    const page=m.pages.find((t)=>t.id===target.tabId);
    if(!page)throw Error('closed');
    if(func.name==='typeIntoComposer') { m.handed.push({id:target.tabId,text:args[0]});return [{result:{ok:true,sent:true}}]; }
    m.reads.push(target.tabId);
    return [{result:args[0]==='question'
      ? {text:m.question,url:page.url,title:page.title}
      : {text:'A public chapter about networks.',selection:'',links:[],url:page.url}}];
  }},
};
const originalFetch=window.fetch.bind(window);
window.fetch=async(url,options={})=>{
  if(!String(url).startsWith('http://127.0.0.1:47615/'))return originalFetch(url,options);
  const body=JSON.parse(options.body||'{}');
  if(String(url).endsWith('/ask'))return new Promise((resolve,reject)=>{
    m.asks.push({body,resolve});
    options.signal?.addEventListener('abort',()=>reject(new DOMException('Stopped','AbortError')),{once:true});
  });
  if(String(url).endsWith('/side/stop'))m.stops.push(body);
  if(String(url).endsWith('/side/prepare')) { m.tasks.push({route:'prepare',body});return new Response(JSON.stringify({ok:true,reviewToken:'fixture-review',prompt:body.prompt})); }
  if(String(url).endsWith('/side/run')) { m.tasks.push({route:'run',body});return new Response(JSON.stringify({ok:true,state:'running'})); }
  if(String(url).endsWith('/side/status'))return new Response(JSON.stringify({ok:true,state:'finished',outcome:'verified',text:'The reviewed fixture task finished.'}));
  return new Response(JSON.stringify({ok:true,left:0,show:false}),{headers:{'Content-Type':'application/json'}});
};
