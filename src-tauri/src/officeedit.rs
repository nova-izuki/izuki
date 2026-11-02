//! Editing Word, PowerPoint and Excel files without breaking them.
//!
//! The chat's [WRITE:] saved plain text into whatever path it was given, so
//! "fix the grammar in report.docx" wrote words into a .docx that Word then
//! couldn't open. Office files are zipped XML: here an edit changes only the
//! words, inside the file's own structure, and always in a copy next to the
//! original ("report (Izuki edit).docx"). The original is never touched.
//!
//! What an edit can be: replace a phrase (in every paragraph it's in), add a
//! paragraph after one (it takes that paragraph's look), or set an Excel cell
//! (a number, text, or a formula starting with "="). A changed paragraph
//! keeps its style and its first run's formatting; bold or colour on part of
//! it can be lost, and the report says which paragraphs changed. Plain text
//! files (txt, md, csv, json, code) take the same Replace and Add edits.

use std::io::{Read, Write};
use std::path::{Path, PathBuf};

use anyhow::{anyhow, bail, Result};

#[derive(Debug, Clone, PartialEq)]
pub enum Edit {
    /// Every paragraph containing `find` gets it replaced with `with`.
    Replace { find: String, with: String },
    /// A new paragraph after the one containing `after` (the end when None).
    Add { after: Option<String>, text: String },
    /// Excel: "B3" (first sheet) or "Sheet2!B3" set to a number, text or "=formula".
    Cell { cell: String, value: String },
}

/// What the chat wrote under [EDIT: path], one edit per block:
///   REPLACE: old words / WITH: new words
///   ADD AFTER: words in the paragraph before / TEXT: the new paragraph
///   ADD: a paragraph at the end
///   CELL B3: 42   ·   CELL Sheet2!C1: =SUM(A1:A3)
pub fn parse_edits(body: &str) -> Vec<Edit> {
    let mut out = Vec::new();
    let mut pending_find: Option<String> = None;
    let mut pending_after: Option<String> = None;
    let field = |line: &str, key: &str| -> Option<String> {
        let head = line.get(..key.len())?;
        head.eq_ignore_ascii_case(key).then(|| line[key.len()..].trim().to_string())
    };
    for line in body.lines().map(str::trim).filter(|l| !l.is_empty()) {
        if let Some(v) = field(line, "REPLACE:") {
            pending_find = Some(v);
        } else if let Some(v) = field(line, "WITH:") {
            if let Some(find) = pending_find.take().filter(|f| !f.is_empty()) {
                out.push(Edit::Replace { find, with: v });
            }
        } else if let Some(v) = field(line, "ADD AFTER:") {
            pending_after = Some(v);
        } else if let Some(v) = field(line, "TEXT:") {
            if !v.is_empty() {
                out.push(Edit::Add { after: pending_after.take().filter(|a| !a.is_empty()), text: v });
            }
        } else if let Some(v) = field(line, "ADD:") {
            if !v.is_empty() {
                out.push(Edit::Add { after: None, text: v });
            }
        } else if let Some(rest) = field(line, "CELL ") {
            if let Some((cell, value)) = rest.split_once(':') {
                let cell = cell.trim().to_string();
                if !cell.is_empty() {
                    out.push(Edit::Cell { cell, value: value.trim().to_string() });
                }
            }
        }
    }
    out
}

/// Office edits are made in a copy: "<name> (Izuki edit).<ext>", or
/// "(Izuki edit 2)" and on when that's taken.
pub fn copy_path(original: &Path) -> PathBuf {
    let stem = original.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "file".into());
    let ext = original.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();
    let mut n = 1;
    loop {
        let name = if n == 1 { format!("{stem} (Izuki edit){ext}") } else { format!("{stem} (Izuki edit {n}){ext}") };
        let p = original.with_file_name(name);
        if !p.exists() {
            return p;
        }
        n += 1;
    }
}

pub fn is_office(path: &Path) -> bool {
    matches!(ext_of(path).as_str(), "docx" | "pptx" | "xlsx")
}

/// An Office file is really one and is whole: the zip opens, the
/// content-types list is there, and the document/workbook/presentation
/// part exists and starts like XML. This catches a file whose bytes were
/// cut short by a crash — a half-save never passes.
pub fn validate(ext: &str, bytes: &[u8]) -> Result<()> {
    let main = main_part(ext).ok_or_else(|| anyhow!("the integrity check doesn't know .{ext}"))?;
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(bytes))
        .map_err(|_| anyhow!("the {ext} couldn't be opened (it may have been cut short)"))?;
    let mut types = false;
    let mut body = false;
    for i in 0..zip.len() {
        let mut f = zip.by_index(i)?;
        match f.name() {
            "[Content_Types].xml" => types = true,
            n if n == main => {
                // (A byte-order mark or spaces may come first: .NET's
                // XmlWriter writes "\u{feff}<?xml …".)
                let mut head = [0u8; 64];
                let n = f.read(&mut head).unwrap_or(0);
                let head = head[..n].strip_prefix(b"\xEF\xBB\xBF").unwrap_or(&head[..n]);
                if head.iter().find(|b| !b.is_ascii_whitespace()).is_some_and(|b| *b != b'<') {
                    // The part is there but isn't XML text: damaged inside.
                    anyhow::bail!("the {ext}'s document part isn't readable");
                }
                body = true;
            }
            _ => {}
        }
    }
    if !types && !body {
        bail!("the {ext} is missing its content-type list and its document part");
    }
    if !types {
        bail!("the {ext} is missing its content-type list");
    }
    if !body {
        bail!("the {ext} is missing its document part");
    }
    Ok(())
}

/// Stronger, for files Izuki generated from scratch: the content-type list
/// must declare the right kind of document, and the package's relationship
/// list must point at that document. A real Office app opening a fake is
/// what this refuses to let happen.
pub fn validate_new(ext: &str, bytes: &[u8]) -> Result<()> {
    validate(ext, bytes)?;
    let main = main_part(ext).unwrap_or_default();
    // "wordprocessingml.document.main+xml" / "…spreadsheetml.sheet.main+xml" /
    // "…presentationml.presentation.main+xml".
    let kind = match ext {
        "docx" => "wordprocessingml.document.main+xml",
        "xlsx" => "spreadsheetml.sheet.main+xml",
        "pptx" => "presentationml.presentation.main+xml",
        _ => bail!("not an Office file"),
    };
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(bytes))?;
    let types = part_text(&mut zip, "[Content_Types].xml").ok_or_else(|| anyhow!("the new {ext} has no content-type list"))?;
    if !types.contains(kind) {
        bail!("the new {ext} doesn't declare itself as {kind}");
    }
    let rels = part_text(&mut zip, "_rels/.rels").ok_or_else(|| anyhow!("the new {ext} has no relationship list"))?;
    if !rels.contains("/officeDocument") || !rels.contains(main) {
        bail!("the new {ext}'s relationship list doesn't point at {main}");
    }
    Ok(())
}

fn main_part(ext: &str) -> Option<&'static str> {
    match ext {
        "docx" => Some("word/document.xml"),
        "xlsx" => Some("xl/workbook.xml"),
        "pptx" => Some("ppt/presentation.xml"),
        _ => None,
    }
}

/// A named zip part as text (small parts only: these are lists).
fn part_text<R: std::io::Read + std::io::Seek>(zip: &mut zip::ZipArchive<R>, name: &str) -> Option<String> {
    let mut f = zip.by_name(name).ok()?;
    if f.size() > 1024 * 1024 {
        return None;
    }
    let mut s = String::new();
    f.read_to_string(&mut s).ok()?;
    Some(s)
}

fn ext_of(path: &Path) -> String {
    path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default()
}

