import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { api, EV, emit, IS_TAURI, on } from "./ipc";
import type { Settings } from "./types";

/**
 * How an overlay box should look over whatever is behind it right now:
 * "dark" (light text on dark glass) over dark screens, "light" (dark text on
 * light glass) over white pages, "vivid" (gradient text on deep glass) over
 * busy, colourful ones. The overlay floats over *everything* — a single
 * fixed colour was unreadable on half of it.
 */
export type Tone = "dark" | "light" | "vivid";

/** What a box applies: a class (`izk-tone-…`) and, for a custom colour, a style. */
export interface Look {
  className: string;
  style?: CSSProperties;
}

function toneFor(luma: number, color: number): Tone {
  if (luma > 0.6) return "light";
  if (color > 0.35 && luma > 0.22) return "vivid";
  return "dark";
}

/**
 * Keep `ref`'s box readable: matched to the screen around it (measured about
 * once a second while `active`, switched only once two looks agree, so it
 * never flickers while a page scrolls past) — or the fixed look chosen in
 * Settings (Dark, Light, Gradient, or a custom text colour).
 */
export function useBackdropTone(ref: RefObject<HTMLElement | null>, active = true): Look {
  const [tone, setTone] = useState<Tone>("dark");
  const [choice, setChoice] = useState<Pick<Settings, "chat_style" | "chat_color">>({
    chat_style: "auto",
    chat_color: "#7dd3fc",
  });
  const pending = useRef<Tone | null>(null);

  useEffect(() => {
    if (!active || !IS_TAURI) return;
    let alive = true;
    const look = async () => {
      // (This window's store has no real settings — ask each time; cheap.)
      const s = await api.getSettings().catch(() => null);
      if (!alive) return;
      if (s) setChoice({ chat_style: s.chat_style ?? "auto", chat_color: s.chat_color ?? "#7dd3fc" });
      if (s && s.chat_style && s.chat_style !== "auto") return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const b = await api.screenBackdrop(r.x, r.y, r.width, r.height, window.devicePixelRatio || 1).catch(() => null);
      if (!alive || !b) return;
      const next = toneFor(b.luma, b.color);
      setTone((cur) => {
        if (next === cur) {
          pending.current = null;
          return cur;
        }
        if (pending.current === next) {
          pending.current = null;
          return next;
        }
        pending.current = next;
        return cur;
      });
    };
    void look();
    const t = setInterval(() => void look(), 1100);
    // A colour picked (in the chat, or in Settings): every box switches now.
    const off = on<Partial<Settings>>(EV.patchSettings, (p) => {
      if (p.chat_style === undefined && p.chat_color === undefined) return;
      setChoice((c) => ({ chat_style: p.chat_style ?? c.chat_style, chat_color: p.chat_color ?? c.chat_color }));
    });
    return () => {
      alive = false;
      clearInterval(t);
      void off.then((f) => f());
    };
  }, [ref, active]);

  switch (choice.chat_style) {
    case "dark":
      return { className: "izk-tone-dark" };
    case "light":
      return { className: "izk-tone-light" };
    case "gradient":
      return { className: "izk-tone-vivid" };
    case "custom":
      return {
        className: "izk-tone-dark izk-tone-custom",
        style: { ["--color-izk-ink" as string]: choice.chat_color, ["--izk-custom" as string]: choice.chat_color },
      };
    default:
      return { className: `izk-tone-${tone}` };
  }
}

/**
 * Pick how the chat and captions look, from any window — saved by the main
 * window (this one may be the overlay, which can't save settings itself),
 * and applied to every box on screen straight away.
 */
export function setChatLook(chat_style: Settings["chat_style"], chat_color?: string) {
  const patch: Partial<Settings> = chat_color ? { chat_style, chat_color } : { chat_style };
  void emit(EV.patchSettings, patch);
}
