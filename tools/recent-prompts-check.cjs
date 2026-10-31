// Two independent webviews sharing browser storage. No owner's history is read.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/lib/recentPrompts.ts','utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const disk = new Map(), windows = [];
function view() {
  const handlers = {};
  const storage = {
    getItem:key=>disk.get(key)??null,
    setItem(key,value) {
      if (storage.fail) throw Error('quota');
      disk.set(key,value);
      for(const other of windows) if(other.storage!==storage) other.handlers.storage?.({key,storageArea:other.storage});
    },
    fail:false
  };
  const module = {exports:{}};
  vm.runInNewContext(source,{module,exports:module.exports,localStorage:storage,window:{addEventListener:(name,fn)=>handlers[name]=fn}});
  const result = {api:module.exports,handlers,storage};
  windows.push(result); return result;
}
const main=view(), floating=view();
let shown=[];
floating.api.onRecentPrompts(list=>shown=Array.from(list));
const code='Explain this:\n\nfunction hello() {\n  return "a  b";\n}';
main.api.rememberPrompt(code);
assert.deepEqual(shown,[code],'the floating window must notice a main-window prompt');
floating.api.rememberPrompt('A follow-up');
main.api.rememberPrompt('Another question');
assert.deepEqual(Array.from(main.api.recentPrompts()),['Another question','A follow-up',code],'writes cannot overwrite another window with a stale cache');
main.api.rememberPrompt(code);
assert.equal(main.api.recentPrompts().length,3,'a repeated prompt should move, not duplicate');
assert.equal(main.api.recentPrompts()[0],code,'recall must preserve indentation, newlines and repeated spaces');
floating.api.forgetPrompt(code);
assert(!main.api.recentPrompts().includes(code));
main.api.clearPrompts(); assert.deepEqual(shown,[],'Clear all must reach the other window');
for(let i=0;i<12;i++) main.api.rememberPrompt('Question '+i);
assert.equal(main.api.recentPrompts().length,8);
main.api.rememberPrompt('x'.repeat(4001)); assert.equal(main.api.recentPrompts()[0],'Question 11');
main.storage.fail=true;
main.api.rememberPrompt('Session only'); main.api.rememberPrompt('Next session prompt');
assert.deepEqual(Array.from(main.api.recentPrompts()).slice(0,2),['Next session prompt','Session only'],'quota errors must keep the in-memory shelf');
main.storage.fail=false;
main.api.clearPrompts();
disk.set('izk.recentPrompts',JSON.stringify([null,7,'','a','a','x'.repeat(4001),'b']));
assert.deepEqual(Array.from(view().api.recentPrompts()),['a','b'],'validate restored storage');
console.log('Recent prompts: formatting, cross-window updates/removal/clear, stale writes, bounds and storage failure pass.');
