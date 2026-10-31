//! Read explicitly selected document bytes. No paths, macros, links or file writes.
use anyhow::{anyhow, Result};
use base64::Engine;
use serde::Serialize;
use std::io::{Cursor, Read};

const MAX_BYTES: usize = 15 * 1024 * 1024;
const MAX_TEXT: usize = 32_000;
const MAX_XML: usize = 8 * 1024 * 1024;

#[derive(Debug, Serialize)]
pub struct DocumentText {
    pub text: String,
    pub truncated: bool,
}

pub fn read(name: &str, encoded: &str) -> Result<DocumentText> {
    if encoded.len() > MAX_BYTES.div_ceil(3) * 4 { return Err(anyhow!("Choose a file under 15 MB.")); }
    let bytes = base64::engine::general_purpose::STANDARD.decode(encoded).map_err(|_| anyhow!("The file couldn't be read. Choose it again."))?;
    if bytes.len() > MAX_BYTES { return Err(anyhow!("Choose a file under 15 MB.")); }
    let ext = name.rsplit('.').next().unwrap_or("").to_ascii_lowercase();
    let text = match ext.as_str() {
        "pdf" => pdf(&bytes)?,
        "docx" | "pptx" => office(&bytes, &ext)?,
        "doc" | "ppt" | "xls" => return Err(anyhow!("This is an older Office format. Save a copy as PDF, DOCX, PPTX or CSV, then attach that copy.")),
        "xlsx" => return Err(anyhow!("Export the sheet as CSV or PDF, then attach it.")),
        _ => return Err(anyhow!("Choose a PDF, DOCX, PPTX, picture, text or code file.")),
    };
    if text.trim().is_empty() { return Err(anyhow!("No readable text was found. For a scanned document, attach pictures of its pages instead.")); }
    let truncated = text.chars().count() > MAX_TEXT;
    Ok(DocumentText { text: text.chars().take(MAX_TEXT).collect(), truncated })
}

fn pdf(bytes: &[u8]) -> Result<String> {
    let doc = lopdf::Document::load_mem(bytes).map_err(|_| anyhow!("This PDF is damaged or password-protected. Attach an unlocked copy."))?;
    let pages = doc.get_pages();
    if pages.len() > 200 { return Err(anyhow!("Choose a PDF with up to 200 pages, or attach the chapter you need.")); }
    let mut out = String::new();
    for number in pages.keys() {
        let words = doc.extract_text(&[*number]).map_err(|_| anyhow!("This PDF's text couldn't be read. Try an unlocked copy or page pictures."))?;
        out.push_str(&format!("\n[Page {number}]\n{words}"));
        if out.chars().count() > MAX_TEXT { break; }
    }
    // Page markers alone must not make a scanned PDF look successfully read.
    if !out.chars().any(char::is_alphabetic) || out.lines().all(|line| line.trim().is_empty() || line.starts_with("[Page ")) {
        return Err(anyhow!("This PDF contains scanned pages. Attach pictures of the pages so I can see them."));
    }
    Ok(out)
}

