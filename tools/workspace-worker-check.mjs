import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const event=()=>({listeners:[],addListener(fn){this.listeners.push(fn);}}),stored={local:{},session:{}},calls=[];
const storage=area=>({get:async key=>Object.fromEntries((Array.isArray(key)?key:[key]).map(k=>[k,structuredClone(stored[area][k])])),set:async value=>Object.assign(stored[area],structuredClone(value))});
const tab={id:1,windowId:7,url:'https://course.example/lab',title:'Lab',active:true};
const question={id:'fixture-q',stem:'Which option describes a network of infected devices?',options:['Firewall','Botnet'],multiple:false,url:tab.url};
const question2={...question,id:'fixture-q2',stem:'Which option blocks unwanted traffic?'};
let studentDone=false,onPage2=false,lateAnswer=null,holdAnswer=false,nativeOutcome='verified',appClosed=false,closeAfterFirstStep=false;
const chrome={runtime:{id:'test-extension',getURL:path=>'chrome-extension://test-extension/'+path,onMessage:event()},
  storage:{local:storage('local'),session:storage('session')},action:{setBadgeText:async()=>{}},commands:{onCommand:event()},
  windows:{onRemoved:event(),get:async()=>({id:7,type:'normal'}),create:async args=>{calls.push(['popup',args]);return {id:77};},update:async()=>({id:77}),remove:async id=>calls.push(['close',id])},
  tabs:{get:async id=>{if(id!==1)throw Error('closed');return {...tab};},update:async(id,args)=>{calls.push(['activate',id,args]);return {...tab};}},
  scripting:{executeScript:async({func,args})=>{
    assert.equal(func.name,'questionPage');const [op,options]=args;calls.push(['page',op,options]);
    if(op==='install'||op==='stop')return [{result:{ok:true}}];
    // The student answering and finishing is what moves this page on now.
    if(op==='read')return [{result:studentDone?{ok:true,state:'complete'}:{ok:true,state:'question',question:onPage2?question2:question}}];
    return [{result:{ok:true}}];
  }},
};
const ctx=vm.createContext({chrome,console,crypto:webcrypto,structuredClone,AbortController,AbortSignal,DOMException,URL,setTimeout,clearTimeout,
  IzukiProviderRelay:{ask:async(connection,prompt,id)=>{calls.push(['relay',connection,id]);if(holdAnswer)return new Promise(resolve=>lateAnswer=resolve);return {text:JSON.stringify({questionId:question.id,choices:[2],reason:'Bots'})};},cancel:id=>calls.push(['cancelRelay',id])},
  fetch:async(url,options)=>{
    const body=JSON.parse(options.body);calls.push(['native',new URL(url).pathname,body]);
    if(appClosed&&url.includes('/side/'))throw new TypeError('Failed to fetch');
    let value={ok:true};
    if(url.endsWith('/side/prepare'))value.reviewToken='reviewed-token';
    if(url.endsWith('/side/status')){value={ok:true,state:'finished',outcome:nativeOutcome,text:'Actual fixture check result.'};if(closeAfterFirstStep){closeAfterFirstStep=false;appClosed=true;}}
    if(url.endsWith('/ask'))value.text=JSON.stringify({questionId:question.id,choices:[2],reason:'Bots'});
    return {ok:true,json:async()=>value};
  }});
