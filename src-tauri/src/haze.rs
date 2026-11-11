//! Dim the rest — "dim everything except this window". A dark veil sits just
//! behind the window you're working in, so everything else fades back and
//! that one window stands out; switch windows and the veil moves behind the
//! new one. It fades in and out, clicks pass straight through it, it never
//! takes focus, and screenshots (Izuki's own looks, recordings, the phone
//! remote) never see it — the AI always reads the real screen.
//!
//! One native window covering every screen, kept in the z-order right under
//! the window in front (Windows tells us when that changes). Nothing polls
//! fast: a one-second check catches a window that came up without focus.

use anyhow::Result;
use parking_lot::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU8, Ordering};

/// How dark the rest goes.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    Soft,
    Medium,
    Deep,
}

impl Level {
    fn alpha(self) -> u8 {
        match self {
            Level::Soft => 90,
            Level::Medium => 145,
            Level::Deep => 200,
        }
    }

    fn of(alpha: u8) -> Level {
        match alpha {
            0..=110 => Level::Soft,
            111..=170 => Level::Medium,
            _ => Level::Deep,
        }
    }

    pub fn from_id(id: &str) -> Option<Level> {
        match id {
            "soft" => Some(Level::Soft),
            "medium" => Some(Level::Medium),
            "deep" => Some(Level::Deep),
            _ => None,
        }
    }
}

/// Start, stop, Focus mode's claim and the veil's own teardown take turns.
static TURN: Mutex<()> = Mutex::new(());
/// The veil's thread is running (it may still be fading in or out).
static RUNNING: AtomicBool = AtomicBool::new(false);
/// Fading out to go away.
static STOPPING: AtomicBool = AtomicBool::new(false);
/// How dark it's heading for, and how dark it is now (0–255).
static TARGET: AtomicU8 = AtomicU8::new(0);
static CURRENT: AtomicU8 = AtomicU8::new(0);
/// Turned on by Focus mode (so Focus mode ending turns it off again, and a
/// dim you asked for yourself stays). Changed only in turn (TURN).
static FOR_FOCUS: AtomicBool = AtomicBool::new(false);

/// How dark the rest is, or None when it isn't dimmed.
pub fn state() -> Option<Level> {
    (RUNNING.load(Ordering::SeqCst) && !STOPPING.load(Ordering::SeqCst)).then(|| Level::of(TARGET.load(Ordering::SeqCst)))
}

/// Dim everything but the window in front (or change how dark). It's yours
/// now: Focus mode ending won't take it away.
pub fn start(level: Level) -> Result<String> {
    let was = state();
    {
        let turn = TURN.lock();
        begin(turn, level)?;
        FOR_FOCUS.store(false, Ordering::SeqCst);
    }
    crate::actlog::record("style", "Dimmed everything but the window in front");
    Ok(match was {
        Some(old) if old == level => "Everything but your window is already dimmed. Say “undim” to bring it all back.".into(),
        Some(_) => format!("Done — the rest is {} now.", match level { Level::Soft => "a little dimmer", Level::Medium => "dimmed", Level::Deep => "nearly dark" }),
        None => "Dimmed everything but the window you're in — switch windows and the light follows you. Say “undim” to bring it all back.".into(),
    })
}

/// Bring everything back.
pub fn stop() -> String {
    let ended = {
        let turn = TURN.lock();
        FOR_FOCUS.store(false, Ordering::SeqCst);
        end(turn)
    };
    if ended {
        crate::actlog::record("style", "Brought the dimmed windows back");
        "Everything's back to normal brightness.".into()
    } else {
        "Nothing was dimmed.".into()
    }
}

/// Focus mode started: dim the rest, unless you already did yourself.
/// True when the rest is dimmed now (by Focus mode or by you).
pub fn for_focus() -> bool {
    let turn = TURN.lock();
    if RUNNING.load(Ordering::SeqCst) && !STOPPING.load(Ordering::SeqCst) {
        return true;
    }
    match begin(turn, Level::Medium) {
        Ok(()) => {
            FOR_FOCUS.store(true, Ordering::SeqCst);
            true
        }
        Err(e) => {
            eprintln!("[dim] focus mode couldn't dim the rest: {e}");
            false
        }
    }
}

/// Focus mode ended: take away only a dim Focus mode put there.
pub fn focus_over() {
    let turn = TURN.lock();
    if FOR_FOCUS.swap(false, Ordering::SeqCst) {
        end(turn);
    }
}

