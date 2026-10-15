//! Windows looks: one tap (or "make my PC look Nova") changes how Windows looks —
//! dark or light, an accent colour on the taskbar, Start and window title
//! bars, see-through effects, and a wallpaper Izuki paints to fit your
//! screen. Everything is Windows' own personal settings (HKCU, no admin) and
//! Windows' own accent-colour call — nothing is injected into Explorer.
//!
//! The first time a look changes anything, what you had is saved
//! (`%APPDATA%\Izuki\looks.json`, your wallpaper copied beside it), and
//! "Undo" puts all of it back. Applying more looks keeps that first save.
//!
//! Not here: TranslucentTB-style see-through taskbars. On Windows 11 the
//! taskbar draws its own background and TranslucentTB now injects code into
//! Explorer to restyle it. The old injection-free call is accepted here, but
//! a visible effect couldn't be confirmed (the screen was locked), so it isn't
//! offered.

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

const THEME: &str = r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize";
const DWM: &str = r"Software\Microsoft\Windows\DWM";
const ACCENT: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Accent";
const DESK: &str = r"Control Panel\Desktop";
/// Which kind of background: 0 picture, 1 colour, 2 slideshow, 3 Spotlight.
const WALLPAPERS: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Wallpapers";

/// Every value a look can change — saved before the first change, put back by Undo.
const TOUCHED: &[(&str, &str)] = &[
    (THEME, "AppsUseLightTheme"),
    (THEME, "SystemUsesLightTheme"),
    (THEME, "EnableTransparency"),
    (THEME, "ColorPrevalence"),
    (DWM, "ColorPrevalence"),
    (DWM, "AccentColor"),
    (DWM, "ColorizationColor"),
    (DWM, "ColorizationAfterglow"),
    (ACCENT, "AccentPalette"),
    (ACCENT, "AccentColorMenu"),
    (ACCENT, "StartColorMenu"),
    (DESK, "AutoColorization"),
    (DESK, "WallpaperStyle"),
    (DESK, "TileWallpaper"),
];

/// A soft glow on the wallpaper: where (0–1 across and down), how wide
/// (fraction of the screen width), its colour, how strong.
type Glow = (f32, f32, f32, u32, f32);

/// A picture drawn over the gradient and glows.
enum Extra {
    /// Small round stars: chance of one per grid cell (0–1), colour.
    Stars(f32, u32),
    /// Warm sparks, more of them toward the bottom: chance per cell, colour.
    Sparks(f32, u32),
    /// A planet's edge: its top (0–1 down the screen), radius (screen
    /// widths), atmosphere colour, planet colour.
    Horizon(f32, f32, u32, u32),
    /// Aurora: a bright lower edge at a height (0–1 down), rays rising from it, colour.
    Aurora(f32, u32),
    /// Misty mountain ridges, far to near: how many, the nearest colour.
    Ridges(u8, u32),
    /// Soft out-of-focus lights: how many, colour.
    Bokeh(u8, u32),
    /// Fine flowing lines: how many, colour.
    Lines(u8, u32),
    /// One thin glowing ring: centre (0–1 across, 0–1 down), radius (screen widths), colour.
    Ring(f32, f32, f32, u32),
}

struct Wall {
    top: u32,
    bottom: u32,
    glows: &'static [Glow],
    extras: &'static [Extra],
}

struct Preset {
    id: &'static str,
    name: &'static str,
    blurb: &'static str,
    dark: bool,
    accent: u32,
    /// Accent colour on the taskbar and Start (Windows allows it in dark mode only).
    bars: bool,
    /// Accent colour on window title bars and borders.
    titles: bool,
    /// See-through effects.
    glass: bool,
    wall: Wall,
}

const PRESETS: &[Preset] = &[
    Preset {
        id: "nova",
        name: "Nova",
        blurb: "A planet's glowing edge under the stars — Izuki's own look.",
        dark: true,
        accent: 0x0EA5C6,
        bars: true,
        titles: true,
        glass: true,
        wall: Wall {
            top: 0x030612,
            bottom: 0x0A1236,
            glows: &[(0.80, 0.22, 0.42, 0x22D3EE, 0.30), (0.14, 0.28, 0.45, 0x7C3AED, 0.32)],
            extras: &[Extra::Stars(0.07, 0xCFE8FF), Extra::Horizon(0.74, 1.5, 0x22D3EE, 0x02040B)],
        },
    },
    Preset {
        id: "midnight",
        name: "Midnight",
        blurb: "Violet and pink northern lights over dark mountains.",
        dark: true,
        accent: 0x8B5CF6,
        bars: false,
        titles: true,
        glass: true,
        wall: Wall {
            top: 0x04020B,
            bottom: 0x0E0620,
            glows: &[(0.30, 0.55, 0.50, 0x4C1D95, 0.35), (0.85, 0.45, 0.40, 0xDB2777, 0.15)],
            extras: &[Extra::Stars(0.06, 0xEDE9FE), Extra::Aurora(0.52, 0x8B5CF6), Extra::Aurora(0.48, 0xDB2777), Extra::Ridges(2, 0x030109)],
        },
    },
    Preset {
        id: "ember",
        name: "Ember",
        blurb: "Warm sparks rising from an orange glow.",
        dark: true,
        accent: 0xEA580C,
        bars: true,
        titles: true,
        glass: true,
        wall: Wall {
            top: 0x0A0402,
            bottom: 0x1C0905,
            glows: &[(0.68, 0.95, 0.55, 0xF97316, 0.50), (0.18, 0.40, 0.38, 0xDC2626, 0.28), (0.95, 0.10, 0.30, 0xF59E0B, 0.18)],
            extras: &[Extra::Sparks(0.22, 0xFDBA74)],
        },
    },
    Preset {
        id: "forest",
        name: "Forest",
        blurb: "Misty mountains under a green night sky.",
        dark: true,
        accent: 0x16A34A,
        bars: false,
        titles: true,
        glass: true,
        wall: Wall {
            top: 0x020A08,
            bottom: 0x0B2A1C,
            glows: &[(0.66, 0.42, 0.45, 0x34D399, 0.32), (0.20, 0.15, 0.35, 0x14B8A6, 0.20)],
            extras: &[Extra::Stars(0.05, 0xD1FAE5), Extra::Ridges(4, 0x010604)],
        },
    },
    Preset {
        id: "sakura",
        name: "Sakura",
        blurb: "Light and soft — pink and peach with floating lights.",
        dark: false,
        accent: 0xDB2777,
        bars: false,
        titles: true,
        glass: true,
        wall: Wall {
            top: 0xFFF5F8,
            bottom: 0xFCE7F3,
            glows: &[(0.20, 0.30, 0.45, 0xF9A8D4, 0.60), (0.80, 0.75, 0.45, 0xFED7AA, 0.55), (0.75, 0.15, 0.35, 0xDDD6FE, 0.55)],
            extras: &[Extra::Bokeh(18, 0xFFFFFF), Extra::Bokeh(10, 0xF472B6)],
        },
    },
    Preset {
        id: "paper",
        name: "Paper",
        blurb: "Clean and bright, with fine flowing lines, for daytime work.",
        dark: false,
        accent: 0x2563EB,
        bars: false,
        titles: false,
        glass: true,
        wall: Wall {
            top: 0xF8FAFC,
            bottom: 0xE2E8F0,
            glows: &[(0.85, 0.20, 0.45, 0xBFDBFE, 0.60), (0.15, 0.85, 0.40, 0xE0E7FF, 0.55)],
            extras: &[Extra::Lines(18, 0x60A5FA)],
        },
    },
    Preset {
        id: "focus",
        name: "Focus",
        blurb: "Dark grey and one quiet ring, no see-through effects — calm, and a little faster on a slow PC.",
        dark: true,
        accent: 0x64748B,
        bars: false,
        titles: false,
        glass: false,
        wall: Wall {
            top: 0x0B0B0C,
            bottom: 0x121315,
            glows: &[(0.50, 0.50, 0.50, 0x334155, 0.22)],
            extras: &[Extra::Ring(0.5, 0.5, 0.21, 0x94A3B8)],
        },
    },
];

