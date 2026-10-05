//! Samsung and LG TVs — the two biggest makers after Roku. Both have a
//! remote built into the TV that listens on the home Wi-Fi (Samsung's on
//! port 8001/8002, LG webOS's on 3000/3001), so like Roku there's nothing to
//! install: the first time, the TV asks "Allow Izuki?" on screen; after
//! that it remembers (the pass it hands back is kept in `tv_pair`).
//!
//! Both answer with self-made certificates, so the secure connection here
//! takes the TV's word for who it is — it only ever talks to the address of
//! the TV on your own network.

use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Result};
use base64::Engine;
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio_tungstenite::tungstenite::Message;

use crate::tv::{TvAct, TvInfo};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Make {
    Samsung,
    Lg,
}

/// "Press Allow" — what to say when the TV is still waiting for it.
const ALLOW: &str = "Your TV is asking whether to let Izuki in — pick Allow with the TV remote, then ask me again.";

// ---- which TV is it -------------------------------------------------------

/// Samsung answers a plain web request about itself; LG has its remote port open.
pub fn identify(host: &str) -> Option<(Make, TvInfo)> {
    let h = bare(host);
    let c = reqwest::blocking::Client::builder().timeout(Duration::from_millis(1500)).build().ok()?;
    if let Ok(r) = c.get(format!("http://{h}:8001/api/v2/")).send() {
        if let Ok(v) = r.json::<Value>() {
            let d = &v["device"];
            let name = d["name"].as_str().or(v["name"].as_str()).unwrap_or("Samsung TV").to_string();
            let on = d["PowerState"].as_str().is_none_or(|p| p.eq_ignore_ascii_case("on"));
            return Some((Make::Samsung, TvInfo { host: h.clone(), name, on, allowed: true }));
        }
    }
    for port in [3001u16, 3000] {
        let addr = format!("{h}:{port}");
        let Ok(mut addrs) = std::net::ToSocketAddrs::to_socket_addrs(&addr) else { continue };
        if let Some(a) = addrs.next() {
            if std::net::TcpStream::connect_timeout(&a, Duration::from_millis(800)).is_ok() {
                return Some((Make::Lg, TvInfo { host: h.clone(), name: "LG TV".into(), on: true, allowed: true }));
            }
        }
    }
    None
}

fn bare(host: &str) -> String {
    let h = host.trim().trim_start_matches("http://").trim_start_matches("https://");
    h.split(['/', ':']).next().unwrap_or(h).to_string()
}

// ---- doing it ---------------------------------------------------------------

/// Carry out a TV request on a Samsung or LG. What to say back.
pub fn run(make: Make, host: &str, act: TvAct) -> Result<String> {
    let host = bare(host);
    let rt = tokio::runtime::Builder::new_current_thread().enable_all().build()?;
    rt.block_on(async {
        match make {
            Make::Samsung => samsung(&host, act).await,
            Make::Lg => lg(&host, act).await,
        }
    })
}

fn pass() -> String {
    crate::state::try_store().map(|s| s.settings().tv_pair).unwrap_or_default()
}

fn keep_pass(p: &str) {
    let Some(store) = crate::state::try_store() else { return };
    let mut s = store.settings();
    if s.tv_pair != p {
        s.tv_pair = p.to_string();
        store.set_settings(s);
        crate::state::settings_changed_elsewhere();
    }
}

type Ws = tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>;

async fn open(url: &str) -> Result<Ws> {
    let connector = tokio_tungstenite::Connector::Rustls(Arc::new(trusting_tls()?));
    let go = tokio_tungstenite::connect_async_tls_with_config(url, None, false, Some(connector));
    let (ws, _) = tokio::time::timeout(Duration::from_secs(5), go).await.map_err(|_| anyhow!("the TV didn't answer"))??;
    Ok(ws)
}

