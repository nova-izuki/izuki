/**
 * Typed bridge to the Rust core.
 *
 * Every call degrades gracefully when the page is opened in a plain browser
 * (plain `npm run dev`), so the glass panel can be designed without booting
 * the whole Tauri shell.
 */
import type {
  DesktopBounds,
  DrawSession,
  Flow,
  Settings,
  VisionPlan,
  Watcher,
  Memory,
  PhoneStatus,
  DiscordStatus,
  CallStatus,
  AppsAnswer,
  Reminder,
} from "./types";

export const IS_TAURI =
  typeof window !== "undefined" &&
  ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);

type Invoke = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
type Listen = <T>(event: string, handler: (e: { payload: T }) => void) => Promise<() => void>;

let invokeImpl: Invoke | null = null;
let listenImpl: Listen | null = null;
let emitImpl: ((event: string, payload?: unknown) => Promise<void>) | null = null;

async function core() {
  if (!IS_TAURI) return null;
  if (!invokeImpl) {
    const [{ invoke }, { listen, emit }] = await Promise.all([
      import("@tauri-apps/api/core"),
      import("@tauri-apps/api/event"),
    ]);
    invokeImpl = invoke as Invoke;
    listenImpl = listen as unknown as Listen;
    emitImpl = emit as unknown as typeof emitImpl;
  }
  return { invoke: invokeImpl!, listen: listenImpl!, emit: emitImpl! };
}

/** Invoke a Rust command, or fall back to `whenMocked` outside Tauri. */
export async function call<T>(
  cmd: string,
  args: Record<string, unknown> | undefined,
  whenMocked: () => T
): Promise<T> {
  const c = await core();
  if (!c) return whenMocked();
  return c.invoke<T>(cmd, args);
}

export async function on<T>(event: string, handler: (payload: T) => void): Promise<() => void> {
  const c = await core();
  if (!c) return () => {};
  return c.listen<T>(event, (e) => handler(e.payload));
}

export async function emit(event: string, payload?: unknown): Promise<void> {
  const c = await core();
  if (!c) return;
  await c.emit(event, payload);
}

// ---------------------------------------------------------------------------
// Mock data — only ever used when the page is not inside Tauri.
// ---------------------------------------------------------------------------

