fn main() {
    println!("cargo:rerun-if-env-changed=IZUKI_TEST_MANIFEST");
    // Tauri embeds the app manifest into binaries, not the library unit-test
    // harness. Opt in only for `cargo test --lib` so the normal application
    // keeps Tauri's manifest without duplicate RT_MANIFEST resources.
    if std::env::var_os("IZUKI_TEST_MANIFEST").is_some()
        && std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows")
        && std::env::var("CARGO_CFG_TARGET_ENV").as_deref() == Ok("msvc")
    {
        println!("cargo:rustc-link-arg=/MANIFEST:EMBED");
        println!("cargo:rustc-link-arg=/MANIFESTDEPENDENCY:type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'");
    }
    bake_release_notes();
    tauri_build::build()
}

/// The release notes for the newest releases up to the one being built,
/// baked in so Izuki can say what it is and what's new without the web.
///
/// Asked "what are Izuki's new features", the chat searched the internet and
/// answered from the GitHub pages for 1.0.36 and 1.0.172 — while 1.0.185 was
/// running. Nothing about the app was in the app. The notes are already
/// written (docs/RELEASE-x.y.z.md) before every release, so they're taken from
/// there at build time: no second copy to keep in step. Notes for a version
/// above this one are left out (written ahead, not shipped yet). None at all
/// (a stripped source tree): an empty file — the build never fails over docs.
fn bake_release_notes() {
    use std::path::PathBuf;
    let out = PathBuf::from(std::env::var("OUT_DIR").expect("cargo sets OUT_DIR")).join("release-notes.md");
    let version = std::env::var("CARGO_PKG_VERSION").unwrap_or_default();
    let docs = PathBuf::from("..").join("docs");
    let parts = |text: &str| -> Option<Vec<u32>> { text.split('.').map(|p| p.parse().ok()).collect() };
    let this = parts(&version).unwrap_or_default();
    // The newest few releases up to and including this one, newest first.
    // One patch release on its own made "what's new" a list of three small
    // fixes, with last week's headline feature nowhere in it.
    let mut found: Vec<(Vec<u32>, PathBuf)> = std::fs::read_dir(&docs)
        .ok()
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            let v = parts(name.strip_prefix("RELEASE-")?.strip_suffix(".md")?)?;
            (this.is_empty() || v <= this).then_some((v, e.path()))
        })
        .collect();
    found.sort_by(|a, b| b.0.cmp(&a.0));
    found.truncate(3);
    let mut text = String::new();
    for (_, path) in &found {
        // Only the files used. Watching all of docs/ would rerun this — and
        // potentially rebuild the whole app — on every edit to the phone
        // app's files. New notes only matter alongside a new version number,
        // and a version change reruns build scripts anyway.
        println!("cargo:rerun-if-changed={}", path.display());
        if let Ok(notes) = std::fs::read_to_string(path) {
            text.push_str(&notes);
            text.push_str("\n\n");
        }
    }
    let _ = std::fs::write(&out, text);
}
