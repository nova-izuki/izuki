/**
 * The 3D face's look (settings.avatar, JSON) and who it is: "auto" follows
 * the voice — a male voice gets the man's face, a female voice the woman's.
 */
import { genderOfVoice, type AvatarOptions, type Gender } from "../../docs/app/face3d.js";
import { catalogNow, voiceFor } from "./personas";
import type { Settings } from "./types";

export type { AvatarOptions } from "../../docs/app/face3d.js";

export function parseAvatar(raw?: string | null): AvatarOptions {
  try {
    const v = JSON.parse(raw || "{}");
    return v && typeof v === "object" ? (v as AvatarOptions) : {};
  } catch {
    return {};
  }
}

/** Male or female, from the choice or (on "auto") the voice in use. */
export function faceGender(settings: Settings, look: AvatarOptions = parseAvatar(settings.avatar)): Gender {
  if (look.gender === "male" || look.gender === "female") return look.gender;
  const picked = settings.persona_voice?.trim();
  if (picked) {
    const label = catalogNow().voices.find((v) => v.id === picked)?.label ?? "";
    if (label) return genderOfVoice(picked, label);
  }
  return genderOfVoice(voiceFor(settings).kokoro);
}

export function faceFor(settings: Settings): { gender: Gender; avatar: AvatarOptions } {
  const avatar = parseAvatar(settings.avatar);
  return { gender: faceGender(settings, avatar), avatar };
}
