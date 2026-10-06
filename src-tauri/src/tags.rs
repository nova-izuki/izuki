//! Number tags on the screenshot — so the brain never has to guess pixels.
//!
//! The brain gets a numbered list of the real buttons, links and fields on
//! screen (uia.rs) and can say "click #7". But a list is words; the picture
//! is what it reasons about, and matching "the first answer option" in the
//! picture to "[23] RadioButton …" in the list is where it went wrong and
//! clicked beside the thing. So each listed control also gets its number
//! printed on the screenshot, in a small yellow tag at its top-left corner:
//! the brain sees the tag on the very thing it means, and says that number.
//! (What researchers call "set-of-marks" prompting.)

use crate::capture::Frame;
use crate::model::Rect;
use crate::uia::Control;

/// Digits 0–9, 3×5 pixels each (rows top to bottom, 3 bits per row).
const DIGITS: [[u8; 5]; 10] = [
    [0b111, 0b101, 0b101, 0b101, 0b111],
    [0b010, 0b110, 0b010, 0b010, 0b111],
    [0b111, 0b001, 0b111, 0b100, 0b111],
    [0b111, 0b001, 0b111, 0b001, 0b111],
    [0b101, 0b101, 0b111, 0b001, 0b001],
    [0b111, 0b100, 0b111, 0b001, 0b111],
    [0b111, 0b100, 0b111, 0b101, 0b111],
    [0b111, 0b001, 0b010, 0b010, 0b010],
    [0b111, 0b101, 0b111, 0b101, 0b111],
    [0b111, 0b101, 0b111, 0b001, 0b111],
];
/// Each font pixel is this many image pixels.
const SCALE: u32 = 3;
const PAD: u32 = 2;

/// Print each control's number on `img` (already scaled down from the
/// desktop area `desktop`). Controls that aren't drawn yet (shown on hover)
/// or are scrolled out of view get no tag.
pub fn draw(img: &mut Frame, desktop: &Rect, controls: &[Control]) {
    if desktop.w <= 0 || desktop.h <= 0 {
        return;
    }
    let fx = img.width as f64 / desktop.w as f64;
    let fy = img.height as f64 / desktop.h as f64;
    let mut placed: Vec<(i32, i32, i32, i32)> = Vec::new();
    for c in controls {
        if c.hidden || c.below {
            continue;
        }
        let x = ((c.rect.x - desktop.x) as f64 * fx) as i32;
        let y = ((c.rect.y - desktop.y) as f64 * fy) as i32;
        let w = (c.rect.w as f64 * fx) as i32;
        let h = (c.rect.h as f64 * fy) as i32;
        // Off the picture, or too tiny to be a real target.
        if w < 4 || h < 4 || x + w < 0 || y + h < 0 || x >= img.width as i32 || y >= img.height as i32 {
            continue;
        }
        let text = c.id.to_string();
        let tw = text.len() as i32 * (4 * SCALE) as i32 - SCALE as i32 + 2 * PAD as i32;
        let th = (5 * SCALE + 2 * PAD) as i32;
        // Inside the control's top-left corner, kept on the picture.
        let mut tx = x.clamp(0, img.width as i32 - tw);
        let mut ty = y.clamp(0, img.height as i32 - th);
        // Don't cover another tag: nudge right, then down.
        for _ in 0..4 {
            let hit = placed.iter().any(|&(px, py, pw, ph)| tx < px + pw && px < tx + tw && ty < py + ph && py < ty + th);
            if !hit {
                break;
            }
            if tx + 2 * tw < img.width as i32 {
                tx += tw + 1;
            } else {
                ty = (ty + th + 1).min(img.height as i32 - th);
            }
        }
        placed.push((tx, ty, tw, th));
        // Keep a moved badge visibly attached to its actual target. Without
        // bounds/leader lines a collision can put an answer's ID on its neighbour.
        fill(img, x, y, w, 1, (76, 210, 196));
        fill(img, x, y + h - 1, w, 1, (76, 210, 196));
        fill(img, x, y, 1, h, (76, 210, 196));
        fill(img, x + w - 1, y, 1, h, (76, 210, 196));
        if tx != x || ty != y {
            let steps = (tx - x).abs().max((ty - y).abs()).max(1);
            for i in 0..=steps {
                fill(img, x + (tx - x) * i / steps, y + (ty - y) * i / steps, 1, 1, (76, 210, 196));
            }
        }
        badge(img, tx, ty, tw, th, &text);
    }
}

