(function(root) {
  // One question at a time per AI tab. Every lock records who holds it and
  // since when, so the panel can say what the tab is busy with and stop it.
  // A hard deadline and per-call time limits mean a frozen tab can never
  // hold the lock (or the panel's "Asking Gemini…") for ever.
  // (tools/relay-check.mjs shortens these to test the limits in seconds.)
  const limits=root.__izukiRelayLimits||{};
  const DEADLINE=limits.deadline||150000, STALE=DEADLINE+(limits.staleMargin||15000), CALL_LIMIT=limits.call||12000;
  const running=new Map(), tabLocks=new Map();
  const wait=(ms,signal)=>new Promise((resolve,reject)=>{
    if(signal.aborted)return reject(new DOMException("Stopped","AbortError"));
    const abort=()=>{clearTimeout(timer);reject(new DOMException("Stopped","AbortError"));};
    const timer=setTimeout(()=>{signal.removeEventListener("abort",abort);resolve();},ms);
    signal.addEventListener("abort",abort,{once:true});
  });
  /** A browser call that answers within `ms`, or a plain-words failure. */
  const within=(promise,ms,why)=>{
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(why)),ms);})]).finally(()=>clearTimeout(timer));
  };
  async function inspect(tabId, spec, origin) {
    const tab=await chrome.tabs.get(tabId).catch(()=>null);
    if(!tab || new URL(tab.url).origin!==origin || (spec.id!=="any"&&!spec.hosts.includes(new URL(tab.url).hostname))) throw Error("The connected AI tab changed. Connect it again.");
    const [result]=await within(chrome.scripting.executeScript({target:{tabId},func:root.IzukiProviderDOM.readAssistant,args:[spec.responses,spec.users,origin]}),
      CALL_LIMIT,`${spec.name}'s tab stopped responding. Open it to check it, then try again.`);
    if(!result?.result?.ok)throw Error("The connected AI page can no longer be read.");
    return result.result;
  }
  /** The question's first line, for "still answering “…”" (never the page text). */
  const labelOf=text=>{const first=String(text||"").split("\n")[0].trim();return first.length>70?first.slice(0,67)+"…":first;};
  function busy(lock,spec){
    const secs=Math.max(1,Math.round((Date.now()-lock.startedAt)/1000));
    const error=Error(`${spec.name}'s tab is still answering ${lock.label?`“${lock.label}”`:"another Izuki question"} (started ${secs} s ago). Stop that one, or wait for it.`);
    error.code="busy";
    error.state={tabId:lock.tabId,requestId:lock.requestId,startedAt:lock.startedAt,label:lock.label,provider:spec.name};
    return error;
  }
  async function ask(connection,text,requestId,externalSignal) {
    const spec=root.IzukiProviderSpecs.find(p=>p.id===(connection?.providerId||connection?.provider?.id));
    if(!spec || spec.local || !connection.ready || !Number.isSafeInteger(connection.tabId) || connection.autoSend===false) throw Error("Connect an AI website tab before starting.");
    if(typeof text!=="string"||!text.trim()||text.length>24000||typeof requestId!=="string"||requestId.length>80)throw Error("The question is too long or could not be identified.");
    const id=connection.tabId;
    const held=tabLocks.get(id);
    if(held){
      // A lock older than any answer can take was left by a panel that
      // closed or a worker that lost track: clear it instead of blocking.
      if(Date.now()-held.startedAt>STALE){cancel(held.requestId);tabLocks.delete(id);}
      else throw busy(held,spec);
    }
    const ctrl=new AbortController();
    let timedOut=false;
    const deadline=setTimeout(()=>{timedOut=true;ctrl.abort();},DEADLINE);
    const abort=()=>ctrl.abort();
    externalSignal?.addEventListener("abort",abort,{once:true});
    if(externalSignal?.aborted)ctrl.abort();
    running.set(requestId,{ctrl,tabId:id});
    tabLocks.set(id,{requestId,tabId:id,startedAt:Date.now(),label:labelOf(text),provider:spec.name});
    try {
      const before=await inspect(id,spec,connection.origin);
      if(ctrl.signal.aborted)throw new DOMException("Stopped","AbortError");
      if(before.busy)throw Error(`${spec.name} is already answering. Wait before sharing another question.`);
      const [sent]=await within(chrome.scripting.executeScript({target:{tabId:id},func:root.IzukiProviderDOM.typeIntoComposer,args:[text,spec.composer,spec.send,true,connection.origin,requestId,Date.now()+CALL_LIMIT]}),
        CALL_LIMIT,`${spec.name}'s tab didn't take the question. Open it to check it, then try again.`);
      if(!sent?.result?.ok || !sent.result.sent)throw Error(root.IzukiProviderRelay.problem(sent?.result?.why,spec.name));
      let latest="",stableAt=0;
      while(!ctrl.signal.aborted) {
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
      throw new DOMException("Stopped","AbortError");
    } catch (error) {
      if(timedOut)throw Error(`${spec.name} didn't finish an answer within ${DEADLINE>=120000?`${Math.round(DEADLINE/6000)/10} minutes`:`${Math.round(DEADLINE/1000)} seconds`}, so I stopped waiting. Its tab may still be writing — open it to see.`);
      throw error;
    } finally {
      clearTimeout(deadline);
      externalSignal?.removeEventListener("abort",abort);
      if(tabLocks.get(id)?.requestId===requestId)tabLocks.delete(id);
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
  /**
   * Stop the question that holds this AI tab (the panel's "Stop that one").
   * Only the one the panel saw: a newer question that took the tab since is
   * left alone.
   */
  async function cancelTab(tabId,requestId) {
    const lock=tabLocks.get(tabId); if(!lock||(requestId&&lock.requestId!==requestId))return false;
    cancel(lock.requestId);
    // The lock stays until the stopped question has really left (its own
    // finally frees it), so a new question never shares the tab with it.
    const until=Date.now()+CALL_LIMIT+1000;
    while(tabLocks.get(tabId)?.requestId===lock.requestId&&Date.now()<until)await new Promise(r=>setTimeout(r,50));
    // Stuck past every limit (it can't type or send any more): let the tab go.
    if(tabLocks.get(tabId)?.requestId===lock.requestId)tabLocks.delete(tabId);
    return true;
  }
  /** What every AI tab is busy with: [{tabId, requestId, startedAt, label, provider}]. */
  const status=()=>[...tabLocks.values()].map(lock=>({...lock}));
  const problem=(why,name)=>({draft:`Your ${name} tab has a draft. Send or clear it first.`,busy:`${name} is already answering.`,
    "no-composer":`I couldn't find ${name}'s message box.`,"no-text":`${name}'s message box did not keep the question.`,
    "no-send":`The question is drafted in ${name}, but its Send button could not be verified.`,stopped:"Stopped."}[why]||`The question could not be sent to ${name}. Open that tab to check it.`);
  root.IzukiProviderRelay={ask,cancel,cancelTab,status,problem,DEADLINE};
})(globalThis);
