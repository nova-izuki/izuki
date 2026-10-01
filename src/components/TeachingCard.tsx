import { useEffect, useRef, useState } from "react";
import { api, emit, EV } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import { sendChatCommand } from "./VoiceEngine";
import { Section } from "./ui";

type Mode = "pause_resume" | "pause" | "play" | "slow";

/** A bounded lesson session, active only while the user watches this video. */
export function TeachingCard() {
  const [mode, setMode] = useState<Mode>("pause_resume");
  const [lessonQuery, setLessonQuery] = useState("");
  const [lessonSource, setLessonSource] = useState<"web" | "youtube">("web");
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; generation.current++; clearTimeout(timer.current); }; }, []);

  const explain = async (mine: number) => {
    setBusy(true);
    try {
      const shouldPause = mode === "pause" || mode === "pause_resume";
      const v = await api.browserVideo(shouldPause ? "pause" : mode === "slow" ? "slow" : "read", true);
      if (mine !== generation.current) return v;
      setNote(`Explaining ${Math.floor(v.time / 60)}:${String(Math.floor(v.time % 60)).padStart(2, "0")} · ${v.rate}×`);
      await sendChatCommand("Explain this video frame on my screen. Playback is already handled: " +
        (shouldPause ? "it is paused; do not operate the player while explaining." : "keep its current playback and speed.") +
        " Teach one useful idea in a short, friendly explanation. Use two or three pen marks to point out the relevant details. Only explain and draw; do not click, type, or press keys. Use visible content and captions; say if the frame lacks enough context.");
      if (mine === generation.current && mode === "pause_resume") {
        try {
          await api.browserVideo("play");
          setNote("Explanation complete · video resumed.");
        } catch {
          setNote("Explanation complete. Tap Play once in this video, then Izuki can keep following it.");
        }
      }
      return v;
    } finally { if (mounted.current) setBusy(false); }
  };

  const start = async (automatic: boolean) => {
    const mine = ++generation.current;
    clearTimeout(timer.current); setAuto(automatic);
    const began = Date.now(); let count = 0; let lastTime = -1; let lessonUrl = "";
    const tick = async (first: boolean) => {
      if (mine !== generation.current || !mounted.current) return;
      try {
        if (!first) {
          const current = await api.browserVideo("read");
          if (mine !== generation.current) return;
          if (current.url !== lessonUrl) { setNote("Lesson ended: you changed videos."); setAuto(false); return; }
          if (Date.now() - began > 10 * 60_000) { setNote("Lesson ended after 10 minutes. Start another when ready."); setAuto(false); return; }
          if (!current.focused || current.paused || Math.abs(current.time - lastTime) < 15 || useIzuki.getState().voice.busy) {
            timer.current = setTimeout(() => void tick(false), 45_000); return;
          }
        }
        const v = await explain(mine);
        if (mine !== generation.current || !mounted.current) return;
        lessonUrl = v.url; lastTime = v.time; count++;
        if (automatic && count < 5) {
          setNote(`Lesson active · ${count}/5 explanations. ${mode === "pause" ? "Resume the video when you're ready." : "Next check in 45 seconds."}`);
          timer.current = setTimeout(() => void tick(false), 45_000);
        } else { setAuto(false); setNote(automatic ? "Five explanations complete. Start another lesson when ready." : "Ask a follow-up, or resume the video when ready."); }
      } catch (e) { if (mounted.current && mine === generation.current) { setNote(String(e)); setAuto(false); } }
    };
    await tick(true);
  };
  const control = async (action: "play" | "slow" | "normal") => {
    try { const v = await api.browserVideo(action); setNote(`${v.paused ? "Paused" : "Playing"} · ${v.rate}×`); }
    catch (e) { setNote(String(e)); }
  };

  const findLesson = () => {
    const query = lessonQuery.trim();
    if (!query) {
      void api.browserShow();
      setNote("What would you like to learn? Type a topic, choose Web or YouTube, then find a lesson.");
      return;
    }
    const url = lessonSource === "youtube"
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      : `https://www.google.com/search?q=${encodeURIComponent(`${query} video lesson`)}`;
    void api.browserShow(url);
    setNote(`Searching ${lessonSource === "youtube" ? "YouTube" : "the web"} for “${query}”. Open any supported video, then press Explain now.`);
  };

  return <Section title="Video classroom" hint="Open a lesson in the Izuki browser. Izuki explains the visible frame and captions with pen marks on your screen.">
    <div className="flex flex-wrap gap-2">
      <input aria-label="Lesson topic" value={lessonQuery} onChange={(e) => setLessonQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") findLesson(); }} placeholder="What should we learn?" className="izk-field izk-no-drag min-w-44 flex-1 py-1.5 text-[11.5px]" />
      <select aria-label="Lesson source" value={lessonSource} onChange={(e) => setLessonSource(e.target.value as "web" | "youtube")} className="izk-field izk-no-drag w-auto py-1 text-[11.5px]"><option value="web">Web video</option><option value="youtube">YouTube</option></select>
      <button className="izk-pill izk-no-drag px-3 py-1.5 text-[11.5px]" onClick={findLesson}>Find a lesson</button>
      <select aria-label="Teaching playback" disabled={busy || auto} className="izk-field izk-no-drag w-auto py-1 text-[11.5px]" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
        <option value="pause_resume">Pause · explain · resume</option>
        <option value="pause">Pause & explain</option><option value="play">Explain while playing</option><option value="slow">Slow to 0.75× & explain</option>
      </select>
      <button disabled={busy || auto} className="izk-btn-primary izk-no-drag px-3 py-1.5 text-[11.5px] disabled:opacity-40" onClick={() => void start(false)}>Explain now</button>
      <button disabled={busy || auto} className="izk-pill izk-no-drag px-3 py-1.5 text-[11.5px] disabled:opacity-40" onClick={() => void start(true)}>Follow this lesson</button>
      {(busy || auto) && <button className="izk-pill izk-no-drag px-3 py-1.5 text-[11.5px]" onClick={() => { generation.current++; clearTimeout(timer.current); setAuto(false); setBusy(false); setNote("Lesson stopped."); void emit(EV.stopSpeaking); }}>Stop lesson</button>}
    </div>
    <div className="mt-2 flex flex-wrap gap-2">
      <button className="izk-pill izk-no-drag px-3 py-1 text-[11px]" onClick={() => void control("play")}>Resume video</button>
      <button className="izk-pill izk-no-drag px-3 py-1 text-[11px]" onClick={() => void control("normal")}>Normal speed</button>
    </div>
    <p className="mt-2 text-[10.5px] leading-relaxed text-izk-muted">Works with the largest visible HTML5 video in the Izuki browser, not just YouTube. Follow checks every 45 seconds while it is playing in the foreground, up to five explanations or ten minutes. Embedded or protected players may require one Play tap before they can resume.</p>
    {note && <p role="status" className="mt-2 text-[11.5px] text-izk-teal">{note}</p>}
  </Section>;
}
