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
pub(crate) fn wait<T>(op: windows_future::IAsyncOperation<T>) -> windows_core::Result<T>
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
    match recognize(frame)? {
        Some((result, _)) => Ok(result.Text()?.to_string_lossy().trim().to_string()),
        None => Ok(String::new()),
    }
}

/// One word seen on the screen, and exactly where — in real desktop pixels.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Word {
    pub text: String,
    pub rect: crate::model::Rect,
    /// Which line of text it's on (words of one phrase share a line).
    pub line: usize,
}

/// Every word in `frame`, with its exact position on the desktop. This is how
/// Izuki marks text precisely: instead of a model guessing pixels on a
/// shrunken screenshot, the words are found where they really are — in a
/// browser, a PDF, a video's slide, at any screen size and scaling.
#[cfg(windows)]
pub fn read_words(frame: &Frame) -> Result<Vec<Word>> {
    let Some((result, factor)) = recognize(frame)? else { return Ok(Vec::new()) };
    let mut out = Vec::new();
    for (line_no, line) in result.Lines()?.into_iter().enumerate() {
        for word in line.Words()? {
            let r = word.BoundingRect()?;
            let f = factor as f32;
            out.push(Word {
                text: word.Text()?.to_string_lossy(),
                rect: crate::model::Rect {
                    x: frame.origin.0 + (r.X / f).round() as i32,
                    y: frame.origin.1 + (r.Y / f).round() as i32,
                    w: (r.Width / f).round().max(1.0) as i32,
                    h: (r.Height / f).round().max(1.0) as i32,
                },
                line: line_no,
            });
        }
    }
    Ok(out)
}

#[cfg(not(windows))]
pub fn read_words(_frame: &Frame) -> Result<Vec<Word>> {
    Ok(Vec::new())
}

/// Run the OCR engine on a frame. `None` for an empty frame; otherwise the
/// result and how much the image was enlarged first (positions divide by it).
#[cfg(windows)]
fn recognize(frame: &Frame) -> Result<Option<(windows::Media::Ocr::OcrResult, u32)>> {
    use windows::Graphics::Imaging::BitmapDecoder;
    use windows::Media::Ocr::OcrEngine;
    use windows::Storage::Streams::{DataWriter, InMemoryRandomAccessStream};
    use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};

    if frame.width == 0 || frame.height == 0 {
        return Ok(None);
    }

    // The engine wants a reasonably sized image; tiny crops are upscaled so a
    // single word in a small button is still legible to it.
    let factor = if frame.width < 64 || frame.height < 40 { 3 } else { 1 };
    let working = if factor > 1 { upscale(frame, factor) } else { frame.clone() };

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
    Ok(Some((result, factor)))
}

/// Where the words `phrase` are on screen: the run of consecutive words on
/// one line that matches best (spelling slips forgiven), nearest to `near`
/// when it appears more than once. The box round all of them.
pub fn find_phrase(words: &[Word], phrase: &str, near: Option<(i32, i32)>) -> Option<crate::model::Rect> {
    let tidy = |s: &str| s.chars().filter(|c| c.is_alphanumeric()).collect::<String>().to_lowercase();
    let want: Vec<String> = phrase.split_whitespace().map(tidy).filter(|w| !w.is_empty()).collect();
    if want.is_empty() || want.len() > 16 {
        return None;
    }
    let close = |a: &str, b: &str| a == b || (a.len() >= 4 && b.len() >= 4 && edits(a, b) <= 1) || (b.len() >= 3 && a.starts_with(b) && a.len() <= b.len() + 2);
    let mut best: Option<(crate::model::Rect, i64)> = None;
    for start in 0..words.len() {
        if start + want.len() > words.len() {
            break;
        }
        let run = &words[start..start + want.len()];
        if run.iter().any(|w| w.line != run[0].line) {
            continue;
        }
        if !run.iter().zip(&want).all(|(w, t)| close(&tidy(&w.text), t)) {
            continue;
        }
        let x = run.iter().map(|w| w.rect.x).min().unwrap_or(0);
        let y = run.iter().map(|w| w.rect.y).min().unwrap_or(0);
        let right = run.iter().map(|w| w.rect.x + w.rect.w).max().unwrap_or(0);
        let bottom = run.iter().map(|w| w.rect.y + w.rect.h).max().unwrap_or(0);
        let rect = crate::model::Rect { x, y, w: right - x, h: bottom - y };
        let (cx, cy) = rect.center();
        let distance = near.map_or(0, |(nx, ny)| ((cx - nx) as i64).pow(2) + ((cy - ny) as i64).pow(2));
        if best.as_ref().map_or(true, |(_, d)| distance < *d) {
            best = Some((rect, distance));
        }
    }
    best.map(|(r, _)| r)
}

