import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layers, MessageCircle, Minus, PenLine, Settings2, X, Eye, Blocks, Maximize2, Minimize2 } from "lucide-react";
import { IzukiMark } from "./IzukiMark";
import { Segmented, cx } from "./ui";
import { DrawTab } from "./tabs/DrawTab";
import { ChatTab, resetChat } from "./tabs/ChatTab";
import { AppsTab } from "./tabs/AppsTab";
import { FlowLibrary } from "./tabs/FlowLibrary";
import { WatcherManager } from "./tabs/WatcherManager";
import { SettingsTab } from "./tabs/SettingsTab";
import { StatusToast } from "./StatusToast";
import { VoiceEngine } from "./VoiceEngine";
import { OnboardingTour } from "./OnboardingTour";
import { SetupGuide } from "./SetupGuide";
import { KeyCatcher } from "./KeyCatcher";
import { brainReady } from "../lib/setup";
import { useIzuki, type TabId } from "../lib/store";
import { IS_TAURI, on } from "../lib/ipc";
import { Recover } from "./Recover";
import { UpdateNotice } from "./UpdateNotice";
import { FeatureFinder } from "./FeatureFinder";

const TABS: Array<{ value: TabId; label: string; icon: React.ReactNode }> = [
  { value: "draw", label: "Draw", icon: <PenLine size={13} strokeWidth={2.4} /> },
  { value: "chat", label: "Chat", icon: <MessageCircle size={13} strokeWidth={2.4} /> },
  { value: "apps", label: "Apps", icon: <Blocks size={13} strokeWidth={2.4} /> },
  { value: "flows", label: "Flows", icon: <Layers size={13} strokeWidth={2.4} /> },
  { value: "watchers", label: "Watchers", icon: <Eye size={13} strokeWidth={2.4} /> },
  { value: "settings", label: "Settings", icon: <Settings2 size={13} strokeWidth={2.4} /> },
];

async function windowAction(kind: "minimize" | "maximize" | "hide") {
  if (!IS_TAURI) return false;
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const w = getCurrentWindow();
  if (kind === "minimize") await w.minimize();
  else if (kind === "maximize") {
    await w.toggleMaximize();
    return w.isMaximized();
  } else await w.hide();
  return false;
}

