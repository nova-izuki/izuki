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
 * an error, a video), then a fresh handful from the wider desk.
 *
 * The second group is shuffled and rotated while the tab is open, so the
 * empty chat feels like a living desk rather than the same four canned
 * prompts every time you open it. Contextual screen ideas still lead.
 */
export function useSmartIdeas(count = 4): Idea[] {
  const [screen, setScreen] = useState<Idea[]>([]);
  const [random, setRandom] = useState<Idea[]>(() => pickIdeas(new Date(), count));

  useEffect(() => {
    let alive = true;
    const look = () =>
      void api
        .islandStatus()
        .then((s) => alive && setScreen((s.suggestions ?? []).map((x) => ({ label: `${x.icon} ${x.label}`, ask: x.ask }))))
        .catch(() => undefined);
    const rotate = () => {
      if (alive) setRandom(pickIdeas(new Date(), count));
    };
    look();
    const t = window.setInterval(() => {
      look();
      rotate();
    }, 45_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [count]);

  const ideas = [...screen, ...random];
  const seen = new Set<string>();
  return ideas.filter((i) => !seen.has(i.label) && seen.add(i.label)).slice(0, count);
}

function pickIdeas(now: Date, count: number): Idea[] {
  const seen = new Set<string>();
  return shuffle([...forTheTime(now), ...DESK])
    .filter((idea) => !seen.has(idea.label) && seen.add(idea.label))
    .slice(0, count);
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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

/** The wider desk: useful, low-stakes prompts that can turn up any time. */
const DESK: Idea[] = [
  { label: "✍️ Draft a tricky message", ask: "Help me draft a message I've been putting off. Ask me who it's for and what I want to say." },
  { label: "🧾 Summarize what I'm reading", ask: "Summarize what's on my screen and tell me the one thing I should remember." },
  { label: "📚 Quiz me on a topic", ask: "Quiz me on something I'm studying. Ask me what the topic is, then go one question at a time." },
  { label: "💡 Give me a startup idea", ask: "Give me one unusual startup idea and the smallest first version I could test this week." },
  { label: "🎧 Find a focus playlist", ask: "Find me a focus playlist that fits the way I'm working right now." },
  { label: "🗓️ Plan my week", ask: "Help me plan my week — ask me what's fixed and what I keep pushing back." },
  { label: "💸 Where did my money go?", ask: "Help me look at where my money went this month and point out the one thing worth changing." },
  { label: "🧭 Where did I leave off?", ask: "What was I working on before this? Help me pick up the thread." },
  { label: "🤝 Practice a hard conversation", ask: "Role-play a difficult conversation with me. Ask me who it's with and what I need to say." },
  { label: "🍜 Pick dinner from my fridge", ask: "Help me decide dinner from what I already have — ask me what's in the fridge." },
  { label: "📷 Explain what's on my screen", ask: "Explain what's on my screen and what I can do next." },
  { label: "🧘 Give me a one-minute reset", ask: "Give me a calm, practical one-minute reset I can do at my desk." },
  { label: "🗞️ Catch me up on one story", ask: "Catch me up on one story that actually matters today, in five sentences." },
  { label: "🧠 Teach me something cool", ask: "Teach me one genuinely surprising thing in under a minute." },
  { label: "🎯 Focus for 25 minutes", ask: "Remind me in 25 minutes to take a break." },
  { label: "📝 Turn this into a plan", ask: "Turn what I'm looking at into a clear, short plan with the first step I should take." },
  { label: "🔎 Find something in my notes", ask: "Find the note I'm thinking of — ask me what it was about if you need to." },
  { label: "🌙 Wind down", ask: "Help me wind down with a calm one-minute breathing exercise." },
];
