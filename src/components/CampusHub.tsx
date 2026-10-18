import { useEffect, useReducer, useState } from "react";
import { CalendarClock, Loader2, Mic, Square, X } from "lucide-react";
import { api, type CampusHub as Hub } from "../lib/ipc";
import { sendChatCommand } from "./VoiceEngine";
import { Section, cx } from "./ui";
import { SchoolReader, StudyWeekCard, Textbooks } from "./StudyCards";

/** Minutes per recorded piece: each is a whole audio file, written down as soon as it's done. */
const PIECE_MS = 120_000;

function when(ms: number) {
  const d = new Date(ms);
  const days = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (days === 0) return `today ${time}`;
  if (days === 1) return `tomorrow ${time}`;
  if (days === -1) return `yesterday ${time}`;
  return `${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} ${time}`;
}

function blobToBase64(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(b);
  });
}

/**
 * The Campus hub at the top of Notes: what was due lately (the calendar
 * can't show whether you submitted), what's coming up, and Lecture Mode —
 * a lecture recorded only after you confirm you're allowed to, written down
 * as it goes and turned into study notes when you stop.
 */
export function CampusHub({ onNote }: { onNote: (id: string) => void }) {
  const [hub, setHub] = useState<Hub | null>(null);
  useEffect(() => {
    void api.campusHub().then(setHub).catch(() => undefined);
  }, []);

  return (
    <Section id="notes-campus" title="Campus" hint="Your school calendar and lectures — only what's really there, never guessed.">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Deadlines hub={hub} />
        <LectureMode onNote={onNote} />
        <Textbooks />
        <SchoolReader />
        <StudyWeekCard />
      </div>
    </Section>
  );
}