/// Read until `pick` finds what it wants (or the time runs out).
async fn wait_for<T>(ws: &mut Ws, secs: u64, mut pick: impl FnMut(&Value) -> Option<Result<T>>) -> Result<T> {
    let until = tokio::time::Instant::now() + Duration::from_secs(secs);
    loop {
        let left = until.saturating_duration_since(tokio::time::Instant::now());
        let msg = tokio::time::timeout(left, ws.next()).await.map_err(|_| anyhow!(ALLOW))?;
        let Some(msg) = msg else { return Err(anyhow!("the TV hung up")) };
        if let Message::Text(t) = msg? {
            if let Ok(v) = serde_json::from_str::<Value>(&t) {
                if let Some(r) = pick(&v) {
                    return r;
                }
            }
        }
    }
}

// ---- Samsung ------------------------------------------------------------------

/// Samsung's names for the remote's buttons, from the Roku names `tv::parse` uses.
fn samsung_key(k: &str) -> &'static str {
    match k {
        "VolumeUp" => "KEY_VOLUP",
        "VolumeDown" => "KEY_VOLDOWN",
        "VolumeMute" => "KEY_MUTE",
        "Play" => "KEY_PLAY",
        "Pause" => "KEY_PAUSE",
        "Fwd" => "KEY_FF",
        "Rev" => "KEY_REWIND",
        "Home" => "KEY_HOME",
        "Back" => "KEY_RETURN",
        "Up" => "KEY_UP",
        "Down" => "KEY_DOWN",
        "Left" => "KEY_LEFT",
        "Right" => "KEY_RIGHT",
        _ => "KEY_ENTER",
    }
}

async fn samsung(host: &str, act: TvAct) -> Result<String> {
    let name = base64::engine::general_purpose::STANDARD.encode("Izuki");
    let token = pass();
    let secure = format!("wss://{host}:8002/api/v2/channels/samsung.remote.control?name={name}&token={token}");
    let plain = format!("ws://{host}:8001/api/v2/channels/samsung.remote.control?name={name}");
    let mut ws = match open(&secure).await {
        Ok(ws) => ws,
        Err(_) => open(&plain).await?,
    };
    // Connected once the TV says so — the first time, after Allow is pressed.
    wait_for(&mut ws, 30, |v| match v["event"].as_str() {
        Some("ms.channel.connect") => {
            if let Some(t) = v["data"]["token"].as_str() {
                keep_pass(t);
            }
            Some(Ok(()))
        }
        Some("ms.channel.unauthorized") | Some("ms.channel.timeOut") => Some(Err(anyhow!(ALLOW))),
        _ => None,
    })
    .await?;

    let press = |k: &str| json!({"method": "ms.remote.control", "params": {"Cmd": "Click", "DataOfCmd": k, "Option": "false", "TypeOfRemote": "SendRemoteKey"}}).to_string();
    let reply = match act {
        TvAct::Key(k, times) => {
            for _ in 0..times {
                ws.send(Message::text(press(samsung_key(k)))).await?;
                tokio::time::sleep(Duration::from_millis(150)).await;
            }
            said_for(k)
        }
        TvAct::Power(false) => {
            ws.send(Message::text(press("KEY_POWER"))).await?;
            "Turning the TV off.".into()
        }
        TvAct::Power(true) => "It's already listening, so it's on — if the screen's dark, press power on the remote once.".into(),
        TvAct::Type(t) => {
            let text = base64::engine::general_purpose::STANDARD.encode(&t);
            ws.send(Message::text(json!({"method": "ms.remote.control", "params": {"Cmd": text, "DataOfCmd": "base64", "TypeOfRemote": "SendInputString"}}).to_string())).await?;
            "Typed it.".into()
        }
        TvAct::Search(q) => format!("Open the search in the app on your TV, then say \"type {q} on the TV\" and I'll fill it in."),
        TvAct::Ready => "Connected to your Samsung TV — what should I put on?".into(),
        // Handled in tv::run before it gets here.
        TvAct::SleepIn(_) => "Okay.".into(),
        TvAct::Open(app) => {
            ws.send(Message::text(json!({"method": "ms.channel.emit", "params": {"event": "ed.installedApp.get", "to": "host"}}).to_string())).await?;
            let listed: Vec<(String, String)> = wait_for(&mut ws, 4, |v| {
                (v["event"].as_str() == Some("ed.installedApp.get")).then(|| {
                    Ok(v["data"]["data"].as_array().map(|a| a.iter().filter_map(|x| Some((x["appId"].as_str()?.to_string(), x["name"].as_str()?.to_string()))).collect()).unwrap_or_default())
                })
            })
            .await
            .unwrap_or_default();
            let (id, title) = pick_app(&listed, &app, SAMSUNG_APPS).ok_or_else(|| anyhow!("I couldn't find {app} on your TV."))?;
            ws.send(Message::text(json!({"method": "ms.channel.emit", "params": {"event": "ed.apps.launch", "to": "host", "data": {"appId": id, "action_type": "DEEP_LINK"}}}).to_string())).await?;
            // Older sets only take the plain web request.
            let _ = reqwest::Client::new().post(format!("http://{host}:8001/api/v2/applications/{id}")).timeout(Duration::from_secs(3)).send().await;
            format!("Opening {title} on the TV.")
        }
    };
    let _ = ws.close(None).await;
    Ok(reply)
}

