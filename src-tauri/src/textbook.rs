//! Textbooks: learn from your own PDFs, with page references. Add a PDF
//! (Notes → Campus → Textbooks) and Izuki reads every page once — its text,
//! or Windows OCR for scanned pages — plus its chapter list. Then "explain
//! chapter 4 of my biology book", "what does page 87 say?", "where does it
//! talk about mitosis?" or "quiz me on section 2.3" are answered from the
//! book itself, citing the pages (p. 87). Everything stays on this PC.
//!
//! Learning, not cheating: it explains and quizzes; it doesn't write graded
//! answers.

use std::path::{Path, PathBuf};

use anyhow::{anyhow, bail, Result};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Chapter {
    pub level: usize,
    pub title: String,
    /// 1-based page.
    pub page: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub path: String,
    pub pages: Vec<String>,
    pub chapters: Vec<Chapter>,
    /// Pages read by OCR (scanned).
    #[serde(default)]
    pub ocr_pages: usize,
    pub added_at: i64,
}

/// What the list shows (no page text).
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Shelf {
    pub id: String,
    pub title: String,
    pub pages: usize,
    pub chapters: Vec<Chapter>,
    /// Still reading: (pages done, pages in all).
    pub reading: Option<(usize, usize)>,
    pub error: Option<String>,
    /// Unix ms (the newest is used when no book is named).
    #[serde(default)]
    pub added_at: i64,
}

fn dir() -> PathBuf {
    crate::store::data_dir().join("textbooks")
}

fn book_path(id: &str) -> PathBuf {
    dir().join(format!("{id}.json"))
}

/// The shelf's view of a book (no page text), kept beside it.
fn meta_path(id: &str) -> PathBuf {
    dir().join(format!("{id}.meta.json"))
}

fn metas() -> Vec<Shelf> {
    let mut out = Vec::new();
    if let Ok(rd) = std::fs::read_dir(dir()) {
        for e in rd.flatten() {
            let name = e.file_name().to_string_lossy().to_string();
            if name.ends_with(".meta.json") {
                if let Some(s) = std::fs::read_to_string(e.path()).ok().and_then(|t| serde_json::from_str::<Shelf>(&t).ok()) {
                    out.push(s);
                }
            }
        }
    }
    out
}

fn load(id: &str) -> Option<Book> {
    std::fs::read_to_string(book_path(id)).ok().and_then(|s| serde_json::from_str(&s).ok())
}

/// Books being read right now: id → (title, done, total, error).
static READING: Mutex<Vec<(String, String, usize, usize, Option<String>)>> = Mutex::new(Vec::new());

pub fn shelf() -> Vec<Shelf> {
    let mut out = metas();
    out.sort_by(|a, b| a.title.to_lowercase().cmp(&b.title.to_lowercase()));
    for (id, title, done, total, error) in READING.lock().iter() {
        if !out.iter().any(|s| &s.id == id) {
            out.insert(0, Shelf { id: id.clone(), title: title.clone(), pages: *total, reading: Some((*done, *total)), error: error.clone(), ..Default::default() });
        }
    }
    out
}

/// Any book on the shelf (cheap: no book is opened).
pub fn has_books() -> bool {
    !READING.lock().is_empty() || std::fs::read_dir(dir()).is_ok_and(|mut rd| rd.any(|e| e.is_ok_and(|e| e.file_name().to_string_lossy().ends_with(".meta.json"))))
}

pub fn remove(id: &str) -> Result<()> {
    READING.lock().retain(|r| r.0 != id);
    for p in [meta_path(id), book_path(id)] {
        if p.exists() {
            std::fs::remove_file(p)?;
        }
    }
    Ok(())
}

/// A nice title from the file name: "Campbell_Biology-12th ed.pdf" → "Campbell Biology 12th ed".
pub fn title_from(path: &Path) -> String {
    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("Textbook");
    stem.replace(['_', '-'], " ").split_whitespace().collect::<Vec<_>>().join(" ")
}

