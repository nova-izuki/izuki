// 🎙️ Lecture Mode from the phone: record a class on this phone, and the
// linked PC writes it down as it goes and makes the notes (src-tauri/src/
// lecture.rs, through the PC's private link). The notes land in Izuki →
// Notes on the PC, with each point's time.
//
//   IzukiLecture.open(pcLink)   show it; ✕ closes it (a recording keeps going
//                               only while this screen is open)
//
// Only after the student confirms they're allowed to record. Audio goes in
// pieces of about 45 seconds, so a dropped connection loses one piece at
// most, and each piece says so if it couldn't be sent.
(() => {
  "use strict";
  const PIECE_MS = 45_000;
  let root = null, base = "", rec = null, stream = null, id = "", index = 0, started = 0, tick = 0, pending = new Set(), stopping = false;
  const $ = (sel) => root.querySelector(sel);

  const css = `
  .izl{position:fixed;inset:0;z-index:2147482002;background:#0b0d16;color:#fff;display:flex;flex-direction:column;font:14px system-ui,-apple-system,Segoe UI,sans-serif;overflow:auto}
  .izl[hidden],.izl [hidden]{display:none}
  .izl header{display:flex;align-items:center;gap:8px;padding:12px;padding-top:max(12px,env(safe-area-inset-top))}
  .izl header b{flex:1;font-size:17px}
  .izl button{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;font:inherit;font-weight:600;touch-action:manipulation}
  .izl section{margin:6px 12px 10px;padding:14px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);display:flex;flex-direction:column;gap:10px}
  .izl input[type=text]{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:11px;font:inherit}
  .izl label{display:flex;gap:10px;align-items:flex-start;line-height:1.35}
  .izl label input{margin-top:3px;width:18px;height:18px}
  .izl .rec{background:rgba(244,63,94,.85);border-color:rgba(244,63,94,1);font-size:16px}
  .izl .rec:disabled{opacity:.45}
  .izl .live{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;letter-spacing:.06em}
  .izl .dot{width:12px;height:12px;border-radius:50%;background:#f43f5e;animation:izlp 1.2s ease-in-out infinite}
  @keyframes izlp{50%{opacity:.25}}
  .izl .clock{font-variant-numeric:tabular-nums;font-size:34px;font-weight:700}
  .izl .muted{color:rgba(255,255,255,.55);font-size:12.5px;line-height:1.4}
  .izl .note{color:#ffd27a;font-size:13px;min-height:18px}
  .izl .ok{color:#6ee7b7}`;

  function build() {
    const st = document.createElement("style");
    st.textContent = css;
    document.head.append(st);
    root = document.createElement("div");
    root.className = "izl";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Record a lecture");
    root.innerHTML = `
      <header><b>🎙️ Record a lecture</b><button type="button" data-close aria-label="Close">✕</button></header>
      <section data-setup>
        <input type="text" data-title maxlength="80" placeholder="What's the class? (e.g. Biology 101)">
        <label><input type="checkbox" data-allowed> <span>I'm allowed to record this lecture (my teacher or school says it's OK).</span></label>
        <button type="button" class="rec" data-start disabled>● Start recording</button>
        <div class="muted">Your PC writes it down as it goes and makes notes with key points, definitions and dates — in Izuki → Notes. Keep this screen open while it records.</div>
      </section>
      <section data-running hidden>
        <div class="live"><span class="dot"></span>LECTURE MODE • RECORDING</div>
        <div class="clock" data-clock>0:00</div>
        <div class="muted" data-sent>Nothing sent yet.</div>
        <button type="button" class="rec" data-stop>■ Stop and make notes</button>
        <button type="button" data-cancel>Throw this recording away</button>
      </section>
      <div class="note" data-note style="margin:0 14px"></div>`;
    document.body.append(root);
    $("[data-close]").addEventListener("click", close);
    $("[data-allowed]").addEventListener("change", (e) => ($("[data-start]").disabled = !e.target.checked));
    $("[data-start]").addEventListener("click", start);
    $("[data-stop]").addEventListener("click", () => void stop(true));
    $("[data-cancel]").addEventListener("click", () => {
      if (confirm("Throw this recording away? Nothing will be saved.")) void stop(false);
    });
  }

  const say = (text, good) => {
    const n = $("[data-note]");
    n.textContent = text || "";
    n.className = "note" + (good ? " ok" : "");
  };

  async function post(path, body, type) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), path.includes("finish") ? 240_000 : 60_000);
    try {
      const r = await fetch(base + path, { method: "POST", headers: { "Content-Type": type || "application/json" }, body, signal: ctrl.signal });
      const v = await r.json().catch(() => ({}));
      if (!r.ok || v.ok === false) throw new Error(v.error || "the PC didn't take it");
      return v;
    } finally {
      clearTimeout(timer);
    }
  }

  function pick() {
    for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) if (window.MediaRecorder?.isTypeSupported?.(t)) return t;
    return "";
  }

  let starting = false;
  /** Throw away was pressed: the piece being recorded isn't sent. */
  let discarding = false;
  async function start() {
    // One start at a time: a double tap mustn't open two recordings.
    if (starting || id) return;
    starting = true;
    discarding = false;
    const button = $("[data-start]");
    button.disabled = true;
    const fail = (text) => {
      starting = false;
      button.disabled = !$("[data-allowed]").checked;
      say(text);
    };
    say("");
    if (!window.MediaRecorder) return fail("This phone's browser can't record audio. Try Chrome, or update iOS.");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
    } catch {
      return fail("Izuki needs the microphone to record — allow it and try again.");
    }
    try {
      const v = await post("lecture/start", JSON.stringify({ title: $("[data-title]").value.trim(), allowed: true }));
      id = v.id;
    } catch (e) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      return fail(String(e.message || e).includes("Failed to fetch") ? "Couldn't reach your PC — is it on, with Izuki open?" : String(e.message || e));
    }
    starting = false;
    index = 0;
    started = Date.now();
    stopping = false;
    $("[data-setup]").hidden = true;
    $("[data-running]").hidden = false;
    clearInterval(tick);
    tick = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      $("[data-clock]").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }, 500);
    navigator.wakeLock?.request?.("screen").catch(() => undefined);
    nextPiece();
  }

  /** One recorder per piece: each piece is a complete file the PC can read. */
  function nextPiece() {
    if (!stream || stopping) return;
    const type = pick();
    const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks = [];
    const at = Math.floor((Date.now() - started) / 1000);
    const n = index++;
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks, { type: r.mimeType || "audio/webm" });
      if (blob.size > 1000 && !discarding) {
        const p = post(`lecture/piece?id=${encodeURIComponent(id)}&index=${n}&start=${at}`, blob, blob.type)
          .then(() => ($("[data-sent]").textContent = `${n + 1} piece${n ? "s" : ""} sent to your PC ✓`))
          .catch((e) => say(`A piece couldn't be sent (${e.message || e}) — recording carries on.`))
          .finally(() => pending.delete(p));
        pending.add(p);
      }
      nextPiece();
    };
    rec = r;
    r.start();
    setTimeout(() => r.state === "recording" && r.stop(), PIECE_MS);
  }

  async function stop(keep) {
    discarding = !keep;
    stopping = true;
    $("[data-stop]").disabled = true;
    const last = rec;
    if (last && last.state === "recording") {
      await new Promise((res) => {
        last.addEventListener("stop", () => setTimeout(res, 50), { once: true });
        last.stop();
      });
    }
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    clearInterval(tick);
    try {
      if (!keep) {
        await post("lecture/cancel", JSON.stringify({ id }));
        say("Thrown away — nothing was saved.");
      } else {
        say("Sending the last piece…");
        await Promise.allSettled([...pending]);
        say("Your PC is writing the notes — this can take a minute…");
        const v = await post("lecture/finish", JSON.stringify({ id }));
        say(`✓ Notes saved on your PC: “Lecture — ${v.title}”. Open Izuki → Notes.`, true);
      }
    } catch (e) {
      say(`That didn't finish (${e.message || e}). The pieces already sent are kept on the PC.`);
    }
    id = "";
    starting = false;
    $("[data-start]").disabled = !$("[data-allowed]").checked;
    $("[data-stop]").disabled = false;
    $("[data-running]").hidden = true;
    $("[data-setup]").hidden = false;
  }

  function close() {
    if (id && !confirm("Stop recording? What's recorded so far will be made into notes.")) return;
    if (id) void stop(true).then(() => (root.hidden = true));
    else root.hidden = true;
  }

  window.IzukiLecture = {
    open(pcLink) {
      if (!root) build();
      base = pcLink.endsWith("/") ? pcLink : pcLink + "/";
      root.hidden = false;
    },
  };
})();