export const MOCK_SETTINGS: Settings = {
  active_provider: "gemini",
  fallback_provider: "nvidia",
  providers: [
    {
      id: "ollama",
      label: "Ollama (local, offline)",
      base_url: "http://127.0.0.1:11434",
      model: "moondream",
      api_key: "",
      enabled: true,
    },
    {
      id: "gemini",
      label: "Gemini 2.5 Flash (free tier)",
      base_url: "https://generativelanguage.googleapis.com",
      model: "gemini-2.5-flash",
      api_key: "",
      enabled: false,
    },
    {
      id: "openrouter",
      label: "OpenRouter (any vision model)",
      base_url: "https://openrouter.ai/api/v1",
      model: "google/gemma-4-31b-it:free",
      api_key: "",
      enabled: false,
    },
    {
      id: "openai",
      label: "OpenAI compatible",
      base_url: "https://api.openai.com/v1",
      model: "gpt-4.1-mini",
      api_key: "",
      enabled: false,
    },
    {
      id: "anthropic",
      label: "Anthropic Claude",
      base_url: "https://api.anthropic.com/v1",
      model: "claude-haiku-4-5-20251001",
      api_key: "",
      enabled: false,
    },
    {
      id: "nvidia",
      label: "NVIDIA NIM (free tier)",
      base_url: "https://integrate.api.nvidia.com/v1",
      model: "google/gemma-4-31b-it",
      api_key: "",
      enabled: false,
    },
    {
      id: "9router",
      label: "9Router (local, free providers)",
      base_url: "http://localhost:20128/v1",
      model: "kr/claude-haiku-4.5",
      api_key: "",
      enabled: false,
    },
    {
      id: "custom",
      label: "Custom endpoint",
      base_url: "http://127.0.0.1:8080/v1",
      model: "local-vlm",
      api_key: "",
      enabled: false,
    },
  ],
  hotkey_draw: "Ctrl+Shift+Space",
  hotkey_replay: "Ctrl+Shift+R",
  hotkey_panic: "Ctrl+Shift+Q",
  hotkey_voice: "Ctrl+Super+Space",
  hotkey_quickdraw: "Ctrl+D",
  freeze_screen: true,
  magnetic_hand: true,
  ghost_hand: true,
  ocr_enabled: true,
  autosave_flows: true,
  confirm_before_act: false,
  move_duration_ms: 320,
  dry_run: true,
  voice_wake_enabled: false,
  chat_mode: false,
  execution_mode: "focus",
  follow_mode_enabled: false,
  follow_hand_size: 16,
  backdrop: "acrylic",
  start_with_windows: false,
  trail_length: 12,
  onboarding_seen: true,
  default_draw_shape: "pen",
  ink_color: "auto",
  show_captions: true,
  speak_responses: true,
  voice_engine: "natural",
  voice_name: "af_heart",
  groq_api_key: "",
  cloud_voice: "",
  sphere_on_replies: true,
  mic_device: "",
  show_transcript: true,
  barge_in: true,
  duck_while_listening: true,
  cloud_ears: true,
  telegram_token: "",
  composio_api_key: "",
  call_enabled: false,
  call_token: "",
  composio_user_id: "",
  heads_up_email: true,
  heads_up_calendar: true,
  morning_brief: false,
  morning_brief_at: "08:00",
  heads_up_pc: true,
  heads_up_phone: true,
  n8n_hooks: [],
  school_feeds: [],
  heads_up_school: true,
  telegram_chat_id: 0,
  telegram_code: "",
  discord_token: "",
  discord_user_id: "",
  phone_controls_pc: true,
  follow_up_secs: 1800,
  chat_style: "auto",
  chat_color: "#7dd3fc",
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

let lastTypingPrefetch = 0;

export const api = {
  getSettings: () => call<Settings>("get_settings", undefined, () => MOCK_SETTINGS),
  saveSettings: (settings: Settings) =>
    call<Settings>("save_settings", { settings }, () => settings),

  listFlows: () => call<Flow[]>("list_flows", undefined, () => []),
  runFlow: (id: string) => call<void>("run_flow", { id }, () => undefined),
  deleteFlow: (id: string) => call<void>("delete_flow", { id }, () => undefined),
  renameFlow: (id: string, name: string) =>
    call<void>("rename_flow", { id, name }, () => undefined),

  listWatchers: () => call<Watcher[]>("list_watchers", undefined, () => []),
  toggleWatcher: (id: string, enabled: boolean) =>
    call<void>("toggle_watcher", { id, enabled }, () => undefined),
  deleteWatcher: (id: string) => call<void>("delete_watcher", { id }, () => undefined),

  openOverlay: () => call<void>("open_overlay", undefined, () => undefined),
  closeOverlay: () => call<void>("close_overlay", undefined, () => undefined),
  setOverlayInteractive: (interactive: boolean) =>
    call<void>("set_overlay_interactive", { interactive }, () => undefined),
  /** Clickable only while the cursor is over a floating widget — no focus steal. */
  setOverlayHit: (hit: boolean) => call<void>("set_overlay_hit", { hit }, () => undefined),
  /** Bring the overlay up (click-through) if a caption needs somewhere to render. */
  showCaptionOverlay: () => call<void>("show_caption_overlay", undefined, () => undefined),
  /** Write a diagnostic line into the app's process log. */
  listMemories: () => call<Memory[]>("list_memories", {}, () => []),
  addMemory: (text: string) => call<Memory | null>("add_memory", { text }, () => null),
  deleteMemory: (id: string) => call<void>("delete_memory", { id }, () => undefined),
  /** Drop every memory mentioning `about`; resolves to how many went. */
  forgetMemories: (about: string) => call<number>("forget_memories", { about }, () => 0),
  clearMemories: () => call<void>("clear_memories", {}, () => undefined),

  /** Whether a cloud speech model (Groq or Gemini key) is set up. */
  cloudEarsReady: () => call<boolean>("cloud_ears_ready", undefined, () => false),
  /** What was said in a WAV clip (base64), per the cloud model. Rejects → use the on-device words. */
  cloudTranscribe: (wavB64: string) =>
    call<string>("cloud_transcribe", { wavB64 }, () => {
      throw new Error("Not running inside Izuki.");
    }),
  /** Turn other apps' sound down while listening (true), back up (false). */
  duckAudio: (on: boolean) => call<void>("duck_audio", { on }, () => undefined),

  /** One sentence in a cloud voice ("orpheus" | "openai"), as WAV. */
  speakCloud: (engine: string, text: string, mood?: string | null) =>
    call<ArrayBuffer>("speak_cloud", { engine, text, mood: mood ?? null }, () => {
      throw new Error("Not running inside Izuki.");
    }),

  /** Fast conversation lane: stream a reply (words arrive as EV.chatDelta). */
  chatStream: (id: number, history: Array<{ role: string; content: string }>, expressive = false) =>
    call<void>("chat_stream", { id, history, expressive }, () => undefined),
  /** The Chat tab: the same lane, written rather than spoken. */
  chatStreamWritten: (id: number, history: Array<{ role: string; content: string }>) =>
    call<void>("chat_stream", { id, history, expressive: false, written: true }, () => undefined),
  /** A request in the user's apps (email, calendar, …) — the Composio lane. */
  appsAsk: (history: Array<{ role: string; content: string }>) =>
    call<AppsAnswer>("apps_ask", { history }, () => ({
      text: "Apps only work inside the Izuki app.",
      links: [],
    })),
  /** Play something on YouTube (and skip its ads): the title it started, or null. */
  playYoutube: (query: string) =>
    call<string | null>("play_youtube", { query }, () => {
      throw new Error("Not running inside Izuki.");
    }),
  appsTest: (key: string) => call<void>("apps_test", { key }, () => undefined),
  /** Apps linked through Composio ("gmail", "googlecalendar"…). */
  appsConnected: () => call<string[]>("apps_connected", undefined, () => ["gmail"]),
  /** A sign-in page for linking one app. */
  appsConnect: (toolkit: string) => call<string>("apps_connect", { toolkit }, () => "https://composio.dev"),
  /** Send a sample heads-up. */
  headsupTest: () => call<void>("headsup_test", undefined, () => undefined),
  callStatus: () => call<CallStatus>("call_status", undefined, () => ({ state: "off", link: "", error: null })),
  discordStatus: () =>
    call<DiscordStatus>("discord_status", undefined, () => ({ bot: "", invite: "", paired: false, code: "123456", error: null })),
  discordUnpair: () => call<Settings>("discord_unpair", undefined, () => MOCK_SETTINGS),
  phoneStatus: () =>
    call<PhoneStatus>("phone_status", undefined, () => ({ bot: "", paired: false, code: "123456", error: null })),
  phoneUnpair: () => call<Settings>("phone_unpair", undefined, () => MOCK_SETTINGS),
  remindersList: () => call<Reminder[]>("reminders_list", undefined, () => []),
  reminderRemove: (id: string) => call<void>("reminder_remove", { id }, () => undefined),
  chatCancel: (id: number) => call<void>("chat_cancel", { id }, () => undefined).catch(() => undefined),
  /** The wake-word models installed (file names) — the user's own. */
  listWakewords: () => call<string[]>("list_wakewords", {}, () => []),
  openWakewordsFolder: () => call<void>("open_wakewords_folder", {}, () => undefined),
  /** Copy freshly downloaded wake-word models in from Downloads; returns what was added. */
  importWakewords: () =>
    call<{ added: string[]; recordings: string[]; tflite: string[] }>("import_wakewords", {}, () => ({
      added: [],
      recordings: [],
      tflite: [],
    })),
  /** Keep a wake-word clip that wasn't understood (debug, newest dozen). */
  saveClip: async (name: string, wav: Uint8Array) => {
    if (!IS_TAURI) return;
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("save_clip", wav, { headers: { name } }).catch(() => undefined);
  },
  /** Start reading the screen now — the user is about to ask something. */
  prefetchScreen: () => call<void>("prefetch_screen", {}, () => undefined).catch(() => undefined),
  /** Same, from a keystroke — at most once every few seconds. */
  prefetchWhileTyping: () => {
    const now = Date.now();
    if (now - lastTypingPrefetch < 6000) return;
    lastTypingPrefetch = now;
    void api.prefetchScreen();
  },

  log: (message: string) =>
    call<void>("frontend_log", { message }, () => console.log(message)).catch(() => undefined),

  desktopBounds: () =>
    call<DesktopBounds>("desktop_bounds", undefined, () => ({
      x: 0,
      y: 0,
      w: window.screen.width,
      h: window.screen.height,
      scale: window.devicePixelRatio,
    })),

  frozenFrame: () => call<string | null>("frozen_frame", undefined, () => null),

  /** How bright/colourful the screen is just around an overlay box. */
  screenBackdrop: (x: number, y: number, w: number, h: number, scale: number) =>
    call<{ luma: number; color: number }>("screen_backdrop", { x, y, w, h, scale }, () => ({ luma: 0, color: 0 })),

  /** Answer Izuki's "which one? circle it" question (null = skip). */
  answerHelp: (session: DrawSession | null) => call<boolean>("answer_help", { session }, () => false),

  submitDraw: (session: DrawSession) =>
    call<VisionPlan>("submit_draw", { session }, () => ({
      steps: [],
      summary: "Not running inside Izuki.",
      provider: "mock",
      model: "mock",
      latency_ms: 0,
    })),

  /** "Hey Izuki, …" or a typed chat line — no marks, just a look and an ask. */
  submitVoiceCommand: (prompt: string) =>
    call<VisionPlan>("submit_voice_command", { prompt }, () => ({
      steps: [],
      summary: "Not running inside Izuki.",
      provider: "mock",
      model: "mock",
      latency_ms: 0,
    })),

  probeProvider: (id: string) =>
    call<string>("probe_provider", { id }, () => "Not running inside Izuki."),

  cursorPos: () => call<[number, number]>("cursor_pos", undefined, () => [0, 0]),

  clipRegion: (region: { x: number; y: number; w: number; h: number }) =>
    call<string>("clip_region", { region }, () => ""),

  ghostPredict: () =>
    call<{ x: number; y: number; confidence: number; app: string } | null>(
      "ghost_predict",
      undefined,
      () => null
    ),

  panic: () => call<void>("panic_stop", undefined, () => undefined),
  /** Izuki is thinking/working/talking — Esc stops it only then. */
  setBusy: (busy: boolean) => call<void>("set_busy", { busy }, () => undefined),
  /** Stop the task in progress (no more clicks, no late answer). */
  cancelTask: () => call<void>("cancel_task", undefined, () => undefined),
  /** Developer self-test mode (IZUKI_SELFTEST=1). */
  selftestEnabled: () => call<string>("selftest_enabled", undefined, () => ""),
  /** Instant skill: open an installed app by name (rejects if none matches). */
  openApp: (name: string) =>
    call<string>("open_app", { name }, () => {
      throw new Error("not in Izuki");
    }),
  /** Instant skill: open a web address in the default browser. */
  openUrl: (url: string) => call<void>("open_url", { url }, () => undefined),
  /** Close Izuki completely. */
  quitApp: () => call<void>("quit_app", undefined, () => undefined),

  showConfig: (tab?: string) => call<void>("show_config", { tab }, () => undefined),
};

// ---------------------------------------------------------------------------
// Event names — keep in sync with src-tauri/src/events.rs
// ---------------------------------------------------------------------------

export const EV = {
  overlayOpen: "izuki://overlay-open",
  overlayClose: "izuki://overlay-close",
  /** A new task: clear what Izuki drew while explaining the last one. */
  penClear: "izuki://pen-clear",
  frozenFrame: "izuki://frozen-frame",
  hand: "izuki://hand",
  status: "izuki://status",
  flowsChanged: "izuki://flows-changed",
  watchersChanged: "izuki://watchers-changed",
  navigate: "izuki://navigate",
  cursor: "izuki://cursor",
  pushToTalk: "izuki://push-to-talk",
  pushToTalkRelease: "izuki://push-to-talk-release",
  /** Fired when the quickdraw hotkey is released — the overlay submits
   * whatever's been sketched, or just quietly closes if nothing was. */
  quickdrawCommit: "izuki://quickdraw-commit",
  /** Frontend-only, same cross-window pattern as `listening`: a caption for
   * whatever Izuki just said, shown in the overlay. Gated by `show_captions`. */
  caption: "izuki://caption",
  /** Frontend-only: live mic loudness (0..1) during push-to-talk, ~20Hz, so
   * the overlay's voice ring can move with your voice. */
  voiceLevel: "izuki://voice-level",
  /** Frontend-only: the config panel just saved settings — the overlay
   * (which keeps no settings of its own) re-reads what it needs. */
  settingsChanged: "izuki://settings-changed",
  /** Frontend-only: put the chat bubble and oval chat back where they start. */
  resetFloating: "izuki://reset-floating",
  /** Frontend-only: the overlay asks the config panel (where the voice
   * engine lives) to say a line — one voice, never two talking at once. */
  say: "izuki://say",
  /** A request is on its way — get the voice ready (Bluetooth mic hold). */
  prepareVoice: "izuki://prepare-voice",
  /** Overlay → config panel: save these settings (the overlay can't). */
  patchSettings: "izuki://patch-settings",
  /** Your words live while you talk: TranscriptPayload ("" clears it). */
  transcript: "izuki://transcript",
  /** Overlay → config panel: handle this typed message ({id, text}). */
  runChat: "izuki://run-chat",
  /** Config panel → overlay: that message is handled ({id}). */
  chatDone: "izuki://chat-done",
  /** Streamed words of a conversation reply (chat.rs). */
  chatDelta: "izuki://chat-delta",
  /** Custom wake words were added or removed — the detector reloads. */
  wakewordsChanged: "izuki://wakewords-changed",
  /** The hands-free voice sphere: OrbState. */
  orb: "izuki://orb",
  /** Memories were added or removed — the Memory list refreshes. */
  memoryChanged: "izuki://memory-changed",
  remindersChanged: "izuki://reminders-changed",
  phoneChanged: "izuki://phone-changed",
  callChanged: "izuki://call-changed",
  discordChanged: "izuki://discord-changed",
  /** Frontend-only: Izuki's voice started (true) or stopped (false) talking. */
  speaking: "izuki://speaking",
  /** Cut Izuki off mid-sentence. Sent by the chat's stop button, the
   * caption's ×, a new command, and (from Rust) the Stop hotkey/tray item. */
  stopSpeaking: "izuki://stop-speaking",
  /** A Ctrl+D / draw-overlay request, handed to the one session (VoiceEngine). */
  runDraw: "izuki://run-draw",
  /** Izuki asks the user to show it something (payload: the question). */
  helpAsk: "izuki://help-ask",
  helpDone: "izuki://help-done",
  /** Frontend-only: a voice/chat command is out with the model (true) or back (false). */
  thinking: "izuki://thinking",
  /** Frontend-only signal — never emitted from Rust. "Hey Izuki, chat" in
   * follow mode needs to reach the overlay window's own floating widget,
   * which is a different webview from wherever the voice engine is running. */
  openFloatingChat: "izuki://open-floating-chat",
  /** Frontend-only, mirrors `openFloatingChat`'s cross-window pattern: the
   * mic lives in the config panel's `VoiceEngine`, but the "I'm listening"
   * indicator has to render in the overlay window. */
  listening: "izuki://listening",
} as const;
