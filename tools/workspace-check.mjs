import assert from 'node:assert/strict';
import '../extension/workspace-state.js';
import '../extension/question-runner.js';
import '../extension/lab-state.js';
const {createHistoryStore}=globalThis.IzukiWorkspaceState;
const data={},store=createHistoryStore({get:async key=>structuredClone({[key]:data[key]}),set:async value=>Object.assign(data,structuredClone(value))});
const ticket=await store.begin(7),entry=(id,extra={})=>({id:ticket.id,epoch:ticket.epoch,requestId:id,question:'Chapter 5',answer:'The actual answer.',provider:'Fixture',...extra});
await Promise.all([store.commit(7,entry('a')),store.commit(7,entry('a')),store.commit(7,entry('b'))]);
assert.equal((await store.load(7)).chat.history.length,4,'deduplicate retries without losing concurrent completed turns');
await store.fresh(7);await store.commit(7,entry('late'));
assert.equal((await store.load(7)).chat,null,'late answer must not select an abandoned chat');
await store.open(7,ticket.id);await store.clear(7);assert.equal((await store.commit(7,entry('cleared'))).ok,false);
assert.equal((await store.load(7)).chats.length,0,'cleared history cannot be resurrected');
const next=await store.begin(7);await store.commit(7,entry('new',{id:next.id,epoch:next.epoch}));await store.forget(7,next.id);
assert.equal((await store.commit(7,entry('deleted',{id:next.id,epoch:next.epoch}))).ok,false,'deleted chat cannot return from a late answer');
// Deleting a different chat must not break an answer still running for this
// one. It used to bump the epoch every in-flight answer checks, so deleting
// anything showed an error on whatever else was answering, and lost the turn.
{
  const kept=await store.begin(7);await store.commit(7,entry('k1',{id:kept.id,epoch:kept.epoch}));
  const other=await store.begin(9);await store.commit(9,entry('o1',{id:other.id,epoch:other.epoch}));
  await store.forget(9,other.id);
  assert.equal((await store.commit(7,entry('k2',{id:kept.id,epoch:kept.epoch}))).ok,true,'deleting another chat leaves this answer able to save');
  assert.equal((await store.commit(9,entry('o2',{id:other.id,epoch:other.epoch}))).ok,false,'and the deleted chat stays deleted after other saves');
}
assert.equal((await store.load(8)).chat,null,'windows do not silently switch active chat');
assert.throws(()=>store.begin(-1));
for(let i=0;i<24;i++){const c=await store.fresh(7);await store.commit(7,{id:c.id,epoch:c.epoch,requestId:`turn${i}`,question:`Q${i}`,answer:'An answer'});}
assert.equal((await store.load(7)).chats.length,20,'bounded local history');

const {QuestionRunner,parseAnswer,questionPrompt}=globalThis.IzukiQuestionRunner;
const source={id:1,windowId:7,url:'https://course.example/quiz'},q={id:'q1',stem:'Which is a network of infected devices?',options:['Firewall','Botnet'],multiple:false,url:source.url};
assert.deepEqual(parseAnswer('```json\n{"questionId":"q1","choices":[2],"reason":"Network of bots"}\n```',q).choices,[2]);
for(const text of ['B','{"questionId":"old","choices":[2]}','{"questionId":"q1","choices":[0]}','{"questionId":"q1","choices":[]}','{"questionId":"q1","choices":[1,2]}'])assert.throws(()=>parseAnswer(text,q));
assert(questionPrompt(q).includes('questionId'));
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
// Explain each question; never answer the page. The fixture still offers
// select/advance so that if the runner ever asks for them again, the test
// sees it rather than the call silently doing nothing.
const q2={...q,id:'q2',stem:'Which blocks unwanted traffic?'};
const onPage=question=>({ok:true,state:'question',question}),complete={ok:true,state:'complete'};
function quizFixture(pages,extra={}) {
  const calls=[];let i=0;
  const adapter={install:async()=>{},stop:async()=>calls.push('stop'),
    read:async()=>pages[Math.min(i++,pages.length-1)],
    answer:async(run,question)=>{calls.push(['answer',question.id]);return {text:JSON.stringify({questionId:question.id,choices:[2],reason:'Bots'})};},
    record:async()=>calls.push('record'),
    select:async()=>{calls.push('select');return {ok:true};},advance:async()=>{calls.push('advance');return {ok:true};},...extra};
  const runner=new QuestionRunner(adapter);return {runner,calls,start:()=>{runner.start({source,windowId:7});return runner.current?.done;}};
}
const asked=f=>f.calls.filter(c=>Array.isArray(c)&&c[0]==='answer').map(c=>c[1]);
const clicked=f=>f.calls.filter(c=>c==='select'||c==='advance');

// Two questions, the student moving between them, then the summary page.
let f=quizFixture([onPage(q),onPage(q2),complete]);await f.start();
assert.equal(f.runner.status().phase,'complete');
assert.deepEqual(asked(f),['q1','q2'],'each question is explained once');
assert.deepEqual(clicked(f),[],'nothing on the page is ever selected or advanced');
assert.match(f.runner.status().answer||'',/^Suggested: Botnet — Bots/,'the suggestion names the option and says why');

