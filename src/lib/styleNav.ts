/**
 * Which part of the Style tab to show (Looks, Tweaks, Auto) when something
 * links there — the feature search, What's new, the Settings jump bar.
 */
export type StyleSection = "looks" | "tweaks" | "auto";

let pending: StyleSection | null = null;
const EVENT = "izk-style-section";

/** Ask the Style tab to show a section (now if it's open, or when it opens). */
export function requestStyleSection(id: string | undefined) {
  const section = id?.startsWith("style-") ? (id.slice(6) as StyleSection) : null;
  if (!section || !["looks", "tweaks", "auto"].includes(section)) return;
  pending = section;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: section }));
}

/** The section asked for before the tab opened (taken once). */
export function takeStyleSection(): StyleSection | null {
  const s = pending;
  pending = null;
  return s;
}

export function onStyleSection(fn: (s: StyleSection) => void): () => void {
  const h = (e: Event) => {
    pending = null;
    fn((e as CustomEvent<StyleSection>).detail);
  };
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
