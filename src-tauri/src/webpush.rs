//! Real notifications on the phone, even with the Izuki page closed: the
//! standard Web Push (RFC 8030 delivery, RFC 8291 encryption, RFC 8292
//! VAPID) — what Chrome, Edge, Firefox and an iPhone's home-screen app use.
//!
//! - This PC has its own signing key, made once and kept in
//!   `%APPDATA%\Izuki\vapid.key` (never in settings, never sent anywhere).
//! - A paired phone that switched notifications on gives its subscription
//!   (the push service's address for it, plus its encryption keys);
//!   they're kept in `%APPDATA%\Izuki\push.json`.
//! - A message is encrypted for that phone only — the push service (Google,
//!   Mozilla, Apple) carries it but can't read it.
//! - A subscription the push service says is gone (404/410) is dropped.
//!
//! Uses `ring` (already in the build for HTTPS), nothing new.

use std::path::PathBuf;

use anyhow::{anyhow, Result};
use base64::engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD};
use base64::Engine;
use parking_lot::Mutex;
use ring::rand::SystemRandom;
use ring::signature::{EcdsaKeyPair, KeyPair, ECDSA_P256_SHA256_FIXED_SIGNING};
use serde::{Deserialize, Serialize};
use serde_json::json;

/// One phone's subscription.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Sub {
    /// Which paired phone it is.
    pub device: String,
    pub endpoint: String,
    /// The phone's public key (base64url, 65 bytes uncompressed P-256).
    pub p256dh: String,
    /// The phone's auth secret (base64url, 16 bytes).
    pub auth: String,
}

fn dir() -> PathBuf {
    crate::store::data_dir()
}

static LOCK: Mutex<()> = Mutex::new(());

/// This PC's VAPID key (PKCS#8), made the first time it's needed.
fn key() -> Result<EcdsaKeyPair> {
    let _g = LOCK.lock();
    let path = dir().join("vapid.key");
    let rng = SystemRandom::new();
    let pkcs8 = match std::fs::read_to_string(&path).ok().and_then(|s| STANDARD.decode(s.trim()).ok()) {
        Some(bytes) => bytes,
        None => {
            let doc = EcdsaKeyPair::generate_pkcs8(&ECDSA_P256_SHA256_FIXED_SIGNING, &rng).map_err(|_| anyhow!("couldn't make a push key"))?;
            std::fs::create_dir_all(dir())?;
            std::fs::write(&path, STANDARD.encode(doc.as_ref()))?;
            doc.as_ref().to_vec()
        }
    };
    EcdsaKeyPair::from_pkcs8(&ECDSA_P256_SHA256_FIXED_SIGNING, &pkcs8, &rng).map_err(|_| anyhow!("the push key is damaged"))
}

/// The public key a phone subscribes with (base64url).
pub fn public_key() -> Result<String> {
    Ok(URL_SAFE_NO_PAD.encode(key()?.public_key().as_ref()))
}

fn subs_path() -> PathBuf {
    dir().join("push.json")
}