/// Start reading a PDF in the background; returns its id at once.
pub fn add(path: &str) -> Result<String> {
    let p = PathBuf::from(path.trim().trim_matches('"'));
    if !p.is_file() {
        bail!("I can't find that file");
    }
    if !p.extension().and_then(|e| e.to_str()).is_some_and(|e| e.eq_ignore_ascii_case("pdf")) {
        bail!("that isn't a PDF — textbooks need to be PDFs");
    }
    let id = uuid::Uuid::new_v4().to_string();
    let title = title_from(&p);
    READING.lock().push((id.clone(), title.clone(), 0, 0, None));
    let id2 = id.clone();
    std::thread::spawn(move || {
        let result = std::panic::catch_unwind(|| read_book(&id2, &title, &p)).unwrap_or_else(|_| Err(anyhow!("reading the PDF crashed")));
        match result {
            Ok(()) => READING.lock().retain(|r| r.0 != id2),
            Err(e) => {
                eprintln!("[textbook] couldn't read a book: {e}");
                if let Some(r) = READING.lock().iter_mut().find(|r| r.0 == id2) {
                    r.4 = Some(e.to_string());
                }
            }
        }
    });
    Ok(id)
}

fn progress(id: &str, done: usize, total: usize) {
    if let Some(r) = READING.lock().iter_mut().find(|r| r.0 == id) {
        r.2 = done;
        r.3 = total;
    }
}

fn read_book(id: &str, title: &str, path: &Path) -> Result<()> {
    let doc = lopdf::Document::load(path).map_err(|e| anyhow!("couldn't open the PDF ({e})"))?;
    let numbers: Vec<u32> = doc.get_pages().keys().copied().collect();
    let total = numbers.len();
    if total == 0 {
        bail!("the PDF has no pages");
    }
    progress(id, 0, total);
    let mut pages = Vec::with_capacity(total);
    let mut ocr_pages = 0;
    // Opened the first time a scanned page needs it, then reused.
    let mut ocr: Option<Option<Ocr>> = None;
    for (i, n) in numbers.iter().enumerate() {
        if !READING.lock().iter().any(|r| r.0 == id) {
            return Ok(()); // removed while it was being read
        }
        let mut text = doc.extract_text(&[*n]).unwrap_or_default();
        if text.trim().len() < 40 {
            // A scanned page (a picture): Windows reads it.
            let reader = ocr.get_or_insert_with(|| {
                Ocr::open(path).map_err(|e| eprintln!("[textbook] OCR unavailable: {e}")).ok()
            });
            if let Some(Ok(t)) = reader.as_ref().map(|r| r.page(i as u32)) {
                if t.trim().len() > text.trim().len() {
                    text = t;
                    ocr_pages += 1;
                }
            }
        }
        pages.push(tidy(&text));
        if i % 5 == 0 {
            progress(id, i + 1, total);
        }
    }
    let mut chapters: Vec<Chapter> = doc
        .get_toc()
        .map(|t| t.toc.into_iter().map(|c| Chapter { level: c.level, title: c.title.trim().to_string(), page: c.page }).filter(|c| !c.title.is_empty() && c.page >= 1).collect())
        .unwrap_or_default();
    if chapters.is_empty() {
        chapters = chapters_from_text(&pages);
    }
    let book = Book { id: id.to_string(), title: title.to_string(), path: path.to_string_lossy().into(), pages, chapters, ocr_pages, added_at: crate::model::now_ms() };
    // Saved while holding the list, so a remove right now can't be undone by this.
    let reading = READING.lock();
    if !reading.iter().any(|r| r.0 == id) {
        return Ok(());
    }
    std::fs::create_dir_all(dir())?;
    std::fs::write(book_path(id), serde_json::to_string(&book)?)?;
    let meta = Shelf { id: book.id.clone(), title: book.title.clone(), pages: book.pages.len(), chapters: book.chapters.clone(), reading: None, error: None, added_at: book.added_at };
    // Written last: a book is on the shelf only once all of it is saved.
    std::fs::write(meta_path(id), serde_json::to_string(&meta)?)?;
    drop(reading);
    eprintln!("[textbook] read a book: {total} pages, {} chapters, {ocr_pages} by OCR", book.chapters.len());
    Ok(())
}

fn tidy(text: &str) -> String {
    text.lines().map(str::trim).filter(|l| !l.is_empty()).collect::<Vec<_>>().join("\n")
}

/// No outline in the PDF: chapters from pages that open with "Chapter 4 …".
pub fn chapters_from_text(pages: &[String]) -> Vec<Chapter> {
    let mut out = Vec::new();
    for (i, p) in pages.iter().enumerate() {
        for line in p.lines().take(4) {
            let l = line.trim();
            let lower = l.to_lowercase();
            let Some(rest) = lower.strip_prefix("chapter ") else { continue };
            let num: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
            if num.is_empty() || l.len() > 90 {
                continue;
            }
            if !out.iter().any(|c: &Chapter| c.title.to_lowercase().starts_with(&format!("chapter {num}"))) {
                out.push(Chapter { level: 1, title: l.to_string(), page: i + 1 });
            }
            break;
        }
    }
    out
}