/// Accent colours offered as swatches (and understood by name).
const COLOURS: &[(&str, u32)] = &[
    ("red", 0xDC2626),
    ("orange", 0xEA580C),
    ("gold", 0xCA8A04),
    ("yellow", 0xCA8A04),
    ("green", 0x16A34A),
    ("teal", 0x0D9488),
    ("cyan", 0x0EA5C6),
    ("blue", 0x2563EB),
    ("navy", 0x1E3A8A),
    ("purple", 0x7C3AED),
    ("violet", 0x8B5CF6),
    ("pink", 0xDB2777),
    ("magenta", 0xC026D3),
    ("grey", 0x64748B),
    ("gray", 0x64748B),
];

#[derive(Debug, Clone, Serialize)]
pub struct PresetInfo {
    pub id: &'static str,
    pub name: &'static str,
    pub blurb: &'static str,
    pub accent: String,
    pub dark: bool,
    pub bars: bool,
    pub titles: bool,
    /// A CSS background that looks like the wallpaper, for the preview card.
    pub preview: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Status {
    pub presets: Vec<PresetInfo>,
    pub swatches: Vec<(String, String)>,
    /// Read live from Windows.
    pub accent: String,
    pub dark: bool,
    pub glass: bool,
    pub bars: bool,
    pub titles: bool,
    /// The look last applied by Izuki (if nothing was changed by hand since).
    pub current: Option<String>,
    pub can_undo: bool,
    /// Something to tell you after a change (e.g. how to turn Spotlight back on).
    pub note: Option<String>,
}

/// A registry value exactly as it was: its type and bytes (None = it didn't exist).
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Saved {
    key: String,
    name: String,
    raw: Option<(u32, Vec<u8>)>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct Before {
    values: Vec<Saved>,
    /// The wallpaper file Windows was showing ("" = a plain colour).
    wallpaper: String,
    /// A copy of it, in case the original moves or was Windows' own temporary copy.
    wallpaper_copy: Option<String>,
    /// Your wallpaper slideshow, if you had one: folders, options, ms per picture.
    #[serde(default)]
    slideshow: Option<(Vec<String>, i32, u32)>,
    /// Windows Spotlight pictures were on (only Settings can turn them back on).
    #[serde(default)]
    spotlight: bool,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct Memory {
    before: Option<Before>,
    current: Option<String>,
}

fn dir() -> std::path::PathBuf {
    crate::store::data_dir().join("looks")
}

fn memory_path() -> std::path::PathBuf {
    crate::store::data_dir().join("looks.json")
}

fn memory() -> Memory {
    std::fs::read_to_string(memory_path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn remember(m: &Memory) -> Result<()> {
    let p = memory_path();
    let _ = std::fs::create_dir_all(crate::store::data_dir());
    let tmp = p.with_extension("json.tmp");
    std::fs::write(&tmp, serde_json::to_string_pretty(m)?)?;
    std::fs::rename(&tmp, &p)?;
    Ok(())
}

/// One change at a time (a voice command and a tap at once must not interleave).
static TURN: std::sync::Mutex<()> = std::sync::Mutex::new(());

fn hex(rgb: u32) -> String {
    format!("#{:06x}", rgb & 0xFF_FFFF)
}

fn parse_hex(s: &str) -> Option<u32> {
    let t = s.trim().trim_start_matches('#');
    (t.len() == 6).then(|| u32::from_str_radix(t, 16).ok()).flatten()
}

fn rgb_parts(c: u32) -> (u8, u8, u8) {
    ((c >> 16) as u8, (c >> 8) as u8, c as u8)
}

/// Windows stores colours as 0xAABBGGRR.
fn abgr(c: u32) -> u32 {
    let (r, g, b) = rgb_parts(c);
    0xFF00_0000 | (b as u32) << 16 | (g as u32) << 8 | r as u32
}

fn from_abgr(v: u32) -> u32 {
    (v & 0xFF) << 16 | (v & 0xFF00) | (v >> 16) & 0xFF
}

/// Towards white (k > 0) or black (k < 0).
fn shade(c: u32, k: f32) -> u32 {
    let (r, g, b) = rgb_parts(c);
    let f = |v: u8| -> u32 {
        let v = v as f32;
        (if k >= 0.0 { v + (255.0 - v) * k } else { v * (1.0 + k) }).round().clamp(0.0, 255.0) as u32
    };
    f(r) << 16 | f(g) << 8 | f(b)
}

/// Windows' accent palette: three lighter shades, the colour, three darker
/// ones, and one extra — 8 × (R, G, B, 0).
fn palette(c: u32) -> [u8; 32] {
    let shades = [shade(c, 0.55), shade(c, 0.35), shade(c, 0.15), c, shade(c, -0.2), shade(c, -0.42), shade(c, -0.68), 0x881798];
    let mut out = [0u8; 32];
    for (i, s) in shades.iter().enumerate() {
        let (r, g, b) = rgb_parts(*s);
        out[i * 4..i * 4 + 4].copy_from_slice(&[r, g, b, 0]);
    }
    out
}

fn css_rgba(c: u32, a: f32) -> String {
    let (r, g, b) = rgb_parts(c);
    format!("rgba({r},{g},{b},{:.2})", a.clamp(0.0, 1.0))
}

fn preview_css(w: &Wall) -> String {
    let mut parts: Vec<String> = w
        .glows
        .iter()
        .map(|(x, y, r, c, s)| format!("radial-gradient(circle at {:.0}% {:.0}%, {} 0%, transparent {:.0}%)", x * 100.0, y * 100.0, css_rgba(*c, *s), r * 100.0))
        .collect();
    parts.push(format!("linear-gradient(180deg, {} 0%, {} 100%)", hex(w.top), hex(w.bottom)));
    parts.join(", ")
}

fn hash(a: u32, b: u32, seed: u32) -> u32 {
    let mut h = a.wrapping_mul(374_761_393) ^ b.wrapping_mul(668_265_263) ^ seed.wrapping_mul(2_246_822_519);
    h = (h ^ (h >> 13)).wrapping_mul(1_274_126_177);
    h ^ (h >> 16)
}

/// 0–1 from a hash.
fn unit(h: u32) -> f32 {
    (h & 0xFFFF) as f32 / 65535.0
}

fn smoothstep(e0: f32, e1: f32, x: f32) -> f32 {
    let t = ((x - e0) / (e1 - e0)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

fn rgb_f(c: u32) -> [f32; 3] {
    let (r, g, b) = rgb_parts(c);
    [r as f32, g as f32, b as f32]
}

/// Light added (dark looks) or blended in (light looks).
fn light(c: &mut [f32; 3], col: [f32; 3], a: f32, dark: bool) {
    for i in 0..3 {
        c[i] = if dark { c[i] + col[i] * a } else { c[i] * (1.0 - a) + col[i] * a };
    }
}

fn mix(c: &mut [f32; 3], col: [f32; 3], a: f32) {
    for i in 0..3 {
        c[i] = c[i] * (1.0 - a) + col[i] * a;
    }
}

/// A round dot in a grid cell (stars, sparks): how bright this pixel is.
fn dot_in_cell(x: f32, y: f32, cell: f32, chance: f32, seed: u32, size: f32, halo: f32) -> f32 {
    let (cx, cy) = ((x / cell).floor() as u32, (y / cell).floor() as u32);
    if unit(hash(cx, cy, seed)) >= chance {
        return 0.0;
    }
    let sx = (cx as f32 + 0.25 + 0.5 * unit(hash(cx, cy, seed + 1))) * cell;
    let sy = (cy as f32 + 0.25 + 0.5 * unit(hash(cx, cy, seed + 2))) * cell;
    let k = unit(hash(cx, cy, seed + 3));
    let r = cell * size * (0.35 + 0.65 * k * k * k);
    let bright = 0.3 + 0.7 * unit(hash(cx, cy, seed + 4)).powi(2);
    let d = ((x + 0.5 - sx).powi(2) + (y + 0.5 - sy).powi(2)).sqrt();
    bright * ((1.0 - (d - r)).clamp(0.0, 1.0) + halo * (-(d / (r * 3.5)).powi(2)).exp())
}

/// Paint a wallpaper: a vertical gradient, soft glows, the look's picture
/// (stars, a planet's edge, mountains…), a gentle vignette on dark looks,
/// and a little grain so gradients never show bands.
fn paint(w: &Wall, dark: bool, width: u32, height: u32) -> image::RgbImage {
    let top = rgb_f(w.top);
    let bottom = rgb_f(w.bottom);
    let glows: Vec<(f32, f32, f32, [f32; 3], f32)> = w.glows.iter().map(|(x, y, r, c, s)| (*x, *y, *r, rgb_f(*c), *s)).collect();
    let wf = width as f32;
    let hf = height as f32;
    // Distances are in screen widths, so shapes stay round on any screen.
    let aspect = hf / wf;
    image::RgbImage::from_fn(width, height, |px, py| {
        let (x, y) = (px as f32, py as f32);
        let u = x / wf;
        let v = y / hf;
        let mut c = [0f32; 3];
        for i in 0..3 {
            c[i] = top[i] + (bottom[i] - top[i]) * v;
        }
        for (gx, gy, gr, gc, gs) in &glows {
            let dx = u - gx;
            let dy = (v - gy) * aspect;
            let a = gs * (-2.2 * (dx * dx + dy * dy) / (gr * gr)).exp();
            light(&mut c, *gc, a, dark);
        }
        let sky = c;
        for (n, extra) in w.extras.iter().enumerate() {
            let seed = 10 + n as u32 * 10;
            match *extra {
                Extra::Stars(chance, col) => {
                    let cell = (hf / 110.0).max(6.0);
                    let a = dot_in_cell(x, y, cell, chance, seed, 0.16, 0.25);
                    light(&mut c, rgb_f(col), a * 0.9, true);
                }
                Extra::Sparks(chance, col) => {
                    let cell = (hf / 80.0).max(8.0);
                    let a = dot_in_cell(x, y, cell, chance * (0.15 + v * v), seed, 0.14, 0.6);
                    light(&mut c, rgb_f(col), a * (0.25 + 0.75 * v), true);
                }
                Extra::Horizon(top_at, radius, rim, planet) => {
                    let dx = u - 0.5;
                    let dy = v * aspect - (top_at * aspect + radius);
                    let e = (dx * dx + dy * dy).sqrt() - radius;
                    let (rim, planet) = (rgb_f(rim), rgb_f(planet));
                    let mut inside = c;
                    mix(&mut inside, planet, 0.94);
                    // Light from the atmosphere, fading into the planet.
                    light(&mut inside, rim, 0.55 * (e / 0.014).exp() + 0.08 * (e / 0.12).exp(), true);
                    let mut outside = c;
                    light(&mut outside, rim, 0.9 * (-(e / 0.004).powi(2)).exp() + 0.42 * (-e / 0.05).exp(), true);
                    let s = smoothstep(-1.2 / wf, 1.2 / wf, e);
                    for i in 0..3 {
                        c[i] = inside[i] * (1.0 - s) + outside[i] * s;
                    }
                }
                Extra::Aurora(height, col) => {
                    let line = height + 0.06 * (u * 5.0 + seed as f32).sin() + 0.03 * (u * 11.0 + 0.7 * seed as f32).sin();
                    // Above the edge (t > 0) the rays fade upward; below it, a quick fade.
                    let t = line - v;
                    if t > -0.03 {
                        let hang = (-t.max(0.0) / 0.2).exp() * smoothstep(-0.03, 0.0, t);
                        let rays = (0.55 + 0.45 * (u * 70.0 + 4.0 * (u * 9.0 + seed as f32).sin()).sin()).powi(2);
                        let sway = 0.6 + 0.4 * (u * 3.0 + 2.0 + seed as f32).sin();
                        light(&mut c, rgb_f(col), 0.5 * hang * (0.35 + 0.65 * rays) * sway, true);
                    }
                }
                Extra::Ridges(layers, near) => {
                    let near = rgb_f(near);
                    // Ridges stand in front of the stars: they're mixed from the plain sky.
                    let sky = sky;
                    for i in 0..layers {
                        let fi = i as f32;
                        let k = (fi + 1.0) / layers as f32;
                        let base = 0.56 + 0.36 * fi / layers as f32;
                        let amp = 0.10 - 0.012 * fi;
                        // Rolling hills plus sharper peaks.
                        let ridge = base
                            - amp * (0.45 * (u * (3.0 + fi) * 1.7 + fi * 1.9).sin() + 0.25 * (u * (7.0 + 2.0 * fi) * 1.3 + fi * 0.7).sin() + 0.12 * (u * (19.0 + 3.0 * fi) + fi * 2.3).sin())
                            - amp * 0.5 * (1.0 - (u * (5.0 + fi) * 2.1 + fi * 3.1).sin().abs());
                        let s = smoothstep(ridge - 1.0 / hf, ridge + 1.0 / hf, v);
                        if s > 0.0 {
                            // Far ridges fade into the mist; near ones are almost black.
                            let mut layer = sky;
                            mix(&mut layer, near, 0.3 + 0.7 * k);
                            // Mist on each ridge's top, more on far ones.
                            let mist = (-(v - ridge).max(0.0) / 0.06).exp() * 0.55 * (1.0 - k);
                            mix(&mut layer, sky, mist);
                            mix(&mut c, layer, s);
                        }
                    }
                }
                Extra::Bokeh(count, col) => {
                    let col = rgb_f(col);
                    for i in 0..count as u32 {
                        let bx = unit(hash(i, 0, seed));
                        let by = unit(hash(i, 1, seed));
                        let r = 0.015 + 0.06 * unit(hash(i, 2, seed)).powi(2);
                        let strength = 0.12 + 0.22 * unit(hash(i, 3, seed));
                        let d = ((u - bx).powi(2) + ((v - by) * aspect).powi(2)).sqrt();
                        if d < r * 1.3 {
                            let disc = smoothstep(r, r * 0.9, d);
                            let edge = (-((d - r * 0.95) / (r * 0.07)).powi(2)).exp() * 0.5;
                            light(&mut c, col, strength * (disc * 0.7 + edge), dark);
                        }
                    }
                }
                Extra::Lines(count, col) => {
                    let col = rgb_f(col);
                    let width_px = (hf / 900.0).max(0.8);
                    for k in 0..count {
                        let f = k as f32 / count as f32;
                        // Side by side, gently drawing together and apart.
                        let yk = 0.2 + 0.62 * f + 0.08 * (u * 3.2 + 1.0 + f * 1.3).sin() + 0.025 * (u * 7.5 + f * 2.2).sin();
                        let t = (v - yk) * hf / width_px;
                        if t.abs() < 4.0 {
                            light(&mut c, col, 0.28 * (-(t * t)).exp() * (0.4 + 0.6 * u), dark);
                        }
                    }
                }
                Extra::Ring(rx, ry, radius, col) => {
                    let d = ((u - rx).powi(2) + ((v - ry) * aspect).powi(2)).sqrt();
                    let e = d - radius;
                    let a = 0.55 * (-(e * wf / 1.4).powi(2)).exp() + 0.18 * (-(e / 0.025).powi(2)).exp();
                    light(&mut c, rgb_f(col), a, dark);
                }
            }
        }
        let vignette = if dark {
            let (dx, dy) = (u - 0.5, v - 0.5);
            1.0 - 0.35 * (dx * dx + dy * dy)
        } else {
            1.0
        };
        // Cheap, steady grain from the pixel position (±1.5 levels).
        let grain = ((hash(px, py, 1) >> 8) & 0xFF) as f32 / 255.0 * 3.0 - 1.5;
        let px = |x: f32| (x * vignette + grain).round().clamp(0.0, 255.0) as u8;
        image::Rgb([px(c[0]), px(c[1]), px(c[2])])
    })
}

/// A small picture of each look's wallpaper for its card (a JPEG data URL),
/// painted once.
fn previews() -> &'static Vec<String> {
    static ALL: std::sync::OnceLock<Vec<String>> = std::sync::OnceLock::new();
    ALL.get_or_init(|| {
        use base64::Engine;
        PRESETS
            .iter()
            .map(|p| {
                let img = paint(&p.wall, p.dark, 320, 200);
                let mut bytes = Vec::new();
                match image::codecs::jpeg::JpegEncoder::new_with_quality(&mut bytes, 82).encode_image(&img) {
                    Ok(()) => format!("url(data:image/jpeg;base64,{}) center / cover, {}", base64::engine::general_purpose::STANDARD.encode(&bytes), preview_css(&p.wall)),
                    Err(_) => preview_css(&p.wall),
                }
            })
            .collect()
    })
}

fn screen_size() -> (u32, u32) {
    #[cfg(windows)]
    {
        // The screen's real pixels (display scaling would otherwise report
        // 1280×720 for a 1920×1080 screen at 150%).
        use windows::Win32::Graphics::Gdi::{EnumDisplaySettingsW, DEVMODEW, ENUM_CURRENT_SETTINGS};
        let mut mode = DEVMODEW { dmSize: std::mem::size_of::<DEVMODEW>() as u16, ..Default::default() };
        let ok = unsafe { EnumDisplaySettingsW(None, ENUM_CURRENT_SETTINGS, &mut mode) }.as_bool();
        let (w, h) = if ok { (mode.dmPelsWidth as i32, mode.dmPelsHeight as i32) } else { (0, 0) };
        if w > 0 && h > 0 {
            // Big screens are painted at up to 4K; Windows scales the rest.
            let scale = (3840.0 / w as f32).min(1.0);
            return (((w as f32 * scale) as u32).max(640), ((h as f32 * scale) as u32).max(360));
        }
    }
    (1920, 1080)
}

/// The wallpaper for a look, painted once per screen size.
fn wallpaper_for(p: &Preset) -> Result<std::path::PathBuf> {
    let (w, h) = screen_size();
    let d = dir();
    std::fs::create_dir_all(&d)?;
    let file = d.join(format!("{}-{w}x{h}.jpg", p.id));
    if !file.exists() {
        let img = paint(&p.wall, p.dark, w, h);
        let tmp = file.with_extension("tmp.jpg");
        let mut out = std::io::BufWriter::new(std::fs::File::create(&tmp)?);
        image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, 95).encode_image(&img)?;
        drop(out);
        std::fs::rename(&tmp, &file)?;
    }
    Ok(file)
}

/// Save what you had, the first time anything changes.
fn save_before() -> Result<()> {
    let mut m = memory();
    if m.before.is_some() {
        return Ok(());
    }
    let values = TOUCHED.iter().map(|(k, n)| Saved { key: k.to_string(), name: n.to_string(), raw: win::get_raw(k, n) }).collect();
    let wallpaper = win::wallpaper();
    let mut wallpaper_copy = None;
    if !wallpaper.is_empty() && std::path::Path::new(&wallpaper).exists() {
        let ext = std::path::Path::new(&wallpaper).extension().and_then(|e| e.to_str()).unwrap_or("jpg").to_string();
        let copy = dir().join(format!("before-wallpaper.{ext}"));
        std::fs::create_dir_all(dir())?;
        if std::fs::copy(&wallpaper, &copy).is_ok() {
            wallpaper_copy = Some(copy.to_string_lossy().to_string());
        }
    }
    let slideshow = win::slideshow();
    let spotlight = win::get_dword(WALLPAPERS, "BackgroundType") == Some(3);
    m.before = Some(Before { values, wallpaper, wallpaper_copy, slideshow, spotlight });
    remember(&m)
}

fn set_dword(key: &str, name: &str, v: u32) -> Result<()> {
    win::set_raw(key, name, win::REG_DWORD, &v.to_le_bytes())
}

/// The accent colour everywhere Windows keeps it, then Windows' own call so
/// it shows straight away.
fn put_accent(c: u32) -> Result<()> {
    let pal = palette(c);
    let start = abgr(u32::from_be_bytes([0, pal[16], pal[17], pal[18]]));
    win::set_raw(ACCENT, "AccentPalette", win::REG_BINARY, &pal)?;
    set_dword(ACCENT, "AccentColorMenu", abgr(c))?;
    set_dword(ACCENT, "StartColorMenu", start)?;
    set_dword(DWM, "AccentColor", abgr(c))?;
    let argb = 0xC400_0000 | (c & 0xFF_FFFF);
    set_dword(DWM, "ColorizationColor", argb)?;
    set_dword(DWM, "ColorizationAfterglow", argb)?;
    // "Pick an accent colour from my background" off, or Windows changes it back.
    if let Some((kind, _)) = win::get_raw(DESK, "AutoColorization") {
        if kind == win::REG_DWORD {
            set_dword(DESK, "AutoColorization", 0)?;
        } else {
            win::set_raw(DESK, "AutoColorization", kind, &win::wide("0"))?;
        }
    }
    win::set_user_colour(start, abgr(c));
    Ok(())
}

fn put_switches(dark: bool, glass: bool, bars: bool, titles: bool) -> Result<()> {
    let light = u32::from(!dark);
    set_dword(THEME, "AppsUseLightTheme", light)?;
    set_dword(THEME, "SystemUsesLightTheme", light)?;
    set_dword(THEME, "EnableTransparency", u32::from(glass))?;
    // Windows only shows the accent on the taskbar and Start in dark mode.
    set_dword(THEME, "ColorPrevalence", u32::from(bars && dark))?;
    set_dword(DWM, "ColorPrevalence", u32::from(titles))?;
    Ok(())
}

fn put_wallpaper(file: &str) -> Result<()> {
    // Fill the screen, not tiled.
    win::set_raw(DESK, "WallpaperStyle", win::REG_SZ, &win::wide("10"))?;
    win::set_raw(DESK, "TileWallpaper", win::REG_SZ, &win::wide("0"))?;
    win::set_wallpaper(file)
}

/// Apply a whole look. `wallpaper: false` keeps your picture.
pub fn apply(id: &str, wallpaper: bool) -> Result<Status> {
    let _turn = TURN.lock().unwrap_or_else(|e| e.into_inner());
    let p = PRESETS.iter().find(|p| p.id == id).ok_or_else(|| anyhow!("there's no look called {id}"))?;
    // Paint first: if that fails, nothing has changed yet.
    let file = if wallpaper { Some(wallpaper_for(p)?) } else { None };
    save_before()?;
    put_switches(p.dark, p.glass, p.bars, p.titles)?;
    put_accent(p.accent)?;
    if let Some(f) = file {
        put_wallpaper(&f.to_string_lossy())?;
    }
    win::announce();
    let mut m = memory();
    m.current = Some(p.id.to_string());
    remember(&m)?;
    eprintln!("[looks] applied {}{}", p.id, if wallpaper { " with wallpaper" } else { "" });
    Ok(status_now(m))
}

/// Just the accent colour ("#rrggbb").
pub fn set_accent(colour: &str) -> Result<Status> {
    let _turn = TURN.lock().unwrap_or_else(|e| e.into_inner());
    let c = parse_hex(colour).ok_or_else(|| anyhow!("that isn't a colour ({colour})"))?;
    save_before()?;
    put_accent(c)?;
    win::announce();
    let mut m = memory();
    m.current = None;
    remember(&m)?;
    eprintln!("[looks] accent {}", hex(c));
    Ok(status_now(m))
}

/// One switch: "dark", "glass", "bars" or "titles".
pub fn set_switch(name: &str, on: bool) -> Result<Status> {
    let _turn = TURN.lock().unwrap_or_else(|e| e.into_inner());
    save_before()?;
    match name {
        "dark" => {
            set_dword(THEME, "AppsUseLightTheme", u32::from(!on))?;
            set_dword(THEME, "SystemUsesLightTheme", u32::from(!on))?;
            if !on {
                // Light mode can't show the accent on the taskbar.
                set_dword(THEME, "ColorPrevalence", 0)?;
            }
        }
        "glass" => set_dword(THEME, "EnableTransparency", u32::from(on))?,
        "bars" => {
            if on && win::get_dword(THEME, "SystemUsesLightTheme") == Some(1) {
                return Err(anyhow!("Windows only shows the accent on the taskbar and Start in dark mode — turn dark mode on first."));
            }
            set_dword(THEME, "ColorPrevalence", u32::from(on))?
        }
        "titles" => set_dword(DWM, "ColorPrevalence", u32::from(on))?,
        _ => return Err(anyhow!("no switch called {name}")),
    }
    win::announce();
    let mut m = memory();
    m.current = None;
    remember(&m)?;
    Ok(status_now(m))
}

/// Put back everything you had before the first look.
pub fn undo() -> Result<Status> {
    let _turn = TURN.lock().unwrap_or_else(|e| e.into_inner());
    let mut m = memory();
    let Some(before) = m.before.clone() else {
        return Err(anyhow!("Nothing to undo — Izuki hasn't changed your look."));
    };
    let mut problems = Vec::new();
    for s in &before.values {
        let r = match &s.raw {
            Some((kind, data)) => win::set_raw(&s.key, &s.name, *kind, data),
            None => win::delete_value(&s.key, &s.name),
        };
        if let Err(e) = r {
            problems.push(e.to_string());
        }
    }
    // The accent, through Windows' own call too, so it shows straight away.
    let menu = |name: &str| {
        before.values.iter().find(|s| s.key == ACCENT && s.name == name).and_then(|s| s.raw.as_ref()).filter(|(k, d)| *k == win::REG_DWORD && d.len() == 4).map(|(_, d)| u32::from_le_bytes([d[0], d[1], d[2], d[3]]))
    };
    if let (Some(start), Some(accent)) = (menu("StartColorMenu"), menu("AccentColorMenu")) {
        win::set_user_colour(start, accent);
    }
    let ours = current_wallpaper_is_ours();
    let mut note = None;
    // Your slideshow, running again with its own pictures.
    let slideshow_back = match before.slideshow.as_ref().filter(|_| ours) {
        Some((folders, options, tick)) => match win::set_slideshow(folders, *options, *tick) {
            Ok(()) => true,
            Err(e) => {
                problems.push(format!("your wallpaper slideshow didn't restart ({e})"));
                false
            }
        },
        None => false,
    };
    // Otherwise your picture (for a slideshow that couldn't restart: the
    // picture that was showing), so Izuki's wallpaper isn't left behind.
    let original = || Some(before.wallpaper.clone()).filter(|w| !w.is_empty() && std::path::Path::new(w).exists() && !w.contains("TranscodedWallpaper"));
    let picture = if before.slideshow.is_some() {
        before.wallpaper_copy.clone().or_else(original).unwrap_or_default()
    } else if !before.wallpaper.is_empty() && std::path::Path::new(&before.wallpaper).exists() && !before.wallpaper.contains("TranscodedWallpaper") {
        before.wallpaper.clone()
    } else {
        before.wallpaper_copy.clone().unwrap_or_default()
    };
    if !slideshow_back && (!picture.is_empty() || before.slideshow.is_none() && before.wallpaper.is_empty()) && ours {
        if let Err(e) = win::set_wallpaper(&picture) {
            problems.push(e.to_string());
        }
    }
    win::announce();
    if !problems.is_empty() {
        // Keep the save, so Undo can be tried again.
        return Err(anyhow!("Some of it couldn't be put back: {}", problems.join("; ")));
    }
    if before.spotlight && ours {
        note = Some("Your colours are back. Windows Spotlight pictures can only be switched back on in Settings → Personalisation → Background.".to_string());
    }
    m.before = None;
    m.current = None;
    remember(&m)?;
    eprintln!("[looks] undone");
    let mut s = status_now(m);
    s.note = note;
    Ok(s)
}

/// Only put the old wallpaper back if the one showing is Izuki's — a
/// picture you chose yourself since then stays.
fn current_wallpaper_is_ours() -> bool {
    let now = win::wallpaper();
    let ours = dir();
    now.is_empty() || std::path::Path::new(&now).starts_with(&ours) || now.contains("TranscodedWallpaper")
}

pub fn status() -> Status {
    status_now(memory())
}

fn status_now(m: Memory) -> Status {
    let (_, accent) = win::user_colour();
    let accent = accent.map(from_abgr).or_else(|| win::get_dword(DWM, "AccentColor").map(from_abgr)).unwrap_or(0x0078D4);
    let dark = win::get_dword(THEME, "SystemUsesLightTheme") == Some(0);
    let glass = win::get_dword(THEME, "EnableTransparency") != Some(0);
    let bars = win::get_dword(THEME, "ColorPrevalence") == Some(1);
    let titles = win::get_dword(DWM, "ColorPrevalence") == Some(1);
    // "Current" only while Windows still matches that look.
    let current = m.current.filter(|id| PRESETS.iter().any(|p| p.id == id && p.accent == accent && p.dark == dark));
    Status {
        presets: PRESETS
            .iter()
            .zip(previews())
            .map(|(p, preview)| PresetInfo { id: p.id, name: p.name, blurb: p.blurb, accent: hex(p.accent), dark: p.dark, bars: p.bars && p.dark, titles: p.titles, preview: preview.clone() })
            .collect(),
        swatches: COLOURS.iter().filter(|(n, _)| *n != "yellow" && *n != "gray" && *n != "violet").map(|(n, c)| (n.to_string(), hex(*c))).collect(),
        accent: hex(accent),
        dark,
        glass,
        bars,
        titles,
        current,
        can_undo: m.before.is_some(),
        note: None,
    }
}

// ---- Voice: "make my PC look Nova", "undo the look", "accent colour red" ----

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    Apply(&'static str),
    Undo,
    Accent(u32),
}

pub fn parse(said: &str) -> Option<Ask> {
    let mut s = said.to_lowercase().chars().map(|c| if c.is_alphanumeric() || c == '#' { c } else { ' ' }).collect::<String>();
    s = format!(" {} ", s.split_whitespace().collect::<Vec<_>>().join(" "));
    // "Hey Nova, …" is a wake word, not the look.
    for wake in [" hey nova ", " hi nova ", " ok nova ", " okay nova ", " nova "] {
        if let Some(rest) = s.strip_prefix(wake) {
            s = format!(" {rest}");
        }
    }
    let looks = [" look", " theme", " style", " vibe", " makeover", " colours", " colors"].iter().any(|w| s.contains(w));
    // "Undo the look", "put my old colours back": the undo word right before
    // what's undone — not any sentence that happens to say "look" and "undo".
    let undo_at = [" undo", " put back", " put my old", " go back to", " restore", " bring back", " switch back to"].iter().filter_map(|w| s.find(w)).min();
    let target_at = [
        " the look", " my look", " old look", " previous look", " original look", " the theme", " my theme", " old theme", " my colours", " my colors", " old colours",
        " old colors", " the colours", " the colors", " my wallpaper", " old wallpaper",
    ]
    .iter()
    .filter_map(|w| s.find(w))
    .min();
    if let (Some(u), Some(t)) = (undo_at, target_at) {
        if t > u && s[u..t].split_whitespace().count() <= 4 {
            return Some(Ask::Undo);
        }
    }
    if s.contains(" accent") || s.contains(" highlight colo") {
        if let Some(h) = s.split_whitespace().find_map(|w| w.starts_with('#').then(|| parse_hex(w)).flatten()) {
            return Some(Ask::Accent(h));
        }
        if let Some((_, c)) = COLOURS.iter().find(|(n, _)| s.contains(&format!(" {n} "))) {
            return Some(Ask::Accent(*c));
        }
    }
    let change = [" make", " apply", " use ", " switch", " change", " set ", " give", " try", " put on", " turn", " go "].iter().any(|w| s.contains(w));
    if !(looks && change) {
        return None;
    }
    // The look's name right by "look"/"theme"/"style" ("look like Nova",
    // "the midnight theme", "change the look to forest") — not a name
    // anywhere in the sentence ("the theme of my essay is the forest").
    let words: Vec<&str> = s.split_whitespace().collect();
    let is_look_word = |w: Option<&&str>| w.is_some_and(|w| ["look", "looks", "theme", "style", "vibe", "makeover"].contains(w));
    let at = |i: usize, back: usize| i.checked_sub(back).and_then(|j| words.get(j));
    PRESETS
        .iter()
        .find(|p| {
            words.iter().enumerate().any(|(i, w)| {
                *w == p.id && (
                    // "the sakura look", "the nova theme on my laptop" (not "the paper look neater")
                    is_look_word(words.get(i + 1)) && words.get(i + 2).is_none_or(|n| ["please", "on", "for", "now", "again", "today", "instead"].contains(n))
                    // "look nova", "theme nova"
                    || is_look_word(at(i, 1))
                    // "look like nova", "the look to forest", "a theme called ember"
                    || at(i, 1).is_some_and(|w| ["like", "to", "called", "into"].contains(w)) && is_look_word(at(i, 2))
                )
            })
        })
        .map(|p| Ask::Apply(p.id))
}

/// "a red accent", "an orange accent".
fn a_or_an(word: &str) -> &'static str {
    if word.starts_with(['a', 'e', 'i', 'o', 'u']) { "an" } else { "a" }
}

pub fn handle(ask: Ask) -> String {
    match ask {
        Ask::Apply(id) => match apply(id, true) {
            Ok(_) => {
                let p = PRESETS.iter().find(|p| p.id == id).expect("known look");
                let mut parts = vec![if p.dark { "dark mode" } else { "light mode" }.to_string()];
                let colour = COLOURS.iter().find(|(_, c)| *c == p.accent).map(|(n, _)| n.to_string()).unwrap_or_else(|| "new".into());
                let mut on = Vec::new();
                if p.bars && p.dark {
                    on.push("taskbar");
                    on.push("Start");
                }
                if p.titles {
                    on.push("title bars");
                }
                let a = a_or_an(&colour);
                parts.push(if on.is_empty() { format!("{a} {colour} accent") } else { format!("{a} {colour} accent on the {}", join_words(&on)) });
                if !p.glass {
                    parts.push("no see-through effects".into());
                }
                parts.push("a new wallpaper painted for your screen".into());
                format!("Done — your PC has the {} look: {}. Say “undo the look” to put your old one back.", p.name, join_words(&parts.iter().map(String::as_str).collect::<Vec<_>>()))
            }
            Err(e) => format!("I couldn't change the look: {e}"),
        },
        Ask::Undo => match undo() {
            Ok(s) => s.note.unwrap_or_else(|| "Done — your old colours and wallpaper are back.".into()),
            Err(e) => e.to_string(),
        },
        Ask::Accent(c) => match set_accent(&hex(c)) {
            Ok(_) => format!("Done — your accent colour is now {}.", COLOURS.iter().find(|(_, v)| *v == c).map(|(n, _)| n.to_string()).unwrap_or_else(|| hex(c))),
            Err(e) => format!("I couldn't change the accent colour: {e}"),
        },
    }
}

fn join_words(w: &[&str]) -> String {
    match w.len() {
        0 => String::new(),
        1 => w[0].to_string(),
        n => format!("{} and {}", w[..n - 1].join(", "), w[n - 1]),
    }
}

#[cfg(windows)]
mod win {
    use anyhow::{anyhow, Result};
    use windows::core::{w, HSTRING, PCSTR};
    use windows::Win32::Foundation::{LPARAM, WPARAM};
    use windows::Win32::System::LibraryLoader::{GetProcAddress, LoadLibraryW};
    use windows::Win32::System::Registry::{RegDeleteKeyValueW, RegGetValueW, RegSetKeyValueW, HKEY_CURRENT_USER, REG_VALUE_TYPE, RRF_RT_ANY, RRF_RT_REG_DWORD};
    use windows::Win32::UI::WindowsAndMessaging::{
        SendMessageTimeoutW, SystemParametersInfoW, HWND_BROADCAST, SMTO_ABORTIFHUNG, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE, SPI_GETDESKWALLPAPER, SPI_SETDESKWALLPAPER, WM_SETTINGCHANGE,
    };

    pub const REG_SZ: u32 = 1;
    pub const REG_BINARY: u32 = 3;
    pub const REG_DWORD: u32 = 4;

    pub fn wide(s: &str) -> Vec<u8> {
        s.encode_utf16().chain(std::iter::once(0)).flat_map(|u| u.to_le_bytes()).collect()
    }

    pub fn get_raw(key: &str, name: &str) -> Option<(u32, Vec<u8>)> {
        let (k, n) = (HSTRING::from(key), HSTRING::from(name));
        let mut size = 0u32;
        let mut kind = REG_VALUE_TYPE(0);
        if unsafe { RegGetValueW(HKEY_CURRENT_USER, &k, &n, RRF_RT_ANY, Some(&mut kind), None, Some(&mut size)) }.is_err() {
            return None;
        }
        let mut data = vec![0u8; size as usize];
        unsafe { RegGetValueW(HKEY_CURRENT_USER, &k, &n, RRF_RT_ANY, Some(&mut kind), Some(data.as_mut_ptr() as *mut _), Some(&mut size)) }.ok().ok()?;
        data.truncate(size as usize);
        Some((kind.0, data))
    }

    pub fn get_dword(key: &str, name: &str) -> Option<u32> {
        let mut data = 0u32;
        let mut size = 4u32;
        let r = unsafe { RegGetValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name), RRF_RT_REG_DWORD, None, Some(&mut data as *mut u32 as *mut _), Some(&mut size)) };
        r.is_ok().then_some(data)
    }

    pub fn set_raw(key: &str, name: &str, kind: u32, data: &[u8]) -> Result<()> {
        let r = unsafe { RegSetKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name), kind, Some(data.as_ptr() as *const _), data.len() as u32) };
        if r.is_ok() { Ok(()) } else { Err(anyhow!("Windows wouldn't save {name} ({r:?})")) }
    }

