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
    /// Meta's own Llama API (https://llama.developer.meta.com) — OpenAI-compatible.
    Meta,
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
            ProviderId::Meta => "meta",
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
            "meta" | "llama" => ProviderId::Meta,
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

impl ProviderConfig {
    /// Runs on this PC: Ollama, or a custom endpoint at this PC's own address
    /// (no key, slow first answers). A custom endpoint on the internet — GitHub
    /// Models, any OpenAI-style service — is a cloud brain like the others, so
    /// it joins the backups when another one is busy.
    pub fn on_this_pc(&self) -> bool {
        match self.id {
            ProviderId::Ollama => true,
            ProviderId::Custom => self.base_url.trim().is_empty() || crate::brain::on_this_pc(&self.base_url),
            _ => false,
        }
    }
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
    /// How sure the wake-word detector must be: "relaxed", "normal" or
    /// "strict" (fewer wake-ups on words that only sound like it).
    #[serde(default = "default_wake_sensitivity")]
    pub wake_sensitivity: String,
    #[serde(default = "default_hotkey_voice")]
    pub hotkey_voice: String,
    /// Hold this anywhere — even with the app closed, even in follow mode —
    /// drag to sketch one mark with the default shape below, and release to
    /// send it straight to the brain. No toolbar, no window, just draw.
    #[serde(default = "default_hotkey_quickdraw")]
    pub hotkey_quickdraw: String,

    /// Hold this anywhere and talk: what you say is typed into whatever box
    /// you're already in — an email, a chat, a form, a code comment. Let go
    /// and it goes in, tidied. Nothing is sent or submitted.
    #[serde(default = "default_hotkey_dictate")]
    pub hotkey_dictate: String,
    /// Tidy dictation before it's typed: fillers ("um", "you know"), false
    /// starts and repeated words taken out, grammar and punctuation fixed.
    /// Off: exactly the words heard.
    #[serde(default = "default_true")]
    pub dictate_tidy: bool,