fn office(bytes: &[u8], ext: &str) -> Result<String> {
    let mut zip = zip::ZipArchive::new(Cursor::new(bytes)).map_err(|_| anyhow!("This Office file couldn't be opened. Save a new DOCX or PPTX copy."))?;
    let mut names: Vec<String> = zip.file_names().filter(|name| {
        if ext == "docx" { *name == "word/document.xml" }
        else { name.strip_prefix("ppt/slides/slide").and_then(|n| n.strip_suffix(".xml")).is_some_and(|n| !n.is_empty() && n.chars().all(|c| c.is_ascii_digit())) }
    }).map(str::to_owned).collect();
    if names.is_empty() || names.len() > 200 { return Err(anyhow!("Choose a document with readable pages and up to 200 slides.")); }
    names.sort_by_key(|name| (name.len(), name.clone()));
    let mut total = 0usize;
    let mut out = String::new();
    let mut readable = false;
    for (index, name) in names.iter().enumerate() {
        let entry = zip.by_name(name)?;
        if entry.size() > MAX_XML.saturating_sub(total) as u64 { return Err(anyhow!("This document expands too large. Export the part you need as PDF or text.")); }
        let mut xml = String::new();
        entry.take((MAX_XML.saturating_sub(total) + 1) as u64).read_to_string(&mut xml)?;
        total += xml.len();
        if total > MAX_XML { return Err(anyhow!("This document expands too large. Export the part you need as PDF or text.")); }
        let xml = xml.replace("</w:p>", "\n").replace("</a:p>", "\n").replace("<w:tab/>", "\t").replace("<w:br/>", "\n");
        let document = scraper::Html::parse_fragment(&xml);
        let text = document.root_element().text().collect::<String>();
        readable |= !text.trim().is_empty();
        if ext == "pptx" { out.push_str(&format!("\n[Slide {}]\n", index + 1)); }
        out.push_str(&text);
        if out.chars().count() > MAX_TEXT { break; }
    }
    if !readable { return Err(anyhow!("No readable text was found. Attach PDF or pictures of the pages instead.")); }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    fn document(ext: &str, parts: &[(&str, &str)]) -> Result<DocumentText> {
        let mut archive = zip::ZipWriter::new(Cursor::new(Vec::new()));
        for (name, text) in parts {
            archive.start_file(*name, zip::write::SimpleFileOptions::default()).unwrap();
            archive.write_all(text.as_bytes()).unwrap();
        }
        let bytes = archive.finish().unwrap().into_inner();
        read(&format!("sample.{ext}"), &base64::engine::general_purpose::STANDARD.encode(bytes))
    }
    #[test]
    fn word_reads_unicode_and_entities_without_executing_links() {
        let doc = document("DOCX", &[("word/document.xml", "<w:document><w:p><w:r><w:t>Café &amp; code &#x2713;</w:t></w:r></w:p><w:p><w:r><w:t>Next paragraph</w:t></w:r></w:p></w:document>")]).unwrap();
        assert!(doc.text.contains("Café & code ✓"));
        assert!(doc.text.contains("\nNext paragraph"));
    }
    #[test]
    fn slides_keep_numeric_order_and_skip_notes_and_macros() {
        let doc = document("pptx", &[("ppt/slides/slide10.xml", "<a:p>Ten</a:p>"), ("ppt/slides/slide2.xml", "<a:p>Two</a:p>"), ("ppt/notes/slide1.xml", "Private notes"), ("vbaProject.bin", "macro")]).unwrap();
        assert!(doc.text.find("Two").unwrap() < doc.text.find("Ten").unwrap());
        assert!(!doc.text.contains("Private notes"));
        assert!(!doc.text.contains("macro"));
    }
    #[test]
    fn bounds_and_bad_files_have_clear_errors() {
        assert!(read("file.pdf", "not base64").is_err());
        assert!(document("docx", &[("elsewhere.xml", "No document")]).is_err());
        assert!(read("file.exe", "AA==").unwrap_err().to_string().contains("Choose a PDF"));
        assert!(document("docx", &[("word/document.xml", &"x".repeat(MAX_XML + 1))]).is_err());
        assert!(document("pptx", &[("ppt/slides/slide1.xml", "<p:sld/>")]).is_err());
        assert!(document("docx", &[("word/document.xml", &"word ".repeat(MAX_TEXT))]).unwrap().truncated);
    }
    fn pdf_file(content: &str) -> Vec<u8> {
        use lopdf::{dictionary, Document, Object, Stream};
        let mut doc = Document::with_version("1.5");
        let pages = doc.new_object_id();
        let font = doc.add_object(dictionary! { "Type" => "Font", "Subtype" => "Type1", "BaseFont" => "Helvetica" });
        let resources = doc.add_object(dictionary! { "Font" => dictionary! { "F1" => font } });
        let stream = doc.add_object(Stream::new(dictionary! {}, content.as_bytes().to_vec()));
        let page = doc.add_object(dictionary! { "Type" => "Page", "Parent" => pages, "Resources" => resources, "Contents" => stream, "MediaBox" => vec![0.into(), 0.into(), 600.into(), 800.into()] });
        doc.objects.insert(pages, Object::Dictionary(dictionary! { "Type" => "Pages", "Kids" => vec![page.into()], "Count" => 1 }));
        let catalog = doc.add_object(dictionary! { "Type" => "Catalog", "Pages" => pages });
        doc.trailer.set("Root", catalog);
        let mut bytes = Vec::new();
        doc.save_to(&mut bytes).unwrap();
        bytes
    }
    #[test]
    fn pdf_reads_real_text_and_rejects_picture_only_pages() {
        let encode = |bytes: Vec<u8>| base64::engine::general_purpose::STANDARD.encode(bytes);
        let text = read("sample.PDF", &encode(pdf_file("BT /F1 12 Tf 72 720 Td (Hello PDF) Tj ET"))).unwrap();
        assert!(text.text.contains("Hello PDF"));
        assert!(read("scanned.pdf", &encode(pdf_file(""))).is_err());
    }
}
