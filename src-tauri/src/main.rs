// Izuki is a tray app: no console window should ever flash on launch.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // A look at the screen builds a big prompt and walks a page's HTML, and
    // that work runs on a tokio worker. The default 2 MB worker stack
    // overflowed mid-session once — "thread 'tokio-rt-worker' has overflowed
    // its stack" — which kills the process outright: a stack overflow is not
    // a panic, so nothing can catch it. 16 MB is virtual memory, only the
    // pages actually touched cost anything.
    match tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .thread_stack_size(16 * 1024 * 1024)
        .build()
    {
        Ok(rt) => {
            tauri::async_runtime::set(rt.handle().clone());
            // The runtime must outlive the app: dropping it here would shut
            // down every background task the moment the app starts.
            std::mem::forget(rt);
        }
        Err(e) => eprintln!("[izuki] couldn't start the async runtime: {e}"),
    }
    izuki_lib::run();
}
