import { create } from "zustand";
import { api, EV, emit, on, MOCK_SETTINGS } from "./ipc";
import type { Flow, Settings, StatusEvent, Watcher } from "./types";

export type TabId = "draw" | "chat" | "apps" | "flows" | "watchers" | "settings";

interface IzukiState {
  tab: TabId;
  setTab: (t: TabId) => void;

  settings: Settings;
  settingsLoaded: boolean;
  patchSettings: (patch: Partial<Settings>) => void;
  reloadSettings: () => Promise<void>;
  /**
   * Settings writes are debounced so dragging a slider doesn't hammer disk —
   * but the Rust side (where API keys actually get used) only ever sees the
   * *last saved* copy. Call this right before anything that depends on a
   * setting you might have just changed a moment ago (testing a freshly
   * pasted API key, sending a chat command), so it can't race the debounce
   * and fire against a stale value. A no-op if nothing is pending.
   */
  flushSettings: () => Promise<void>;

  flows: Flow[];
  watchers: Watcher[];
  reloadFlows: () => Promise<void>;
  reloadWatchers: () => Promise<void>;

  status: StatusEvent | null;
  setStatus: (s: StatusEvent | null) => void;

  /** The first-run welcome tour — auto-opens once, replayable from Settings. */
  tourOpen: boolean;
  setTourOpen: (v: boolean) => void;

  /** The "get Izuki connected" guide (SetupGuide.tsx). */
  setupOpen: boolean;
  setSetupOpen: (v: boolean) => void;

  /**
   * Live state of the "Hey Izuki" wake-word engine. Owned by a single
   * `<VoiceEngine />` mounted once at the top of the app — this is just its
   * broadcast, so any tab can show a mic indicator without each one starting
   * its own microphone session.
   */
  voice: {
    active: boolean;
    heard: boolean;
    error: string | null;
    lastHeard: string | null;
    busy: boolean;
  };
  setVoice: (patch: Partial<IzukiState["voice"]>) => void;

  /** Wire up backend event listeners. Returns a teardown. */
  bind: () => Promise<() => void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useIzuki = create<IzukiState>((set, get) => ({
  tab: "draw",
  setTab: (tab) => set({ tab }),

  settings: MOCK_SETTINGS,
  settingsLoaded: false,

  patchSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    // Debounced write-through so dragging a slider does not hammer the disk.
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      void api.saveSettings(next).then(() => emit(EV.settingsChanged));
    }, 180);
  },

  reloadSettings: async () => {
    const s = await api.getSettings();
    set({ settings: s, settingsLoaded: true });
  },

  flushSettings: async () => {
    // Only a *pending* edit needs flushing. This must stay a true no-op
    // otherwise: the overlay window shares this store module but never
    // loads real settings, so an unconditional save from there would write
    // the placeholder defaults over the user's actual configuration.
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    await api.saveSettings(get().settings);
  },

  flows: [],
  watchers: [],

  reloadFlows: async () => set({ flows: await api.listFlows() }),
  reloadWatchers: async () => set({ watchers: await api.listWatchers() }),

  status: null,
  setStatus: (status) => set({ status }),

  tourOpen: false,
  setTourOpen: (tourOpen) => set({ tourOpen }),

  setupOpen: false,
  setSetupOpen: (setupOpen) => set({ setupOpen }),

  voice: { active: false, heard: false, error: null, lastHeard: null, busy: false },
  setVoice: (patch) => {
    set((s) => ({ voice: { ...s.voice, ...patch } }));
    if (patch.lastHeard) {
      const said = patch.lastHeard;
      setTimeout(() => {
        if (get().voice.lastHeard === said) set((s) => ({ voice: { ...s.voice, lastHeard: null } }));
      }, 4200);
    }
  },

  bind: async () => {
    const offs = await Promise.all([
      on<StatusEvent>(EV.status, (s) => {
        set({ status: s });
        if (s.kind === "success" || s.kind === "error") {
          setTimeout(() => {
            if (get().status === s) set({ status: null });
          }, 4200);
        }
      }),
      on<void>(EV.flowsChanged, () => void get().reloadFlows()),
      on<void>(EV.watchersChanged, () => void get().reloadWatchers()),
      on<TabId>(EV.navigate, (tab) => set({ tab })),
    ]);
    return () => offs.forEach((off) => off());
  },
}));