/// Apply the edits into a copy. (the copy, what changed — one line each,
/// including what couldn't be found, said plainly).
pub fn apply(original: &Path, edits: &[Edit]) -> Result<(PathBuf, Vec<String>)> {
    if edits.is_empty() {
        bail!("no edits to make (use REPLACE/WITH, ADD AFTER/TEXT, ADD or CELL lines)");
    }
    let ext = ext_of(original);
    let bytes = std::fs::read(original).map_err(|e| anyhow!("can't open {}: {e}", original.display()))?;
    let (out, report) = match ext.as_str() {
        "docx" | "pptx" | "xlsx" => edit_office(&bytes, &ext, edits)?,
        "pdf" | "doc" | "xls" | "ppt" | "odt" | "rtf" => bail!("{} files can't be edited here; save it as .docx/.xlsx/.pptx first", ext),
        _ => {
            if bytes.iter().take(4000).filter(|b| **b == 0).count() > 4 {
                bail!("{} isn't a text file", original.display());
            }
            let text = String::from_utf8_lossy(&bytes).into_owned();
            let (t, r) = edit_text(&text, edits)?;
            (t.into_bytes(), r)
        }
    };
    if !report.iter().any(|l| !l.starts_with("Couldn't")) {
        bail!("nothing was changed: {}", report.join("; "));
    }
    // The finished copy is checked whole before it's written, and the
    // write itself is atomic: a crash or a full disk leaves no damaged
    // "(Izuki edit)" file behind — the original is untouched regardless.
    if ext == "docx" || ext == "xlsx" || ext == "pptx" {
        validate(&ext, &out)?;
    }
    let copy = copy_path(original);
    crate::files::atomic_save(&copy, move || Ok(out))?;
    Ok((copy, report))
}

// ---- plain text ----------------------------------------------------------------

fn edit_text(text: &str, edits: &[Edit]) -> Result<(String, Vec<String>)> {
    let mut out = text.to_string();
    let mut report = Vec::new();
    for e in edits {
        match e {
            Edit::Replace { find, with } => {
                let n = out.matches(find.as_str()).count();
                if n == 0 {
                    report.push(format!("Couldn't find “{}”", clip(find)));
                } else {
                    out = out.replace(find.as_str(), with);
                    report.push(format!("Replaced “{}” ({n}×)", clip(find)));
                }
            }
            Edit::Add { after, text: add } => match after {
                Some(a) => match out.find(a.as_str()) {
                    Some(at) => {
                        let line_end = out[at..].find('\n').map(|i| at + i + 1).unwrap_or(out.len());
                        let sep = if line_end == out.len() && !out.ends_with('\n') { "\n" } else { "" };
                        out.insert_str(line_end, &format!("{sep}{add}\n"));
                        report.push(format!("Added a line after “{}”", clip(a)));
                    }
                    None => report.push(format!("Couldn't find “{}” to add after", clip(a))),
                },
                None => {
                    if !out.is_empty() && !out.ends_with('\n') {
                        out.push('\n');
                    }
                    out.push_str(add);
                    out.push('\n');
                    report.push("Added a line at the end".into());
                }
            },
            Edit::Cell { cell, .. } => report.push(format!("Couldn't set {cell}: only Excel files have cells")),
        }
    }
    Ok((out, report))
}

// ---- the zip --------------------------------------------------------------------

fn edit_office(bytes: &[u8], ext: &str, edits: &[Edit]) -> Result<(Vec<u8>, Vec<String>)> {
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(bytes)).map_err(|_| anyhow!("this {ext} file couldn't be opened (it may be damaged or not really {ext})"))?;
    let mut parts: Vec<(String, Vec<u8>, bool)> = Vec::new();
    for i in 0..zip.len() {
        let mut f = zip.by_index(i)?;
        let name = f.name().to_string();
        let dir = f.is_dir();
        let mut data = Vec::new();
        if !dir {
            if f.size() > 50 * 1024 * 1024 {
                bail!("a part of this file is too large to edit safely");
            }
            f.read_to_end(&mut data)?;
        }
        parts.push((name, data, dir));
    }
    let report: Vec<String>;
    match ext {
        "docx" => {
            let i = parts.iter().position(|(n, _, _)| n == "word/document.xml").ok_or_else(|| anyhow!("no document inside this .docx"))?;
            let xml = String::from_utf8_lossy(&parts[i].1).into_owned();
            let (new, r) = edit_paragraphs(&xml, Ooxml::WORD, edits, true)?;
            parts[i].1 = new.into_bytes();
            report = r;
        }
        "pptx" => {
            let mut slides: Vec<usize> = parts
                .iter()
                .enumerate()
                .filter(|(_, (n, _, _))| n.strip_prefix("ppt/slides/slide").and_then(|r| r.strip_suffix(".xml")).is_some_and(|r| !r.is_empty() && r.chars().all(|c| c.is_ascii_digit())))
                .map(|(i, _)| i)
                .collect();
            slides.sort_by_key(|i| {
                let n = &parts[*i].0;
                n["ppt/slides/slide".len()..n.len() - 4].parse::<u32>().unwrap_or(0)
            });
            if slides.is_empty() {
                bail!("no slides inside this .pptx");
            }
            // Each edit applies to whichever slides contain it; "add at the end"
            // needs a paragraph to follow.
            let mut done = vec![false; edits.len()];
            let mut lines = Vec::new();
            for (slide_no, i) in slides.iter().enumerate() {
                let xml = String::from_utf8_lossy(&parts[*i].1).into_owned();
                let (new, r) = edit_paragraphs(&xml, Ooxml::SLIDE, edits, false)?;
                for (k, line) in r.iter().enumerate() {
                    if !line.starts_with("Couldn't") {
                        done[k] = true;
                        lines.push(format!("Slide {}: {line}", slide_no + 1));
                    }
                }
                parts[*i].1 = new.into_bytes();
            }
            for (k, e) in edits.iter().enumerate() {
                if !done[k] {
                    lines.push(match e {
                        Edit::Replace { find, .. } => format!("Couldn't find “{}” on any slide", clip(find)),
                        Edit::Add { after: Some(a), .. } => format!("Couldn't find “{}” to add after", clip(a)),
                        Edit::Add { after: None, .. } => "Couldn't add: say which text it goes after (ADD AFTER:)".into(),
                        Edit::Cell { cell, .. } => format!("Couldn't set {cell}: only Excel files have cells"),
                    });
                }
            }
            report = lines;
        }
        _ => {
            report = edit_cells(&mut parts, edits)?;
        }
    }
    // The same parts, same order, compressed again.
    let mut out = std::io::Cursor::new(Vec::new());
    {
        let mut w = zip::ZipWriter::new(&mut out);
        let opts = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        for (name, data, dir) in &parts {
            if *dir {
                w.add_directory(name.as_str(), opts)?;
            } else {
                w.start_file(name.as_str(), opts)?;
                w.write_all(data)?;
            }
        }
        w.finish()?;
    }
    Ok((out.into_inner(), report))
}

// ---- paragraphs (Word and PowerPoint) ---------------------------------------------

/// The tag names that differ between Word and PowerPoint.
#[derive(Clone, Copy)]
struct Ooxml {
    /// "w:p" / "a:p"
    p: &'static str,
    /// "w:t" / "a:t"
    t: &'static str,
    /// "w:r" / "a:r"
    r: &'static str,
}

impl Ooxml {
    const WORD: Ooxml = Ooxml { p: "w:p", t: "w:t", r: "w:r" };
    const SLIDE: Ooxml = Ooxml { p: "a:p", t: "a:t", r: "a:r" };
}

/// Where tag `name` starts at `i` exactly (not a longer name: "<w:p" vs "<w:pPr").
fn tag_at(xml: &str, i: usize, name: &str) -> bool {
    let open = format!("<{name}");
    xml[i..].starts_with(&open) && matches!(xml.as_bytes().get(i + open.len()), Some(b'>' | b' ' | b'/'))
}