/// Bring the veil up at `level` (or change its darkness), in turn. A new
/// veil counts only once its window is really on screen.
fn begin(turn: parking_lot::MutexGuard<'_, ()>, level: Level) -> Result<()> {
    if RUNNING.load(Ordering::SeqCst) {
        TARGET.store(level.alpha(), Ordering::SeqCst);
        STOPPING.store(false, Ordering::SeqCst);
        win::nudge();
        return Ok(());
    }
    win::supported()?;
    TARGET.store(level.alpha(), Ordering::SeqCst);
    STOPPING.store(false, Ordering::SeqCst);
    RUNNING.store(true, Ordering::SeqCst);
    CURRENT.store(0, Ordering::SeqCst);
    let (made, ready) = std::sync::mpsc::channel::<bool>();
    if let Err(e) = std::thread::Builder::new().name("izuki-dim".into()).spawn(move || win::run(made)) {
        RUNNING.store(false, Ordering::SeqCst);
        return Err(anyhow::anyhow!("Couldn't dim the rest: {e}"));
    }
    // The veil's thread says how it went before it ever takes the turn.
    let answer = ready.recv_timeout(std::time::Duration::from_secs(3));
    match answer {
        Ok(true) => return Ok(()),
        // It couldn't: nothing is running.
        Ok(false) => {
            RUNNING.store(false, Ordering::SeqCst);
            STOPPING.store(false, Ordering::SeqCst);
        }
        // Too slow: if it does come up, it fades straight out and goes.
        Err(_) => {
            STOPPING.store(true, Ordering::SeqCst);
            TARGET.store(0, Ordering::SeqCst);
        }
    }
    drop(turn);
    Err(anyhow::anyhow!("Windows didn't let me dim the rest just now. Try again in a moment."))
}

/// Fade out and go, in turn; false when nothing was dimmed.
fn end(_turn: parking_lot::MutexGuard<'_, ()>) -> bool {
    if !RUNNING.load(Ordering::SeqCst) || STOPPING.load(Ordering::SeqCst) {
        return false;
    }
    STOPPING.store(true, Ordering::SeqCst);
    TARGET.store(0, Ordering::SeqCst);
    win::nudge();
    true
}

/// The next fade step from `now` toward `to`: quick at first, gentle at the
/// end (about a sixth of a second for a full fade).
fn fade_step(now: u8, to: u8) -> u8 {
    let gap = now.abs_diff(to);
    let step = (gap / 4).max(3).min(gap);
    if now < to { now + step } else { now - step }
}

/// Windows that are part of Windows itself, not a window you work in: the
/// desktop, the taskbar, Start and search, the task switcher. The veil stays
/// where it was while one of these is in front.
fn shell_class(class: &str) -> bool {
    matches!(
        class,
        "Progman"
            | "WorkerW"
            | "Shell_TrayWnd"
            | "Shell_SecondaryTrayWnd"
            | "Windows.UI.Core.CoreWindow"
            | "MultitaskingViewFrame"
            | "XamlExplorerHostIslandWindow"
            | "ForegroundStaging"
            | "NotifyIconOverflowWindow"
            | "TopLevelWindowForOverflowXamlIsland"
            | "#32768"
    )
}

