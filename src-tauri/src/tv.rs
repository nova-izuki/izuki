//! The TV: "Hey Nova, open Netflix on the TV", "turn the TV up", "search
//! the TV for Stranger Things", "pause the TV". Roku first — its built-in
//! network remote (ECP, port 8060) needs nothing installed on the TV: Izuki
//! finds it on the home Wi-Fi and presses its buttons, opens its apps and
//! types into it. Samsung and LG TVs work the same way through their own
//! built-in remotes (see `tvlink`).
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

/// What each make answers to when asked "who's there?" on the network.
const LOOK_FOR: &[&str] = &["roku:ecp", "urn:samsung.com:device:RemoteControlReceiver:1", "urn:lge-com:service:webos-second-screen:1"];

/// Find a Roku, Samsung or LG TV on the home network (SSDP, ~2 s). Its
/// address, e.g. "192.168.1.7".
pub fn discover() -> Option<String> {
    let sock = UdpSocket::bind("0.0.0.0:0").ok()?;
    sock.set_read_timeout(Some(Duration::from_millis(400))).ok()?;
    for st in LOOK_FOR {
        let ask = format!("M-SEARCH * HTTP/1.1\r\nHost: 239.255.255.250:1900\r\nMan: \"ssdp:discover\"\r\nST: {st}\r\nMX: 2\r\n\r\n");
        let _ = sock.send_to(ask.as_bytes(), "239.255.255.250:1900");
    }
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

/// Which make the TV at this address is — `None` for a Roku. Asked once
/// per address.
pub fn make(host: &str) -> Option<crate::tvlink::Make> {
    static KNOWN_MAKE: parking_lot::Mutex<Option<(String, Option<crate::tvlink::Make>)>> = parking_lot::Mutex::new(None);
    if let Some((h, m)) = KNOWN_MAKE.lock().clone() {
        if h == host {
            return m;
        }
    }
    let roku = client().ok().and_then(|c| c.get(format!("{}/query/device-info", base(host))).timeout(Duration::from_millis(1500)).send().ok()).is_some();
    let m = if roku { None } else { crate::tvlink::identify(host).map(|(m, _)| m) };
    *KNOWN_MAKE.lock() = Some((host.to_string(), m));
    m
}

pub fn info(host: &str) -> Result<TvInfo> {
    if make(host).is_some() {
        return crate::tvlink::identify(host).map(|(_, i)| i).ok_or_else(|| anyhow!("the TV didn't answer"));
    }
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
    let installed = apps(host);
    if let Some((id, name)) = best_app(&installed, wanted) {
        return Some((id, name));
    }
    let w = wanted.to_lowercase();
    KNOWN.iter().find(|(k, _)| w.contains(k) || k.contains(w.as_str())).map(|(k, id)| (id.to_string(), title(k)))
}

/// The installed app a spoken name means — every word matched, in any order
/// and with small mishearings forgiven: "fox live" → "FOX One: Live News,
/// Sports, TV", "netflixx" → "Netflix", "disney" → "Disney Plus".
pub fn best_app(installed: &[(String, String)], wanted: &str) -> Option<(String, String)> {
    // "netflix tv" means Netflix; "youtube tv" means YouTube TV — try with
    // the "tv", then without.
    best_app_words(installed, wanted).or_else(|| {
        let w = wanted.to_lowercase();
        let without = w.trim_end_matches(" tv").trim().to_string();
        (without != w).then(|| best_app_words(installed, &without)).flatten()
    })
}

fn best_app_words(installed: &[(String, String)], wanted: &str) -> Option<(String, String)> {
    let words = |s: &str| -> Vec<String> {
        s.to_lowercase().replace("&amp;", "and").replace('+', " plus").split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).map(str::to_string).collect()
    };
    let want: Vec<String> = words(wanted).into_iter().filter(|w| !["the", "app", "channel", "on", "my"].contains(&w.as_str())).collect();
    if want.is_empty() {
        return None;
    }
    let close = |a: &str, b: &str| a == b || (a.len() >= 4 && b.starts_with(a)) || (a.len() >= 5 && edits(a, b) <= 1) || (a.len() >= 8 && edits(a, b) <= 2);
    let mut best: Option<(f32, &(String, String))> = None;
    for app in installed {
        // TV inputs ("HDMI 1") only when asked for by name.
        if app.0.starts_with("tvinput") && !wanted.to_lowercase().contains("hdmi") && !wanted.to_lowercase().contains("live tv") && !wanted.to_lowercase().contains(" av") {
            continue;
        }
        let have = words(&app.1);
        let hits = want.iter().filter(|w| have.iter().any(|h| close(w, h))).count();
        if hits == 0 {
            continue;
        }
        // All the words said, in fewest extra words, earliest in the name.
        let mut score = hits as f32 / want.len() as f32;
        if have.first().is_some_and(|f| close(&want[0], f)) {
            score += 0.15;
        }
        score -= have.len() as f32 * 0.005;
        if best.is_none_or(|(s, _)| score > s) {
            best = Some((score, app));
        }
    }
    best.filter(|(s, _)| *s >= 0.75).map(|(_, a)| a.clone())
}

