//! The TV: "Hey Nova, open Netflix on the TV", "turn the TV up", "search
//! the TV for Stranger Things", "pause the TV". Roku first — its built-in
//! network remote (ECP, port 8060) needs nothing installed on the TV: Izuki
//! finds it on the home Wi-Fi and presses its buttons, opens its apps and
//! types into it. (Other makes speak different remotes; they come next.)
//!
//! Newer Roku software ships with outside control set to "Limited", which
//! answers every command with 403. Izuki notices and says exactly where to
//! change it, in plain words.

use std::net::UdpSocket;
use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use serde::Serialize;

const PORT: u16 = 8060;

/// Where Roku hides the switch, for when it says "Limited mode".
pub const ALLOW_STEPS: &str =
    "On the TV: Settings → System → Advanced system settings → Control by mobile apps → Network access → Default. Then try again.";

#[derive(Debug, Clone, Serialize)]
pub struct TvInfo {
    pub host: String,
    pub name: String,
    pub on: bool,
    /// False while the TV is set to "Limited" control.
    pub allowed: bool,
}

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder().timeout(Duration::from_secs(4)).build()?)
}

fn base(host: &str) -> String {
    let h = host.trim().trim_start_matches("http://").trim_end_matches('/');
    let h = h.split('/').next().unwrap_or(h);
    if h.contains(':') { format!("http://{h}") } else { format!("http://{h}:{PORT}") }
}

/// Find a Roku on the home network (SSDP, ~2 s). Its address, e.g. "192.168.1.7".
pub fn discover() -> Option<String> {
    let sock = UdpSocket::bind("0.0.0.0:0").ok()?;
    sock.set_read_timeout(Some(Duration::from_millis(400))).ok()?;
    let ask = "M-SEARCH * HTTP/1.1\r\nHost: 239.255.255.250:1900\r\nMan: \"ssdp:discover\"\r\nST: roku:ecp\r\nMX: 2\r\n\r\n";
    let _ = sock.send_to(ask.as_bytes(), "239.255.255.250:1900");
    let until = Instant::now() + Duration::from_millis(2500);
    let mut buf = [0u8; 2048];
    while Instant::now() < until {
        if let Ok((n, _)) = sock.recv_from(&mut buf) {
            let text = String::from_utf8_lossy(&buf[..n]);
            for line in text.lines() {
                if line.to_ascii_lowercase().starts_with("location:") {
                    let url = line[9..].trim();
                    let host = url.trim_start_matches("http://").split(['/', ':']).next().unwrap_or("");
                    if !host.is_empty() {
                        return Some(host.to_string());
                    }
                }
            }
        }
    }
    None
}

fn tag(xml: &str, name: &str) -> Option<String> {
    let open = format!("<{name}>");
    let i = xml.find(&open)? + open.len();
    let j = xml[i..].find("</")? + i;
    Some(xml[i..j].trim().to_string())
}

pub fn info(host: &str) -> Result<TvInfo> {
    let c = client()?;
    let xml = c.get(format!("{}/query/device-info", base(host))).send()?.text()?;
    let name = tag(&xml, "user-device-name").or_else(|| tag(&xml, "friendly-device-name")).unwrap_or_else(|| "Roku".into());
    let on = tag(&xml, "power-mode").is_none_or(|p| p == "PowerOn");
    let allowed = c.get(format!("{}/query/apps", base(host))).send().map(|r| r.status() != 403).unwrap_or(false);
    Ok(TvInfo { host: host.to_string(), name, on, allowed })
}

fn post(host: &str, path: &str) -> Result<()> {
    let r = client()?.post(format!("{}{}", base(host), path)).send()?;
    if r.status().as_u16() == 403 {
        return Err(anyhow!("Your TV is only allowing limited control right now. {ALLOW_STEPS}"));
    }
    if !r.status().is_success() {
        return Err(anyhow!("the TV answered {}", r.status()));
    }
    Ok(())
}

pub fn key(host: &str, key: &str) -> Result<()> {
    post(host, &format!("/keypress/{key}"))
}