#[cfg(windows)]
mod win {
    use super::{fade_step, shell_class, CURRENT, RUNNING, STOPPING, TARGET, TURN};
    use std::sync::atomic::{AtomicIsize, Ordering};
    use windows::core::w;
    use windows::Win32::Foundation::{COLORREF, HINSTANCE, HWND, LPARAM, LRESULT, WPARAM};
    use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED};
    use windows::Win32::Graphics::Gdi::{GetStockObject, BLACK_BRUSH, HBRUSH};
    use windows::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows::Win32::UI::Accessibility::{SetWinEventHook, UnhookWinEvent, HWINEVENTHOOK};
    use windows::Win32::UI::WindowsAndMessaging::{
        CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, GetClassNameW, GetForegroundWindow, GetMessageW,
        GetSystemMetrics, GetWindowLongW, IsIconic, IsWindowVisible, KillTimer, PostMessageW, PostQuitMessage, RegisterClassW,
        SetLayeredWindowAttributes, SetTimer, SetWindowDisplayAffinity, SetWindowPos, TranslateMessage, EVENT_SYSTEM_FOREGROUND,
        GWL_EXSTYLE, HTTRANSPARENT, HWND_TOP, LWA_ALPHA, MA_NOACTIVATE, MSG, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN,
        SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOOWNERZORDER, SWP_NOSIZE, SWP_NOZORDER,
        SWP_SHOWWINDOW, WDA_EXCLUDEFROMCAPTURE, WINEVENT_OUTOFCONTEXT, WM_APP, WM_DESTROY, WM_DISPLAYCHANGE,
        WM_MOUSEACTIVATE, WM_NCHITTEST, WM_TIMER, WNDCLASSW, WS_EX_LAYERED, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW, WS_EX_TOPMOST,
        WS_EX_TRANSPARENT, WS_POPUP,
    };

    /// The veil's window (0 = none).
    static WINDOW: AtomicIsize = AtomicIsize::new(0);

    /// Windows' build number (19041 = Windows 10 version 2004), 0 if unknown.
    fn build() -> u32 {
        use windows::Win32::System::Registry::{RegGetValueW, HKEY_LOCAL_MACHINE, RRF_RT_REG_SZ};
        let mut buf = [0u16; 32];
        let mut size = (buf.len() * 2) as u32;
        let ok = unsafe {
            RegGetValueW(HKEY_LOCAL_MACHINE, w!("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion"), w!("CurrentBuildNumber"), RRF_RT_REG_SZ, None, Some(buf.as_mut_ptr().cast()), Some(&mut size))
        };
        if ok.is_err() {
            return 0;
        }
        let n = (size as usize / 2).saturating_sub(1).min(buf.len());
        String::from_utf16_lossy(&buf[..n]).trim().parse().unwrap_or(0)
    }

    /// Keeping the veil out of screenshots needs Windows 10 version 2004 or
    /// newer: before that, Windows shows such a window as a black box in
    /// every screenshot — the AI would see a black screen. Then: no veil.
    pub fn supported() -> anyhow::Result<()> {
        if build() >= 19041 {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Dimming the rest needs Windows 10 version 2004 or newer (so it stays out of screenshots). Windows Update can bring this PC up to date."))
        }
    }
    const FADE: usize = 1;
    const CHECK: usize = 2;
    /// "How dark changed": start fading.
    const WM_NUDGE: u32 = WM_APP + 41;

    fn hwnd(raw: isize) -> HWND {
        HWND(raw as *mut core::ffi::c_void)
    }

    /// The veil's window, if it's up.
    pub fn window() -> Option<isize> {
        Some(WINDOW.load(Ordering::SeqCst)).filter(|&w| w != 0)
    }

    /// Tell the veil its darkness changed.
    pub fn nudge() {
        if let Some(raw) = window() {
            unsafe {
                let _ = PostMessageW(Some(hwnd(raw)), WM_NUDGE, WPARAM(0), LPARAM(0));
            }
        }
    }

    /// Every screen together, in pixels.
    fn all_screens() -> (i32, i32, i32, i32) {
        unsafe {
            (
                GetSystemMetrics(SM_XVIRTUALSCREEN),
                GetSystemMetrics(SM_YVIRTUALSCREEN),
                GetSystemMetrics(SM_CXVIRTUALSCREEN),
                GetSystemMetrics(SM_CYVIRTUALSCREEN),
            )
        }
    }

    fn class_of(h: HWND) -> String {
        let mut buf = [0u16; 128];
        let n = unsafe { GetClassNameW(h, &mut buf) };
        String::from_utf16_lossy(&buf[..n.max(0) as usize])
    }

    /// A window you work in, in front and showing.
    pub(super) fn worth_following(h: HWND) -> bool {
        unsafe {
            if !IsWindowVisible(h).as_bool() || IsIconic(h).as_bool() {
                return false;
            }
            let mut cloaked = 0u32;
            let _ = DwmGetWindowAttribute(h, DWMWA_CLOAKED, (&mut cloaked as *mut u32).cast(), std::mem::size_of::<u32>() as u32);
            cloaked == 0 && !shell_class(&class_of(h))
        }
    }

    /// Put the veil right under the window in front. A window that's always
    /// on top is above the veil anyway: then the veil goes over every other
    /// window.
    fn follow(veil: HWND, show: bool) {
        unsafe {
            let front = GetForegroundWindow();
            let flags = SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_NOOWNERZORDER | if show { SWP_SHOWWINDOW } else { Default::default() };
            if front.0.is_null() || front == veil || !worth_following(front) {
                if show {
                    let _ = SetWindowPos(veil, Some(HWND_TOP), 0, 0, 0, 0, flags);
                }
                return;
            }
            let topmost = GetWindowLongW(front, GWL_EXSTYLE) as u32 & WS_EX_TOPMOST.0 != 0;
            let _ = SetWindowPos(veil, Some(if topmost { HWND_TOP } else { front }), 0, 0, 0, 0, flags);
        }
    }

    /// Cover every screen (again, after a screen was added or changed).
    fn fit(veil: HWND) {
        let (x, y, w, h) = all_screens();
        unsafe {
            let _ = SetWindowPos(veil, None, x, y, w, h, SWP_NOZORDER | SWP_NOACTIVATE);
        }
    }

    unsafe extern "system" fn on_front(_: HWINEVENTHOOK, _: u32, _: HWND, _: i32, _: i32, _: u32, _: u32) {
        if let Some(raw) = window() {
            follow(hwnd(raw), false);
        }
    }

    /// One fade step; at the end of fading out, the veil goes away.
    fn fade(veil: HWND) {
        let to = TARGET.load(Ordering::SeqCst);
        let now = CURRENT.load(Ordering::SeqCst);
        let next = fade_step(now, to);
        CURRENT.store(next, Ordering::SeqCst);
        unsafe {
            let _ = SetLayeredWindowAttributes(veil, COLORREF(0), next, LWA_ALPHA);
        }
        if next != to {
            return;
        }
        unsafe {
            let _ = KillTimer(Some(veil), FADE);
        }
        if next == 0 && STOPPING.load(Ordering::SeqCst) {
            // Checked again in turn: a "dim the rest" just now keeps it.
            let turn = TURN.lock();
            if STOPPING.load(Ordering::SeqCst) {
                WINDOW.store(0, Ordering::SeqCst);
                RUNNING.store(false, Ordering::SeqCst);
                STOPPING.store(false, Ordering::SeqCst);
                drop(turn);
                unsafe {
                    let _ = DestroyWindow(veil);
                }
            }
        }
    }

    unsafe extern "system" fn proc(h: HWND, msg: u32, wp: WPARAM, lp: LPARAM) -> LRESULT {
        match msg {
            WM_TIMER if wp.0 == FADE => {
                fade(h);
                LRESULT(0)
            }
            WM_TIMER if wp.0 == CHECK => {
                follow(h, false);
                LRESULT(0)
            }
            WM_NUDGE => {
                SetTimer(Some(h), FADE, 15, None);
                LRESULT(0)
            }
            WM_DISPLAYCHANGE => {
                fit(h);
                LRESULT(0)
            }
            // Never takes a click or focus, even if Windows asks.
            WM_NCHITTEST => LRESULT(HTTRANSPARENT as isize),
            WM_MOUSEACTIVATE => LRESULT(MA_NOACTIVATE as isize),
            WM_DESTROY => {
                PostQuitMessage(0);
                LRESULT(0)
            }
            _ => DefWindowProcW(h, msg, wp, lp),
        }
    }

    /// The veil's own thread: its window, its messages, until it fades out.
    /// Says whether the window came up before anything else (`made`).
    pub fn run(made: std::sync::mpsc::Sender<bool>) {
        let veil = unsafe { make() };
        // Heard: whoever asked tidies up. Not heard (it gave up waiting): a
        // failure is tidied here; a veil fades straight out (it was told to).
        let heard = made.send(veil.is_some()).is_ok();
        let Some(veil) = veil else {
            eprintln!("[dim] couldn't make the dimming layer");
            if !heard {
                let _turn = TURN.lock();
                RUNNING.store(false, Ordering::SeqCst);
                STOPPING.store(false, Ordering::SeqCst);
            }
            return;
        };
        unsafe {
            let hook = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, None, Some(on_front), 0, 0, WINEVENT_OUTOFCONTEXT);
            SetTimer(Some(veil), CHECK, 1000, None);
            SetTimer(Some(veil), FADE, 15, None);
            let mut msg = MSG::default();
            while GetMessageW(&mut msg, None, 0, 0).as_bool() {
                let _ = TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
            if !hook.is_invalid() {
                let _ = UnhookWinEvent(hook);
            }
        }
        let _turn = TURN.lock();
        if WINDOW.load(Ordering::SeqCst) == veil.0 as isize {
            WINDOW.store(0, Ordering::SeqCst);
            RUNNING.store(false, Ordering::SeqCst);
            STOPPING.store(false, Ordering::SeqCst);
        }
    }

    unsafe fn make() -> Option<HWND> {
        let module = GetModuleHandleW(None).ok()?;
        let instance = HINSTANCE(module.0);
        let class = w!("IzukiDimTheRest");
        let wc = WNDCLASSW {
            lpfnWndProc: Some(proc),
            hInstance: instance,
            lpszClassName: class,
            hbrBackground: HBRUSH(GetStockObject(BLACK_BRUSH).0),
            ..Default::default()
        };
        // Already registered the second time round: that's fine.
        RegisterClassW(&wc);
        let (x, y, w, h) = all_screens();
        let veil = CreateWindowExW(
            WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE,
            class,
            w!(""),
            WS_POPUP,
            x,
            y,
            w,
            h,
            None,
            None,
            Some(instance),
            None,
        )
        .ok()?;
        let _ = SetLayeredWindowAttributes(veil, COLORREF(0), 0, LWA_ALPHA);
        // Screenshots, recordings and the phone remote see the real screen.
        // If Windows won't keep it out of them, it never shows at all.
        if SetWindowDisplayAffinity(veil, WDA_EXCLUDEFROMCAPTURE).is_err() {
            eprintln!("[dim] Windows wouldn't keep the dim out of screenshots — not showing it");
            let _ = DestroyWindow(veil);
            return None;
        }
        WINDOW.store(veil.0 as isize, Ordering::SeqCst);
        follow(veil, true);
        Some(veil)
    }
}