/// Every paragraph with no paragraph inside it (a text box's paragraphs sit
/// inside another's): (start, end) byte ranges.
fn leaf_paragraphs(xml: &str, k: Ooxml) -> Vec<(usize, usize)> {
    let close = format!("</{}>", k.p);
    let mut out = Vec::new();
    let mut stack: Vec<(usize, bool)> = Vec::new();
    let mut i = 0;
    while let Some(off) = xml[i..].find('<') {
        let at = i + off;
        if tag_at(xml, at, k.p) {
            let end_of_tag = xml[at..].find('>').map(|e| at + e).unwrap_or(xml.len() - 1);
            if xml.as_bytes()[end_of_tag.saturating_sub(1)] == b'/' {
                i = end_of_tag + 1; // <w:p/>: empty, nothing to edit
                continue;
            }
            if let Some(parent) = stack.last_mut() {
                parent.1 = true;
            }
            stack.push((at, false));
            i = end_of_tag + 1;
        } else if xml[at..].starts_with(&close) {
            if let Some((start, has_child)) = stack.pop() {
                if !has_child {
                    out.push((start, at + close.len()));
                }
            }
            i = at + close.len();
        } else {
            i = at + 1;
        }
    }
    out
}

/// The text elements in a paragraph: (content start, content end) of each
/// <w:t>…</w:t>, in order.
fn texts(par: &str, k: Ooxml) -> Vec<(usize, usize)> {
    let close = format!("</{}>", k.t);
    let mut out = Vec::new();
    let mut i = 0;
    while let Some(off) = par[i..].find('<') {
        let at = i + off;
        if tag_at(par, at, k.t) {
            let gt = match par[at..].find('>') {
                Some(g) => at + g,
                None => break,
            };
            if par.as_bytes()[gt - 1] == b'/' {
                i = gt + 1;
                continue;
            }
            match par[gt + 1..].find(&close) {
                Some(c) => {
                    out.push((gt + 1, gt + 1 + c));
                    i = gt + 1 + c + close.len();
                }
                None => break,
            }
        } else {
            i = at + 1;
        }
    }
    out
}

fn paragraph_text(par: &str, k: Ooxml) -> String {
    texts(par, k).iter().map(|(a, b)| unescape(&par[*a..*b])).collect()
}

/// The paragraph with its words set to `new`: all of it in the first text
/// element (keeping that run's formatting), the others emptied. A paragraph
/// with no text element gets a plain run.
fn rewrite(par: &str, k: Ooxml, new: &str, word: bool) -> String {
    let spans = texts(par, k);
    if spans.is_empty() {
        let close = format!("</{}>", k.p);
        let run = format!("<{r}><{t}{sp}>{}</{t}></{r}>", escape(new), r = k.r, t = k.t, sp = if word { " xml:space=\"preserve\"" } else { "" });
        // A slide paragraph's end-of-paragraph properties stay last.
        let at = par.rfind("<a:endParaRPr").filter(|_| !word).unwrap_or_else(|| par.len() - close.len());
        return format!("{}{run}{}", &par[..at], &par[at..]);
    }
    let mut out = String::with_capacity(par.len() + new.len());
    let mut last = 0;
    for (n, (a, b)) in spans.iter().enumerate() {
        let mut head = par[last..*a].to_string();
        if n == 0 && word && !head.contains("xml:space") {
            // Spaces at the ends are kept only when Word is told to.
            if let Some(gt) = head.rfind('>') {
                head.insert_str(gt, " xml:space=\"preserve\"");
            }
        }
        out.push_str(&head);
        if n == 0 {
            out.push_str(&escape(new));
        }
        last = *b;
    }
    out.push_str(&par[last..]);
    out
}

/// Where the next `<name` tag (exactly that name) starts, from `from`.
fn next_tag(xml: &str, from: usize, name: &str) -> Option<usize> {
    let open = format!("<{name}");
    let mut at = from;
    while let Some(i) = xml[at..].find(&open).map(|i| i + at) {
        if tag_at(xml, i, name) {
            return Some(i);
        }
        at = i + open.len();
    }
    None
}

/// The first `<name …>…</name>` or `<name …/>` element in `xml`, nesting
/// counted: a tracked change holds a whole `w:pPr` inside the `w:pPr` it
/// changes, and stopping at the first `</w:pPr>` cut the element in half.
fn element<'a>(xml: &'a str, name: &str) -> Option<&'a str> {
    let close = format!("</{name}>");
    let i = next_tag(xml, 0, name)?;
    let gt = i + xml[i..].find('>')?;
    if xml.as_bytes()[gt - 1] == b'/' {
        return Some(&xml[i..=gt]);
    }
    let (mut depth, mut at) = (1, gt + 1);
    while depth > 0 {
        let shut = at + xml[at..].find(&close)?;
        match next_tag(xml, at, name).filter(|o| *o < shut) {
            Some(o) => {
                let g = o + xml[o..].find('>')?;
                if xml.as_bytes()[g - 1] != b'/' {
                    depth += 1;
                }
                at = g + 1;
            }
            None => {
                depth -= 1;
                at = shut + close.len();
            }
        }
    }
    Some(&xml[i..at])
}

/// `xml` without any `name` elements.
fn without(xml: &str, names: &[&str]) -> String {
    let mut out = xml.to_string();
    for name in names {
        while let Some(e) = element(&out, name).map(str::to_string) {
            out = out.replacen(&e, "", 1);
        }
    }
    out
}

/// A new paragraph that looks like `par`, holding only `text`: the paragraph's
/// properties and its first run's formatting. It used to be a copy of `par`
/// with the words swapped, and a copy repeats everything else in it: a
/// picture (two drawings with one id), bookmarks, comment anchors, footnote
/// marks, paragraph ids, tracked changes, and the section break a Word
/// paragraph can carry. Word reports those as unreadable content.
fn fresh_paragraph(par: &str, k: Ooxml, text: &str, word: bool) -> String {
    let (ppr, rpr) = if word { ("w:pPr", "w:rPr") } else { ("a:pPr", "a:rPr") };
    // Revisions (tracked changes) carry ids that must stay unique.
    let drop: &[&str] = if word { &["w:sectPr", "w:pPrChange", "w:rPrChange"] } else { &[] };
    let props = element(par, ppr).map(|e| without(e, drop)).unwrap_or_default();
    let look = element(par, k.r).and_then(|r| element(r, rpr)).map(|e| without(e, drop)).unwrap_or_default();
    let t = if word { format!("<w:t xml:space=\"preserve\">{}</w:t>", escape(text)) } else { format!("<a:t>{}</a:t>", escape(text)) };
    format!("<{p}>{props}<{r}>{look}{t}</{r}></{p}>", p = k.p, r = k.r)
}

fn edit_paragraphs(xml: &str, k: Ooxml, edits: &[Edit], word: bool) -> Result<(String, Vec<String>)> {
    let mut xml = xml.to_string();
    let mut report = Vec::new();
    for e in edits {
        // Ranges move as the text changes: found afresh for each edit.
        let pars = leaf_paragraphs(&xml, k);
        match e {
            Edit::Replace { find, with } => {
                let mut hits = 0;
                // From the end, so earlier ranges stay valid.
                for (s, t) in pars.iter().rev() {
                    let par = &xml[*s..*t];
                    let text = paragraph_text(par, k);
                    if text.contains(find.as_str()) {
                        let new = rewrite(par, k, &text.replace(find.as_str(), with), word);
                        xml.replace_range(*s..*t, &new);
                        hits += 1;
                    }
                }
                report.push(if hits == 0 { format!("Couldn't find “{}”", clip(find)) } else { format!("Replaced “{}” in {hits} paragraph{}", clip(find), if hits == 1 { "" } else { "s" }) });
            }
            Edit::Add { after, text } => {
                let target = match after {
                    Some(a) => pars.iter().find(|(s, t)| paragraph_text(&xml[*s..*t], k).contains(a.as_str())).copied(),
                    // The end of a Word document's body: its last paragraph.
                    None if word => {
                        let body_end = xml.find("<w:sectPr").or_else(|| xml.find("</w:body>")).unwrap_or(xml.len());
                        pars.iter().filter(|(_, t)| *t <= body_end).last().copied()
                    }
                    None => None,
                };
                match target {
                    Some((s, t)) => {
                        let new = fresh_paragraph(&xml[s..t], k, text, word);
                        xml.insert_str(t, &new);
                        report.push(match after {
                            Some(a) => format!("Added a paragraph after “{}”", clip(a)),
                            None => "Added a paragraph at the end".into(),
                        });
                    }
                    None => report.push(match after {
                        Some(a) => format!("Couldn't find “{}” to add after", clip(a)),
                        None => "Couldn't add: say which text it goes after (ADD AFTER:)".into(),
                    }),
                }
            }
            Edit::Cell { cell, .. } => report.push(format!("Couldn't set {cell}: only Excel files have cells")),
        }
    }
    Ok((xml, report))
}

