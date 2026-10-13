/**
 * What Air control's quick gestures do — yours to change, in Settings or by
 * voice ("Hey Nova, make my pinky pinch take a screenshot").
 *
 * The gestures: thumb + middle / ring / little-finger pinches, and a quick
 * flick of the open hand left or right. (Thumb + pointing finger is always
 * click and drag; a peace sign is always scroll; a fist is always pause.)
 */

export type AirSlot = "middle" | "ring" | "pinky" | "flick_left" | "flick_right";

export const AIR_SLOTS: Array<{ id: AirSlot; label: string; words: RegExp }> = [
  { id: "middle", label: "Thumb + middle finger", words: /\bmiddle\b/ },
  { id: "ring", label: "Thumb + ring finger", words: /\bring\b/ },
  { id: "pinky", label: "Thumb + little finger", words: /\b(pinky|little|small|last)\b/ },
  { id: "flick_left", label: "Flick left", words: /\b(flick|swipe)\w*\s+(to\s+the\s+)?left\b|\bleft\s+(flick|swipe)\b/ },
  { id: "flick_right", label: "Flick right", words: /\b(flick|swipe)\w*\s+(to\s+the\s+)?right\b|\bright\s+(flick|swipe)\b/ },
];

/** An action: "click:right", "keys:<combo>" (a combo the PC's key sender knows), or "none". */
export const AIR_ACTIONS: Array<{ id: string; label: string; words: RegExp }> = [
  { id: "click:right", label: "Right-click", words: /\bright[\s-]?click/ },
  { id: "keys:ctrl+c", label: "Copy", words: /\bcopy\b/ },
  { id: "keys:ctrl+v", label: "Paste", words: /\bpaste\b/ },
  { id: "keys:ctrl+x", label: "Cut", words: /\bcut\b/ },
  { id: "keys:ctrl+z", label: "Undo", words: /\bundo\b/ },
  { id: "keys:ctrl+y", label: "Redo", words: /\bredo\b/ },
  { id: "keys:ctrl+a", label: "Select all", words: /\bselect\s+all\b/ },
  { id: "keys:alt+left", label: "Back", words: /\b(go\s+)?back\b/ },
  { id: "keys:alt+right", label: "Forward", words: /\bforward\b/ },
  { id: "keys:win+shift+s", label: "Screenshot", words: /\b(screenshot|screen\s*shot|snip)\b/ },
  { id: "keys:nexttrack", label: "Next song", words: /\bnext\s+(song|track)\b/ },
  { id: "keys:prevtrack", label: "Previous song", words: /\b(previous|last)\s+(song|track)\b/ },
  { id: "keys:playpause", label: "Play / pause music", words: /\b(play|pause)\b/ },
  { id: "keys:volumeup", label: "Volume up", words: /\bvolume\s+up\b|\blouder\b/ },
  { id: "keys:volumedown", label: "Volume down", words: /\bvolume\s+down\b|\bquieter\b/ },
  { id: "keys:volumemute", label: "Mute", words: /\bmute\b/ },
  { id: "keys:ctrl+t", label: "New tab", words: /\bnew\s+tab\b/ },
  { id: "keys:ctrl+w", label: "Close tab", words: /\bclose\s+(the\s+)?tab\b/ },
  { id: "keys:ctrl+tab", label: "Next tab", words: /\bnext\s+tab\b/ },
  { id: "keys:alt+tab", label: "Switch window", words: /\bswitch\s+(window|apps?)\b|\balt\s*tab\b/ },
  { id: "keys:win+d", label: "Show the desktop", words: /\b(show\s+(the\s+)?)?desktop\b/ },
  { id: "keys:enter", label: "Enter", words: /\b(enter|send)\b/ },
  { id: "keys:escape", label: "Escape", words: /\b(escape|esc)\b/ },
  { id: "keys:ctrl+s", label: "Save", words: /\bsave\b/ },
  { id: "none", label: "Nothing", words: /\b(nothing|none|off|disable|disabled)\b/ },
];

export const AIR_DEFAULTS: Record<AirSlot, string> = {
  middle: "click:right",
  ring: "keys:ctrl+c",
  pinky: "keys:ctrl+v",
  flick_left: "keys:alt+left",
  flick_right: "keys:alt+right",
};

/** Your bindings, with the defaults filling any gap (and anything unknown dropped). */
export function airBindings(saved: Record<string, string> | undefined): Record<AirSlot, string> {
  const out = { ...AIR_DEFAULTS };
  for (const s of AIR_SLOTS) {
    const v = saved?.[s.id];
    if (v && AIR_ACTIONS.some((a) => a.id === v)) out[s.id] = v;
  }
  return out;
}

export const actionLabel = (id: string) => AIR_ACTIONS.find((a) => a.id === id)?.label ?? id;
export const slotLabel = (id: AirSlot) => AIR_SLOTS.find((s) => s.id === id)?.label ?? id;

export type AirVoice =
  | { kind: "bind"; slot: AirSlot; action: string }
  | { kind: "mode"; mode: "fast" | "balanced" | "precision" }
  | { kind: "reset" }
  | { kind: "list" };

/**
 * A spoken or typed change to Air control: "make my pinky pinch take a
 * screenshot", "change the middle finger to undo", "set air control to
 * precision", "reset my air gestures", "what do my air gestures do".
 */
export function parseAirVoice(said: string): AirVoice | null {
  const t = ` ${said.toLowerCase().replace(/[’']/g, "'")} `;
  const aboutAir = /\b(air|hand|gesture|gestures|pinch|flick|swipe|finger)\b/.test(t);
  if (!aboutAir) return null;
  if (/\b(reset|restore|put back|go back to)\b.*\b(air|gesture|gestures)\b|\b(air|gesture|gestures)\b.*\b(back to normal|to default|defaults)\b/.test(t)) return { kind: "reset" };
  if (/\bwhat\b.*\b(my|the)\s+(air\s+)?gestures?\b.*\bdo\b|\b(list|show)\b.*\b(air\s+)?gestures\b/.test(t)) return { kind: "list" };
  const mode = t.match(/\b(air|hand)\s+(control\s+)?(to\s+|on\s+|in\s+)?(fast|balanced|precision|precise)\b|\b(fast|balanced|precision|precise)\s+mode\b/);
  if (mode && /\b(set|make|switch|put|change|turn|use)\b/.test(t)) {
    const m = (mode[4] || mode[5]) as string;
    return { kind: "mode", mode: m === "precise" ? "precision" : (m as "fast" | "balanced" | "precision") };
  }
  // "make / change / set / move / use … <gesture> … to/for/do <action>"
  if (!/\b(make|change|set|move|use|map|bind|switch|turn)\b/.test(t)) return null;
  const slot = AIR_SLOTS.find((s) => s.words.test(t));
  if (!slot) return null;
  // The action is what's said after the gesture ("…pinky to screenshot").
  const after = t.slice(t.search(slot.words));
  const action = AIR_ACTIONS.find((a) => a.words.test(after.replace(slot.words, " ")));
  return action ? { kind: "bind", slot: slot.id, action: action.id } : null;
}
