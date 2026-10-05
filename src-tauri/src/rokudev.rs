//! Keeping the Izuki channel on a Roku up to date, from the PC.
//!
//! The channel is side-loaded (Roku's free developer mode), so the Roku
//! can't update it by itself. Izuki carries the channel that matches this
//! version of the app, compares it with what the TV has (Roku's /query/apps
//! lists the developer channel with its version) and, with the developer
//! password the user picked when they turned developer mode on, installs
//! the new one through the Roku's own installer page — the same upload you'd
//! do by hand. The password stays in this PC's settings.

use std::time::Duration;

use anyhow::{anyhow, Result};

/// The channel, built from tv/roku by tools/build-roku.py.
const CHANNEL_ZIP: &[u8] = include_bytes!("../../docs/tv/izuki-roku.zip");
const MANIFEST: &str = include_str!("../../tv/roku/manifest");

/// "1.1.49" — this app's channel.
pub fn latest() -> String {
    let get = |k: &str| {
        MANIFEST
            .lines()
            .find_map(|l| l.strip_prefix(&format!("{k}=")))
            .map(|v| v.trim().to_string())
            .unwrap_or_else(|| "0".into())
    };
    format!("{}.{}.{}", get("major_version"), get("minor_version"), get("build_version"))
}

fn parts(v: &str) -> Vec<u64> {
    v.split('.').map(|p| p.trim().parse().unwrap_or(0)).collect()
}

/// `a` is older than `b`.
pub fn older(a: &str, b: &str) -> bool {
    parts(a) < parts(b)
}

/// The developer channel's version on the TV, if one is installed.
pub fn installed(host: &str) -> Option<String> {
    let xml = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(4))
        .build()
        .ok()?
        .get(format!("http://{host}:8060/query/apps"))
        .send()
        .ok()?
        .text()
        .ok()?;
    xml.split("<app ").find(|a| a.contains("id=\"dev\"")).and_then(|a| {
        let v = a.split("version=\"").nth(1)?.split('"').next()?;
        Some(v.to_string())
    })
}

/// Install this app's channel on the TV. What to tell the user.
pub fn install(host: &str, password: &str) -> Result<String> {
    if password.trim().is_empty() {
        return Err(anyhow!("I need your Roku's developer password — the one you picked when you turned on developer mode."));
    }
    let client = reqwest::blocking::Client::builder().timeout(Duration::from_secs(60)).build()?;
    let url = format!("http://{host}/plugin_install");
    // 1) Ask, to get the login challenge.
    let first = client.get(&url).send().map_err(|_| anyhow!("I couldn't reach your Roku's installer. Is developer mode on? (Home ×3, Up ×2, Right, Left, Right, Left, Right)"))?;
    let challenge = first
        .headers()
        .get("www-authenticate")
        .and_then(|h| h.to_str().ok())
        .map(str::to_string)
        .ok_or_else(|| anyhow!("Your Roku's installer didn't ask for the password — developer mode may be off."))?;
    let field = |k: &str| challenge.split(&format!("{k}=\"")).nth(1).and_then(|r| r.split('"').next()).unwrap_or("").to_string();
    let (realm, nonce, qop) = (field("realm"), field("nonce"), field("qop"));
    let cnonce = format!("{:016x}", rand::random::<u64>());
    let ha1 = md5_hex(format!("rokudev:{realm}:{}", password.trim()).as_bytes());
    let ha2 = md5_hex(b"POST:/plugin_install");
    let response = if qop.is_empty() {
        md5_hex(format!("{ha1}:{nonce}:{ha2}").as_bytes())
    } else {
        md5_hex(format!("{ha1}:{nonce}:00000001:{cnonce}:auth:{ha2}").as_bytes())
    };
    let auth = if qop.is_empty() {
        format!("Digest username=\"rokudev\", realm=\"{realm}\", nonce=\"{nonce}\", uri=\"/plugin_install\", response=\"{response}\"")
    } else {
        format!("Digest username=\"rokudev\", realm=\"{realm}\", nonce=\"{nonce}\", uri=\"/plugin_install\", qop=auth, nc=00000001, cnonce=\"{cnonce}\", response=\"{response}\"")
    };
    // 2) Upload the channel, as the installer page's form would.
    let form = reqwest::blocking::multipart::Form::new()
        .text("mysubmit", "Install")
        .part("archive", reqwest::blocking::multipart::Part::bytes(CHANNEL_ZIP.to_vec()).file_name("izuki-roku.zip").mime_str("application/zip")?);
    let res = client.post(&url).header("Authorization", auth).multipart(form).send()?;
    let status = res.status();
    let body = res.text().unwrap_or_default();
    if status.as_u16() == 401 {
        return Err(anyhow!("Your Roku said the developer password is wrong."));
    }
    let lower = body.to_lowercase();
    if status.is_success() && (lower.contains("success") || lower.contains("identical") || lower.contains("received")) {
        return Ok(format!("The Izuki channel on your TV is now {} — it's open on the TV.", latest()));
    }
    Err(anyhow!("Your Roku didn't take the update ({status})."))
}

