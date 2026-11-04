//! Disposable Windows verification host. Never calls izuki_lib::run, Store,
//! settings loading, cameras, agents, hotkeys, autostart or release functions.
//! Run only through tools/hand-overlay-check.cjs --native with an isolated
//! WEBVIEW2_USER_DATA_FOLDER and a loopback fixture server.
#[cfg(windows)]
fn main() {
    use tauri::{PhysicalPosition, PhysicalSize};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowLongPtrW, GWL_EXSTYLE, WS_EX_TRANSPARENT,
    };
    let origin = std::env::args().nth(1).expect("loopback fixture origin required");
    let url: tauri::Url = origin.parse().expect("valid fixture URL");
    assert!(url.scheme() == "http" && url.host_str() == Some("127.0.0.1"));
    let profile = std::env::var_os("WEBVIEW2_USER_DATA_FOLDER").expect("isolated profile required");
    assert!(std::path::Path::new(&profile).is_absolute());
    let mut context = tauri::generate_context!();
    context.config_mut().identifier = "app.izuki.hand-lifecycle-probe".into();
    context.config_mut().app.windows.clear();
    context.config_mut().build.dev_url = Some(url);
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![probe_finish, probe_switch_window])
        .setup(|app| {
            // The real overlay builder and native click-through behavior.
            let foreground = unsafe { GetForegroundWindow() };
            assert!(!foreground.is_invalid(), "requires an interactive Windows desktop");
            let w = izuki_lib::overlay::ensure_overlay(app.handle())?;
            let hwnd = windows::Win32::Foundation::HWND(w.hwnd()?.0);
            let w = izuki_lib::overlay::show_overlay(app.handle(), false)?;
            // Keep the disposable test view small; don't cover the desktop.
            w.set_size(PhysicalSize::new(720u32, 480u32))?;
            w.set_position(PhysicalPosition::new(32i32, 32i32))?;
            assert_ne!(unsafe { GetWindowLongPtrW(hwnd, GWL_EXSTYLE) } & WS_EX_TRANSPARENT.0 as isize, 0,
                "overlay must pass native mouse input through");
            assert_eq!(unsafe { GetForegroundWindow() }, foreground, "overlay must not take focus");
            izuki_lib::follow::spawn(app.handle().clone());
            println!("NATIVE: real overlay click-through and no-focus assertions passed");
            Ok(())
        })
        .build(context).expect("build isolated test host");
    // Owner's application has a different process and no shared profile/state.
    app.run(|app, event| {
        if matches!(event, tauri::RunEvent::WindowEvent { ref label, event: tauri::WindowEvent::CloseRequested { .. }, .. } if label == "overlay") {
            app.exit(0);
        }
    });
}

#[cfg(windows)]
#[tauri::command]
fn probe_finish(app: tauri::AppHandle) { app.exit(0); }

#[cfg(windows)]
#[tauri::command]
async fn probe_switch_window(app: tauri::AppHandle) -> Result<bool, String> {
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, SetForegroundWindow};
    let previous = unsafe { GetForegroundWindow() };
    let w = tauri::WebviewWindowBuilder::new(&app, "hand-switch-probe",
        tauri::WebviewUrl::External("about:blank".parse().unwrap()))
        .title("Izuki disposable window-switch check")
        .inner_size(120.0, 80.0).position(770.0, 32.0).focused(false).visible(false)
        .build().map_err(|e| e.to_string())?;
    w.show().map_err(|e| e.to_string())?;
    w.set_focus().map_err(|e| e.to_string())?;
    std::thread::sleep(std::time::Duration::from_millis(250));
    let changed = unsafe { GetForegroundWindow() } != previous;
    // Restore the original foreground, without sending it any input.
    let _ = unsafe { SetForegroundWindow(previous) };
    w.close().map_err(|e| e.to_string())?;
    Ok(changed)
}

#[cfg(not(windows))]
fn main() { panic!("hand_overlay_probe requires a real Windows desktop"); }