// ---- Excel ------------------------------------------------------------------------

/// "B3" → (column number from 1, row 3).
fn cell_ref(r: &str) -> Option<(u32, u32)> {
    let r = r.trim().to_uppercase().replace('$', "");
    let split = r.find(|c: char| c.is_ascii_digit())?;
    let (col, row) = r.split_at(split);
    if col.is_empty() || col.len() > 3 || !col.chars().all(|c| c.is_ascii_uppercase()) {
        return None;
    }
    let row: u32 = row.parse().ok().filter(|n| *n >= 1 && *n <= 1_048_576)?;
    let col = col.chars().fold(0u32, |n, c| n * 26 + (c as u32 - 'A' as u32 + 1));
    (col <= 16_384).then_some((col, row))
}

/// The value of attribute `name` in the tag that starts at the beginning of `tag`.
fn attr(tag: &str, name: &str) -> Option<String> {
    let end = tag.find('>')?;
    let head = &tag[..end];
    let key = format!(" {name}=\"");
    let at = head.find(&key)? + key.len();
    Some(head[at..at + head[at..].find('"')?].to_string())
}

/// A sheet's part name, by its name ("Sheet2") or the first one.
fn sheet_part(parts: &[(String, Vec<u8>, bool)], sheet: Option<&str>) -> Result<String> {
    let text = |name: &str| parts.iter().find(|(n, _, _)| n == name).map(|(_, d, _)| String::from_utf8_lossy(d).into_owned());
    let book = text("xl/workbook.xml").ok_or_else(|| anyhow!("no workbook inside this .xlsx"))?;
    let rels = text("xl/_rels/workbook.xml.rels").unwrap_or_default();
    let mut sheets = Vec::new();
    let mut i = 0;
    while let Some(off) = book[i..].find("<sheet ") {
        let at = i + off;
        let tag = &book[at..];
        if let (Some(name), Some(rid)) = (attr(tag, "name"), attr(tag, "r:id")) {
            sheets.push((unescape(&name), rid));
        }
        i = at + 7;
    }
    let (_, rid) = match sheet {
        Some(s) => sheets.iter().find(|(n, _)| n.eq_ignore_ascii_case(s)).ok_or_else(|| anyhow!("there's no sheet called “{s}”"))?,
        None => sheets.first().ok_or_else(|| anyhow!("this workbook has no sheets"))?,
    };
    let key = format!("Id=\"{rid}\"");
    let at = rels.find(&key).ok_or_else(|| anyhow!("this workbook's sheet list is damaged"))?;
    let rel_start = rels[..at].rfind('<').unwrap_or(0);
    let target = attr(&rels[rel_start..], "Target").ok_or_else(|| anyhow!("this workbook's sheet list is damaged"))?;
    let target = target.trim_start_matches('/');
    Ok(if target.starts_with("xl/") { target.to_string() } else { format!("xl/{target}") })
}

/// The new <c> for a value: a number, "=formula", or text. Keeps the old style.
fn cell_xml(r: &str, style: Option<&str>, value: &str) -> String {
    let s = style.map(|s| format!(" s=\"{s}\"")).unwrap_or_default();
    let v = value.trim();
    if let Some(f) = v.strip_prefix('=') {
        format!("<c r=\"{r}\"{s}><f>{}</f></c>", escape(f))
    } else if !v.is_empty() && v.parse::<f64>().is_ok_and(f64::is_finite) {
        format!("<c r=\"{r}\"{s}><v>{v}</v></c>")
    } else {
        format!("<c r=\"{r}\"{s} t=\"inlineStr\"><is><t xml:space=\"preserve\">{}</t></is></c>", escape(value))
    }
}

/// Set one cell in a sheet's XML: replaced if it's there, else put in its
/// row in column order (and the row in row order).
fn set_cell(xml: &str, r: &str, value: &str) -> Result<String> {
    let (col, row) = cell_ref(r).ok_or_else(|| anyhow!("“{r}” isn't a cell like B3"))?;
    let r = r.trim().to_uppercase().replace('$', "");
    let mut xml = xml.to_string();
    // The cell itself.
    let key = format!("<c r=\"{r}\"");
    if let Some(at) = xml.find(&key) {
        let gt = at + xml[at..].find('>').ok_or_else(|| anyhow!("damaged cell"))?;
        let end = if xml.as_bytes()[gt - 1] == b'/' { gt + 1 } else { at + xml[at..].find("</c>").ok_or_else(|| anyhow!("damaged cell"))? + 4 };
        let style = attr(&xml[at..], "s");
        xml.replace_range(at..end, &cell_xml(&r, style.as_deref(), value));
        return Ok(xml);
    }
    let new_cell = cell_xml(&r, None, value);
    let row_key = format!("<row r=\"{row}\"");
    if let Some(at) = xml.find(&row_key) {
        let gt = at + xml[at..].find('>').ok_or_else(|| anyhow!("damaged row"))?;
        if xml.as_bytes()[gt - 1] == b'/' {
            // <row r="3" …/>: open it up.
            let open = xml[at..gt - 1].trim_end().to_string();
            xml.replace_range(at..gt + 1, &format!("{open}>{new_cell}</row>"));
            return Ok(xml);
        }
        let row_end = at + xml[at..].find("</row>").ok_or_else(|| anyhow!("damaged row"))?;
        // Before the first cell further right.
        let mut insert = row_end;
        let mut i = gt + 1;
        while let Some(off) = xml[i..row_end].find("<c r=\"") {
            let c_at = i + off;
            let name = attr(&xml[c_at..], "r").unwrap_or_default();
            if cell_ref(&name).is_some_and(|(c, _)| c > col) {
                insert = c_at;
                break;
            }
            i = c_at + 5;
        }
        xml.insert_str(insert, &new_cell);
        return Ok(xml);
    }
    // No such row yet: a new one, in row order.
    let new_row = format!("<row r=\"{row}\">{new_cell}</row>");
    if let Some(at) = xml.find("<sheetData/>") {
        xml.replace_range(at..at + "<sheetData/>".len(), &format!("<sheetData>{new_row}</sheetData>"));
        return Ok(xml);
    }
    let data_end = xml.find("</sheetData>").ok_or_else(|| anyhow!("this sheet has no cell data area"))?;
    let mut insert = data_end;
    let mut i = 0;
    while let Some(off) = xml[i..data_end].find("<row r=\"") {
        let at = i + off;
        if attr(&xml[at..], "r").and_then(|n| n.parse::<u32>().ok()).is_some_and(|n| n > row) {
            insert = at;
            break;
        }
        i = at + 6;
    }
    xml.insert_str(insert, &new_row);
    Ok(xml)
}