fn badge(img: &mut Frame, x: i32, y: i32, w: i32, h: i32, text: &str) {
    // A dark edge, a bright yellow tag, black digits: legible on any background.
    fill(img, x - 1, y - 1, w + 2, h + 2, (0, 0, 0));
    fill(img, x, y, w, h, (255, 214, 0));
    let mut cx = x + PAD as i32;
    for ch in text.chars() {
        let Some(d) = ch.to_digit(10) else { continue };
        for (row, bits) in DIGITS[d as usize].iter().enumerate() {
            for col in 0..3 {
                if bits & (0b100 >> col) != 0 {
                    fill(
                        img,
                        cx + (col * SCALE) as i32,
                        y + PAD as i32 + (row as u32 * SCALE) as i32,
                        SCALE as i32,
                        SCALE as i32,
                        (0, 0, 0),
                    );
                }
            }
        }
        cx += (4 * SCALE) as i32;
    }
}

fn fill(img: &mut Frame, x: i32, y: i32, w: i32, h: i32, (r, g, b): (u8, u8, u8)) {
    let (iw, ih) = (img.width as i32, img.height as i32);
    for yy in y.max(0)..(y + h).min(ih) {
        for xx in x.max(0)..(x + w).min(iw) {
            let i = ((yy * iw + xx) * 4) as usize;
            img.bgra[i] = b;
            img.bgra[i + 1] = g;
            img.bgra[i + 2] = r;
            img.bgra[i + 3] = 255;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn control(id: u32, x: i32, y: i32, w: i32, h: i32) -> Control {
        Control {
            id,
            kind: "Button".into(),
            name: format!("b{id}"),
            rect: Rect { x, y, w, h },
            hidden: false,
            value: String::new(),
            focused: false,
            below: false,
            section: String::new(),
            identity: None,
        }
    }

    #[test]
    fn tags_land_on_their_controls() {
        // A 2000×1000 desktop shown as a 1000×500 image.
        let mut img = Frame { width: 1000, height: 500, origin: (0, 0), bgra: vec![255; 1000 * 500 * 4] };
        let desk = Rect { x: 0, y: 0, w: 2000, h: 1000 };
        let mut off = control(9, 5000, 5000, 100, 40); // off screen: no tag
        off.below = true;
        draw(&mut img, &desk, &[control(7, 400, 200, 300, 60), off]);
        // The tag's yellow is at the control's top-left, in image space (200,100).
        let px = img.pixel(201, 100).unwrap();
        assert_eq!(px, (255, 214, 0), "{px:?}");
        // The digit 7's top row is black just inside the padding.
        assert_eq!(img.pixel(200 + PAD, 100 + PAD).unwrap(), (0, 0, 0));
        // Nowhere else touched.
        assert_eq!(img.pixel(900, 400).unwrap(), (255, 255, 255));
    }
}

#[cfg(test)]
mod look {
    /// Draws tags on a real screenshot to eyeball them:
    /// The real thing: this screen, the real controls Windows reports for the
    /// window in front, tagged exactly as the brain sees them, saved as a
    /// picture. `IZK_OUT=out.png cargo test tags_live -- --ignored`.
    #[test]
    #[ignore]
    fn tags_live() {
        let frame = crate::capture::capture_all().unwrap();
        let desktop = crate::model::Rect { x: frame.origin.0, y: frame.origin.1, w: frame.width as i32, h: frame.height as i32 };
        let controls = crate::uia::controls_fresh_or_now(80);
        eprintln!("{} controls in {}", controls.len(), crate::uia::foreground_app());
        assert!(!controls.is_empty(), "Windows reported no controls");
        let mut scaled = frame.downscaled(1280);
        super::draw(&mut scaled, &desktop, &controls);
        std::fs::write(std::env::var("IZK_OUT").unwrap(), scaled.to_jpeg(85).unwrap()).unwrap();
    }

    /// IZK_SHOT=in.jpg IZK_OUT=out.png cargo test tags_look -- --ignored
    #[test]
    #[ignore]
    fn tags_look() {
        use crate::uia::Control;
        let img = image::open(std::env::var("IZK_SHOT").unwrap()).unwrap().to_rgba8();
        let (w, h) = img.dimensions();
        let mut bgra = img.into_raw();
        for p in bgra.chunks_mut(4) {
            p.swap(0, 2);
        }
        let mut f = crate::capture::Frame { width: w, height: h, origin: (0, 0), bgra };
        let desk = crate::model::Rect { x: 0, y: 0, w: w as i32 * 2, h: h as i32 * 2 };
        let mut cs = Vec::new();
        for i in 0..24u32 {
            cs.push(Control { id: i + 1, kind: "Button".into(), name: String::new(),
                rect: crate::model::Rect { x: 60 + (i as i32 % 4) * 200, y: 120 + (i as i32 / 4) * 180, w: 160, h: 50 },
                hidden: false, value: String::new(), focused: false, below: false, section: String::new(), identity: None });
        }
        super::draw(&mut f, &desk, &cs);
        for p in f.bgra.chunks_mut(4) {
            p.swap(0, 2);
        }
        image::RgbaImage::from_raw(w, h, f.bgra).unwrap().save(std::env::var("IZK_OUT").unwrap()).unwrap();
    }
}