pub fn subs() -> Vec<Sub> {
    std::fs::read_to_string(subs_path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn save(list: &[Sub]) {
    let path = subs_path();
    let tmp = path.with_extension("json.tmp");
    if std::fs::write(&tmp, serde_json::to_string_pretty(list).unwrap_or_default()).is_ok() {
        let _ = std::fs::rename(&tmp, &path);
    }
}

/// A phone switched notifications on (one subscription per phone).
pub fn subscribe(device: &str, sub: &serde_json::Value) -> Result<()> {
    let endpoint = sub["endpoint"].as_str().ok_or_else(|| anyhow!("no push address"))?.to_string();
    if !endpoint.starts_with("https://") {
        return Err(anyhow!("that isn't a push service address"));
    }
    let p256dh = sub["keys"]["p256dh"].as_str().ok_or_else(|| anyhow!("no phone key"))?.to_string();
    let auth = sub["keys"]["auth"].as_str().ok_or_else(|| anyhow!("no phone secret"))?.to_string();
    if URL_SAFE_NO_PAD.decode(p256dh.trim_end_matches('=')).map(|k| k.len()).unwrap_or(0) != 65
        || URL_SAFE_NO_PAD.decode(auth.trim_end_matches('=')).map(|k| k.len()).unwrap_or(0) != 16
    {
        return Err(anyhow!("the phone's push keys don't look right"));
    }
    let _g = LOCK.lock();
    let mut list = subs();
    list.retain(|s| s.device != device && s.endpoint != endpoint);
    list.push(Sub { device: device.to_string(), endpoint, p256dh, auth });
    save(&list);
    Ok(())
}

/// A phone switched them off (or was removed).
pub fn unsubscribe(device: &str) {
    let _g = LOCK.lock();
    let mut list = subs();
    list.retain(|s| s.device != device);
    save(&list);
}

/// Tell one phone (by its paired name), in the background.
pub fn send_to(device: &str, title: &str, body: &str, tag: &str) {
    let list: Vec<Sub> = subs().into_iter().filter(|s| s.device == device).collect();
    send_list(list, title, body, tag);
}

/// Tell every subscribed phone, in the background. `tag` replaces an older
/// notification with the same tag instead of piling up.
pub fn send_all(title: &str, body: &str, tag: &str) {
    send_list(subs(), title, body, tag);
}

fn send_list(list: Vec<Sub>, title: &str, body: &str, tag: &str) {
    if list.is_empty() {
        return;
    }
    let payload = json!({ "title": title, "body": body.chars().take(300).collect::<String>(), "tag": tag }).to_string();
    std::thread::spawn(move || {
        let mut gone = Vec::new();
        for s in &list {
            match send(s, payload.as_bytes()) {
                Ok(()) => {}
                Err(e) if e.to_string().contains("gone") => gone.push(s.endpoint.clone()),
                Err(e) => eprintln!("[push] couldn't reach {}: {e}", s.device),
            }
        }
        if !gone.is_empty() {
            let _g = LOCK.lock();
            let mut all = subs();
            all.retain(|s| !gone.contains(&s.endpoint));
            save(&all);
            eprintln!("[push] dropped {} phone(s) the push service no longer knows", gone.len());
        }
    });
}

fn send(s: &Sub, payload: &[u8]) -> Result<()> {
    let ua_public = URL_SAFE_NO_PAD.decode(s.p256dh.trim_end_matches('='))?;
    let auth = URL_SAFE_NO_PAD.decode(s.auth.trim_end_matches('='))?;
    let body = encrypt(&ua_public, &auth, payload)?;
    let k = key()?;
    let aud = {
        let rest = s.endpoint.strip_prefix("https://").unwrap_or(&s.endpoint);
        format!("https://{}", rest.split('/').next().unwrap_or(rest))
    };
    let jwt = vapid_jwt(&k, &aud)?;
    let res = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .build()?
        .post(&s.endpoint)
        .header("TTL", "3600")
        .header("Urgency", "high")
        .header("Content-Encoding", "aes128gcm")
        .header("Content-Type", "application/octet-stream")
        .header("Authorization", format!("vapid t={jwt}, k={}", URL_SAFE_NO_PAD.encode(k.public_key().as_ref())))
        .body(body)
        .send()?;
    match res.status().as_u16() {
        200..=299 => Ok(()),
        404 | 410 => Err(anyhow!("gone")),
        code => Err(anyhow!("the push service answered {code}")),
    }
}

/// The VAPID token: who's sending (this PC's key) and to which push service.
fn vapid_jwt(k: &EcdsaKeyPair, aud: &str) -> Result<String> {
    let header = URL_SAFE_NO_PAD.encode(br#"{"typ":"JWT","alg":"ES256"}"#);
    let exp = chrono::Utc::now().timestamp() + 12 * 3600;
    let claims = URL_SAFE_NO_PAD.encode(json!({ "aud": aud, "exp": exp, "sub": "https://nova-izuki.github.io/izuki/" }).to_string());
    let signing_input = format!("{header}.{claims}");
    let sig = k.sign(&SystemRandom::new(), signing_input.as_bytes()).map_err(|_| anyhow!("couldn't sign"))?;
    Ok(format!("{signing_input}.{}", URL_SAFE_NO_PAD.encode(sig.as_ref())))
}

/// HKDF output length (ring wants a type for it).
struct Len(usize);
impl ring::hkdf::KeyType for Len {
    fn len(&self) -> usize {
        self.0
    }
}

fn hkdf(salt: &[u8], ikm: &[u8], info: &[u8], len: usize) -> Result<Vec<u8>> {
    let prk = ring::hkdf::Salt::new(ring::hkdf::HKDF_SHA256, salt).extract(ikm);
    let info = [info];
    let okm = prk.expand(&info, Len(len)).map_err(|_| anyhow!("hkdf"))?;
    let mut out = vec![0u8; len];
    okm.fill(&mut out).map_err(|_| anyhow!("hkdf"))?;
    Ok(out)
}

/// RFC 8291 (aes128gcm): encrypt `plaintext` for the phone whose public key
/// is `ua_public` and auth secret `auth`. A fresh key and salt every time.
fn encrypt(ua_public: &[u8], auth: &[u8], plaintext: &[u8]) -> Result<Vec<u8>> {
    use ring::agreement::{agree_ephemeral, EphemeralPrivateKey, UnparsedPublicKey, ECDH_P256};
    let rng = SystemRandom::new();
    let as_private = EphemeralPrivateKey::generate(&ECDH_P256, &rng).map_err(|_| anyhow!("key"))?;
    let as_public = as_private.compute_public_key().map_err(|_| anyhow!("key"))?.as_ref().to_vec();
    let ecdh = agree_ephemeral(as_private, &UnparsedPublicKey::new(&ECDH_P256, ua_public), |s| s.to_vec()).map_err(|_| anyhow!("the phone's key didn't work"))?;
    let mut salt = [0u8; 16];
    ring::rand::SecureRandom::fill(&rng, &mut salt).map_err(|_| anyhow!("random"))?;
    seal(&ecdh, ua_public, &as_public, auth, &salt, plaintext)
}

/// The deterministic part of RFC 8291, given the shared secret and salt.
fn seal(ecdh: &[u8], ua_public: &[u8], as_public: &[u8], auth: &[u8], salt: &[u8; 16], plaintext: &[u8]) -> Result<Vec<u8>> {
    use ring::aead::{Aad, LessSafeKey, Nonce, UnboundKey, AES_128_GCM};
    let (cek, nonce) = keys(ecdh, ua_public, as_public, auth, salt)?;
    let key = LessSafeKey::new(UnboundKey::new(&AES_128_GCM, &cek).map_err(|_| anyhow!("cek"))?);
    let mut record = plaintext.to_vec();
    record.push(0x02); // the last (only) record
    key.seal_in_place_append_tag(Nonce::try_assume_unique_for_key(&nonce).map_err(|_| anyhow!("nonce"))?, Aad::empty(), &mut record)
        .map_err(|_| anyhow!("encrypt"))?;
    let mut out = Vec::with_capacity(86 + record.len());
    out.extend_from_slice(salt);
    out.extend_from_slice(&4096u32.to_be_bytes());
    out.push(as_public.len() as u8);
    out.extend_from_slice(as_public);
    out.extend_from_slice(&record);
    Ok(out)
}

fn keys(ecdh: &[u8], ua_public: &[u8], as_public: &[u8], auth: &[u8], salt: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
    let mut key_info = b"WebPush: info\0".to_vec();
    key_info.extend_from_slice(ua_public);
    key_info.extend_from_slice(as_public);
    let ikm = hkdf(auth, ecdh, &key_info, 32)?;
    let cek = hkdf(salt, &ikm, b"Content-Encoding: aes128gcm\0", 16)?;
    let nonce = hkdf(salt, &ikm, b"Content-Encoding: nonce\0", 12)?;
    Ok((cek, nonce))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The phone's side (RFC 8291 §3.4): decrypt what `encrypt` made.
    fn decrypt(ua_private: ring::agreement::EphemeralPrivateKey, ua_public: &[u8], auth: &[u8], body: &[u8]) -> Vec<u8> {
        use ring::aead::{Aad, LessSafeKey, Nonce, UnboundKey, AES_128_GCM};
        use ring::agreement::{agree_ephemeral, UnparsedPublicKey, ECDH_P256};
        let salt = &body[..16];
        assert_eq!(u32::from_be_bytes(body[16..20].try_into().unwrap()), 4096);
        let idlen = body[20] as usize;
        let as_public = &body[21..21 + idlen];
        let ecdh = agree_ephemeral(ua_private, &UnparsedPublicKey::new(&ECDH_P256, as_public), |s| s.to_vec()).unwrap();
        let (cek, nonce) = keys(&ecdh, ua_public, as_public, auth, salt).unwrap();
        let key = LessSafeKey::new(UnboundKey::new(&AES_128_GCM, &cek).unwrap());
        let mut data = body[21 + idlen..].to_vec();
        let plain = key.open_in_place(Nonce::try_assume_unique_for_key(&nonce).unwrap(), Aad::empty(), &mut data).unwrap();
        assert_eq!(*plain.last().unwrap(), 0x02, "last-record delimiter");
        plain[..plain.len() - 1].to_vec()
    }

    #[test]
    fn a_phone_can_read_what_the_pc_sends() {
        use ring::agreement::{EphemeralPrivateKey, ECDH_P256};
        let rng = SystemRandom::new();
        let ua_private = EphemeralPrivateKey::generate(&ECDH_P256, &rng).unwrap();
        let ua_public = ua_private.compute_public_key().unwrap().as_ref().to_vec();
        let auth = [7u8; 16];
        let msg = br#"{"title":"Izuki needs your yes","body":"Gmail draft to Sam"}"#;
        let body = encrypt(&ua_public, &auth, msg).unwrap();
        assert_eq!(decrypt(ua_private, &ua_public, &auth, &body), msg.to_vec());
    }

    #[test]
    fn vapid_token_is_a_signed_es256_jwt() {
        let rng = SystemRandom::new();
        let doc = EcdsaKeyPair::generate_pkcs8(&ECDSA_P256_SHA256_FIXED_SIGNING, &rng).unwrap();
        let k = EcdsaKeyPair::from_pkcs8(&ECDSA_P256_SHA256_FIXED_SIGNING, doc.as_ref(), &rng).unwrap();
        let jwt = vapid_jwt(&k, "https://fcm.googleapis.com").unwrap();
        let parts: Vec<&str> = jwt.split('.').collect();
        assert_eq!(parts.len(), 3);
        let claims: serde_json::Value = serde_json::from_slice(&URL_SAFE_NO_PAD.decode(parts[1]).unwrap()).unwrap();
        assert_eq!(claims["aud"], "https://fcm.googleapis.com");
        // The signature checks out with the public key.
        let sig = URL_SAFE_NO_PAD.decode(parts[2]).unwrap();
        ring::signature::UnparsedPublicKey::new(&ring::signature::ECDSA_P256_SHA256_FIXED, k.public_key().as_ref())
            .verify(format!("{}.{}", parts[0], parts[1]).as_bytes(), &sig)
            .expect("valid signature");
    }

    #[test]
    fn rejects_bad_subscriptions() {
        assert!(subscribe("t", &json!({ "endpoint": "http://insecure/x", "keys": { "p256dh": "a", "auth": "b" } })).is_err());
        assert!(subscribe("t", &json!({ "endpoint": "https://push/x", "keys": { "p256dh": "short", "auth": "b" } })).is_err());
    }
}
