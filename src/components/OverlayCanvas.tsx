import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Circle,
  CornerDownLeft,
  Mic,
  PenTool,
  Send,
  Square,
  Undo2,
  X,
} from "lucide-react";
import { CaptionBox } from "./CaptionBox";
import { FloatingChat } from "./FloatingChat";
import { HandCursor, type HandCursorHandle } from "./HandCursor";
import { HandGlyph } from "./IzukiMark";
import { PointOutLayer, type PointOut } from "./PointOutLayer";
import { PenLayer, PEN_INKS, type PenMark } from "./PenLayer";
import { RadialMenu } from "./RadialMenu";
import { VoiceOrb } from "./VoiceOrb";
import { createDrawSurface, TOOL_COLOUR, type DrawSurface } from "../lib/draw";
import { workArea } from "../lib/floating";
import { hitTest, reassertHit, resetHit } from "../lib/hitTest";
import { api, EV, emit, on } from "../lib/ipc";
import { useDictation } from "../hooks/useDictation";
import { VoiceSphere } from "./VoiceSphere";
import { TranscriptBar } from "./TranscriptBar";
import { QuickAsk, QUICK_ASK_WIDTH } from "./QuickAsk";
import { cx } from "./ui";
import type {
  CaptionPayload,
  CursorPosition,
  DesktopBounds,
  HandCommand,
  Intent,
  ListeningPayload,
  OrbState,
  SayPayload,
  TranscriptPayload,
  Mark,
  OverlayOpenPayload,
  ShapeKind,
} from "../lib/types";

const TOOLS: Array<{ kind: ShapeKind; label: string; hint: string; icon: React.ReactNode; key: string }> = [
  { kind: "circle", label: "Circle", hint: "click here", icon: <Circle size={16} strokeWidth={2.3} />, key: "1" },
  { kind: "arrow", label: "Arrow", hint: "drag there", icon: <ArrowUpRight size={16} strokeWidth={2.3} />, key: "2" },
  { kind: "box", label: "Box", hint: "watch this", icon: <Square size={16} strokeWidth={2.3} />, key: "3" },
  { kind: "pen", label: "Scribble", hint: "write it", icon: <PenTool size={16} strokeWidth={2.3} />, key: "4" },
];

