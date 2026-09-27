/**
 * Shared vocabulary between the React windows and the Rust core.
 * Every field here has a matching serde field name in src-tauri/src/model.rs.
 */

export type ShapeKind = "box" | "arrow" | "circle" | "pen" | "text";

/** What the user wants Izuki to do with a given mark. */
export type Intent =
  | "auto"
  | "click"
  | "double_click"
  | "right_click"
  | "type"
  | "drag"
  | "watch"
  | "copy"
  | "scroll"
  | "hover"
  | "point"
  | "key"
  | "draw"
  | "open_app"
  | "open_url"
  | "search"
  | "play_youtube";

export interface Point {
  x: number;
  y: number;
}

/** A single mark drawn on the overlay, in virtual-desktop pixel space. */
export interface Mark {
  id: string;
  kind: ShapeKind;
  /** Axis-aligned bounds of the mark. */
  rect: { x: number; y: number; w: number; h: number };
  /** Freehand / arrow path. Arrows keep exactly two points. */
  points: Point[];
  intent: Intent;
  /** Position in a chain: 1 -> 2 -> 3. */
  order: number;
  /** Typed or dictated text attached to this mark. */
  text?: string;
  /** OCR harvested from inside the mark, filled in by the backend. */
  ocr?: string;
}

/** Everything the overlay hands to the brain when the user commits. */
export interface DrawSession {
  marks: Mark[];
  prompt: string;
  /** Bounds of the whole virtual desktop the marks were drawn on. */
  desktop: { x: number; y: number; w: number; h: number };
  createdAt: number;
}

/** One executable step the vision model returned. */
export interface ActionStep {
  action: Intent;
  x: number;
  y: number;
  /** Id of a real on-screen control the model picked — exact, not a guess. */
  target?: number | null;
  /** Drag destination as a control id. */
  target2?: number | null;
  x2?: number | null;
  y2?: number | null;
  text_to_type?: string | null;
  key?: string | null;
  scroll_amount?: number | null;
  confidence: number;
  reasoning: string;
  /** Set by the backend when UI Automation snapped the point to a real control. */
  snapped_to?: string | null;
  hover_first?: boolean;
}

export interface VisionPlan {
  steps: ActionStep[];
  summary: string;
  provider: string;
  model: string;
  /** Wall-clock milliseconds the provider took. */
  latency_ms: number;
  /** How the summary should sound when spoken. */
  mood?: string | null;
  /** Lasting facts about the user the model picked up (already saved). */
  remember?: string[];
}

/** Something Izuki remembers about the user. */
export interface Reminder {
  id: string;
  /** Due, Unix ms. */
  at: number;
  text: string;
}

export interface AppsAnswer {
  text: string;
  /** Sign-in links for apps not connected yet: [app, url]. */
  links: Array<[string, string]>;
}

export interface CallStatus {
  /** "off" | "downloading" | "starting" | "ready" | "error" */
  state: string;
  link: string;
  error: string | null;
}

export interface DiscordStatus {
  bot: string;
  /** Adds the bot to a server of yours (you can DM it after). */
  invite: string;
  paired: boolean;
  code: string;
  error: string | null;
}

export interface PhoneStatus {
  bot: string;
  paired: boolean;
  code: string;
  error: string | null;
}

export interface Memory {
  id: string;
  text: string;
  created_at: number;
}

/** The hands-free voice sphere's state ("hidden" puts it away). */
export type OrbState = "hidden" | "listening" | "thinking" | "speaking";

/** Your words as you speak them (`final` once you've finished). */
export interface TranscriptPayload {
  text: string;
  final: boolean;
}

/** A line for the voice, with the feeling to say it with. */
export interface SayPayload {
  text: string;
  mood?: string | null;
  /** A real answer (not an "On it."), so the sphere may show for it. */
  reply?: boolean;
  /** Keep a Bluetooth mic held (more of this reply follows). */
  quick?: boolean;
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

export interface Flow {
  id: string;
  name: string;
  /** Application the flow was recorded against, e.g. "chrome.exe". */
  app: string;
  steps: ActionStep[];
  prompt: string;
  /** Data URL of the thumbnail captured at record time. */
  thumbnail?: string | null;
  created_at: number;
  last_run?: number | null;
  run_count: number;
  hotkey?: string | null;
}

// ---------------------------------------------------------------------------
// Watchers
// ---------------------------------------------------------------------------

export type WatcherCondition =
  | { kind: "pixel_color"; color: string; tolerance: number }
  | { kind: "region_changed"; threshold: number }
  | { kind: "text_appears"; text: string }
  | { kind: "text_disappears"; text: string }
  | { kind: "vision"; question: string };

export type WatcherAction =
  | { kind: "click"; x: number; y: number }
  | { kind: "run_flow"; flow_id: string }
  | { kind: "notify" }
  | { kind: "type"; text: string };

export interface Watcher {
  id: string;
  name: string;
  region: { x: number; y: number; w: number; h: number };
  condition: WatcherCondition;
  action: WatcherAction;
  /** Poll cadence in milliseconds. */
  interval_ms: number;
  enabled: boolean;
  /** Stop after the first trigger. */
  once: boolean;
  created_at: number;
  last_checked?: number | null;
  last_triggered?: number | null;
  trigger_count: number;
  status: "idle" | "watching" | "triggered" | "error";
  message?: string | null;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type ProviderId =
  | "ollama"
  | "gemini"
  | "openrouter"
  | "openai"
  | "anthropic"
  | "nvidia"
  | "9router"
  | "xai"
  | "custom";

export interface ProviderConfig {
  id: ProviderId;
  /** Display label shown in the settings list. */
  label: string;
  /** Base URL; for Ollama this is the local daemon. */
  base_url: string;
  model: string;
  api_key: string;
  enabled: boolean;
}

export type BackdropMode = "acrylic" | "mica" | "tabbed" | "none";

export interface Settings {
  /** Provider consulted first. */
  active_provider: ProviderId;
  /** Consulted when the active provider errors or times out. */
  fallback_provider: ProviderId | null;
  providers: ProviderConfig[];