/// Type text the way the remote's keyboard would (Lit_ keys).
pub fn type_text(host: &str, text: &str) -> Result<()> {
    for ch in text.chars() {
        let mut b = [0u8; 4];
        key(host, &format!("Lit_{}", urlencode(ch.encode_utf8(&mut b))))?;
        std::thread::sleep(Duration::from_millis(60));
    }
    Ok(())
}

fn urlencode(s: &str) -> String {
    s.bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

/// The TV's own apps, (id, name) — when it allows the query.
pub fn apps(host: &str) -> Vec<(String, String)> {
    let Ok(xml) = client().and_then(|c| Ok(c.get(format!("{}/query/apps", base(host))).send()?.text()?)) else { return Vec::new() };
    let mut out = Vec::new();
    let mut rest = xml.as_str();
    while let Some(i) = rest.find("<app id=\"") {
        rest = &rest[i + 9..];
        let Some(q) = rest.find('"') else { break };
        let id = rest[..q].to_string();
        let Some(gt) = rest.find('>') else { break };
        let Some(end) = rest[gt..].find("</app>") else { break };
        out.push((id, rest[gt + 1..gt + end].trim().to_string()));
        rest = &rest[gt + end..];
    }
    out
}

/// Well-known channel ids, for when the TV won't list its apps.
const KNOWN: &[(&str, &str)] = &[
    ("netflix", "12"), ("youtube tv", "195316"), ("youtube", "837"), ("prime video", "13"), ("amazon prime", "13"),
    ("prime", "13"), ("hulu", "2285"), ("disney", "291097"), ("max", "61322"), ("hbo", "61322"), ("spotify", "22297"),
    ("apple tv", "551012"), ("peacock", "593099"), ("paramount", "31440"), ("tubi", "41468"), ("pluto", "74519"),
    ("roku channel", "151908"), ("plex", "13535"), ("crunchyroll", "2595"), ("twitch", "50539"), ("espn", "34376"),
];

fn find_app(host: &str, wanted: &str) -> Option<(String, String)> {
    let w = wanted.to_lowercase();
    let installed = apps(host);
    if let Some((id, name)) = installed.iter().find(|(_, n)| n.to_lowercase() == w).or_else(|| installed.iter().find(|(_, n)| n.to_lowercase().contains(&w))) {
        return Some((id.clone(), name.clone()));
    }
    KNOWN.iter().find(|(k, _)| w.contains(k) || k.contains(w.as_str())).map(|(k, id)| (id.to_string(), title(k)))
}

fn title(s: &str) -> String {
    s.split(' ').map(|w| { let mut c = w.chars(); c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default() }).collect::<Vec<_>>().join(" ")
}

/// What was asked of the TV, worked out without any AI.
#[derive(Debug, Clone, PartialEq)]
pub enum TvAct {
    Open(String),
    Search(String),
    Type(String),
    Key(&'static str, u32),
    Power(bool),
    /// "Control my TV": check it's there and ready, press nothing.
    Ready,
}

/// "open netflix on the tv" → Open("netflix"); "turn the tv up" → VolumeUp ×4…
/// `None` when it isn't a TV request this can do by itself.
pub fn parse(said: &str) -> Option<TvAct> {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    if !(s.contains("tv") || s.contains("television") || s.contains("roku")) {
        return None;
    }
    // Strip the "on the TV" part to get the request itself.
    let mut core = s.to_string();
    for w in ["hey nova", "hey izuki", "on my tv", "on the tv", "on tv", "the tv", "my tv", "on the television", "the television", "on roku", "the roku", "roku", "tv", ","] {
        core = core.replace(w, " ");
    }
    let core = core.split_whitespace().filter(|w| !["please", "can", "you", "could", "for", "me"].contains(w)).collect::<Vec<_>>().join(" ");
    let words: Vec<&str> = core.split_whitespace().collect();
    let has = |k: &str| core == k || core.starts_with(&format!("{k} ")) || core.contains(&format!(" {k}")) || core.ends_with(k);

    if has("turn off") || has("switch off") || core == "off" || has("power off") {
        return Some(TvAct::Power(false));
    }
    if has("turn on") && words.len() <= 2 || has("switch on") || core == "on" || has("power on") {
        return Some(TvAct::Power(true));
    }
    if has("unmute") || has("mute") {
        return Some(TvAct::Key("VolumeMute", 1));
    }
    if has("louder") || has("volume up") || has("turn up") || has("turn it up") || core.ends_with(" up") && has("turn") {
        return Some(TvAct::Key("VolumeUp", 4));
    }
    if has("quieter") || has("volume down") || has("turn down") || has("turn it down") {
        return Some(TvAct::Key("VolumeDown", 4));
    }
    if has("pause") || has("play") && words.len() == 1 || has("resume") || has("unpause") {
        return Some(TvAct::Key("Play", 1));
    }
    if has("fast forward") || has("skip ahead") || has("forward") {
        return Some(TvAct::Key("Fwd", 1));
    }
    if has("rewind") || has("go back a bit") {
        return Some(TvAct::Key("Rev", 1));
    }
    if has("home") || has("go home") {
        return Some(TvAct::Key("Home", 1));
    }
    if core == "back" || has("go back") {
        return Some(TvAct::Key("Back", 1));
    }
    for (said, key) in [("up", "Up"), ("down", "Down"), ("left", "Left"), ("right", "Right"), ("ok", "Select"), ("select", "Select"), ("enter", "Select")] {
        if core == said || core == format!("go {said}") || core == format!("press {said}") {
            return Some(TvAct::Key(key, 1));
        }
    }
    for lead in ["search for ", "search ", "find ", "look for ", "look up "] {
        if let Some(q) = core.strip_prefix(lead) {
            return Some(TvAct::Search(q.trim().to_string()));
        }
    }
    for lead in ["type ", "write "] {
        if let Some(t) = core.strip_prefix(lead) {
            return Some(TvAct::Type(t.trim().to_string()));
        }
    }
    // "play stranger things on netflix", "watch the news" — find it.
    for lead in ["play ", "watch ", "put on "] {
        if let Some(what) = core.strip_prefix(lead) {
            let what = what.trim();
            // Just an app ("play netflix") opens it; anything else is searched.
            if !what.is_empty() && !KNOWN.iter().any(|(k, _)| what == *k || what.trim_end_matches(" app") == *k) {
                let what = what.split(" on ").next().unwrap_or(what).trim();
                return Some(TvAct::Search(what.to_string()));
            }
        }
    }
    for lead in ["open ", "launch ", "start ", "put on ", "go to ", "switch to ", "play ", "watch "] {
        if let Some(app) = core.strip_prefix(lead) {
            let app = app.trim().trim_start_matches("the ").trim_end_matches(" app").trim();
            if !app.is_empty() {
                return Some(TvAct::Open(app.to_string()));
            }
        }
    }
    // Just an app's name ("TV, Netflix"), or "control my TV".
    let app = core.trim_start_matches("the ").trim_end_matches(" app").trim();
    if KNOWN.iter().any(|(k, _)| app == *k) {
        return Some(TvAct::Open(app.to_string()));
    }
    if core.is_empty() || ["control", "control it", "connect", "connect to", "use"].contains(&core.as_str()) {
        return Some(TvAct::Ready);
    }
    None
}

/// The address to use: the saved one, or one found now (and saved).
pub fn host() -> Option<String> {
    let store = crate::state::try_store()?;
    let saved = store.settings().tv_host.trim().to_string();
    if !saved.is_empty() {
        return Some(saved);
    }
    let found = discover()?;
    let mut s = store.settings();
    s.tv_host = found.clone();
    store.set_settings(s);
    crate::state::settings_changed_elsewhere();
    Some(found)
}

/// Do a TV request. What to say back, or why it couldn't.
pub fn run(said: &str) -> Result<String> {
    let act = parse(said).ok_or_else(|| anyhow!("I can open apps, search, type, change the volume, pause and play, and press the remote's buttons on your TV — try \"open Netflix on the TV\"."))?;
    let host = host().ok_or_else(|| anyhow!("I couldn't find a Roku on your Wi-Fi. Make sure the TV is on and on the same Wi-Fi as this PC."))?;
    eprintln!("[tv] {act:?} on {host}");
    match act {
        TvAct::Open(app) => {
            let (id, name) = find_app(&host, &app).ok_or_else(|| anyhow!("I couldn't find {app} on your TV."))?;
            post(&host, &format!("/launch/{id}"))?;
            Ok(format!("Opening {name} on the TV."))
        }
        TvAct::Search(q) => {
            post(&host, &format!("/search/browse?keyword={}", urlencode(&q)))?;
            Ok(format!("Searching the TV for {q}."))
        }
        TvAct::Type(t) => {
            type_text(&host, &t)?;
            Ok("Typed it.".into())
        }
        TvAct::Key(k, times) => {
            for _ in 0..times {
                key(&host, k)?;
                std::thread::sleep(Duration::from_millis(120));
            }
            Ok(match k {
                "VolumeUp" => "Turning the TV up.",
                "VolumeDown" => "Turning the TV down.",
                "VolumeMute" => "Done.",
                "Play" => "Done.",
                "Home" => "Home screen.",
                _ => "Done.",
            }
            .into())
        }
        TvAct::Ready => {
            let tv = info(&host)?;
            Ok(if tv.allowed {
                format!("Connected to {} — what should I put on?", tv.name)
            } else {
                format!("I can see {}, but it's only allowing limited control. {ALLOW_STEPS}", tv.name)
            })
        }
        TvAct::Power(on) => {
            key(&host, if on { "PowerOn" } else { "PowerOff" })?;
            Ok(if on { "Turning the TV on." } else { "Turning the TV off." }.into())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn understands_tv_requests() {
        assert_eq!(parse("Hey Nova, open Netflix on the TV"), Some(TvAct::Open("netflix".into())));
        assert_eq!(parse("put on youtube on my tv"), Some(TvAct::Open("youtube".into())));
        assert_eq!(parse("turn the TV up"), Some(TvAct::Key("VolumeUp", 4)));
        assert_eq!(parse("make the tv quieter"), Some(TvAct::Key("VolumeDown", 4)));
        assert_eq!(parse("pause the TV"), Some(TvAct::Key("Play", 1)));
        assert_eq!(parse("search the tv for stranger things"), Some(TvAct::Search("stranger things".into())));
        assert_eq!(parse("turn off the tv"), Some(TvAct::Power(false)));
        assert_eq!(parse("tv go home"), Some(TvAct::Key("Home", 1)));
        assert_eq!(parse("mute the tv"), Some(TvAct::Key("VolumeMute", 1)));
        assert_eq!(parse("tv netflix"), Some(TvAct::Open("netflix".into())));
        assert_eq!(parse("play stranger things on netflix on the tv"), Some(TvAct::Search("stranger things".into())));
        assert_eq!(parse("watch youtube on tv"), Some(TvAct::Open("youtube".into())));
        assert_eq!(parse("control my tv"), Some(TvAct::Ready));
        assert_eq!(parse("open netflix"), None);
        assert_eq!(parse("what's on tv tonight in my city"), None);
    }

    #[test]
    fn knows_the_big_apps_without_asking_the_tv() {
        assert_eq!(KNOWN.iter().find(|(k, _)| *k == "netflix").map(|(_, id)| *id), Some("12"));
        assert_eq!(base("192.168.12.7"), "http://192.168.12.7:8060");
        assert_eq!(base("http://192.168.12.7:8060/"), "http://192.168.12.7:8060");
        assert_eq!(urlencode("stranger things"), "stranger%20things");
    }

    /// Run by hand on a network with a Roku: finds it and reads its name.
    #[test]
    #[ignore]
    fn finds_the_roku() {
        let host = discover().expect("a Roku on this network");
        println!("{:?}", info(&host));
    }
}