function Deadlines({ hub }: { hub: Hub | null }) {
  if (!hub) return <div className="izk-inset rounded-[14px] p-3 text-[12px] text-izk-muted">Reading your school calendar…</div>;
  if (!hub.linked)
    return (
      <div className="izk-inset rounded-[14px] p-3">
        <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink"><CalendarClock size={14} /> Deadlines</div>
        <p className="mt-1 text-[11.5px] text-izk-muted">Your school calendar isn't linked yet.</p>
        <button type="button" onClick={() => void sendChatCommand("connect my Blackboard")} className="izk-pill izk-no-drag mt-2 px-2.5 py-1 text-[11px]">
          Connect Blackboard
        </button>
      </div>
    );
  const coming = hub.coming.slice(0, 5);
  const past = hub.past.slice(-3).reverse();
  return (
    <div className="izk-inset rounded-[14px] p-3">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink"><CalendarClock size={14} /> Deadlines</div>
      {hub.error && <p className="mt-1 text-[11.5px] text-izk-danger">Couldn't read your calendar just now — {hub.error}</p>}
      {coming.length === 0 && !hub.error && <p className="mt-1 text-[11.5px] text-izk-muted">Nothing due in the next two weeks. 🎉</p>}
      <ul className="mt-1.5 space-y-1">
        {coming.map(([t, at]) => (
          <li key={t + at} className="flex items-baseline gap-2 text-[11.5px]">
            <span className={cx("shrink-0 font-semibold", at - Date.now() < 2 * 86_400_000 ? "text-amber-300" : "text-izk-teal")}>{when(at)}</span>
            <span className="truncate text-izk-ink">{t}</span>
          </li>
        ))}
      </ul>
      {past.length > 0 && (
        <>
          <div className="mt-2 text-[10.5px] uppercase tracking-wider text-izk-muted">Was due (check you submitted)</div>
          <ul className="mt-1 space-y-1">
            {past.map(([t, at]) => (
              <li key={t + at} className="flex items-baseline gap-2 text-[11.5px] text-izk-muted">
                <span className="shrink-0">{when(at)}</span>
                <span className="truncate">{t}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => void sendChatCommand("which assignment should I do first?")} className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]">What first?</button>
        <button type="button" onClick={() => void sendChatCommand("show me everything overdue")} className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]">Overdue</button>
      </div>
    </div>
  );
}

type Rec = { id: string; title: string; started: number; index: number; recorder: MediaRecorder | null; stream: MediaStream; timer: number; lastUpload: Promise<void>; uploads: Set<Promise<void>>; stopping: boolean };

/** End the recording here (mic off, timer cleared) without sending anything more. */
function endLocally(r: Rec) {
  clearTimeout(r.timer);
  if (r.recorder) {
    r.recorder.onstop = null;
    if (r.recorder.state !== "inactive") r.recorder.stop();
  }
  r.stream.getTracks().forEach((t) => t.stop());
}

/**
 * The recording lives here, outside the panel: switching tabs (which
 * unmounts the panel) must never stop or lose a lecture. The Island shows
 * it's recording wherever you are; Stop is here in Notes.
 */
let session: Rec | null = null;
let sessionError = "";
const watchers = new Set<() => void>();
const changed = () => watchers.forEach((f) => f());
const setSession = (r: Rec | null) => {
  session = r;
  changed();
};
const setSessionError = (e: string) => {
  sessionError = e;
  changed();
};

function LectureMode({ onNote }: { onNote: (id: string) => void }) {
  const [, redraw] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    watchers.add(redraw);
    return () => void watchers.delete(redraw);
  }, []);
  const rec = session;
  const recRef = { current: session };
  const setRec = setSession;
  const error = sessionError;
  const setError = setSessionError;
  const [asking, setAsking] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [title, setTitle] = useState("");
  const [secs, setSecs] = useState(0);
  const [heard, setHeard] = useState("");
  const [busy, setBusy] = useState<"" | "starting" | "finishing">("");

  // The clock, and the transcript so far (it grows every two minutes).
  useEffect(() => {
    if (!rec) return;
    const tick = window.setInterval(() => setSecs(Math.floor((Date.now() - rec.started) / 1000)), 1000);
    const poll = window.setInterval(() => void api.lectureSoFar(rec.id).then((t) => t && setHeard(t)).catch(() => undefined), 15_000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [rec]);
  /** Record one piece; when it ends, send it and start the next (until stopped). */
  const piece = (r: Rec) => {
    const mime = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const recorder = new MediaRecorder(r.stream, mime ? { mimeType: mime, audioBitsPerSecond: 24_000 } : undefined);
    const chunks: Blob[] = [];
    const index = r.index;
    const start = Math.floor((Date.now() - r.started) / 1000);
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const upload = blobToBase64(blob)
        .then((b64) => api.lecturePiece(r.id, index, start, b64, blob.type))
        .catch((e) => {
          if (String(e).includes("isn't recording")) {
            // The PC side has ended it: stop here too, nothing more is recorded.
            endLocally(r);
            if (session?.id === r.id) setSession(null);
            setError("The lecture ended on the PC side — recording stopped.");
          } else setError(`A piece couldn't be sent (${String(e)}) — recording carries on.`);
        })
        .finally(() => r.uploads.delete(upload));
      r.uploads.add(upload);
      r.lastUpload = upload;
    };
    recorder.start();
    r.recorder = recorder;
    r.timer = window.setTimeout(() => {
      if (session?.id !== r.id || r.stopping) return;
      recorder.stop();
      r.index += 1;
      piece(r);
    }, PIECE_MS);
  };

  const start = async () => {
    setBusy("starting");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
      let id: string;
      try {
        id = await api.lectureStart(title);
      } catch (e) {
        stream.getTracks().forEach((t) => t.stop());
        throw e;
      }
      const r: Rec = { id, title: title || "Lecture", started: Date.now(), index: 0, recorder: null, stream, timer: 0, lastUpload: Promise.resolve(), uploads: new Set(), stopping: false };
      setRec(r);
      setHeard("");
      setSecs(0);
      setAsking(false);
      piece(r);
    } catch (e) {
      setError(String(e).includes("Permission") || String(e).includes("NotAllowed") ? "Windows didn't let Izuki use the microphone — allow it in Settings → Privacy → Microphone." : String(e));
    } finally {
      setBusy("");
    }
  };

  const stop = async () => {
    const r = recRef.current;
    if (!r) return;
    setBusy("finishing");
    r.stopping = true;
    clearTimeout(r.timer);
    // The last piece is sent by its onstop: wait until it has really arrived.
    await new Promise<void>((resolve) => {
      if (!r.recorder || r.recorder.state === "inactive") return resolve();
      // onstop runs first (it starts the upload); this listener runs after it.
      r.recorder.addEventListener("stop", () => resolve(), { once: true });
      r.recorder.stop();
    });
    // Every piece still on its way, not just the last.
    await Promise.allSettled([...r.uploads]);
    r.stream.getTracks().forEach((t) => t.stop());
    setRec(null);
    try {
      const [noteId] = await api.lectureFinish(r.id);
      if (noteId) onNote(noteId);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  };

  const cancel = () => {
    const r = recRef.current;
    if (!r || !window.confirm("Throw this recording away? Nothing will be saved.")) return;
    // Nothing more is sent: the last piece is dropped with the rest.
    endLocally(r);
    setRec(null);
    void api.lectureCancel(r.id);
  };

  return (
    <div className={cx("izk-inset rounded-[14px] p-3", rec && "ring-1 ring-rose-400/60")}>
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">
        <Mic size={14} /> Lecture Mode
        {rec && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2 py-[1px] text-[10.5px] font-bold text-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> RECORDING {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
          </span>
        )}
      </div>
      {!rec && !asking && busy !== "finishing" && (
        <>
          <p className="mt-1 text-[11.5px] text-izk-muted">Record a lecture, and Izuki writes it down and makes study notes — key points, definitions, examples, dates, with times.</p>
          <button type="button" onClick={() => setAsking(true)} className="izk-btn-primary izk-no-drag mt-2 flex items-center gap-1.5 px-3 py-1.5 text-[11.5px]">
            <Mic size={13} /> Start a lecture
          </button>
        </>
      )}
      {asking && !rec && (
        <div className="mt-2 space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Which class? (e.g. Biology — Chapter 4)" className="izk-field izk-no-drag w-full py-1.5 text-[12px]" />
          <label className="flex items-start gap-2 text-[11.5px] text-izk-ink">
            <input type="checkbox" checked={allowed} onChange={(e) => setAllowed(e.target.checked)} className="mt-0.5" />
            <span>
              I'm allowed to record this lecture (my instructor and school permit it), and people nearby know. The audio is sent to my transcription service (Groq or Gemini) to be written down.
            </span>
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={!allowed || busy === "starting"} onClick={() => void start()} className="izk-btn-primary izk-no-drag flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] disabled:opacity-40">
              {busy === "starting" ? <Loader2 size={13} className="animate-spin" /> : <Mic size={13} />} Start recording
            </button>
            <button type="button" onClick={() => setAsking(false)} className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]">Not now</button>
          </div>
        </div>
      )}
      {rec && (
        <>
          <p className="mt-1 text-[11.5px] text-izk-muted">“{rec.title}” — written down every two minutes. The Island shows it's recording.</p>
          {heard && <pre className="mt-1.5 max-h-[110px] overflow-y-auto whitespace-pre-wrap rounded-[10px] bg-black/25 p-2 text-[10.5px] text-izk-ink">{heard.split("\n").slice(-6).join("\n")}</pre>}
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={busy !== ""} onClick={() => void stop()} className="flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-rose-500">
              <Square size={11} fill="currentColor" /> Stop and make notes
            </button>
            <button type="button" onClick={cancel} className="izk-pill izk-no-drag flex items-center gap-1 px-2.5 py-1 text-[11px]"><X size={11} /> Discard</button>
          </div>
        </>
      )}
      {busy === "finishing" && (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-izk-muted"><Loader2 size={13} className="animate-spin" /> Writing the last part down and making your notes… (up to a couple of minutes)</p>
      )}
      {error && <p className="mt-2 text-[11.5px] text-izk-danger">{error}</p>}
    </div>
  );
}
