import { useEffect, useRef, useState } from "react";
import { api, emit, EV } from "../lib/ipc";

/**
 * Air control's own keys, for a PC with no mouse or keyboard in reach — the
 * way you type in a VR headset: a little round ⌨️ button opens a floating
 * keyboard; pinch a key and it goes into the box you were typing in (the
 * keyboard never keeps the focus). Drag it by its bar, make it bigger or
 * smaller, or tap 🎤 and just say what to type — or ask for it to be
 * written ("reply that I'll be there at 6"). The ✏️ button is the pen:
 * Izuki's draw mode, where a pinch held and moved draws.
 */

const LETTERS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];
const SYMBOLS = [
  ["!", "@", "#", "$", "%", "&", "*", "(", ")", "?"],
  ["-", "_", "=", "+", "/", "\\", ":", ";", "'", '"'],
  [",", ".", "<", ">", "[", "]", "{", "}", "~"],
  ["⇧", "€", "£", "₦", "¥", "^", "`", "|", "⌫"],
];
const SIZES = [32, 40, 50];
const POS_KEY = "izuki.air.kb";

function loadPos() {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY) || "null");
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
      // On screen even if the screen got smaller since.
      return { x: Math.max(0, Math.min(window.innerWidth - 220, p.x)), y: Math.max(0, Math.min(window.innerHeight - 160, p.y)), size: p.size ?? 1 };
    }
  } catch {
    /* default spot */
  }
  return { x: Math.round(window.innerWidth / 2 - 260), y: Math.round(window.innerHeight - 330), size: 1 };
}

/** Clicking a box you can type in (with your hand) opens the keyboard. */
export const AIR_KEYBOARD_OPEN = "izk-air-keyboard-open";

export function AirKeyboard() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(AIR_KEYBOARD_OPEN, show);
    return () => window.removeEventListener(AIR_KEYBOARD_OPEN, show);
  }, []);
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [pos, setPos] = useState(loadPos);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch {
      /* not remembered */
    }
  }, [pos]);

  const key = (k: string) => {
    if (k === "⇧") return setShift((v) => !v);
    if (k === "⌫") return void api.airKey("backspace").catch(() => undefined);
    const ch = shift && !symbols ? k.toUpperCase() : k;
    void api.airKey(ch).catch(() => undefined);
    if (shift) setShift(false);
  };
  const s = SIZES[pos.size] ?? 40;
  const keyCls = "flex items-center justify-center rounded-lg bg-white/10 font-semibold text-white shadow-inner transition active:scale-95 active:bg-cyan-400/40 hover:bg-white/20";
  const rows = symbols ? SYMBOLS : LETTERS;

  return (
    <>
      {/* The two round buttons: keyboard and pen. */}
      <div data-izk-hit className="fixed bottom-16 left-4 z-[72] flex flex-col gap-2">
        <button
          type="button"
          title={open ? "Hide the keyboard" : "Keyboard — pinch keys to type"}
          aria-label="Keyboard"
          onClick={() => setOpen((v) => !v)}
          className={"flex h-12 w-12 items-center justify-center rounded-full border text-[20px] shadow-xl backdrop-blur " + (open ? "border-cyan-300/70 bg-cyan-500/40" : "border-white/20 bg-black/55 hover:bg-black/70")}
        >
          ⌨️
        </button>
        <button
          type="button"
          title="Pen — draw on the screen with a pinch, then ask Izuki about it"
          aria-label="Pen"
          onClick={() => void api.airDraw().catch(() => undefined)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-[20px] shadow-xl backdrop-blur hover:bg-black/70"
        >
          ✏️
        </button>
      </div>
      {open && (
        <div
          data-izk-hit
          className="fixed z-[72] rounded-2xl border border-white/15 bg-[#12141f]/92 p-2 shadow-2xl backdrop-blur"
          style={{ left: pos.x, top: pos.y }}
        >
          <div
            className="mb-1.5 flex cursor-grab items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white/70 active:cursor-grabbing"
            onPointerDown={(e) => {
              drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              setPos((p) => ({ ...p, x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - d.dx)), y: Math.max(0, Math.min(window.innerHeight - 120, e.clientY - d.dy)) }));
            }}
            onPointerUp={() => (drag.current = null)}
          >
            <span>⠿ Pinch a key to type · drag here to move</span>
            <span className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
              <button type="button" aria-label="Smaller" onClick={() => setPos((p) => ({ ...p, size: Math.max(0, p.size - 1) }))} className="rounded px-1.5 hover:bg-white/15">−</button>
              <button type="button" aria-label="Bigger" onClick={() => setPos((p) => ({ ...p, size: Math.min(SIZES.length - 1, p.size + 1) }))} className="rounded px-1.5 hover:bg-white/15">+</button>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded px-1.5 hover:bg-white/15">✕</button>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {rows.map((row, r) => (
              <div key={r} className="flex justify-center gap-1">
                {row.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => key(k)}
                    className={keyCls + (k === "⇧" && shift ? " bg-cyan-400/40" : "")}
                    style={{ width: k === "⇧" || k === "⌫" ? s * 1.5 : s, height: s, fontSize: s * 0.42 }}
                  >
                    {shift && !symbols && k.length === 1 ? k.toUpperCase() : k}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-1">
              <button type="button" onClick={() => setSymbols((v) => !v)} className={keyCls} style={{ width: s * 1.5, height: s, fontSize: s * 0.34 }}>
                {symbols ? "abc" : "#+="}
              </button>
              <button
                type="button"
                title="Say what to type — or ask for it to be written"
                onClick={() => void emit(EV.airSay)}
                className={keyCls + " bg-fuchsia-500/40"}
                style={{ width: s * 1.5, height: s, fontSize: s * 0.42 }}
              >
                🎤
              </button>
              <button type="button" onClick={() => key(" ")} className={keyCls} style={{ width: s * 4.6, height: s, fontSize: s * 0.34 }}>
                space
              </button>
              <button type="button" onClick={() => key(".")} className={keyCls} style={{ width: s, height: s, fontSize: s * 0.42 }}>
                .
              </button>
              <button type="button" onClick={() => void api.airKey("enter").catch(() => undefined)} className={keyCls + " bg-cyan-500/40"} style={{ width: s * 1.7, height: s, fontSize: s * 0.42 }}>
                ↵
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
