export type Gender = "male" | "female";

export interface AvatarOptions {
  /** "auto" follows the voice. */
  gender?: "auto" | Gender;
  hair?: string;
  hairColor?: string;
  skin?: string;
  eyes?: string;
  beard?: string;
  glasses?: string;
  /** Glowing cybernetic seams and eyes. */
  tech?: boolean;
  /** Rim light / hologram colour, "#rrggbb". */
  accent?: string;
}

export function drawFace3D(
  ctx: CanvasRenderingContext2D,
  size: number,
  options: {
    mode?: "holo" | "avatar";
    gender?: Gender;
    time?: number;
    energy?: number;
    thinking?: number | boolean;
    mood?: number;
    look?: { x: number; y: number } | null;
    avatar?: AvatarOptions;
  },
): boolean;

export function genderOfVoice(voice: string, label?: string): Gender;

export const HAIR_STYLES: Record<string, string>;
export const BEARDS: Record<string, string>;
export const GLASSES: Record<string, string>;
export const SKIN_TONES: Record<string, string>;
export const HAIR_COLOURS: Record<string, string>;
export const EYE_COLOURS: Record<string, string>;