/// On start-up: if the TV's channel is older and the user said to keep it
/// updated, update it (once per run). What was done, if anything.
pub fn update_if_needed() -> Option<String> {
    let store = crate::state::try_store()?;
    let s = store.settings();
    let host = s.tv_host.trim().to_string();
    if host.is_empty() || !s.tv_channel_auto || s.roku_dev_password.trim().is_empty() || crate::tv::make(&host).is_some() {
        return None;
    }
    let have = installed(&host)?;
    if !older(&have, &latest()) {
        return None;
    }
    install(&host, &s.roku_dev_password).ok()
}

// ---- MD5 (for the Roku installer's login; nothing else uses it) ------------

pub fn md5_hex(data: &[u8]) -> String {
    const S: [u32; 64] = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4,
        11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    ];
    let k: Vec<u32> = (0..64).map(|i| ((i as f64 + 1.0).sin().abs() * 4294967296.0) as u32).collect();
    let (mut a0, mut b0, mut c0, mut d0) = (0x67452301u32, 0xefcdab89u32, 0x98badcfeu32, 0x10325476u32);
    let mut msg = data.to_vec();
    let bits = (data.len() as u64).wrapping_mul(8);
    msg.push(0x80);
    while msg.len() % 64 != 56 {
        msg.push(0);
    }
    msg.extend_from_slice(&bits.to_le_bytes());
    for chunk in msg.chunks(64) {
        let m: Vec<u32> = chunk.chunks(4).map(|w| u32::from_le_bytes([w[0], w[1], w[2], w[3]])).collect();
        let (mut a, mut b, mut c, mut d) = (a0, b0, c0, d0);
        for i in 0..64 {
            let (f, g) = match i {
                0..=15 => ((b & c) | (!b & d), i),
                16..=31 => ((d & b) | (!d & c), (5 * i + 1) % 16),
                32..=47 => (b ^ c ^ d, (3 * i + 5) % 16),
                _ => (c ^ (b | !d), (7 * i) % 16),
            };
            let f = f.wrapping_add(a).wrapping_add(k[i]).wrapping_add(m[g]);
            a = d;
            d = c;
            c = b;
            b = b.wrapping_add(f.rotate_left(S[i]));
        }
        a0 = a0.wrapping_add(a);
        b0 = b0.wrapping_add(b);
        c0 = c0.wrapping_add(c);
        d0 = d0.wrapping_add(d);
    }
    [a0, b0, c0, d0].iter().flat_map(|w| w.to_le_bytes()).map(|b| format!("{b:02x}")).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn md5_and_versions() {
        assert_eq!(md5_hex(b""), "d41d8cd98f00b204e9800998ecf8427e");
        assert_eq!(md5_hex(b"The quick brown fox jumps over the lazy dog"), "9e107d9d372bb6826bd81d3542a419d6");
        assert_eq!(md5_hex(&[b'a'; 100]), "36a92cc94a9e0fa21f625f8bfb007adf");
        assert!(older("1.0.41", "1.1.49"));
        assert!(!older("1.1.49", "1.1.49"));
        assert!(older("1.1.9", "1.1.49"));
        assert!(latest().split('.').count() == 3);
    }
}
