(function(root) {
  const running=new Map(), tabLocks=new Map();
  const wait=(ms,signal)=>new Promise((resolve,reject)=>{
    if(signal.aborted)return reject(new DOMException("Stopped","AbortError"));
    const abort=()=>{clearTimeout(timer);reject(new DOMException("Stopped","AbortError"));};
    const timer=setTimeout(()=>{signal.removeEventListener("abort",abort);resolve();},ms);
    signal.addEventListener("abort",abort,{once:true});
  });
  async function inspect(tabId, spec, origin) {
    const tab=await chrome.tabs.get(tabId).catch(()=>null);
    if(!tab || new URL(tab.url).origin!==origin || (spec.id!=="any"&&!spec.hosts.includes(new URL(tab.url).hostname))) throw Error("The connected AI tab changed. Connect it again.");
    const [result]=await chrome.scripting.executeScript({target:{tabId},func:root.IzukiProviderDOM.readAssistant,args:[spec.responses,spec.users,origin]});
    if(!result?.result?.ok)throw Error("The connected AI page can no longer be read.");
    return result.result;
  }
  async function ask(connection,text,requestId,externalSignal) {
    const spec=root.IzukiProviderSpecs.find(p=>p.id===(connection?.providerId||connection?.provider?.id));
    if(!spec || spec.local || !connection.ready || !Number.isSafeInteger(connection.tabId) || connection.autoSend===false) throw Error("Connect an AI website tab before starting.");
    if(typeof text!=="string"||!text.trim()||text.length>24000||typeof requestId!=="string"||requestId.length>80)throw Error("The question is too long or could not be identified.");
    if(tabLocks.has(connection.tabId))throw Error("That AI tab is answering another Izuki request. Stop it or wait.");
    const ctrl=new AbortController(), id=connection.tabId;
    const abort=()=>ctrl.abort();
    externalSignal?.addEventListener("abort",abort,{once:true});
    if(externalSignal?.aborted)ctrl.abort();
    running.set(requestId,{ctrl,tabId:id}); tabLocks.set(id,requestId);
    try {
      const before=await inspect(id,spec,connection.origin);
      if(ctrl.signal.aborted)throw new DOMException("Stopped","AbortError");
      if(before.busy)throw Error(`${spec.name} is already answering. Wait before sharing another question.`);
      const [sent]=await chrome.scripting.executeScript({target:{tabId:id},func:root.IzukiProviderDOM.typeIntoComposer,args:[text,spec.composer,spec.send,true,connection.origin,requestId]});
      if(!sent?.result?.ok || !sent.result.sent)throw Error(root.IzukiProviderRelay.problem(sent?.result?.why,spec.name));
      let latest="",stableAt=0;
      const until=Date.now()+120000;
      while(Date.now()<until) {
        await wait(650,ctrl.signal);
        const reply=await inspect(id,spec,connection.origin);
        if(ctrl.signal.aborted)throw new DOMException("Stopped","AbortError");
        const normalize=value=>String(value).replace(/\s+/g," ").trim();
        if(reply.user&&normalize(reply.user)!==normalize(text.slice(0,18000)))throw Error("Another message appeared in the connected AI chat. Check its answer before continuing.");
        const fresh=reply.count>before.count || (reply.text && reply.text!==before.text);
        if(!fresh || !reply.text || reply.busy){latest="";stableAt=0;continue;}
        if(reply.text!==latest){latest=reply.text;stableAt=Date.now();continue;}
        if(Date.now()-stableAt>=2000)return {ok:true,text:latest,provider:spec.name};
      }
      throw Error(`I couldn't verify a new finished answer from ${spec.name}. Open its tab, or choose another assistant.`);
    } finally {
      externalSignal?.removeEventListener("abort",abort);
      if(tabLocks.get(id)===requestId)tabLocks.delete(id);
      running.delete(requestId);
    }
  }
  function cancel(requestId) {
    const active=running.get(requestId); if(!active)return;
    active.ctrl.abort();
    void chrome.scripting.executeScript({target:{tabId:active.tabId},func:(id)=>{
      const stopped=globalThis.__izukiStoppedRelay ||= new Set();stopped.add(id);
      if(stopped.size>60)stopped.delete(stopped.values().next().value);
    },args:[requestId]}).catch(()=>{});
  }
  const problem=(why,name)=>({draft:`Your ${name} tab has a draft. Send or clear it first.`,busy:`${name} is already answering.`,
    "no-composer":`I couldn't find ${name}'s message box.`,"no-text":`${name}'s message box did not keep the question.`,
    "no-send":`The question is drafted in ${name}, but its Send button could not be verified.`,stopped:"Stopped."}[why]||`The question could not be sent to ${name}. Open that tab to check it.`);
  root.IzukiProviderRelay={ask,cancel,problem};
})(globalThis);