    pub fn delete_value(key: &str, name: &str) -> Result<()> {
        let r = unsafe { RegDeleteKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name)) };
        // Already gone is fine.
        if r.is_ok() || r.0 == 2 { Ok(()) } else { Err(anyhow!("Windows wouldn't remove {name} ({r:?})")) }
    }

    pub fn wallpaper() -> String {
        let mut buf = [0u16; 520];
        let ok = unsafe { SystemParametersInfoW(SPI_GETDESKWALLPAPER, buf.len() as u32, Some(buf.as_mut_ptr() as *mut _), Default::default()) }.is_ok();
        if !ok {
            return String::new();
        }
        let end = buf.iter().position(|c| *c == 0).unwrap_or(buf.len());
        String::from_utf16_lossy(&buf[..end])
    }

    pub fn set_wallpaper(file: &str) -> Result<()> {
        let mut path: Vec<u16> = file.encode_utf16().chain(std::iter::once(0)).collect();
        unsafe { SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, Some(path.as_mut_ptr() as *mut _), SPIF_UPDATEINIFILE | SPIF_SENDCHANGE) }.map_err(|e| anyhow!("Windows wouldn't change the wallpaper ({e})"))
    }

    /// The wallpaper slideshow, if one is running: its folders, options and
    /// ms per picture (Windows' documented wallpaper interface).
    pub fn slideshow() -> Option<(Vec<String>, i32, u32)> {
        use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CoTaskMemFree, CLSCTX_ALL, COINIT_MULTITHREADED};
        use windows::Win32::UI::Shell::{DesktopWallpaper, IDesktopWallpaper, DESKTOP_SLIDESHOW_OPTIONS, DSS_SLIDESHOW, SIGDN_FILESYSPATH};
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
            let dw: IDesktopWallpaper = CoCreateInstance(&DesktopWallpaper, None, CLSCTX_ALL).ok()?;
            if dw.GetStatus().ok()?.0 & DSS_SLIDESHOW.0 == 0 {
                return None;
            }
            let items = dw.GetSlideshow().ok()?;
            let mut folders = Vec::new();
            for i in 0..items.GetCount().ok()? {
                if let Ok(p) = items.GetItemAt(i).and_then(|item| item.GetDisplayName(SIGDN_FILESYSPATH)) {
                    folders.push(p.to_string().unwrap_or_default());
                    CoTaskMemFree(Some(p.0 as *const _));
                }
            }
            let mut options = DESKTOP_SLIDESHOW_OPTIONS(0);
            let mut tick = 0u32;
            let _ = dw.GetSlideshowOptions(&mut options, &mut tick);
            folders.retain(|f| !f.is_empty());
            (!folders.is_empty()).then_some((folders, options.0, tick))
        }
    }

    /// Start the slideshow again: the same pictures (or folder), the same
    /// order setting and timing.
    pub fn set_slideshow(items: &[String], options: i32, tick: u32) -> Result<()> {
        use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_MULTITHREADED};
        use windows::Win32::UI::Shell::Common::ITEMIDLIST;
        use windows::Win32::UI::Shell::{DesktopWallpaper, IDesktopWallpaper, ILCreateFromPathW, ILFree, SHCreateShellItemArrayFromIDLists, DESKTOP_SLIDESHOW_OPTIONS};
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
            let dw: IDesktopWallpaper = CoCreateInstance(&DesktopWallpaper, None, CLSCTX_ALL)?;
            // Pictures that have since been deleted are left out.
            let ids: Vec<*const ITEMIDLIST> = items
                .iter()
                .filter(|p| std::path::Path::new(p).exists())
                .map(|p| ILCreateFromPathW(&HSTRING::from(p.as_str())) as *const ITEMIDLIST)
                .filter(|id| !id.is_null())
                .collect();
            let result = if ids.is_empty() {
                Err(anyhow!("its pictures are gone"))
            } else {
                SHCreateShellItemArrayFromIDLists(&ids).and_then(|all| dw.SetSlideshow(&all)).map_err(|e| anyhow!("{e}"))
            };
            for id in ids {
                ILFree(Some(id));
            }
            result?;
            if tick > 0 {
                let _ = dw.SetSlideshowOptions(DESKTOP_SLIDESHOW_OPTIONS(options), tick);
            }
        }
        Ok(())
    }

    /// uxtheme's accent-colour pair (the same call Windows Settings makes):
    /// Start's colour and the accent, both 0xAABBGGRR.
    #[repr(C)]
    struct Pref {
        start: u32,
        accent: u32,
    }
    type GetPref = unsafe extern "system" fn(*mut Pref, i32) -> i32;
    type SetPref = unsafe extern "system" fn(*const Pref, i32) -> i32;

    /// uxtheme's export by ordinal, looked up once (120 = get, 122 = set).
    fn uxtheme(ordinal: usize) -> Option<unsafe extern "system" fn() -> isize> {
        static FOUND: std::sync::OnceLock<[Option<usize>; 2]> = std::sync::OnceLock::new();
        let found = FOUND.get_or_init(|| unsafe {
            let Ok(m) = LoadLibraryW(w!("uxtheme.dll")) else { return [None, None] };
            [120usize, 122].map(|o| GetProcAddress(m, PCSTR(o as *const u8)).map(|f| f as usize))
        });
        let addr = match ordinal {
            120 => found[0],
            122 => found[1],
            _ => None,
        }?;
        // SAFETY: a non-null export address from GetProcAddress above.
        Some(unsafe { std::mem::transmute::<usize, unsafe extern "system" fn() -> isize>(addr) })
    }

    pub fn user_colour() -> (Option<u32>, Option<u32>) {
        let Some(f) = uxtheme(120) else { return (None, None) };
        let get: GetPref = unsafe { std::mem::transmute(f) };
        let mut p = Pref { start: 0, accent: 0 };
        if unsafe { get(&mut p, 1) } == 0 { (Some(p.start), Some(p.accent)) } else { (None, None) }
    }

    pub fn set_user_colour(start: u32, accent: u32) {
        let Some(f) = uxtheme(122) else { return };
        let set: SetPref = unsafe { std::mem::transmute(f) };
        let p = Pref { start, accent };
        let hr = unsafe { set(&p, 1) };
        if hr != 0 {
            eprintln!("[looks] Windows' accent call answered {hr:#x} (the saved colour shows after you sign in again)");
        }
    }

    /// Tell Windows and every app that the colours changed.
    pub fn announce() {
        for what in [w!("ImmersiveColorSet"), w!("WindowsThemeElement")] {
            let mut out = 0usize;
            unsafe {
                let _ = SendMessageTimeoutW(HWND_BROADCAST, WM_SETTINGCHANGE, WPARAM(0), LPARAM(what.as_ptr() as isize), SMTO_ABORTIFHUNG, 1500, Some(&mut out));
            }
        }
    }
}