export function GlassConfigPanel() {
  const tab = useIzuki((s) => s.tab);
  const setTab = useIzuki((s) => s.setTab);
  const reloadSettings = useIzuki((s) => s.reloadSettings);
  const reloadFlows = useIzuki((s) => s.reloadFlows);
  const reloadWatchers = useIzuki((s) => s.reloadWatchers);
  const bind = useIzuki((s) => s.bind);
  const backdrop = useIzuki((s) => s.settings.backdrop);
  const settingsLoaded = useIzuki((s) => s.settingsLoaded);
  const onboardingSeen = useIzuki((s) => s.settings.onboarding_seen);
  const patchSettings = useIzuki((s) => s.patchSettings);
  const tourOpen = useIzuki((s) => s.tourOpen);
  const setupOpen = useIzuki((s) => s.setupOpen);
  const setSetupOpen = useIzuki((s) => s.setSetupOpen);
  const [maxed, setMaxed] = useState(false);
  // Six tabs don't fit with names at the panel's usual width.
  const [narrow, setNarrow] = useState(() => window.innerWidth < 600);
  useEffect(() => {
    const fit = () => setNarrow(window.innerWidth < 600);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const setTourOpen = useIzuki((s) => s.setTourOpen);

  // The page lays itself out differently depending on whether Windows is
  // painting a Mica/Acrylic backdrop behind the window. See styles.css.
  useEffect(() => {
    document.documentElement.dataset.backdrop = backdrop;
  }, [backdrop]);

  useEffect(() => {
    void reloadSettings();
    void reloadFlows();
    void reloadWatchers();
    let off: (() => void) | undefined;
    void bind().then((f) => (off = f));
    // Changed in the core (by voice, or the TV being found): reload, so an
    // older copy here is never saved back over it.
    const offExternal = on<void>("izuki://settings-external", () => void reloadSettings());
    return () => {
      off?.();
      void offExternal.then((f) => f());
    };
  }, [bind, reloadFlows, reloadSettings, reloadWatchers]);

  // First run only — once settings are in and the tour has never been seen,
  // open it. A ref keeps this from re-firing every time settings reload.
  const autoOpenedTour = useRef(false);
  useEffect(() => {
    if (settingsLoaded && !onboardingSeen && !autoOpenedTour.current) {
      autoOpenedTour.current = true;
      setTourOpen(true);
    }
  }, [settingsLoaded, onboardingSeen, setTourOpen]);

  // No brain at all (and the tour's done): open the setup guide once, so a
  // new user never meets a chat that can't answer.
  const brainOk = useIzuki((s) => brainReady(s.settings));
  const autoOpenedSetup = useRef(false);
  useEffect(() => {
    if (settingsLoaded && onboardingSeen && !tourOpen && !brainOk && !autoOpenedSetup.current) {
      autoOpenedSetup.current = true;
      setSetupOpen(true);
    }
  }, [settingsLoaded, onboardingSeen, tourOpen, brainOk, setSetupOpen]);

  const closeTour = () => {
    setTourOpen(false);
    if (!onboardingSeen) patchSettings({ onboarding_seen: true });
  };

  return (
    <div className="izk-window">
      {/* Always mounted, regardless of which tab is showing — this is the
          one and only "Hey Izuki" microphone session in the whole app. */}
      <Recover name="voice" silent>
        <VoiceEngine />
      </Recover>
      <div className="izk-sheet izk-grain flex h-full flex-col">
        {/* the slow-drifting colour under the glass — always there, never distracting */}
        <div className="izk-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {/* ---------------- title bar ---------------- */}
        {/* Tauri's own drag handling looks for `data-tauri-drag-region` on
            the exact element under the cursor — plain `-webkit-app-region`
            CSS (below) does nothing on Windows/WebView2. The icon+title
            group is marked `pointer-events-none` so a press anywhere over
            them still resolves to this header and starts the drag; the
            button cluster is untouched and stays clickable. */}
        <header
          data-tauri-drag-region
          className="izk-drag relative flex items-center justify-between px-[18px] pt-[16px] pb-[12px]"
        >
          <div className="pointer-events-none flex items-center gap-[11px]">
            <IzukiMark size={38} className="rounded-[11px] shadow-[0_6px_16px_rgba(76,84,220,0.35)]" />
            <div className="leading-none">
              <span className="text-[17px] font-bold tracking-[0.14em] izk-accent-text">
                IZUKI
              </span>
              <div className="mt-[5px] text-[10px] font-semibold tracking-[0.13em] text-izk-muted">
                YO IZUKI, DO IT.
              </div>
            </div>
          </div>

          <div className="izk-no-drag flex items-center gap-1.5">
            <WinButton onClick={() => void windowAction("minimize")} label="Minimise">
              <Minus size={13} strokeWidth={2.6} />
            </WinButton>
            <WinButton
              onClick={() => void windowAction("maximize").then((m) => setMaxed(!!m))}
              label={maxed ? "Restore" : "Make it big"}
            >
              {maxed ? <Minimize2 size={12} strokeWidth={2.6} /> : <Maximize2 size={12} strokeWidth={2.6} />}
            </WinButton>
            <WinButton onClick={() => void windowAction("hide")} label="Close to tray" danger>
              <X size={13} strokeWidth={2.6} />
            </WinButton>
          </div>
        </header>

        {/* ---------------- tabs ---------------- */}
        <div className="izk-no-drag relative px-[18px] pb-3"><FeatureFinder /></div>
        {/* Scrolls sideways rather than cutting the last tab off in a
            narrow window. */}
        <div className="izk-no-drag overflow-x-auto px-[18px] pb-[12px] [scrollbar-width:none]">
          <Segmented value={tab} options={TABS} onChange={setTab} size="sm" compact={narrow} />
        </div>

        <div className="izk-divider mx-[18px]" />

        {/* ---------------- content ---------------- */}
        <UpdateNotice />
        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[18px] py-[16px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col gap-3"
            >
              <Recover name={`tab:${tab}`} onReset={tab === "chat" ? resetChat : undefined}>
                {tab === "draw" && <DrawTab />}
                {tab === "chat" && <ChatTab />}
                {tab === "apps" && <AppsTab />}
                {tab === "flows" && <FlowLibrary />}
                {tab === "watchers" && <WatcherManager />}
                {tab === "settings" && <SettingsTab />}
              </Recover>
            </motion.div>
          </AnimatePresence>
        </main>

        <Recover name="toast" silent>
          <StatusToast />
        </Recover>

        <Recover name="keys" silent>
          <KeyCatcher />
        </Recover>

        <AnimatePresence>{setupOpen && !tourOpen && <SetupGuide onClose={() => setSetupOpen(false)} />}</AnimatePresence>
        <AnimatePresence>{tourOpen && <OnboardingTour onDone={closeTour} />}</AnimatePresence>
      </div>
    </div>
  );
}

function WinButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/10",
        "bg-white/5 text-izk-muted transition-all duration-200",
        "hover:text-izk-ink active:scale-92",
        danger ? "hover:border-izk-danger/40 hover:bg-izk-danger/18" : "hover:bg-white/12"
      )}
    >
      {children}
    </button>
  );
}
