//! User settings, persisted as plain JSON next to the flows and watchers.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProviderId {
    Ollama,
    Gemini,
    Openrouter,
    Openai,
    Anthropic,
    Nvidia,
    /// 9Router (https://9router.com) — a locally-run OpenAI-compatible proxy
    /// (`npm install -g 9router`) that fans a single local endpoint out to
    /// 60+ upstream providers with its own fallback logic. Auth to those
    /// upstreams is configured inside 9Router's own dashboard, not here.
    #[serde(rename = "9router")]
    NineRouter,
    /// xAI's Grok (https://console.x.ai) — OpenAI-compatible.
    Xai,
    /// Groq (https://console.groq.com) — free and very fast; the same key
    /// Izuki uses for sharper hearing and the Human voice.
    Groq,
    /// Mistral (https://console.mistral.ai) — free on its "Experiment" plan.
    Mistral,
    Custom,
}

impl ProviderId {
    pub fn as_str(&self) -> &'static str {
        match self {
            ProviderId::Ollama => "ollama",
            ProviderId::Gemini => "gemini",
            ProviderId::Openrouter => "openrouter",
            ProviderId::Openai => "openai",
            ProviderId::Anthropic => "anthropic",
            ProviderId::Nvidia => "nvidia",
            ProviderId::NineRouter => "9router",
            ProviderId::Xai => "xai",
            ProviderId::Groq => "groq",
            ProviderId::Mistral => "mistral",
            ProviderId::Custom => "custom",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "ollama" => ProviderId::Ollama,
            "gemini" => ProviderId::Gemini,
            "openrouter" => ProviderId::Openrouter,
            "openai" => ProviderId::Openai,
            "anthropic" => ProviderId::Anthropic,
            "nvidia" => ProviderId::Nvidia,
            "9router" => ProviderId::NineRouter,
            "xai" | "grok" => ProviderId::Xai,
            "groq" => ProviderId::Groq,
            "mistral" => ProviderId::Mistral,
            "custom" => ProviderId::Custom,
            _ => return None,
        })
    }

    /// Local providers never leave the machine, so they need no key.
    /// 9Router runs locally too, but it's a router *to* cloud providers, not
    /// an offline model, so it stays out of this list.
    pub fn is_local(&self) -> bool {
        matches!(self, ProviderId::Ollama | ProviderId::Custom)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub id: ProviderId,
    pub label: String,
    pub base_url: String,
    pub model: String,
    #[serde(default)]
    pub api_key: String,
    #[serde(default)]
    pub enabled: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BackdropMode {
    Acrylic,
    Mica,
    Tabbed,
    None,
}

/// How a voice or chat command is carried out.
///
/// Windows exposes exactly one hardware cursor, so there is no way for Izuki
/// to move it while leaving it free for you at the same instant — this
/// toggle is honest about that. `Background` skips the fullscreen freeze and
/// overlay entirely: Izuki reaches for the real cursor only for the moment it
/// needs it, so you keep whatever window you were in and can carry on typing
/// the instant it lets go. `Focus` puts up a live, click-through overlay with
/// the hand visible pointing at each target, held until the whole plan
/// finishes — the better choice for a multi-step job you want to watch. The
/// screen is never frozen for either: while the model thinks, the mouse and
/// screen stay entirely the user's.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ExecutionMode {
    Background,
    Focus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub active_provider: ProviderId,
    #[serde(default)]
    pub fallback_provider: Option<ProviderId>,
    pub providers: Vec<ProviderConfig>,

    pub hotkey_draw: String,
    pub hotkey_replay: String,
    pub hotkey_panic: String,
    /// Push-to-talk: hold nothing, just press it and speak — a one-shot
    /// voice command from anywhere, no wake word, no window to focus first.
    #[serde(default = "default_hotkey_voice")]
    pub hotkey_voice: String,
    /// Hold this anywhere — even with the app closed, even in follow mode —
    /// drag to sketch one mark with the default shape below, and release to
    /// send it straight to the brain. No toolbar, no window, just draw.
    #[serde(default = "default_hotkey_quickdraw")]
    pub hotkey_quickdraw: String,

    pub freeze_screen: bool,
    pub magnetic_hand: bool,
    #[serde(default)]
    pub control_style: String,
    #[serde(default)]
    pub orb_style: String,
    #[serde(default = "default_orb_response")]
    pub orb_response: f64,
    #[serde(default = "default_true")]
    pub automatic_update_checks: bool,
    #[serde(default = "default_true")]
    pub economy_mode: bool,
    pub ghost_hand: bool,
    pub ocr_enabled: bool,
    pub autosave_flows: bool,
    pub confirm_before_act: bool,
    pub move_duration_ms: u64,
    pub dry_run: bool,

    /// "Hey Izuki" always-listening wake word. Off by default — it costs a
    /// live microphone stream, so it is something you turn on, not something
    /// that starts listening the moment you install the app.
    #[serde(default)]
    pub voice_wake_enabled: bool,
    /// Whether the Draw tab shows a typed chat box instead of a mic button
    /// for hands-free-style commands. Independent of `voice_wake_enabled` —
    /// you can type instead of speak, or use both.
    #[serde(default)]
    pub chat_mode: bool,
    #[serde(default = "default_execution_mode")]
    pub execution_mode: ExecutionMode,

    /// Keep the glowing hand on screen at all times, tracking the real
    /// cursor, whether or not the config panel is open. This is what turns
    /// Izuki from "an app you open" into "a companion that's just there."
    #[serde(default)]
    pub follow_mode_enabled: bool,
    /// Size of the follow-mode hand, in px.
    #[serde(default = "default_follow_hand_size")]
    pub follow_hand_size: u32,

    pub backdrop: BackdropMode,
    pub start_with_windows: bool,
    pub trail_length: u32,

    /// Flips true the moment the first-run welcome tour finishes or is
    /// skipped, so it never auto-opens again — only from its "replay" button
    /// in Settings.
    #[serde(default)]
    pub onboarding_seen: bool,

    /// Which mark shape a fresh draw session (and quickdraw) starts on.
    /// A plain string, not an enum — the shapes themselves are a frontend
    /// concept (`ShapeKind` in `lib/types.ts`); Rust just remembers and
    /// forwards the choice.
    #[serde(default = "default_draw_shape")]
    pub default_draw_shape: String,
    /// Colour of the ink you draw with (draw overlay and quickdraw): a CSS
    /// hex colour, "auto" (each shape its own colour) or "gradient" (each
    /// shape its own two-tone gradient).
    #[serde(default = "default_ink_color")]
    pub ink_color: String,

    /// Show a live caption of what Izuki is doing/saying near the hand while
    /// it works — the "subtitles" for its actions.
    #[serde(default = "default_true")]
    pub show_captions: bool,
    /// Speak responses out loud. Independent of `show_captions` — you can
    /// have captions with no voice, voice with no captions, or both.
    #[serde(default = "default_true")]
    pub speak_responses: bool,
    /// "edge" — Microsoft's free neural voices (no key, online; voices.rs);
    /// "natural" — Kokoro neural voice running locally (free, offline);
    /// "orpheus" — Orpheus on Groq (free key, most human); "openai" — the
    /// ChatGPT voice (paid); "system" — Windows' built-in voice. See tts.rs.
    #[serde(default = "default_voice_engine")]
    pub voice_engine: String,
    /// Kokoro voice id, e.g. "af_heart".
    #[serde(default = "default_voice_name")]
    pub voice_name: String,
    /// Groq API key, for the Orpheus voice.
    #[serde(default)]
    pub groq_api_key: String,
    /// Voice for the cloud engines ("" = the character's own).
    #[serde(default)]
    pub cloud_voice: String,
    /// Azure Speech key (free tier: half a million characters a month) —
    /// Microsoft's official way to the same neural voices as "Natural".
    #[serde(default)]
    pub azure_speech_key: String,
    /// The region the Azure Speech resource was made in, e.g. "eastus".
    #[serde(default = "default_azure_region")]
    pub azure_speech_region: String,
    /// ElevenLabs key (free plan: a monthly allowance of the most human voices).
    #[serde(default)]
    pub elevenlabs_key: String,
    /// Izuki's character (voices.rs): "nova", "leo", "ezinne", "rex"…
    #[serde(default = "default_persona")]
    pub persona: String,
    /// The user's own name for it ("" = the character's).
    #[serde(default)]
    pub persona_name: String,
    /// A natural voice of the user's choosing ("" = the character's).
    #[serde(default)]
    pub persona_voice: String,
    /// Extra personality, in the user's own words.
    #[serde(default)]
    pub persona_style: String,
    /// Speed and pitch on top of the character's (percent, Hz).
    #[serde(default)]
    pub voice_rate: i32,
    #[serde(default)]
    pub voice_pitch: i32,
    /// Moved to the natural voices once (they replaced "natural" as the
    /// default); a later choice of any voice is left alone.
    #[serde(default)]
    pub voices_v2: bool,
    /// Show the voice sphere while Izuki answers a typed or push-to-talk
    /// request too — not only in "Hey Izuki" conversations.
    #[serde(default = "default_true")]
    pub sphere_on_replies: bool,
    /// The microphone to listen with, by its name as Windows shows it
    /// ("" = automatic: a headset/hands-free mic if one is connected,
    /// otherwise Windows' default). Names, not ids — ids differ per window.
    #[serde(default)]
    pub mic_device: String,
    /// Show your own words live as you talk — proof Izuki is hearing you.
    #[serde(default = "default_true")]
    pub show_transcript: bool,
    /// Talk over Izuki to cut it off, like ChatGPT's voice mode: in a
    /// conversation it keeps listening while it answers. (On a Bluetooth
    /// headset that keeps its mic open, so replies play in call quality.)
    #[serde(default = "default_true")]
    pub barge_in: bool,
    /// Send error reports so bugs get fixed (bugs.rs): what went wrong and
    /// Izuki's recent technical log, with keys, emails and numbers removed.
    /// Never screenshots, recordings or chats.
    #[serde(default = "default_true")]
    pub send_bug_reports: bool,
    /// Turn other apps' sound (music, videos) down while Izuki listens to
    /// you, then back up — like a phone assistant lowering your music.
    #[serde(default = "default_true")]
    pub duck_while_listening: bool,
    /// Double-check what you said with a big cloud speech model (your Groq
    /// key, else Gemini): gets names like "Burna Boy" right and leaves out
    /// the lyrics of music playing in the room. The on-device model still
    /// answers whenever the cloud is slow or offline.
    #[serde(default = "default_true")]
    pub cloud_ears: bool,
    /// The language Izuki should expect when hearing speech. "auto" lets the
    /// cloud model identify it; a named choice helps with Pidgin and code
    /// switching, where small on-device models often guess English words.
    #[serde(default = "default_speech_language")]
    pub speech_language: String,
    /// Izuki on your phone: a Telegram bot you made with @BotFather (free).
    /// Izuki on this PC answers it — no server, no app store.
    #[serde(default)]
    pub telegram_token: String,
    /// The one Telegram chat paired with this PC (0 = not paired yet).
    /// Messages from anyone else are refused.
    #[serde(default)]
    pub telegram_chat_id: i64,
    /// The code you send the bot once to pair your phone.
    #[serde(default)]
    pub telegram_code: String,
    /// Izuki on your phone through Discord (discord.rs): your own free bot.
    #[serde(default)]
    pub discord_token: String,
    /// The one Discord user paired with this PC ("" = none yet).
    #[serde(default)]
    pub discord_user_id: String,
    /// Let the paired phone ask Izuki to do things on this PC.
    #[serde(default = "default_true")]
    pub phone_controls_pc: bool,
    /// Let Izuki control an Android phone over Wi-Fi (ADB). Off by default.
    #[serde(default)]
    pub android_enabled: bool,
    /// The paired phone's address from Wireless debugging, e.g. "192.168.1.24:5555".
    #[serde(default)]
    pub android_addr: String,
    /// The user accepted the 18+ terms for the unfiltered characters.
    #[serde(default)]
    pub adult_ok: bool,
    /// Chat tab: run file saves and commands without the Allow card (still
    /// shown, like Claude Code's auto mode). Off by default — safer.
    #[serde(default)]
    pub chat_auto_run: bool,
    /// Your own free Composio key: Izuki's access to Gmail, Calendar, Drive,
    /// Slack, Notion, socials and more (composio.rs).
    /// "Call Izuki": a hands-free voice page for your phone, reached through
    /// a free Cloudflare tunnel (call.rs).
    #[serde(default)]
    pub call_enabled: bool,
    /// The secret part of the call link — without it the page won't open.
    #[serde(default)]
    pub call_token: String,
    #[serde(default)]
    pub composio_api_key: String,
    /// This PC's user at Composio (made once).
    #[serde(default)]
    pub composio_user_id: String,
    /// Heads-up (headsup.rs): tell me about new emails as they arrive.
    #[serde(default = "default_true")]
    pub heads_up_email: bool,
    /// Heads-up: tell me a few minutes before a meeting or event.
    #[serde(default = "default_true")]
    pub heads_up_calendar: bool,
    /// Heads-up: a short morning brief (today's events, new mail, reminders).
    #[serde(default)]
    pub morning_brief: bool,
    /// When the morning brief comes, "HH:MM" local time.
    #[serde(default = "default_brief_at")]
    pub morning_brief_at: String,
    /// Where heads-ups go: a Windows notification on this PC…
    #[serde(default = "default_true")]
    pub heads_up_pc: bool,
    /// …and/or the paired phone (Telegram / Discord).
    #[serde(default = "default_true")]
    pub heads_up_phone: bool,
    /// The user's own n8n workflows Izuki can start by name ("run my
    /// invoice flow"), each a webhook address.
    #[serde(default)]
    pub n8n_hooks: Vec<N8nHook>,
    /// Where the user's n8n is, and its API key — to import their workflows.
    #[serde(default)]
    pub n8n_url: String,
    #[serde(default)]
    pub n8n_api_key: String,
    /// Private calendar links (.ics) from Blackboard, Canvas and the like:
    /// every assignment and due date, for school-work reminders.
    #[serde(default)]
    pub school_feeds: Vec<String>,
    /// Heads-up: school work due soon (from `school_feeds`).
    #[serde(default = "default_true")]
    pub heads_up_school: bool,
    /// How long a conversation waits for you to say something before the
    /// orb closes, in seconds (5 s … 30 min). "That's all" closes it at once.
    #[serde(default = "default_follow_up")]
    pub follow_up_secs: u32,
    /// How the chat, captions and your words look: "auto" (matched to the
    /// screen behind them), "dark", "light", "gradient" or "custom".
    #[serde(default = "default_chat_style")]
    pub chat_style: String,
    /// The text colour for `chat_style: "custom"`, e.g. "#7dd3fc".
    #[serde(default = "default_chat_color")]
    pub chat_color: String,
}