#[cfg(not(windows))]
mod win {
    use anyhow::{anyhow, Result};
    pub const REG_SZ: u32 = 1;
    pub const REG_BINARY: u32 = 3;
    pub const REG_DWORD: u32 = 4;
    pub fn wide(s: &str) -> Vec<u8> { s.encode_utf16().chain(std::iter::once(0)).flat_map(|u| u.to_le_bytes()).collect() }
    pub fn get_raw(_: &str, _: &str) -> Option<(u32, Vec<u8>)> { None }
    pub fn get_dword(_: &str, _: &str) -> Option<u32> { None }
    pub fn set_raw(_: &str, _: &str, _: u32, _: &[u8]) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn delete_value(_: &str, _: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn wallpaper() -> String { String::new() }
    pub fn set_wallpaper(_: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn user_colour() -> (Option<u32>, Option<u32>) { (None, None) }
    pub fn slideshow() -> Option<(Vec<String>, i32, u32)> { None }
    pub fn set_slideshow(_: &[String], _: i32, _: u32) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn set_user_colour(_: u32, _: u32) {}
    pub fn announce() {}
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn colours_round_trip_the_way_windows_stores_them() {
        // The accent this PC had: #258292 is 0xFF928225 in the registry.
        assert_eq!(abgr(0x258292), 0xFF92_8225);
        assert_eq!(from_abgr(0xFF92_8225), 0x258292);
        let p = palette(0x258292);
        assert_eq!(&p[12..16], &[0x25, 0x82, 0x92, 0], "the colour itself is the 4th entry");
        assert!(p[0] > p[12] && p[16] < p[12] && p[24] < p[16], "lighter shades first, darker after");
        assert_eq!(parse_hex("#0ea5c6"), Some(0x0EA5C6));
        assert_eq!(parse_hex("blue"), None);
    }

    #[test]
    fn hears_look_requests() {
        assert_eq!(parse("make my PC look Nova"), Some(Ask::Apply("nova")));
        assert_eq!(parse("hey nova switch to the midnight theme"), Some(Ask::Apply("midnight")));
        assert_eq!(parse("give my desktop the sakura look"), Some(Ask::Apply("sakura")));
        assert_eq!(parse("undo the look"), Some(Ask::Undo));
        assert_eq!(parse("put my old colours back"), Some(Ask::Undo));
        assert_eq!(parse("change my accent colour to red"), Some(Ask::Accent(0xDC2626)));
        assert_eq!(parse("set the accent to #ff8800"), Some(Ask::Accent(0xFF8800)));
        // Not looks:
        assert_eq!(parse("hey nova what time is it"), None);
        assert_eq!(parse("look up the forest fire news"), None);
        assert_eq!(parse("undo that"), None);
        assert_eq!(parse("look, can you undo that last change"), None);
        assert_eq!(parse("undo my last edit and then look at the theme of the essay"), None);
        assert_eq!(parse("go back to my old look"), Some(Ask::Undo));
        assert_eq!(parse("restore my wallpaper"), Some(Ask::Undo));
        assert_eq!(parse("make my PC look like Nova"), Some(Ask::Apply("nova")));
        assert_eq!(parse("change the look to forest"), Some(Ask::Apply("forest")));
        assert_eq!(parse("nova change the look"), None, "a bare wake word isn't the Nova look");
        assert_eq!(parse("Nova, change the theme of my essay to forest"), None);
        assert_eq!(parse("make the paper look neater and change its style"), None);
        assert_eq!(a_or_an("orange"), "an");
        assert_eq!(a_or_an("cyan"), "a");
        assert_eq!(parse("I need to focus on my homework"), None);
    }

    #[test]
    fn every_look_is_complete() {
        let mut ids: Vec<_> = PRESETS.iter().map(|p| p.id).collect();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), PRESETS.len());
        for p in PRESETS {
            assert!(!p.wall.glows.is_empty() && !p.blurb.is_empty());
            assert!(preview_css(&p.wall).ends_with("100%)"));
            assert!(COLOURS.iter().any(|(_, c)| *c == p.accent), "{}'s accent has a name to say", p.id);
        }
    }