/// How many letters differ (insert, delete, change) — for misheard names.
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
    /// "Turn the TV off in 30 minutes" — a sleep timer (minutes).
    SleepIn(u64),
    /// "Play Ice Age 3 (on Disney)": find a film or show, in that app if said.
    Play { title: String, app: Option<String> },
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
    for w in ["hey nova", "hey izuki", "on my tv", "on the tv", "on tv", "the tv", "my tv", "on the television", "the television", "on roku", "the roku", "roku", ","] {
        core = core.replace(w, " ");
    }
    // A bare "tv" at the start ("tv, go home") goes; elsewhere it may be part
    // of an app's name — YouTube TV, Live TV, Apple TV.
    let core = core.trim().strip_prefix("tv ").map(str::to_string).unwrap_or(core);
    let core = if core.trim() == "tv" { String::new() } else { core };
    let core = core.split_whitespace().filter(|w| !["please", "can", "you", "could", "for", "me"].contains(w)).collect::<Vec<_>>().join(" ");
    let words: Vec<&str> = core.split_whitespace().collect();
    let has = |k: &str| core == k || core.starts_with(&format!("{k} ")) || core.contains(&format!(" {k}")) || core.ends_with(k);

    if has("turn off") || has("switch off") || core == "off" || has("power off") || has("sleep") {
        // "turn off the TV in 30 minutes", "TV sleep timer 1 hour".
        if core.contains("half an hour") {
            return Some(TvAct::SleepIn(30));
        }
        let words: Vec<&str> = core.split_whitespace().collect();
        for (i, w) in words.iter().enumerate() {
            if let Ok(n) = w.parse::<u64>() {
                let unit = words.get(i + 1).copied().unwrap_or("");
                if unit.starts_with("hour") {
                    return Some(TvAct::SleepIn(n * 60));
                }
                if unit.starts_with("min") {
                    return Some(TvAct::SleepIn(n));
                }
            }
        }
        if core.contains("an hour") {
            return Some(TvAct::SleepIn(60));
        }
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
    if has("pause") && !has("unpause") {
        return Some(TvAct::Key("Pause", 1));
    }
    if has("play") && words.len() == 1 || has("resume") || has("unpause") {
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
                // "play ice age 3 on disney" → that app straight away.
                if let Some((title, app)) = what.rsplit_once(" on ") {
                    return Some(TvAct::Play { title: title.trim().to_string(), app: Some(app.trim().to_string()) });
                }
                return Some(TvAct::Play { title: what.to_string(), app: None });
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
    let app = if KNOWN.iter().any(|(k, _)| app == *k) { app } else { app.trim_end_matches(" tv").trim() };
    if KNOWN.iter().any(|(k, _)| app == *k) {
        return Some(TvAct::Open(app.to_string()));
    }
    if core.is_empty() || ["control", "control it", "connect", "connect to", "use"].contains(&core.as_str()) {
        return Some(TvAct::Ready);
    }
    None
}

/// Is Izuki's own channel the one open on the TV? (A side-loaded channel
/// is "dev".) Checked at most every 8 s — it's asked on every orb change.
fn izuki_open(host: &str) -> bool {
    static SEEN: parking_lot::Mutex<Option<(bool, Instant)>> = parking_lot::Mutex::new(None);
    if let Some((open, at)) = *SEEN.lock() {
        if at.elapsed() < Duration::from_secs(8) {
            return open;
        }
    }
    let open = client()
        .and_then(|c| Ok(c.get(format!("{}/query/active-app", base(host))).send()?.text()?))
        .map(|xml| xml.contains("<app id=\"dev\"") || xml.contains(">Izuki<"))
        .unwrap_or(false);
    *SEEN.lock() = Some((open, Instant::now()));
    open
}

/// Show Izuki's state and words on the TV — only when the Izuki channel is
/// the one open, so it never interrupts a film. Quietly does nothing else.
pub fn show(state: &str, text: Option<&str>) -> bool {
    // Linked Izuki TV apps follow along too (link.rs).
    crate::link::publish(state, text);
    let Some(store) = crate::state::try_store() else { return false };
    let settings = store.settings();
    let host = settings.tv_host.trim().to_string();
    if host.is_empty() || make(&host).is_some() || !izuki_open(&host) {
        return false;
    }
    let look = tv_look(&settings);
    let mut path = format!("/input?state={}&look={}", urlencode(state), urlencode(&look));
    let mut speaks = false;
    if let Some(t) = text {
        let t: String = t.chars().take(400).collect();
        path.push_str(&format!("&text={}", urlencode(&t)));
        // Said from the TV's own speakers, in Izuki's voice.
        if settings.tv_voice {
            if let Some(url) = crate::link::audio_url(&t) {
                path.push_str(&format!("&audio={}", urlencode(&url)));
                speaks = true;
            }
        }
    }
    let _ = post(&host, &path);
    speaks
}

/// The TV orb's colours: its own pick, or the PC's.
fn tv_look(s: &crate::settings::Settings) -> String {
    let style = if s.tv_orb.trim().is_empty() { s.orb_style.trim() } else { s.tv_orb.trim() };
    style.to_string()
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

// ---- the smart part: loose requests, worked out with the AI -----------------
//
// "Put on something funny for the kids", "a dinosaur cartoon", "what's good
// tonight?", "continue my show" — not commands, so the AI picks a title and
// one of the apps actually installed on this TV. When it's on more than one,
// Izuki asks which, and "Disney" (no "TV" needed) plays it there.

/// A choice Izuki asked about: (title, apps, when asked).
static CHOICE: parking_lot::Mutex<Option<(String, Vec<String>, Instant)>> = parking_lot::Mutex::new(None);

/// A loose wish rather than a title ("something funny", "a cartoon for the kids").
fn vague(title: &str) -> bool {
    let t = title.to_lowercase();
    ["something", "anything", "a movie", "a film", "a show", "cartoon", "for the kids", "for kids", "funny", "scary", "good", "new", "popular", "like ", "with ", "about "]
        .iter()
        .any(|w| t.contains(w))
}

/// The answer to "which app?", if one is waiting — "Disney", "the first one", "Prime".
pub fn answer_choice(said: &str) -> Option<String> {
    let (title, choices, at) = CHOICE.lock().clone()?;
    if at.elapsed() > Duration::from_secs(150) {
        return None;
    }
    let s = said.to_lowercase();
    let ordinal = [("first", 0usize), ("1st", 0), ("one", 0), ("second", 1), ("2nd", 1), ("third", 2), ("3rd", 2), ("last", choices.len().saturating_sub(1))];
    let picked = choices
        .iter()
        .find(|c| best_app(&[(String::new(), (*c).clone())], &s).is_some())
        .cloned()
        .or_else(|| ordinal.iter().find(|(w, _)| s.split_whitespace().any(|x| x == *w)).and_then(|(_, i)| choices.get(*i).cloned()))?;
    *CHOICE.lock() = None;
    Some(run(&format!("play {title} on {picked} on the tv")).unwrap_or_else(|e| e.to_string()))
}

/// Ask the AI what to put on, given the apps on this TV; then do it.
fn smart(host: &str, said: &str) -> Result<String> {
    let installed: Vec<String> = apps(host).into_iter().filter(|(id, _)| !id.starts_with("tvinput") && id != "dev").map(|(_, n)| n.replace("&amp;", "&")).collect();
    if installed.is_empty() {
        return Err(anyhow!("I can't see which apps are on your TV right now. {ALLOW_STEPS}"));
    }
    let prompt = format!(
        "You help the user watch things on their TV. The apps installed on it: {}.\n\
         They said: \"{said}\".\n\
         Pick something real that fits (a specific film or show title) and one installed app that has it — if you're not sure which app, \
         list the likely installed apps as choices. Kids → kid-safe. If they only want an app, just open it. If they ask for ideas, answer.\n\
         Reply with ONLY JSON: {{\"kind\": \"play|open|choose|answer\", \"say\": \"one short friendly spoken line\", \
         \"title\": \"exact title or empty\", \"app\": \"one installed app name or empty\", \"choices\": [\"installed app\", ...]}}",
        installed.join(", ")
    );
    let reply = crate::chat::complete(&[
        serde_json::json!({ "role": "system", "content": "You are Izuki, a friendly TV companion. JSON only." }),
        serde_json::json!({ "role": "user", "content": prompt }),
    ])?;
    let v: serde_json::Value = reply
        .find('{')
        .and_then(|a| reply.rfind('}').map(|b| &reply[a..=b]))
        .and_then(|j| serde_json::from_str(j).ok())
        .ok_or_else(|| anyhow!("I wasn't sure what to put on — try naming a show or an app."))?;
    let get = |k: &str| v[k].as_str().unwrap_or("").trim().to_string();
    let (kind, say, title, app) = (get("kind"), get("say"), get("title"), get("app"));
    let choices: Vec<String> = v["choices"].as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(str::to_string)).collect()).unwrap_or_default();
    let all: Vec<(String, String)> = apps(host);
    match kind.as_str() {
        "open" if !app.is_empty() => {
            let (id, name) = best_app(&all, &app).ok_or_else(|| anyhow!("I couldn't find {app} on your TV."))?;
            post(host, &format!("/launch/{id}"))?;
            Ok(if say.is_empty() { format!("Opening {name}.") } else { say })
        }
        "play" if !title.is_empty() && !app.is_empty() => {
            if let Some((id, _)) = best_app(&all, &app) {
                post(host, &format!("/search/browse?keyword={}&provider-id={id}&launch=true&match-any=true", urlencode(&title)))?;
            } else {
                post(host, &format!("/search/browse?keyword={}&match-any=true", urlencode(&title)))?;
            }
            Ok(if say.is_empty() { format!("Putting on {title}.") } else { say })
        }
        "choose" | "play" if !title.is_empty() => {
            post(host, &format!("/search/browse?keyword={}&match-any=true", urlencode(&title)))?;
            let real: Vec<String> = choices.iter().filter_map(|c| best_app(&all, c).map(|(_, n)| n.replace("&amp;", "&"))).take(4).collect();
            if real.len() >= 2 {
                *CHOICE.lock() = Some((title.clone(), real.clone(), Instant::now()));
                let list = format!("{} or {}", real[..real.len() - 1].join(", "), real[real.len() - 1]);
                return Ok(format!("{} It's on {list} — which one?", if say.is_empty() { format!("{title} it is.") } else { say }));
            }
            Ok(if say.is_empty() { format!("Here's {title} — pick where to watch it.") } else { say })
        }
        _ => Ok(if say.is_empty() { "I'm not sure what to put on — name a show or an app?".into() } else { say }),
    }
}