/// Windows' PDF renderer and OCR, opened once per book.
#[cfg(windows)]
struct Ocr {
    pdf: windows::Data::Pdf::PdfDocument,
    engine: windows::Media::Ocr::OcrEngine,
}

#[cfg(windows)]
impl Ocr {
    fn open(path: &Path) -> Result<Ocr> {
        use crate::ocr::wait;
        use windows::Data::Pdf::PdfDocument;
        use windows::Media::Ocr::OcrEngine;
        use windows::Storage::StorageFile;
        let full = std::fs::canonicalize(path)?;
        let p = full.to_string_lossy().trim_start_matches(r"\\?\").to_string();
        let file = wait(StorageFile::GetFileFromPathAsync(&windows_core::HSTRING::from(p))?)?;
        let pdf = wait(PdfDocument::LoadFromFileAsync(&file)?)?;
        let engine = OcrEngine::TryCreateFromUserProfileLanguages()?;
        Ok(Ocr { pdf, engine })
    }

    fn page(&self, index: u32) -> Result<String> {
        ocr_page(&self.pdf, &self.engine, index)
    }
}

#[cfg(windows)]
fn ocr_page(pdf: &windows::Data::Pdf::PdfDocument, engine: &windows::Media::Ocr::OcrEngine, index: u32) -> Result<String> {
    use crate::ocr::wait;
    use windows::Graphics::Imaging::BitmapDecoder;
    use windows::Storage::Streams::InMemoryRandomAccessStream;
    let page = pdf.GetPage(index)?;
    let stream = InMemoryRandomAccessStream::new()?;
    let opts = windows::Data::Pdf::PdfPageRenderOptions::new()?;
    // About 150 dpi: sharp enough to read, small enough to be quick.
    let size = page.Size()?;
    opts.SetDestinationWidth((size.Width * 150.0 / 72.0).round().clamp(600.0, 2400.0) as u32)?;
    let action = page.RenderWithOptionsToStreamAsync(&stream, &opts)?;
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(20);
    while action.Status()? == windows_future::AsyncStatus::Started {
        if std::time::Instant::now() > deadline {
            let _ = action.Cancel();
            bail!("the page took too long to draw");
        }
        std::thread::sleep(std::time::Duration::from_millis(2));
    }
    action.GetResults()?;
    let decoder = wait(BitmapDecoder::CreateAsync(&stream)?)?;
    let bitmap = wait(decoder.GetSoftwareBitmapAsync()?)?;
    let result = wait(engine.RecognizeAsync(&bitmap)?)?;
    let mut out = Vec::new();
    for line in result.Lines()? {
        out.push(line.Text()?.to_string_lossy());
    }
    Ok(out.join("\n"))
}

#[cfg(not(windows))]
struct Ocr;

#[cfg(not(windows))]
impl Ocr {
    fn open(_path: &Path) -> Result<Ocr> {
        bail!("OCR is Windows-only")
    }
    fn page(&self, _index: u32) -> Result<String> {
        bail!("OCR is Windows-only")
    }
}

/// The Windows "Open" box, for PDFs. None: cancelled.
#[cfg(windows)]
pub fn pick_pdf() -> Result<Option<String>> {
    use windows::core::w;
    use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CoTaskMemFree, CoUninitialize, CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED, COINIT_DISABLE_OLE1DDE};
    use windows::Win32::UI::Shell::Common::COMDLG_FILTERSPEC;
    use windows::Win32::UI::Shell::{FileOpenDialog, IFileOpenDialog, FOS_FILEMUSTEXIST, FOS_FORCEFILESYSTEM, SIGDN_FILESYSPATH};
    unsafe {
        let init = CoInitializeEx(None, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);
        let picked = (|| -> Result<Option<String>> {
            let dlg: IFileOpenDialog = CoCreateInstance(&FileOpenDialog, None, CLSCTX_INPROC_SERVER)?;
            let specs = [COMDLG_FILTERSPEC { pszName: w!("PDF textbooks"), pszSpec: w!("*.pdf") }];
            dlg.SetFileTypes(&specs)?;
            dlg.SetTitle(w!("Add a textbook (PDF)"))?;
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
pub fn pick_pdf() -> Result<Option<String>> {
    Ok(None)
}

// ---------------------------------------------------------------------------
// Asking
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
pub enum Part {
    Chapter(String),
    Section(String),
    Pages(usize, usize),
    Topic(String),
}

#[derive(Debug, Clone, PartialEq)]
pub struct Ask {
    pub how: How,
    pub part: Part,
    /// Words naming the book ("biology").
    pub book: String,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum How {
    Explain,
    Quiz,
    Summarize,
    Find,
}

fn number_after(s: &str, word: &str) -> Option<String> {
    let at = s.find(word)? + word.len();
    let rest = s[at..].trim_start();
    let n: String = rest.chars().take_while(|c| c.is_ascii_digit() || *c == '.').collect();
    let n = n.trim_end_matches('.').to_string();
    (!n.is_empty()).then_some(n)
}

/// "explain chapter 4 of my biology book", "what does page 87 say", "quiz me
/// on section 2.3", "where does my textbook talk about mitosis". Only when a
/// book is on the shelf.
pub fn parse(said: &str, have_books: bool) -> Option<Ask> {
    if !have_books {
        return None;
    }
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ','], " "));
    let bookish = [" textbook", " my book", " the book", " book ", " pdf", " chapter ", " page ", " pages ", " section "].iter().any(|w| s.contains(w));
    if !bookish {
        return None;
    }
    let how = if s.contains(" quiz ") || s.contains(" test me ") {
        How::Quiz
    } else if s.contains(" summar") || s.contains(" sum up ") || s.contains(" recap ") {
        How::Summarize
    } else if s.contains(" where ") || s.contains(" which page") || s.contains(" find ") {
        How::Find
    } else {
        How::Explain
    };
    let names_book = [" textbook", " book", " pdf"].iter().any(|w| s.contains(w));
    let studying = [" explain", " quiz ", " test me", " summar", " sum up", " recap", " teach me", " what does page", " what's on page", " whats on page", " what is on page", " what's in chapter", " whats in chapter", " what is in chapter", " what's in section", " what is in section", " where "]
        .iter()
        .any(|w| s.contains(w));
    if !names_book && !studying {
        return None;
    }
    let part = if let Some(n) = number_after(&s, " chapter ") {
        Part::Chapter(n)
    } else if let Some(n) = number_after(&s, " section ") {
        Part::Section(n)
    } else if let Some(a) = number_after(&s, " pages ").or_else(|| number_after(&s, " page ")) {
        let a: usize = a.split('.').next()?.parse().ok()?;
        let b = [" to ", "-", " through "]
            .iter()
            .find_map(|w| {
                let at = s.find(&format!("{a}{w}")).map(|i| i + format!("{a}{w}").len())?;
                s[at..].trim_start().chars().take_while(char::is_ascii_digit).collect::<String>().parse::<usize>().ok()
            })
            .unwrap_or(a);
        Part::Pages(a.min(b), a.max(b))
    } else {
        // "where does it talk about mitosis" / "explain photosynthesis from my textbook" —
        // only when the book is named ("explain this page" is about the screen).
        if ![" textbook", " book", " pdf"].iter().any(|w| s.contains(w)) {
            return None;
        }
        let topic = [" about ", " explain ", " on ", " find "].iter().find_map(|w| s.find(w).map(|i| s[i + w.len()..].to_string()))?;
        let cut = [" in my", " from my", " in the", " from the", " textbook", " book", " pdf"].iter().filter_map(|w| topic.find(w)).min().unwrap_or(topic.len());
        let t = topic[..cut].trim().trim_start_matches("the ").to_string();
        if t.len() < 3 {
            return None;
        }
        Part::Topic(t)
    };
    // The book: words just before "book"/"textbook" ("my biology book").
    let book = [" textbook", " book"]
        .iter()
        .find_map(|w| {
            let i = s.find(w)?;
            let before = s[..i].split_whitespace().last()?.to_string();
            (!["my", "the", "this", "a", "your"].contains(&before.as_str())).then_some(before)
        })
        .unwrap_or_default();
    Some(Ask { how, part, book })
}

/// Which book: the one whose title has the named word, else the newest.
fn pick(book: &str) -> Option<Book> {
    let mut all = metas();
    all.sort_by_key(|b| -b.added_at);
    let chosen = (!book.is_empty()).then(|| all.iter().find(|b| b.title.to_lowercase().contains(book))).flatten().or(all.first())?;
    load(&chosen.id)
}

/// The 1-based page range a chapter or section covers.
pub fn range_of(book: &Book, part: &Part) -> Option<(usize, usize)> {
    let n = book.pages.len();
    match part {
        Part::Pages(a, b) => (*a >= 1 && *a <= n).then(|| (*a, (*b).min(n))),
        Part::Chapter(num) | Part::Section(num) => {
            let want = num.as_str();
            let matches = |t: &str| {
                let t = t.to_lowercase();
                let t = t.trim_start_matches("chapter").trim_start_matches("section").trim_start_matches("unit").trim_start();
                t.starts_with(want) && !t[want.len()..].starts_with(|c: char| c.is_ascii_digit())
            };
            let i = book.chapters.iter().position(|c| matches(&c.title))?;
            let start = book.chapters[i].page;
            let level = book.chapters[i].level;
            let end = book.chapters[i + 1..].iter().find(|c| c.level <= level).map(|c| c.page.saturating_sub(1)).unwrap_or(n);
            Some((start, end.max(start).min(n)))
        }
        Part::Topic(_) => None,
    }
}

/// Pages that talk about a topic most, best first.
pub fn find_topic(book: &Book, topic: &str) -> Vec<usize> {
    let words: Vec<String> = topic.to_lowercase().split_whitespace().filter(|w| w.len() > 2).map(String::from).collect();
    if words.is_empty() {
        return Vec::new();
    }
    let mut scored: Vec<(usize, usize)> = book
        .pages
        .iter()
        .enumerate()
        .map(|(i, p)| {
            let p = p.to_lowercase();
            let hits: usize = words.iter().map(|w| p.matches(w.as_str()).count()).sum();
            let all = words.iter().all(|w| p.contains(w.as_str()));
            (i + 1, hits + if all { 10 } else { 0 })
        })
        .filter(|(_, s)| *s > 0)
        .collect();
    scored.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
    scored.into_iter().take(6).map(|(p, _)| p).collect()
}

/// The pages' words, each marked with its page, cut to fit a model.
fn material(book: &Book, pages: &[usize], budget: usize) -> String {
    let per = (budget / pages.len().max(1)).max(600);
    let mut out = String::new();
    for p in pages {
        let text = book.pages.get(p - 1).map(String::as_str).unwrap_or("");
        let cut: String = text.chars().take(per).collect();
        out.push_str(&format!("[p. {p}]\n{cut}\n\n"));
        if out.len() > budget {
            break;
        }
    }
    out
}

/// The answer, and whether it's a real explanation from the book (for the
/// study diary) rather than "I couldn't find that".
pub fn answer(ask: &Ask) -> Result<(String, bool)> {
    let Some(book) = pick(&ask.book) else {
        bail!("No textbook is ready yet — add a PDF in Notes → Campus → Textbooks (or wait for it to finish reading).");
    };
    let (pages, what): (Vec<usize>, String) = match &ask.part {
        Part::Topic(t) => {
            let found = find_topic(&book, t);
            if found.is_empty() {
                return Ok((format!("I couldn't find “{t}” anywhere in {}. Try another word for it?", book.title), false));
            }
            if ask.how == How::Find {
                let lines: Vec<String> = found
                    .iter()
                    .map(|p| {
                        let page = &book.pages[p - 1];
                        let low = page.to_lowercase();
                        let at = t.split_whitespace().find_map(|w| low.find(w)).unwrap_or(0);
                        let start = page.char_indices().map(|(i, _)| i).take_while(|i| *i + 60 <= at).last().unwrap_or(0);
                        let snippet: String = page[start..].chars().take(140).collect::<String>().replace('\n', " ");
                        format!("• p. {p} — “…{}…”", snippet.trim())
                    })
                    .collect();
                return Ok((format!("In {}, “{t}” comes up most on:\n{}", book.title, lines.join("\n")), false));
            }
            (found, format!("what it says about {t}"))
        }
        part => {
            let Some((a, b)) = range_of(&book, part) else {
                let list: Vec<String> = book.chapters.iter().filter(|c| c.level <= 1).take(30).map(|c| format!("• {} (p. {})", c.title, c.page)).collect();
                return Ok((if list.is_empty() {
                    format!("I couldn't tell where that starts in {} — its PDF has no chapter list. Ask by pages instead, like “explain pages 40 to 52”.", book.title)
                } else {
                    format!("I couldn't find that in {}. Its chapters:\n{}", book.title, list.join("\n"))
                }, false));
            };
            let what = match part {
                Part::Chapter(n) => format!("chapter {n} (pages {a}–{b})"),
                Part::Section(n) => format!("section {n} (pages {a}–{b})"),
                _ if a == b => format!("page {a}"),
                _ => format!("pages {a}–{b}"),
            };
            ((a..=b).collect(), what)
        }
    };
    let task = match ask.how {
        How::Quiz => "Quiz the student on it: 5 short questions, mixed (recall, why, apply), each with its page. Put the answers at the very end under \"Answers\" so they can try first.",
        How::Summarize => "Summarize it: the main ideas in order, key terms with one-line definitions, and what to remember.",
        _ => "Teach it like a great tutor: the big idea first in plain words, then the key points in order with examples, key terms defined, and end with 'Remember:' and the 2–3 things that matter most.",
    };
    let messages = [
        json!({ "role": "system", "content": format!("You are Izuki, a patient tutor. You are given pages from the student's textbook, each marked [p. N]. Use ONLY these pages for facts about the book, and cite the page for each point as (p. N). If the pages don't cover something, say so. Help them learn — never write graded work for them. {task}") }),
        json!({ "role": "user", "content": format!("From my textbook “{}”, {what}:\n\n{}", book.title, material(&book, &pages, 14_000)) }),
    ];
    let text = crate::chat::complete(&messages)?;
    crate::studytrack::add("textbook", &book.title, &what, "", None);
    Ok((format!("📚 {} — {what}\n\n{}", book.title, text.trim()), true))
}

pub fn handle(ask: Ask) -> String {
    match answer(&ask) {
        Ok((t, _)) => t,
        Err(e) => e.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn book() -> Book {
        Book {
            pages: (1..=40).map(|i| format!("page {i} text")).chain(["Mitosis is how a cell divides. Mitosis has four phases.".to_string()]).collect(),
            chapters: vec![
                Chapter { level: 1, title: "Chapter 1 Cells".into(), page: 1 },
                Chapter { level: 2, title: "1.1 Parts".into(), page: 3 },
                Chapter { level: 2, title: "1.2 Membranes".into(), page: 9 },
                Chapter { level: 1, title: "Chapter 2 Division".into(), page: 20 },
                Chapter { level: 1, title: "Chapter 12 Genes".into(), page: 35 },
            ],
            ..Default::default()
        }
    }

    #[test]
    fn hears_textbook_asks() {
        let a = parse("explain chapter 4 of my biology book", true).unwrap();
        assert_eq!((a.how, a.part, a.book.as_str()), (How::Explain, Part::Chapter("4".into()), "biology"));
        assert_eq!(parse("what does page 87 say?", true).unwrap().part, Part::Pages(87, 87));
        assert_eq!(parse("explain pages 40 to 52 of the textbook", true).unwrap().part, Part::Pages(40, 52));
        assert_eq!(parse("quiz me on section 2.3", true).unwrap(), Ask { how: How::Quiz, part: Part::Section("2.3".into()), book: String::new() });
        let f = parse("where does my textbook talk about mitosis", true).unwrap();
        assert_eq!((f.how, f.part), (How::Find, Part::Topic("mitosis".into())));
        assert_eq!(parse("explain chapter 4", false), None, "no books, not ours");
        assert_eq!(parse("open chrome", true), None);
        assert_eq!(parse("explain this page", true), None, "the screen, not the book");
        assert_eq!(parse("go to page 2 of the results", true), None, "a screen command");
        assert_eq!(parse("scroll to chapter 3", true), None);
    }

    #[test]
    fn chapters_and_sections_span_to_the_next() {
        let b = book();
        assert_eq!(range_of(&b, &Part::Chapter("1".into())), Some((1, 19)));
        assert_eq!(range_of(&b, &Part::Section("1.1".into())), Some((3, 8)));
        assert_eq!(range_of(&b, &Part::Chapter("2".into())), Some((20, 34)), "not 'chapter 12'");
        assert_eq!(range_of(&b, &Part::Chapter("12".into())), Some((35, 41)));
        assert_eq!(range_of(&b, &Part::Chapter("7".into())), None);
        assert_eq!(range_of(&b, &Part::Pages(5, 500)), Some((5, 41)));
    }

    #[test]
    fn finds_a_topic_and_chapters_in_text() {
        assert_eq!(find_topic(&book(), "mitosis").first(), Some(&41));
        let pages = vec!["CHAPTER 3 Energy\nintro".to_string(), "more".into(), "Chapter 4: Light\n...".into()];
        let ch = chapters_from_text(&pages);
        assert_eq!(ch.iter().map(|c| c.page).collect::<Vec<_>>(), vec![1, 3]);
        assert_eq!(title_from(Path::new(r"C:\x\Campbell_Biology-12th ed.pdf")), "Campbell Biology 12th ed");
    }
}
