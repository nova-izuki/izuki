import { useEffect, useRef, useState } from "react";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { api, emit, EV, on, IS_TAURI } from "../lib/ipc";
import type { CaptionPayload, Settings } from "../lib/types";

/**
 * Mate — your Izuki character living on the desktop (mate.rs is its window
 * and the events it notices). It stands on the taskbar with its pet, wanders
 * now and then, dances while music plays, dozes off when you're away, and
 * reacts to what you do — in its own voice, a line at a time, never chatty
 * unless you ask it to be. Double-click to talk (Izuki's whole brain answers),
 * drag it anywhere, right-click for its menu.
 *
 * Battery: it draws 30 times a second only while it's moving or talking,
 * 8 times a second standing still, and not at all while hidden.
 */

type Mode = "idle" | "walk" | "dance" | "sleep" | "hop";
type Turn = { role: "user" | "mate"; text: string; at: number };

const W = 300;
const H = 340;
const FIG = 300; // the character's square drawing
const MEMORY_KEY = "izuki.mate.memory";
const PET_SRC: Record<string, string> = {
  cat: new URL("../../docs/app/painted/pets/cat.webp", import.meta.url).href,
  dog: new URL("../../docs/app/painted/pets/dog.webp", import.meta.url).href,
};
/** Seconds between unasked lines, by how chatty it's set. */
const GAP: Record<string, number> = { quiet: 600, normal: 180, chatty: 60 };

function loadMemory(): Turn[] {
  try {
    const v = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
    return Array.isArray(v) ? v.filter((t) => t && typeof t.text === "string").slice(-40) : [];
  } catch {
    return [];
  }
}
function saveMemory(m: Turn[]) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m.slice(-40)));
  } catch {
    /* storage full / private — it still works, it just won't remember */
  }
}

/** A quick line of its own for when no AI answers (or to save a call). */
function stockLine(kind: string, detail: string): string | null {
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
  const app = detail.split("|")[0].toLowerCase();
  switch (kind) {
    case "app":
      if (/code|devenv|idea|pycharm|cursor|webstorm|sublime|notepad\+\+/.test(app)) return pick(["Coding time. Let's cook. 💻", "Ooh, building something?", "I'll keep quiet, you focus."]);
      if (/fl64|fl studio|ableton|logic|studio one/.test(app)) return pick(["Studio mode 🎹 make it bang!", "Producer hours. Let's go.", "Turn it up when it's ready 🔥"]);
      if (/chrome|msedge|firefox|brave|opera/.test(app) && /youtube/i.test(detail)) return pick(["What we watching? 👀", "Popcorn time?"]);
      if (/discord|whatsapp|telegram/.test(app)) return pick(["Say hi from me!", "Who's texting? 👀"]);
      if (/winword|excel|powerpnt|docs/.test(app)) return pick(["Work mode. You've got this.", "Make it look good ✨"]);
      return null;
    case "back":
      return pick([`Welcome back! You were gone ${detail} min.`, "There you are! 👋", "Missed you. What's next?"]);
    case "idle":
      return pick(["I'll just… rest my eyes 😴", "Zz… wake me when you're back."]);
    case "build-done": {
      const [tool, secs] = detail.split("|");
      const s = Number(secs) || 0;
      return s > 90 ? `Build finished — ${Math.round(s / 60)} min. Finally! ✅` : `${tool} build done ✅`;
    }
    case "build-start":
      return pick(["Building… I'll watch it.", "Compiling. Stretch break?"]);
    case "download":
      return `Got your download: ${detail}`;
    case "music":
      return pick(["Ooh this one 🎶", "Okay I'm dancing.", "Turn it up!"]);
    default:
      return null;
  }
}

