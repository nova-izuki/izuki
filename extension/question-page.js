(function(root) {
  // Serialized into the chosen tab. All actions re-read and compare the page.
  async function questionPage(op="read",args={}) {
    // This reads the page; it never answers it. It used to click answers
    // ("select") and Next/Submit ("advance") for an automatic run through a
    // quiz. Those are gone — refused here, before the page is even read, so
    // nothing in the extension can put an answer in or move a test along.
    // The student chooses, and the student moves on.
    if(op==="select"||op==="advance")return {ok:false,text:"Izuki doesn't choose or submit answers. Pick yours on the page."};
    const control=globalThis.__izukiQuestionRun ||= {id:"",stopped:false,listener:null};
    if(op==="install") {
      if(control.listener)removeEventListener("keydown",control.listener,true);
      control.id=args.runId;control.stopped=false;
      control.listener=e=>{if(e.key==="Escape"){
        control.stopped=true;
        void chrome.runtime.sendMessage({izukiQuiz:{op:"stop",runId:control.id}}).catch(()=>{});
      }};
      addEventListener("keydown",control.listener,true);return {ok:true};
    }
    if(op==="stop") { if(control.id===args.runId){control.stopped=true;if(control.listener)removeEventListener("keydown",control.listener,true);}return {ok:true}; }
    const live=()=>!control.stopped && (!args.runId || control.id===args.runId);
    if(!live())return {ok:false,text:"Stopped."};
    const normal=text=>String(text||"").replace(/\s+/g," ").trim();
    const hash=text=>{let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(16);};
    const shown=el=>{if(!el||el.closest('[hidden],[aria-hidden="true"]'))return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0;};
    const checked=el=>el.matches('input')?!!el.checked:el.getAttribute("aria-checked")==="true";
    const disabled=el=>el.disabled||el.getAttribute("aria-disabled")==="true";
    const label=el=>{
      const labelled=normal((el.getAttribute("aria-labelledby")||"").split(/\s+/).map(id=>document.getElementById(id)?.innerText||"").join(" "));
      return normal(el.getAttribute("aria-label")||labelled||[...(el.labels||[])].map(l=>l.innerText).join(" ")||el.closest("label")?.innerText||(!el.matches("input")?el.innerText:"" )).slice(0,1600);
    };
    const candidates=[];
    const roots=[...document.querySelectorAll('.que,.display_question,.assessment-question,.question-wrapper,[data-testid="question"],[data-testid="question-container"],.question,fieldset,[role="radiogroup"]')];
    if(roots.length>150 || [...document.querySelectorAll('input[type="password"]')].some(shown))return {ok:false,text:"This page needs your attention before automated answers can continue."};
    let unsupported=false;
    for(const [rootIndex,block] of roots.entries()) {
      if(!shown(block))continue;
      if([...block.querySelectorAll('textarea,input[type="text"],[contenteditable="true"]')].some(el=>shown(el)&&!disabled(el)&&!el.readOnly))unsupported=true;
      let nodes=[...block.querySelectorAll('input[type="radio"],input[type="checkbox"],[role="radio"],[role="checkbox"]')];
      nodes=nodes.filter(el=>!nodes.some(other=>other!==el&&el.contains(other))&&(shown(el)||[...(el.labels||[])].some(shown)||shown(el.closest("label"))));
      if(nodes.length<2||nodes.length>16)continue;
      if(nodes.some(disabled)&&!nodes.some(checked)){unsupported=true;continue;}
      const multiple=nodes.every(el=>el.type==="checkbox"||el.getAttribute("role")==="checkbox");
      if(!multiple&&nodes.some(el=>el.type!=="radio"&&el.getAttribute("role")!=="radio"))continue;
      if(!multiple&&new Set(nodes.filter(el=>el.name).map(el=>el.name)).size>1)continue;
      const options=nodes.map(label);if(options.some(text=>!text)||new Set(options).size!==options.length)continue;
      const prompt=block.querySelector('.qtext,.question_text,.question-text,[data-testid="question-text"],legend');
      let stem=normal(prompt?.innerText);
      if(!stem){const copy=block.cloneNode(true);copy.querySelectorAll('label,input,button,script,style,[role="radio"],[role="checkbox"],.timer,[role="timer"]').forEach(el=>el.remove());stem=normal(copy.textContent);}
      if(stem.length<8)continue;
      stem=stem.slice(0,7000);
      const id=hash(JSON.stringify([location.href,block.id||block.getAttribute("data-question-id")||rootIndex,stem,options,multiple]));
      if(candidates.some(q=>q.nodes.some(node=>nodes.includes(node))))continue;
      const missingImage=[...block.querySelectorAll('img')].some(img=>shown(img)&&!normal(img.alt));
      candidates.push({id,stem,options,multiple,missingImage,selected:nodes.map((node,i)=>checked(node)?i+1:0).filter(Boolean),nodes,block});
    }
    const top=candidates.find(q=>!q.selected.length);
    const finish=/^(?:submit(?: all)?(?: answers?| and finish)?|finish(?: attempt| quiz| test)?|submit (?:quiz|test|attempt)|turn in)$/i;
    const next=/^(?:next(?: question| page)?|continue|save and continue|save & continue)$/i;
    const controls=[...document.querySelectorAll('button,input[type="submit"],input[type="button"],a[role="button"],a.next,a[rel="next"]')].filter(el=>shown(el)&&!disabled(el));
    const named=el=>normal(el.getAttribute("aria-label")||el.innerText||el.value||el.title);
    const choices=controls.filter(el=>next.test(named(el))||finish.test(named(el)));
    const proof=JSON.stringify([location.href,unsupported,candidates.map(q=>[q.id,q.stem,q.options,q.multiple,q.selected]),choices.map(el=>[named(el),el.href||"",el.formAction||""])]);
    const pageId=hash(proof);
    const exportQuestion=q=>({id:q.id,stem:q.stem,options:q.options,multiple:q.multiple,missingImage:q.missingImage,url:location.href,title:document.title});
    if(top)return {ok:true,state:"question",question:exportQuestion(top),pageId};
    if(unsupported)return {ok:true,state:"unsupported",pageId,url:location.href,text:"This page has a written or unavailable question. It needs a separate review before Next."};
    if(candidates.length && choices.some(el=>next.test(named(el))))return {ok:true,state:"next",pageId,proof,url:location.href};
    if(choices.some(el=>finish.test(named(el)))&&(candidates.length||args.hadQuestion||document.querySelector('.quizattemptsummary,.assessment-review,[data-testid="quiz-review"]')))return {ok:true,state:"final",pageId,proof,url:location.href};
    const completed=[...document.querySelectorAll('.quizreviewsummary,.quizattemptsummary,.assessment-complete,.test-submitted,[data-testid="quiz-complete"]')].some(shown);
    return {ok:true,state:completed?"complete":"unsupported",pageId,url:location.href,text:completed?"The page shows the attempt summary.":"I couldn't identify an unanswered multiple-choice question and its options on this page."};
  }
  root.IzukiQuestionPage=questionPage;
})(globalThis);
