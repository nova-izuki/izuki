// Execute the actual phone/call playback functions with deterministic browser
// refusals. No AI requests, microphone access or audible output.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
function harness(callPage = false) {
  const html = fs.readFileSync(path.join(root, callPage ? 'src-tauri/src/call.html' : 'docs/app/index.html'), 'utf8');
  const timers = new Map(), recoveries = [];
  let timerId = 0, spoken = [], behavior = 'success';
  const player = {
    src: '', setAttribute() {}, pause() {},
    play() {
      if (behavior === 'blocked') return Promise.reject(Object.assign(new Error('tap needed'), { name: 'NotAllowedError' }));
      if (behavior === 'broken') return Promise.reject(new Error('decoder'));
      return Promise.resolve();
    },
  };
  const synth = { speaking: false, pending: false, cancel() {}, speak(u) { spoken.push(u); } };
  const ctx = vm.createContext({
    Audio: function () { return player; }, SpeechSynthesisUtterance: function (text) { this.text = text; },
    speechSynthesis: synth, window: { speechSynthesis: synth }, URL, Blob, Uint8Array, DataView, ArrayBuffer,
    btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary'),
    setTimeout: (fn, ms) => { timers.set(++timerId, {fn, ms}); return timerId; },
    clearTimeout: id => timers.delete(id), clearInterval() {},
    store: { get: (_, value) => value }, document: { addEventListener() {}, querySelectorAll: () => [] },
    note() {}, bug() {}, liveSaid() {}, setOrb() {}, setMode() {}, watchBarge() {},
    $: () => ({ replaceChildren() {}, getBoundingClientRect: () => ({ top: 0 }), clientHeight: 0, scrollTop: 0 }),
    el: () => ({ textContent: '', getClientRects: () => [] }), performance, setInterval: () => 0, talking: true, readAloud: true, key: '',
    muted: false, bargeOn: false, recoveries, console,
  });
  if (callPage) {
    const speech = html.slice(html.indexOf('  let utterance = null;'), html.indexOf('  /** "Talk over Izuki"'));
    const say = html.slice(html.indexOf('  const say = '), html.indexOf('  const hush = '));
    ctx.player = player;
    vm.runInContext('let stopSound = null;\n' + speech + say + '\nofferAudio=(...args)=>recoveries.push(args);globalThis.test={speech:speakWithPhone,play:say,stop:()=>stopSound?.()};', ctx);
  } else {
    const voice = html.slice(html.indexOf('  let voiceOn = '), html.indexOf('  // ------------------------------------------------------------ listening'));
    vm.runInContext(voice + '\nofferHear=(...args)=>recoveries.push(args);globalThis.test={speech:speakWithPhone,play:playAudio,speak,unlockAudio,stop:hush,muted:()=>{voiceOn=false},stream:voiceStream,voice:(f)=>{geminiVoice=f;}};', ctx);
  }
  return { ctx, player, synth, timers, recoveries, spoken, test:ctx.test,
    behavior: v => behavior=v,
    flushStart: () => { for (const [id, t] of [...timers]) if(t.ms===3000){timers.delete(id);t.fn();} },
  };
}
(async () => {
  for(const callPage of [false,true]) {
    let h=harness(callPage);
    let done=h.test.speech('Hello.');
    assert.equal(h.spoken.length,1,'first speech must start synchronously inside the play tap');
    h.spoken[0].onstart(); h.spoken[0].onend(); await done;
    assert.equal(h.timers.size,0,'completed speech must clear all watchdogs');
    h=harness(callPage); done=h.test.speech('Blocked reply.');
    h.spoken[0].onerror({error:'not-allowed'}); await done;
    assert.equal(h.recoveries.length,1,'speech refusal must offer a visible recovery');
    assert.equal(h.timers.size,0);
    h=harness(callPage); done=h.test.speech('Never starts.');
    h.flushStart(); await done;
    assert.equal(h.recoveries.length,1,'silent speech queues must time out to recovery');
    h=harness(callPage); done=h.test.speech('Cancel me.');
    h.test.stop(); await done;
    assert.equal(h.recoveries.length,0,'intentional stop is not an autoplay failure');
    assert.equal(h.timers.size,0);
    h=harness(callPage); h.behavior('blocked');
    if(callPage) await h.test.play('Reply.','abc','audio/wav');
    else await h.test.play('blob:reply','Reply.');
    assert.equal(h.recoveries.length,1,'all blocked audio, not just Siri, must offer recovery');
    assert.equal(h.player.onended,null,'blocked player must clear event handlers');
    assert.equal(h.timers.size,0);
    h=harness(callPage);
    done=callPage?h.test.play('Reply.','abc','audio/wav'):h.test.play('blob:reply','Reply.');
    h.player.onended(); await done; assert.equal(h.recoveries.length,0);
    if(!callPage) {
      h.player.src='blob:playing-reply';h.test.unlockAudio();
      assert.equal(h.player.src,'blob:playing-reply','unlock must not replace reply audio');
      h.test.muted();await h.test.speak('Muted reply.');
      assert.equal(h.recoveries.length,1,'saved mute needs visible per-reply recovery');
    }
    if(!callPage) {
      // A call's reply: the first sentence is voiced while the rest is still
      // being written, the rest as one more request — never more than two.
      const tick = () => new Promise((r) => setImmediate(r));
      h=harness(false); const asked=[];
      h.test.voice(async (w) => { asked.push(w); return 'blob:' + asked.length; });
      const s=h.test.stream();
      s.feed('Sure thing');
      s.feed('Sure thing, it is sunny today. And tomorrow loo');
      assert.deepEqual(asked,['Sure thing, it is sunny today.'],'first sentence goes to the voice at once');
      s.feed('Sure thing, it is sunny today. And tomorrow looks warm too, about 24.');
      assert.equal(asked.length,1,'later text waits for the end');
      done=s.end('Sure thing, it is sunny today. And tomorrow looks warm too, about 24.');
      await tick(); await tick();
      assert.deepEqual(asked,['Sure thing, it is sunny today.','And tomorrow looks warm too, about 24.'],'the rest is one more request');
      assert.equal(h.player.src,'blob:1','the first piece plays first');
      h.player.onended(); await tick(); await tick();
      assert.equal(h.player.src,'blob:2','then the rest');
      h.player.onended(); await done;
      // A short reply is one request; a stopped stream stops.
      h=harness(false); asked.length=0;
      h.test.voice(async (w) => { asked.push(w); return 'blob:x'; });
      const one=h.test.stream(); one.feed('Hi there.'); done=one.end('Hi there.');
      await tick(); assert.deepEqual(asked,['Hi there.']);
      h.test.stop(); await done;
      const gone=h.test.stream(); gone.cancel(); await gone.end('Never said.');
      assert.deepEqual(asked,['Hi there.'],'a cancelled stream asks for nothing');
    }
    console.log((callPage?'PC call':'Phone app')+': synchronous tap playback, autoplay refusal, stalled TTS, mute, stop and cleanup pass.');
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
