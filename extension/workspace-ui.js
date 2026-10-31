import "./lab-state.js";
const $=id=>document.getElementById(id);
export async function workspaceMessage(body) {
  const response=await chrome.runtime.sendMessage({izukiWorkspace:body});
  if(!response?.ok)throw Error(response?.text||"The browser workspace is unavailable. Reload the extension and reopen it.");
  return response;
}
export async function setUpWorkspace({windowId,getSource,getConnection,readTab,onHistory,onError,beforeRun}) {
  let chat=null,plan=null,planSource=null,planning=null,lastLab=null;
  const request=(op,body={})=>workspaceMessage({op,windowId,...body});
  const text=(id,value)=>{$(id).textContent=String(value||"");};
  async function recent(snapshot) {
    chat=snapshot;const list=$("recent-list");list.replaceChildren();
    text("recent-count",snapshot.chats.length?`(${snapshot.chats.length})`:"");
    for(const item of snapshot.chats){
      const row=document.createElement("div");row.className="connect-row";
      const open=document.createElement("button");open.className="recent-chat chip";open.textContent=item.title;open.title=`${item.provider||"Izuki"} · ${new Date(item.updatedAt).toLocaleString()}`;
      open.onclick=()=>{beforeRun();void request("history",{action:"open",id:item.id}).then(value=>{onHistory(value.chat?.history||[]);return recent(value);}).catch(onError);};
      const forget=document.createElement("button");forget.className="icon";forget.textContent="×";forget.title="Delete this conversation";
      forget.onclick=()=>void request("history",{action:"forget",id:item.id}).then(value=>{if(chat?.id===item.id)onHistory([]);return recent(value);}).catch(onError);
      row.append(open,forget);list.append(row);
    }
    if(!snapshot.chats.length)text("recent-list","Your completed conversations will appear here. Reopening this panel keeps the same chat.");
  }
  function connection() {const c=getConnection();return c?{...c,providerId:c.provider.id,name:c.provider.name}:{providerId:"izuki",name:"Izuki"};}
  const active=state=>["starting","reading","answering","suggested","running","stopping","stop-failed"].includes(state?.phase);
  // A doing-verb, at most three small words, then the thing itself as a whole
  // word, and not the first half of a compound ("test cases", "lab report").
  // "quiz"/"test" can also sit in front ("answer these quiz questions"); a
  // single "test question" is one question to explain, not a quiz to run.
  const BETWEEN="(?:(?:my|this|the|all|these|those|a|an|of|practice|next|chapter|module|quiz|test|\\d+)\\s+){0,3}";
  const NOT_COMPOUND="(?![a-z])(?!\\s+(?:cases?|plans?|drive|runs?|reports?|results|data|files?|safety|room|kit|coats?|partners?|manual|question)(?![a-z]))";
  const QUIZ_RUN=new RegExp(`(?<![a-z])(?:answer|solve|complete|do|take)\\s+${BETWEEN}(?:questions|quiz(?:zes)?|tests?)${NOT_COMPOUND}`,"i");
  const LAB_RUN=new RegExp(`(?<![a-z])(?:plan|do|complete|finish|start)\\s+${BETWEEN}(?:lab|labs|laboratory)${NOT_COMPOUND}`,"i");
  function showLab(state) {
    if(!state?.plan)return;
    lastLab=state;text("lab-status",state.text);
    if(!plan){plan=state.plan;planSource=state.source;drawPlan();}
    const covered=globalThis.IzukiLabState.coverage(state.plan,state.steps||{});
    document.querySelectorAll("[data-lab-step]").forEach(el=>{
      const result=state.steps?.[el.dataset.labStep];el.querySelector(".step-result").textContent=result?`${result.phase}: ${result.text}`:"Not run yet";
      el.querySelector("textarea").disabled=active(state);el.querySelector('input[type="checkbox"]').disabled=active(state);
    });
    text("lab-coverage",`${covered.requirements.filter(Boolean).length}/${covered.requirements.length} requirements verified · ${covered.deliverables.filter(Boolean).length}/${covered.deliverables.length} deliverables verified`);
    const requirements=$("lab-requirements");requirements.replaceChildren();
    for(const [i,requirement] of state.plan.requirements.entries()){const line=document.createElement("li");line.textContent=`${covered.requirements[i]?"✓":"○"} ${requirement}`;requirements.append(line);}
    const files=$("lab-deliverables");files.replaceChildren();
    for(const [i,item] of state.plan.deliverables.entries()){const line=document.createElement("li");line.textContent=`${covered.deliverables[i]?"✓":"○"} ${item.name} — checked at step ${item.step}`;files.append(line);}
    $("lab-start").disabled=active(state);$("lab-plan").disabled=active(state);$("lab-instructions").disabled=active(state);
    $("lab-stop").hidden=!active(state);
  }
  function drawPlan() {
    const list=$("lab-steps");list.replaceChildren();$("lab-board").hidden=false;
    text("lab-title",plan.title);
    for(const [i,step] of plan.steps.entries()){
      const row=document.createElement("details");row.dataset.labStep=step.id;row.open=i===0;
      const summary=document.createElement("summary");summary.textContent=`${i+1}. ${step.title}${step.final?" · upload / submit":""}`;
      const instruction=document.createElement("textarea");instruction.value=step.instruction;instruction.maxLength=400;instruction.rows=4;instruction.setAttribute("aria-label",`Step ${i+1} instruction and result check`);
      instruction.oninput=()=>{step.instruction=instruction.value;lastLab=null;text("lab-coverage","Plan edited. Previous checks will not be counted for the edited plan.");};
      const final=document.createElement("label");final.className="switch";const flag=document.createElement("input");flag.type="checkbox";flag.checked=step.final;flag.onchange=()=>{step.final=flag.checked;lastLab=null;};final.append(flag,"This step uploads or submits work");
      const proof=document.createElement("p");proof.className="step-result";proof.textContent="Not run yet";
      row.append(summary,instruction,final,proof);list.append(row);
    }
    showLab({plan,source:planSource,phase:"ready",text:"Review the exact instructions. Each step includes a result check.",steps:{}});
  }
  $("clear-chats").onclick=()=>{beforeRun();void request("history",{action:"clear"}).then(value=>{onHistory([]);return recent(value);}).catch(onError);};
  $("float-panel").onclick=()=>void request("float").catch(onError);
  const floating=new URLSearchParams(location.search).get("floating")==="1";
  $("float-panel").hidden=floating;$("dock-panel").hidden=!floating;
  $("dock-panel").onclick=()=>{
    // open() requires the user's click; make this call before awaiting anything.
    const opened=chrome.sidePanel?.open({windowId});
    if(!opened)return onError(Error("Use the extension icon in the browser to reopen the sidebar."));
    void opened.then(()=>request("dock")).catch(onError);
  };
  $("quiz-start").onclick=()=>void startQuiz().catch(onError);
  $("quiz-stop").onclick=()=>void request("stop",{kind:"quiz"}).catch(onError);
  async function startQuiz(source=getSource()) {
    if(!source || !$("share").checked)throw Error("Choose and share the tab with your questions first.");
    beforeRun();$("follow-questions").checked=false;$("follow-questions").dispatchEvent(new Event("change"));
    $("pin-page").checked=true;
    const result=await request("quizStart",{source,connection:connection()});
    paintQuiz(result.state);
  }
  function paintQuiz(state){text("quiz-status",state?.text||"Choose your question page, then start. You pick the answers; Izuki explains each one. Stop with Esc on that page or Alt+Shift+X.");$("quiz-start").disabled=active(state);$("quiz-stop").hidden=!active(state);text("quiz-answer",state?.answer||"");}
  async function planLab() {
    if(planning)return;
    const source=getSource();if(!source||!$("share").checked)throw Error("Choose and share the page containing your lab first.");
    beforeRun();planning=crypto.randomUUID();const id=planning;$("lab-plan").disabled=true;text("lab-status","Reading the lab and building a requirement checklist…");
    try {
      const page=await readTab(source.id);if(planning!==id)return;
      if(!page?.text||page.url!==source.url)throw Error("The lab page could not be read, or changed. Choose it again.");
      const instructions=`${source.title}\n${source.url}\n${page.text}\n\n[Additional requirements entered by the user]\n${$("lab-instructions").value}`;
      const progress=lastLab?JSON.stringify({steps:lastLab.steps,text:lastLab.text}):"";
      const result=await request("relay",{connection:connection(),id,prompt:globalThis.IzukiLabState.labPrompt(instructions,progress)});
      if(planning!==id)return;
      plan=globalThis.IzukiLabState.parseLabPlan(result.text);planSource={...source};lastLab=null;drawPlan();
    }catch(error){if(planning===id)text("lab-status",error.message);}finally{if(planning===id)planning=null;$("lab-plan").disabled=false;}
  }
  $("lab-plan").onclick=()=>void planLab().catch(onError);
  $("lab-start").onclick=()=>{
    if(!plan)return;beforeRun();
    void request("labStart",{plan,source:planSource,resume:!!lastLab}).then(result=>showLab(result.state)).catch(onError);
  };
  $("lab-stop").onclick=()=>void stop().catch(onError);
  async function stop() {
    if(planning){const id=planning;planning=null;await request("cancelRelay",{id});text("lab-status","Planning stopped. No lab actions were run.");$("lab-plan").disabled=false;}
    await request("stop",{kind:"quiz"});await request("stop",{kind:"lab"});
  }
  document.addEventListener("keydown",e=>{if(e.key==="Escape")void stop().catch(onError);});
  // A bounded scroll area above a separate scrollable conversation; keyboard
  // users can resize it too. No wheel event interception.
  const splitter=$("workspace-size"),upper=$("workspace-controls");
  const resize=y=>{upper.style.maxHeight=`${Math.max(100,Math.min(innerHeight*.7,y-upper.getBoundingClientRect().top))}px`;};
  splitter.onpointerdown=e=>{splitter.setPointerCapture(e.pointerId);};
  splitter.onpointermove=e=>{if(splitter.hasPointerCapture(e.pointerId))resize(e.clientY);};
  splitter.onkeydown=e=>{if(["ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();resize(upper.getBoundingClientRect().bottom+(e.key==="ArrowDown"?30:-30));}};
  const saved=await request("history");await recent(saved);if(saved.chat)onHistory(saved.chat.history);
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==="session"){
      if(changes["izkRun:quiz"]?.newValue?.source?.id && changes["izkRun:quiz"].newValue.source.windowId===windowId)paintQuiz(changes["izkRun:quiz"].newValue);
      if(changes["izkRun:lab"]?.newValue?.source?.windowId===windowId)showLab(changes["izkRun:lab"].newValue);
    }
    if(area==="local"&&changes.izkWorkspaceHistory)void request("history").then(recent).catch(onError);
  });
  const status=await request("status");paintQuiz(status.quiz);showLab(status.lab);
  return {
    begin:()=>request("history",{action:"begin"}),
    fresh:async()=>{const state=await request("history",{action:"fresh"});await recent(state);},
    commit:async(ticket,question,answer,id,provider)=>{
      const state=await request("history",{action:"commit",entry:{id:ticket.id,epoch:ticket.epoch,question,answer,requestId:id,provider}});await recent(state);
    },
    relay:(connection,prompt,id)=>request("relay",{connection,id,prompt}),
    cancel:id=>request("cancelRelay",{id}).catch(()=>{}),
    command:async(question,source)=>{
      // The verb must be aimed at the quiz or the lab — the same rule as the
      // app's coach::verb_on and the Chat tab. "A verb anywhere, then the noun
      // anywhere" turned "help me understand this lab report" into a lab plan
      // and "do I need to complete all the test cases?" into a quiz run, and
      // starting either cancels whatever was already running.
      if(QUIZ_RUN.test(question)){await startQuiz(source);return true;}
      if(LAB_RUN.test(question)){$("lab-tools").open=true;$("lab-instructions").value=question;await planLab();return true;}
      return false;
    },stop,
  };
}
