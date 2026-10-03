//! Window plumbing: the drawing overlay, and the Windows 11 glass treatment
//! applied to the config panel.

use std::sync::atomic::{AtomicBool, Ordering};

use anyhow::{anyhow, Result};
use tauri::{AppHandle, Emitter, LogicalSize, Manager, PhysicalPosition, PhysicalSize, WebviewUrl,
            WebviewWindow, WebviewWindowBuilder};

use crate::capture;
use crate::settings::BackdropMode;

pub const CONFIG_LABEL: &str = "main";
pub const OVERLAY_LABEL: &str = "overlay";

/// Whether the overlay window is currently up, in any mode. The follow
/// thread keeps streaming cursor positions while this is set — not just in
/// follow mode — because that's what lets the overlay hit-test its floating
/// widgets (chat bubble, caption box) while the window is click-through.
static OVERLAY_SHOWN: AtomicBool = AtomicBool::new(false);
/// The voice orb is up (a conversation, or Izuki answering). It lives in the
/// overlay window, so while it's up the window must never be hidden — only
/// dropped back to its click-through "follow" state. Kept in step with the
/// webview's `izuki://orb` events by [`track_orb`].
static ORB_UP: AtomicBool = AtomicBool::new(false);

/// Follow the orb's state, so hiding the overlay never takes the orb with it
/// (it used to vanish the moment a task finished).
pub fn track_orb(app: &AppHandle) {
    use tauri::Listener;
    app.listen_any("izuki://orb", |e| {
        ORB_UP.store(!e.payload().contains("hidden"), Ordering::Relaxed);
    });
}

/// A stop closes the orb. Said here first, because the webview's own
/// "hidden" arrives a moment later — hiding the overlay in between would see
/// the orb still "up" and bring the window straight back.
pub fn orb_closed() {
    ORB_UP.store(false, Ordering::Relaxed);
}

pub fn overlay_shown() -> bool {
    OVERLAY_SHOWN.load(Ordering::Relaxed)
}

/// WebView2 flags for *both* windows — they share one browser environment,
/// and WebView2 refuses to create a second webview whose flags differ.
/// Tauri's own defaults are kept; autoplay is opened up because Izuki's
/// voice plays from the config panel while it's hidden in the tray, where
/// nobody has clicked to "allow" audio.
pub const BROWSER_ARGS: &str = "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection \
                            --autoplay-policy=no-user-gesture-required";

/// Let Izuki's own pages use the microphone without a permission prompt.
///
/// WebView2 otherwise asks with a dialog on the requesting window — and the
/// config panel usually listens while it's hidden in the tray, where that
/// dialog can never be seen or answered, so the mic just hangs forever.
/// Both windows only ever load Izuki's own UI, so there's nobody else to ask
/// on behalf of.
fn grant_microphone(w: &WebviewWindow) {
    #[cfg(windows)]
    let _ = w.with_webview(|pw| unsafe {
        use webview2_com::Microsoft::Web::WebView2::Win32::{
            COREWEBVIEW2_PERMISSION_KIND, COREWEBVIEW2_PERMISSION_KIND_MICROPHONE,
            COREWEBVIEW2_PERMISSION_STATE_ALLOW,
        };
        use webview2_com::PermissionRequestedEventHandler;

        let Ok(core) = pw.controller().CoreWebView2() else { return };
        let mut token = 0i64;
        let _ = core.add_PermissionRequested(
            &PermissionRequestedEventHandler::create(Box::new(|_, args| {
                let Some(args) = args else { return Ok(()) };
                let mut kind = COREWEBVIEW2_PERMISSION_KIND::default();
                args.PermissionKind(&mut kind)?;
                if kind == COREWEBVIEW2_PERMISSION_KIND_MICROPHONE {
                    args.SetState(COREWEBVIEW2_PERMISSION_STATE_ALLOW)?;
                }
                Ok(())
            })),
            &mut token,
        );
    });
}

// ---------------------------------------------------------------------------
// Config panel
// ---------------------------------------------------------------------------

