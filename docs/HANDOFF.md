# Hand-off: where Izuki's work stands

Written for the next Claude Code session (e.g. in VS Code on the owner's
Windows PC) so it can carry on without losing track. Read this whole file,
then `docs/HOW-IZUKI-WORKS.md`, before changing anything.

## The owner and the goal

- Owner: Solomon (GitHub `nova-izuki`), building Izuki as a company. Not a
  developer by trade — explain things plainly and keep going without asking
  for permission on small things; ask only for real decisions.
- Goal: the best free AI companion — "like Clicky / Gemini Live / Siri /
  ChatGPT voice, but smarter", able to do things on the PC, in the user's
  apps, and from the phone. **Everything must stay free for users**: Izuki
  runs on each user's PC with *their own* free keys (Gemini, Groq, Composio,
  a Telegram bot). Never add anything that needs a paid service or a server
  the owner pays for. (Owner said: "if it's paid then no need".)
- Style the owner wants: fast, light on AI calls, smooth, no bugs, no lag,
  asks when unsure (with real choices), never stalls halfway, interruptible.

## What's done (branch `claude/amazing-thompson-t3n7oh`, PR #1 → `main`)

1. **Stopping** — stop pressed while the model thinks is no longer wiped
   (`brain.rs`: only tasks clear the abort flag, once, at start); Esc works
   for drawings/replays/typed tasks (`hotkey.rs` `working()` guard) and
   ignores Izuki's own injected Esc; watchers ignore stale stops.
2. **Hearing** — `duck.rs` lowers other apps' volume while listening (safe
   restore); `stt.rs` "sharper hearing" races Groq Whisper / Gemini against
   the on-device model (`src/lib/speechInput.ts`), at most 0.7 s extra.
3. **Acting** — hover-only controls listed and hovered first (`uia.rs`,
   `automation.rs`); field values + focus given to the model; prompt reads
   garbled speech for intent; asks with real choices; asks instead of
   quitting when stuck; drawings use the look→act→check loop (`submit_task`).
   Ctrl+D ask box has one-tap actions (`QuickAsk.tsx`).
4. **Panel** — layout fixes (wrapping rows, icons, select text, 5-tab bar).
5. **Chat tab** (`ChatTab.tsx`) — written companion chat; `[SCREEN]` offers
   "Do it on my PC"; `[APPS]` goes to the apps lane.
6. **Reminders** (`reminders.rs`) — `[REMIND YYYY-MM-DD HH:MM | text]` tags
   from any lane; spoken + texted when due.
7. **Phone via Telegram** (`telegram.rs`) — long polling from the PC, pairing
   code, voice notes, `/screen` `/stop` `/reminders` `/call`.
8. **Apps via Composio** (`composio.rs`) — user's own free key; Tool Router
   search/run/connect/reply JSON loop; never sends/posts/deletes without yes.
9. **Shared companion** (`companion.rs`) — one conversation for Telegram and
   calls; handles `[SCREEN]`, `[APPS]`, reminders.
10. **Call Izuki** (`call.rs` + `call.html`) — local page server
    (`tiny_http`) + free Cloudflare quick tunnel (`cloudflared.exe`
    downloaded once to `%APPDATA%\Izuki\bin`); the phone's own speech
    recognition and voice; link has a secret token; link texted to the
    paired phone. Toggle in Settings → Izuki on your phone.
    Settings also shows a **QR code** for the link (`QrCode.tsx`, drawn
    locally with the bundled `qrcode-generator` — no online service), so the
    phone can just scan it. Useful when Telegram isn't available (the
    owner's Telegram account is currently spam-limited).

11. **Discord** (`discord.rs`, `DiscordCard.tsx`) — same as Telegram for
    people Telegram doesn't work for (the owner's Telegram account is
    spam-limited and can't even use @BotFather). A websocket to Discord's
    gateway from the PC (`tokio-tungstenite`), DMs only, the same pairing
    code, voice messages, `/screen` `/stop` `/call` `/reminders`. Quick
    commands, screenshots and "message my phone" are shared in
    `companion.rs` (`quick`, `screenshot`, `notify_everywhere`).

12. **Izuki for phones** (`mobile/`) — a free home-screen web app (no app
    store, no PC needed): each user pastes their own free Gemini key (kept on
    the phone), chats or talks hands-free (Safari/Chrome speech recognition,
    or a recording Gemini hears), memory, reminders added to the phone's own
    calendar (.ics with an alert), "Hey Siri, Izuki" via a 2-step Shortcut
    that opens `?q=…`, and an optional link to the PC's Call Izuki address
    (`call.rs` now answers CORS) for PC tasks and apps. Published by
    `.github/workflows/phone-app.yml` to https://nova-izuki.github.io/izuki/
    once merged to `main` and Pages is set to "GitHub Actions".
    iMessage is not possible for free without a Mac (Apple only allows it
    through a Mac or paid providers).

## What has NOT been verified (do this first on Windows)

The cloud session could only type-check (`cargo check --target
x86_64-pc-windows-gnu --tests`), run `tsc`, `vite build`, and screenshot the
panel in a browser. Nothing has been run on Windows. Test, in order:

1. `npm install` then `npm run app:dev` — app starts, no console errors.
2. `cargo test` in `src-tauri` (Windows only — Linux can't build the crate).
3. Music playing while you talk: music dips, comes back after.
4. Esc in the middle of a drawing task stops it.
5. "Close this tab" by voice in Chrome (hover-only ✕).
6. Chat tab: a normal chat; "remind me in 2 minutes to stretch" → fires.
7. Telegram: make a bot, pair with the code, text it, send a voice note,
   `/screen`, "open Notepad on my PC".
8. Composio: paste a key, Test, "what's in my inbox?" → sign-in link opens.
9. Call Izuki: toggle on, wait for the link, scan the QR, talk.
10. Discord: make a bot, paste the token, add it to a server, DM it the
    code, text it, send a voice message, `/screen`.
11. Phone app: open https://nova-izuki.github.io/izuki/ in Safari, add a
    Gemini key, chat, talk, set a reminder → "Add to calendar", link the PC.

Fix whatever breaks; keep each fix small.

## Ideas queued (only free ones)

- iMessage only via a user's own always-on Mac (BlueBubbles) — optional.
- WhatsApp: Meta charges per reply after 1,000 free/month per number from
  1 Oct 2026, and setup is heavy — skip unless the owner asks.
- Bank access: skip (Plaid etc. are paid).
- Nice next steps: a morning brief (calendar + email + weather + reminders)
  sent to Telegram; release v1.1.0 (bump
  `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, then
  push a `v1.1.0` tag — `.github/workflows/release.yml` builds the installer
  and existing installs auto-update). Only release after the checks above.

## House rules for this codebase

- Comments explain *why*, in plain words, matching the existing tone.
- Every AI call is precious: prefer local/instant paths, the fast chat lane,
  and tags (`[SCREEN]`, `[APPS]`, `[REMIND …]`) over extra model calls.
- User-facing text: short, warm, plain; errors say how to fix it.
- Never commit secrets. Settings live in `%APPDATA%\Izuki\settings.json`.
