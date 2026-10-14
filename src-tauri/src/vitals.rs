//! The Island's Vitals tab — a mini JARVIS readout, every number measured:
//! the PC's processor and memory load (the same readings PC Boost uses),
//! battery, internet, Izuki's own memory, and what Izuki is working on.
//! Read only while the tab is open (the Island asks every few seconds then),
//! never in the background.

use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Vitals {
    /// Processor in use across the PC, %.
    pub cpu: u8,
    /// Memory in use across the PC, %.
    pub ram: u8,
    /// (percent, plugged in), or None on a PC without a battery.
    pub battery: Option<(u8, bool)>,
    pub online: bool,
    /// Izuki's main process, MB (its windows are separate processes).
    pub izuki_mb: u64,
    /// What Izuki is doing right now ("" when nothing).
    pub task: String,
    /// Missions running: (the current one, how many more wait).
    pub missions: Option<(String, usize)>,
}

/// One reading. The processor figure is a difference over time, so the very
/// first reading takes a second sample a moment later.
pub fn now() -> Vitals {
    static PRIMED: std::sync::Once = std::sync::Once::new();
    PRIMED.call_once(|| {
        let _ = crate::boost::load_now();
        std::thread::sleep(std::time::Duration::from_millis(300));
    });
    let (cpu, ram) = crate::boost::load_now();
    Vitals {
        cpu,
        ram,
        battery: crate::briefing::battery_raw(),
        online: crate::brain::online(),
        izuki_mb: own_mb(),
        task: if crate::state::task_running() { crate::state::doing_now() } else { String::new() },
        missions: crate::missions::glance(),
    }
}

#[cfg(windows)]
fn own_mb() -> u64 {
    use windows::Win32::System::ProcessStatus::{K32GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS};
    use windows::Win32::System::Threading::GetCurrentProcess;
    let mut pmc = PROCESS_MEMORY_COUNTERS { cb: std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32, ..Default::default() };
    if unsafe { K32GetProcessMemoryInfo(GetCurrentProcess(), &mut pmc, pmc.cb) }.as_bool() {
        pmc.WorkingSetSize as u64 / (1024 * 1024)
    } else {
        0
    }
}

#[cfg(not(windows))]
fn own_mb() -> u64 {
    0
}

#[cfg(test)]
mod tests {
    #[test]
    fn reads_real_numbers() {
        let v = super::now();
        assert!(v.cpu <= 100 && v.ram > 0 && v.ram <= 100, "{v:?}");
        assert!(v.izuki_mb > 0, "this process has some memory");
    }
}