// The student hasn't moved on yet: the same question is not asked about twice.
f=quizFixture([onPage(q),onPage(q),complete]);await f.start();
assert.deepEqual(asked(f),['q1'],'a question still on the page is not asked again');
assert.deepEqual(clicked(f),[]);

// An answer that isn't the JSON shape is still shown, not treated as failure.
f=quizFixture([onPage(q),complete],{answer:async()=>({text:'I think B, because a botnet is a network of infected machines.'})});await f.start();
assert.equal(f.runner.status().phase,'complete');
assert.deepEqual(clicked(f),[]);

// Stopped while the assistant is answering: nothing recorded, nothing clicked.
let finish;f=quizFixture([onPage(q),complete],{answer:()=>new Promise(resolve=>finish=resolve)});const done=f.start();await flush();f.runner.stop();
finish({text:JSON.stringify({questionId:'q1',choices:[2]})});await done;
assert.equal(f.runner.status().phase,'stopped');assert(!f.calls.includes('record'),'a stopped run records nothing');assert.deepEqual(clicked(f),[]);

// A question that is only a picture: said so, not guessed at.
f=quizFixture([onPage({...q,missingImage:true}),complete]);await f.start();
assert.deepEqual(asked(f),[],'a picture-only question is not sent to the assistant');

// The page reader itself refuses to click, whoever asks.
await import('../extension/question-page.js');
const readPage=globalThis.IzukiQuestionPage;
assert.equal(typeof readPage,'function','the page reader must load, or this check proves nothing');
{
  for(const op of ['select','advance']){
    // Called with no page at all: a refusal has to come before any page
    // access. (An earlier version of this check passed only because the
    // call crashed on the missing page — which proved nothing.)
    const out=await readPage(op,{});
    assert.equal(out?.ok,false,`the page reader must refuse "${op}"`);
    assert.match(out.text,/never|doesn't choose or submit/i,`"${op}" must be refused, not merely fail`);
  }
}

const {parseLabPlan,coverage,LabRunner,labPrompt}=globalThis.IzukiLabState;
const raw={title:'Network lab',requirements:['Create the report','Verify its saved contents'],steps:[
  {title:'Inspect',action:'Open the provided project and read its requirements.',check:'The project filename and required sections are visible.',requirements:[1]},
  {title:'Save report',action:'Save the edited report as network-lab.docx.',check:'Reopen network-lab.docx and check the required sections.',requirements:[1,2]},
  {title:'Upload',action:'Upload network-lab.docx to the course.',check:'The expected filename appears in the submission preview.',requirements:[],final:true}],deliverables:[{name:'network-lab.docx',step:2}]};
const plan=parseLabPlan(JSON.stringify(raw));assert(plan.steps.every(s=>s.instruction.length<=400));assert(plan.steps[2].final);
assert.throws(()=>parseLabPlan(JSON.stringify({...raw,requirements:[...raw.requirements,'Unmapped rubric']})));
assert.throws(()=>parseLabPlan(JSON.stringify({...raw,steps:[{...raw.steps[0],action:'x'.repeat(241)}]})));
assert.throws(()=>parseLabPlan(JSON.stringify({...raw,deliverables:[{name:'report',step:30}]})));
assert.deepEqual(coverage(plan,{'step-1':{phase:'verified'}}).requirements,[false,false],'a requirement covered by two steps needs both checks');
assert(labPrompt('Rubric').includes('Do not claim work has been performed'));
let actions=[],outcomes=['verified','partial'];
const runner=new LabRunner({runStep:async(run,step)=>{actions.push(step.id);return {state:'finished',outcome:outcomes.shift()||'verified',text:'Fixture evidence'};},stop:async()=>{}});
runner.start({plan,source,windowId:7});await runner.current.done;
assert.deepEqual(actions,['step-1','step-2']);assert.equal(runner.status().phase,'review','unverified step must stop later steps');
assert.equal(runner.status().coverage.deliverables[0],false,'promise of a file is not a checked deliverable');
runner.start({plan,source,windowId:7,resume:true});await runner.current.done;
assert.deepEqual(actions,['step-1','step-2','step-2'],'resume skips previously verified steps');assert.equal(runner.status().phase,'review','upload requires per-run permission');
// Even asked outright, a run never does the hand-in step.
runner.start({plan,source,windowId:7,resume:true,allowSubmit:true});await runner.current?.done;assert.equal(runner.status().phase,'review','the hand-in step always stays with the student');assert.notEqual(actions.at(-1),'step-3','the submit step never ran');
let resolveStep,resolveStop;const stopped=new LabRunner({runStep:()=>new Promise(resolve=>resolveStep=resolve),stop:()=>new Promise(resolve=>resolveStop=resolve)});
stopped.start({plan,source,windowId:7});await flush();const stopping=stopped.current.done;stopped.stop();assert.throws(()=>stopped.start({plan,source,windowId:7}),/already running/);
resolveStep({state:'finished',outcome:'verified',text:'Late result'});await stopping;assert.equal(stopped.status().steps['step-1'].phase,'running','late result cannot manufacture a verified check');
resolveStop();await flush();assert.equal(stopped.status().phase,'review');

// The panel's own "start a quiz run / plan a lab" commands: the verb has to
// be aimed at the quiz or lab, and ordinary questions stay questions.
// Patterns are read from workspace-ui.js itself so the test can't drift from
// the code (a hand-copied version once "passed" while matching nothing).
{
  const {readFileSync}=await import('node:fs');
  const ui=readFileSync('extension/workspace-ui.js','utf8');
  const grab=name=>{const m=ui.match(new RegExp('const '+name+'=(.*);\\n'));assert(m,`${name} not found in workspace-ui.js`);return m[1];};
  const BETWEEN=eval(grab('BETWEEN')),NOT_COMPOUND=eval(grab('NOT_COMPOUND'));
  void BETWEEN;void NOT_COMPOUND;
  const QUIZ=eval(grab('QUIZ_RUN')),LAB=eval(grab('LAB_RUN'));
  for(const s of ['answer all these questions','do this quiz','complete the practice test','answer these quiz questions'])assert(QUIZ.test(s),`starts a quiz run: ${s}`);
  for(const s of ['do I need to complete all the test cases?','answer this test question about DNS'])assert(!QUIZ.test(s),`a question, not a quiz run: ${s}`);
  for(const s of ['plan this lab','do my lab','complete chapter 5 lab'])assert(LAB.test(s),`plans a lab: ${s}`);
  for(const s of ['help me understand this lab report','what does the lab safety section say, can you help'])assert(!LAB.test(s),`a question, not a lab plan: ${s}`);
}

// The hand-in step is the student's every time, however it's worded and
// whatever the AI or the checkbox says. The first guard only read the start of
// an instruction and trusted the AI's flag, so "go to the course page and
// upload report.docx" with final:false would have run.
{
  const {handsIn}=globalThis.IzukiLabState;
  for(const instruction of ['Go to the course page and upload report.docx\nVerify: listed','Open Blackboard, then press Submit\nVerify: done',
    'Send my report to the instructor\nVerify: sent','Turn it in on Canvas\nVerify: done','Attach report.docx to the assignment\nVerify: attached']){
    assert.equal(handsIn({final:false,instruction}),true,`a hand-in, whatever the flag says: ${instruction.split('\n')[0]}`);
  }
  for(const instruction of ['Open report.docx in Word\nVerify: the Submit button is visible','Download the project files\nVerify: zip saved','Write the summary\nVerify: 150 words']){
    assert.equal(handsIn({instruction}),false,`ordinary work: ${instruction.split('\n')[0]}`);
  }
  // A plan whose upload step came back final:false (the AI's flag, or the
  // student unticking "uploads or submits") still stops before it.
  const ran=[];
  const handIn=new LabRunner({runStep:async(run,step)=>{ran.push(step.id);return {state:'finished',outcome:'verified',text:'ok'};},stop:async()=>{}});
  const sneaky={...plan,steps:[plan.steps[0],{...plan.steps[0],id:'step-x',title:'Hand in',instruction:'Go to the course page and upload report.docx\nVerify: listed',final:false}]};
  handIn.start({plan:sneaky,source,windowId:7});await handIn.current?.done;
  assert.equal(handIn.status().phase,'review','stops before the hand-in');
  assert(!ran.includes('step-x'),'the upload step never ran');
}

// Stop can't be confirmed (the app closed mid-step). It used to leave the
// runner holding the run forever while hiding Stop: every later start said
// "already running" with no way out. Now it says so, Stop stays, and a second
// Stop once the app is back frees the runner.
{
  let attempt=0,release;
  const stuck=new LabRunner({runStep:()=>new Promise(resolve=>release=resolve),
    stop:()=>++attempt===1?Promise.reject(Error('Open or update Izuki on this PC, then try again.')):Promise.resolve()});
  stuck.start({plan,source,windowId:7});await flush();
  stuck.stop();await flush();await flush();
  assert.equal(stuck.status().phase,'stop-failed','a stop that could not be confirmed says so');
  assert.match(stuck.status().text,/Press Stop again/,'and says what to do');
  assert.throws(()=>stuck.start({plan,source,windowId:7}),/already running/,'no new step while the old one may still be running');
  stuck.stop();await flush();await flush();
  assert.equal(stuck.status().phase,'review','the second Stop goes through');
  release?.({state:'finished',outcome:'verified',text:'late'});await flush();
  assert.doesNotThrow(()=>stuck.start({plan,source,windowId:7}),'and the runner is free again');
  stuck.stop();
}
console.log('workspace: history concurrency/dedupe/clear/bounds, explain-only question runs (nothing clicked), Stop, rubric coverage, verified-only lab progression, resume and confirmed stop pass.');
