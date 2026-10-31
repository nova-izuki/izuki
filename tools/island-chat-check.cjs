// Browser integration test against actual React components. Uses its own dev
// server/cache, or IZUKI_TEST_ORIGIN for an already-running local server.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { closeTestBrowser } = require('./browser-cleanup.cjs');
const root = path.resolve(__dirname, '..');
let origin = process.env.IZUKI_TEST_ORIGIN;
const edge = process.env.IZUKI_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let browser, ws, profile, server, cacheDir;
(async () => {
  if (!origin) {
    const { createServer } = await import('vite');
    // A fresh dependency cache every run. A leftover cache from an older run
    // served a mismatched react-dom chunk ("does not provide an export named
    // 't'"), so the fixture never mounted and every wait timed out. The entry
    // needs forward slashes too: Vite's dependency scanner skipped a Windows
    // path, then re-optimised mid-load and reloaded the page under the test.
    fs.mkdirSync(path.join(root, '.work'), {recursive:true});
    cacheDir = fs.mkdtempSync(path.join(root,'.work','vite-island-'));
    server = await createServer({ configFile:path.join(root,'vite.config.ts'), cacheDir, optimizeDeps:{force:true,entries:['island-chat.html','style-files.html','recent-prompts.html'].map(name=>path.join(root,'tools/fixtures',name).split(path.sep).join('/'))}, server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false} });
    await server.listen(); origin=server.resolvedUrls.local[0].replace(/\/$/,'');
  }
  profile = fs.mkdtempSync(path.join(root, '.work', 'island-browser-'));
  browser = spawn(edge, ['--headless=new','--disable-gpu','--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {windowsHide:true,stdio:'ignore'});
  const portFile = path.join(profile,'DevToolsActivePort');
  for(let i=0;i<240&&!fs.existsSync(portFile);i++) await pause(250);
  assert(fs.existsSync(portFile),'Edge did not start');
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0].trim();
  const page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let seq=0;const pending=new Map(),errors=[];
  ws.onmessage=(event)=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description||'').join(' ').slice(0,1000));if(m.method==='Network.loadingFailed')errors.push(m.params.errorText);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  const call=(method,params={},timeout=30000)=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error(`${method} timed out`));},timeout);pending.set(id,(m)=>{clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve(m.result);});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async(expression)=>{let r;try{r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});}catch(e){throw Error(`${e.message}: ${expression.slice(0,180)}`);}if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  // While Vite optimises dependencies the renderer can be busy, and
  // Runtime.evaluate times out instead of answering. That is a slow page, so
  // keep polling to the deadline rather than failing on the first timeout.
  const wait=async(expression)=>{const until=Date.now()+180000;let last=null;while(Date.now()<until){try{if(await evaluate(`Boolean(${expression})`))return;}catch(e){if(/SyntaxError|not a valid selector/.test(e.message))throw e;last=e;}await pause(150);}throw Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}\n${errors.join('\n')}`);};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:origin+'/tools/fixtures/island-chat.html'},90000);
  await wait('window.testReady && document.querySelector("#izuki-island-chat-dock input:not([type=file])")');
  console.log('Island fixture ready.');
  const send=async(text)=>{
    await evaluate(`(()=>{const input=document.querySelector('#izuki-island-chat-dock input:not([type=file])')||document.querySelector('section[aria-label="Island chat window"] input:not([type=file])');input.focus();})()`);
    await call('Input.insertText',{text});
    await pause(80);
    // Chrome only fires the input's implicit form submission when the key
    // event carries the printable text and native code, so send both.
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:String.fromCharCode(13)});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  };
  await send('First test question');
  await wait('window.testCalls.asks.length===1');
  console.log('First question started.');
  await evaluate(`window.originalInput=document.querySelector('#izuki-island-chat-dock input:not([type=file])');[...document.querySelectorAll('button')].find(b=>b.textContent==='Pop out').click()`);
  await wait(`document.querySelector('section[aria-label="Island chat window"] input:not([type=file])')`);
  assert(await evaluate(`window.originalInput===document.querySelector('section[aria-label="Island chat window"] input:not([type=file])')`),'detaching remounted chat');
  console.log('Detached the live conversation.');
  assert.equal(await evaluate(`localStorage.getItem('izuki.island-chats.v1')`),null,'incomplete answers should not create history');
  await evaluate('window.finishAsk()');
  await wait(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')||'[]').length===1`);
  const id=await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1'))[0].id`);
  await evaluate(`document.querySelector('[aria-label="Dock in Island"]').click()`);
  await wait(`window.originalInput===document.querySelector('#izuki-island-chat-dock input:not([type=file])')`);
  await send('Follow-up test question');
  await wait('window.testCalls.asks.length===2');
  await evaluate('window.finishAsk()');
  await wait(`JSON.parse(localStorage.getItem('izuki.island-chats.v1'))[0].turns.length===4`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length`),1,'follow-up spammed history');
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1'))[0].id`),id);
  assert.equal(await evaluate('window.testCalls.config'),0,'Island chat opened main app');
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue in Chat')).click()`);
  await wait(`document.querySelector('section[aria-label="Island chat window"]')`);
  await evaluate(`document.querySelector('[aria-label="Minimize Island chat"]').click()`);
  await wait(`document.querySelector('[aria-label="Open Island chat bubble"]')`);
  const box=await evaluate(`(()=>{const r=document.querySelector('[aria-label="Open Island chat bubble"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:box.x,y:box.y,button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:box.x,y:box.y,button:'left',clickCount:1});
  await wait(`document.querySelector('section[aria-label="Island chat window"]')`);
  await evaluate(`document.querySelector('[aria-label="Close and return to Island"]').click()`);
  await wait(`document.querySelector('#izuki-island-chat-dock input:not([type=file])') && !document.querySelector('section[aria-label="Island chat window"]')`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length`),1);
  await call('Page.reload');
  await wait(`document.body.innerText.includes('Follow-up test question')`);
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length`),1,'reopening duplicated history');
  await wait(`document.querySelector('[aria-label="Conversation transcript"]')`);
  const scrolling=await evaluate(`(()=>{const node=document.querySelector('[aria-label="Conversation transcript"]');node.scrollTop=100;return {top:node.scrollTop,scroll:node.scrollHeight,height:node.clientHeight,hit:!!node.closest('[data-izk-hit]')}})()`);
  assert(scrolling.top>0&&scrolling.scroll>scrolling.height&&scrolling.hit,'transcript cannot scroll');
  await evaluate(`document.querySelector('[aria-label="All saved chats"]').click()`);
  await evaluate(`document.querySelector('[aria-label="Pin"]').click()`);
  await wait(`document.querySelector('[aria-label="Unpin"]')`);
  await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Clear all history');b.click();})()`);
  await pause(80);
  await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Tap again'));b.click();})()`);
  await wait(`JSON.parse(localStorage.getItem('izuki.island-chats.v1')).length===0`);
  assert.equal(await evaluate(`localStorage.getItem('izuki.island-active-chat.v1')`),null);
  assert.equal(errors.length,0,errors.join('\n'));
  fs.writeFileSync(path.join(root,'.work','island-chat-check.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  console.log('Browser checks passed: in-flight detachment without remount, docking, follow-ups, one history entry, bubble reopen, active-thread restore, transcript scrolling, clear history, no main-app navigation.');
  await call('Page.navigate',{url:origin+'/tools/fixtures/style-files.html'});
  await wait('window.fixtureReady && document.querySelector("#style-looks")');
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Layouts').click()`);
  await wait('document.querySelectorAll("[data-layout]").length===4');
  await evaluate(`document.querySelector('[data-layout="studio"]').click()`);
  await wait(`document.querySelector('[data-layout="studio"]').getAttribute('aria-pressed')==='true'`);
  assert.equal(await evaluate('window.fixtureCalls.auto.length+window.fixtureCalls.looks.length'),0,'layout changed the picture or daily rotation');
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Undo layout').click()`);
  await wait(`!document.querySelector('[data-layout="studio"]').disabled`);
  assert.equal(await evaluate(`document.querySelector('[data-layout="studio"]').getAttribute('aria-pressed')`),'false');
  await evaluate(`document.querySelector('#style-layouts [data-izk-section-toggle]').click()`);
  assert(!await evaluate(`document.querySelector('[data-layout="studio"]').checkVisibility()`),'flex styles kept the folded layout visible');
  await evaluate(`document.querySelector('#style-layouts [data-izk-section-toggle]').click()`);
  fs.writeFileSync(path.join(root,'.work','desktop-layouts-check.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Looks').click()`);
  await wait('document.querySelector("#style-looks")');
  const replacement=await evaluate(`document.querySelector('#style-looks [role="switch"]').getAttribute('aria-checked')`);
  assert.equal(replacement,'false','colour themes should keep the picture by default');
  await evaluate(`document.querySelector('#style-looks .izk-look').click()`);
  await wait('window.fixtureCalls.looks.length===1');
  assert.equal(await evaluate('window.fixtureCalls.looks[0][1]'),false,'theme replaced a picture without asking');
  await evaluate(`document.querySelector('[data-fixture-tab="chat"]').click()`);
  await wait('document.querySelector("textarea") && document.querySelector("input[type=file]")');
  await evaluate(`(()=>{const input=document.querySelector('input[type=file]'),files=new DataTransfer();files.items.add(new File(['fixture PDF bytes'],'chapter.pdf',{type:'application/pdf'}));files.items.add(new File(['const total = 42;'],'example.ts'));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await wait(`document.querySelector('[aria-label="Remove chapter.pdf"]') && document.querySelector('[aria-label="Remove example.ts"]')`);
  await evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Explain chapter 5');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await pause(100);
  await evaluate(`document.querySelector('[aria-label="Send"]').click()`);
  await wait('window.fixtureCalls.chats.length===1 && document.body.innerText.includes("Fixture answer complete.")');
  assert(await evaluate(`window.fixtureCalls.chats[0].at(-1).content.includes('Unique file words: chapter.pdf') && window.fixtureCalls.chats[0].at(-1).content.includes('const total = 42;')`),'the answer did not receive document/code contents');
  assert.equal(await evaluate('window.fixtureCalls.instant.length'),0,'chapter wording hijacked a document question');
  assert(await evaluate(`localStorage.getItem('izuki.chat.v1').includes('Unique file words')`),'saved document text was lost on restart');
  // Follow-up and retry state use clean(); the document must survive it in memory.
  await evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'What does that section mean?');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await pause(80);await evaluate(`document.querySelector('[aria-label="Send"]').click()`);
  await wait('window.fixtureCalls.chats.length===2 && document.querySelector("[aria-label=Send]")');
  assert(await evaluate(`window.fixtureCalls.chats[1].some(m=>m.content.includes('Unique file words: chapter.pdf'))`),'follow-up lost the attached document');
  await evaluate(`(()=>{const input=document.querySelector('input[type=file]'),files=new DataTransfer();files.items.add(new File(['MZ'],'app.exe',{type:'application/octet-stream'}));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await wait('document.querySelector("[role=alert]")');
  assert(await evaluate(`document.querySelector('[role=alert]').textContent.includes("can't read")`),'unsupported files were silently ignored');
  await evaluate(`window.holdChat=true;(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Explain the first section');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await pause(80);await evaluate(`document.querySelector('[aria-label="Send"]').click()`);
  await wait('window.fixtureCalls.held.length===1');
  await evaluate(`window.holdDocument=true;(()=>{const input=document.querySelector('input[type=file]'),files=new DataTransfer();files.items.add(new File(['%PDF-1.7'],'pending.pdf',{type:'application/pdf'}));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await wait('typeof window.finishDocument==="function"');
  await evaluate(`document.querySelector('textarea').focus()`);
  await call('Input.insertText',{text:'Wait for this file'});
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:String.fromCharCode(13)});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  await pause(120);
  assert.equal(await evaluate('window.fixtureCalls.chats.length'),3,'Enter while reading a PDF sent an incomplete replacement');
  assert.equal(await evaluate('document.querySelector("textarea").value'),'Wait for this file','Enter while reading cleared the correction');
  await evaluate('window.holdDocument=false;window.finishDocument()');
  await wait(`document.querySelector('[aria-label="Remove pending.pdf"]')`);
  await evaluate(`document.querySelector('[aria-label="Remove pending.pdf"]').click();(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  // Correct a running answer with a fresh file; Enter must cancel the old job,
  // start one replacement, retain the file, and ignore a late old answer.
  await evaluate(`(()=>{const input=document.querySelector('input[type=file]'),files=new DataTransfer();files.items.add(new File(['Correction = 99;'],'correction.ts'));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await wait(`document.querySelector('[aria-label="Remove correction.ts"]')`);
  await evaluate(`document.querySelector('textarea').focus()`);
  await call('Input.insertText',{text:'Use this correction instead'});
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:String.fromCharCode(13)});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  await wait('window.fixtureCalls.held.length===2');
  assert.equal(await evaluate('window.fixtureCalls.chats.length'),4,'correction sent more than once');
  assert(await evaluate('window.fixtureCalls.cancels.includes(window.fixtureCalls.held[0].id)'),'old job was not cancelled');
  assert(await evaluate(`window.fixtureCalls.chats.at(-1).at(-1).content.includes('Correction = 99;')`),'queued correction lost its file');
  await evaluate('window.fixtureCalls.held[0].done()');await pause(100);
  assert(await evaluate(`!!document.querySelector('[aria-label="Stop"]')`),'old job cleared the replacement busy state');
  await evaluate('window.holdChat=false;window.fixtureCalls.held[1].done()');
  await wait('document.querySelector("[aria-label=Send]")');
  await evaluate(`(()=>{const input=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'continue');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await pause(80);await evaluate(`document.querySelector('[aria-label="Send"]').click()`);
  await wait('window.fixtureCalls.chats.length===5 && document.querySelector("[aria-label=Send]")');
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('izk.recentPrompts'))[0]`),'continue','generated continuation text leaked into prompt history');
  await evaluate(`document.querySelector('[data-fixture-tab="extension"]').click()`);
  await wait(`document.querySelector('select[aria-label="Browser for the extension"]')`);
  await evaluate(`(()=>{const select=document.querySelector('select');select.value='edge';select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await pause(80);await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Set up in this browser').click()`);
  await wait(`document.querySelector('[aria-label="Prepared extension folder"]')`);
  assert.deepEqual(await evaluate('window.fixtureCalls.setup'),['edge'],'setup used the wrong browser');
  assert(await evaluate('document.body.innerText.includes("Load unpacked")'),'setup falsely skipped browser confirmation');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Style/files: four layouts and Undo, daily picture preservation, folding, document/code payloads and follow-ups, saved document text, unsupported-file errors and browser setup pass.');
  await call('Page.navigate',{url:origin+'/tools/fixtures/recent-prompts.html'});
  await wait(`window.promptReady && document.querySelector('button[aria-label="Recent prompts"]')`);
  await call('Page.bringToFront');
  await call('Emulation.setFocusEmulationEnabled',{enabled:true});
  await evaluate(`document.querySelector('button[aria-label="Recent prompts"]').focus()`);
  await wait(`document.querySelector('[role=group][aria-label="Recent prompts"]')`);
  await evaluate(`document.querySelector('button[aria-label="Recent prompts"]').click()`);
  assert(await evaluate(`!!document.querySelector('[role=group][aria-label="Recent prompts"]')`),'click after focus closed the shelf');
  const fits = () => evaluate(`(()=>{const r=document.querySelector('[role=group][aria-label="Recent prompts"]').getBoundingClientRect();return r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth;})()`);
  assert(await fits(),'top-left shelf leaves the screen');
  await evaluate(`document.querySelector('[role=group] button[title]').click()`);
  assert.equal(await evaluate('window.pickedPrompt'),'Explain this:\n\nconst sum = 1;','recall lost formatting');
  // A shelf at the opposite corner should open up and stay in the viewport.
  await evaluate(`document.querySelector('button[aria-label="Recent prompts"]').click()`);
  await wait('document.querySelector("[role=group]")');
  const beforeDrag=await evaluate('document.querySelector("[role=group]").getBoundingClientRect().top');
  await evaluate('window.movePromptShelf()');
  await wait(`document.querySelector('[role=group]').getBoundingClientRect().top>${beforeDrag+20}`);
  assert(await fits(),'bottom-right shelf leaves the screen');
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
  await wait('!document.querySelector("[role=group]")');
  assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'),'Recent prompts','Escape did not return focus');
  // Keyboard only. The shelf is portalled to the end of <body>, so the
  // browser's own Tab order skips it: real Tab presses must reach every
  // button in it, outlast the close grace (220 ms), and leave in order.
  const tab = async (shift=false) => {
    const modifiers = shift ? 8 : 0;
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9,modifiers});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9,modifiers});
    await pause(300);
  };
  const focusedInShelf = () => evaluate('!!document.activeElement.closest("[role=group]")');
  const focusedLabel = () => evaluate('document.activeElement.getAttribute("aria-label")');
  await evaluate(`document.querySelector('button[aria-label="Recent prompts"]').click()`);
  await wait('document.querySelector("[role=group]")');
  await tab();
  assert(await focusedInShelf(),`Tab from the clock skipped the shelf (focus: ${await focusedLabel()})`);
  assert(await evaluate('!!document.querySelector("[role=group]")'),'the shelf closed when Tab moved into it');
  await tab(true);
  assert.equal(await focusedLabel(),'Recent prompts','Shift+Tab from the first shelf button did not return to the clock');
  assert(await evaluate('!!document.querySelector("[role=group]")'),'Shift+Tab back to the clock closed the shelf');
  const shelfButtons = await evaluate('document.querySelectorAll("[role=group] button").length');
  for (let i = 0; i < shelfButtons; i++) {
    await tab();
    assert(await focusedInShelf(),`Tab ${i + 1} of ${shelfButtons} left the shelf early`);
  }
  await tab();
  assert.equal(await focusedLabel(),'Recent prompts','Tab past the last shelf button did not return to the clock');
  assert(!await evaluate('!!document.querySelector("[role=group]")'),'the shelf stayed open after tabbing past its end');
  await tab();
  assert.equal(await focusedLabel(),'Other field','the next Tab did not carry on to the next control');
  await evaluate(`document.querySelector('button[aria-label="Recent prompts"]').click()`);
  await wait('document.querySelector("[role=group]")');
  await evaluate(`[...document.querySelectorAll('[role=group] button')].find(b=>b.textContent==='Clear all').click()`);
  await wait(`!document.querySelector('button[aria-label="Recent prompts"]')`);
  await evaluate(`window.promptHistory.rememberPrompt('A new question')`);
  await wait(`document.querySelector('button[aria-label="Recent prompts"]')`);
  assert(!await evaluate('!!document.querySelector("[role=group]")'),'clearing history left the next shelf open');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Recent prompts browser: keyboard and click opening, Tab into and out of the shelf, formatted recall, screen-edge placement, Escape and clear/reopen pass.');
})().catch((error)=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  try{ws?.close();}catch{}
  await closeTestBrowser(browser, profile);
  if(server)await server.close();
  await pause(500);
  if(profile&&path.resolve(profile).startsWith(path.join(root,'.work')+path.sep))try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
  if(cacheDir)try{fs.rmSync(cacheDir,{recursive:true,force:true});}catch{}
});