#[cfg(not(windows))]
mod win {
    pub fn nudge() {}
    pub fn run(made: std::sync::mpsc::Sender<bool>) {
        let _ = made.send(false);
    }
    pub fn supported() -> anyhow::Result<()> {
        Err(anyhow::anyhow!("Dimming the rest works in the Windows app."))
    }
    pub fn window() -> Option<isize> {
        None
    }
}

/// The veil's window, for checks (none when nothing's dimmed).
pub fn window() -> Option<isize> {
    win::window()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fades_settle_exactly_and_quickly() {
        for (from, to) in [(0u8, 145u8), (200, 0), (90, 200), (145, 145), (1, 0), (0, 2)] {
            let mut now = from;
            let mut steps = 0;
            while now != to {
                now = fade_step(now, to);
                steps += 1;
                assert!(steps < 30, "{from}→{to} never settled");
            }
            assert!(steps <= 20, "{from}→{to} took {steps} steps");
        }
    }

    #[test]
    fn levels_round_trip() {
        for l in [Level::Soft, Level::Medium, Level::Deep] {
            assert_eq!(Level::of(l.alpha()), l);
            assert_eq!(Level::from_id(&serde_json::to_value(l).unwrap().as_str().unwrap().to_string()), Some(l));
        }
    }

    #[test]
    fn the_shell_is_not_a_window_you_work_in() {
        assert!(shell_class("Shell_TrayWnd"));
        assert!(shell_class("Progman"));
        assert!(!shell_class("Chrome_WidgetWin_1"));
        assert!(!shell_class("Notepad"));
    }

    /// Opt-in, on a real desktop (IZUKI_DIM_REAL=1): the veil comes up right
    /// under the window in front, fades to its darkness, and goes away again.
    #[cfg(windows)]
    #[test]
    fn real_dim_sits_under_the_front_window() {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindow, GW_HWNDNEXT, IsWindowVisible};
        if std::env::var("IZUKI_DIM_REAL").is_err() {
            return;
        }
        begin(TURN.lock(), Level::Medium).unwrap();
        std::thread::sleep(std::time::Duration::from_millis(700));
        let veil = window().expect("the veil is up");
        assert_eq!(CURRENT.load(Ordering::SeqCst), Level::Medium.alpha(), "faded in fully");
        let front = unsafe { GetForegroundWindow() };
        let under = unsafe { GetWindow(front, GW_HWNDNEXT) }.ok().map(|h: HWND| h.0 as isize);
        eprintln!("front {:?}, under it {:?}, veil {veil}", front.0, under);
        if win::worth_following(front) {
            assert_eq!(under, Some(veil), "the veil sits right under the window in front");
        }
        assert!(unsafe { IsWindowVisible(HWND(veil as *mut core::ffi::c_void)) }.as_bool());
        assert!(end(TURN.lock()));
        std::thread::sleep(std::time::Duration::from_millis(700));
        assert!(window().is_none(), "faded out and gone");
        assert!(state().is_none());
    }
}
