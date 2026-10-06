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

/** The built-in faces' genders, and each one's counterpart (same family). */
const FACE_GENDER: Record<string, "male" | "female"> = {
  "holo-female": "female",
  "holo-male": "male",
  "lightskin-female": "female",
  "black-male": "male",
};
const COUNTERPART: Record<string, string> = {
  "holo-female": "holo-male",
  "holo-male": "holo-female",
  "lightskin-female": "black-male",
  "black-male": "lightskin-female",
};

/** A built-in face's gender (null for your own faces — not guessed). */
export function faceGender(style: string): "male" | "female" | null {
  return isFace(style) ? FACE_GENDER[faceId(style)] ?? null : null;
}

/**
 * "Match voice and character": the face to show for a voice of this gender,
 * in the same family (hologram ↔ hologram) — or null to leave the look alone
 * (a plain orb, your own face, or one that already matches).
 */
export function faceForVoice(style: string, male: boolean): string | null {
  const g = faceGender(style);
  if (!g || (g === "male") === male) return null;
  const other = COUNTERPART[faceId(style)];
  return other ? `model:${other}` : null;
}

/** settings.avatar with one face's look changed (null resets it). */
export function withLook(raw: string | undefined, id: string, look: Partial<FaceLook> | null): string {
  const all = faceLooks(raw);
  if (look) all[id] = { ...all[id], ...look };
  else delete all[id];
  return JSON.stringify(all);
}