export function OverlayCanvas() {
  const stageHost = useRef<HTMLDivElement>(null);
  const surface = useRef<DrawSurface | null>(null);
  const handRef = useRef<HandCursorHandle>(null);
  const promptRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  /**
   * "preview" is a voice/chat command watching itself run, no drawing UI.
   * "follow" is the always-on hand with nothing else — no toolbar, no
   * frozen screen, no Konva stage, just the glowing hand tracking the real
   * cursor while the config panel stays closed. "quickdraw" is a single
   * hold-the-hotkey-and-drag mark, also with no toolbar — see the
   * `hotkey_quickdraw` handling further down.
   */
  const [mode, setMode] = useState<"draw" | "watch" | "preview" | "follow" | "quickdraw">("draw");
  const [frozen, setFrozen] = useState<string | null>(null);
  const [desktop, setDesktop] = useState<DesktopBounds>({ x: 0, y: 0, w: 0, h: 0, scale: 1 });
  const [tool, setTool] = useState<ShapeKind>("pen");
  const [marks, setMarks] = useState<Mark[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; markId: string | null } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; confidence: number } | null>(null);
  const [pointOuts, setPointOuts] = useState<PointOut[]>([]);
  /** What Izuki has drawn while explaining — up until the talk moves on. */
  const [penMarks, setPenMarks] = useState<PenMark[]>([]);
  /** Push-to-talk's mic state, mirrored from the config panel's VoiceEngine. */
  const [listening, setListening] = useState(false);
  /** The hands-free voice sphere, driven by the config panel's VoiceEngine. */
  const [orb, setOrb] = useState<OrbState>("hidden");
  /** What Izuki says it's doing while it works — shown under the orb. */
  const [doing, setDoing] = useState<string | null>(null);
  /** Your words while you talk (hands-free or push-to-talk). */
  const [transcript, setTranscript] = useState<(TranscriptPayload & { at: number }) | null>(null);
  /** Live caption of whatever Izuki just said — null hides it. */
  const [caption, setCaption] = useState<(CaptionPayload & { id: number }) | null>(null);
  /**
   * Whether "Always show the hand" is on. The overlay can be up in follow
   * mode without it — push-to-talk and captions borrow the window — and
   * then there should be no hand and no chat bubble, just what was asked for.
   */
  const [handOn, setHandOn] = useState(false);
  const [handSize, setHandSize] = useState(16);
  /** The user's ink colour for drawn marks, or "auto" for per-shape colours. */
  const [ink, setInk] = useState("auto");
  /** A command is out with the model — the hand shows a spinner, like Clicky. */
  const [thinking, setThinking] = useState(false);
  /**
   * Preview mode spends most of its life waiting on the model before the
   * hand moves at all — "thinking" until the first hand command lands,
   * "working" after, so the top pill never claims work that isn't happening.
   */
  const [acting, setActing] = useState(false);
  // Read inside the long-lived bus listeners without re-subscribing them.
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Outside drawing, the overlay must never swallow the whole screen's
  // clicks (it looked like a frozen, blurred screen). Re-check it steadily.
  useEffect(() => {
    if (mode !== "follow" && mode !== "preview") return;
    const t = setInterval(reassertHit, 1500);
    return () => clearInterval(t);
  }, [mode]);

  /**
   * Quickdraw's oval chat, beside the mark, once the keys are let go
   * (overlay client px) — null while still drawing.
   */
  const [ask, setAsk] = useState<{ x: number; y: number } | null>(null);
  const askRef = useRef(ask);
  askRef.current = ask;
  /** Ctrl+D was let go: new marks now reopen the ask bar. */
  const releasedRef = useRef(false);
  /**
   * Izuki is stuck and asked "which one? circle it" — the quickdraw surface
   * is up for the answer, which goes back to the waiting task, not a new one.
   */
  const [help, setHelp] = useState<string | null>(null);
  const helpRef = useRef(help);
  helpRef.current = help;
  // `commit` is declared further down; dictation's callback needs it.
  const commitRef = useRef<(said?: string) => Promise<void>>(async () => {});

  const dictation = useDictation(
    (text) => {
      // Asking about a quickdraw mark: speaking *is* sending — like
      // talking to a person, no extra click.
      if (askRef.current) {
        const said = promptRef2.current.trim() ? `${promptRef2.current.trim()} ${text}` : text;
        setPrompt(said);
        void commitRef.current(said);
        return;
      }
      setPrompt((p) => (p.trim() ? `${p.trim()} ${text}` : text));
    },
    // The mic button becomes a live waveform (VoiceOrb listens for this).
    { onLevel: (level) => void emit(EV.voiceLevel, level) }
  );
  const promptRef2 = useRef(prompt);
  promptRef2.current = prompt;

  // Marks are read inside stable callbacks; a ref avoids rebuilding the
  // drawing surface every time one is added.
  const marksRef = useRef<Mark[]>([]);
  marksRef.current = marks;

  // ---------------------------------------------------------------- closing

  const close = useCallback(() => {
    setOpen(false);
    setMarks([]);
    setPrompt("");
    setMenu(null);
    setFrozen(null);
    setBusy(false);
    surface.current?.clear();
    void api.closeOverlay();
  }, []);

  // ------------------------------------------------------------- committing

  const commit = useCallback(async (said?: string) => {
    const current = marksRef.current;
    const text = (said ?? prompt).trim();
    if (!current.length && !text) {
      if (helpRef.current) {
        setHelp(null);
        void api.answerHelp(null);
      }
      close();
      return;
    }

    setBusy(true);

    // The overlay is sized to the whole virtual desktop, so client pixels map
    // onto screen pixels by a single ratio — correct at any DPI scaling.
    const sx = desktop.w / Math.max(1, window.innerWidth);
    const sy = desktop.h / Math.max(1, window.innerHeight);
    const toScreen = (v: number, s: number, off: number) => Math.round(v * s) + off;

    const payload = {
      marks: current.map((m) => ({
        ...m,
        rect: {
          x: toScreen(m.rect.x, sx, desktop.x),
          y: toScreen(m.rect.y, sy, desktop.y),
          w: Math.round(m.rect.w * sx),
          h: Math.round(m.rect.h * sy),
        },
        points: m.points.map((p) => ({
          x: toScreen(p.x, sx, desktop.x),
          y: toScreen(p.y, sy, desktop.y),
        })),
      })),
      prompt: text,
      desktop: { x: desktop.x, y: desktop.y, w: desktop.w, h: desktop.h },
      createdAt: Date.now(),
    };

    // An answer to Izuki's question: hand it to the task that asked.
    if (helpRef.current) {
      setHelp(null);
      void api.answerHelp(payload);
      close();
      return;
    }

    // Hand it to the one session (VoiceEngine): the orb comes up on
    // "Thinking…", Izuki answers in the same voice, and Esc / the stop key
    // stop it like any other request. The draw layer gets out of the way.
    void emit(EV.runDraw, payload);
    close();
  }, [close, desktop, prompt]);
  commitRef.current = commit;

  /** Where the ask bar goes for a mark: to its right, else below/left — on screen. */
  const askSpot = useCallback((m: Mark) => {
    const W = QUICK_ASK_WIDTH;
    const pad = 14;
    let x = m.rect.x + m.rect.w + pad;
    if (x + W > window.innerWidth - 8) x = m.rect.x - W - pad;
    if (x < 8) x = Math.min(Math.max(8, m.rect.x), window.innerWidth - W - 8);
    let y = m.rect.y + m.rect.h / 2 - 24;
    if (x === Math.min(Math.max(8, m.rect.x), window.innerWidth - W - 8)) y = m.rect.y + m.rect.h + pad;
    // Room below for the box and its row of one-tap actions.
    y = Math.min(Math.max(8, y), window.innerHeight - 104);
    return { x, y };
  }, []);

  /** Clipboard bridge: OCR the newest mark, tidy it, put it on the clipboard. */
  const copyLastMark = useCallback(async () => {
    const last = marksRef.current[marksRef.current.length - 1];
    if (!last) {
      setNote("Draw a box around some text first.");
      return;
    }
    const sx = desktop.w / Math.max(1, window.innerWidth);
    const sy = desktop.h / Math.max(1, window.innerHeight);
    try {
      const text = await api.clipRegion({
        x: Math.round(last.rect.x * sx) + desktop.x,
        y: Math.round(last.rect.y * sy) + desktop.y,
        w: Math.round(last.rect.w * sx),
        h: Math.round(last.rect.h * sy),
      });
      setNote(text ? `Copied: ${text.slice(0, 60)}${text.length > 60 ? "…" : ""}` : "Copied.");
    } catch (e) {
      setNote(String(e));
    }
  }, [desktop.h, desktop.w, desktop.x, desktop.y]);

  // Notes are transient.
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 3200);
    return () => clearTimeout(t);
  }, [note]);

  // ------------------------------------------------------- drawing surface

  useEffect(() => {
    // Preview/follow are watch-only: the window is OS-level click-through, so
    // there is nothing for a drawing surface to do — skip standing one up.
    // Quickdraw needs one too — it's the same surface, just with no toolbar
    // around it — and since it can start while the overlay is *already*
    // open (follow mode's hand is up), `mode` has to be a dependency here
    // too, not just `open`, or the transition into it would never rebuild.
    if (!open || !stageHost.current || (mode !== "draw" && mode !== "quickdraw")) return;

    const s = createDrawSurface(stageHost.current, {
      onCommit: (mark) => {
        setMarks((prev) => [...prev, { ...mark, order: prev.length + 1 }]);
        // Drawing again after letting go of Ctrl+D (or after clearing): the
        // ask bar follows the newest mark.
        if (releasedRef.current && modeRef.current === "quickdraw") setAsk(askSpot(mark as Mark));
      },
      onContext: (x, y, markId) => setMenu({ x, y, markId }),
      onDrawingChange: setDrawing,
    });
    s.setTool(tool);
    surface.current = s;

    const onResize = () => s.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      s.destroy();
      surface.current = null;
    };
    // `tool` is pushed through setTool below rather than rebuilding the stage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  useEffect(() => {
    surface.current?.setTool(tool);
  }, [tool]);

  // Settings arrive asynchronously, often after the surface is built — so
  // this runs on both, whichever lands last.
  useEffect(() => {
    surface.current?.setInk(ink);
  }, [ink, open, mode]);

  useEffect(() => {
    surface.current?.sync(marks);
  }, [marks]);

  // ------------------------------------------------------------ backend bus

  useEffect(() => {
    const offs: Array<Promise<() => void>> = [
      on<OverlayOpenPayload>(EV.overlayOpen, (p) => {
        setAsk(null);
        releasedRef.current = false;
        setDesktop(p.desktop);
        setMarks([]);
        setPrompt("");
        setFrozen(null);
        setBusy(false);
        setMode(p.mode);
        if ((p.mode === "quickdraw" || p.mode === "draw") && p.shape) setTool(p.shape);
        setOpen(true);
        // Rust just set the window's click-through state for this mode itself.
        resetHit();
        setActing(false);
        void api.getSettings().then((s) => {
          if (p.mode === "follow") setHandOn(s.follow_mode_enabled);
          setHandSize(s.follow_hand_size);
          setInk(s.ink_color);
        });
        // Focus the prompt without stealing the pointer from the canvas —
        // only relevant in draw mode, where the window can actually be typed into.
        if (p.mode === "draw") {
          setTimeout(() => promptRef.current?.focus({ preventScroll: true }), 40);
        }
      }),
      on<void>(EV.overlayClose, () => close()),
      on<void>(EV.penClear, () => setPenMarks([])),
      // "Which one? Circle it for me." — draw with the mouse (no key held),
      // or just type/say it in the box that's already open.
      on<string>(EV.helpAsk, (question) => {
        setHelp(question);
        releasedRef.current = true;
        setAsk({ x: Math.round(window.innerWidth / 2 - QUICK_ASK_WIDTH / 2), y: 64 });
      }),
      on<void>(EV.helpDone, () => {
        if (!helpRef.current) return;
        setHelp(null);
        close();
      }),
      on<string>(EV.frozenFrame, (url) => setFrozen(url)),
      on<ListeningPayload>(EV.listening, (p) => {
        setListening(p.active);
        setHandOn(p.follow);
      }),
      on<CaptionPayload>(EV.caption, (p) => setCaption({ ...p, id: Date.now() })),
      on<OrbState>(EV.orb, (state) => {
        setOrb(state);
        if (state === "hidden") setPenMarks([]);
        // Your turn (or all done): the "doing" line has served its purpose.
        if (state === "listening" || state === "hidden") setDoing(null);
      }),
      // Izuki's lines while a task runs ("Opening Blackboard…") double as
      // the line under the orb. (Only the config panel speaks them.)
      on<SayPayload | string>(EV.say, (p) => {
        const text = typeof p === "string" ? p : p.text;
        if (text && text.length <= 90) setDoing(text.replace(/\s+/g, " ").trim());
      }),
      on<TranscriptPayload>(EV.transcript, (p) => setTranscript(p.text ? { ...p, at: Date.now() } : null)),
      on<void>(EV.settingsChanged, () => {
        void api.getSettings().then((s) => {
          setHandOn(s.follow_mode_enabled);
          setHandSize(s.follow_hand_size);
          setInk(s.ink_color);
        });
      }),
      on<boolean>(EV.thinking, setThinking),
      on<HandCommand>(EV.hand, (cmd) => {
        setActing(true);
        const sx = Math.max(1, window.innerWidth) / Math.max(1, desktop.w || window.innerWidth);
        const sy = Math.max(1, window.innerHeight) / Math.max(1, desktop.h || window.innerHeight);
        const cx2 = (cmd.x - desktop.x) * sx;
        const cy2 = (cmd.y - desktop.y) * sy;

        // Izuki sketches what it's about to do before doing it — the same
        // "let me point at this" gesture, in the same rough ink your own
        // marks use, so it reads as one language rather than a separate UI.
        const id = `po${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        if (cmd.action === "draw") {
          // The teaching pen: the mark stays while Izuki explains.
          const shape = (["circle", "box", "underline", "arrow", "note"] as const).find((s) => s === cmd.shape) ?? "circle";
          setPenMarks((prev) => [
            ...prev,
            {
              id: `pen${Date.now()}${prev.length}`,
              shape,
              x: cx2,
              y: cy2,
              x2: cmd.x2 != null ? (cmd.x2 - desktop.x) * sx : undefined,
              y2: cmd.y2 != null ? (cmd.y2 - desktop.y) * sy : undefined,
              text: cmd.text ?? undefined,
              tone: PEN_INKS[prev.length % PEN_INKS.length],
            },
          ]);
        } else if (cmd.action === "drag" && cmd.x2 != null && cmd.y2 != null) {
          const hx2 = (cmd.x2 - desktop.x) * sx;
          const hy2 = (cmd.y2 - desktop.y) * sy;
          setPointOuts((prev) => [
            ...prev,
            { id, kind: "arrow", x: cx2, y: cy2, x2: hx2, y2: hy2, tone: TOOL_COLOUR.arrow },
          ]);
        } else {
          setPointOuts((prev) => [
            ...prev,
            { id, kind: "circle", x: cx2, y: cy2, tone: TOOL_COLOUR.circle },
          ]);
        }
        // "Point at it": the circle *is* the answer — leave it up long
        // enough to look at while Izuki explains.
        const showing = cmd.action === "point";
        setTimeout(() => setPointOuts((prev) => prev.filter((p) => p.id !== id)), showing ? 5000 : 1100);

        void handRef.current?.animateTo(cx2, cy2, cmd.duration_ms).then(() => {
          handRef.current?.pulse(cmd.action === "hover" || showing ? "none" : (cmd.action as never));
        });
      }),
      // In the click-through modes the window gets no mouse events at all —
      // Rust polls the real cursor instead. The hand is repainted from it
      // (in preview it only drifts there between scripted moves, so the
      // first move starts from your actual cursor rather than off-screen),
      // and it's hit-tested against the floating widgets so those stay
      // clickable.
      on<CursorPosition>(EV.cursor, ({ x, y }) => {
        const m = modeRef.current;
        if (m !== "follow" && m !== "preview") return;
        const sx = Math.max(1, window.innerWidth) / Math.max(1, desktop.w || window.innerWidth);
        const sy = Math.max(1, window.innerHeight) / Math.max(1, desktop.h || window.innerHeight);
        const cx = (x - desktop.x) * sx;
        const cy = (y - desktop.y) * sy;
        handRef.current?.setPointer(cx, cy);
        hitTest(cx, cy);
      }),
      // Quickdraw's key-up — commit() already closes with nothing to send
      // when no mark was drawn, so this is safe to fire on a bare tap too.
      // Quickdraw's key-up: keep the mark and ask what to do with it —
      // nothing drawn means nothing to ask about, so just close.
      on<void>(EV.quickdrawCommit, () => {
        if (modeRef.current !== "quickdraw") return;
        const last = marksRef.current[marksRef.current.length - 1];
        if (!last) {
          close();
          return;
        }
        releasedRef.current = true;
        setAsk(askSpot(last));
        // Start reading the screen while you type (or just press Enter).
        void api.prefetchScreen();
      }),
    ];
    return () => {
      offs.forEach((p) => void p.then((off) => off()));
    };
  }, [askSpot, close, commit, desktop.h, desktop.w, desktop.x, desktop.y]);

  // ------------------------------------------------------------- shortcuts

  useEffect(() => {
    // Draw-mode shortcuts only. These listen on the whole window in the
    // capture phase, so outside draw mode they'd eat Space and Enter before
    // the floating chat's text box ever saw them.
    if (!open || mode !== "draw") return;

    const onKey = (e: KeyboardEvent) => {
      const typing = document.activeElement === promptRef.current;

      if (e.key === "Escape") {
        e.preventDefault();
        if (menu) setMenu(null);
        else close();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void commit();
        return;
      }
      if (typing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        surface.current?.undo();
        setMarks((m) => m.slice(0, -1));
        return;
      }

      // Hold Space to dictate.
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        dictation.start();
        return;
      }

      // Clipboard bridge: C copies the text inside your last mark.
      if (e.key.toLowerCase() === "c" && !e.ctrlKey) {
        e.preventDefault();
        void copyLastMark();
        return;
      }

      const hit = TOOLS.find((t) => t.key === e.key);
      if (hit) {
        e.preventDefault();
        setTool(hit.kind);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && dictation.listening) {
        e.preventDefault();
        dictation.stop();
      }
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [close, commit, copyLastMark, dictation, menu, mode, open]);

  useEffect(() => {
    if (!open || mode !== "quickdraw") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dictation.cancel();
        if (helpRef.current) {
          setHelp(null);
          void api.answerHelp(null);
        }
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, dictation, mode, open]);

  // -------------------------------------------------------- ghost hand

  useEffect(() => {
    if (!open || mode !== "draw") return;
    let cancelled = false;
    void api.ghostPredict().then((p) => {
      if (cancelled || !p) return;
      const sx = window.innerWidth / Math.max(1, desktop.w || window.innerWidth);
      const sy = window.innerHeight / Math.max(1, desktop.h || window.innerHeight);
      setGhost({
        x: (p.x - desktop.x) * sx,
        y: (p.y - desktop.y) * sy,
        confidence: p.confidence,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [desktop.h, desktop.w, desktop.x, desktop.y, mode, open]);

  // Push-to-talk and captions borrow the overlay even when the hand is off.
  // Once neither has anything left to show, put the window away again — a
  // short grace period so the listening signal that follows the hotkey's
  // own show-overlay has time to land first.
  // What you said stays up a few seconds after you finish, then clears.
  useEffect(() => {
    if (!transcript?.final) return;
    const t = setTimeout(() => setTranscript(null), 4000);
    return () => clearTimeout(t);
  }, [transcript]);

  const idle = open && mode === "follow" && !handOn && !listening && !caption && orb === "hidden" && !transcript;
  useEffect(() => {
    if (!idle) return;
    const t = setTimeout(() => void api.closeOverlay(), 1500);
    return () => clearTimeout(t);
  }, [idle]);

  // ------------------------------------------------------------- rendering

  if (!open) return null;

  // The chat bubble and caption box sit in one fixed slot shared by follow
  // and preview. Sending a chat switches the overlay into preview while
  // Izuki thinks and acts — if they lived inside each mode's own tree they
  // would unmount right then, taking the open chat (and your half-typed
  // text) with them, and pop back closed afterwards.
  const floatingSlot =
    mode === "follow" || mode === "preview" ? (
      <>
        {penMarks.length > 0 && (
          <div className="pointer-events-none fixed inset-0">
            <PenLayer marks={penMarks} />
          </div>
        )}
        <VoiceSphere state={orb} transcript={transcript} doing={doing} />
        {orb === "hidden" && <TranscriptBar text={transcript?.text ?? null} final={!!transcript?.final} />}
        {caption && <CaptionBox caption={caption} onDone={() => setCaption(null)} />}
        {handOn && <FloatingChat />}
      </>
    ) : null;

  // Follow mode is the whole point of "you don't need the app open" — just
  // the hand, tracking the real cursor, with nothing else on screen.
  if (mode === "follow") {
    return (
      <>
        <div key="follow" className="pointer-events-none fixed inset-0">
          {/* follow=1: no chase lag — this is standing in for your actual
              cursor, so it needs to read as exactly where your hand is, the
              way a real cursor does, not a beat behind it. "trail" parks it
              just off the real arrow so you can still see your own mouse. */}
          {handOn && (
            <HandCursor
              ref={handRef}
              bindPointer={false}
              hideUntilMove={false}
              trail={4}
              size={handSize}
              follow={1}
              anchor="trail"
              listening={listening}
              thinking={thinking && !listening}
            />
          )}
          {!handOn && <ListeningBadge active={listening} />}
        </div>
        {floatingSlot}
      </>
    );
  }

  // Quickdraw: hold the hotkey, drag one mark, let go — no toolbar, no
  // frozen/dimmed screen, just the ink itself and a small reminder of what
  // finishes it.
  if (mode === "quickdraw") {
    return (
      <>
        <div key="quickdraw" className="fixed inset-0" style={{ cursor: "crosshair" }}>
          <div ref={stageHost} className="absolute inset-0" />
          <PointOutLayer items={pointOuts} />
          <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2">
            <div className="izk-card izk-grain flex items-center gap-2 px-3.5 py-2">
              <span className="relative flex h-[8px] w-[8px]">
                <span className="izk-breathe absolute inset-0 rounded-full bg-izk-hand" />
              </span>
              <span className="text-[11.5px] font-semibold tracking-[-0.01em] text-izk-ink">
                {help
                  ? `Izuki asks: “${help}” — circle it, or say/type it, then Enter · Esc to skip`
                  : ask
                  ? "Type or say what to do with it — Esc to cancel"
                  : releasedRef.current
                    ? "Draw your mark again — Esc to cancel"
                    : `Drag to sketch a ${tool} — let go of the keys when you're done`}
              </span>
            </div>
          </div>
          {ask && (
            <QuickAsk
              x={ask.x}
              y={ask.y}
              prompt={prompt}
              setPrompt={setPrompt}
              busy={busy}
              listening={dictation.listening}
              transcribing={dictation.transcribing}
              onMic={() => (dictation.listening ? dictation.stop() : dictation.start())}
              // Enter with nothing typed: like pointing at something and
              // saying "what's this?" — look at it and respond, don't just
              // click the middle of the circle.
              onSend={() =>
                void commit(
                  prompt.trim() ||
                    // (Answering Izuki's question, the mark says it all.)
                    (help
                      ? ""
                      : "Look at what I marked and help me with it — explain what it is, answer what it's asking, or suggest what to do. Only click or type if that's clearly what I want.")
                )
              }
              onQuick={help ? undefined : (p) => void commit(p)}
              onClear={() => {
                dictation.cancel();
                surface.current?.clear();
                setMarks([]);
                setPrompt("");
                setAsk(null);
              }}
              onCancel={() => {
                dictation.cancel();
                close();
              }}
            />
          )}
        </div>
        {floatingSlot}
      </>
    );
  }

  const pickIntent = (intent: Intent | "chain") => {
    setMenu(null);
    if (intent === "chain") {
      // Chaining is the default: every mark already carries its order, so
      // this just confirms the sequence and returns to drawing.
      return;
    }
    if (menu?.markId) {
      setMarks((prev) => prev.map((m) => (m.id === menu.markId ? { ...m, intent } : m)));
    } else {
      surface.current?.setIntent(intent);
    }
  };

  return (
    <>
    <div key="main" className="fixed inset-0 select-none">
      {/* frozen screen behind the marks */}
      <AnimatePresence>
        {frozen && (
          <motion.img
            key="frozen"
            src={frozen}
            alt=""
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* dim + vignette so the marks read against any wallpaper — drawing
          only. While Izuki thinks or acts the screen stays exactly as it
          is, so you can keep working and watch each action land live. */}
      {mode === "draw" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, rgba(8,8,12,0.18) 0%, rgba(8,8,12,0.52) 100%)",
          }}
        />
      )}

      {/* the Konva stage */}
      {/* A real crosshair, so you always see exactly where you're drawing. */}
      <div ref={stageHost} className="absolute inset-0" style={{ cursor: "crosshair" }} />

      {/* Izuki's own sketchy point-outs, ahead of the hand moving in */}
      <PointOutLayer items={pointOuts} />

      {/* ghost hand: where you usually click in this app */}
      {ghost && !marks.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4 + ghost.confidence * 0.25, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="pointer-events-none absolute z-10"
          style={{ left: ghost.x, top: ghost.y, transform: "translate(-30%,-16%)" }}
        >
          <div className="izk-breathe">
            <HandGlyph size={38} tone="#4ECDC4" sparkle={false} />
          </div>
          <div className="mt-1 whitespace-nowrap rounded-full border border-izk-teal/30 bg-black/60 px-2 py-[2px] text-[9.5px] font-semibold text-izk-teal backdrop-blur-md">
            you usually click here
          </div>
        </motion.div>
      )}

      {/* Preview is click-through — no DOM pointer events will ever arrive
          to reveal the hand, so it shows straight away there. */}
      <HandCursor ref={handRef} trail={12} size={22} hideUntilMove={mode !== "preview"} />

      {/* preview mode: a voice/chat command watching itself run. The pill is
          honest about the wait — "thinking" while the model looks at the
          screen, "working" once the hand actually moves — and Stop is
          clickable through the click-through window via the hit-tester. */}
      {mode === "preview" && (
        <motion.div
          initial={{ opacity: 0, y: -14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2"
        >
          <div className="izk-card izk-grain flex items-center gap-2.5 py-2 pl-4 pr-2">
            <span className="relative flex h-[9px] w-[9px]">
              <span
                className={cx(
                  "izk-breathe absolute inset-0 rounded-full",
                  acting ? "bg-izk-hand" : "bg-izk-teal"
                )}
              />
            </span>
            <span className="text-[12.5px] font-semibold tracking-[-0.01em] text-izk-ink">
              {acting ? "Izuki is working…" : "Izuki is thinking…"}
            </span>
            <button
              type="button"
              data-izk-hit
              onClick={() => void api.panic()}
              className="pointer-events-auto ml-1 rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[11px] font-semibold text-izk-muted transition-colors hover:border-izk-danger/40 hover:bg-izk-danger/18 hover:text-izk-danger"
            >
              Stop
            </button>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------- tool bar */}
      {mode === "draw" && (
      <>
      <motion.div
        initial={{ opacity: 0, y: -18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cx(
          "pointer-events-auto absolute left-1/2 top-6 z-40 -translate-x-1/2",
          drawing && "opacity-35"
        )}
        style={{ transition: "opacity 180ms ease" }}
      >
        <div className="izk-card izk-grain flex items-center gap-1 p-1.5">
          {TOOLS.map((t) => {
            const active = tool === t.kind;
            return (
              <button
                key={t.kind}
                type="button"
                onClick={() => setTool(t.kind)}
                title={`${t.label} — ${t.hint}  (${t.key})`}
                className={cx(
                  "group relative flex items-center gap-2 rounded-[15px] px-3 py-2 transition-all duration-200",
                  active ? "text-izk-ink" : "text-izk-muted hover:bg-white/8 hover:text-izk-ink"
                )}
                style={
                  active
                    ? {
                        background: `${TOOL_COLOUR[t.kind]}22`,
                        boxShadow: `inset 0 0 0 1px ${TOOL_COLOUR[t.kind]}55, 0 6px 20px ${TOOL_COLOUR[t.kind]}30`,
                      }
                    : undefined
                }
              >
                <span style={{ color: active ? TOOL_COLOUR[t.kind] : undefined }}>{t.icon}</span>
                <span className="text-[12.5px] font-semibold tracking-[-0.01em]">{t.label}</span>
                <kbd className="rounded-[6px] border border-white/12 bg-black/35 px-[5px] font-mono text-[9.5px] text-izk-muted">
                  {t.key}
                </kbd>
              </button>
            );
          })}

          <div className="mx-1 h-6 w-px bg-white/10" />

          <IconButton
            label="Undo  (Ctrl+Z)"
            onClick={() => {
              surface.current?.undo();
              setMarks((m) => m.slice(0, -1));
            }}
          >
            <Undo2 size={15} strokeWidth={2.4} />
          </IconButton>
          <IconButton label="Cancel  (Esc)" danger onClick={close}>
            <X size={15} strokeWidth={2.4} />
          </IconButton>
        </div>
      </motion.div>

      {/* ------------------------------------------------- prompt bar */}
      <motion.div
        initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
        className={cx(
          "pointer-events-auto absolute bottom-8 left-1/2 z-40 w-[min(620px,72vw)] -translate-x-1/2",
          drawing && "opacity-35"
        )}
        style={{ transition: "opacity 180ms ease" }}
      >
        <div className="izk-card izk-grain flex items-center gap-2 p-2">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px] border border-izk-hand/30 bg-izk-hand/12 text-izk-hand">
            <span className="text-[15px]">✋</span>
          </div>

          <input
            ref={promptRef}
            value={dictation.transcribing ? "Working out what you said…" : prompt}
            onChange={(e) => setPrompt(e.target.value)}
            readOnly={dictation.listening || dictation.transcribing}
            placeholder={
              marks.length
                ? `What should Izuki do with ${marks.length} mark${marks.length === 1 ? "" : "s"}?`
                : "Draw something, or just tell Izuki what to do…"
            }
            className="h-[38px] min-w-0 flex-1 bg-transparent px-1 text-[13.5px] text-izk-ink outline-none placeholder:text-izk-muted/60"
            style={{ cursor: "text" }}
          />

          <IconButton
            label={
              dictation.available ? "Hold Space to dictate" : "No microphone found"
            }
            danger={dictation.listening}
            onClick={() =>
              dictation.listening ? dictation.stop() : dictation.start()
            }
          >
            <Mic
              size={15}
              strokeWidth={2.4}
              className={dictation.listening ? "izk-breathe text-izk-danger" : undefined}
            />
          </IconButton>

          <button
            type="button"
            disabled={busy}
            onClick={() => void commit()}
            className="izk-btn-primary flex h-[38px] items-center gap-1.5 px-4 text-[13px] disabled:opacity-60"
          >
            {busy ? "Working…" : "Do it"}
            {busy ? <Send size={14} strokeWidth={2.6} /> : <CornerDownLeft size={14} strokeWidth={2.6} />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {note || dictation.error ? (
            <motion.div
              key="note"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px]"
            >
              <span className={dictation.error ? "text-izk-danger" : "text-izk-teal"}>
                {note ?? dictation.error}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="hints"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 flex items-center justify-center gap-3 text-[10.5px] text-izk-muted/80"
            >
              <span>
                <b className="text-izk-ink">Right-click</b> a mark for hand signs
              </span>
              <span className="opacity-40">·</span>
              <span>
                Draw <b className="text-izk-ink">1 → 2 → 3</b> to chain steps
              </span>
              <span className="opacity-40">·</span>
              <span>
                Hold <b className="text-izk-ink">Space</b> to dictate ·{" "}
                <b className="text-izk-ink">C</b> to copy text
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </>
      )}

      <AnimatePresence>
        {menu && mode === "draw" && (
          <RadialMenu x={menu.x} y={menu.y} onPick={pickIntent} onClose={() => setMenu(null)} />
        )}
      </AnimatePresence>
    </div>
    {floatingSlot}
    </>
  );
}

function IconButton({
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
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cx(
        "flex h-[34px] w-[34px] items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-izk-muted transition-all duration-200 active:scale-90",
        danger
          ? "hover:border-izk-danger/40 hover:bg-izk-danger/18 hover:text-izk-danger"
          : "hover:bg-white/12 hover:text-izk-ink"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Push-to-talk's "I'm listening" mic, for when the hand is off — the same
 * voice ring the hand turns into when it's on, just with a mic in the middle,
 * so the hotkey still gives a clear "go ahead and talk" with the app closed.
 * Bottom-centre, above the taskbar.
 */
function ListeningBadge({ active }: { active: boolean }) {
  const bottom = window.innerHeight - workArea().bottom + 24;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.85 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 -translate-x-1/2"
          style={{ bottom }}
        >
          <VoiceOrb size={64} mic />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