fn edit_cells(parts: &mut [(String, Vec<u8>, bool)], edits: &[Edit]) -> Result<Vec<String>> {
    let mut report = Vec::new();
    let mut any = false;
    for e in edits {
        let Edit::Cell { cell, value } = e else {
            report.push("Couldn't do that in a spreadsheet: set cells with CELL B3: value".into());
            continue;
        };
        let (sheet, r) = match cell.rsplit_once('!') {
            Some((s, r)) => (Some(s.trim().trim_matches('\'')), r),
            None => (None, cell.as_str()),
        };
        let part = match sheet_part(parts, sheet) {
            Ok(p) => p,
            Err(err) => {
                report.push(format!("Couldn't set {cell}: {err}"));
                continue;
            }
        };
        let Some(i) = parts.iter().position(|(n, _, _)| *n == part) else {
            report.push(format!("Couldn't set {cell}: its sheet is missing"));
            continue;
        };
        let xml = String::from_utf8_lossy(&parts[i].1).into_owned();
        match set_cell(&xml, r, value) {
            Ok(new) => {
                parts[i].1 = new.into_bytes();
                report.push(format!("Set {cell} to {}", clip(value)));
                any = true;
            }
            Err(err) => report.push(format!("Couldn't set {cell}: {err}")),
        }
    }
    // Formulas that depend on a changed cell are worked out again when it opens.
    if any {
        if let Some(i) = parts.iter().position(|(n, _, _)| n == "xl/workbook.xml") {
            let book = String::from_utf8_lossy(&parts[i].1).into_owned();
            if let Some(at) = book.find("<calcPr") {
                if !book[at..at + book[at..].find('>').unwrap_or(0)].contains("fullCalcOnLoad") {
                    let mut b = book.clone();
                    b.insert_str(at + "<calcPr".len(), " fullCalcOnLoad=\"1\"");
                    parts[i].1 = b.into_bytes();
                }
            }
        }
    }
    Ok(report)
}

/// An Excel file as text the chat can read: each sheet's cells, with their
/// addresses ("B3: 42"), first 200 rows.
pub fn read_xlsx(path: &Path) -> Result<String> {
    let mut zip = zip::ZipArchive::new(std::fs::File::open(path)?).map_err(|_| anyhow!("this .xlsx couldn't be opened"))?;
    let mut read = |name: &str| -> Option<String> {
        let mut s = String::new();
        zip.by_name(name).ok()?.read_to_string(&mut s).ok()?;
        Some(s)
    };
    let book = read("xl/workbook.xml").ok_or_else(|| anyhow!("no workbook inside this .xlsx"))?;
    let rels = read("xl/_rels/workbook.xml.rels").unwrap_or_default();
    let shared: Vec<String> = read("xl/sharedStrings.xml")
        .map(|s| {
            s.split("<si>").skip(1).map(|si| {
                let si = si.split("</si>").next().unwrap_or("");
                si.split("<t").skip(1).filter_map(|t| t.split_once('>').map(|(_, rest)| unescape(rest.split("</t>").next().unwrap_or("")))).collect::<String>()
            }).collect()
        })
        .unwrap_or_default();
    let parts: Vec<(String, Vec<u8>, bool)> = vec![("xl/workbook.xml".into(), book.clone().into_bytes(), false), ("xl/_rels/workbook.xml.rels".into(), rels.into_bytes(), false)];
    let mut out = String::new();
    let mut i = 0;
    let mut names = Vec::new();
    while let Some(off) = book[i..].find("<sheet ") {
        let at = i + off;
        if let Some(name) = attr(&book[at..], "name") {
            names.push(unescape(&name));
        }
        i = at + 7;
    }
    for name in names.iter().take(10) {
        let Ok(part) = sheet_part(&parts, Some(name)) else { continue };
        let Some(xml) = read(&part) else { continue };
        out.push_str(&format!("--- Sheet: {name} ---\n"));
        let mut rows = 0;
        for row in xml.split("<row ").skip(1) {
            rows += 1;
            if rows > 200 {
                out.push_str("…(more rows)\n");
                break;
            }
            let mut cells = Vec::new();
            for c in row.split("<c ").skip(1) {
                let tag = format!("<c {c}");
                let r = attr(&tag, "r").unwrap_or_default();
                let t = attr(&tag, "t").unwrap_or_default();
                let inner = c.split_once('>').map(|(_, rest)| rest.split("</c>").next().unwrap_or("")).unwrap_or("");
                let v = inner.split("<v>").nth(1).and_then(|x| x.split("</v>").next()).unwrap_or("");
                let f = inner.split("<f>").nth(1).and_then(|x| x.split("</f>").next());
                let value = match t.as_str() {
                    "s" => v.parse::<usize>().ok().and_then(|n| shared.get(n).cloned()).unwrap_or_default(),
                    "inlineStr" => inner.split("<t").nth(1).and_then(|x| x.split_once('>')).map(|(_, rest)| unescape(rest.split("</t>").next().unwrap_or(""))).unwrap_or_default(),
                    _ => unescape(v),
                };
                let shown = match f {
                    Some(f) if value.is_empty() => format!("={}", unescape(f)),
                    Some(f) => format!("={} → {value}", unescape(f)),
                    None => value,
                };
                if !shown.is_empty() {
                    cells.push(format!("{r}: {shown}"));
                }
            }
            if !cells.is_empty() {
                out.push_str(&cells.join(" | "));
                out.push('\n');
            }
        }
    }
    Ok(out)
}

// ---- new files ------------------------------------------------------------------------

fn zip_parts(parts: &[(&str, String)]) -> Result<Vec<u8>> {
    let mut out = std::io::Cursor::new(Vec::new());
    {
        let mut w = zip::ZipWriter::new(&mut out);
        let opts = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        for (name, body) in parts {
            w.start_file(*name, opts)?;
            w.write_all(body.as_bytes())?;
        }
        w.finish()?;
    }
    Ok(out.into_inner())
}

const XML_HEAD: &str = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>";

/// A new Word document from plain text: a paragraph per line, "# " and "## "
/// lines as headings (bold, larger), "- " lines as bullets. Text saved as
/// a .docx used to make a file Word couldn't open.
pub fn new_docx(text: &str) -> Result<Vec<u8>> {
    let mut body = String::new();
    for line in text.lines() {
        let (size, bold, words) = if let Some(h) = line.strip_prefix("# ") {
            (Some(32), true, h.to_string())
        } else if let Some(h) = line.strip_prefix("## ") {
            (Some(28), true, h.to_string())
        } else if let Some(b) = line.strip_prefix("- ").or_else(|| line.strip_prefix("* ")) {
            (None, false, format!("• {b}"))
        } else {
            (None, false, line.to_string())
        };
        let props = match (bold, size) {
            (true, Some(s)) => format!("<w:rPr><w:b/><w:sz w:val=\"{s}\"/></w:rPr>"),
            _ => String::new(),
        };
        body.push_str(&format!("<w:p><w:r>{props}<w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>", escape(&words)));
    }
    zip_parts(&[
        ("[Content_Types].xml", format!("{XML_HEAD}<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>")),
        ("_rels/.rels", format!("{XML_HEAD}<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>")),
        ("word/document.xml", format!("{XML_HEAD}<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>{body}<w:sectPr/></w:body></w:document>")),
    ])
}

/// One row of comma- (or tab-) separated values, with "quoted, fields".
fn csv_row(line: &str, delim: char) -> Vec<String> {
    let mut out = Vec::new();
    let mut cur = String::new();
    let mut quoted = false;
    let mut chars = line.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '"' if quoted && chars.peek() == Some(&'"') => {
                cur.push('"');
                chars.next();
            }
            '"' => quoted = !quoted,
            c if c == delim && !quoted => out.push(std::mem::take(&mut cur).trim().to_string()),
            c => cur.push(c),
        }
    }
    out.push(cur.trim().to_string());
    out
}

/// "C" for column 3.
fn column_name(mut n: u32) -> String {
    let mut s = String::new();
    while n > 0 {
        let r = (n - 1) % 26;
        s.insert(0, (b'A' + r as u8) as char);
        n = (n - 1) / 26;
    }
    s
}

