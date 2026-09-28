//! # Safe Hands
//!
//! Accurate, checked mouse and keyboard actions for AI agents on Windows —
//! the hands behind [Izuki](https://nova-izuki.github.io/izuki/), as a
//! library you can use in your own agent.
//!
//! An AI that drives a PC fails in boringly predictable ways: it guesses
//! pixels, the page moves under it, a pop-up sits on the button, the button
//! is greyed out, the typing loses a letter, a second monitor throws the
//! coordinates off. Safe Hands handles those so the model only has to choose:
//!
//! * [`controls`] — the real buttons, links and fields of a window, numbered,
//!   each clipped to the part you can actually see. Give the list to the model;
//!   it answers "click 7" instead of guessing coordinates.
//! * [`safe_click`] — before a click: is that control really under the
//!   pointer (and if the page moved, where is it now)? Greyed out? Covered by
//!   another window (then it's pressed directly through UI Automation)? Every
//!   check is a few milliseconds.
//! * [`type_and_check`] — types, reads the box back, retypes a short box once
//!   if it doesn't match.
//! * [`pointer`] — the cursor placed on the exact pixel on any monitor.
//!
//! ```no_run
//! # #[cfg(windows)] {
//! use safe_hands::{controls, safe_click, Outcome};
//!
//! safe_hands::dpi_aware(); // once, at start: real pixels everywhere
//! let window = controls::foreground_window().expect("a window in front");
//! let list = controls::list(window, 80);
//! // …show `list` (and a screenshot) to your model; it picks a number…
//! let pick = list.iter().find(|c| c.name == "Sign in").expect("on screen");
//! match safe_click(window, pick) {
//!     Outcome::Clicked | Outcome::ClickedWhereItMoved | Outcome::PressedDirectly { .. } => {}
//!     Outcome::Disabled => println!("greyed out — fill the form first"),
//!     Outcome::Covered { by } => println!("{by} is on top — close it first"),
//!     Outcome::Failed(why) => println!("{why}"),
//! }
//! # }
//! ```
//!
//! Built on Microsoft's UFO² findings (acting on controls directly recovers
//! over a quarter of failed clicks) and Anthropic's computer-use guidance.
//! MIT licensed.

pub mod controls;
pub mod pointer;

mod checks;

pub use checks::{check_target, covered_at, press_named, safe_click, type_and_check, AtPoint, Outcome, Typed};
pub use controls::{Control, Rect};

/// Use real pixels everywhere (per-monitor DPI awareness). Call once at start,
/// before anything else touches a window: coordinates from the controls list,
/// screenshots and the pointer then all agree.
pub fn dpi_aware() {
    #[cfg(windows)]
    unsafe {
        use windows::Win32::UI::HiDpi::{SetProcessDpiAwareness, PROCESS_PER_MONITOR_DPI_AWARE};
        let _ = SetProcessDpiAwareness(PROCESS_PER_MONITOR_DPI_AWARE);
    }
}