fn default_azure_region() -> String {
    "eastus".into()
}

fn default_chat_style() -> String {
    "auto".into()
}

fn default_chat_color() -> String {
    "#7dd3fc".into()
}

fn default_follow_up() -> u32 {
    30 * 60
}

fn default_voice_engine() -> String {
    "edge".into()
}

fn default_persona() -> String {
    "nova".into()
}

fn default_voice_name() -> String {
    "af_heart".into()
}

fn default_speech_language() -> String {
    "auto".into()
}

fn default_orb_response() -> f64 { 1.0 }

fn default_true() -> bool {
    true
}

fn default_brief_at() -> String {
    "08:00".into()
}

/// One of the user's n8n workflows: a name to call it by and its webhook.
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct N8nHook {
    pub name: String,
    pub url: String,
}

/// A pasted key minus any `Authorization:` / `Bearer ` it was copied with.
fn clean_key(raw: &str) -> String {
    let k = raw.trim();
    let k = k.strip_prefix("Authorization:").map(str::trim).unwrap_or(k);
    let k = if k.len() > 7 && k[..7].eq_ignore_ascii_case("bearer ") {
        k[7..].trim()
    } else {
        k
    };
    k.to_string()
}

fn default_follow_hand_size() -> u32 {
    // A 16pt triangle reads well at any screen scale.
    16
}

