/**
 * App colour themes: three colours that tint the glow behind the glass.
 * "auto" follows the time of day — golden mornings, ocean days, sunset
 * evenings, deep violet nights. "custom" builds the three from one colour.
 */
export type Rgb = [number, number, number];

export const THEMES: Record<string, { name: string; a: Rgb; b: Rgb; c: Rgb }> = {
  nova: { name: "Nova", a: [138, 108, 255], b: [78, 205, 196], c: [91, 141, 255] },
  ocean: { name: "Ocean", a: [14, 165, 233], b: [34, 211, 238], c: [59, 130, 246] },
  sunset: { name: "Sunset", a: [249, 115, 22], b: [236, 72, 153], c: [168, 85, 247] },
  forest: { name: "Forest", a: [16, 185, 129], b: [132, 204, 22], c: [20, 184, 166] },
  rose: { name: "Rose", a: [244, 63, 94], b: [217, 70, 239], c: [251, 113, 133] },
  gold: { name: "Gold", a: [234, 179, 8], b: [251, 146, 60], c: [250, 204, 21] },
  graphite: { name: "Graphite", a: [148, 163, 184], b: [100, 116, 139], c: [203, 213, 225] },
};

/** The theme for "auto" at this hour. */
export function autoTheme(hour: number): string {
  if (hour >= 5 && hour < 11) return "gold";
  if (hour >= 11 && hour < 17) return "ocean";
  if (hour >= 17 && hour < 21) return "sunset";
  return "nova";
}

function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Shift a colour's hue, for the two companions of a custom colour. */
function shift([r, g, b]: Rgb, by: number): Rgb {
  const mix = (x: number, y: number) => Math.round(x * (1 - by) + y * by);
  return [mix(r, b), mix(g, r), mix(b, g)];
}

/** The three colours to use now. */
export function themeColours(theme: string, custom: string, now = new Date()): { a: Rgb; b: Rgb; c: Rgb } {
  if (theme === "custom") {
    const base = hexToRgb(custom) ?? THEMES.nova.a;
    return { a: base, b: shift(base, 0.45), c: shift(base, 0.25) };
  }
  const key = theme === "auto" ? autoTheme(now.getHours()) : theme;
  const t = THEMES[key] ?? THEMES.nova;
  return { a: t.a, b: t.b, c: t.c };
}

/** Put the theme on the page. */
export function applyTheme(theme: string, custom: string) {
  const { a, b, c } = themeColours(theme, custom);
  const root = document.documentElement.style;
  root.setProperty("--izk-a", a.join(", "));
  root.setProperty("--izk-b", b.join(", "));
  root.setProperty("--izk-c", c.join(", "));
}