pub fn ensure_config(app: &AppHandle) -> Result<WebviewWindow> {
    if let Some(w) = app.get_webview_window(CONFIG_LABEL) {
        return Ok(w);
    }

    // Centred by hand off GetSystemMetrics rather than the builder's own
    // `.center()`, which needs live monitor geometry from the windowing event
    // loop — not available this early, before `.run()` starts pumping it.
    let desktop = capture::virtual_bounds();
    let (w_px, h_px) = (560.0_f64, 720.0_f64);
    let x = desktop.x as f64 + (desktop.w as f64 - w_px) / 2.0;
    let y = desktop.y as f64 + (desktop.h as f64 - h_px) / 2.0;

    let w = WebviewWindowBuilder::new(app, CONFIG_LABEL, WebviewUrl::App("index.html".into()))
        .additional_browser_args(BROWSER_ARGS)
        .title("Izuki")
        .inner_size(w_px, h_px)
        .min_inner_size(460.0, 560.0)
        .position(x, y)
        .decorations(false)
        .transparent(true)
        .resizable(true)
        .shadow(false)
        .visible(false)
        // Load-bearing: a transparent, undecorated, initially-hidden window
        // that also requests focus at creation (the default) never properly
        // materialises on some Windows/DWM configurations — Tauri reports
        // success throughout, but the native handle silently never comes up,
        // so nothing about the window works afterwards (show, focus, even
        // querying it). Deferring focus to the explicit `set_focus()` call
        // once the panel is actually shown avoids the whole failure mode.
        .focused(false)
        .build()?;

    grant_microphone(&w);
    Ok(w)
}

pub fn show_config(app: &AppHandle) -> Result<()> {
    let w = ensure_config(app)?;
    w.show()?;
    w.unminimize().ok();
    w.set_focus()?;
    repaint(&w);
    Ok(())
}

/// Coming back from the tray, the see-through panel sometimes showed only
/// Windows' frosted backdrop — the page underneath was all there, but the
/// web view hadn't drawn it again yet. A one-pixel size nudge and back makes
/// it redraw at once (too quick to see).
pub fn repaint(w: &WebviewWindow) {
    let w = w.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(60));
        let Ok(size) = w.inner_size() else { return };
        let _ = w.set_size(tauri::PhysicalSize::new(size.width, size.height + 1));
        std::thread::sleep(std::time::Duration::from_millis(40));
        let _ = w.set_size(size);
    });
}

/// Apply the Windows 11 backdrop, dark title colours and rounded corners.
///
/// A DWM system backdrop fills the whole window rectangle, so when one is
/// enabled the page switches to a flush layout whose CSS radius matches the
/// corners DWM draws. With `None` the window stays fully transparent and the
/// page draws its own floating, deeply rounded sheet instead.
pub fn apply_backdrop(window: &WebviewWindow, mode: BackdropMode) {
    #[cfg(windows)]
    {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::Graphics::Dwm::{
            DwmSetWindowAttribute, DWMSBT_MAINWINDOW, DWMSBT_NONE, DWMSBT_TABBEDWINDOW,
            DWMSBT_TRANSIENTWINDOW, DWMWA_SYSTEMBACKDROP_TYPE, DWMWA_USE_IMMERSIVE_DARK_MODE,
            DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_ROUND, DWM_SYSTEMBACKDROP_TYPE,
            DWM_WINDOW_CORNER_PREFERENCE,
        };

        let Ok(raw) = window.hwnd() else { return };
        // Tauri may be built against a different windows-rs release, so go via
        // the raw pointer rather than passing its HWND type straight through.
        let hwnd = HWND(raw.0 as *mut core::ffi::c_void);

        unsafe {
            let dark: i32 = 1;
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWA_USE_IMMERSIVE_DARK_MODE,
                (&dark as *const i32).cast(),
                std::mem::size_of::<i32>() as u32,
            );

            let corner: DWM_WINDOW_CORNER_PREFERENCE = DWMWCP_ROUND;
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWA_WINDOW_CORNER_PREFERENCE,
                (&corner as *const DWM_WINDOW_CORNER_PREFERENCE).cast(),
                std::mem::size_of::<DWM_WINDOW_CORNER_PREFERENCE>() as u32,
            );

            let backdrop: DWM_SYSTEMBACKDROP_TYPE = match mode {
                BackdropMode::Acrylic => DWMSBT_TRANSIENTWINDOW,
                BackdropMode::Mica => DWMSBT_MAINWINDOW,
                BackdropMode::Tabbed => DWMSBT_TABBEDWINDOW,
                BackdropMode::None => DWMSBT_NONE,
            };
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWA_SYSTEMBACKDROP_TYPE,
                (&backdrop as *const DWM_SYSTEMBACKDROP_TYPE).cast(),
                std::mem::size_of::<DWM_SYSTEMBACKDROP_TYPE>() as u32,
            );
        }
    }

    #[cfg(not(windows))]
    {
        let _ = (window, mode);
    }
}

