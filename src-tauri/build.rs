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
    tauri_build::build()
}