for(const name of ['workspace-state','question-page','question-runner','lab-state','workspace-worker'])vm.runInContext(fs.readFileSync(new URL(`../extension/${name}.js`,import.meta.url),'utf8'),ctx,{filename:name});
const panel={id:'test-extension',url:'chrome-extension://test-extension/sidepanel.html',tab:{id:33}},site={id:'test-extension',url:tab.url,tab};
const request=(body,sender=panel)=>new Promise((resolve,reject)=>{
  const listener=chrome.runtime.onMessage.listeners[0];assert.equal(listener({izukiWorkspace:{windowId:7,...body}},sender,resolve),true);
  setTimeout(()=>reject(Error('Worker response timed out')),2000).unref();
});
const until=async check=>{for(let n=0;n<100;n++){const value=await check();if(value)return value;await new Promise(r=>setTimeout(r,5));}throw Error('Worker did not reach expected state');};
assert.equal((await request({op:'quizStart',source:tab},site)).ok,false,'webpage content cannot start actions');
assert.equal((await request({op:'history'},site)).ok,false,'content scripts cannot read saved chats');
assert.equal((await request({op:'history'},{...panel,url:panel.url+'.spoof'})).ok,false,'require the exact extension page path');
let result=await request({op:'quizStart',source:tab,connection:{providerId:'any',ready:true,tabId:2}});assert.equal(result.ok,true);
await until(async()=>((await request({op:'status'})).quiz.phase==='suggested'));
assert.match((await request({op:'status'})).quiz.answer,/^Suggested: /,'the panel shows the suggested answer');
assert.equal(calls.filter(c=>c[0]==='page'&&(c[1]==='select'||c[1]==='advance')).length,0,'nothing on the quiz page is clicked');
// The student clicks Next on a quiz where each question has its own address
// (Moodle's ?page=N): the run follows them and explains the new question,
// rather than reading the new address as "the page changed" and pausing.
const firstUrl=tab.url;tab.url=firstUrl+'?page=2';onPage2=true;
await until(async()=>((await request({op:'status'})).quiz.count===2));
assert.equal((await request({op:'status'})).quiz.phase,'suggested','following the student to the next page keeps the run going');
assert.equal(calls.filter(c=>c[0]==='relay').length,2,'the second question was explained');
assert.equal(calls.filter(c=>c[0]==='page'&&(c[1]==='select'||c[1]==='advance')).length,0,'and still nothing was clicked');
tab.url=firstUrl;onPage2=false;
studentDone=true;await until(async()=>((await request({op:'status'})).quiz.phase==='complete'));
assert.equal((await request({op:'history'})).chats.length,1);
studentDone=false;holdAnswer=true;
result=await request({op:'quizStart',source:tab,connection:{providerId:'any',ready:true,tabId:2}});
await until(()=>lateAnswer);const id=result.state.id;
assert.equal((await request({op:'stop',kind:'lab',runId:id},site)).ok,false,'a source page cannot stop unrelated desktop tasks');
assert.equal((await request({op:'stop',runId:id},site)).ok,true);
lateAnswer({text:JSON.stringify({questionId:question.id,choices:[2]})});await new Promise(r=>setTimeout(r,10));
assert.equal(calls.filter(c=>c[0]==='page'&&(c[1]==='select'||c[1]==='advance')).length,0,'a late reply after Escape clicks nothing');
assert.equal((await request({op:'history'})).chats.length,1,'a late reply after Escape records nothing');
const plan={title:'Lab',requirements:['Inspect the report'],steps:[{id:'step-1',title:'Inspect',instruction:'Open report.docx.\nVerify: The required headings exist.',requirements:[1],final:false}],deliverables:[{name:'report.docx',step:1}]};
const count=calls.filter(c=>c[0]==='native'&&c[1].endsWith('/side/run')).length;
result=await request({op:'labStart',source:tab,plan});assert.equal(result.ok,true);
await until(async()=>((await request({op:'status'})).lab.phase==='complete'));
const prepare=calls.filter(c=>c[0]==='native'&&c[1].endsWith('/side/prepare')).at(-1),run=calls.filter(c=>c[0]==='native'&&c[1].endsWith('/side/run')).at(-1);
assert.equal(prepare[2].prompt,plan.steps[0].instruction);assert.equal(run[2].reviewToken,'reviewed-token');assert.equal(prepare[2].requestId,run[2].requestId);
assert.equal(calls.filter(c=>c[0]==='native'&&c[1].endsWith('/side/run')).length,count+1);
nativeOutcome='completed';result=await request({op:'labStart',source:tab,plan});assert.equal(result.ok,true);
await until(async()=>((await request({op:'status'})).lab.phase==='review'));
assert.equal((await request({op:'status'})).lab.coverage.deliverables[0],false,'native completed without verified evidence stays unchecked');
// Step 1 runs, then Izuki closes before step 2 can reach it. Step 2 never
// started, so nothing can be moving the desktop: the lock must go, or
// every later lab and quiz run is refused until the extension restarts.
// ("Started" used to belong to the whole run, so step 1 kept it set.)
{
  nativeOutcome='verified';closeAfterFirstStep=true;
  const two={...plan,requirements:['Inspect','Check'],steps:[plan.steps[0],{...plan.steps[0],id:'step-2',title:'Check',requirements:[2]}],deliverables:[]};
  result=await request({op:'labStart',source:tab,plan:two});assert.equal(result.ok,true);
  await until(async()=>!['starting','running'].includes((await request({op:'status'})).lab.phase));
  appClosed=false;
  const after=await request({op:'quizStart',source:tab,connection:{providerId:'any',ready:true,tabId:2}});
  assert.equal(after.ok,true,`a step that never reached the app must not leave the lock set: ${after.text||''}`);
  await request({op:'stop',kind:'quiz'});
}
await request({op:'float'});await request({op:'float'});assert.equal(calls.filter(c=>c[0]==='popup').length,1,'floating twice must focus the existing window');
await request({op:'dock'});assert.deepEqual(calls.filter(c=>c[0]==='close').at(-1),['close',77],'dock may close only its own popup');
console.log('workspace worker: trusted extension sender, source-only Stop, late provider cancellation, one history, exact reviewed native token handoff, verified outcomes and popup reuse pass.');