const SAMSUNG_APPS: &[(&str, &str)] = &[
    ("netflix", "3201907018807"), ("youtube", "111299001912"), ("prime video", "3201910019365"), ("amazon prime", "3201910019365"),
    ("prime", "3201910019365"), ("disney", "3201901017640"), ("spotify", "3201606009684"), ("apple tv", "3201807016597"),
    ("hulu", "3201601007625"), ("plex", "3201512006963"), ("max", "3202301029760"), ("hbo", "3202301029760"),
    ("tubi", "3201504001965"), ("twitch", "3202203026841"), ("pluto", "3201808016802"), ("paramount", "3201710015037"),
];

// ---- LG webOS ------------------------------------------------------------------

/// What Izuki asks the TV to be allowed to do.
fn lg_hello(key: &str) -> Value {
    let mut p = json!({
        "forcePairing": false,
        "pairingType": "PROMPT",
        "manifest": {
            "manifestVersion": 1,
            "appVersion": "1.0",
            "appId": "app.izuki.companion",
            "vendorId": "izuki",
            "localizedAppNames": {"": "Izuki"},
            "permissions": [
                "LAUNCH", "LAUNCH_WEBAPP", "APP_TO_APP", "CONTROL_AUDIO", "CONTROL_DISPLAY", "CONTROL_INPUT_JOYSTICK",
                "CONTROL_INPUT_MEDIA_PLAYBACK", "CONTROL_INPUT_TEXT", "CONTROL_MOUSE_AND_KEYBOARD", "CONTROL_POWER",
                "READ_APP_STATUS", "READ_INSTALLED_APPS", "READ_RUNNING_APPS", "READ_CURRENT_CHANNEL", "READ_INPUT_DEVICE_LIST",
                "READ_POWER_STATE", "READ_TV_CURRENT_TIME", "WRITE_NOTIFICATION_TOAST"
            ]
        }
    });
    if !key.is_empty() {
        p["client-key"] = json!(key);
    }
    json!({"type": "register", "id": "hello", "payload": p})
}

async fn lg_ask(ws: &mut Ws, n: &mut u32, uri: &str, payload: Value) -> Result<Value> {
    *n += 1;
    let id = format!("q{n}");
    ws.send(Message::text(json!({"type": "request", "id": id, "uri": uri, "payload": payload}).to_string())).await?;
    wait_for(ws, 5, |v| (v["id"].as_str() == Some(id.as_str())).then(|| Ok(v["payload"].clone()))).await
}

/// The arrow/home/back buttons go through a second little connection.
async fn lg_buttons(ws: &mut Ws, n: &mut u32, name: &str, times: u32) -> Result<()> {
    let r = lg_ask(ws, n, "ssap://com.webos.service.networkinput/getPointerInputSocket", json!({})).await?;
    let path = r["socketPath"].as_str().ok_or_else(|| anyhow!("the TV didn't open its buttons"))?;
    let mut pad = open(path).await?;
    for _ in 0..times {
        pad.send(Message::text(format!("type:button\nname:{name}\n\n"))).await?;
        tokio::time::sleep(Duration::from_millis(150)).await;
    }
    let _ = pad.close(None).await;
    Ok(())
}

