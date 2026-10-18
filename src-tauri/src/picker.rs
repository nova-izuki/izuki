//! The Windows "Open" box, for picking a file to bring in (a textbook PDF,
//! a bank statement CSV). Runs on its own COM apartment; None: cancelled.

use anyhow::Result;

/// The Windows "Open" box. `pattern` like "*.pdf" or "*.csv;*.txt". None: cancelled.
#[cfg(windows)]
pub fn pick(title: &str, kind: &str, pattern: &str) -> Result<Option<String>> {
    use windows::core::HSTRING;
    use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CoTaskMemFree, CoUninitialize, CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED, COINIT_DISABLE_OLE1DDE};
    use windows::Win32::UI::Shell::Common::COMDLG_FILTERSPEC;
    use windows::Win32::UI::Shell::{FileOpenDialog, IFileOpenDialog, FOS_FILEMUSTEXIST, FOS_FORCEFILESYSTEM, SIGDN_FILESYSPATH};
    unsafe {
        let init = CoInitializeEx(None, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);
        let picked = (|| -> Result<Option<String>> {
            let dlg: IFileOpenDialog = CoCreateInstance(&FileOpenDialog, None, CLSCTX_INPROC_SERVER)?;
            let (name, spec, title) = (HSTRING::from(kind), HSTRING::from(pattern), HSTRING::from(title));
            let specs = [COMDLG_FILTERSPEC { pszName: windows::core::PCWSTR(name.as_ptr()), pszSpec: windows::core::PCWSTR(spec.as_ptr()) }];
            dlg.SetFileTypes(&specs)?;
            dlg.SetTitle(&title)?;
            let opts = dlg.GetOptions()?;
            dlg.SetOptions(opts | FOS_FILEMUSTEXIST | FOS_FORCEFILESYSTEM)?;
            if dlg.Show(None).is_err() {
                return Ok(None); // cancelled
            }
            let item = dlg.GetResult()?;
            let name = item.GetDisplayName(SIGDN_FILESYSPATH)?;
            let path = name.to_string();
            CoTaskMemFree(Some(name.0 as *const _));
            Ok(Some(path?))
        })();
        if init.is_ok() {
            CoUninitialize();
        }
        picked
    }
}

#[cfg(not(windows))]
pub fn pick(_title: &str, _kind: &str, _pattern: &str) -> Result<Option<String>> {
    Ok(None)
}