/// Do a TV request. What to say back, or why it couldn't.
pub fn run(said: &str) -> Result<String> {
    let Some(act) = parse(said) else {
        // Not a quick command: on a Roku, let the AI work it out.
        let host = host().ok_or_else(|| anyhow!("I couldn't find a TV on your Wi-Fi."))?;
        if make(&host).is_none() {
            return smart(&host, said);
        }
        return Err(anyhow!("I can open apps, search, type, change the volume, pause and play, and press the remote's buttons on your TV — try \"open Netflix on the TV\"."));
    };
    if let TvAct::Play { title, app: None } = &act {
        if vague(title) {
            if let Some(host) = host() {
                if make(&host).is_none() {
                    return smart(&host, said);
                }
            }
        }
    }
    // An Izuki TV app linked to this PC (Android TV / Google TV / Fire TV)
    // and no other TV set up: the job goes to it, and it does it on the TV.
    if let Some(store) = crate::state::try_store() {
        let s = store.settings();
        if s.tv_host.trim().is_empty() && crate::link::running() && s.linked_devices.iter().any(|d| d.kind == "tv") {
            crate::link::publish("tvdo", Some(said));
            return Ok("On it — doing that on your TV.".into());
        }
    }
    // A sleep timer: wait, then switch off whichever TV this is.
    if let TvAct::SleepIn(m) = act {
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_secs(m * 60));
            let _ = run("turn off the tv");
            eprintln!("[tv] sleep timer done after {m} min");
        });
        return Ok(format!("Okay — I'll turn the TV off in {m} minutes."));
    }
    let host = host().ok_or_else(|| anyhow!("I couldn't find a TV on your Wi-Fi. Make sure the TV is on and on the same Wi-Fi as this PC (Roku, Samsung and LG work)."))?;
    eprintln!("[tv] {act:?} on {host}");
    if let Some(m) = make(&host) {
        return crate::tvlink::run(m, &host, act);
    }
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
        TvAct::Play { title, app } => {
            // Roku's own search knows which apps have it. Said with an app:
            // straight into that app, playing.
            if let Some(a) = app {
                if let Some((id, name)) = find_app(&host, &a) {
                    post(&host, &format!("/search/browse?keyword={}&provider-id={id}&launch=true&match-any=true", urlencode(&title)))?;
                    return Ok(format!("Putting on {title} in {name}."));
                }
            }
            post(&host, &format!("/search/browse?keyword={}&match-any=true", urlencode(&title)))?;
            Ok(format!("Here's {title} — the TV's showing which apps have it. Tell me which one, like “play {title} on Disney Plus”, or pick it with the remote."))
        }
        TvAct::Type(t) => {
            type_text(&host, &t)?;
            Ok("Typed it.".into())
        }
        TvAct::Key(k, times) => {
            // Roku's one Play button pauses too.
            let k = if k == "Pause" { "Play" } else { k };
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
        // Handled at the top of run.
        TvAct::SleepIn(_) => Ok("Okay.".into()),
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
        assert_eq!(parse("pause the TV"), Some(TvAct::Key("Pause", 1)));
        assert_eq!(parse("resume the TV"), Some(TvAct::Key("Play", 1)));
        assert_eq!(parse("search the tv for stranger things"), Some(TvAct::Search("stranger things".into())));
        assert_eq!(parse("turn off the tv"), Some(TvAct::Power(false)));
        assert_eq!(parse("turn off the tv in 30 minutes"), Some(TvAct::SleepIn(30)));
        assert_eq!(parse("tv sleep timer 1 hour"), Some(TvAct::SleepIn(60)));
        assert_eq!(parse("tv go home"), Some(TvAct::Key("Home", 1)));
        assert_eq!(parse("mute the tv"), Some(TvAct::Key("VolumeMute", 1)));
        assert_eq!(parse("tv netflix"), Some(TvAct::Open("netflix".into())));
        assert_eq!(parse("play stranger things on netflix on the tv"), Some(TvAct::Play { title: "stranger things".into(), app: Some("netflix".into()) }));
        assert_eq!(parse("play ice age 3 on the tv"), Some(TvAct::Play { title: "ice age 3".into(), app: None }));
        let installed = vec![
            ("808732".to_string(), "FOX One: Live News, Sports, TV".to_string()),
            ("12".to_string(), "Netflix".to_string()),
            ("291097".to_string(), "Disney Plus".to_string()),
            ("tvinput.dtv".to_string(), "Live TV".to_string()),
            ("837".to_string(), "YouTube".to_string()),
            ("195316".to_string(), "YouTube TV".to_string()),
        ];
        assert_eq!(best_app(&installed, "fox live").map(|a| a.0), Some("808732".into()));
        assert_eq!(best_app(&installed, "netflixx").map(|a| a.0), Some("12".into()));
        assert_eq!(best_app(&installed, "disney+").map(|a| a.0), Some("291097".into()));
        assert_eq!(best_app(&installed, "youtube").map(|a| a.0), Some("837".into()));
        assert_eq!(best_app(&installed, "youtube tv").map(|a| a.0), Some("195316".into()));
        assert_eq!(best_app(&installed, "live tv").map(|a| a.0), Some("tvinput.dtv".into()));
        assert_eq!(best_app(&installed, "spotify"), None);
        assert!(vague("something funny for the kids"));
        assert!(vague("a dinosaur cartoon"));
        assert!(!vague("ice age 3"));
        assert_eq!(best_app(&installed, "netflix tv").map(|a| a.0), Some("12".into()));
        assert_eq!(parse("open youtube tv"), Some(TvAct::Open("youtube tv".into())));
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