fn default_draw_shape() -> String {
    "pen".into()
}

fn default_ink_color() -> String {
    "auto".into()
}

fn default_execution_mode() -> ExecutionMode {
    ExecutionMode::Focus
}

fn default_hotkey_voice() -> String {
    // As close as a real OS global hotkey gets to "just Ctrl+Windows" — a
    // bare two-modifier chord can't be registered as a system-wide shortcut
    // (Windows requires one real key alongside the modifiers), so this adds
    // Space, an easy chord to hold.
    "Ctrl+Super+Space".into()
}

fn default_hotkey_quickdraw() -> String {
    "Ctrl+D".into()
}

impl Settings {
    pub fn provider(&self, id: ProviderId) -> Option<&ProviderConfig> {
        self.providers.iter().find(|p| p.id == id)
    }

    /// Fill in any provider the config file predates, so upgrades never drop
    /// a newly supported brain.
    pub fn heal(&mut self) {
        if !["mouse", "precision"].contains(&self.control_style.as_str()) { self.control_style = "mouse".into(); }
        if !["liquid", "ferrofluid", "ripple", "constellation"].contains(&self.orb_style.as_str()) { self.orb_style = "liquid".into(); }
        self.orb_response = if self.orb_response.is_finite() { self.orb_response.clamp(0.5, 1.5) } else { 1.0 };
        let defaults = Self::default();
        for d in defaults.providers {
            if !self.providers.iter().any(|p| p.id == d.id) {
                self.providers.push(d);
            }
        }
        // Provider dashboards (NVIDIA's especially) show keys as
        // `Authorization: Bearer nvapi-…`, and that whole thing gets pasted.
        // Izuki adds `Bearer ` itself, so a pasted one is sent twice and the
        // provider rejects the key as unauthorized.
        for p in &mut self.providers {
            let k = clean_key(&p.api_key);
            if k != p.api_key {
                p.api_key = k;
            }
        }
        // Old fixed Gemini names are being retired ("no longer available to
        // new users"): move to Google's always-current ones.
        for p in &mut self.providers {
            if p.id == ProviderId::Gemini {
                p.model = crate::vision::gemini_current(&p.model);
            }
        }
        self.groq_api_key = clean_key(&self.groq_api_key);
        self.azure_speech_key = clean_key(&self.azure_speech_key);
        self.elevenlabs_key = clean_key(&self.elevenlabs_key);
        // "East US" / "eastus" / " EastUS " all mean the same region.
        self.azure_speech_region = self.azure_speech_region.trim().to_lowercase().replace(' ', "");
        if self.azure_speech_region.is_empty() {
            self.azure_speech_region = default_azure_region();
        }
        // This is sent to speech providers as a hint, so keep it a known
        // label even if an old/corrupt settings file contains something else.
        self.speech_language = match self.speech_language.trim().to_ascii_lowercase().as_str() {
            "auto" | "pidgin" | "english" | "yoruba" | "igbo" | "hausa" | "french" | "spanish" | "arabic" | "hindi" | "swahili" | "german" | "japanese" => self.speech_language.trim().to_ascii_lowercase(),
            _ => default_speech_language(),
        };
        // One Groq key for everything Groq does (hearing, the Human voice and
        // now a brain): pasted in either place, it fills the other.
        let groq_brain_key = self.provider(ProviderId::Groq).map(|p| p.api_key.clone()).unwrap_or_default();
        if self.groq_api_key.is_empty() && !groq_brain_key.is_empty() {
            self.groq_api_key = groq_brain_key;
        } else if groq_brain_key.is_empty() && !self.groq_api_key.is_empty() {
            let k = self.groq_api_key.clone();
            if let Some(p) = self.providers.iter_mut().find(|p| p.id == ProviderId::Groq) {
                p.api_key = k;
            }
        }
        self.telegram_token = clean_key(&self.telegram_token);
        self.discord_token = clean_key(&self.discord_token);
        self.composio_api_key = clean_key(&self.composio_api_key);
        if self.call_token.len() < 20 {
            self.call_token = uuid::Uuid::new_v4().simple().to_string();
        }
        if self.telegram_code.len() != 6 {
            self.telegram_code = format!("{:06}", rand::random::<u32>() % 1_000_000);
        }
        // The free natural voices sound far more human than the on-device
        // or Windows voice — move everyone over once.
        if !self.voices_v2 {
            if matches!(self.voice_engine.as_str(), "natural" | "system" | "") {
                self.voice_engine = "edge".into();
            }
            self.voices_v2 = true;
        }
        if self.move_duration_ms == 0 {
            self.move_duration_ms = 320;
        }
        if self.hotkey_draw.trim().is_empty() {
            self.hotkey_draw = defaults.hotkey_draw.clone();
        }
        // Ctrl+Shift+I is Chromium's own DevTools shortcut, and WebView2
        // grabs it before Izuki's global registration ever sees it — anyone
        // still on that untouched default is migrated to one that isn't
        // fought over. Left alone if they rebound it to anything else.
        if self.hotkey_draw == "Ctrl+Shift+I" {
            self.hotkey_draw = defaults.hotkey_draw;
        }
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            // Free, fast, sees the screen, no install — the one a first-time
            // user can set up in a minute. (Ollama needs its own app.)
            active_provider: ProviderId::Gemini,
            fallback_provider: Some(ProviderId::Nvidia),
            providers: vec![
                ProviderConfig {
                    id: ProviderId::Ollama,
                    label: "Ollama (local, offline)".into(),
                    base_url: "http://127.0.0.1:11434".into(),
                    model: "moondream".into(),
                    api_key: String::new(),
                    enabled: true,
                },
                ProviderConfig {
                    id: ProviderId::Gemini,
                    label: "Gemini 2.5 Flash (free tier)".into(),
                    base_url: "https://generativelanguage.googleapis.com".into(),
                    model: crate::vision::GEMINI_MAIN.into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Openrouter,
                    label: "OpenRouter (any vision model)".into(),
                    base_url: "https://openrouter.ai/api/v1".into(),
                    model: "google/gemma-4-31b-it:free".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Openai,
                    label: "OpenAI compatible".into(),
                    base_url: "https://api.openai.com/v1".into(),
                    model: "gpt-4.1-mini".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Anthropic,
                    label: "Anthropic Claude".into(),
                    base_url: "https://api.anthropic.com/v1".into(),
                    model: "claude-haiku-4-5-20251001".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Nvidia,
                    label: "NVIDIA NIM (free tier)".into(),
                    base_url: "https://integrate.api.nvidia.com/v1".into(),
                    model: "google/gemma-4-31b-it".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::NineRouter,
                    label: "9Router (local, free providers)".into(),
                    base_url: "http://localhost:20128/v1".into(),
                    // Kiro AI's `kr/` models, routed through 9Router — Claude
                    // reads images natively, and it's one of the few free
                    // lanes 9Router still has live (iFlow/Qwen/Gemini CLI's
                    // free tiers were retired). Swap it for whatever you've
                    // actually connected in 9Router's own dashboard.
                    model: "kr/claude-haiku-4.5".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Xai,
                    label: "Grok (xAI)".into(),
                    base_url: "https://api.x.ai/v1".into(),
                    model: "grok-4-fast-non-reasoning".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Groq,
                    label: "Groq (free, very fast)".into(),
                    base_url: "https://api.groq.com/openai/v1".into(),
                    // Sees pictures (checked: it named a red square in 0.6 s),
                    // so it does screen tasks too, not just chat.
                    model: "qwen/qwen3.8-27b".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Mistral,
                    label: "Mistral (free plan)".into(),
                    base_url: "https://api.mistral.ai/v1".into(),
                    // Mistral's own "always the current Small" name; it reads images.
                    model: "mistral-small-latest".into(),
                    api_key: String::new(),
                    enabled: false,
                },
                ProviderConfig {
                    id: ProviderId::Custom,
                    label: "Custom endpoint".into(),
                    base_url: "http://127.0.0.1:8080/v1".into(),
                    model: "local-vlm".into(),
                    api_key: String::new(),
                    enabled: false,
                },
            ],
            hotkey_draw: "Ctrl+Shift+Space".into(),
            hotkey_replay: "Ctrl+Shift+R".into(),
            hotkey_panic: "Ctrl+Shift+Q".into(),
            hotkey_voice: default_hotkey_voice(),
            hotkey_quickdraw: default_hotkey_quickdraw(),
            freeze_screen: true,
            magnetic_hand: true,
            control_style: "mouse".into(),
            orb_style: "liquid".into(),
            orb_response: 1.0,
            automatic_update_checks: true,
            economy_mode: true,
            ghost_hand: true,
            ocr_enabled: true,
            autosave_flows: true,
            confirm_before_act: false,
            move_duration_ms: 320,
            dry_run: false,
            voice_wake_enabled: false,
            chat_mode: false,
            execution_mode: ExecutionMode::Focus,
            follow_mode_enabled: false,
            follow_hand_size: default_follow_hand_size(),
            backdrop: BackdropMode::Acrylic,
            start_with_windows: false,
            trail_length: 12,
            onboarding_seen: false,
            default_draw_shape: default_draw_shape(),
            ink_color: default_ink_color(),
            show_captions: true,
            speak_responses: true,
            voice_engine: default_voice_engine(),
            voice_name: default_voice_name(),
            groq_api_key: String::new(),
            cloud_voice: String::new(),
            azure_speech_key: String::new(),
            azure_speech_region: default_azure_region(),
            elevenlabs_key: String::new(),
            persona: default_persona(),
            persona_name: String::new(),
            persona_voice: String::new(),
            persona_style: String::new(),
            voice_rate: 0,
            voice_pitch: 0,
            voices_v2: true,
            sphere_on_replies: true,
            mic_device: String::new(),
            show_transcript: true,
            barge_in: true,
            send_bug_reports: true,
            duck_while_listening: true,
            cloud_ears: true,
            speech_language: default_speech_language(),
            telegram_token: String::new(),
            telegram_chat_id: 0,
            telegram_code: String::new(),
            discord_token: String::new(),
            discord_user_id: String::new(),
            phone_controls_pc: true,
            android_enabled: false,
            android_addr: String::new(),
            adult_ok: false,
            chat_auto_run: false,
            call_enabled: false,
            call_token: String::new(),
            composio_api_key: String::new(),
            composio_user_id: String::new(),
            heads_up_email: true,
            heads_up_calendar: true,
            morning_brief: false,
            morning_brief_at: default_brief_at(),
            heads_up_pc: true,
            heads_up_phone: true,
            n8n_hooks: Vec::new(),
            n8n_url: String::new(),
            n8n_api_key: String::new(),
            school_feeds: Vec::new(),
            heads_up_school: true,
            follow_up_secs: default_follow_up(),
            chat_style: default_chat_style(),
            chat_color: default_chat_color(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn key_after_heal(pasted: &str) -> String {
        let mut s = Settings::default();
        let nvidia = s.providers.iter_mut().find(|p| p.id == ProviderId::Nvidia).unwrap();
        nvidia.api_key = pasted.to_string();
        s.heal();
        s.provider(ProviderId::Nvidia).unwrap().api_key.clone()
    }

    #[test]
    fn pasted_bearer_prefix_is_stripped() {
        assert_eq!(key_after_heal("Bearer nvapi-abc123"), "nvapi-abc123");
        assert_eq!(key_after_heal("bearer   nvapi-abc123  "), "nvapi-abc123");
        assert_eq!(key_after_heal("Authorization: Bearer nvapi-abc123"), "nvapi-abc123");
    }

    #[test]
    fn clean_keys_are_left_alone() {
        assert_eq!(key_after_heal("sk-or-v1-xyz"), "sk-or-v1-xyz");
        assert_eq!(key_after_heal(""), "");
    }

    #[test]
    fn devtools_draw_hotkey_is_migrated() {
        let mut s = Settings::default();
        s.hotkey_draw = "Ctrl+Shift+I".into();
        s.heal();
        assert_ne!(s.hotkey_draw, "Ctrl+Shift+I");
    }

    #[test]
    fn old_settings_files_still_load() {
        // A settings.json from before the newer fields existed.
        let old = serde_json::json!({
            "active_provider": "ollama",
            "providers": [],
            "hotkey_draw": "Ctrl+Shift+I",
            "hotkey_replay": "Ctrl+Shift+R",
            "hotkey_panic": "Ctrl+Shift+Q",
            "freeze_screen": true, "magnetic_hand": true, "ghost_hand": true,
            "ocr_enabled": true, "autosave_flows": true, "confirm_before_act": false,
            "move_duration_ms": 320, "dry_run": false,
            "backdrop": "acrylic", "start_with_windows": false, "trail_length": 12
        });
        let mut s: Settings = serde_json::from_value(old).expect("old file loads");
        s.heal();
        assert!(s.show_captions && s.speak_responses);
        assert!(s.provider(ProviderId::NineRouter).is_some());
        assert_eq!(s.hotkey_quickdraw, "Ctrl+D");
        assert_eq!(s.control_style, "mouse");
        assert_eq!(s.orb_style, "liquid");
        assert!(s.economy_mode);
        assert_eq!(s.orb_response, 1.0);
        s.orb_response = 99.0;
        s.control_style = "unknown".into();
        s.orb_style = "unknown".into();
        s.heal();
        assert_eq!(s.orb_response, 1.5);
        assert_eq!(s.control_style, "mouse");
        assert_eq!(s.orb_style, "liquid");
    }
}
