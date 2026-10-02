// Small, bounded spring system; no microphone, network or timers here.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
// Measure our generated PCM WAV without rerouting playback through WebAudio
// (which can mute a suspended iPhone audio context). 50 samples per second.
export function waveEnvelope(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 44 || buffer.byteLength > 32*1024*1024) return null;
  const v=new DataView(buffer), word=(p)=>String.fromCharCode(...new Uint8Array(buffer,p,4));
  if(word(0)!=='RIFF'||word(8)!=='WAVE')return null;
  let rate=0,channels=0,bits=0,format=0,data=0,length=0;
  for(let p=12;p+8<=v.byteLength;) {
    const n=v.getUint32(p+4,true), type=word(p);
    if(p+8+n>v.byteLength)return null;
    if(type==='fmt '&&n>=16){format=v.getUint16(p+8,true);channels=v.getUint16(p+10,true);rate=v.getUint32(p+12,true);bits=v.getUint16(p+22,true);}
    if(type==='data'){data=p+8;length=n;}
    p+=8+n+(n%2);
  }
  if(format!==1||bits!==16||channels<1||channels>2||rate<8000||rate>96000||!data)return null;
  const stride=channels*2, frames=Math.floor(length/stride), block=Math.max(1,Math.floor(rate/50)), levels=new Float32Array(Math.ceil(frames/block));
  for(let i=0;i<levels.length;i++) {
    let sum=0,count=0;
    for(let j=i*block;j<Math.min(frames,(i+1)*block);j+=4) for(let ch=0;ch<channels;ch++){const sample=v.getInt16(data+j*stride+ch*2,true)/32768;sum+=sample*sample;count++;}
    levels[i]=Math.min(1,Math.sqrt(sum/Math.max(1,count))*5);
  }
  return {levels,rate:rate/block};
}
export function createOrbMotion() {
  return { time: 0, phase: 0, energy: 0, onset: 0, waiting: 0, blobs: Array.from({ length: 5 }, (_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, r: i ? .055 : .24 })) };
}
export function stepOrbMotion(s, seconds, input, mode, response = 1) {
  const dt = clamp(seconds, 0, .05), signal = clamp(input, 0, 1) * clamp(response, .5, 1.5);
  s.time += dt;
  s.onset += (Math.max(0, signal - s.energy) - s.onset) * (1 - Math.exp(-dt * 24));
  s.energy += (Math.min(1, signal) - s.energy) * (1 - Math.exp(-dt * (signal > s.energy ? 24 : 5)));
  s.waiting += ((mode === 'thinking' ? 1 : 0) - s.waiting) * (1 - Math.exp(-dt * 5));
  // Integrate the orbit rather than multiplying elapsed time by a changing
  // blend: the old formula whipped droplets backwards after a long wait.
  s.phase = ((s.phase || 0) + dt * s.waiting * .8) % (Math.PI * 2);
  for (let i = 0; i < s.blobs.length; i++) {
    const b = s.blobs[i], e = s.energy, t = s.time;
    const angle = i * 2.39996 + Math.sin(t * .53 + i) * .22 * e + s.phase;
    const reach = i ? Math.min(.32, .075 + e * (.10 + .025 * Math.sin(t * 2.8 + i)) + s.onset * .10 + s.waiting * .235) : .008 * e;
    const tx = Math.cos(angle) * reach;
    const ty = Math.sin(angle) * reach * (1 + e * .15);
    // Inertia gives the fluid a delayed recoil rather than a sine-wave wobble.
    const spring = i ? 100 : 70, drag = Math.exp(-dt * 12);
    b.vx = (b.vx + (tx - b.x) * spring * dt) * drag;
    b.vy = (b.vy + (ty - b.y) * spring * dt) * drag;
    b.x = clamp(b.x + b.vx * dt, -.38, .38);
    b.y = clamp(b.y + b.vy * dt, -.38, .38);
    b.r = i ? .048 + .028 * e + .009 * Math.sin(i * 2) : .245 - e * .035;
  }
  return s;
}

// Isosurface of metaballs: a single actual outline, with necks that split
// and rejoin. Unlike overlapping translucent circles there are no seams.
export function fluidOutline(blobs, resolution = 64) {
  const n = Math.round(clamp(resolution, 24, 96)), width = n + 1;
  const values = new Float32Array(width * width), edges = new Map(), adjacency = new Map();
  for (let y = 0; y <= n; y++) for (let x = 0; x <= n; x++) {
    let f = 0;
    for (const b of blobs) { const dx = x / n - .5 - b.x, dy = y / n - .5 - b.y; f += b.r * b.r / (dx * dx + dy * dy + .00001); }
    values[y * width + x] = f - 1;
  }
  const connect = (a, b) => { if (!adjacency.has(a)) adjacency.set(a, []); if (!adjacency.has(b)) adjacency.set(b, []); adjacency.get(a).push(b); adjacency.get(b).push(a); };
  const lookup = [[], [3,0], [0,1], [3,1], [1,2], [3,0,1,2], [0,2], [3,2], [2,3], [0,2], [0,1,2,3], [1,2], [1,3], [0,1], [3,0], []];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const a = y * width + x, ids = [a, a+1, a+width+1, a+width];
    const mask = ids.reduce((m, id, i) => m | (values[id] > 0 ? 1 << i : 0), 0);
    if (!mask || mask === 15) continue;
    const corners = [[x,y],[x+1,y],[x+1,y+1],[x,y+1]];
    const edge = (i) => {
      const j = (i+1)%4, key = Math.min(ids[i],ids[j]) + ':' + Math.max(ids[i],ids[j]);
      if (!edges.has(key)) { const f = values[ids[i]] / (values[ids[i]] - values[ids[j]]); edges.set(key, [(corners[i][0] + (corners[j][0]-corners[i][0])*f)/n, (corners[i][1] + (corners[j][1]-corners[i][1])*f)/n]); }
      return key;
    };
    const pairs = lookup[mask];
    for (let i = 0; i < pairs.length; i += 2) connect(edge(pairs[i]), edge(pairs[i+1]));
  }
  const seen = new Set(), loops = [];
  for (const start of adjacency.keys()) {
    if (seen.has(start)) continue;
    let at = start, previous = null; const points = [];
    while (at && !seen.has(at)) { seen.add(at); points.push(edges.get(at)); const next = adjacency.get(at).find(k => k !== previous); previous = at; at = next; }
    if (at === start && points.length > 3) loops.push(points);
  }
  return loops;
}