export function Mate() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bubble, setBubble] = useState<{ text: string; thought?: boolean } | null>(null);
  const [asking, setAsking] = useState(false);
  const [menu, setMenu] = useState(false);
  const [draft, setDraft] = useState("");
  const mode = useRef<Mode>("idle");
  const facing = useRef(1); // 1 = right, -1 = left
  const walkTo = useRef<number | null>(null);
  const talkUntil = useRef(0);
  const sayText = useRef("");
  const lastLine = useRef(0);
  const recent = useRef<string[]>([]);
  const memory = useRef<Turn[]>(loadMemory());
  const waitingReply = useRef(0);
  const mod = useRef<typeof import("../../docs/app/toon.js") | null>(null);
  const petImg = useRef<HTMLImageElement | null>(null);
  const bubbleTimer = useRef(0);
  const settingsRef = useRef<Settings | null>(null);
  settingsRef.current = settings;

  // Settings, and when they change.
  useEffect(() => {
    const read = () => void api.getSettings().then(setSettings).catch(() => undefined);
    read();
    const off = on(EV.settingsChanged, read);
    return () => void off.then((f) => f());
  }, []);
  useEffect(() => {
    void import("../../docs/app/toon.js").then((m) => {
      mod.current = m;
      void m.paintedReady();
    });
  }, []);
  useEffect(() => {
    const pet = settings?.mate_pet ?? "cat";
    if (!PET_SRC[pet]) {
      petImg.current = null;
      return;
    }
    const im = new Image();
    im.src = PET_SRC[pet];
    im.onload = () => (petImg.current = im);
  }, [settings?.mate_pet]);

  // Clicks pass through everywhere but the character (and its bubble/menu).
  useEffect(() => {
    if (!IS_TAURI) return;
    const big = bubble || menu || asking;
    void api.mateHot(big ? 0 : W * 0.28, big ? 0 : 30, big ? W : W * 0.44, big ? H : H - 30).catch(() => undefined);
  }, [bubble, menu, asking]);

  const show = (text: string, ms = 6500, thought = false) => {
    setBubble({ text, thought });
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), ms);
    sayText.current = text;
    talkUntil.current = thought ? 0 : performance.now() + Math.min(5000, 600 + text.length * 55);
    recent.current = [...recent.current, text].slice(-6);
    if (!thought && settingsRef.current?.mate_voice) void emit(EV.say, { text, mood: "cheerful", reply: false, quick: true });
  };

  /** Something happened: react — moves at once, words only now and then. */
  const react = async (kind: string, detail: string) => {
    const s = settingsRef.current;
    if (kind === "music") mode.current = "dance";
    if (kind === "music-stop" && mode.current === "dance") mode.current = "idle";
    if (kind === "idle") mode.current = "sleep";
    if (kind === "back") mode.current = "hop";
    if (kind === "build-done") mode.current = "hop";
    if (kind === "say") return show(detail, 9000);
    if (kind === "fullscreen" || kind === "music-stop") return;
    const gap = (GAP[s?.mate_chatty ?? "normal"] ?? 180) * 1000;
    const important = kind === "back" || kind === "build-done" || kind === "download";
    if (!important && Date.now() - lastLine.current < gap) return;
    const quick = stockLine(kind, detail);
    if (!quick && !important && Math.random() < 0.5) return;
    lastLine.current = Date.now();
    // Its own words when an AI answers in time; its stock line otherwise.
    let wait = 0;
    const ai = await Promise.race([
      api.mateLine(kind, detail, recent.current).catch(() => null),
      new Promise<null>((r) => (wait = window.setTimeout(() => r(null), 4000))),
    ]);
    window.clearTimeout(wait);
    const line = ai || quick;
    if (line) show(line);
  };

  // No timers left running once it's gone.
  useEffect(() => () => window.clearTimeout(bubbleTimer.current), []);

  useEffect(() => {
    const off = on<{ kind: string; detail: string }>("izuki://mate-event", (e) => void react(e.kind, e.detail));
    // Izuki's answer to something asked of the mate: shown in its bubble.
    const offCap = on<CaptionPayload>(EV.caption, (c) => {
      if (!c?.text || Date.now() - waitingReply.current > 90_000) return;
      waitingReply.current = 0;
      memory.current = [...memory.current, { role: "mate" as const, text: c.text, at: Date.now() }];
      saveMemory(memory.current);
      show(c.text.length > 220 ? c.text.slice(0, 217) + "…" : c.text, 12000);
    });
    return () => {
      void off.then((f) => f());
      void offCap.then((f) => f());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle thoughts, now and then, while you're around.
  useEffect(() => {
    const t = window.setInterval(() => {
      const s = settingsRef.current;
      if (!s?.mate_enabled || mode.current === "sleep" || s.mate_chatty === "quiet") return;
      const gap = (GAP[s.mate_chatty] ?? 180) * 1000 * 3;
      if (Date.now() - lastLine.current < gap || Math.random() < 0.6) return;
      lastLine.current = Date.now();
      void api.foregroundApp().then((app) => api.mateLine("thought", app, recent.current)).then((l) => l && show(`💭 ${l}`, 7000, true)).catch(() => undefined);
    }, 60_000);
    return () => window.clearInterval(t);
  }, []);

  // Wandering: a little walk along the taskbar every minute or two.
  useEffect(() => {
    const t = window.setInterval(() => {
      const s = settingsRef.current;
      if (!IS_TAURI || !s?.mate_wander || mode.current !== "idle" || bubble || asking || menu) return;
      if (Math.random() < 0.55) return;
      const span = window.screen.availWidth * (window.devicePixelRatio || 1);
      walkTo.current = Math.max(0, Math.min(span - W * (window.devicePixelRatio || 1), Math.random() * span));
      mode.current = "walk";
    }, 45_000);
    return () => window.clearInterval(t);
  }, [bubble, asking, menu]);

  // Drawing (and walking the window), only as often as it's moving.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let hopAt = 0;
    const win = IS_TAURI ? getCurrentWindow() : null;
    let pos: { x: number; y: number } | null = null;
    if (win) void win.outerPosition().then((p) => (pos = { x: p.x, y: p.y }));
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const m = mode.current;
      const talking = now < talkUntil.current;
      const lively = m === "walk" || m === "dance" || m === "hop" || talking;
      if (now - last < (lively ? 33 : 125)) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const c = canvas.current;
      const toon = mod.current;
      if (!c || !toon) return;
      const dpr = window.devicePixelRatio || 1;
      if (c.width !== W * dpr || c.height !== H * dpr) {
        c.width = W * dpr;
        c.height = H * dpr;
      }
      const g = c.getContext("2d")!;
      g.imageSmoothingQuality = "high";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const t = now / 1000;
      // Walking: move the window a little each frame toward where it's going.
      if (m === "walk" && win && pos && walkTo.current != null) {
        const speed = 70 * dpr;
        const dx = walkTo.current - pos.x;
        facing.current = dx >= 0 ? 1 : -1;
        if (Math.abs(dx) < speed * dt + 1) {
          mode.current = "idle";
          walkTo.current = null;
        } else {
          pos.x += Math.sign(dx) * speed * dt;
          void win.setPosition(new PhysicalPosition(Math.round(pos.x), pos.y));
        }
      }
      if (m === "hop" && !hopAt) hopAt = t;
      if (m === "hop" && t - hopAt > 0.9) {
        mode.current = "idle";
        hopAt = 0;
      }
      // The body: bob while walking, bounce while dancing, slump asleep, spring on a hop.
      let dy = 0;
      let rot = 0;
      let sx = 1;
      let sy = 1;
      if (m === "walk") {
        dy = -Math.abs(Math.sin(t * 8)) * 6;
        rot = Math.sin(t * 8) * 0.03;
      } else if (m === "dance") {
        dy = -Math.abs(Math.sin(t * 6)) * 12;
        rot = Math.sin(t * 3) * 0.1;
        sy = 1 + Math.sin(t * 12) * 0.02;
      } else if (m === "sleep") {
        rot = 0.06;
        sy = 0.97;
      } else if (m === "hop") {
        const k = (t - hopAt) / 0.9;
        dy = -Math.sin(Math.min(1, k) * Math.PI) * 26;
        sy = 1 + Math.sin(k * Math.PI * 2) * 0.04;
        sx = 1 / sy;
      }
      // The pet, trotting behind.
      const pet = petImg.current;
      if (pet && settingsRef.current?.mate_pet !== "none") {
        const ph = 62;
        const pw = (pet.width / pet.height) * ph;
        const behind = facing.current > 0 ? 18 : W - 18 - pw;
        const py = H - ph - 2 - (m === "walk" || m === "dance" ? Math.abs(Math.sin(t * 9 + 1)) * 5 : 0);
        g.save();
        if (facing.current < 0) {
          g.translate(behind + pw, 0);
          g.scale(-1, 1);
          g.drawImage(pet, 0, py, pw, ph);
        } else {
          g.drawImage(pet, behind, py, pw, ph);
        }
        g.restore();
        // Its lead, from the pet's collar up to the character's hand.
        g.strokeStyle = "rgba(160,30,40,0.85)";
        g.lineWidth = 1.6;
        g.beginPath();
        const collarX = facing.current > 0 ? behind + pw * 0.8 : behind + pw * 0.2;
        const handX = W / 2 + (facing.current > 0 ? -30 : 30);
        g.moveTo(collarX, py + ph * 0.35);
        g.quadraticCurveTo((collarX + handX) / 2, H - 60, handX, H - 150 + dy);
        g.stroke();
      }
      // The character.
      g.save();
      g.translate(W / 2, H + dy);
      g.rotate(rot);
      g.scale(sx * facing.current, sy);
      g.translate(-FIG / 2, -FIG - 20);
      toon.drawToon(g, FIG, {
        persona: settingsRef.current?.persona || "nova",
        render: "concept",
        framing: "full",
        orb: false,
        time: t,
        energy: talking ? 0.5 + 0.4 * Math.abs(Math.sin(t * 11)) : 0,
        mood: m === "sleep" ? 0 : 0.5,
        say: talking ? { text: sayText.current } : null,
      });
      g.restore();
      if (m === "sleep") {
        g.fillStyle = "rgba(255,255,255,0.85)";
        g.font = "600 16px system-ui";
        const z = (t * 0.8) % 1;
        g.globalAlpha = 1 - z;
        g.fillText("z", W / 2 + 34 + z * 14, 70 - z * 30);
        g.font = "600 12px system-ui";
        g.fillText("z", W / 2 + 46 + z * 10, 54 - z * 24);
        g.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    memory.current = [...memory.current, { role: "user" as const, text, at: Date.now() }];
    saveMemory(memory.current);
    setDraft("");
    setAsking(false);
    waitingReply.current = Date.now();
    show("On it…", 30000, true);
    // Izuki's whole brain answers (tools, screen, apps) — with what we said lately.
    const lately = memory.current.slice(-6).map((t) => `${t.role === "user" ? "Me" : "You"}: ${t.text}`).join("\n");
    void emit(EV.runChat, { id: Date.now(), text: memory.current.length > 1 ? `${text}\n\n[Our chat so far, for context:\n${lately}]` : text });
  };

  const doMenu = (what: string) => {
    setMenu(false);
    const patch = (p: Partial<Settings>) => void emit(EV.patchSettings, p);
    switch (what) {
      case "talk":
        setAsking(true);
        break;
      case "dance":
        mode.current = mode.current === "dance" ? "idle" : "dance";
        break;
      case "walk": {
        const span = window.screen.availWidth * (window.devicePixelRatio || 1);
        walkTo.current = Math.random() * (span - W);
        mode.current = "walk";
        break;
      }
      case "wander":
        patch({ mate_wander: !settingsRef.current?.mate_wander });
        break;
      case "pet": {
        const next = { cat: "dog", dog: "none", none: "cat" }[settingsRef.current?.mate_pet ?? "cat"] ?? "cat";
        patch({ mate_pet: next });
        break;
      }
      case "chatty": {
        const next = { quiet: "normal", normal: "chatty", chatty: "quiet" }[settingsRef.current?.mate_chatty ?? "normal"] ?? "normal";
        patch({ mate_chatty: next });
        show(next === "quiet" ? "I'll keep it down." : next === "chatty" ? "Oh we're TALKING now 😄" : "Back to normal.");
        break;
      }
      case "forget":
        memory.current = [];
        saveMemory([]);
        show("Done — I've forgotten our chats.");
        break;
      case "hide":
        patch({ mate_enabled: false });
        break;
    }
  };

  const chatty = settings?.mate_chatty ?? "normal";
  return (
    <div className="relative h-full w-full select-none" onContextMenu={(e) => { e.preventDefault(); setMenu((v) => !v); }}>
      <canvas
        ref={canvas}
        style={{ width: W, height: H }}
        className="absolute inset-0"
        onPointerDown={(e) => {
          if (e.button !== 0 || !IS_TAURI) return;
          mode.current = mode.current === "sleep" ? "hop" : mode.current;
          void getCurrentWindow().startDragging().catch(() => undefined);
        }}
        onDoubleClick={() => setAsking(true)}
      />
      {bubble && !asking && (
        <div className={"absolute left-1/2 top-1 max-w-[270px] -translate-x-1/2 rounded-2xl px-3 py-2 text-[12.5px] leading-snug shadow-xl " + (bubble.thought ? "bg-white/85 italic text-neutral-700" : "bg-white text-neutral-900")}>
          {bubble.text}
        </div>
      )}
      {asking && (
        <form
          className="absolute left-1/2 top-1 flex w-[270px] -translate-x-1/2 items-center gap-1 rounded-2xl bg-white p-1.5 shadow-xl"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setAsking(false)}
            placeholder="Say anything…"
            className="min-w-0 flex-1 bg-transparent px-1.5 text-[12.5px] text-neutral-900 outline-none"
          />
          <button type="submit" className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white">Send</button>
        </form>
      )}
      {menu && (
        <div className="absolute left-1/2 top-2 w-[190px] -translate-x-1/2 rounded-2xl bg-neutral-900/95 p-1 text-[12px] text-white shadow-2xl ring-1 ring-white/10">
          {[
            ["talk", "💬 Talk to me"],
            ["dance", "🕺 Dance"],
            ["walk", "🚶 Go for a walk"],
            ["wander", settings?.mate_wander ? "📍 Stay put" : "🧭 Wander around"],
            ["pet", `🐾 Pet: ${settings?.mate_pet ?? "cat"}`],
            ["chatty", `🗣️ Chatty: ${chatty}`],
            ["forget", "🧹 Clear memory"],
            ["hide", "🙈 Hide"],
          ].map(([k, label]) => (
            <button key={k} type="button" onClick={() => doMenu(k)} className="block w-full rounded-xl px-2.5 py-1.5 text-left hover:bg-white/10">
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