/// How many single-letter changes turn `a` into `b`.
fn edits(a: &str, b: &str) -> usize {
    let (a, b): (Vec<char>, Vec<char>) = (a.chars().collect(), b.chars().collect());
    let mut row: Vec<usize> = (0..=b.len()).collect();
    for i in 1..=a.len() {
        let mut prev = row[0];
        row[0] = i;
        for j in 1..=b.len() {
            let cur = row[j];
            row[j] = (row[j] + 1).min(row[j - 1] + 1).min(prev + usize::from(a[i - 1] != b[j - 1]));
            prev = cur;
        }
    }
    row[b.len()]
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Rect;

    fn word(text: &str, x: i32, y: i32, line: usize) -> Word {
        Word { text: text.into(), rect: Rect { x, y, w: 10 * text.len() as i32, h: 20 }, line }
    }

    #[test]
    fn finds_the_words_and_boxes_all_of_them() {
        let words = vec![word("Find", 100, 50, 0), word("the", 150, 50, 0), word("total", 190, 50, 0), word("cost", 245, 50, 0)];
        let r = find_phrase(&words, "total cost", None).expect("on screen");
        assert_eq!(r, Rect { x: 190, y: 50, w: 95, h: 20 });
    }

    #[test]
    fn forgives_ocr_slips_and_punctuation() {
        let words = vec![word("Speed", 10, 10, 0), word("of", 70, 10, 0), word("the", 95, 10, 0), word("tra1n,", 130, 10, 0)];
        assert!(find_phrase(&words, "speed of the train", None).is_some(), "one wrong letter and a comma");
        assert!(find_phrase(&words, "speed of a plane", None).is_none(), "different words aren't a match");
    }

    #[test]
    fn picks_the_copy_nearest_where_the_model_looked() {
        let words = vec![word("total", 100, 100, 0), word("total", 100, 600, 3)];
        let r = find_phrase(&words, "total", Some((110, 590))).expect("on screen");
        assert_eq!(r.y, 600);
    }

    #[test]
    fn a_phrase_never_spans_two_lines() {
        let words = vec![word("total", 100, 100, 0), word("cost", 100, 130, 1)];
        assert!(find_phrase(&words, "total cost", None).is_none());
    }

    /// The real engine on a real screenshot: words come back where they are,
    /// in real pixels — at 100 % and at 150 % display scaling alike.
    /// IZUKI_OCR_PNG=<screenshot> IZUKI_OCR_AT=<x,y of "total cost"> cargo test --lib ocr_on_a_real_screenshot -- --ignored
    #[test]
    #[ignore]
    fn ocr_on_a_real_screenshot() {
        let path = std::env::var("IZUKI_OCR_PNG").expect("IZUKI_OCR_PNG");
        let at: Vec<i32> = std::env::var("IZUKI_OCR_AT").expect("IZUKI_OCR_AT").split(',').map(|v| v.trim().parse().unwrap()).collect();
        let img = image::open(&path).expect("png").to_rgba8();
        let (w, h) = img.dimensions();
        let mut bgra = img.into_raw();
        for px in bgra.chunks_exact_mut(4) {
            px.swap(0, 2);
        }
        let frame = Frame { width: w, height: h, origin: (0, 0), bgra };
        let words = read_words(&frame).expect("ocr");
        let r = find_phrase(&words, "total cost", None).expect("\"total cost\" found");
        println!("found \"total cost\" at {},{} {}x{} in a {w}x{h} screenshot", r.x, r.y, r.w, r.h);
        assert!((r.x - at[0]).abs() <= 12 && (r.y - at[1]).abs() <= 14, "expected near {},{}", at[0], at[1]);
    }
}