    #[test]
    fn paints_a_smooth_wallpaper() {
        let nova = PRESETS.iter().find(|p| p.id == "nova").unwrap();
        let img = paint(&nova.wall, true, 160, 90);
        assert_eq!(img.dimensions(), (160, 90));
        // The planet's glowing edge (top at 74% down, in the middle) is
        // brighter than the dark planet below it.
        let edge = img.get_pixel(80, 66);
        let planet = img.get_pixel(80, 86);
        assert!(edge[2] > planet[2] + 40, "edge {edge:?} vs planet {planet:?}");
        let sakura = PRESETS.iter().find(|p| p.id == "sakura").unwrap();
        let light = paint(&sakura.wall, false, 64, 36);
        assert!(light.pixels().all(|p| p[0] > 180), "a light look stays light");
    }

    /// Paints every wallpaper to IZUKI_LOOKS_OUT, to look at them:
    /// `IZUKI_LOOKS_OUT=dir cargo test --lib paint_samples -- --ignored`
    #[test]
    #[ignore]
    fn paint_samples() {
        let out = std::path::PathBuf::from(std::env::var("IZUKI_LOOKS_OUT").expect("set IZUKI_LOOKS_OUT"));
        for p in PRESETS {
            paint(&p.wall, p.dark, 960, 540).save(out.join(format!("{}.png", p.id))).unwrap();
        }
        // What the Looks card gets (read only), for a browser preview.
        std::fs::write(out.join("looks-status.json"), serde_json::to_string(&status()).unwrap()).unwrap();
    }