// ---------------------------------------------------------------------------
// Drawing overlay
// ---------------------------------------------------------------------------

/// Create the overlay if it does not exist, sized to span every monitor.
pub fn ensure_overlay(app: &AppHandle) -> Result<WebviewWindow> {
    if let Some(w) = app.get_webview_window(OVERLAY_LABEL) {
        fit_to_desktop(&w)?;
        return Ok(w);
    }

    let bounds = capture::virtual_bounds();

    let w = WebviewWindowBuilder::new(app, OVERLAY_LABEL, WebviewUrl::App("overlay.html".into()))
        .additional_browser_args(BROWSER_ARGS)
        .title("Izuki Overlay")
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .shadow(false)
        .focused(false)
        .visible(false)
        // A logical size here is replaced by the physical fit below; it only
        // stops the window being created at some default size first.
        .inner_size(bounds.w as f64, bounds.h as f64)
        .build()?;

    fit_to_desktop(&w)?;
    grant_microphone(&w);
    // Idle overlays must not eat clicks meant for the app underneath.
    w.set_ignore_cursor_events(true).ok();
    Ok(w)
}

/// Move and size the overlay to the bounding box of every monitor, in physical
/// pixels, so a drawn point maps 1:1 onto a screen coordinate.
pub fn fit_to_desktop(window: &WebviewWindow) -> Result<()> {
    let b = capture::virtual_bounds();
    window.set_position(PhysicalPosition::new(b.x, b.y))?;
    window.set_size(PhysicalSize::new(b.w.max(1) as u32, b.h.max(1) as u32))?;
    Ok(())
}

pub fn show_overlay(app: &AppHandle, interactive: bool) -> Result<WebviewWindow> {
    let w = ensure_overlay(app)?;
    fit_to_desktop(&w)?;
    w.set_ignore_cursor_events(!interactive).ok();
    w.set_always_on_top(true).ok();
    w.show()?;
    OVERLAY_SHOWN.store(true, Ordering::Relaxed);
    if interactive {
        w.set_focus().ok();
    }
    Ok(w)
}

/// Drop the overlay out of whatever it was doing (drawing, previewing a
/// voice command…) back to idle. If follow mode is on, "idle" is not hidden
/// at all — it's the minimal always-on hand, so this hands off to
/// [`show_follow`] instead of actually hiding the window.
pub fn hide_overlay(app: &AppHandle) -> Result<()> {
    // The orb is up: back to the plain click-through state, orb and all.
    let follow = stays_up(&crate::state::store().settings()) || ORB_UP.load(Ordering::Relaxed);
    if let Some(w) = app.get_webview_window(OVERLAY_LABEL) {
        w.set_ignore_cursor_events(true).ok();
        if follow {
            drop(w);
            return show_follow(app);
        }
        w.hide()?;
        OVERLAY_SHOWN.store(false, Ordering::Relaxed);
    }
    Ok(())
}

/// The overlay stays on screen (click-through) for the always-on hand or the
/// Island; otherwise it's put away when there's nothing to show.
pub fn stays_up(s: &crate::settings::Settings) -> bool {
    s.follow_mode_enabled || s.island_enabled
}

/// Show just the glowing hand, click-through, tracking the real cursor,
/// with no toolbar or prompt bar — the "you don't need the app open" mode.
/// Safe to call whether or not the overlay already exists or is visible.
pub fn show_follow(app: &AppHandle) -> Result<()> {
    let w = ensure_overlay(app)?;
    fit_to_desktop(&w)?;
    w.set_ignore_cursor_events(true).ok();
    w.set_always_on_top(true).ok();
    w.show()?;
    OVERLAY_SHOWN.store(true, Ordering::Relaxed);

    let b = capture::virtual_bounds();
    let _ = app.emit(
        crate::events::OVERLAY_OPEN,
        crate::model::OverlayOpenPayload {
            desktop: crate::model::DesktopBounds { x: b.x, y: b.y, w: b.w, h: b.h, scale: 1.0 },
            freeze: false,
            mode: "follow",
            shape: None,
        },
    );
    Ok(())
}

