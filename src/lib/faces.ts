/**
 * The 3D faces (orb styles "model:<id>", drawn by docs/app/model-orb.js) and
 * how each is set up: settings.avatar holds JSON { faceId: look }.
 */
import type { FaceOptions } from "../../docs/app/glass-orb.js";
import type { FaceLook } from "../../docs/app/model-orb.js";
import type { Settings } from "./types";

export type Looks = Record<string, Partial<FaceLook>>;

export const isFace = (style?: string | null) => !!style && style.startsWith("model:");
export const faceId = (style: string) => style.replace(/^model:/, "");

/** Every face's saved look (anything else in the JSON is ignored). */
export function faceLooks(raw?: string | null): Looks {
  try {
    const v = JSON.parse(raw || "{}");
    if (!v || typeof v !== "object") return {};
    const out: Looks = {};
    for (const [k, look] of Object.entries(v)) if (look && typeof look === "object" && !Array.isArray(look)) out[k] = look as Partial<FaceLook>;
    return out;
  } catch {
    return {};
  }
}

/** What the orb needs to draw the face in use (null for a plain orb). */
export function faceFor(settings: Settings, style: string = settings.orb_style): FaceOptions | null {
  if (!isFace(style)) return null;
  return { custom: faceLooks(settings.avatar)[faceId(style)] ?? null };
}

/** settings.avatar with one face's look changed (null resets it). */
export function withLook(raw: string | undefined, id: string, look: Partial<FaceLook> | null): string {
  const all = faceLooks(raw);
  if (look) all[id] = { ...all[id], ...look };
  else delete all[id];
  return JSON.stringify(all);
}