    pub freeze_screen: bool,
    pub magnetic_hand: bool,
    #[serde(default)]
    pub control_style: String,
    #[serde(default)]
    pub orb_style: String,
    #[serde(default = "default_orb_response")]
    pub orb_response: f64,
    /// The 3D face's look, as JSON: gender ("auto" follows the voice), hair,
    /// hair colour, skin, eyes, beard, glasses, glowing seams, accent colour.
    #[serde(default)]
    pub avatar: String,
    /// The Roku's developer password (the one picked when turning developer
    /// mode on), so Izuki can update its TV channel. Stays on this PC.
    #[serde(default)]
    pub roku_dev_password: String,
    /// Update the TV channel by itself when a new one comes with an update.
    #[serde(default = "default_true")]
    pub tv_channel_auto: bool,
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
    /// Saved flows clear themselves after this many days without being run
    /// (0 = keep them). Flows with a shortcut key are always kept.
    #[serde(default = "default_flows_keep_days")]
    pub flows_keep_days: u32,
    /// The app's colour theme: "auto" (changes with the time of day),
    /// "nova", "ocean", "sunset", "forest", "rose", "gold", "graphite" or
    /// "custom" (from `app_theme_color`).
    #[serde(default = "default_app_theme")]
    pub app_theme: String,
    #[serde(default)]
    pub app_theme_color: String,
    /// The TV's address on the home Wi-Fi (found by itself; "" = look).
    #[serde(default)]
    pub tv_host: String,
    /// The pass a Samsung or LG TV gave Izuki when "Allow" was pressed on it
    /// (so it doesn't ask again). Roku needs none.
    #[serde(default)]
    pub tv_pair: String,
    /// While the Izuki screen is open on the TV, Izuki talks from the TV.
    #[serde(default = "default_true")]
    pub tv_voice: bool,
    /// The TV orb's look: "" = the same as here, else an orb style name.
    #[serde(default)]
    pub tv_orb: String,
    /// Let Izuki's phone and TV apps find this PC on the home Wi-Fi and link
    /// to it (link.rs). Off until the user turns it on (Windows asks once
    /// about the firewall).
    #[serde(default)]
    pub lan_link: bool,
    /// Phones and TVs that were allowed to link, with their passes.
    #[serde(default)]
    pub linked_devices: Vec<crate::link::LinkedDevice>,
    /// When music plays, the orb comes up and flows with it (music mode).
    #[serde(default)]
    pub music_visuals: bool,
    /// The Island: the pill at the top of the screen that shows what Izuki
    /// is doing, what's playing and what's coming up — like a phone's live
    /// activities. Keeps the (click-through) overlay up while it's on.
    #[serde(default = "default_true")]
    pub island_enabled: bool,
    /// The Island stays at the top like an iPhone's Dynamic Island — a black
    /// pill that grows with what's happening — not only when the mouse goes up.
    #[serde(default = "default_true")]
    pub island_always: bool,
    /// The Island can be dragged anywhere on screen (off: a strip along the top).
    #[serde(default)]
    pub island_free: bool,
    /// Let the Island offer help on its own when something worth it comes
    /// up (an error box, a question, a video) — a short peek, rarely.
    #[serde(default = "default_true")]
    pub island_suggestions: bool,
    /// The Island's waveform while music plays: auto (a style per song),
    /// silk, bars, mirror, neon or dots.
    #[serde(default = "default_island_wave")]
    pub island_wave: String,
    /// The Island's look (Windhawk-style themes): "default", "glass",
    /// "bubble", "squircle", "outline" or "aero".
    #[serde(default = "default_island_style")]
    pub island_style: String,
    /// How big the Island is: "small", "normal" or "large".
    #[serde(default = "default_island_size")]
    pub island_size: String,
    /// Press "Skip ad" on YouTube by itself (off until turned on).
    #[serde(default)]
    pub auto_skip_ads: bool,
    /// Press "Reject all" on cookie banners by itself (off until turned on).
    #[serde(default)]
    pub auto_reject_cookies: bool,
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
    /// Keep Izuki's last answer on screen after the orb goes, to read it
    /// again — until it's closed with × or a new answer replaces it.
    #[serde(default)]
    pub keep_reply: bool,
    /// A line of light around the screen edges while Izuki listens, thinks
    /// and talks (EdgeGlow.tsx).
    #[serde(default = "default_true")]
    pub edge_glow: bool,
    /// Only the glowing edges show Izuki is there — no orb or character.
    #[serde(default)]
    pub glow_only: bool,
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
    /// PC Boost: notice when the PC is struggling and offer to speed it up
    /// (boost.rs). Only looks — a few cheap system calls every 5 s.
    #[serde(default = "default_true")]
    pub pc_boost: bool,
    /// Match Izuki's voice and character: a woman's face speaks with a woman's
    /// voice, picking a man's voice brings up a man's face. Off = my own choice.
    #[serde(default = "default_true")]
    pub match_voice_face: bool,
    /// …and do the safe part by itself (old temp files, hogging background
    /// helpers) — never a window you're using.
    #[serde(default)]
    pub pc_boost_auto: bool,
    /// Once a day, extra copies of the same download go to the Recycle Bin
    /// (off until turned on).
    #[serde(default)]
    pub tidy_dupes_auto: bool,
    /// Once a day, what has sat in the Recycle Bin for 30+ days is cleared
    /// for good (off until turned on).
    #[serde(default)]
    pub tidy_recycle_auto: bool,
    /// PC Care: say on the Island when antivirus, firewall, disk space or a
    /// drive needs attention (on unless turned off).
    #[serde(default = "default_true")]
    pub pc_care_alerts: bool,
    /// A click the AI picked by eye gets a second look from a pointing model
    /// (Gemini, free with its key) before it happens.
    #[serde(default = "default_true")]
    pub sharp_eye: bool,
    /// Use ByteDance's UI-TARS (through OpenRouter, paid) for that look.
    #[serde(default)]
    pub sharp_eye_tars: bool,
    /// Show a box on what Izuki is about to click, for half a second first
    /// (off: clicks happen straight away).
    #[serde(default)]
    pub click_highlight: bool,
    /// The key FL Studio's Izuki script answers to (written into the script).
    #[serde(default)]
    pub fl_key: String,
    /// The desktop mate: your character living on the desktop (off unless turned on).
    #[serde(default)]
    pub mate_enabled: bool,
    /// The moving character's pet ("none", "cat" or "dog"): it follows along.
    #[serde(default = "default_buddy_pet")]
    pub buddy_pet: String,
    /// How the moving character plays its poses: "smooth" (held and
    /// blended) or "retro" (flicked frame by frame, like an old game).
    #[serde(default = "default_buddy_motion")]
    pub buddy_motion: String,
    /// The desktop mate was switched off once for everyone (1.0.89): it
    /// was on by default, felt like a bug and slowed PCs down.
    #[serde(default)]
    pub mate_reset_v2: bool,
    /// Its pet: "cat", "dog" or "none".
    #[serde(default = "default_mate_pet")]
    pub mate_pet: String,
    /// How often it speaks up unasked: "quiet", "normal" or "chatty".
    #[serde(default = "default_mate_chatty")]
    pub mate_chatty: String,
    /// Says its lines out loud too (off: speech bubbles only).
    #[serde(default)]
    pub mate_voice: bool,
    /// Walks around the taskbar now and then.
    #[serde(default = "default_true")]
    pub mate_wander: bool,
    /// Air control: your hand in front of the camera drives the PC (air.rs).
    #[serde(default)]
    pub air_enabled: bool,
    /// In 3D apps (Blender, Unity…), a pinch dragged turns the model.
    #[serde(default)]
    pub air_3d: bool,
    /// Air control: a small camera window (you and your hand, with edge warnings).
    #[serde(default)]
    pub air_mirror: bool,
    /// Your own Air gestures: a taught hand pose and what it does.
    #[serde(default)]
    pub air_gestures: Vec<AirGesture>,
    /// What Air control's quick gestures do (src/lib/airActions.ts): slot
    /// ("middle", "ring", "pinky", "flick_left", "flick_right") → action
    /// ("click:right", "keys:ctrl+c", "none"…). Missing = the default.
    #[serde(default)]
    pub air_bindings: std::collections::BTreeMap<String, String>,
    /// Air control as a game controller: the hand leaning left/right/up/down
    /// holds those keys, a pinch holds Space ("arrows" or "wasd" for the keys).
    #[serde(default)]
    pub air_game: bool,
    #[serde(default = "default_air_game_keys")]
    pub air_game_keys: String,
    /// How the Air pointer follows your hand: "fast", "balanced" or "precision".
    #[serde(default = "default_air_mode")]
    pub air_mode: String,
    /// Last confirmed High Performance state. UI refreshes from Windows;
    /// never automatically applies a plan from this stored preference.
    #[serde(default = "default_false")]
    pub pc_boost_power_plan: bool,
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
    /// The linked phone may work this PC: trackpad, clicks, typing, keys
    /// and a look at the screen (remote.rs). Off until switched on.
    #[serde(default)]
    pub phone_remote: bool,
    /// The paired phone may run PowerShell commands here (rtools.rs) —
    /// changes only after the phone confirms the exact command. Off until on.
    #[serde(default)]
    pub phone_terminal: bool,
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
    /// Study log (studylog.rs): every question asked and its answer go into
    /// today's "Study log" note, explained to learn from later.
    #[serde(default)]
    pub study_log: bool,
    /// Stripe, read only: a restricted key (rk_…) with Read on charges and
    /// balance (shop.rs). Never logged, never sent to the phone.
    #[serde(default)]
    pub stripe_key: String,
    /// Shopify store ("ama-bakery" or its .myshopify.com address) and a custom
    /// app's Admin API token with read_orders/read_products (shop.rs).
    #[serde(default)]
    pub shopify_store: String,
    #[serde(default)]
    pub shopify_token: String,
    /// How the user writes, for drafts Izuki writes for them to send
    /// ("short and friendly, no emojis, sign off 'Cheers, Sam'"). Empty: Izuki's own.
    #[serde(default)]
    pub writing_style: String,
    /// The character pops up beside the Island to point at news and cheer
    /// when things finish (IslandPal.tsx) — when the companion is a character.
    #[serde(default)]
    pub island_reactions: bool,
    /// Heads-up: a mission finished, paused or needs checking (missions.rs).
    #[serde(default = "default_true")]
    pub heads_up_missions: bool,
    /// Rest mode by itself: waiting missions start once you've been away
    /// from the PC for ten minutes (missions.rs).
    #[serde(default)]
    pub missions_when_away: bool,
    /// Quiet hours, "22:00-07:00" (empty: off). Heads-ups wait and come as
    /// one summary when they end; the Island doesn't pop up suggestions.
    #[serde(default)]
    pub quiet_hours: String,
    /// Buddy mode: Izuki speaks up by itself — an important message, the
    /// battery running low, the internet dropping, "welcome back" with what
    /// you missed — with the orb, like a friend at your desk.
    #[serde(default = "default_true")]
    pub buddy_speaks: bool,
    /// …and handles small, undoable things on its own (battery saver when
    /// the battery's nearly empty), saying what it did.
    #[serde(default = "default_true")]
    pub buddy_acts: bool,
    /// …and nudges you to take a break after a long stretch.
    #[serde(default = "default_true")]
    pub buddy_breaks: bool,
    /// Recall: note the titles of windows you had in front (this PC only, a
    /// week, never private or sign-in windows) so "what was that site I was
    /// on this morning?" can be answered. Off until turned on.
    #[serde(default)]
    pub recall_enabled: bool,
    /// Screen time: count minutes per app and big site (names only, this PC,
    /// two weeks) for "how long was I on YouTube today?".
    #[serde(default = "default_true")]
    pub screen_time_enabled: bool,
    /// The user's town or city, for the weather glance ("" = from memory).
    #[serde(default)]
    pub home_city: String,
    /// Fill in `home_city` when the user says where they are in chat ("I'm in
    /// Dallas"). Opt in before sending a place name to the map service;
    /// off leaves the city to Settings alone.
    #[serde(default)]
    pub learn_city: bool,
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

/// A hand pose you taught Air control, and what it does: "keys:ctrl+s",
/// "type:some words" or "say:a request for Izuki".
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AirGesture {
    pub name: String,
    pub pose: Vec<f32>,
    pub action: String,
}

fn default_air_game_keys() -> String {
    "arrows".into()
}

fn default_air_mode() -> String {
    "balanced".into()
}

fn default_buddy_motion() -> String {
    "smooth".into()
}

fn default_buddy_pet() -> String {
    "none".into()
}

fn default_mate_pet() -> String {
    "cat".into()
}

fn default_mate_chatty() -> String {
    "normal".into()
}

fn default_true() -> bool {
    true
}

fn default_false() -> bool {
    false
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

fn default_island_style() -> String {
    "default".into()
}

fn default_island_size() -> String {
    "normal".into()
}

fn default_island_wave() -> String {
    "auto".into()
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

fn default_app_theme() -> String {
    "nova".into()
}

fn default_flows_keep_days() -> u32 {
    1
}

fn default_wake_sensitivity() -> String {
    "normal".into()
}

fn default_hotkey_voice() -> String {
    // As close as a real OS global hotkey gets to "just Ctrl+Windows" — a
    // bare two-modifier chord can't be registered as a system-wide shortcut
    // (Windows requires one real key alongside the modifiers), so this adds
    // Space, an easy chord to hold.
    "Ctrl+Super+Space".into()
}

fn default_hotkey_dictate() -> String {
    // Nothing else on Windows uses this, and it's reachable one-handed.
    // NOT Ctrl+Shift+Space: that is the draw key, and two features on one
    // chord means Windows registers the first and silently drops the second.
    "Ctrl+Alt+Space".into()
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
        // The always-on desktop mate is retired (it slowed PCs down; the
        // moving characters replace it): it stays off.
        self.mate_enabled = false;
        self.mate_reset_v2 = true;
        // The old drawn 3D faces became real 3D models: the nearest one, by voice.
        let male = crate::tv::voice_is_male(self);
        if self.orb_style == "holo3d" { self.orb_style = if male { "model:holo-male" } else { "model:holo-female" }.into(); }
        if self.orb_style == "avatar" { self.orb_style = if male { "model:black-male" } else { "model:lightskin-female" }.into(); }
        if self.tv_orb == "holo3d" || self.tv_orb == "avatar" { self.tv_orb = "model:holo-female".into(); }
        let face_ok = |s: &str| s.strip_prefix("model:").is_some_and(|id| (1..=40).contains(&id.len()) && id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-'));
        let toon_ok = |s: &str| s == "toon" || s.strip_prefix("toon:").or_else(|| s.strip_prefix("buddy:")).is_some_and(|id| (1..=24).contains(&id.len()) && id.chars().all(|c| c.is_ascii_alphanumeric()));
        if !["none", "cat", "dog"].contains(&self.buddy_pet.as_str()) { self.buddy_pet = "none".into(); }
        if !["smooth", "retro"].contains(&self.buddy_motion.as_str()) { self.buddy_motion = default_buddy_motion(); }
        if !["fast", "balanced", "precision"].contains(&self.air_mode.as_str()) { self.air_mode = default_air_mode(); }
        if !["arrows", "wasd"].contains(&self.air_game_keys.as_str()) { self.air_game_keys = default_air_game_keys(); }
        self.air_bindings.retain(|slot, action| {
            ["middle", "ring", "pinky", "flick_left", "flick_right"].contains(&slot.as_str())
                && action.len() <= 40
                && (action == "none" || action == "click:right" || action.starts_with("keys:"))
        });
        // "Glow only" without the glow would leave nothing showing Izuki is there.
        if !self.edge_glow { self.glow_only = false; }
        if !["liquid", "ferrofluid", "dew", "ripple", "constellation", "particles", "face", "ferro"].contains(&self.orb_style.as_str()) && !face_ok(&self.orb_style) && !toon_ok(&self.orb_style) { self.orb_style = "liquid".into(); }
        if !["auto", "silk", "bars", "mirror", "neon", "dots"].contains(&self.island_wave.as_str()) { self.island_wave = default_island_wave(); }
        if !["default", "glass", "bubble", "squircle", "outline", "aero", "nova", "windows", "dot", "strip"].contains(&self.island_style.as_str()) { self.island_style = default_island_style(); }
        if !["small", "normal", "large"].contains(&self.island_size.as_str()) { self.island_size = default_island_size(); }
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
        self.unclash_hotkeys();
    }

    /// One chord, one action.
    ///
    /// Windows registers the first shortcut on a chord and quietly refuses
    /// the rest, so a duplicate doesn't look broken — the second feature
    /// simply never happens, with nothing to show why. The more important
    /// feature keeps the chord; the other falls back to its own default, or
    /// is left blank so the Shortcuts list shows it needs one.
    fn unclash_hotkeys(&mut self) {
        let defaults = Settings::default();
        // Most important first: whoever is earlier keeps the chord.
        let mine: [(fn(&mut Settings) -> &mut String, fn(&Settings) -> &String); 6] = [
            (|s| &mut s.hotkey_draw, |d| &d.hotkey_draw),
            (|s| &mut s.hotkey_voice, |d| &d.hotkey_voice),
            (|s| &mut s.hotkey_panic, |d| &d.hotkey_panic),
            (|s| &mut s.hotkey_quickdraw, |d| &d.hotkey_quickdraw),
            (|s| &mut s.hotkey_dictate, |d| &d.hotkey_dictate),
            (|s| &mut s.hotkey_replay, |d| &d.hotkey_replay),
        ];
        let same = |a: &str, b: &str| a.trim().eq_ignore_ascii_case(b.trim());
        let mut taken: Vec<String> = Vec::new();
        for (get, fallback) in mine {
            let fallback = fallback(&defaults).clone();
            let slot = get(self);
            if slot.trim().is_empty() {
                continue;
            }
            if !taken.iter().any(|t| same(t, slot)) {
                taken.push(slot.clone());
                continue;
            }
            // Its own default is free: take that. Otherwise leave it unset
            // rather than pretend it works.
            if !fallback.trim().is_empty() && !taken.iter().any(|t| same(t, &fallback)) {
                *slot = fallback.clone();
                taken.push(fallback);
            } else {
                slot.clear();
            }
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
                    id: ProviderId::Meta,
                    label: "Meta Llama (free preview)".into(),
                    base_url: "https://api.llama.com/compat/v1".into(),
                    // Meta's Llama 4: reads images, so it does screen tasks too.
                    model: "Llama-4-Maverick-17B-128E-Instruct-FP8".into(),
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
            wake_sensitivity: default_wake_sensitivity(),
            hotkey_quickdraw: default_hotkey_quickdraw(),
            hotkey_dictate: default_hotkey_dictate(),
            dictate_tidy: true,
            freeze_screen: true,
            magnetic_hand: true,
            control_style: "mouse".into(),
            orb_style: "toon".into(),
            orb_response: 1.0,
            avatar: String::new(),
            roku_dev_password: String::new(),
            tv_channel_auto: true,
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
            island_enabled: true,
            music_visuals: false,
            tv_host: String::new(),
            tv_pair: String::new(),
            tv_voice: true,
            tv_orb: String::new(),
            lan_link: false,
            linked_devices: Vec::new(),
            app_theme: default_app_theme(),
            app_theme_color: String::new(),
            flows_keep_days: default_flows_keep_days(),
            island_suggestions: true,
            island_always: true,
            island_free: false,
            island_wave: default_island_wave(),
            island_style: default_island_style(),
            island_size: default_island_size(),
            auto_skip_ads: false,
            auto_reject_cookies: false,
            follow_hand_size: default_follow_hand_size(),
            backdrop: BackdropMode::Acrylic,
            start_with_windows: false,
            trail_length: 12,
            onboarding_seen: false,
            default_draw_shape: default_draw_shape(),
            ink_color: default_ink_color(),
            show_captions: true,
            keep_reply: false,
            edge_glow: true,
            glow_only: false,
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
            pc_boost: true,
            match_voice_face: true,
            pc_boost_auto: false,
            tidy_dupes_auto: false,
            tidy_recycle_auto: false,
            pc_care_alerts: true,
            sharp_eye: true,
            sharp_eye_tars: false,
            click_highlight: false,
            fl_key: String::new(),
            mate_enabled: false,
            mate_reset_v2: true,
            buddy_pet: default_buddy_pet(),
            buddy_motion: default_buddy_motion(),
            mate_pet: default_mate_pet(),
            mate_chatty: default_mate_chatty(),
            mate_voice: false,
            mate_wander: true,
            air_enabled: false,
            air_3d: false,
            air_mirror: false,
            air_gestures: Vec::new(),
            air_mode: default_air_mode(),
            air_bindings: Default::default(),
            air_game: false,
            air_game_keys: default_air_game_keys(),
            pc_boost_power_plan: false,
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
            phone_remote: false,
            phone_terminal: false,
            call_token: String::new(),
            composio_api_key: String::new(),
            composio_user_id: String::new(),
            heads_up_email: true,
            heads_up_calendar: true,
            morning_brief: false,
            morning_brief_at: default_brief_at(),
            heads_up_pc: true,
            heads_up_phone: true,
            heads_up_missions: true,
            missions_when_away: false,
            study_log: false,
            writing_style: String::new(),
            stripe_key: String::new(),
            shopify_store: String::new(),
            shopify_token: String::new(),
            island_reactions: false,
            quiet_hours: String::new(),
            buddy_speaks: true,
            buddy_acts: true,
            buddy_breaks: true,
            recall_enabled: false,
            screen_time_enabled: true,
            home_city: String::new(),
            learn_city: false,
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

    #[test]
    fn a_custom_brain_on_the_internet_is_a_cloud_brain() {
        let mut c = Settings::default().providers.into_iter().find(|p| p.id == ProviderId::Custom).expect("custom slot");
        assert!(c.on_this_pc(), "the default custom slot is this PC's");
        c.base_url = "https://models.github.ai/inference".into();
        assert!(!c.on_this_pc(), "GitHub Models is on the internet");
        c.base_url = "http://localhost:1234/v1".into();
        assert!(c.on_this_pc());
        c.base_url = "https://localhost.example.com/v1".into();
        assert!(!c.on_this_pc(), "a website whose name starts with localhost");
    }

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

    /// Windows registers the first shortcut on a chord and silently refuses
    /// the rest. Shipping two features on one default chord means one of them
    /// never works, with no error anywhere — this caught exactly that.
    #[test]
    fn no_two_shortcuts_share_a_chord_out_of_the_box() {
        let s = Settings::default();
        let all = [
            ("draw", &s.hotkey_draw),
            ("replay", &s.hotkey_replay),
            ("panic", &s.hotkey_panic),
            ("talk", &s.hotkey_voice),
            ("quickdraw", &s.hotkey_quickdraw),
            ("dictate", &s.hotkey_dictate),
        ];
        for (i, (name, combo)) in all.iter().enumerate() {
            assert!(!combo.trim().is_empty(), "{name} has no default shortcut");
            for (other, theirs) in all.iter().skip(i + 1) {
                assert_ne!(
                    combo.to_lowercase(),
                    theirs.to_lowercase(),
                    "{name} and {other} both default to {combo} — one of them would never fire"
                );
            }
        }
    }

    #[test]
    fn a_shortcut_set_twice_by_hand_is_untangled() {
        let mut s = Settings::default();
        // Someone binds dictation to the draw chord in the Shortcuts list.
        s.hotkey_dictate = s.hotkey_draw.clone();
        s.heal();
        assert_eq!(s.hotkey_draw, Settings::default().hotkey_draw, "the more important one keeps it");
        assert_eq!(s.hotkey_dictate, Settings::default().hotkey_dictate, "the other falls back to its own default");

        // Both of its options taken: left blank rather than silently dead.
        let mut s = Settings::default();
        s.hotkey_draw = "Ctrl+Alt+Space".into();
        s.hotkey_voice = "Ctrl+Alt+Space".into();
        s.hotkey_dictate = "Ctrl+Alt+Space".into();
        s.heal();
        assert_eq!(s.hotkey_draw, "Ctrl+Alt+Space");
        assert_eq!(s.hotkey_voice, Settings::default().hotkey_voice);
        assert!(s.hotkey_dictate.is_empty());
        // Case and stray spaces are the same chord.
        let mut s = Settings::default();
        s.hotkey_dictate = format!(" {} ", s.hotkey_draw.to_lowercase());
        s.heal();
        assert_ne!(s.hotkey_dictate.trim().to_lowercase(), s.hotkey_draw.to_lowercase());
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
        assert!(!s.learn_city, "old installs must opt in before sending a city to a map service");
        s.heal();
        assert!(s.show_captions && s.speak_responses);
        assert!(s.provider(ProviderId::NineRouter).is_some());
        assert_eq!(s.hotkey_quickdraw, "Ctrl+D");
        assert_eq!(s.control_style, "mouse");
        assert_eq!(s.orb_style, "liquid");
        assert!(s.economy_mode);
        assert_eq!(s.orb_response, 1.0);
        // The always-on desktop mate is retired: it stays off.
        assert!(!s.mate_enabled && s.mate_reset_v2);
        s.mate_enabled = true;
        s.heal();
        assert!(!s.mate_enabled);
        s.orb_response = 99.0;
        s.control_style = "unknown".into();
        s.orb_style = "unknown".into();
        s.heal();
        assert_eq!(s.orb_response, 1.5);
        assert_eq!(s.control_style, "mouse");
        assert_eq!(s.orb_style, "liquid");
    }

    #[test]
    fn learning_a_city_is_optional_and_round_trips() {
        let mut settings = Settings::default();
        assert!(!settings.learn_city);
        settings.learn_city = true;
        let restored: Settings = serde_json::from_value(serde_json::to_value(settings).unwrap()).unwrap();
        assert!(restored.learn_city);
    }
}
