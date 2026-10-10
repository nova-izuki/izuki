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
  IslandStatus,
  Note,
  VoiceCatalog,
  FoundKey,
  N8nImport,
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
      model: "gemini-flash-latest",
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
      id: "xai",
      label: "Grok (xAI)",
      base_url: "https://api.x.ai/v1",
      model: "grok-4-fast-non-reasoning",
      api_key: "",
      enabled: false,
    },
    {
      id: "groq",
      label: "Groq (free, very fast)",
      base_url: "https://api.groq.com/openai/v1",
      model: "qwen/qwen3.8-27b",
      api_key: "",
      enabled: false,
    },
    {
      id: "mistral",
      label: "Mistral (free plan)",
      base_url: "https://api.mistral.ai/v1",
      model: "mistral-small-latest",
      api_key: "",
      enabled: false,
    },
    {
      id: "meta",
      label: "Meta Llama (free preview)",
      base_url: "https://api.llama.com/compat/v1",
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
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
  control_style: "mouse",
  orb_style: "liquid",
  orb_response: 1,
  automatic_update_checks: true,
  economy_mode: true,
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
  island_enabled: true,
  music_visuals: false,
  tv_host: "",
  tv_pair: "",
  tv_voice: true,
  tv_orb: "",
  lan_link: false,
  linked_devices: [],
  buddy_speaks: true,
  buddy_acts: true,
  buddy_breaks: true,
  recall_enabled: false,
  screen_time_enabled: true,
  home_city: "",
  app_theme: "nova",
  app_theme_color: "",
  flows_keep_days: 1,
  wake_sensitivity: "normal",
  keep_reply: false,
  island_suggestions: true,
  auto_skip_ads: false,
  auto_reject_cookies: false,
  follow_hand_size: 16,
  backdrop: "acrylic",
  start_with_windows: false,
  trail_length: 12,
  onboarding_seen: true,
  default_draw_shape: "pen",
  ink_color: "auto",
  show_captions: true,
  speak_responses: true,
  voice_engine: "edge",
  voice_name: "af_heart",
  groq_api_key: "",
  cloud_voice: "",
  azure_speech_key: "",
  azure_speech_region: "eastus",
  elevenlabs_key: "",
  persona: "nova",
  persona_name: "",
  persona_voice: "",
  persona_style: "",
  voice_rate: 0,
  voice_pitch: 0,
  voices_v2: true,
  sphere_on_replies: true,
  mic_device: "",
  show_transcript: true,
  barge_in: true,
  send_bug_reports: true,
  duck_while_listening: true,
  cloud_ears: true,
  pc_boost: true,
  match_voice_face: true,
  pc_boost_auto: false,
  pc_boost_power_plan: false,
  speech_language: "auto",
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
  n8n_url: "",
  n8n_api_key: "",
  school_feeds: [],
  heads_up_school: true,
  telegram_chat_id: 0,
  telegram_code: "",
  discord_token: "",
  discord_user_id: "",
  phone_controls_pc: true,
  android_enabled: false,
  android_addr: "",
  adult_ok: false,
  chat_auto_run: false,
  follow_up_secs: 1800,
  chat_style: "auto",
  chat_color: "#7dd3fc",
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

let lastTypingPrefetch = 0;

/** PC Boost's look at the PC (boost.rs). */
export interface CleanItem { id: string; name: string; kind: "bloat" | "startup"; recommended: boolean; scope: string }
export interface DeepReport { said: string; freed_mb: number; ram_freed_mb: number; closed: string[]; bloat: CleanItem[]; startup: CleanItem[]; skipped: string[] }
export interface BoostHealth {
  cpu: number;
  ram: number;
  ram_free_gb: number;
  lagging: boolean;
  hogs: Array<{ pid: number; name: string; cpu: number; mem_mb: number; window: boolean }>;
}

/** Where the Island's camera leaves a picture for Chat to pick up. */
export const CAMERA_PICTURE_KEY = "izuki.camera-picture";

export const api = {
  getSettings: () => call<Settings>("get_settings", undefined, () => MOCK_SETTINGS),
  saveSettings: (settings: Settings) =>
    call<Settings>("save_settings", { settings }, () => settings),

  listFlows: () => call<Flow[]>("list_flows", undefined, () => []),
  runFlow: (id: string) => call<void>("run_flow", { id }, () => undefined),
  deleteFlow: (id: string) => call<void>("delete_flow", { id }, () => undefined),
  archiveFlows: (ids: string[]) => call<string>("archive_flows", { ids }, () => { throw new Error("Open the desktop app to clear saved flows."); }),
  restoreFlows: (token: string) => call<number>("restore_flows", { token }, () => 0),
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
  duckAudio: (on: boolean, source: "listening" | "speaking" = "listening") => call<void>("duck_audio", { on, source }, () => undefined),

  /** A key on the clipboard (Gemini, Groq, Composio…), if that's what's there. */
  clipboardKey: () => call<FoundKey | null>("clipboard_key", undefined, () => null),
  /** What kind of key some pasted text is, if it's one. */
  recogniseKey: (text: string) => call<FoundKey | null>("recognise_key", { text }, () => null),
  /** The user's n8n workflows that Izuki can run by name. */
  n8nImport: (address: string, apiKey: string) =>
    call<N8nImport>("n8n_import", { address, apiKey }, () => {
      throw new Error("Not running inside Izuki.");
    }),
  /** Every character and natural voice (voices.rs). */
  voiceCatalog: () => call<VoiceCatalog>("voice_catalog", undefined, () => ({ personas: [], voices: [] })),
  /**
   * A sample line in a voice (MP3 or WAV bytes). `persona` previews that
   * character as it comes; none = the current one with the user's tweaks.
   * Rejects with the exact reason a voice can't speak.
   */
  voiceTest: (engine: string, persona?: string | null, text?: string | null) =>
    call<ArrayBuffer>("voice_test", { engine, persona: persona ?? null, text: text ?? null }, () => {
      throw new Error("Not running inside Izuki.");
    }),
  /** One sentence in a cloud voice ("edge" | "orpheus" | "openai" | "gemini"), as audio. */
  speakCloud: (engine: string, text: string, mood?: string | null) =>
    call<ArrayBuffer>("speak_cloud", { engine, text, mood: mood ?? null }, () => {
      throw new Error("Not running inside Izuki.");
    }),

  /** Fast conversation lane: stream a reply (words arrive as EV.chatDelta). */
  chatStream: (id: number, history: Array<{ role: string; content: string }>, expressive = false) =>
    call<void>("chat_stream", { id, history, expressive }, () => undefined),
  /** Is the Izuki browser extension connected? */
  extStatus: () => call<boolean>("ext_status", undefined, () => false),
  /** Nova Notes. */
  notesList: () => call<Note[]>("notes_list", undefined, () => []),
  notesDelete: (id: string) => call<void>("notes_delete", { id }, () => undefined),
  notesCapture: () => call<Note>("notes_capture", undefined, () => { throw new Error("Notes work in the Izuki app on your PC."); }),
  notesLesson: (text: string) => call<Note>("notes_lesson", { text }, () => { throw new Error("no app"); }),
  notesFlashcards: (id: string) => call<Note>("notes_flashcards", { id }, () => { throw new Error("no app"); }),
  /** "Allow"/"no" for the change Izuki asked about out loud (null: none waiting). */
  chatAllowLast: (allow: boolean) => call<string | null>("chat_allow_last", { allow }, () => null),
  /** The Chat tab: the same lane, written rather than spoken. */
  chatStreamWritten: (id: number, history: Array<{ role: string; content: string; images?: string[] }>) =>
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
  /** Allow / No on a change the chat asked to make; what happened. */
  chatAction: (id: number, allow: boolean) => call<string>("chat_action", { id, allow }, () => (allow ? "Done." : "Not done.")),
  /** Show the Izuki browser (to sign in to a site once), optionally at `url`. */
  browserShow: (url?: string) =>
    call<void>("browser_show", { url: url ?? null }, () => void (url && window.open(url, "_blank"))),
  browserVideo: (action: "read" | "pause" | "play" | "slow" | "normal", showWindow = false, expectedVideo?: string) =>
    call<{ paused: boolean; rate: number; time: number; title: string; url: string; captions: string; focused: boolean; videoId: string }>("browser_video", { action, showWindow, expectedVideo }, () => { throw new Error("Open a video in the desktop Izuki browser first."); }),
  /** Send a sample heads-up. */
  headsupTest: () => call<void>("headsup_test", undefined, () => undefined),
  callStatus: () => call<CallStatus>("call_status", undefined, () => ({ state: "off", link: "", error: null })),
  discordStatus: () =>
    call<DiscordStatus>("discord_status", undefined, () => ({ bot: "", invite: "", paired: false, online: false, code: "123456", error: null })),
  discordTest: () => call<void>("discord_test", undefined, () => { throw new Error("Open the Windows app to test Discord delivery."); }),
  discordUnpair: () => call<Settings>("discord_unpair", undefined, () => MOCK_SETTINGS),
  phoneStatus: () =>
    call<PhoneStatus>("phone_status", undefined, () => ({ bot: "", paired: false, code: "123456", error: null })),
  phoneUnpair: () => call<Settings>("phone_unpair", undefined, () => MOCK_SETTINGS),
  remindersList: () => call<Reminder[]>("reminders_list", undefined, () => []),
  /** Find the TV on the Wi-Fi (fresh = look again). */
  tvFind: (fresh: boolean) =>
    call<{ host: string; name: string; on: boolean; allowed: boolean } | null>("tv_find", { fresh }, () => null),
  /** Show the orb's state (and words) on the Izuki TV channel, if it's open. */
  /** True when the TV is saying it (so the PC stays quiet). */
  tvShow: (state: string, text?: string) => call<boolean>("tv_show", { state, text: text ?? null }, () => false),
  /** What's open on the TV (Roku), for the status screen. */
  tvNow: () => call<string | null>("tv_now", undefined, () => null),
  /** The Izuki channel on the Roku: its version there, and this app's. */
  tvChannelStatus: () => call<{ installed: string; latest: string; roku: boolean }>("tv_channel_status", undefined, () => ({ installed: "", latest: "", roku: false })),
  /** Put this app's channel on the Roku (password: its developer password, saved here). */
  tvChannelUpdate: (password?: string) => call<string>("tv_channel_update", { password: password ?? null }, () => "Updating the TV only works in the Izuki app on your PC."),
  linkStatus: () =>
    call<{ running: boolean; ip: string | null; devices: Array<{ name: string; kind: string; added: string }> }>("link_status", {}, () => ({ running: false, ip: null, devices: [] })),
  linkForget: (name: string) => call<void>("link_forget", { name }, () => undefined),
  systemPulse: () =>
    call<{ cpu: number | null; memory: number | null; disk_free_gb: number | null; battery: [number, boolean] | null; online: boolean } | null>("system_pulse", {}, () => null),
  recallForget: () => call<void>("recall_forget", {}, () => undefined),
  /** A live activity's button: "open:…", "show:…", "copytext:…", "unzip:…". What to say back, if anything. */
  activityDo: (op: string) => call<string | null>("activity_do", { op }, () => null),
  copyAgain: (index: number) => call<boolean>("copy_again", { index }, () => false),
  /** Talk-to-type: put these words where the cursor is, in the app in front. */
  typeHere: (text: string) => call<boolean>("type_here", { text }, () => false),
  laterList: () => call<Array<{ id: string; text: string; done: boolean; added: number }>>("later_list", {}, () => []),
  laterAdd: (text: string) => call<string>("later_add", { text }, () => ""),
  laterDone: (id: string, done: boolean) => call<void>("later_done", { id, done }, () => undefined),
  laterRemove: (id: string) => call<void>("later_remove", { id }, () => undefined),
  /** "Open Netflix on the TV". What Izuki says back. */
  tvDo: (said: string) => call<string>("tv_do", { said }, () => "TV control works in the Izuki app on your PC."),
  /** The Island's look: what's playing, and whether a film/game is full screen. */
  islandStatus: () => call<IslandStatus>("island_status", undefined, () => ({ media: null, fullscreen: false, suggestions: [], context: "" })),
  /** What the overlay should be showing now (JSON of the last open), if it's up. */
  overlayState: () => call<string | null>("overlay_state", undefined, () => null),
  /** Music mode: the PC's sound level drives the orb (on/off). */
  musicMeter: (on: boolean) => call<void>("music_meter", { on }, () => undefined),
  /** Island audio level: continuous waveform flow for any PC sound. */
  islandAudioMeter: (on: boolean) => call<void>("island_audio_meter", { on }, () => undefined),
  /** ⏮ ⏯ ⏭ for whatever is playing on the PC. */
  mediaControl: (action: "play" | "pause" | "next" | "previous") => call<boolean>("media_control", { action }, () => false),
  reminderRemove: (id: string) => call<void>("reminder_remove", { id }, () => undefined),
  boostHealth: () => call<BoostHealth>("boost_health", undefined, () => ({ cpu: 0, ram: 0, ram_free_gb: 0, lagging: false, hogs: [] })),
  voiceForFace: (male: boolean) => call<{ id: string; name: string; kokoro: string } | null>("voice_for_face", { male }, () => null),
  boostNow: () => call<string>("boost_now", undefined, () => "PC Boost only works inside the Izuki app."),
  boostDeep: () => call<DeepReport>("boost_deep", undefined, () => ({ said: "PC Boost only works inside the Izuki app.", freed_mb: 0, ram_freed_mb: 0, closed: [], bloat: [], startup: [], skipped: [] })),
  boostRemove: (bloat: string[], startup: string[]) => call<string>("boost_remove", { bloat, startup }, () => "PC Boost only works inside the Izuki app."),
  boostUndoStartup: () => call<string>("boost_undo_startup", undefined, () => "PC Boost only works inside the Izuki app."),
  boostAdmin: (startup: string[]) => call<string>("boost_admin", { startup }, () => "PC Boost only works inside the Izuki app."),
  boostPowerPlan: (on: boolean) => call<string>("boost_power_plan", { on }, () => { throw new Error("Power plans can only be changed inside the Windows app."); }),
  boostActivePowerPlan: () => call<string>("boost_active_power_plan", undefined, () => "unknown"),
  alarmSnooze: (text: string, minutes: number) => call<Reminder>("alarm_snooze", { text, minutes }, () => ({ id: "", at: 0, text })),
  chatCancel: (id: number) => call<void>("chat_cancel", { id }, () => undefined).catch(() => undefined),
  /** Connect to the paired Android phone. */
  androidConnect: () => call<string>("android_connect", undefined, () => { throw new Error("not in Izuki"); }),
  /** Do something on the phone from the PC ("… on my phone"). */
  androidDo: (prompt: string) => call<string>("android_do", { prompt }, () => { throw new Error("not in Izuki"); }),
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

  /** "Report a problem": the user's words + recent log to the bug tracker.
   *  false = saved in the log file only (reports not set up yet). */
  reportBug: (what: string) => call<boolean>("report_bug", { what }, () => false),
  bugReportsReady: () => call<boolean>("bug_reports_ready", undefined, () => false),
  openLogFolder: () => call<void>("open_log_folder", undefined, () => undefined),
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
  /** "Scroll down", "louder", "next song"…: done at once in Rust with no AI;
   *  the few words to say back, or null when it isn't one (instant.rs). */
  instantCommand: (said: string) => call<string | null>("instant_command", { said }, () => null),
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
  /** Frontend-only: live audio level (0..1) for Island waveform — music,
   * video, any PC sound. ~30Hz, drives the Island's continuous flow. */
  islandAudioLevel: "izuki://island-audio-level",
  /** Frontend-only: a still from the Island's camera (a data: URL) for Chat
   * to attach to the next message. */
  chatPicture: "izuki://chat-picture",
  /** Frontend-only: the config panel just saved settings — the overlay
   * (which keeps no settings of its own) re-reads what it needs. */
  settingsChanged: "izuki://settings-changed",
  /** Frontend-only: put the chat bubble and oval chat back where they start. */
  resetFloating: "izuki://reset-floating",
  /** Frontend-only: the overlay asks the config panel (where the voice
   * engine lives) to say a line — one voice, never two talking at once. */
  say: "izuki://say",
  /** Buddy mode: Izuki speaking up by itself (buddy.rs). */
  buddy: "izuki://buddy",
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
  /** The one-tap replies to offer next (string[]). */
  suggestions: "izuki://suggestions",
  /** Custom wake words were added or removed — the detector reloads. */
  wakewordsChanged: "izuki://wakewords-changed",
  /** The hands-free voice sphere: OrbState. */
  orb: "izuki://orb",
  /** Memories were added or removed — the Memory list refreshes. */
  memoryChanged: "izuki://memory-changed",
  remindersChanged: "izuki://reminders-changed",
  alarm: "izuki://alarm",
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
