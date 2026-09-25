//! The on-device voice models — Izuki's natural voice (Kokoro) and its ears
//! (Whisper) — served to the webviews from a disk cache.
//!
//! Both run inside the webviews (transformers.js), but the webviews don't
//! download them themselves: WebView2's own `fetch` to Hugging Face has been
//! seen failing outright ("Failed to fetch") on machines where every other
//! request works. So transformers.js is pointed at `http://izukimodel.localhost/`
//! instead, and this handler fetches each file once with the same HTTP stack
//! the AI calls use, keeps it in `%APPDATA%\Izuki\models`, and serves it from
//! disk every time after — which also makes both work offline from then on.

use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::time::Duration;

use parking_lot::Mutex;
use serde::Serialize;
use tauri::http::{Request, Response, StatusCode};
use tauri::{AppHandle, Emitter, Runtime};

pub const SCHEME: &str = "izukimodel";

/// Only these repos are ever fetched — this is not a general proxy.
const REPOS: &[&str] = &[
    "onnx-community/Kokoro-82M-v1.0-ONNX",
    "onnx-community/whisper-base.en",
    "onnx-community/moonshine-base-ONNX",
    "onnx-community/moonshine-tiny-ONNX",
    "onnx-community/whisper-tiny.en",
];

/// One download at a time: both webviews may ask for the same file at once,
/// and the second should wait for the first rather than race it.
static DOWNLOAD: Mutex<()> = Mutex::new(());

#[derive(Clone, Serialize)]
pub struct Progress {
    pub file: String,
    pub loaded: u64,
    pub total: u64,
}

pub const PROGRESS: &str = "izuki://model-progress";

fn models_dir() -> PathBuf {
    crate::store::data_dir().join("models")
}

/// `/onnx-community/whisper-base.en/resolve/main/onnx/encoder_model_quantized.onnx`
/// → (repo, file). Anything else — other repos, `..`, odd characters — is refused.
fn parse(path: &str) -> Option<(&'static str, String)> {
    let path = path.trim_start_matches('/');
    for &repo in REPOS {
        let Some(rest) = path.strip_prefix(repo).and_then(|r| r.strip_prefix("/resolve/")) else {
            continue;
        };
        // Skip the revision segment; everything is pinned to `main`.
        let (_, file) = rest.split_once('/')?;
        let file = percent_decode(file.split('?').next().unwrap_or(file));
        let ok = !file.is_empty()
            && !file.contains("..")
            && !file.starts_with('/')
            && file
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-' | '/'));
        return ok.then_some((repo, file));
    }
    None
}

