//! Keep the PC from going to sleep while Izuki works on your missions — and
//! only then. While a `KeepAwake` is alive, Windows won't sleep on its own;
//! when it's dropped (the missions finish, are stopped, or the thread ends
//! however it ends), Windows' own power settings are back in charge.
//!
//! Only the system is kept awake, not the display: the screen still turns
//! off and locks on your normal schedule, so walking away never leaves the
//! PC sitting unlocked. Work that needs the screen reports that the PC is
//! locked instead of pretending.

/// Holds sleep off for as long as it lives (on this thread).
pub struct KeepAwake {
    _private: (),
}

impl KeepAwake {
    pub fn new(why: &str) -> Self {
        #[cfg(windows)]
        unsafe {
            use windows::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS, ES_SYSTEM_REQUIRED};
            SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED);
        }
        eprintln!("[awake] keeping the PC awake: {why}");
        KeepAwake { _private: () }
    }
}

impl Drop for KeepAwake {
    fn drop(&mut self) {
        #[cfg(windows)]
        unsafe {
            use windows::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS};
            SetThreadExecutionState(ES_CONTINUOUS);
        }
        eprintln!("[awake] normal sleep settings are back");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn holds_and_releases() {
        // Windows reports the previous state; holding and dropping must not panic
        // and must leave the thread back at "continuous only".
        let held = KeepAwake::new("test");
        drop(held);
        #[cfg(windows)]
        unsafe {
            use windows::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS, ES_SYSTEM_REQUIRED};
            let before = SetThreadExecutionState(ES_CONTINUOUS);
            assert_eq!(before.0 & ES_SYSTEM_REQUIRED.0, 0, "sleep is no longer held after drop");
        }
    }
}