  hotkey_draw: string;
  hotkey_replay: string;
  hotkey_panic: string;
  /** Push-to-talk: press it, speak, and Izuki acts on it — no wake word needed. */
  hotkey_voice: string;
  /** Hold it, drag one mark anywhere on screen, let go — no toolbar, no window. */
  hotkey_quickdraw: string;

  /** Paint the captured frame behind the overlay so the screen looks frozen. */
  freeze_screen: boolean;
  /** Snap targets to real UI Automation controls before clicking. */
  magnetic_hand: boolean;
  /** Show the predicted next click after enough samples. */
  ghost_hand: boolean;
  /** Run OCR over marks before asking the model. */
  ocr_enabled: boolean;
  /** Every committed draw becomes a saved flow. */
  autosave_flows: boolean;
  /** Ask before executing a plan. */
  confirm_before_act: boolean;
  /** Pointer travel time in ms for the humanised cursor path. */
  move_duration_ms: number;
  /** Mock mode performs no real input; it only animates the hand. */
  dry_run: boolean;

  /** Always-listening "Hey Izuki" wake word. Off by default — it holds a live mic stream. */
  voice_wake_enabled: boolean;
  /** Show a typed chat box on the Draw tab instead of (or alongside) the mic. */
  chat_mode: boolean;
  /**
   * How a voice/chat command is carried out. Windows has exactly one cursor,
   * so "background" cannot literally share it with you — it just skips the
   * fullscreen freeze/overlay so your window stays visible and gets the
   * pointer back the instant Izuki is done with it. "focus" puts up the same
   * overlay the draw flow uses and holds it until the whole plan finishes.
   */
  execution_mode: "background" | "focus";

  /**
   * Keep the glowing hand on screen at all times, tracking the real cursor,
   * whether or not the config panel is open — the "don't need the app open"
   * mode.
   */
  follow_mode_enabled: boolean;
  /** Size of the follow-mode hand, in px. */
  follow_hand_size: number;

  backdrop: BackdropMode;
  start_with_windows: boolean;
  /** Hand cursor trail length, 0 disables the trail. */
  trail_length: number;

  /** Set once the first-run welcome tour has finished or been skipped. */
  onboarding_seen: boolean;