/// A new Excel file from comma- or tab-separated rows: numbers stay
/// numbers, "=…" are formulas, everything else text.
pub fn new_xlsx(text: &str) -> Result<Vec<u8>> {
    let delim = if text.contains('\t') { '\t' } else { ',' };
    let mut rows = String::new();
    for (i, line) in text.lines().filter(|l| !l.trim().is_empty()).enumerate().take(100_000) {
        let r = i as u32 + 1;
        let cells: String = csv_row(line, delim)
            .iter()
            .enumerate()
            .filter(|(_, v)| !v.is_empty())
            .map(|(c, v)| cell_xml(&format!("{}{r}", column_name(c as u32 + 1)), None, v))
            .collect();
        rows.push_str(&format!("<row r=\"{r}\">{cells}</row>"));
    }
    let main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    let rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    zip_parts(&[
        ("[Content_Types].xml", format!("{XML_HEAD}<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/><Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/></Types>")),
        ("_rels/.rels", format!("{XML_HEAD}<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"{rel}/officeDocument\" Target=\"xl/workbook.xml\"/></Relationships>")),
        ("xl/workbook.xml", format!("{XML_HEAD}<workbook xmlns=\"{main}\" xmlns:r=\"{rel}\"><sheets><sheet name=\"Sheet1\" sheetId=\"1\" r:id=\"rId1\"/></sheets><calcPr fullCalcOnLoad=\"1\"/></workbook>")),
        ("xl/_rels/workbook.xml.rels", format!("{XML_HEAD}<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"{rel}/worksheet\" Target=\"worksheets/sheet1.xml\"/></Relationships>")),
        ("xl/worksheets/sheet1.xml", format!("{XML_HEAD}<worksheet xmlns=\"{main}\"><sheetData>{rows}</sheetData></worksheet>")),
    ])
}

// ---- small helpers ------------------------------------------------------------------

