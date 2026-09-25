//! Live Eyes — Izuki watching the screen move, not just taking snapshots.
//!
//! A model only ever sees still frames (even "live" video AIs take about one
//! a second). What makes an agent feel live is looking at the *right*
//! moment: right after the page has finished loading, the menu has opened,
//! the app has come up — not a fixed second later (too slow) or too early
//! (a half-drawn screen). So between steps Izuki watches tiny thumbnails of
//! the screen several times a second, on this PC, for free, and moves on the
//! moment things settle.
//!
//! "Settled" means only a small share of the screen is still changing, so a
//! video playing in part of it — or Izuki's own animated orb and hand —
//! doesn't keep it waiting.

use std::time::{Duration, Instant};

use crate::capture::{self, Frame};

/// Thumbnail size: enough to see a page load or a dialog open, cheap to grab.
const THUMB_W: i32 = 160;
const THUMB_H: i32 = 90;
/// How often to look while waiting.
const EVERY: Duration = Duration::from_millis(100);
/// A cell counts as changed when its brightness moves by more than this.
const CELL_DELTA: i32 = 18;
/// Under this share of the screen changing, the screen counts as calm.
const CALM_SHARE: f32 = 0.08;
/// Calm this many looks in a row (~200 ms) = settled.
const CALM_LOOKS: u32 = 2;

/// The share of the picture (0..1) that changed noticeably between two
/// same-size thumbnails.
pub fn changed_share(a: &Frame, b: &Frame) -> f32 {
    if a.width != b.width || a.height != b.height || a.bgra.len() != b.bgra.len() || a.bgra.is_empty() {
        return 1.0;
    }
    let luma = |px: &[u8]| (px[0] as i32 * 29 + px[1] as i32 * 150 + px[2] as i32 * 77) >> 8;
    let cells = a.bgra.len() / 4;
    let changed = a
        .bgra
        .chunks_exact(4)
        .zip(b.bgra.chunks_exact(4))
        .filter(|(p, q)| (luma(p) - luma(q)).abs() > CELL_DELTA)
        .count();
    changed as f32 / cells as f32
}

/// Wait for the screen to settle after an action: at least `min`, at most
/// `max`, and give up early if `stop()` says so. `true` = it settled (as
/// opposed to still moving when `max` ran out).
pub fn wait_until_settled(min: Duration, max: Duration, stop: impl Fn() -> bool) -> bool {
    let started = Instant::now();
    let mut last: Option<Frame> = None;
    let mut calm = 0;
    while started.elapsed() < max && !stop() {
        std::thread::sleep(EVERY);
        let Ok(now) = capture::capture_thumb(THUMB_W, THUMB_H) else {
            // Can't watch: fall back to just waiting the minimum.
            std::thread::sleep(min.saturating_sub(started.elapsed()));
            return true;
        };
        if let Some(prev) = &last {
            calm = if changed_share(prev, &now) < CALM_SHARE { calm + 1 } else { 0 };
            if calm >= CALM_LOOKS && started.elapsed() >= min {
                return true;
            }
        }
        last = Some(now);
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    fn frame(fill: u8, w: u32, h: u32) -> Frame {
        Frame { width: w, height: h, origin: (0, 0), bgra: vec![fill; (w * h * 4) as usize] }
    }

    #[test]
    fn measures_how_much_of_the_screen_moved() {
        let a = frame(40, 10, 10);
        assert_eq!(changed_share(&a, &a), 0.0);
        // A whole new page.
        assert_eq!(changed_share(&a, &frame(200, 10, 10)), 1.0);
        // A small video (or Izuki's own orb) moving in one corner: 4 of 100 cells.
        let mut b = a.clone();
        for i in [0usize, 1, 10, 11] {
            b.bgra[i * 4..i * 4 + 3].copy_from_slice(&[250, 250, 250]);
        }
        let share = changed_share(&a, &b);
        assert!((share - 0.04).abs() < 1e-6 && share < CALM_SHARE);
        // Different sizes can't be compared — treat as changed.
        assert_eq!(changed_share(&a, &frame(40, 5, 5)), 1.0);
    }
}

#[cfg(test)]
mod cost {
    /// `cargo test live_eyes_cost -- --ignored --nocapture` — how long one look takes on this PC.
    #[test]
    #[ignore]
    fn live_eyes_cost() {
        let t = std::time::Instant::now();
        for _ in 0..20 {
            crate::capture::capture_thumb(super::THUMB_W, super::THUMB_H).unwrap();
        }
        println!("one Live Eyes look: {:.1} ms", t.elapsed().as_secs_f64() * 1000.0 / 20.0);
    }
}
