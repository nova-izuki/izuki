//! Where an API key may travel.
//!
//! A key goes over https to anywhere, or over plain http only to a server on
//! this PC (Ollama, LM Studio, 9Router). Typing an `http://` address for a
//! remote server would otherwise send the key across the network unencrypted,
//! so every request that attaches a configured key checks its route here
//! first. A keyless server on the local network (LM Studio on another PC)
//! still works: there is no key to protect.

use crate::settings::ProviderConfig;

/// Whether a key may be sent to `base_url`: https anywhere, plain http only
/// to this PC. An empty address is the provider's own built-in one (https).
pub fn key_may_go(base_url: &str) -> bool {
    let url = base_url.trim().to_ascii_lowercase();
    url.is_empty() || url.starts_with("https://") || (url.starts_with("http://") && crate::brain::on_this_pc(base_url.trim()))
}

/// The plain-words refusal for a key that would travel unencrypted.
pub fn refusal(label: &str) -> String {
    format!(
        "{label}'s address starts with http://, so its key would cross the network unencrypted. Use its https:// address (Settings → Izuki's brain → Endpoint)."
    )
}

/// Refuse, in plain words, a request that would send `cfg`'s key unencrypted
/// across the network. A provider without a key always passes.
pub fn check_key_route(cfg: &ProviderConfig) -> anyhow::Result<()> {
    if cfg.api_key.trim().is_empty() || key_may_go(&cfg.base_url) {
        return Ok(());
    }
    anyhow::bail!("{}", refusal(&cfg.label))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::settings::ProviderId;

    fn cfg(base_url: &str, api_key: &str) -> ProviderConfig {
        ProviderConfig { id: ProviderId::Custom, label: "My server".into(), base_url: base_url.into(), model: "m".into(), api_key: api_key.into(), enabled: true }
    }

    #[test]
    fn a_key_never_crosses_the_network_unencrypted() {
        assert!(key_may_go("https://integrate.api.nvidia.com/v1"));
        assert!(key_may_go("HTTPS://API.EXAMPLE.COM/v1"));
        assert!(key_may_go("http://127.0.0.1:11434"));
        assert!(key_may_go("http://localhost:20128/v1"));
        assert!(key_may_go(""), "the provider's own https address");
        assert!(!key_may_go("http://192.168.1.20:1234/v1"), "another PC on the network");
        assert!(!key_may_go("http://127.example.com/v1"), "a name that only looks local");
        assert!(!key_may_go("http://api.example.com/v1"));
        assert!(!key_may_go("ftp://api.example.com"), "only http(s)");
    }

    #[test]
    fn only_a_request_with_a_key_is_refused() {
        assert!(check_key_route(&cfg("http://192.168.1.20:1234/v1", "")).is_ok(), "a keyless LAN server still works");
        assert!(check_key_route(&cfg("http://192.168.1.20:1234/v1", "sk-123")).is_err());
        assert!(check_key_route(&cfg("https://api.example.com/v1", "sk-123")).is_ok());
        assert!(check_key_route(&cfg("http://localhost:1234/v1", "sk-123")).is_ok());
        let said = check_key_route(&cfg("http://api.example.com/v1", "sk-123")).unwrap_err().to_string();
        assert!(said.contains("https://") && !said.contains("sk-123"), "plain, and never repeats the key: {said}");
    }
}