fn escape(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

fn unescape(s: &str) -> String {
    s.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&apos;", "'").replace("&amp;", "&")
}

fn clip(s: &str) -> String {
    if s.chars().count() > 50 { format!("{}…", s.chars().take(48).collect::<String>()) } else { s.to_string() }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A small but real document: a heading, a paragraph split over two runs
    /// (bold, then plain), an empty paragraph, and the section settings.
    const DOC: &str = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Risk Report</w:t></w:r></w:p><w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Data retention </w:t></w:r><w:r><w:t>matter alot.</w:t></w:r></w:p><w:p/><w:sectPr><w:pgSz w:w="12240"/></w:sectPr></w:body></w:document>"#;

    fn docx(document: &str) -> Vec<u8> {
        let mut out = std::io::Cursor::new(Vec::new());
        {
            let mut w = zip::ZipWriter::new(&mut out);
            let o = zip::write::SimpleFileOptions::default();
            w.start_file("[Content_Types].xml", o).unwrap();
            w.write_all(b"<Types/>").unwrap();
            w.start_file("word/document.xml", o).unwrap();
            w.write_all(document.as_bytes()).unwrap();
            w.finish().unwrap();
        }
        out.into_inner()
    }

    fn part(bytes: &[u8], name: &str) -> String {
        let mut z = zip::ZipArchive::new(std::io::Cursor::new(bytes)).unwrap();
        let mut s = String::new();
        z.by_name(name).unwrap().read_to_string(&mut s).unwrap();
        s
    }

    #[test]
    fn reads_the_edits_the_chat_writes() {
        let edits = parse_edits("REPLACE: matter alot\nWITH: matter a lot\n\nADD AFTER: Risk Report\nTEXT: Written by Solomon.\nADD: The end.\nCELL Sheet2!B3: =SUM(A1:A3)\nnonsense line");
        assert_eq!(edits, vec![
            Edit::Replace { find: "matter alot".into(), with: "matter a lot".into() },
            Edit::Add { after: Some("Risk Report".into()), text: "Written by Solomon.".into() },
            Edit::Add { after: None, text: "The end.".into() },
            Edit::Cell { cell: "Sheet2!B3".into(), value: "=SUM(A1:A3)".into() },
        ]);
    }

    #[test]
    fn an_added_paragraph_copies_the_look_not_the_contents() {
        // A heading carrying everything a copy would repeat: a paragraph id, a
        // picture, a bookmark, a footnote mark, a tracked change and a
        // section break.
        let par = concat!(
            r#"<w:p w14:paraId="1A2B3C4D" w14:textId="77777777"><w:pPr><w:pStyle w:val="Heading1"/>"#,
            r#"<w:pPrChange w:id="9" w:author="A"><w:pPr/></w:pPrChange><w:sectPr><w:pgSz w:w="12240"/></w:sectPr></w:pPr>"#,
            r#"<w:bookmarkStart w:id="0" w:name="_Toc1"/><w:r><w:rPr><w:b/></w:rPr><w:t>Risk Report</w:t></w:r>"#,
            r#"<w:r><w:drawing><wp:docPr id="5" name="Picture 5"/></w:drawing></w:r>"#,
            r#"<w:r><w:footnoteReference w:id="2"/></w:r><w:bookmarkEnd w:id="0"/></w:p>"#,
        );
        let new = fresh_paragraph(par, Ooxml::WORD, "By A & B", true);
        assert_eq!(new, r#"<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">By A &amp; B</w:t></w:r></w:p>"#);
        // The whole document still has one of each.
        let xml = format!("<w:document><w:body>{par}</w:body></w:document>");
        let (out, _) = edit_paragraphs(&xml, Ooxml::WORD, &parse_edits("ADD AFTER: Risk Report\nTEXT: By A & B"), true).unwrap();
        // (Opening tags: "w:sectPr" alone would also count "</w:sectPr>".)
        for once in ["docPr id=\"5\"", "w14:paraId", "_Toc1", "<w:footnoteReference", "<w:sectPr", "<w:pPrChange", "<w:bookmarkStart", "<w:drawing"] {
            assert_eq!(out.matches(once).count(), 1, "{once} appears once: {out}");
        }
        // A slide paragraph keeps its alignment and its run's look.
        let slide = r#"<a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" b="1"/><a:t>Thank you</a:t></a:r><a:endParaRPr lang="en-US"/></a:p>"#;
        assert_eq!(fresh_paragraph(slide, Ooxml::SLIDE, "Questions?", false), r#"<a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-US" b="1"/><a:t>Questions?</a:t></a:r></a:p>"#);
    }

    /// Tracked formatting changes nest a full w:pPr / w:rPr inside the one
    /// they change. The new paragraph must keep the outer element whole and
    /// drop the change record.
    #[test]
    fn nested_tracked_changes_stay_whole() {
        let par = concat!(
            r#"<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:pPrChange w:id="9"><w:pPr><w:jc w:val="left"/></w:pPr></w:pPrChange><w:spacing w:after="120"/></w:pPr>"#,
            r#"<w:r><w:rPr><w:b/><w:rPrChange w:id="10"><w:rPr><w:i/></w:rPr></w:rPrChange><w:sz w:val="28"/></w:rPr><w:t>Risk</w:t></w:r></w:p>"#,
        );
        assert_eq!(
            fresh_paragraph(par, Ooxml::WORD, "Next", true),
            r#"<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t xml:space="preserve">Next</w:t></w:r></w:p>"#
        );
        assert_eq!(element("<a><a>x</a><a/></a>tail", "a"), Some("<a><a>x</a><a/></a>"));
        assert_eq!(element("<ab>no</ab><a/>", "a"), Some("<a/>"), "a longer name isn't it");
        assert_eq!(element("<a><a>cut short", "a"), None);
    }

    #[test]
    fn a_byte_order_mark_is_still_xml() {
        // .NET's XmlWriter puts a BOM before "<?xml": such a file is fine.
        let mut z = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
        let o = zip::write::SimpleFileOptions::default();
        z.start_file("[Content_Types].xml", o).unwrap();
        z.write_all(b"<Types/>").unwrap();
        z.start_file("word/document.xml", o).unwrap();
        z.write_all(b"\xEF\xBB\xBF\r\n<w:document><w:body><w:p><w:r><w:t>Hi</w:t></w:r></w:p></w:body></w:document>").unwrap();
        let bytes = z.finish().unwrap().into_inner();
        assert!(validate("docx", &bytes).is_ok(), "{:?}", validate("docx", &bytes));
        // Not XML at all is still refused.
        let mut z = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
        z.start_file("[Content_Types].xml", o).unwrap();
        z.write_all(b"<Types/>").unwrap();
        z.start_file("word/document.xml", o).unwrap();
        z.write_all(b"PK garbage").unwrap();
        assert!(validate("docx", &z.finish().unwrap().into_inner()).is_err());
    }

    #[test]
    fn edits_a_word_document_and_it_stays_a_word_document() {
        let edits = parse_edits("REPLACE: retention matter alot\nWITH: retention matters a lot\nADD AFTER: Risk Report\nTEXT: By Solomon & co.\nADD: The end.\nREPLACE: not in it\nWITH: x");
        let (out, report) = edit_office(&docx(DOC), "docx", &edits).unwrap();
        let xml = part(&out, "word/document.xml");
        // Still a document: the same parts, the section settings last.
        assert!(xml.ends_with("<w:sectPr><w:pgSz w:w=\"12240\"/></w:sectPr></w:body></w:document>"), "{xml}");
        assert_eq!(part(&out, "[Content_Types].xml"), "<Types/>");
        let words = |x: &str| leaf_paragraphs(x, Ooxml::WORD).iter().map(|(s, t)| paragraph_text(&x[*s..*t], Ooxml::WORD)).collect::<Vec<_>>();
        assert_eq!(words(&xml), vec!["Risk Report", "By Solomon & co.", "Data retention matters a lot.", "The end."]);
        // A phrase across two runs: the first run (bold) keeps it, the other is emptied.
        assert!(xml.contains("<w:b/></w:rPr><w:t xml:space=\"preserve\">Data retention matters a lot.</w:t></w:r><w:r><w:t></w:t>"), "{xml}");
        // The new paragraph takes the heading's look, its & escaped.
        assert!(xml.contains("<w:pStyle w:val=\"Heading1\"/></w:pPr><w:r><w:t xml:space=\"preserve\">By Solomon &amp; co.</w:t>"), "{xml}");
        assert_eq!(report, vec![
            "Replaced “retention matter alot” in 1 paragraph",
            "Added a paragraph after “Risk Report”",
            "Added a paragraph at the end",
            "Couldn't find “not in it”",
        ]);
    }

    #[test]
    fn a_word_tag_isnt_mistaken_for_a_longer_one() {
        assert!(tag_at("<w:p>", 0, "w:p") && tag_at("<w:p w:rsidR=\"1\">", 0, "w:p"));
        assert!(!tag_at("<w:pPr>", 0, "w:p") && !tag_at("<w:proofErr/>", 0, "w:p"));
        assert!(!tag_at("<w:tab/>", 0, "w:t") && !tag_at("<w:tbl>", 0, "w:t"));
        // A text box's paragraph sits inside another: only the inner one is edited.
        let nested = "<w:p><w:r><w:txbxContent><w:p><w:r><w:t>inside</w:t></w:r></w:p></w:txbxContent></w:r></w:p>";
        let leaves = leaf_paragraphs(nested, Ooxml::WORD);
        assert_eq!(leaves.len(), 1);
        assert_eq!(paragraph_text(&nested[leaves[0].0..leaves[0].1], Ooxml::WORD), "inside");
    }

    #[test]
    fn edits_slides_and_says_which() {
        let slide = |t: &str| format!(r#"<p:sld xmlns:a="a" xmlns:p="p"><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:rPr lang="en-US"/><a:t>{t}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>"#);
        let mut out = std::io::Cursor::new(Vec::new());
        {
            let mut w = zip::ZipWriter::new(&mut out);
            let o = zip::write::SimpleFileOptions::default();
            for (n, t) in [("ppt/slides/slide1.xml", "Welcome"), ("ppt/slides/slide10.xml", "Thanks"), ("ppt/slides/slide2.xml", "Agenda: risk")] {
                w.start_file(n, o).unwrap();
                w.write_all(slide(t).as_bytes()).unwrap();
            }
            w.finish().unwrap();
        }
        let edits = parse_edits("REPLACE: risk\nWITH: risk & disposal\nADD AFTER: Thanks\nTEXT: Questions?\nADD: nowhere");
        let (bytes, report) = edit_office(&out.into_inner(), "pptx", &edits).unwrap();
        assert!(part(&bytes, "ppt/slides/slide2.xml").contains("<a:t>Agenda: risk &amp; disposal</a:t>"));
        let last = part(&bytes, "ppt/slides/slide10.xml");
        assert!(last.contains("<a:t>Thanks</a:t>") && last.contains("<a:t>Questions?</a:t>"), "{last}");
        assert_eq!(report, vec!["Slide 2: Replaced “risk” in 1 paragraph", "Slide 3: Added a paragraph after “Thanks”", "Couldn't add: say which text it goes after (ADD AFTER:)"]);
    }

    fn xlsx(sheet1: &str) -> Vec<u8> {
        let mut out = std::io::Cursor::new(Vec::new());
        {
            let mut w = zip::ZipWriter::new(&mut out);
            let o = zip::write::SimpleFileOptions::default();
            for (n, body) in [
                ("xl/workbook.xml", r#"<workbook><sheets><sheet name="Budget" sheetId="1" r:id="rId1"/><sheet name="Notes &amp; more" sheetId="2" r:id="rId2"/></sheets><calcPr calcId="191029"/></workbook>"#.to_string()),
                ("xl/_rels/workbook.xml.rels", r#"<Relationships><Relationship Id="rId1" Type="ws" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="ws" Target="/xl/worksheets/sheet2.xml"/></Relationships>"#.to_string()),
                ("xl/sharedStrings.xml", r#"<sst><si><t>Rent</t></si><si><r><t>Fo</t></r><r><t>od</t></r></si></sst>"#.to_string()),
                ("xl/worksheets/sheet1.xml", sheet1.to_string()),
                ("xl/worksheets/sheet2.xml", "<worksheet><sheetData/></worksheet>".to_string()),
            ] {
                w.start_file(n, o).unwrap();
                w.write_all(body.as_bytes()).unwrap();
            }
            w.finish().unwrap();
        }
        out.into_inner()
    }

    #[test]
    fn sets_cells_in_place_in_order_and_in_new_rows() {
        let sheet = r#"<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" s="2"><v>900</v></c></row><row r="3"><c r="A3" t="s"><v>1</v></c></row></sheetData></worksheet>"#;
        let edits = parse_edits("CELL C1: 950\nCELL B1: monthly\nCELL B3: =C1*2\nCELL A2: Water\nCELL 'Notes & more'!A1: hi\nCELL Nope!A1: x\nCELL ZZZZ9: x\nREPLACE: a\nWITH: b");
        let (bytes, report) = edit_office(&xlsx(sheet), "xlsx", &edits).unwrap();
        let s1 = part(&bytes, "xl/worksheets/sheet1.xml");
        assert!(s1.contains(r#"<c r="C1" s="2"><v>950</v></c>"#), "the style is kept: {s1}");
        assert!(s1.contains(r#"<c r="A1" t="s"><v>0</v></c><c r="B1" t="inlineStr"><is><t xml:space="preserve">monthly</t></is></c><c r="C1""#), "in column order: {s1}");
        assert!(s1.contains(r#"<row r="2"><c r="A2" t="inlineStr"><is><t xml:space="preserve">Water</t></is></c></row><row r="3">"#), "a new row, in row order: {s1}");
        assert!(s1.contains(r#"<c r="B3"><f>C1*2</f></c>"#), "{s1}");
        assert!(part(&bytes, "xl/worksheets/sheet2.xml").contains(r#"<sheetData><row r="1"><c r="A1" t="inlineStr">"#));
        assert!(part(&bytes, "xl/workbook.xml").contains(r#"<calcPr fullCalcOnLoad="1" calcId="191029"/>"#), "formulas recalculate on open");
        assert_eq!(report[5], "Couldn't set Nope!A1: there's no sheet called “Nope”");
        assert!(report[6].starts_with("Couldn't set ZZZZ9"), "{report:?}");
        assert!(report[7].starts_with("Couldn't do that in a spreadsheet"), "{report:?}");
    }

    #[test]
    fn reads_a_spreadsheet_with_cell_addresses() {
        let sheet = r#"<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1"><v>900</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2"><f>B1/3</f><v>300</v></c></row></sheetData></worksheet>"#;
        let dir = std::env::temp_dir().join(format!("izk-xlsx-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let p = dir.join("budget.xlsx");
        std::fs::write(&p, xlsx(sheet)).unwrap();
        let text = read_xlsx(&p).unwrap();
        assert!(text.contains("--- Sheet: Budget ---\nA1: Rent | B1: 900\nA2: Food | B2: =B1/3 → 300\n"), "{text}");
        assert!(text.contains("--- Sheet: Notes & more ---"), "{text}");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn makes_real_word_and_excel_files_from_text() {
        let doc = new_docx("# Risk Report\nData & disposal matter.\n- shred drives\n\n## Next steps").unwrap();
        let xml = part(&doc, "word/document.xml");
        let words: Vec<String> = leaf_paragraphs(&xml, Ooxml::WORD).iter().map(|(s, t)| paragraph_text(&xml[*s..*t], Ooxml::WORD)).collect();
        assert_eq!(words, vec!["Risk Report", "Data & disposal matter.", "• shred drives", "", "Next steps"]);
        assert!(xml.contains("<w:b/><w:sz w:val=\"32\"/>"), "a heading looks like one");
        assert!(part(&doc, "[Content_Types].xml").contains("/word/document.xml") && part(&doc, "_rels/.rels").contains("word/document.xml"));
        // …and it can be edited like any other.
        let (edited, report) = edit_office(&doc, "docx", &parse_edits("REPLACE: matter.\nWITH: matter a lot.")).unwrap();
        assert!(part(&edited, "word/document.xml").contains("Data &amp; disposal matter a lot."), "{report:?}");

        let sheet = new_xlsx("Item,Cost,Note\nRent,900,\"monthly, due 1st\"\nFood,250.5,\nTotal,=SUM(B2:B3),").unwrap();
        let dir = std::env::temp_dir().join(format!("izk-new-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let p = dir.join("budget.xlsx");
        std::fs::write(&p, &sheet).unwrap();
        let text = read_xlsx(&p).unwrap();
        assert!(text.contains("A1: Item | B1: Cost | C1: Note\nA2: Rent | B2: 900 | C2: monthly, due 1st\nA3: Food | B3: 250.5\nA4: Total | B4: =SUM(B2:B3)"), "{text}");
        let (edited, _) = edit_office(&sheet, "xlsx", &parse_edits("CELL B2: 950")).unwrap();
        assert!(part(&edited, "xl/worksheets/sheet1.xml").contains("<c r=\"B2\"><v>950</v></c>"));
        assert_eq!(column_name(28), "AB");
        assert_eq!(csv_row("a\t\"b\"\"c\"\t", '\t'), vec!["a", "b\"c", ""]);
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// Files made by real Office libraries (python-docx, openpyxl, python-pptx),
    /// edited here, then opened by those libraries again:
    /// IZUKI_OFFICE_DIR=<dir> cargo test --lib officeedit::tests::real_files -- --ignored
    #[test]
    #[ignore]
    fn real_files() {
        let dir = PathBuf::from(std::env::var("IZUKI_OFFICE_DIR").expect("set IZUKI_OFFICE_DIR"));
        let run = |name: &str, edits: &str| {
            let (copy, report) = apply(&dir.join(name), &parse_edits(edits)).unwrap();
            eprintln!("{name} -> {}: {report:?}", copy.display());
        };
        run("real.docx", "REPLACE: retention matter alot\nWITH: retention matters a lot\nADD AFTER: Risk Report\nTEXT: Prepared by Izuki & co.\nADD: The end.");
        run("real.xlsx", "CELL B2: 950\nCELL Notes!A1: checked\nCELL C5: =SUM(B2:B3)\nCELL B9: new row");
        run("real.pptx", "REPLACE: Agenda\nWITH: Today's agenda\nADD AFTER: Thank you\nTEXT: Questions?");
        std::fs::write(dir.join("made.docx"), new_docx("# Made by Izuki\nA paragraph & more.\n- a bullet").unwrap()).unwrap();
        std::fs::write(dir.join("made.xlsx"), new_xlsx("Item,Cost\nRent,900\nTotal,=SUM(B2:B2)").unwrap()).unwrap();
    }

    #[test]
    fn plain_text_and_the_copy_beside_the_original() {
        let (t, r) = edit_text("line one\nline two\n", &parse_edits("REPLACE: two\nWITH: 2\nADD AFTER: one\nTEXT: one and a half\nADD: three")).unwrap();
        assert_eq!(t, "line one\none and a half\nline 2\nthree\n");
        assert_eq!(r.len(), 3);
        let dir = std::env::temp_dir().join(format!("izk-edit-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let original = dir.join("report.docx");
        std::fs::write(&original, docx(DOC)).unwrap();
        let (copy, _) = apply(&original, &parse_edits("REPLACE: alot\nWITH: a lot")).unwrap();
        assert_eq!(copy.file_name().unwrap(), "report (Izuki edit).docx");
        assert_eq!(std::fs::read(&original).unwrap(), docx(DOC), "the original is never touched");
        let (second, _) = apply(&original, &parse_edits("REPLACE: alot\nWITH: a lot")).unwrap();
        assert_eq!(second.file_name().unwrap(), "report (Izuki edit 2).docx");
        assert!(apply(&original, &parse_edits("REPLACE: nowhere\nWITH: x")).is_err(), "nothing changed: no copy, and said so");
        assert!(!dir.join("report (Izuki edit 3).docx").exists());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn the_checkers_accept_real_files_and_reject_broken_ones() {
        // A file Izuki generated passes both the loose and the strong check.
        let doc = new_docx("# Risk Report
Words").unwrap();
        validate("docx", &doc).unwrap();
        validate_new("docx", &doc).unwrap();
        let sheet = new_xlsx("Item,Cost
Rent,900").unwrap();
        validate("xlsx", &sheet).unwrap();
        validate_new("xlsx", &sheet).unwrap();
        // A file cut in half by whatever mistake: rejected.
        validate("docx", &doc[..doc.len() / 2]).unwrap_err();
        validate("xlsx", &[]).unwrap_err();
        // A docx is not an xlsx: the workbook isn't in there.
        validate("xlsx", &doc).unwrap_err();
        validate_new("docx", &sheet).unwrap_err();
        // A zip with the wrong insides (a renamed archive): rejected.
        let mut out = std::io::Cursor::new(Vec::new());
        {
            let mut w = zip::ZipWriter::new(&mut out);
            let o = zip::write::SimpleFileOptions::default();
            w.start_file("holiday-photos/01.jpg", o).unwrap();
            w.write_all(&[0xFFu8, 0xD8, 0xFF, 0xE0]).unwrap();
            w.finish().unwrap();
        }
        validate("docx", &out.into_inner()).unwrap_err();
        // The test-office document above, edited into a copy, also passes:
        validate("docx", &docx(DOC)).unwrap();
        // …but the strong check needs the real declarations, which the bare
        // test fixture deliberately doesn't have:
        validate_new("docx", &docx(DOC)).unwrap_err();
    }
}
