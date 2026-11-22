const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '../../docs/app/drive.js'), 'utf8');
const store = {};
// The error callback Drive mode hands the browser, so a refusal can be played.
let geoFail = null;
const el = () => ({ classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, insertBefore() {}, querySelector() { return null; }, addEventListener() {}, style: {}, textContent: '', hidden: false });
global.window = { IzukiCore: { calling: () => true, startCall() {}, busy: () => false, speak: async () => {} } };
// The note channel the page already has (shared/bugs.js), kept here as plain
// lists so a check can see what would have been written down.
const facts = {}, problems = [], crumbs = [];
window.izukiBugs = {
  fact: (k, v) => { facts[k] = v; },
  report: (m) => problems.push(String(m)),
  crumb: (m, c) => crumbs.push(c + ": " + m),
};
// Node 26 has its own read-only `navigator`, so it has to be defined, not set.
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  writable: true,
  value: { language: 'en-US', geolocation: { watchPosition: (ok, bad) => { geoFail = bad; return 1; }, clearWatch() {} } },
});
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => (store[k] = v) };
global.document = { getElementById: () => el(), createElement: () => ({ ...el(), innerHTML: '' }), head: { appendChild() {} }, addEventListener() {}, visibilityState: 'visible' };
global.location = { assign() {} };
// The map services, stubbed: this checks what Izuki says with and without a
// real answer, not the network.
let mode = 'ok';
// Route answers held back by hand, to test two destinations racing.
let slowRoutes = null;
const asked = [];
global.fetch = async (url) => {
  const u = String(url);
  asked.push(u);
  if (mode === 'offline') throw new Error('offline');
  if (/photon\.komoot\.io|geocoding-api\.open-meteo\.com/.test(u)) {
    if (mode === 'noplace') return { ok: true, json: async () => ({ features: [] }) };
    if (mode === 'fuzzy') return { ok: true, json: async () => ({ features: [{ properties: { name: 'Nowhere Special Place', city: 'Yuma', country: 'United States' }, geometry: { type: 'Point', coordinates: [-114.53, 32.66] } }] }) };
    // Echo the name back, so a lookup answers the place that was asked for.
    const q = decodeURIComponent((u.match(/[?&]q=([^&]+)/) || [])[1] || 'walmart').replace(/\+/g, ' ');
    return { ok: true, json: async () => ({ features: [{ properties: { name: q, city: 'Toronto', country: 'Canada' }, geometry: { type: 'Point', coordinates: [-79.2, 43.79] } }] }) };
  }
  if (/router\.project-osrm\.org/.test(u)) {
    if (slowRoutes) {
      return new Promise((resolve) => slowRoutes.push((route) => resolve({ ok: true, json: async () => ({ code: 'Ok', routes: [route] }) })));
    }
    if (mode === 'noroute') return { ok: true, json: async () => ({ code: 'NoRoute' }) };
    const route = mode === 'near' ? { distance: 280, duration: 61 } : { distance: 6236.3, duration: 698.2 };
    return { ok: true, json: async () => ({ code: 'Ok', routes: [route] }) };
  }
  throw new Error('unexpected request ' + u);
};
eval(src);
const D = window.IzukiDrive;
const cases = [];
const ok = (cond, what) => { cases.push([cond, what]); };
const say = (s) => { const r = D.gate(s); return r ? r.say : null; };
const settle = () => new Promise((r) => setTimeout(r, 40));
const spoken = [];
window.IzukiCore.speak = async (msg) => { spoken.push(msg); };
const fix = (lat, lon, speed, at) => ({ coords: { latitude: lat, longitude: lon, speed }, timestamp: at });