  /** Which mark shape a fresh draw session — and quickdraw — starts on. */
  default_draw_shape: ShapeKind;
  /** Ink for drawn marks: a hex colour, "auto" (per-shape colours) or "gradient" (per-shape gradients). */
  ink_color: string;
  /** Show a live caption of what Izuki is doing/saying near the hand. */
  show_captions: boolean;
  /** Speak responses out loud, independent of `show_captions`. */
  speak_responses: boolean;
  /**
   * "edge" (Microsoft's free natural voices, online), "natural" (Kokoro, on
   * this PC), "orpheus" (Groq), "openai" (ChatGPT), "gemini" (Gemini, free key)
   * or "system" (Windows).
   */
  voice_engine: "edge" | "natural" | "orpheus" | "openai" | "gemini" | "system";
  /** Kokoro voice id, e.g. "af_heart". */
  voice_name: string;
  /** Groq key for the Orpheus voice. */
  groq_api_key: string;
  /** Cloud voice name ("" = the character's own). */
  cloud_voice: string;
  /** Izuki's character (voices.rs): "nova", "leo", "rex"… */
  persona: string;
  /** The user's name for it ("" = the character's). */
  persona_name: string;
  /** A natural voice of the user's choosing ("" = the character's). */
  persona_voice: string;
  /** Extra personality, in the user's words. */
  persona_style: string;
  /** Speed (%) and pitch (Hz) on top of the character's. */
  voice_rate: number;
  voice_pitch: number;
  voices_v2: boolean;
  /** Show the voice sphere while Izuki answers typed/push-to-talk requests. */
  sphere_on_replies: boolean;
  /** Microphone name to listen with ("" = automatic). */
  mic_device: string;
  /** Show your own words live as you talk. */
  show_transcript: boolean;
  /** Talk over Izuki to interrupt it (it listens while it answers). */
  barge_in: boolean;
  /** Turn other apps' sound down while Izuki listens. */
  duck_while_listening: boolean;
  /** Double-check your words with a cloud speech model (Groq or Gemini key). */
  cloud_ears: boolean;
  /** Telegram bot token from @BotFather — Izuki on your phone. */
  telegram_token: string;
  /** The paired Telegram chat (0 = none). */
  telegram_chat_id: number;
  /** The code sent to the bot once to pair. */
  telegram_code: string;
  /** Discord bot token — Izuki on your phone through Discord. */
  discord_token: string;
  /** The paired Discord user ("" = none). */
  discord_user_id: string;
  /** Let the paired phone do things on this PC. */
  phone_controls_pc: boolean;
  /** Your free Composio key — Izuki in Gmail, Calendar, Drive, Slack… */
  composio_api_key: string;
  /** "Call Izuki" — the hands-free phone page through a free tunnel. */
  call_enabled: boolean;
  call_token: string;
  composio_user_id: string;
  /** Heads-up: new emails as they arrive. */
  heads_up_email: boolean;
  /** Heads-up: a few minutes before a meeting. */
  heads_up_calendar: boolean;
  /** A short brief every morning. */
  morning_brief: boolean;
  /** "HH:MM" local time for the morning brief. */
  morning_brief_at: string;
  /** Heads-ups as Windows notifications on this PC. */
  heads_up_pc: boolean;
  /** Heads-ups sent to the paired phone. */
  heads_up_phone: boolean;
  /** The user's n8n workflows, started by name. */
  n8n_hooks: N8nHook[];
  /** The user's n8n address and API key — to import their workflows. */
  n8n_url: string;
  n8n_api_key: string;
  /** Private calendar links (.ics) from Blackboard, Canvas… for due dates. */
  school_feeds: string[];
  /** Heads-up: school work due soon. */
  heads_up_school: boolean;
  /** How long a conversation waits for you before closing (seconds, 5…1800). */
  follow_up_secs: number;
  /** Chat/caption look: matched to the screen, or fixed. */
  chat_style: "auto" | "dark" | "light" | "gradient" | "custom";
  /** Text colour for `chat_style: "custom"`. */
  chat_color: string;
}

// ---------------------------------------------------------------------------
// Runtime events pushed from Rust
// ---------------------------------------------------------------------------

export interface DesktopBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
}

export interface OverlayOpenPayload {
  desktop: DesktopBounds;
  freeze: boolean;
  mode: "draw" | "watch" | "preview" | "follow" | "quickdraw";
  /** The mark shape to start on — only set for `mode: "quickdraw"`. */
  shape?: ShapeKind | null;
}

/** Push-to-talk state, sent from the config panel's mic to the overlay. */
export interface ListeningPayload {
  active: boolean;
  /** Whether "Always show the hand" is on — decides hand-orb vs. mic badge. */
  follow: boolean;
}

/** One line Izuki said, for the overlay's live caption box. */
export interface CaptionPayload {
  text: string;
  /** Reveal word-by-word at speaking pace (voice is on) vs. near-instantly. */
  paced: boolean;
}

/** Real cursor position, virtual-desktop pixels — driving the hand in follow mode. */
export interface CursorPosition {
  x: number;
  y: number;
}

export interface HandCommand {
  /** Virtual-desktop coordinates the hand should travel to. */
  x: number;
  y: number;
  /** Set for drags — where the sketchy arrow should point to. */
  x2?: number | null;
  y2?: number | null;
  action: Intent;
  duration_ms: number;
  label?: string | null;
  /** For "draw": circle, box, underline, arrow or note — and a note's words. */
  shape?: string | null;
  text?: string | null;
}

export interface StatusEvent {
  kind: "info" | "working" | "success" | "error";
  message: string;
  detail?: string | null;
}

/** One of the user's n8n workflows (a webhook Izuki can call by name). */
export interface N8nHook {
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Voices and characters (voices.rs)
// ---------------------------------------------------------------------------

export interface Persona {
  id: string;
  name: string;
  /** Everyday · Accents · Languages · Characters */
  group: string;
  blurb: string;
  /** Natural (Edge) voice, e.g. "en-GB-SoniaNeural". */
  voice: string;
  rate: number;
  pitch: number;
  /** On-device (Kokoro) voice for when offline. */
  kokoro: string;
  orpheus: string;
  openai: string;
  /** e.g. "en-NG", "es-ES". */
  lang: string;
  style: string;
  sample: string;
  /** Swears and roasts. */
  spicy: boolean;
}

export interface VoiceCatalog {
  personas: Persona[];
  voices: Array<{ id: string; label: string }>;
}

/** A key the user just copied (keys.rs). */
export interface FoundKey {
  kind: "gemini" | "groq" | "openrouter" | "xai" | "nvidia" | "anthropic" | "openai" | "composio" | "telegram";
  label: string;
  key: string;
}

export interface N8nImport {
  hooks: N8nHook[];
  /** Workflows left out, and why. */
  skipped: string[];
}