fn percent_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hex = std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or("");
            if let Ok(v) = u8::from_str_radix(hex, 16) {
                out.push(v);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn local_path(repo: &str, file: &str) -> PathBuf {
    let mut p = models_dir().join(repo.replace('/', "--"));
    for part in file.split('/') {
        p.push(part);
    }
    p
}

enum Fetched {
    Found(PathBuf),
    Missing,
}

/// The file on disk, downloading it first if this is the first time.
fn fetch<R: Runtime>(app: &AppHandle<R>, repo: &str, file: &str) -> Result<Fetched, String> {
    let path = local_path(repo, file);
    // transformers.js probes optional files on every load; remember the
    // ones that don't exist instead of asking the Hub again each time.
    let missing = path.with_extension(format!(
        "{}.missing",
        path.extension().and_then(|e| e.to_str()).unwrap_or("")
    ));
    if path.is_file() {
        return Ok(Fetched::Found(path));
    }
    if missing.is_file() {
        return Ok(Fetched::Missing);
    }

    let _one_at_a_time = DOWNLOAD.lock();
    if path.is_file() {
        return Ok(Fetched::Found(path)); // the other webview just fetched it
    }

    let url = format!("https://huggingface.co/{repo}/resolve/main/{file}");
    eprintln!("[models] downloading {url}");
    let client = reqwest::blocking::Client::builder()
        .connect_timeout(Duration::from_secs(20))
        .timeout(Duration::from_secs(30 * 60))
        .build()
        .map_err(|e| e.to_string())?;
    let mut resp = client.get(&url).send().map_err(|e| e.to_string())?;

    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    if resp.status() == reqwest::StatusCode::NOT_FOUND {
        let _ = fs::write(&missing, b"");
        return Ok(Fetched::Missing);
    }
    if !resp.status().is_success() {
        return Err(format!("{url}: HTTP {}", resp.status()));
    }

    let total = resp.content_length().unwrap_or(0);
    let part = path.with_extension("part");
    let mut out = fs::File::create(&part).map_err(|e| e.to_string())?;
    let mut buf = vec![0u8; 256 * 1024];
    let mut loaded = 0u64;
    let mut last_emit = 0u64;
    loop {
        let n = resp.read(&mut buf).map_err(|e| e.to_string())?;
        if n == 0 {
            break;
        }
        out.write_all(&buf[..n]).map_err(|e| e.to_string())?;
        loaded += n as u64;
        if loaded - last_emit >= 2 * 1024 * 1024 || (total > 0 && loaded == total) {
            last_emit = loaded;
            let _ = app.emit(
                PROGRESS,
                Progress { file: file.to_string(), loaded, total },
            );
        }
    }
    out.flush().map_err(|e| e.to_string())?;
    drop(out);
    if total > 0 && loaded != total {
        let _ = fs::remove_file(&part);
        return Err(format!("{url}: download cut short ({loaded} of {total} bytes)"));
    }
    fs::rename(&part, &path).map_err(|e| e.to_string())?;
    eprintln!("[models] saved {file} ({} KB)", loaded / 1024);
    Ok(Fetched::Found(path))
}

/// The ONNX runtime that runs both models, compiled into the app so it never
/// depends on a CDN. (Serving it from Vite's `public/` fails in dev: Vite
/// refuses dynamic `import()`s of public files.) Must match the installed
/// @huggingface/transformers — `npm install` before building keeps it so.
const ORT_MJS: &[u8] =
    include_bytes!("../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs");
const ORT_WASM: &[u8] =
    include_bytes!("../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm");

/// The dedicated wake-word engine (openWakeWord, github.com/dscripka/openWakeWord):
/// its two shared feature models. Wake words themselves are the user's own
/// (see `wakewords_dir`) — none is bundled.
/// Tiny (~3.7 MB together), so they ship inside the app.
const WAKE_MEL: &[u8] = include_bytes!("../resources/wakeword/melspectrogram.onnx");
const WAKE_EMB: &[u8] = include_bytes!("../resources/wakeword/embedding_model.onnx");

/// Where custom wake words go — e.g. a "Hey Nova" or "Hey Izuki" model from
/// openwakeword.com. Every `.onnx` here is listened for.
pub fn wakewords_dir() -> PathBuf {
    crate::store::data_dir().join("wakewords")
}

/// File names that are the engine's own parts, never wake words.
const NOT_WAKEWORDS: &[&str] = &["melspectrogram", "embedding_model", "silero_vad"];

/// The custom wake-word models installed, by file name.
pub fn custom_wakewords() -> Vec<String> {
    let mut names: Vec<String> = fs::read_dir(wakewords_dir())
        .map(|rd| {
            rd.filter_map(|e| e.ok())
                .map(|e| e.file_name().to_string_lossy().into_owned())
                .filter(|n| n.to_ascii_lowercase().ends_with(".onnx"))
                .filter(|n| !NOT_WAKEWORDS.iter().any(|x| n.to_ascii_lowercase().starts_with(x)))
                .collect()
        })
        .unwrap_or_default();
    names.sort();
    names
}

fn wakeword_file(path: &str) -> Option<Response<Vec<u8>>> {
    let rest = path.strip_prefix("/wakeword/")?;
    let bytes = match rest {
        "melspectrogram.onnx" => WAKE_MEL.to_vec(),
        "embedding_model.onnx" => WAKE_EMB.to_vec(),
        other => {
            let name = percent_decode(other.strip_prefix("custom/")?);
            // Only a plain file name from the installed list — no paths.
            if !custom_wakewords().iter().any(|n| *n == name) {
                return Some(respond(StatusCode::NOT_FOUND, "text/plain", Vec::new()));
            }
            fs::read(wakewords_dir().join(&name)).ok()?
        }
    };
    Some(respond(StatusCode::OK, "application/octet-stream", bytes))
}

fn runtime_file(path: &str) -> Option<Response<Vec<u8>>> {
    if let Some(r) = wakeword_file(path) {
        return Some(r);
    }
    match path {
        "/ort/ort-wasm-simd-threaded.jsep.mjs" => Some(respond(StatusCode::OK, "text/javascript", ORT_MJS.to_vec())),
        "/ort/ort-wasm-simd-threaded.jsep.wasm" => Some(respond(StatusCode::OK, "application/wasm", ORT_WASM.to_vec())),
        _ => None,
    }
}

fn respond(status: StatusCode, content_type: &str, body: Vec<u8>) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header("Access-Control-Allow-Origin", "*")
        .header("Content-Type", content_type)
        .header("Content-Length", body.len().to_string())
        .body(body)
        .unwrap_or_else(|_| Response::new(Vec::new()))
}

/// The `izukimodel://` handler. Slow (a first download can take minutes), so
/// the caller runs it off the main thread.
pub fn handle<R: Runtime>(app: &AppHandle<R>, request: &Request<Vec<u8>>) -> Response<Vec<u8>> {
    if let Some(res) = runtime_file(request.uri().path()) {
        return res;
    }
    let Some((repo, file)) = parse(request.uri().path()) else {
        return respond(StatusCode::FORBIDDEN, "text/plain", b"not a known model file".to_vec());
    };
    match fetch(app, repo, &file) {
        Ok(Fetched::Found(path)) => match fs::read(&path) {
            Ok(bytes) => {
                let ct = if file.ends_with(".json") { "application/json" } else { "application/octet-stream" };
                respond(StatusCode::OK, ct, bytes)
            }
            Err(e) => respond(StatusCode::INTERNAL_SERVER_ERROR, "text/plain", e.to_string().into_bytes()),
        },
        Ok(Fetched::Missing) => respond(StatusCode::NOT_FOUND, "text/plain", Vec::new()),
        Err(e) => {
            eprintln!("[models] {e}");
            respond(StatusCode::BAD_GATEWAY, "text/plain", e.into_bytes())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_known_repo_files_only() {
        let (repo, file) =
            parse("/onnx-community/whisper-base.en/resolve/main/onnx/encoder_model_quantized.onnx").unwrap();
        assert_eq!(repo, "onnx-community/whisper-base.en");
        assert_eq!(file, "onnx/encoder_model_quantized.onnx");
        let (_, file) = parse("/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices%2Faf_heart.bin").unwrap();
        assert_eq!(file, "voices/af_heart.bin");
        assert!(parse("/someone/else/resolve/main/x.onnx").is_none());
        assert!(parse("/onnx-community/whisper-base.en/resolve/main/../../secrets").is_none());
        assert!(parse("/onnx-community/whisper-base.en/resolve/main/a\\b").is_none());
    }
}
