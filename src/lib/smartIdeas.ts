import { useEffect, useState } from "react";
import { api } from "./ipc";

export interface Idea {
  /** What the button says. */
  label: string;
  /** What Izuki is asked when it's tapped. */
  ask: string;
}

/**
 * Ideas that fit the moment, for the Chat tab: what's on your screen right
 * now (the same instant, no-AI suggestions as the Island — a quiz, an email,
 * an error, a video), then the time of day and the weekend. Refreshed every
 * so often while the tab is open.
 */
export function useSmartIdeas(count = 4): Idea[] {
  const [screen, setScreen] = useState<Idea[]>([]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let alive = true;
    const look = () =>
      void api
        .islandStatus()
        .then((s) => alive && setScreen((s.suggestions ?? []).map((x) => ({ label: `${x.icon} ${x.label}`, ask: x.ask }))))
        .catch(() => undefined);
    look();
    const t = window.setInterval(() => {
      look();
      setNow(new Date());
    }, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  const ideas = [...screen, ...forTheTime(now)];
  const seen = new Set<string>();
  return ideas.filter((i) => !seen.has(i.label) && seen.add(i.label)).slice(0, count);
}

function forTheTime(d: Date): Idea[] {
  const h = d.getHours();
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const out: Idea[] = [];
  if (h >= 5 && h < 11) {
    out.push({ label: "☀️ Plan my day", ask: "Help me plan my day — ask me what I've got on if you need to." });
    out.push({ label: "📧 What's in my inbox?", ask: "What's in my inbox today?" });
  } else if (h < 14) {
    out.push({ label: "🎯 Focus for 25 minutes", ask: "Remind me in 25 minutes to take a break." });
    out.push({ label: "🥗 Quick lunch idea", ask: "Give me a quick, easy lunch idea." });
  } else if (h < 18) {
    out.push({ label: "🎯 Focus for 25 minutes", ask: "Remind me in 25 minutes to take a break." });
    out.push({ label: "📰 What's new today?", ask: "What's the most interesting news today? Keep it short." });
  } else if (h < 22) {
    out.push({ label: "📝 Recap my day", ask: "Help me recap my day — ask me how it went." });
    out.push({ label: "🍲 What should I cook?", ask: "Help me decide what to cook tonight — ask me what I have." });
  } else {
    out.push({ label: "⏰ Wake-up reminder", ask: "Remind me tomorrow at 7am to get up." });
    out.push({ label: "🌙 Wind down", ask: "Help me wind down with a calm one-minute breathing exercise." });
  }
  if (weekend) out.push({ label: "🎉 Something fun this weekend", ask: "Suggest something fun to do this weekend — ask me where I am if you need to." });
  out.push({ label: "🧠 Teach me something cool", ask: "Teach me one genuinely surprising thing in under a minute." });
  return out;
}