async fn lg(host: &str, act: TvAct) -> Result<String> {
    let mut ws = match open(&format!("wss://{host}:3001")).await {
        Ok(ws) => ws,
        Err(_) => open(&format!("ws://{host}:3000")).await?,
    };
    ws.send(Message::text(lg_hello(&pass()).to_string())).await?;
    wait_for(&mut ws, 30, |v| match v["type"].as_str() {
        Some("registered") => {
            if let Some(k) = v["payload"]["client-key"].as_str() {
                keep_pass(k);
            }
            Some(Ok(()))
        }
        Some("error") => Some(Err(anyhow!(ALLOW))),
        _ => None,
    })
    .await?;

    let mut n = 0u32;
    let reply = match act {
        TvAct::Key(k, times) => {
            match k {
                "VolumeUp" | "VolumeDown" => {
                    let uri = if k == "VolumeUp" { "ssap://audio/volumeUp" } else { "ssap://audio/volumeDown" };
                    for _ in 0..times {
                        lg_ask(&mut ws, &mut n, uri, json!({})).await?;
                    }
                }
                "VolumeMute" => {
                    let now = lg_ask(&mut ws, &mut n, "ssap://audio/getStatus", json!({})).await.unwrap_or_default();
                    let muted = now["mute"].as_bool().unwrap_or(false);
                    lg_ask(&mut ws, &mut n, "ssap://audio/setMute", json!({"mute": !muted})).await?;
                }
                "Play" | "Pause" | "Fwd" | "Rev" => {
                    let what = match k { "Play" => "play", "Pause" => "pause", "Fwd" => "fastForward", _ => "rewind" };
                    lg_ask(&mut ws, &mut n, &format!("ssap://media.controls/{what}"), json!({})).await?;
                }
                other => {
                    let name = match other { "Home" => "HOME", "Back" => "BACK", "Up" => "UP", "Down" => "DOWN", "Left" => "LEFT", "Right" => "RIGHT", _ => "ENTER" };
                    lg_buttons(&mut ws, &mut n, name, times).await?;
                }
            }
            said_for(k)
        }
        TvAct::Power(false) => {
            lg_ask(&mut ws, &mut n, "ssap://system/turnOff", json!({})).await?;
            "Turning the TV off.".into()
        }
        TvAct::Power(true) => "It's already listening, so it's on — if the screen's dark, press power on the remote once.".into(),
        TvAct::Type(t) => {
            lg_ask(&mut ws, &mut n, "ssap://com.webos.service.ime/insertText", json!({"text": t, "replace": 0})).await?;
            "Typed it.".into()
        }
        TvAct::Search(q) => format!("Open the search in the app on your TV, then say \"type {q} on the TV\" and I'll fill it in."),
        TvAct::Ready => "Connected to your LG TV — what should I put on?".into(),
        // Handled in tv::run before it gets here.
        TvAct::SleepIn(_) => "Okay.".into(),
        TvAct::Open(app) => {
            let r = lg_ask(&mut ws, &mut n, "ssap://com.webos.applicationManager/listLaunchPoints", json!({})).await.unwrap_or_default();
            let listed: Vec<(String, String)> = r["launchPoints"]
                .as_array()
                .map(|a| a.iter().filter_map(|x| Some((x["id"].as_str()?.to_string(), x["title"].as_str()?.to_string()))).collect())
                .unwrap_or_default();
            let (id, title) = pick_app(&listed, &app, LG_APPS).ok_or_else(|| anyhow!("I couldn't find {app} on your TV."))?;
            lg_ask(&mut ws, &mut n, "ssap://system.launcher/launch", json!({"id": id})).await?;
            format!("Opening {title} on the TV.")
        }
    };
    let _ = ws.close(None).await;
    Ok(reply)
}

const LG_APPS: &[(&str, &str)] = &[
    ("netflix", "netflix"), ("youtube", "youtube.leanback.v4"), ("prime video", "amazon"), ("amazon prime", "amazon"), ("prime", "amazon"),
    ("disney", "com.disney.disneyplus-prod"), ("spotify", "spotify-beehive"), ("apple tv", "com.apple.appletv"), ("hulu", "hulu"),
    ("plex", "cdp-30"), ("max", "com.wbd.stream"), ("hbo", "com.wbd.stream"), ("live tv", "com.webos.app.livetv"),
    ("browser", "com.webos.app.browser"), ("web browser", "com.webos.app.browser"),
];

