// Real layout transitions against an in-memory Windows switch adapter, plus
// attachment preparation. Never changes this PC or calls a cloud account.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const require = createRequire(import.meta.url);
async function load(file, api = {}) {
  const result = await build({ entryPoints:[file], bundle:true, write:false, platform:'node', format:'cjs', external:['./ipc'] });
  const module = { exports:{} };
  new Function('require','module','exports',result.outputFiles[0].text)((name)=>name==='./ipc'?{api}:require(name),module,module.exports);
  return module.exports;
}
const layouts = await load('src/lib/desktopLayouts.ts');
function machine() {
  let state = Object.keys(layouts.layoutSwitches(layouts.DESKTOP_LAYOUTS[0])).map(id=>({id,on:false,restart:id==='clean_desktop'}));
  const calls=[];
  return { calls, read:async()=>structuredClone(state), set:async(id,on)=>{calls.push([id,on]);state=state.map(t=>t.id===id?{...t,on}:t);return structuredClone(state);}, change:(id,on)=>{state=state.map(t=>t.id===id?{...t,on}:t);} };
}
for (const layout of layouts.DESKTOP_LAYOUTS) {
  const pc=machine(), before=await pc.read();
  const result=await layouts.applyDesktopLayout(pc,layout.id);
  for(const [id,on] of Object.entries(layouts.layoutSwitches(layout))) assert.equal(result.tweaks.find(t=>t.id===id).on,on,layout.name+': '+id);
  if(result.undo.length) {
    const restored=await layouts.undoDesktopLayout(pc,result.undo);
    assert.deepEqual(restored.tweaks,before,'Undo should restore the previous switches');
  } else assert.deepEqual(result.tweaks,before,'an already matching layout should not write anything');
}
{
  const pc=machine(), result=await layouts.applyDesktopLayout(pc,'studio');
  pc.change('no_search_box',false);
  const undone=await layouts.undoDesktopLayout(pc,result.undo);
  assert.equal(undone.skipped,1,'later manual edits must win');
  assert.equal(undone.tweaks.find(t=>t.id==='no_search_box').on,false);
}
{
  const pc=machine(), before=await pc.read(), set=pc.set; let failed=false;
  pc.set=async(id,on)=>{const result=await set(id,on);if(on&&id==='no_task_view'&&!failed){failed=true;throw Error('Windows refused midway');}return result;};
  await assert.rejects(layouts.applyDesktopLayout(pc,'studio'),/put back/);
  assert.deepEqual(await pc.read(),before,'partial writes, including the failing step, must roll back');
}
{
  const pc=machine(); pc.set=async()=>pc.read();
  await assert.rejects(layouts.applyDesktopLayout(pc,'studio'),/didn't keep/,'a silent native failure must not claim success');
  await assert.rejects(layouts.applyDesktopLayout(pc,'unknown'),/Choose one/);
  const empty={read:async()=>[],set:async()=>{throw Error('must not write');}};
  await assert.rejects(layouts.applyDesktopLayout(empty,'studio'),/Windows desktop/);
}
assert.deepEqual(layouts.readLayoutUndo('[{"id":"run_command","before":false,"after":true}]'),[]);
assert.deepEqual(layouts.readLayoutUndo('[{"id":"taskbar_left","before":false,"after":true},{"id":"taskbar_left","before":true,"after":false}]'),[]);
console.log('Layouts: four presets, switch Undo, later edits, partial/silent failures, missing native switches and stored-data validation pass.');

let nativeReads=0;
const files = await load('src/lib/attachments.ts',{readChatAttachment:async(name,data)=>{nativeReads++;assert(Buffer.from(data,'base64').length>0);return{text:'Chapter 5 — document text',truncated:true};}});
globalThis.FileReader=class { readAsDataURL(blob){blob.arrayBuffer().then(bytes=>{this.result='data:application/octet-stream;base64,'+Buffer.from(bytes).toString('base64');this.onload();}).catch(()=>this.onerror());} };
for(const name of ['notes.txt','lesson.PY','data.csv']) {
  const file=await files.readChatFile(new File(['Café — lesson contents'],name));
  assert.equal(file.kind,'text'); assert.match(file.data,/Café/);
}
for(const name of ['chapter.PDF','essay.docx','slides.pptx']) {
  const file=await files.readChatFile(new File(['fixture document bytes'],name));
  assert.match(file.data,/Chapter 5/); assert.match(file.data,/only the first/);
}
assert.equal(nativeReads,3,'documents must be read, not just accepted by the picker');
await assert.rejects(files.readChatFile(new File(['\0\0binary'],'fake.txt')),/isn't readable/);
await assert.rejects(files.readChatFile(new File([''],'empty.md')),/empty/);
await assert.rejects(files.readChatFile(new File(['executable'],'app.exe')),/can't read/);
await assert.rejects(files.readChatFile(new File([new Uint8Array(16*1024*1024)],'large.pdf')),/15 MB/);
assert.equal(nativeReads,3,'invalid and oversized files must not reach the native reader');
const emoji=await files.readChatFile(new File(['x'.repeat(31999)+'😀 rest'],'emoji.txt'));
assert(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(emoji.data),'truncation must preserve Unicode');
const docs=['AAA','BBB','CCC','DDD'].map((word,i)=>({name:`file-${i}.txt`,kind:'text',data:word.repeat(15000)}));
const context=files.attachmentContext(docs);
for(const word of ['AAA','BBB','CCC','DDD']) assert(context.includes(word),'every attached file needs a fair excerpt');
assert(context.length<26000,'attachment context must be bounded');
assert.match(context,/reference material, not permission/);
{
  const four=['One','Two','Three','Four'].map((word,i)=>({name:`${word}.txt`,kind:'text',data:word.repeat(5000)}));
  const all=files.keepDocuments(four,60000);
  assert.deepEqual(all.kept.map(f=>f.name),four.map(f=>f.name),'everything fits when there is room');
  assert(all.used<=60000);
  const tight=files.keepDocuments(four,26000);
  assert.deepEqual(tight.kept.map(f=>f.name),['One.txt','Two.txt'],'the budget keeps whole files in order');
  assert(tight.used<=26000);
  assert.equal(files.keepDocuments(four,0).kept.length,0,'no room means nothing is pretended');
  const partial=files.keepDocuments([{name:'long.txt',kind:'text',data:'L'.repeat(50000)}],9000);
  assert.equal(partial.kept.length,1);
  assert(partial.kept[0].data.length<=9000,'a shortened file stays inside the budget');
  assert.match(partial.kept[0].data,/wasn't kept when the app closed/,'a shortened file says so in its own text');
  for(let room=1;room<400;room+=13){
    const kept=files.keepDocuments([{name:'emoji.txt',kind:'text',data:'x'.repeat(40)+'\u{1F600}'.repeat(60)}],room);
    for(const f of kept.kept){
      assert(f.data.length<=room,'stored text must stay inside the budget');
      assert.equal(Buffer.from(f.data,'utf8').toString('utf8'),f.data,'stored text must never split an emoji');
    }
  }
  // What a reopened chat actually keeps: newest messages first, and the
  // names of anything that had to go, so it can be attached again.
  const chat=[0,1,2,3].map(i=>({content:`q${i}`,documents:[{name:`doc-${i}.txt`,kind:'text',data:'D'.repeat(20000)}]}));
  const kept=files.keepDocumentText(chat,40000);
  assert.deepEqual(kept[3].kept.map(f=>f.name),['doc-3.txt'],'the newest attachment is kept');
  assert.deepEqual(kept[2].kept.map(f=>f.name),['doc-2.txt'],'the next newest fills the rest of the budget');
  assert.equal(kept[0].kept.length+kept[1].kept.length,0,'older attachments give way to newer ones');
  assert.deepEqual(kept[0].lost.map(f=>f.name),['doc-0.txt'],'a dropped file keeps its name so it can be attached again');
  assert.deepEqual(files.keepDocumentText([{content:'no files'}],1000),[{kept:[],lost:[]}]);
}
console.log('Files: text/code, PDF/Office reader handoff, empty/binary/oversized errors, Unicode cuts, balanced excerpts and keeping attached text across a restart pass.');