(async () => {
  ok(say('navigate to walmart') === null, 'not driving: nav goes to AI');
  ok(/Drive mode's on/.test(say("I'm driving")), 'start phrase');
  ok(D.active, 'active after start');
  ok(/Taking you to walmart/.test(say('navigate to walmart')), 'navigate');
  ok(/Taking you to home/.test(say('take me home')), 'take me home');
  ok(/gas station/.test(say('find a gas station')), 'find a gas station');
  ok(/coffee/.test(say('where is the nearest coffee near me')), 'nearest coffee');
  ok(say('play trivia with me') === null, 'trivia stays with AI');
  ok(/Playing drake/.test(say('play drake')), 'play music');
  ok(/Opening your music/.test(say('play some music')), 'play some music');
  ok(/Messages/.test(say("text mom that I'm on my way")), 'on my way text');
  ok(/Fun mode on/.test(say('fun mode')), 'fun on');
  ok(/FUN MODE/.test(D.system()), 'fun system');
  ok(say('what is the capital of france') === null, 'question to AI');
  ok(/Drive mode off/.test(say('stop drive mode')), 'stop');
  ok(!D.active && D.system() === '', 'off');

  // ---- the ride-along: a trip measured from real fixes ---------------------
  D.start();
  ok(/Taking you to walmart/.test(say('take me to walmart')), 'ride: navigation starts a trip');
  ok(D.trip && D.trip.place === 'walmart', 'ride: destination is the place you named');
  const t0 = Date.now();
  D.track(fix(43.0000, -79.0000, 13, t0));
  for (let i = 1; i <= 6; i++) D.track(fix(43.0000 + i * 0.0010, -79.0000, 13, t0 + i * 5_000));
  ok(D.trip.metres > 640 && D.trip.metres < 690, 'ride: distance comes from the fixes');
  const held = D.trip.metres;
  D.track(fix(43.0060, -79.0000, 13, t0 + 40_000));
  ok(D.trip.metres === held, 'ride: standing still adds nothing');
  ok(/walmart/.test(say("how's the drive going")), 'ride: answers how the drive is going');
  const realNow = Date.now;
  Date.now = () => t0 + 15 * 60_000;
  D.tick();
  Date.now = realNow;
  ok(spoken.some((m) => /15 minutes/.test(m) && /walmart/.test(m)), 'ride: check-in at fifteen minutes');
  ok(!spoken.some((m) => /\b(?:eta|arriving at|minutes away|km left|miles left)\b/i.test(m)), 'ride: never invents a route or ETA');
  Date.now = () => t0 + 20 * 60_000;
  D.track(fix(43.0060, -79.0000, 0, t0 + 20 * 60_000));
  D.tick();
  Date.now = () => t0 + 24 * 60_000;
  D.tick();
  Date.now = realNow;
  ok(spoken.some((m) => /been stopped a few minutes/.test(m)), 'ride: arrival nudge after a long stop');
  const here = D.gate("we're here");
  ok(here && /covered/.test(here.say), 'ride: answering the arrival prompt ends the drive with the distance');
  ok(!D.active && D.trip === null, 'ride: the trip is cleared when the drive ends');
  D.rideAlong(false);
  ok(D.rideAlongOn === false && store['izuki.drive.ride'] === 'false', 'ride: "talk on the way" is remembered off');
  D.rideAlong(true);

  // ---- what's left: the lookup and the router, and honest silence ----------
  mode = 'ok';
  D.start();
  const left0 = Date.now();
  D.track(fix(43.0000, -79.0000, 0, left0));
  ok(/Taking you to walmart/.test(say('take me to walmart')), 'left: navigation starts a trip');
  await settle();
  ok(D.trip && D.trip.dest && Math.abs(D.trip.dest.lat - 43.79) < 0.001, 'left: the place you named becomes a point');
  ok(/walmart/i.test(asked.find((u) => /photon\.komoot\.io/.test(u)) || ''), 'left: the lookup carries the place name');
  ok(D.left && Math.abs(D.left.metres - 6236.3) < 1, 'left: the router answers with a distance');
  ok(D.left && Math.abs(D.left.secs - 698.2) < 1, 'left: and a drive time');
  ok(/3\.9 mi left/.test(D.line) && /about 12 min/.test(D.line), 'left: the trip line shows what is left');
  const first = say('how long is left');
  ok(/about 12 min/i.test(first) && /3\.9 mi/.test(first), 'left: "how long is left" answers with the router numbers');
  ok(/not live traffic/.test(first), 'left: says the time is not live traffic');
  ok(!/not live traffic/.test(say("what's the eta") || ''), 'left: says that once, not every time');
  ok(/^About 12 min/.test(say('how much longer') || ''), 'left: understands "how much longer"');
  ok(/3\.9 mi left/.test(say("how's the drive going") || ''), 'left: the drive check-in includes what is left');
  const routerCalls = asked.filter((u) => /osrm/.test(u)).length;
  say('how long is left');
  say('how far is it');
  ok(asked.filter((u) => /osrm/.test(u)).length === routerCalls, 'left: a fresh route is reused, not re-fetched');

  // a second destination named while the first route is still out
  mode = 'ok';
  slowRoutes = [];
  say('take me to walmart');
  await settle();
  say('take me to costco');
  await settle();
  ok(slowRoutes.length === 2, 'left: each destination gets its own route request');
  slowRoutes.shift()({ distance: 6236.3, duration: 698.2 });
  await settle();
  ok(D.trip.place === 'costco' && D.left === null, 'left: the older route is not applied to the newer trip');
  slowRoutes.shift()({ distance: 999, duration: 300 });
  await settle();
  ok(D.left && Math.abs(D.left.metres - 999) < 1, 'left: the newer trip keeps its own route');
  slowRoutes = null;

  // a place the map does not have
  mode = 'noplace';
  say('take me to blorptown station');
  await settle();
  ok(D.trip.found === 'no', 'left: a place the map does not have is marked not found');
  ok(/couldn't find blorptown station/.test(say('how long is left') || ''), 'left: says plainly when it cannot find the place');
  ok(/place not found/.test(D.line), 'left: the trip line says so too');

  // a fuzzy hit that is a different place
  mode = 'fuzzy';
  say('take me to krzn plaza');
  await settle();
  ok(D.trip.found === 'no', 'left: a fuzzy match that shares no word is refused');
  ok(/couldn't find/.test(say('how long is left') || ''), 'left: never routed to the wrong place');

  // home, with no saved address
  const looked = asked.filter((u) => /photon\.komoot\.io/.test(u)).length;
  say('take me home');
  await settle();
  ok(asked.filter((u) => /photon\.komoot\.io/.test(u)).length === looked, 'left: "home" is not looked up as a place');
  ok(/saved home address/.test(say('how long is left') || ''), 'left: says it has no address for home');

  // the router cannot route
  mode = 'noroute';
  say('take me to walmart');
  await settle();
  ok(D.trip.found === 'yes' && D.left === null, 'left: the place is found even when the router cannot route');
  const q = D.gate('how long is left');
  ok(/checking what's left/.test(q.say), 'left: says it is checking instead of guessing');
  q.then();
  await settle();
  await settle();
  ok(/can't reach the route service/.test(spoken[spoken.length - 1] || ''), 'left: the answer is honest when the router fails');

  // the last stretch, and the arrival nudge
  mode = 'near';
  say('take me to walmart');
  await settle();
  ok(/900 ft left/.test(D.line), 'left: a short last leg is shown in feet');
  ok(D.unit === 'mph', 'left: the unit follows the phone\'s locale');
  const mark = spoken.length;
  D.tick();
  ok(spoken.slice(mark).some((m) => /Almost there/.test(m) && /walmart/.test(m)), 'left: nearly-there is spoken once the router is close');
  const base = Date.now();
  Date.now = () => base + 5 * 60_000;
  D.tick();
  D.tick();
  Date.now = realNow;
  ok(spoken.slice(mark).some((m) => /should be right here/.test(m)), 'left: the arrival nudge knows you are at the pin');
  ok(/covered/.test((D.gate("we're here") || {}).say || ''), 'left: answering it still ends the drive');
  ok(D.line === '' && D.left === null, 'left: nothing is left over after the drive');

  // ---- the trip outlives the screen: over Maps, and across a reload --------
  mode = 'ok';
  const orbs = [];
  window.IzukiNative = { orb: async (state, text, lease) => { orbs.push({ state, text, lease }); return true; } };
  D.start();
  const orbAt = Date.now();
  D.track(fix(43.0000, -79.0000, 13, orbAt));
  say('take me to walmart');
  await settle();
  D.tick();                                   // in the app: the screen says it
  ok(!orbs.some((o) => o.state === 'trip'), 'orb: nothing extra while the app is in front');
  document.visibilityState = 'hidden';        // Google Maps is in front now
  Date.now = () => orbAt + 60_000;
  D.tick();
  const shown = orbs[orbs.length - 1];
  Date.now = realNow;
  ok(shown && shown.state === 'trip' && shown.text === '12 min · 3.9 mi to walmart', 'orb: what is left rides over Maps');
  ok(shown && shown.lease >= 120_000, 'orb: the line is leased, so it cannot hang around for ever');
  const sent = orbs.length;
  Date.now = () => orbAt + 62_000;
  D.tick();
  const same = orbs.length;
  Date.now = () => orbAt + 115_000;
  D.tick();
  const renewed = orbs.length;
  Date.now = realNow;
  ok(same === sent, 'orb: the same line is not rewritten every five seconds');
  ok(renewed === sent + 1 && orbs[orbs.length - 1].state === 'trip', 'orb: the line is renewed so its lease does not run out');
  document.visibilityState = 'visible';
  D.tick();
  const back = orbs[orbs.length - 1];
  ok(back.state === 'rest' && back.text === '', 'orb: back in the app, the orb stops claiming a drive');
  document.visibilityState = 'hidden';

  // the line lands with the route, not at the next five-second check
  const beforeLanding = orbs.length;
  say('take me to walmart');
  await settle();
  await settle();
  ok(orbs.slice(beforeLanding).some((o) => o.state === 'trip' && /to walmart/.test(o.text)), 'orb: the line lands with the route, not a minute later');
  document.visibilityState = 'visible';

  // no route: no line, rather than a made-up time
  mode = 'noroute';
  say('take me to blorptown');
  await settle();
  const quiet = orbs.length;
  D.tick();
  ok(!orbs.slice(quiet).some((o) => o.state === 'trip'), 'orb: no route, no line — it never invents a time');
  document.visibilityState = 'visible';

  // what an unfinished drive is written down as, and that ending it clears it
  mode = 'ok';
  say('take me to walmart');
  await settle();
  const written = JSON.parse(store['izuki.drive.trip']);
  ok(written && written.place === 'walmart' && written.run === true, 'persist: an unfinished drive is written down');
  D.stop();
  ok(store['izuki.drive.trip'] === 'null', 'persist: ending the drive clears what was written');

  // a reload — or Android ending the page — picks the destination back up
  store['izuki.drive.trip'] = JSON.stringify({ place: 'walmart', at: Date.now(), metres: 1200, dest: { lat: 43.79, lon: -79.2 }, found: 'yes', why: '', run: true, maps: true });
  eval(src);
  const D2 = window.IzukiDrive;
  ok(D2.trip === null, 'persist: a fresh page starts with no trip');
  D2.resume();
  ok(D2.trip && D2.trip.place === 'walmart' && D2.trip.metres === 1200, 'persist: the destination and the distance come back');
  ok(D2.left === null && !/left|min/.test(D2.line), 'persist: the old route is not restored as today’s — so no stale time');

  // and a trip from hours ago is somebody else's errand
  store['izuki.drive.trip'] = JSON.stringify({ place: 'costco', at: Date.now() - 4 * 3600_000, metres: 900, run: true });
  eval(src);
  window.IzukiDrive.resume();
  ok(window.IzukiDrive.trip === null && store['izuki.drive.trip'] === 'null', 'persist: a trip from hours ago is not picked back up');

  // ---- what used to fail in silence now says so ---------------------------
  const D3 = window.IzukiDrive;   // the copy the last check left behind
  mode = 'ok';
  D3.start();
  ok(typeof geoFail === 'function', 'notes: the location watch has an error handler');
  geoFail({ code: 1, message: 'User denied Geolocation' });
  ok(facts['location'] === 'denied', 'notes: a refused location is written down');
  geoFail({ code: 1, message: 'User denied Geolocation' });
  ok(problems.filter((p) => /location denied/.test(p)).length === 1, 'notes: the same refusal is not written twice');
  geoFail({ code: 3, message: 'timeout' });
  ok(facts['location'] === 'timed out' && problems.filter((p) => /location timed out/.test(p)).length === 1, 'notes: a different reason is written down once too');

  // a lookup that fails on every source keeps why
  mode = 'offline';
  D3.gate('take me to costco');
  await settle();
  await settle();
  ok(/offline|http/.test(facts['place lookup'] || ''), 'notes: a place lookup that failed keeps its reason');

  // the router refusing is the difference between a stale line and no line
  mode = 'ok';
  D3.gate('take me to walmart');
  await settle();
  await settle();
  D3.track(fix(43.0000, -79.0000, 13, Date.now()));
  mode = 'offline';
  delete facts.route;
  await D3.routeNow();
  ok(/offline|http/.test(facts.route || ''), 'notes: a route the router refused keeps its reason');

  // and whether Android took the orb line at all
  mode = 'ok';
  window.IzukiNative = { orb: () => Promise.reject(new Error('refused')) };
  document.visibilityState = 'hidden';
  await D3.routeNow();
  await settle();
  ok(facts.orb === 'Android refused the orb', 'notes: an orb the phone refused is written down');
  document.visibilityState = 'visible';
  delete window.IzukiNative;

  let bad = 0;
  for (const [c, w] of cases) { if (!c) { bad++; console.log('FAIL', w); } }
  console.log(`Drive mode: ${cases.length - bad} passed, ${bad} failed`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
