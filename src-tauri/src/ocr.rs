//! Local OCR.
//!
//! Windows already ships a first-class OCR engine (`Windows.Media.Ocr`), so
//! Izuki uses that instead of bundling Tesseract: no native build step, no
//! 30 MB of language data, no network, and it is noticeably faster on screen
//! text. Results feed the model as context and drive `text_appears` watchers.

use anyhow::{anyhow, Result};

use crate::capture::Frame;

/// Block the current thread until a WinRT async operation finishes, then
/// return its result.
///
/// `windows-future` gives async ops a `Future` impl for use inside an async
/// runtime, but OCR runs on a plain worker thread with no runtime attached, so
/// we just poll `Status()` — the syscall behind it is cheap and the whole
/// operation finishes in single-digit milliseconds.
#[cfg(windows)]
fn wait<T>(op: windows_future::IAsyncOperation<T>) -> windows_core::Result<T>
where
    T: windows_core::RuntimeType + 'static,
{
    use windows_future::AsyncStatus;
    loop {
        match op.Status()? {
            AsyncStatus::Started => std::thread::sleep(std::time::Duration::from_millis(1)),
            _ => return op.GetResults(),
        }
    }
}

/// Read the text inside a captured frame. Returns an empty string when the
/// region holds no recognisable text — that is a normal outcome, not an error.
#[cfg(windows)]
pub fn read_frame(frame: &Frame) -> Result<String> {
    use windows::Graphics::Imaging::BitmapDecoder;
    use windows::Media::Ocr::OcrEngine;
    use windows::Storage::Streams::{DataWriter, InMemoryRandomAccessStream};
    use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};

    if frame.width == 0 || frame.height == 0 {
        return Ok(String::new());
    }

    // The engine wants a reasonably sized image; tiny crops are upscaled so a
    // single word in a small button is still legible to it.
    let working = if frame.width < 64 || frame.height < 40 {
        upscale(frame, 3)
    } else {
        frame.clone()
    };

    unsafe {
        // Worker threads have no apartment yet. RPC_E_CHANGED_MODE just means
        // someone already picked one, which is fine.
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }

    let png = working.to_png()?;

    let stream = InMemoryRandomAccessStream::new()?;
    let writer = DataWriter::CreateDataWriter(&stream)?;
    writer.WriteBytes(&png)?;
    wait(writer.StoreAsync()?)?;
    wait(writer.FlushAsync()?)?;
    // Hand the stream back before reading, or the decoder sees a detached one.
    let _ = writer.DetachStream()?;
    stream.Seek(0)?;

    let decoder = wait(BitmapDecoder::CreateAsync(&stream)?)?;
    let bitmap = wait(decoder.GetSoftwareBitmapAsync()?)?;

    let engine = OcrEngine::TryCreateFromUserProfileLanguages()
        .map_err(|e| anyhow!("no OCR language pack is installed: {e}"))?;

    let result = wait(engine.RecognizeAsync(&bitmap)?)?;
    Ok(result.Text()?.to_string_lossy().trim().to_string())
}

#[cfg(not(windows))]
pub fn read_frame(_frame: &Frame) -> Result<String> {
    Ok(String::new())
}

/// Nearest-neighbour upscale. Screen text is already crisp, so interpolation
/// would only soften the glyph edges the engine keys on.
fn upscale(frame: &Frame, factor: u32) -> Frame {
    let factor = factor.max(1);
    let nw = frame.width * factor;
    let nh = frame.height * factor;
    let mut out = vec![0u8; (nw * nh * 4) as usize];

    for y in 0..nh {
        let sy = y / factor;
        let src_row = (sy * frame.width * 4) as usize;
        for x in 0..nw {
            let sx = x / factor;
            let s = src_row + (sx * 4) as usize;
            let d = ((y * nw + x) * 4) as usize;
            out[d..d + 4].copy_from_slice(&frame.bgra[s..s + 4]);
        }
    }

    Frame {
        width: nw,
        height: nh,
        origin: frame.origin,
        bgra: out,
    }
}

/// Case- and whitespace-insensitive containment, so `text_appears` watchers
/// survive the small differences between OCR runs.
pub fn contains_loose(haystack: &str, needle: &str) -> bool {
    fn norm(s: &str) -> String {
        s.chars()
            .filter(|c| c.is_alphanumeric())
            .flat_map(|c| c.to_lowercase())
            .collect()
    }
    let n = norm(needle);
    !n.is_empty() && norm(haystack).contains(&n)
}