    /// Really applies Nova on this PC, checks Windows took it, then Undo and
    /// checks every value, the accent and the wallpaper/slideshow are back:
    /// `IZUKI_LOOKS_REAL=1 cargo test --lib real_apply_then_undo -- --ignored --nocapture`
    #[test]
    #[ignore]
    #[cfg(windows)]
    fn real_apply_then_undo() {
        assert_eq!(std::env::var("IZUKI_LOOKS_REAL").as_deref(), Ok("1"), "changes this PC's look — opt in");
        assert!(memory().before.is_none(), "a look is already applied; undo it first");
        let raw = || TOUCHED.iter().map(|(k, n)| ((*k, *n), win::get_raw(k, n))).collect::<Vec<_>>();
        let (before, wall, show, colour) = (raw(), win::wallpaper(), win::slideshow(), win::user_colour());
        eprintln!("before: wallpaper {wall} slideshow {show:?} colour {colour:x?}");

        let s = apply("nova", true).expect("apply");
        let nova = PRESETS.iter().find(|p| p.id == "nova").unwrap();
        eprintln!("applied: accent {} wallpaper {} slideshow {:?}", s.accent, win::wallpaper(), win::slideshow());
        assert_eq!(win::get_dword(ACCENT, "AccentColorMenu"), Some(abgr(nova.accent)));
        assert_eq!(win::user_colour().1, Some(abgr(nova.accent)), "Windows' own accent call took it");
        assert_eq!(win::get_dword(THEME, "SystemUsesLightTheme"), Some(0));
        assert_eq!(win::get_dword(THEME, "ColorPrevalence"), Some(1));
        assert_eq!(win::get_dword(DWM, "ColorPrevalence"), Some(1));
        assert!(win::slideshow().is_none(), "the slideshow gave way to the picture");
        assert_eq!(s.current.as_deref(), Some("nova"));

        let back = undo().expect("undo");
        eprintln!("undone: accent {} wallpaper {} slideshow {:?} note {:?}", back.accent, win::wallpaper(), win::slideshow(), back.note);
        for ((key, name), was) in before {
            assert_eq!(win::get_raw(key, name), was, "{key} / {name} is back");
        }
        assert_eq!(win::user_colour(), colour, "the accent is back");
        assert_eq!(win::slideshow(), show, "the slideshow is back");
        if show.is_none() {
            assert_eq!(win::wallpaper(), wall, "the picture is back");
        }
        assert!(memory().before.is_none() && !back.can_undo);
    }

    /// Reads the real values (changes nothing).
    #[test]
    #[cfg(windows)]
    fn reads_the_current_look() {
        let s = status();
        assert_eq!(s.presets.len(), PRESETS.len());
        assert!(s.accent.starts_with('#') && s.accent.len() == 7);
        eprintln!("accent {} dark {} slideshow {:?} screen {:?}", s.accent, s.dark, win::slideshow(), screen_size());
    }
}