// ---- shared ---------------------------------------------------------------------

/// The TV's own list first (by name), then the well-known ids.
fn pick_app(listed: &[(String, String)], wanted: &str, known: &[(&str, &str)]) -> Option<(String, String)> {
    let w = wanted.to_lowercase();
    if let Some((id, name)) = listed
        .iter()
        .find(|(_, n)| n.to_lowercase() == w)
        .or_else(|| listed.iter().find(|(_, n)| n.to_lowercase().contains(&w)))
    {
        return Some((id.clone(), name.clone()));
    }
    known
        .iter()
        .find(|(k, _)| w.contains(k) || k.contains(w.as_str()))
        .map(|(k, id)| (id.to_string(), k.split(' ').map(|p| p[..1].to_uppercase() + &p[1..]).collect::<Vec<_>>().join(" ")))
}

fn said_for(k: &str) -> String {
    match k {
        "VolumeUp" => "Turning the TV up.",
        "VolumeDown" => "Turning the TV down.",
        "Home" => "Home screen.",
        _ => "Done.",
    }
    .into()
}

/// A secure connection that accepts the TV's home-made certificate.
fn trusting_tls() -> Result<rustls::ClientConfig> {
    use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
    use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
    use rustls::{DigitallySignedStruct, SignatureScheme};

    #[derive(Debug)]
    struct TakeItsWord(Arc<rustls::crypto::CryptoProvider>);
    impl ServerCertVerifier for TakeItsWord {
        fn verify_server_cert(&self, _: &CertificateDer<'_>, _: &[CertificateDer<'_>], _: &ServerName<'_>, _: &[u8], _: UnixTime) -> Result<ServerCertVerified, rustls::Error> {
            Ok(ServerCertVerified::assertion())
        }
        fn verify_tls12_signature(&self, m: &[u8], c: &CertificateDer<'_>, d: &DigitallySignedStruct) -> Result<HandshakeSignatureValid, rustls::Error> {
            rustls::crypto::verify_tls12_signature(m, c, d, &self.0.signature_verification_algorithms)
        }
        fn verify_tls13_signature(&self, m: &[u8], c: &CertificateDer<'_>, d: &DigitallySignedStruct) -> Result<HandshakeSignatureValid, rustls::Error> {
            rustls::crypto::verify_tls13_signature(m, c, d, &self.0.signature_verification_algorithms)
        }
        fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
            self.0.signature_verification_algorithms.supported_schemes()
        }
    }

    let provider = rustls::crypto::CryptoProvider::get_default().cloned().unwrap_or_else(|| Arc::new(rustls::crypto::aws_lc_rs::default_provider()));
    Ok(rustls::ClientConfig::builder_with_provider(provider.clone())
        .with_safe_default_protocol_versions()?
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(TakeItsWord(provider)))
        .with_no_client_auth())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_apps_by_the_tvs_own_names_then_known_ids() {
        let listed = vec![("abc".to_string(), "Netflix".to_string()), ("yt".to_string(), "YouTube".to_string())];
        assert_eq!(pick_app(&listed, "netflix", SAMSUNG_APPS), Some(("abc".into(), "Netflix".into())));
        assert_eq!(pick_app(&[], "disney", SAMSUNG_APPS).map(|a| a.0), Some("3201901017640".into()));
        assert_eq!(pick_app(&[], "spotify", LG_APPS), Some(("spotify-beehive".into(), "Spotify".into())));
        assert_eq!(pick_app(&[], "something odd", LG_APPS), None);
    }

    #[test]
    fn speaks_each_makers_button_names() {
        assert_eq!(samsung_key("VolumeUp"), "KEY_VOLUP");
        assert_eq!(samsung_key("Back"), "KEY_RETURN");
        assert_eq!(bare("http://192.168.1.4:8001/x"), "192.168.1.4");
        assert_eq!(lg_hello("")["payload"].get("client-key"), None);
        assert_eq!(lg_hello("k1")["payload"]["client-key"], "k1");
    }

    #[test]
    fn the_tls_setup_builds() {
        assert!(trusting_tls().is_ok());
    }
}