/// Hold-to-draw, from anywhere — no toolbar, no config panel, not even
/// follow mode needs to be on. The overlay flips from click-through to
/// interactive for as long as the quickdraw hotkey is held, so the one drag
/// you make lands as a single mark using the configured default shape.
/// [`end_quickdraw`] (fired on key-up) hands it to the exact same commit
/// path the full draw overlay uses, which already reverts the window
/// afterward — nothing extra to clean up here.
pub fn begin_quickdraw(app: &AppHandle) -> Result<()> {
    let w = ensure_overlay(app)?;
    fit_to_desktop(&w)?;
    w.set_ignore_cursor_events(false).ok();
    w.set_always_on_top(true).ok();
    w.show()?;
    OVERLAY_SHOWN.store(true, Ordering::Relaxed);
    w.set_focus().ok();

    let shape = crate::state::store().settings().default_draw_shape;
    let b = capture::virtual_bounds();
    let _ = app.emit(
        crate::events::OVERLAY_OPEN,
        crate::model::OverlayOpenPayload {
            desktop: crate::model::DesktopBounds { x: b.x, y: b.y, w: b.w, h: b.h, scale: 1.0 },
            freeze: false,
            mode: "quickdraw",
            shape: Some(shape),
        },
    );
    Ok(())
}

/// Izuki asks "which one? circle it for me": the quickdraw surface, opened
/// without a hotkey held — draw with the mouse, then type/say and Enter
/// (the overlay sends the answer back with `answer_help`).
pub fn begin_help(app: &AppHandle, question: &str) -> Result<()> {
    begin_quickdraw(app)?;
    let _ = app.emit(crate::events::HELP_ASK, question.to_string());
    Ok(())
}

pub fn end_quickdraw(app: &AppHandle) {
    let _ = app.emit(crate::events::QUICKDRAW_COMMIT, ());
}

/// Per-widget click-through. In follow/preview mode the overlay ignores the
/// mouse so you can use your PC underneath it — but that also means its own
/// chat bubble and caption box can't be clicked. The overlay hit-tests the
/// real cursor against those widgets and flips this on only while you're
/// over one. Deliberately never takes focus: hovering the bubble must not
/// yank the keyboard away from whatever you're typing in.
pub fn set_overlay_hit(app: &AppHandle, hit: bool) -> Result<()> {
    // While Izuki's own hands are working, its orb and bubbles never catch
    // the click it's making — see `Acting`.
    if hit && ACTING.load(std::sync::atomic::Ordering::SeqCst) {
        return Ok(());
    }
    if let Some(w) = app.get_webview_window(OVERLAY_LABEL) {
        w.set_ignore_cursor_events(!hit)?;
    }
    Ok(())
}

static ACTING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// While this lives, Izuki's own floating orb, chat bubble and caption let
/// every click through to the app underneath. They catch clicks when the
/// pointer is over them (so you can drag or close them) — and when Izuki's
/// hand moved there to click something they happened to sit on, the click
/// landed on Izuki's own orb instead.
pub struct Acting(AppHandle);

pub fn acting(app: &AppHandle) -> Acting {
    ACTING.store(true, std::sync::atomic::Ordering::SeqCst);
    if let Some(w) = app.get_webview_window(OVERLAY_LABEL) {
        let _ = w.set_ignore_cursor_events(true);
    }
    Acting(app.clone())
}

impl Drop for Acting {
    fn drop(&mut self) {
        ACTING.store(false, std::sync::atomic::Ordering::SeqCst);
        let _ = &self.0; // the overlay's hit-testing takes over again on the next pointer move
    }
}

/// A caption needs somewhere to render even when nothing else has the
/// overlay up (follow mode off, background execution). Brings it up in the
/// plain click-through state if it's hidden; leaves it alone if a draw or
/// preview session already owns it.
pub fn ensure_caption_visible(app: &AppHandle) -> Result<()> {
    if overlay_shown() {
        return Ok(());
    }
    show_follow(app)
}

pub fn set_overlay_interactive(app: &AppHandle, interactive: bool) -> Result<()> {
    let w = app
        .get_webview_window(OVERLAY_LABEL)
        .ok_or_else(|| anyhow!("the overlay is not open"))?;
    w.set_ignore_cursor_events(!interactive)?;
    if interactive {
        w.set_focus().ok();
    }
    Ok(())
}

/// Keep the config panel's logical size sane if the user drags it between
/// monitors with different scaling.
pub fn normalise_config_size(window: &WebviewWindow) {
    let _ = window.set_min_size(Some(LogicalSize::new(460.0, 560.0)));
}
