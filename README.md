<div align="center">

<img src="docs/banner.svg" width="100%" alt="Izuki — the AI companion that lives on your screen" />

# Izuki — the AI companion that lives on your Windows screen

**Talk to it. It sees your screen, answers you out loud, and uses your mouse and keyboard to get things done.**

Free · Open source · Hands-free voice · Works with free AI keys

[**⬇ Download for Windows**](https://github.com/nova-izuki/izuki/releases/latest) ·
[🌐 Website](https://nova-izuki.github.io/izuki/) ·
[How to use it](#how-to-use-it) ·
[Support the builder ☕](#-support-the-builder)

*macOS and Linux versions are coming soon.*

</div>

---

Say your wake word — like **“Hey Nova”**. A glowing liquid orb
appears, Izuki says “Mhm?”, and you just talk — like a voice call with a friend who
happens to be great with computers. It can:

- **Answer questions about what's on your screen** — “what does this error mean?”, “summarise this page”.
- **Do things for you** — “open Spotify and play something chill”, “reply to this email saying I'll be late”.
  It looks, acts, looks again, and keeps going until the job is done.
- **Point things out** — “where's the export button?” and it circles it on your screen while it explains.
- **Ask you when it's unsure** — “Which account? Circle it for me.” Circle it, press Enter, and it carries on.
- **Check with you before anything final** — submitting, sending, buying or deleting always waits for your OK.
- **Remember you** — your name, your preferences, the habits it notices. You can see and delete every memory.

<!-- Screenshots / demo: drop a GIF or MP4 of Izuki in action into docs/ and link it here, e.g.
<p align="center"><img src="docs/demo.gif" width="720" alt="Izuki opening Spotify by voice" /></p> -->

## Features

| | |
|---|---|
| 🎙️ **Hands-free voice** | Wake word runs on your PC (no audio leaves it until you talk to Izuki). Live transcript of your words, a voice-reactive orb, and you can **talk over Izuki to interrupt it** — like ChatGPT's voice mode. |
| 🗣️ **A natural voice** | A neural voice that runs on your own PC (Kokoro), or a free cloud voice (Groq) for extra-human delivery. |
| 👀 **Sees your screen** | Understands screenshots *and* the real buttons/fields Windows reports, so clicks land on the right control. |
| 🔁 **Look → act → look again** | Multi-step tasks keep going across new windows, pages and pop-ups — up to six rounds per request. |
| ✍️ **Draw to show it** | Hold **Ctrl+D**, circle something, let go, then say or type what you want. A circle is a click, an arrow is a drag, a box watches a region. |
| 🧠 **Any brain you like** | Google Gemini (free), NVIDIA NIM (free), OpenRouter, OpenAI, Anthropic, a local model with Ollama, or any OpenAI-compatible server. Izuki races them and uses whichever answers first if one is slow. |
| 💾 **Flows & watchers** | Anything Izuki does can be saved and replayed in one click, or triggered when something on screen changes. |
| 💬 **Just chat** | A Chat tab for plain companion chat — plans, drafts, homework, advice — that never touches your screen. If something needs the PC, one tap lets Izuki do it. |
| ⏰ **Reminders** | “Remind me at 6 to call Mum” — by voice, chat or phone. Izuki says it out loud when it's due and texts your phone. |
| 📱 **On your phone, free** | Pair a Telegram bot (made in a minute with @BotFather) and text Izuki or send voice notes from anywhere — it can even do things on your PC and send you a screenshot. No app store, no server. |
| 📲 **Izuki for phones, no PC needed** | Open [nova-izuki.github.io/izuki/app](https://nova-izuki.github.io/izuki/app/) on your phone and add it to your home screen: chat or talk hands-free, it remembers you, reminders go into your phone's calendar, and "Hey Siri, Izuki" works with a two-step Shortcut. Free with your own Gemini key; link your PC for more. |
| 📞 **Call it from your phone** | Turn on *Call Izuki* and open the link on your phone to talk hands-free, like a call — your phone does the listening and talking, a free Cloudflare tunnel reaches your PC. |
| 🔌 **In your apps** | With your own free Composio key: read and draft email, check your calendar, find files in Drive, post to Slack or Notion, and hundreds more — from chat, voice or your phone. It always shows a draft and asks before sending or posting. |
| 🎧 **Hears you over music** | Other apps get quieter while you talk, and your words can be double-checked by a big cloud speech model that gets names right and ignores background songs. |
| 🛑 **Always stoppable** | **Esc** (while it's working or talking) or **Ctrl+Shift+Q** (any time) stops everything instantly — the task, the voice, the listening. Say “quit Izuki” to close the app. |

## Install

1. Download **`Izuki_…_x64-setup.exe`** from the [latest release](https://github.com/nova-izuki/izuki/releases/latest) and run it.
   Windows may say *“Windows protected your PC”* because the app is new and not yet code-signed —
   click **More info → Run anyway**.
2. The welcome tour opens. Get a **free Gemini key** at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   (sign in → *Create API key*) and paste it into the tour. That's the only setup.
3. Turn on **hands-free** in the tour and add a wake word — a free “Hey Nova” from
   [openwakeword.com](https://openwakeword.com) (*Draw → Hey Izuki → Wake words* walks you through it).
   Say it, and talk. No wake word? Hold **Ctrl+Win+Space** to talk any time.

The first time you use voice, Izuki downloads its speech models once (a few hundred MB), then works offline for listening and speaking.

**Needs:** Windows 10 or 11 (64-bit), a microphone (a headset works best), and internet for the AI brain.
**macOS and Linux:** coming soon — star the repo to hear when they land.

## How to use it

| Do this | To |
|---|---|
| Say your wake word, e.g. **“Hey Nova”** | Start a conversation. It keeps listening between turns — say “that's all” to end it (or set how long it waits, up to 30 min). |
| Just talk while Izuki is answering | Interrupt it — it stops and listens. |
| Hold **Ctrl+Win+Space** | Push-to-talk without the wake word. |
| Hold **Ctrl+D**, draw, let go | Mark something and ask about it (Enter with nothing typed = “help me with this”). |
| **Ctrl+Shift+Space** | The full drawing overlay, for multi-mark jobs. |
| **Esc** (while Izuki is busy) or **Ctrl+Shift+Q** | Stop everything. |
| Say or type **“quit Izuki”** | Close the app completely. |
| “Remember that …” / “Forget …” | Manage what Izuki knows about you. |

Every shortcut can be changed in **Settings → Shortcuts**. To add a wake word: sign in at
[openwakeword.com](https://openwakeword.com), find or train one (e.g. “Hey Nova”), download the **ONNX** file, and click
**Add it** under *Draw → Hey Izuki → Wake words*. (Models from that site are free for personal use.)

## Privacy

- Wake-word detection and speech-to-text run **on your PC**. With *Sharper hearing* on (and a Gemini or Groq key), what you say to Izuki is also sent to that provider to transcribe — switch it off in Talk settings to keep speech on your PC.
- Phone messages go through Telegram to Izuki on your PC; only the one phone you paired is answered.
- When a request needs your screen, a screenshot is sent to **the AI provider you chose** — nowhere else. Plain conversation sends only text.
- API keys, memories and settings stay in `%APPDATA%\Izuki` on your machine. Izuki never remembers passwords, keys or card numbers.
- No accounts, no telemetry.

## Build from source

You need [Node.js 20+](https://nodejs.org) and [Rust](https://rustup.rs) (plus the
[Tauri prerequisites](https://tauri.app/start/prerequisites/) for Windows).

```bash
git clone https://github.com/nova-izuki/izuki.git
cd izuki
npm install
npm run tauri dev      # run it
npm run tauri build    # make the installer (src-tauri/target/release/bundle)
```

Built with [Tauri 2](https://tauri.app), React and Rust.

## Roadmap

- Voice personalities and characters, more voices and languages
- “Explain this lecture” mode: pause videos and annotate the screen while teaching
- Deeper help in creative apps (music, drawing, video) and games
- More ways to teach it your routines

Ideas and pull requests are welcome — open an issue.

## ☕ Support the builder

Izuki is free, and it's going to stay free. It's built by one person, late at night,
powered by a lot of coffee and a big dream.

If Izuki saved you some time, made you smile, or you just want to see where it goes next,
you can buy me a coffee:

<div align="center">

**[💚 Tip on Cash App — $louismane2](https://cash.app/$louismane2)**

</div>

Every tip — even a dollar — keeps the lights on and the next feature coming. And if you
can't tip, a ⭐ on this repo or telling a friend means just as much. Thank you. 🙏

## About the builder

Hi, I'm **Solomon Nwachukwu** — an IT and cybersecurity student and the builder of Izuki.

Izuki is step one of something bigger. I'm working toward building real robot companions
(**Nova Izuki** is the name of that robot), an **Afro-tech community** where more of us
get to build the future instead of just using it, and one day a company big enough to
create real job opportunities for a lot of people. It's step by step — and Izuki is the first step.

**Get in touch:** [solotechsolutions1@gmail.com](mailto:solotechsolutions1@gmail.com) —
questions, ideas, collaborations or just to say hi.

## Credits & licenses

Izuki is MIT-licensed (see [LICENSE](LICENSE)). It builds on:

- [openWakeWord](https://github.com/dscripka/openWakeWord) — wake-word engine (Apache-2.0), with Google's
  [speech embedding](https://tfhub.dev/google/speech_embedding/1) model (Apache-2.0). No wake-word model is bundled —
  you add your own.
- [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) via [kokoro-js](https://github.com/hexgrad/kokoro) — on-device voice (Apache-2.0).
- [Moonshine](https://github.com/usefulsensors/moonshine) and [Whisper](https://github.com/openai/whisper) via
  [Transformers.js](https://github.com/huggingface/transformers.js) — on-device speech recognition.
- [ONNX Runtime Web](https://onnxruntime.ai) — runs the models.

Made with ❤️ by Solomon Nwachukwu.
