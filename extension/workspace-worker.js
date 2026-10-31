// Own the workspace in the worker so opening or floating the panel never
// starts a second conversation or a second action run.
(function(root) {
  const bridge="http://127.0.0.1:47615/izuki", headers={"X-Izuki-Extension":"1","Content-Type":"application/json"};
  const histories=root.IzukiWorkspaceState.createHistoryStore(chrome.storage.local);
  const popups=new Map();
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const post=async(path,body,signal)=>{
    let response;
    try{response=await fetch(`${bridge}/${path}`,{method:"POST",headers,body:JSON.stringify(body),signal:signal||AbortSignal.timeout(12000)});}
    catch(error){
      // A wait that ran out is a slow answer, not a broken app: say which.
      if(error?.name==="TimeoutError")throw Error("Izuki on this PC took too long to answer. Try again, or choose a faster AI in Izuki's settings.");
      throw error;
    }
    if(!response.ok)throw Error("Open or update Izuki on this PC, then try again.");
    const data=await response.json();if(!data.ok)throw Error(data.text||"Izuki could not complete that request.");return data;
  };
  function trusted(sender) {try{const actual=new URL(sender.url),expected=new URL(chrome.runtime.getURL("sidepanel.html"));return sender.id===chrome.runtime.id&&actual.origin===expected.origin&&actual.pathname===expected.pathname;}catch{return false;}}
  async function sourceTab(source,exact=true) {
    const tab=await chrome.tabs.get(source?.id).catch(()=>null);
    if(!tab||!/^https?:\/\//.test(tab.url||"")||new URL(tab.url).origin!==new URL(source.url).origin||(exact&&tab.url!==source.url))throw Error("The chosen page changed or closed. Choose it again.");
    return tab;
  }
  async function page(run,op,args={}) {
    await sourceTab(run.source);
    if(run.controller.signal.aborted && op!=="stop")throw new DOMException("Stopped","AbortError");
    const [result]=await chrome.scripting.executeScript({target:{tabId:run.source.id},func:root.IzukiQuestionPage,args:[op,{...args,runId:run.id,hadQuestion:run.hadQuestion}]});
    return result?.result;
  }
  async function answer(connection,prompt,id,signal) {
    if(!connection || connection.providerId==="izuki" || connection.provider?.local) {
      // As long as the app itself gives a model (up to 240 s), not the 12 s a
      // quick bridge call gets: a lab plan or a busy free tier needs it, and
      // the 12 s default cut answers off with a raw AbortError.
      const limit=AbortSignal.timeout(240000);
      const reply=await post("ask",{requestId:id,task:"chat",question:prompt,title:"Reviewed browser workspace",url:"",text:"",selection:"",history:[],web:false},signal?AbortSignal.any([signal,limit]):limit);
      return {ok:true,text:reply.text,provider:"Izuki"};
    }
    return root.IzukiProviderRelay.ask(connection,prompt,id,signal);
  }
  function changed(kind,state) {
    void chrome.storage.session.set({[`izkRun:${kind}`]:state}).catch(()=>{});
    void chrome.action?.setBadgeText({text:["starting","reading","answering","suggested","running","stopping","stop-failed"].includes(state.phase)?"RUN":""}).catch(()=>{});
  }
  const quiz=new root.IzukiQuestionRunner.QuestionRunner({
    changed:state=>changed("quiz",state),
    install:async run=>{run.chat=await histories.begin(run.windowId);const result=await page(run,"install");if(!result?.ok)throw Error(result?.text||"The question page could not be connected.");},
    // The student moving on is how an explain-only run advances, and on many
    // quizzes (Moodle's attempt.php?page=N, Canvas one question at a time)
    // each question has its own address. So the run follows the page within
    // the same site and sets the reader up again there. A tab that closed or
    // went to another site still stops it (sourceTab throws); a page caught
    // mid-load is "look again shortly", not a failure.
    read:async run=>{
      const tab=await sourceTab(run.source,false);
      const loading={ok:true,state:"loading"};
      if(tab.url!==run.source.url){run.source.url=tab.url;await page(run,"install").catch(()=>{});}
      let out=await page(run,"read").catch(()=>loading);
      // A reload drops the page's run marker: set it up again, once.
      if(out&&!out.ok&&out.text==="Stopped."&&!run.controller.signal.aborted){
        await page(run,"install").catch(()=>{});
        out=await page(run,"read").catch(()=>loading);
      }
      return out;
    },
    answer:async(run,q,prompt)=>{run.requestId=crypto.randomUUID();return answer(run.connection,prompt,run.requestId,run.controller.signal);},
    record:(run,q,selection)=>histories.commit(run.windowId,{id:run.chat.id,epoch:run.chat.epoch,requestId:run.requestId,
      question:q.stem,answer:`Suggested: ${selection.choices.map(i=>q.options[i-1]).join("; ")}\n${selection.reason}`,provider:run.connection?.providerId||"Izuki"}),
    stop:async run=>{
      root.IzukiProviderRelay.cancel(run.requestId);
      if(run.requestId)await post("side/stop",{requestId:run.requestId,kind:"chat"}).catch(()=>{});
      await page(run,"stop").catch(()=>{});
    },
  });
  let nativePending=null;
  async function stopNative(run) {
    if(!run.taskId)return;
    await post("side/stop",{requestId:run.taskId,kind:"task"});
    // A Stop acknowledgement is not proof the native task has finished.
    for(let i=0;i<40;i++){
      let state;
      try{state=await post("side/status",{requestId:run.taskId});}
      catch(error){
        // The app no longer knows this task (it restarted, or the task ended
        // and was tidied away): it isn't running, so there's nothing to wait for.
        if(/no longer available/i.test(error?.message||"")){nativePending=null;return;}
        throw error;
      }
      if(!["prepared","running"].includes(state.state)){nativePending=null;return;}
      await sleep(500);
    }
    throw Error("Izuki is still stopping the previous task. Wait before running another step.");
  }
  const lab=new root.IzukiLabState.LabRunner({
    changed:state=>changed("lab",state), stop:stopNative,
    runStep:async(run,step)=>{
      if(nativePending)throw Error("A previous desktop step is still stopping. Check Izuki before continuing.");
      const tab=await sourceTab(run.source,false);
      run.source.url=tab.url;
      await chrome.tabs.update(tab.id,{active:true});await chrome.windows.update(tab.windowId,{focused:true});
      if(run.controller.signal.aborted)throw new DOMException("Stopped","AbortError");
      // "Started" is per step: step 1 having run says nothing about whether
      // step 2 ever reached the app.
      run.taskId=crypto.randomUUID();nativePending=run.taskId;run.started=false;
      try {
        const ready=await post("side/prepare",{requestId:run.taskId,prompt:step.instruction,tabId:tab.id,url:tab.url,title:tab.title||"Lab"});
        if(run.controller.signal.aborted){await stopNative(run);throw new DOMException("Stopped","AbortError");}
        await post("side/run",{requestId:run.taskId,reviewToken:ready.reviewToken});
        // From here a task may really be moving the desktop.
        run.started=true;
        const until=Date.now()+15*60*1000;
        while(Date.now()<until){
          if(run.controller.signal.aborted){await stopNative(run);throw new DOMException("Stopped","AbortError");}
          const state=await post("side/status",{requestId:run.taskId});
          if(!["prepared","running"].includes(state.state)){nativePending=null;return state;}
          await sleep(1500);
        }
        await stopNative(run);throw Error("The step reached its time limit. Its result needs review.");
      } catch(error) {
        // Failed status checks must not free the action lane while a task
        // could still be moving the desktop. One the app never accepted
        // (prepare or run never reached it — Izuki closed) can't be, and
        // keeping the lock then blocked every later lab and quiz run with no
        // control on the panel to clear it.
        await stopNative(run).catch(()=>{if(!run.started)nativePending=null;});throw error;
      }
    },
  });
  async function float(windowId) {
    const old=popups.get(windowId);if(old){const existing=await chrome.windows.update(old,{focused:true}).catch(()=>null);if(existing)return {ok:true,windowId:old};}
    const original=await chrome.windows.get(windowId);
    if(original.type!=="normal")throw Error("Choose the browser window with your work first.");
    const win=await chrome.windows.create({type:"popup",url:chrome.runtime.getURL(`sidepanel.html?sourceWindow=${windowId}&floating=1`),width:460,height:760,focused:true});
    popups.set(windowId,win.id);return {ok:true,windowId:win.id};
  }
  async function route(message,sender) {
    const {op,windowId}=message;
    if(op==="stop"){
      if(!trusted(sender)&&(message.kind==="lab"||sender.tab?.id!==quiz.current?.source.id))throw Error("That page does not own this run.");
      if(message.kind==="lab")return {ok:true,state:lab.stop()};
      if(message.runId&&message.runId!==quiz.current?.id)return {ok:true};
      return {ok:true,state:quiz.stop()};
    }
    if(!trusted(sender))throw Error("Open Izuki's browser workspace to use this control.");
    if(op==="history"){
      const action=message.action||"load";if(!["load","begin","fresh","open","forget","clear","commit"].includes(action))throw Error("Unknown history control.");
      return histories[action](windowId,action==="commit"?message.entry:message.id);
    }
    if(op==="relay")return answer(message.connection,message.prompt,message.id);
    if(op==="cancelRelay"){root.IzukiProviderRelay.cancel(message.id);return {ok:true};}
    if(op==="float")return float(windowId);
    if(op==="dock"){
      // Closing only a popup this worker created never closes the source browser.
      const id=popups.get(windowId);if(id){popups.delete(windowId);await chrome.windows.remove(id);}
      return {ok:true};
    }
    if(op==="status")return {ok:true,quiz:quiz.status(),lab:lab.status(),nativePending:!!nativePending};
    if(op==="quizStart"){
      if(lab.current||nativePending)throw Error("Finish or stop the current lab step first.");
      await sourceTab(message.source);return {ok:true,state:quiz.start(message)};
    }
    if(op==="labStart"){
      if(quiz.current||nativePending)throw Error("Finish or stop the current run first.");
      await sourceTab(message.source);return {ok:true,state:lab.start(message)};
    }
    throw Error("Unknown workspace request.");
  }
  chrome.runtime.onMessage.addListener((message,sender,respond)=>{
    const request=message?.izukiWorkspace||(message?.izukiQuiz?.op==="stop"?{...message.izukiQuiz,op:"stop"}:null);
    if(!request)return;
    route(request,sender).then(respond,error=>respond({ok:false,text:error.message||"The workspace could not continue."}));return true;
  });
  chrome.commands.onCommand.addListener(command=>{if(command==="stop-workspace"){quiz.stop();lab.stop();}});
  chrome.windows.onRemoved.addListener(id=>{for(const [source,popup] of popups)if(id===popup||id===source){popups.delete(source);if(quiz.current?.windowId===source)quiz.stop("The workspace window closed.");if(lab.current?.windowId===source)lab.stop();}});
  // Service-worker restarts never restart a task. The last status stays as
  // review evidence, rather than a misleading forever-running spinner.
  void chrome.storage.session.get(["izkRun:quiz","izkRun:lab"]).then(saved=>{
    for(const [kind,runner] of [["quiz",quiz],["lab",lab]]){
      const state=saved[`izkRun:${kind}`];if(state&&!runner.current){runner.last={...state,phase:state.phase==="complete"?"complete":"review",text:state.phase==="complete"?state.text:"The browser worker restarted. Review the page and saved results before starting again."};}
    }
  }).catch(()=>{});
})(globalThis);
