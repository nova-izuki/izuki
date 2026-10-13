import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import pkg from "../../package.json";
import { useIzuki, type TabId } from "../lib/store";
import { sendChatCommand } from "./VoiceEngine";

/**
 * "What's new" — shown once after each update (and any time from the ✨
 * button): every new thing with one tap to try it or jump to where it
 * lives. Nothing new should ever be hidden.
 */

const SEEN_KEY = "izk.whatsNewSeen";

interface Item {
  icon: string;
  title: string;
  how: string;
  /** One tap: ask Izuki something, or open where it lives. */
  try?: { label: string; say?: string; tab?: TabId; id?: string };
}

const ITEMS: Item[] = [
  { icon: "🎯", title: "Missions: Izuki works while you rest", how: "Draw → Missions: give Izuki a list (“check my assignments and list what's due”, “summarise my unread emails”…), press Start and step away. It does them one by one and tells you — on the PC and your phone — when it's done. Anything that needs your yes waits for you. By voice: “add to my missions: …”, then “start my missions”.", try: { label: "Missions", tab: "draw", id: "draw-missions" } },
  { icon: "📥", title: "Your inbox, gone through", how: "Apps → Inbox: Izuki reads your Gmail and shows what needs you, urgent first. For each one: “Draft a reply” (you see the draft — nothing is sent without your yes) or “Follow up in 3 days” (a reminder). It also lists what Izuki really did in your apps.", try: { label: "Inbox", tab: "apps", id: "apps-inbox" } },
  { icon: "🤖", title: "“What are you doing?”", how: "Ask Izuki what it's doing and it tells you the truth: the task it's actually on and its latest step — or that nothing's running. Asking mid-task doesn't stop the task." },
  { icon: "🎙️", title: "The talk key works again", how: "Ctrl+Win+Space did nothing: Windows keeps that combination for switching keyboard languages, so Izuki never got it. Now Izuki catches it itself — press and the orb and waveform come up; hold and let go to send." },
  { icon: "🖐️", title: "Air control: no more accidents", how: "Only a raised hand (fingers up, in front of the camera) moves the pointer — hands resting on the keyboard while you type are ignored. A pinch has to be held a moment, so fingers brushing past don't click. And on a small button the ring slows down, so it's easy to stay on it.", try: { label: "Air control", tab: "settings", id: "settings-air" } },
  { icon: "🔒", title: "Nothing sent without your yes", how: "Emails, messages and posts through your linked apps now always show you the draft first — who it's to, the subject and the words — and only an explicit “yes, send it” sends exactly that. The same message can't be sent twice." },
  { icon: "📧", title: "New emails on the Island", how: "When a new email lands in your main inbox (not promotions or social), the Island shows who it's from and the subject. Tap it and Izuki reads it to you and says whether you need to do anything. Needs Gmail linked in Apps." },
  { icon: "💡", title: "Suggestions for creative apps", how: "The Island now has one-tap help for music apps (“Make a beat”, “Mixing tips”), Blender, video editors, Photoshop / GIMP / Figma, OBS and PowerPoint — on top of browsers, email, chats, Word, PDFs, Excel and code." },
  { icon: "🎮", title: "Play games with your hand", how: "Turn on Game controls (Settings → Air control, or say “turn on game controls”): lean your hand left, right, up or down to hold the arrow keys (or W A S D), pinch to hold Space, thumb + ring for Enter. A fist still pauses.", try: { label: "Air control", tab: "settings", id: "settings-air" } },
  { icon: "✊", title: "Grab things with your hand", how: "With Air control on, pinch on your character or the orb and move your hand — it comes along, like dragging with a mouse. Open your fingers to put it down." },
  { icon: "📱", title: "Your phone is a remote for your PC", how: "Turn on “Let my phone control this PC” (Settings → Phone), then tap Remote in the Izuki phone app: see your PC's screen live (tap it to click there), use the phone as a trackpad (two fingers scroll or right-click, press and hold to drag), type, press keys and control music. Only your linked phone, never while the PC is locked." },
  { icon: "🤙", title: "Call Izuki with your hand", how: "With Air control on, make the “call me” hand — thumb and little finger out, the other three folded — and hold it half a second: Izuki starts listening right away. Just say what you want (no “Hey Nova” needed).", try: { label: "Air control", tab: "settings", id: "settings-air" } },
  { icon: "🖐️", title: "Air control: every gesture fixed", how: "Pinching Izuki's own buttons (like the test's “Pinch me”) works now, pinches are easier, the peace-sign scroll is forgiving, right-click no longer turns into a left click, and a fist only pauses when it's a real fist held a second (“Hold to pause…” shows first). The ring is easy to see on bright screens, and clicking a text box brings up the air keyboard.", try: { label: "Air control", tab: "settings", id: "settings-air" } },
  { icon: "🗣️", title: "“Make my pinky pinch take a screenshot”", how: "Choose what your quick gestures do — thumb + middle, ring or little finger, and a flick left or right — in Settings → Air control, or just say it. “Set air control to precision” and “reset my air gestures” work too.", try: { label: "Air gestures", tab: "settings", id: "settings-air" } },
  { icon: "✍️", title: "Say it, it's written well", how: "Point at a text box and say what to type: Izuki fixes the grammar, spelling and punctuation before typing it (your own words — nothing added)." },
  { icon: "👄", title: "Characters talk and blink", how: "The moving characters now open their mouths with every syllable of Izuki's voice, blink like a person (now and then twice), and change gesture as each new phrase begins." },
  { icon: "🛠️", title: "Windows tweaks and Island looks", how: "Settings → Windows tweaks: taskbar on the left, hide the taskbar, seconds on the clock, “End task” on right-click, the full right-click menu, file extensions, dark mode and more — each a switch that flips back. And pick an Island look: Glass, Bubble, Squircle, Neon outline or Aero.", try: { label: "Windows tweaks", tab: "settings", id: "settings-tweaks" } },
  { icon: "⚡", title: "Air control keeps up with your hand", how: "The dots and the ring used to trail behind your hand and catch up when you stopped: hand tracking ran 1–7 times a second. It now runs on the graphics chip in the background — about 25–30 times a second — and Windows can no longer slow it down. Pick Fast, Balanced or Precision in Settings → Air control.", try: { label: "Air control", tab: "settings", id: "settings-air" } },
  { icon: "🧭", title: "A clearer Air control guide", how: "The guided test now goes one step at a time: which fingers to use, a little moving picture of the gesture, what Izuki sees your hand doing right now, and Back / Try again / Skip. Six steps: show your hand, move, pinch to click, pinch and hold to drag, peace-sign scroll, fist to pause.", try: { label: "Start the test", tab: "settings", id: "settings-air" } },
  { icon: "📧", title: "\"Open Outlook\" opens Outlook", how: "Saying \"open Outlook\" (or \"switch to Discord\", \"launch Slack\") used to go to your linked accounts instead of opening the app. Now it opens the real app on your PC. Asking about what's inside — \"read my emails\", \"what's in my inbox\" — still uses your linked account." },
  { icon: "🖐️", title: "Air control really turns on now", how: "The real reason it never worked: Air control was only switched on while you were drawing on the screen — the rest of the time, turning it on did nothing at all (no camera light, no pointer). It now runs whenever it's on. Settings → Air control → Start the test.", try: { label: "Test Air control", tab: "settings", id: "settings-air" } },
  { icon: "🎞️", title: "Smooth characters (or retro)", how: "Characters hold each gesture and blend into the next, with a gentle breath — no more flicking through poses. Like the old flick-book look? Pick Movement: Retro game under the character list.", try: { label: "Characters", tab: "settings", id: "settings-look" } },
  { icon: "🗣️", title: "Voices show the new characters", how: "With a moving character picked, each voice in Draw → Voice shows its painted face, and picking a voice switches to that voice's character — never back to the old drawings." },
  { icon: "🧭", title: "Shortcuts and steps", how: "The shortcut row in Settings now has Air control and Glow. The Draw tab spells out how to draw, step by step." },
  { icon: "🎛️", title: "Beats for any producer app", how: "Say \"make a trap beat\" (or \"…in Ableton\") and Izuki knows which producer app you use — the one you name or the one that's open: Ableton Live, FL Studio, REAPER, Studio One, Cubase, Bitwig, Cakewalk, Pro Tools, Reason, LMMS, Waveform, Ardour or MPC. It tells you exactly how to bring the beat in there and opens the folder with the file selected, ready to drag in." },
  { icon: "🏴‍☠️", title: "Lucía and Captain Salty join the cast", how: "The last two characters still in the old style are now painted like the rest and fully animated: they walk, talk with their hands, think, type on a laptop, wave, cheer and point. All 37 characters move like a person now.", try: { label: "Pick a character", tab: "settings", id: "settings-look" } },
  { icon: "✅", title: "Tasks keep going until they're done", how: "When Izuki said \"Opening Blackboard for you now\" or \"let me wait for the page to load\", the task sometimes just stopped there. Now it looks again and carries on, and if a page really won't come, it says so and \"keep going\" picks it up. A blank page counts as still loading, so Izuki waits for it instead of opening it again." },
  { icon: "🌈", title: "Glowing screen edges", how: "A thin line of light now runs around your screen while Izuki is with you: calm cyan while it listens, every colour flowing faster while it thinks, swelling with each word while it talks, and gone when it is quiet. Turn it off, or pick Glow only to hide the orb or character and let the edges alone show Izuki is there. On the phone app too.", try: { label: "Glow settings", tab: "settings", id: "settings-look" } },
  { icon: "🖐️", title: "Air control finds your hand", how: "Hand tracking used to load on the graphics chip, which could take 25 seconds or never finish, so the pointer never moved. It now runs on the processor: ready in about 5 seconds, and it finds your hand right away. If anything stalls, it tells you what went wrong instead of waiting forever.", try: { label: "Test Air control", tab: "settings", id: "settings-air" } },
  { icon: "🔧", title: "Air control fixed, and characters steadier", how: "The camera now turns on for Air control (Windows' \"allow camera?\" box was hiding on Izuki's invisible layer). Your external webcam shows in the camera list, and switching cameras works at once. Characters keep their whole head while thinking and don't twitch. Say \"walk to my Chrome\" and your character walks there and points. Quit Izuki always quits." , try: { label: "Test Air control", tab: "settings", id: "settings-air" } },
  { icon: "🖐️", title: "Air control: a guided test, a keyboard and a pen", how: "Turn Air control on and a guide shows what your camera sees with your hand's outline, then walks you through moving, pinching, scrolling and pausing — each step ticks itself off. A round ⌨️ button opens a floating keyboard you type on with pinches (or tap 🎤 and say it); ✏️ draws on the screen. Sharper camera pictures, so your hand is found from further away.", try: { label: "Air control settings", tab: "settings", id: "settings-air" } },
  { icon: "🎯", title: "Tasks finish instead of going in circles", how: "When a page is slow to load, Izuki now waits for it instead of opening it again and again, then carries on. And when a free AI brain is busy, Izuki goes back to it after a minute instead of leaving it out for hours." },
  { icon: "🎬", title: "All 35 characters animated", how: "Every character now walks, talks with hand gestures, thinks, types, waves, cheers and points, drawn frame by frame.", try: { label: "Pick a character", tab: "settings", id: "settings-look" } },
  { icon: "🖐️", title: "Air control, one tap anywhere", how: "A 🖐️ button on the chat, the round chat bubble, the Island, the Chat tab and the tray menu turns Air control on or off." },
  { icon: "🕺", title: "Characters that move like a person", how: "A new look for Izuki: pick one of 35 characters and they show up when you ask, like the orb — no circle, just them. They wave hello, tilt their head to listen, put a hand to their chin to think, type on a tiny laptop while working, talk with their hands, cheer when it's done, dance to your music, and walk over to what Izuki clicks and point at it. Waiting, they stretch, check their phone, sip coffee… Drag, scroll to zoom, – to make small, × to stop. Optional pet that follows them.", try: { label: "Pick a character", tab: "settings", id: "settings-look" } },
  { icon: "⚡", title: "A faster PC: the desktop character is off", how: "The character that lived on your desktop all the time is switched off — it slowed some PCs down. Characters are coming back the right way: as a look for Izuki that shows up only when you ask, with real body movement." },
  { icon: "🖐️", title: "Air control: your hand drives the PC", how: "Through any camera: move your hand to move the pointer, pinch to click (hold to drag and drop), thumb + middle right-clicks, thumb + ring copies, thumb + pinky pastes, two fingers scroll, a palm swipe goes back. Point at a text box and hold still: it's clicked, and what you say goes in it. A box hugs whatever is under your hand, even one tiny FL Studio step. Teach it your own gestures too. Or say “turn on air control”.", try: { label: "Air control settings", tab: "settings", id: "settings-air" } },
  { icon: "📷", title: "Any camera, picked for you", how: "Built-in, USB, capture card or a virtual camera like OBS: the Island's camera picks the right one by itself (yours if you chose one), moves on if one won't start, and switches if you unplug it. More than one? Pick from the corner of the view." },
  { icon: "👄", title: "3D faces open their mouths", how: "The holograms and the built-in Woman and Man now open their mouths when they talk — teeth and all." },
  { icon: "🟢", title: "See PC fast working", how: "With “Keep my PC fast 24/7” on, PC Care shows it live: when it last checked, and what it last cleaned by itself.", try: { label: "Open PC Care", tab: "settings", id: "settings-boost" } },
  { icon: "🎨", title: "Every character, painted", how: "All 35 characters now come in the Concept style — each talks with a painted mouth and blinks. On the PC and the phone.", try: { label: "Pick a style", tab: "settings", id: "settings-look" } },
  { icon: "🎹", title: "FL Studio: “make afrobeats”", how: "Set up once (Settings → FL Studio), then ask for a beat by genre and tempo — you watch the drums write themselves, and it plays. Stop, play and tempo by voice too. Every change is one undo step.", try: { label: "Set up FL Studio", tab: "settings", id: "settings-flstudio" } },
  { icon: "🗣️", title: "A voice that never drops", how: "If your voice can't speak right now, every other voice you've set up is asked at once — the first to answer speaks, always in the same gender." },
  { icon: "🧠", title: "Deep thinking in the Island", how: "Next to the + in the Island's Ask: switch on 🧠 Deep for hard questions — the AI really thinks it through before answering (answer first, then the reasoning that matters). It's remembered." },
  { icon: "👁️", title: "3D faces blink — and their lips stay on the line", how: "The holograms and the built-in Woman and Man now blink, and their mouths open where their lips are, following the words. And Nia joins Dre in the Concept style.", try: { label: "Pick a style", tab: "settings", id: "settings-look" } },
  { icon: "🛡️", title: "Turn off services you don't use", how: "Settings → PC Care → Background services: Izuki finds the usual unneeded ones (Remote Registry, telemetry, offline maps…) — a known list only — and turns off the ones you pick. Windows asks once; Undo puts them back. Or say “turn off services I don't use”.", try: { label: "Open PC Care", tab: "settings", id: "settings-boost" } },
  { icon: "🔲", title: "See where Izuki will click", how: "Optional: Settings → Control → Show where I'll click. A box appears on what Izuki is about to click or type into, half a second first — in every mode, Jarvis included. Stop while it's up and nothing is clicked.", try: { label: "Open Control settings", tab: "settings", id: "settings-execution" } },
  { icon: "🛡️", title: "PC Care — it tells you when something needs you", how: "Settings → PC Care checks your antivirus, firewall, drive health, disk space and Windows Update, with the fix one tap away. With alerts on, the Island (and your phone) says so the moment something's wrong — at most twice a day. Or just ask “is my PC safe?”.", try: { label: "Open PC Care", tab: "settings", id: "settings-boost" } },
  { icon: "🚗", title: "Drive mode on your phone", how: "Tap Drive in the phone app (or say “drive mode”): your speed in huge type, “take me to…” starts Google Maps, “find gas near me”, “play music” and “text that I'm on my way” happen at once. It speaks up after 2 hours at the wheel or when your battery's low. 🎉 Fun mode: a cheeky road-trip buddy. Calls to your PC also work better on school Wi-Fi." },
  { icon: "🏝️", title: "The Island asks about anything — and does it for you", how: "Open the Island anywhere and ask about your screen (on a web page it reads the page). Ask “what do I do here?” and press Do it for me — Izuki does the steps while you watch. The + adds photos, text files or a screenshot. Every conversation is kept as a tab: pin the ones you want, or Continue in Chat." },
  { icon: "🪶", title: "Lighter on your PC", how: "A full recheck for lag: the Island pill no longer redraws the screen while music plays (its waveform moves only when the Island is open), the window's glow pauses in the background, an AI on this PC that isn't running (like 9Router) is skipped at once, a model your key can't use rests for a day, and the sharp-eye second look runs once — on the plan actually used." },
  { icon: "🧥", title: "Concept (beta) — the fashion concept-art look", how: "A new character style: very tall, small head, flat two-tone gouache, oversized clothes, one loud accent colour. Dre first — he talks and blinks. Settings → Voice orb → Character style → Concept (beta), or say “make your style concept art”.", try: { label: "Pick a style", tab: "settings", id: "settings-look" } },
  { icon: "💽", title: "“What's taking up my space?”", how: "Ask any way you like — Izuki answers in seconds with free space, the biggest apps and the biggest folders. No AI needed, nothing opens.", try: { label: "Ask it", say: "what's taking up my space" } },
  { icon: "👁️", title: "See what Izuki is doing", how: "While it works, the Island shows what's really happening — “Asking Gemini…”, “Clicking “Next”…”, “Typing…” — instead of a blind “Thinking…”. And it never types commands into a terminal unless you spelled the command out." },
  { icon: "⚡", title: "Less “Thinking…”, more doing", how: "When one AI says no (busy, out of quota), Izuki now asks the next two at once instead of one at a time, and adds a backup after 4 seconds of silence — one slow AI is no longer the whole wait. “Keep my PC fast” no longer squeezes busy programs (that made them slower) and only trims memory when it's actually short. If another window covers what Izuki is about to click, it brings its window forward and checks again first. And “check status” opens the status screen.", try: { label: "Show me", say: "check status" } },
  { icon: "🌊", title: "Pick your Island waveform", how: "Settings → Talk to Izuki → Island waveform: Silk, Bars, Mirror, Neon or Dots — or Auto, which gives every song its own look. And the Island now knows a song from a lesson, an ad or a video: songs get “About this song” and “Flow with it”, lessons get “Explain this lesson”, ads get “Skip ad”." },
  { icon: "🎓", title: "Teach in real time finds the video", how: "Type a topic (“how to dribble in soccer”) and press Teach in real time: Izuki finds a good video, plays it in the Izuki browser and teaches as it goes." },
  { icon: "🗂️", title: "Notes: ⋯ menu and select many", how: "Every note has a ⋯ menu — open, summarise, quiz me, copy, delete. Tap Select to pick several and delete, summarise or copy them at once. And every page with sections (Notes, Flows, Watchers, Settings, Draw, Apps) has a jump bar that follows you down.", try: { label: "Open Notes", tab: "notes" } },
  { icon: "♻️", title: "Recycle Bin, handled", how: "Settings → PC Boost shows how full the Recycle Bin is with an “Empty it” button (it asks first), and “Clear old Recycle Bin items” clears only what's sat there 30+ days. Each daily clean now works on its own switch. Updates are checked every hour and announced on the Island.", try: { label: "Open PC Boost", tab: "settings", id: "settings-boost" } },
  { icon: "🛑", title: "Stop means stop — and the title bar stays put", how: "Pressing Stop on “Izuki is thinking…” now clears the orb and any words still typing out at once. The window's title bar can no longer be pushed half out of sight when a page scrolls itself (the chat following new words, Find anything, a jump link), so you can always drag the window. And the jump bar on Settings, Draw and Apps now follows you down the page." },
  { icon: "🎨", title: "Painted Dre (beta)", how: "A real painting of Dre, brought to life: his painted mouth opens with the words, his eyes blink, and he breathes and sways. Pick Settings → Voice orb → Character style → Painted (beta), or say “make your style painted”. More painted characters are coming; the others show in Ink until theirs are done.", try: { label: "Pick a style", tab: "settings", id: "settings-look" } },
  { icon: "🎯", title: "A sharp eye for clicks", how: "When the AI picks a spot by eye instead of a known button, a model made for pointing looks again first (Gemini, free with your key) and lands the click on the real button under it — never onto a Delete, Buy or Send it wasn't asked for. If the two disagree, Izuki takes a fresh look instead of guessing. Optional: switch on UI-TARS, ByteDance's screen model, through OpenRouter (about $0.0002 a look).", try: { label: "Open Control settings", tab: "settings", id: "settings-execution" } },
  { icon: "🧹", title: "Keep my PC fast 24/7 — and clear duplicate downloads", how: "Settings → PC Boost: “Keep my PC fast 24/7” now works on its own (no need for “Watch for lag” too). New “Clear duplicate downloads”: once a day, and when you press Make my PC fast, extra copies like “report (1).pdf” next to an identical “report.pdf” go to the Recycle Bin, where you can restore them. Files you named differently, anything in another folder, very big files and fresh downloads are never touched.", try: { label: "Open PC Boost", tab: "settings", id: "settings-boost" } },
  { icon: "🙌", title: "Your face moves like a person", how: "My Face (and any full-body 3D character) no longer puts a hand through its body or brings both hands together in the middle. Gestures stay in front of the body at waist height, a shrug keeps the elbows in with palms up and shoulders lifted, “thinking” is a hand at the chin with the other across the waist, and the fingers move — a loose curl at rest, a real point, a fist for “let's go”, counting on fingers. Resting arms are never frozen: the elbows stay soft and sway with the breath." },
  { icon: "🎯", title: "Clicks on web pages land", how: "With the browser extension, Izuki now clicks links and buttons right inside the page in every mode — before, a link like “Next” could be refused as “can't verify”, and Precision mode never used the extension at all. It's also quicker: a local AI that isn't running is skipped in a tenth of a second instead of costing ~2.4 s, and the phone call line stops retrying every 2 seconds when the internet is down." },
  { icon: "✨", title: "Ask about this page — from the Island", how: "With a web page in front, open the Island (rest the mouse at the top of the screen) and ask anything about it, or tap “Sum this page up”. The answer types itself out right there, follow-ups keep the conversation going, and the Island stays open until you close it. With the browser extension it also reads the linked pages that matter, with your own sign-ins." },
  { icon: "🖌️", title: "A new character style: Ink", how: "Settings → Voice orb → Character style → Ink, or just say “make your style ink”. Taller characters with smaller heads, muted paint with one loud accent colour, hard brushy shadow planes instead of outlines, angular faces, baggy clothes and chunky boots, on off-white paper. Works on your phone too.", try: { label: "Pick a style", tab: "settings", id: "settings-look" } },
  { icon: "📷", title: "Show Izuki with your camera", how: "Open the Island and tap “Show Izuki with your camera”. You see yourself live; tap “Ask Izuki about this” and that one picture goes to Chat so you can ask what you're holding, how an outfit looks, or what a label says. The camera turns off the moment you close it, and nothing is saved or sent until you tap Ask." },
  { icon: "🪄", title: "Little chores, on its own", how: "Settings → On its own: Izuki can press “Skip” on YouTube ads and “Reject all” on cookie banners for you in the browser in front. Both are off until you turn them on, and it never types, buys or signs in for you.", try: { label: "Turn them on", tab: "settings", id: "settings-autonomous" } },
  { icon: "🌊", title: "The Island moves with your music", how: "While something plays, the Island shows a live waveform that swells with the sound instead of four bouncing bars." },
  { icon: "📞", title: "Calls pick up where you left off", how: "Reopen the call page on your phone and the conversation so far is already there, so “continue” carries on the same thread." },
  { icon: "↔️", title: "Move the Island out of your way", how: "Open the Island and drag its grip along the top rail. It remembers the safe position, so browser tabs and the address bar stay reachable. Its quick tools are aligned in a larger 4 × 2 grid with Screenshot and PC Boost." },
  { icon: "🛡️", title: "One Izuki at a time", how: "Opening Izuki again brings back its existing window. A second launch no longer starts another orb, microphone engine or background worker." },
  { icon: "✅", title: "More honest task results", how: "Interrupted tasks stay incomplete. First-look success claims get another screen check, incomplete routes are not saved as successful flows, and unavailable screen models stay on cooldown." },
  { icon: "⬆️", title: "Updates when you're ready", how: "Izuki checks for updates automatically. Open Settings → Updates to check now, download the signed update, and install it when your task is finished.", try: { label: "Open updates", tab: "settings", id: "settings-updates" } },
  { icon: "🎼", title: "A whole MIDI draft", how: "Create a 32- or 64-bar song sketch with drums, bass, chords, melody and section markers. Izuki checks the saved MIDI and keeps your open DAW project untouched. This creates a new sketch; live recording analysis is still to come.", try: { label: "Make a draft", say: "make a 32 bar trap arrangement at 100 bpm in A minor" } },
  { icon: "⚡", title: "Free AI, but sharp", how: "Free limits are per model, so Izuki now finds every strong free model on your keys each day (Gemini Flash and Flash-Lite, NVIDIA's 90B vision, OpenRouter's free ones…) and rotates between them: one hits its limit, the next carries on. Tiny models never drive your screen, a stuck brain gives up in 14 s instead of 22, and slow screens are read in at most 2.5 s." },
  { icon: "🎹", title: "Beats straight into FL Studio", how: "“Make beats for me in FL Studio” builds a real drum groove and opens it in FL Studio — no genre needed (say “afrobeats”, “drill”, “amapiano”… for a style).", try: { label: "Try it", say: "make me a beat in fl studio" } },
  { icon: "🚀", title: "Make my PC fast — one button", how: "PC Boost now clears junk files and browser caches, frees memory from background programs, closes hogging updaters, and finds bloatware and apps slowing your startup — remove them with one more tap (startup changes undo any time). “Deeper clean” clears Windows' own leftovers with its permission. “Keep my PC fast by itself” also tidies once a day.", try: { label: "Open PC Boost", tab: "settings", id: "settings-boost" } },
  { icon: "🤖", title: "Pick a voice, get its character", how: "Every voice card shows its character, and picking a voice brings that character up. Atlas (the Jarvis-style voice) is now an armoured robot with a glowing visor and core. Motion is snappier: gestures overshoot and settle, bodies squash and stretch, hair swings." },
  { icon: "🕺", title: "Characters that never stand still", how: "Between replies they shift their weight, glance around, put their hands on their hips, fold their arms and stretch. Faces move like real ones: the nose crinkles with a laugh, dimples with a smile, lips press while thinking. Full body stands free on your screen; closer views sit in the orb." },
  { icon: "🔎", title: "Type to find anything", how: "The “Or type it” bar on the Draw page now also finds parts of Izuki as you type — voice, character, TV, shortcuts — one tap away. Enter still sends it as a command. The Draw page's jump bar has Voice and Character too." },
  { icon: "🎨", title: "A 2D character for every voice", how: "39 characters in Flat vector or Comic (Spider-Verse) style — they stand right on your screen, breathe, blink, wave, count on their fingers, shrug and cheer as they talk, and their mouths make the real shapes of the words.", try: { label: "Pick one", tab: "settings", id: "settings-look" } },
  { icon: "🪞", title: "Your face acts it out", how: "Your Avaturn face now talks with real mouth shapes, smiles with its cheeks and eyes, raises its brows at a question, and gestures with its arms. Full body stands free on your screen." },
  { icon: "📸", title: "Screenshots and screen recording", how: "Say or type “take a screenshot” (saved to Pictures › Screenshots and copied), “record my screen” and “stop recording” (saved to Videos › Izuki Recordings).", try: { label: "Try it", say: "take a screenshot" } },
  { icon: "▶️", title: "YouTube, straight away", how: "“Open Chrome and play how to make money, skip the ads” now plays at once — no thinking — and the ads are skipped. Chrome opens in your usual account, not the “Who's using Chrome?” screen.", try: { label: "Try it", say: "play lofi beats on youtube" } },
  { icon: "🎤", title: "Dre and Nia", how: "Two new characters: Dre and Nia talk with real Black American slang — smooth, funny and real. Their faces match their voices." },
  { icon: "🔗", title: "Reads behind the links", how: "Ask about a page and Izuki also reads the pages it links to that matter — the syllabus, the assignment details — quietly, with your own sign-ins (needs the browser extension). Never links like Log out, Delete or Buy." },
  { icon: "📘", title: "Knows how each app works", how: "Built-in playbooks for FL Studio, Ableton, Premiere, CapCut, Photoshop, Blender, Figma, VS Code, Office, browsers and more: in apps that draw their own screen it uses their shortcuts and menus instead of dragging. Ask “what are the shortcuts here?”", try: { label: "Try it", say: "what are the shortcuts here" } },
  { icon: "🥁", title: "Beat starter", how: "“Make me an afrobeats drum pattern at 108 bpm” — or trap, amapiano, drill, boom bap, house, reggaeton, lo-fi and more. A real swung MIDI groove with a fill, saved in Music › Izuki Beats to drag into FL Studio.", try: { label: "Make one", say: "make me an afrobeats drum pattern" } },
  { icon: "⚡", title: "Faster, surer clicks", how: "“Click settings” finds “Preferences” from the app's own controls in a moment — no screenshot — and Izuki knows which part of the app each button is in." },
  { icon: "⬆️", title: "Never miss an update", how: "When a new version is ready, the Island shows Update now and your phone gets a message." },
  { icon: "💈", title: "Haircuts for your character", how: "Under Voice orb → Customise → Haircut: afro, afro puffs, curly top fade, dreads, box braids, cornrows, Edgar cut, fohawk, buzz, crew cut, undercut, quiff, side part, slicked back, curtains, mullet, pixie, bob, long hair, bun, top knot, ponytail and a beanie. Real strands and fuzzy texture, in any hair colour. The holograms and your own face wear them all; the Woman and Man add the ones that go over their own hair.", try: { label: "Pick a cut", tab: "settings", id: "settings-look" } },
  { icon: "🪟", title: "Keep working while Izuki works", how: "Switch to another app mid-task and Izuki carries on in its own window behind yours — pressing buttons, typing into boxes and scrolling through Windows, never touching your mouse or keyboard. It only borrows the screen for things that need the real mouse, once you pause." },
  { icon: "🧩", title: "Ask Izuki in your browser", how: "The Izuki extension now opens a side panel next to any page: ask about it, add your other tabs to compare, and keep chatting. Click the Izuki icon or press Alt+Shift+I.", try: { label: "Open it", tab: "settings", id: "settings-browser" } },
  { icon: "🧭", title: "Settings, easier to get around", how: "A jump bar at the top of Settings takes you to any part in one tap, and Top brings you back." },
  { icon: "🤝", title: "Works beside you", how: "Use your mouse or keyboard while Izuki is working and it waits for you, then takes a fresh look and carries on. If a click does nothing, it presses the button straight through Windows or the web page itself. The pointer is checked to be exactly on target before every click." },
  { icon: "🚀", title: "PC Boost", how: "Notices when your PC is struggling and offers to speed it up: old temp files cleared, hogging background updaters closed, the heavy app named. Never closes a window you're using. Switch on “Fix it by itself” if you like.", try: { label: "Open PC Boost", tab: "settings", id: "settings-boost" } },
  { icon: "⏰", title: "Alarms and day planning", how: "“Wake me at 6:30 every weekday.” A real ringing alarm with Stop and Snooze on your PC, and one tap sets it in your phone's clock. “Plan my day” books the reminders.", try: { label: "Try it", say: "set an alarm for 7am tomorrow" } },
  { icon: "🖼️", title: "Send it a picture", how: "Attach, paste or drop a picture in Chat — or send one on Discord or Telegram — and Izuki looks at it with you.", try: { label: "Open Chat", tab: "chat" } },
  { icon: "📋", title: "Paste another AI's steps", how: "Got step-by-step directions from another AI? Paste them into the chat and Izuki carries them out on your screen." },
  { icon: "✅", title: "“Answer it for me” on the Island", how: "When a question is on your screen, the Island offers Explain, Answer it for me (the answer straight up with a one-line why — it never submits), or Teach me." },
  { icon: "🦸", title: "Comic and flat-art characters", how: "Under Voice orb: skin tone and hair colour in one tap, Comic or Flat art style, head-to-full-body framing, a no-orb mode, and the voice switches to match the character (or keep your own choice).", try: { label: "Pick a look", tab: "settings", id: "settings-look" } },
  { icon: "🛰️", title: "Status screen with Autopilot", how: "A live processor trace, the heaviest apps, and Autopilot: low space, battery, a slow PC, a meeting soon or urgent mail, each with a one-tap fix — or Handle it all.", try: { label: "Show me", say: "wake up" } },
  { icon: "📜", title: "Every answer, kept", how: "With “Keep my last answer on screen”, scroll back through today's answers; the bin icon clears them." },
  { icon: "🦙", title: "Meta Llama, free", how: "Under Brain & AI keys: Meta Llama, with a free key from llama.developer.meta.com (US). Or the one-tap “Use Meta Llama 4” on Groq and NVIDIA. It can see your screen.", try: { label: "Open it", tab: "settings", id: "settings-brain" } },
  { icon: "🔋", title: "Easier on your battery", how: "While Izuki waits for “Hey Nova” in a quiet room, it rests instead of listening hard — and it stops talking the moment you talk over it." },
  { icon: "🛡️", title: "Android TV: Izuki sees the screen", how: "On Google TV, Fire TV or Android TV with the Izuki app: ask “what's on my screen?” or “is this free?”. The Paywall guard tells you when an app wants a subscription — and which apps on your TV are free. It all stays on the TV." },
  { icon: "🟢", title: "Clear command results", how: "In Chat, each command's card is green ✓ when it worked, amber ⚠ when it finished but skipped a few things, and red ✕ only when it really failed. Collapse it, copy the command or the output, or open it full screen.", try: { label: "Open Chat", tab: "chat" } },
  { icon: "📺", title: "Smarter TV", how: "“What apps are on my TV?”, “show me free movie apps”, “is Netflix free?”, and “open YouTube on the TV and search for MrBeast” — straight into the app's search.", try: { label: "Try it", say: "what apps are on my tv" } },
  { icon: "📞", title: "Phone calls that flow", how: "On a phone call Izuki now listens by itself after every reply (no tapping the orb), starts talking as soon as its first sentence is ready, and the words on screen light up in step with its voice." },
  { icon: "🧑‍🚀", title: "Real 3D faces", how: "Four new faces under Voice orb — a hologram woman and man, a woman and a man — made as real 3D models. They breathe, turn to look at your mouse, talk with the voice and react when tapped. Customise skin tone, glow colour, hologram glow, shine, size, height and turn.", try: { label: "Pick one", tab: "settings", id: "settings-look" } },
  { icon: "🪞", title: "Your own face, talking", how: "My face: make a 3D you on avaturn.me (free, a few minutes), then pick the .glb. Your mouth moves with Izuki's voice, your eyes blink and look around. It stays on your device.", try: { label: "Set it up", tab: "settings", id: "settings-look" } },
  { icon: "➕", title: "Add any 3D face", how: "Got a .glb from Tencent Hunyuan3D, Meshy or Sketchfab? Add it under 3D faces — as many as you like." },
  { icon: "📺", title: "Your TV on the status screen", how: "“Wake up” shows what's on your Roku with play/pause, volume, home and What should I watch? Or just ask “what's on my TV?”.", try: { label: "Show me", say: "wake up" } },
  { icon: "🗣️", title: "Change it by asking", how: "“Switch to the hologram woman”, “use my face”, “make your glow pink”, “just your head”, “make your face bigger” — it changes at once.", try: { label: "Try it", say: "switch to the hologram woman" } },
  { icon: "📺", title: "A new Roku screen", how: "A home screen with the time, weather, a greeting and things to try; while Izuki works, the orb moves to the corner and your words and its answer show big. The 3D faces talk on the TV too." },
  { icon: "⬆️", title: "Update the TV from here", how: "Settings → Control my TV: type your Roku's developer password once and press Install on my TV. After that the TV channel updates itself whenever Izuki does.", try: { label: "Set it up", tab: "settings", id: "settings-tv" } },
  { icon: "🧘", title: "Patient, like a person", how: "Izuki opens each app or page once and waits for it — as long as your PC needs (it learns how fast yours is). No more piles of the same window. In a browser it stays in the same tab: it searches right there instead of opening new ones." },
  { icon: "🧰", title: "See every tool it uses", how: "In the Chat tab, each command, search or file it touches shows as a card — what it ran (IN) and what came back (OUT), like a real coding agent. “Show all” opens long output.", try: { label: "Open chat", tab: "chat" } },
  { icon: "📬", title: "It really goes through your email", how: "“What's important in my email?” — Izuki reads the last few days, skips the noise, and tells you the real to-dos: bills with amounts, replies people are waiting on, deliveries, deadlines. Also on the status screen.", try: { label: "Go through it", say: "What's important in my email?" } },
  { icon: "📺", title: "Ask your TV like a person", how: "“Put on something funny for the kids” or “a dinosaur cartoon” — Izuki picks a real title from the apps on your Roku. If it's on more than one, it asks “Disney Plus or Prime Video?” and you just say “Disney”. Misspelled app names work too." },
  { icon: "🏝️", title: "A fuller Island", how: "One-tap tiles: 5-minute timer, Focus, Read this, Explain my screen, your Later list and email. Been reading one page for a few minutes? It offers to sum it up." },
  { icon: "🎛️", title: "A smarter status screen", how: "“Wake up” now shows INBOX — WHAT MATTERS (tap one for help with it) and more one-tap buttons; apps you haven't signed in to are left out.", try: { label: "Show me", say: "wake up" } },
  { icon: "🧩", title: "The browser extension got smart", how: "Right-click any text → Izuki: Explain, Translate, Sum up, Read aloud, Save to Notes, Remind me later. Alt+Shift+I asks about the page. And a Focus guard during Focus mode.", try: { label: "Get it", tab: "settings", id: "settings-extension" } },
  { icon: "🔊", title: "Read it to me", how: "Select text anywhere and say “read this to me” — or just ask with a page open. “Keep reading” carries on.", try: { label: "Read this", say: "read this to me" } },
  { icon: "🎙️", title: "Talk to type, anywhere", how: "Say “type what I say”, click into any text box and talk — commas, full stops and new lines included. “Stop typing” ends it." },
  { icon: "📊", title: "Screen time", how: "“How long was I on YouTube today?” — minutes per app and site, names only, on this PC.", try: { label: "My screen time", say: "what's my screen time today" } },
  { icon: "🌤️", title: "The weather, everywhere", how: "On the Island, the status screen, the phone and the TV — set your town under Talk to Izuki.", try: { label: "Set my town", tab: "draw", id: "talk-card" } },
  { icon: "⏱️", title: "Timers on the Island", how: "“Set a pasta timer for 12 minutes” — it counts down on the Island and tells you when it's done. Several at once.", try: { label: "5-minute timer", say: "set a timer for 5 minutes" } },
  { icon: "⬇️", title: "Downloads, screenshots & charging", how: "Finished downloads get Open, Sum it up (documents), Install (apps) or Unzip. Screenshots get Copy the text — and Fix, Explain or Translate when that fits. Plus a glance at the battery when you plug in." },
  { icon: "📋", title: "Recent copies", how: "Open the Island to copy any of your last few copies again." },
  { icon: "💬", title: "The chat shows its work", how: "Type “allow” to approve, Auto really skips asking, and it can't say “On it” and do nothing anymore." },
  { icon: "🗿", title: "A more lifelike hologram face", how: "A real face's oval, a neck, finer detail, a glowing outline and a scan sweep.", try: { label: "Pick it", tab: "settings", id: "settings-look" } },
  { icon: "🎯", title: "Focus mode", how: "Say “focus for 25 minutes”: a countdown on the Island, nothing but urgent things get through, and a catch-up when time's up.", try: { label: "Focus 25 min", say: "focus for 25 minutes" } },
  { icon: "📋", title: "Smart clipboard", how: "Copy a foreign sentence, a link, an address, code or an error — the Island offers Translate, Sum up, Directions, Explain or Fix. Nothing's sent unless you tap." },
  { icon: "🕰️", title: "Recall", how: "Turn it on and ask “what was that site I was on this morning?”. Only window titles, a week, this PC only — never private windows.", try: { label: "Turn on", tab: "draw", id: "talk-card" } },
  { icon: "📺", title: "TV requests go to the TV", how: "A hidden bug sent “open Netflix on the TV” to your PC since 1.0.34 — fixed for good, with a check so it can't come back." },
  { icon: "🧹", title: "Smoother on websites", how: "Pop-ups are closed once and then ignored, so tasks don't get stuck on them; the browser extension reconnects by itself after an update." },
  { icon: "✍️", title: "Writes like a person", how: "Notes, messages and posts come out in plain everyday words and short sentences — ask for formal when you want it." },
  { icon: "🎯", title: "Fewer wrong taps", how: "Izuki asks “Did you mean…?” when it isn't sure what you said, closes anything it opened by mistake, and sticks to the task." },
  { icon: "⬆️", title: "Phone & TV apps update themselves", how: "The Android phone and TV apps now show “Update Izuki” when there's a new version — one press. (If you installed an older one, uninstall it once first.)" },
  { icon: "🛡️", title: "Ask or Auto in the chat", how: "The Chat tab has the Ask / Auto switch now: Ask waits for your Allow; Auto runs it and still shows each step.", try: { label: "Open chat", tab: "chat" } },
  { icon: "⚡", title: "Faster replies", how: "Brains that are out of credits are skipped for hours, stuck apps give up sooner, and the status screen's buttons react the moment you tap them." },
  { icon: "🔎", title: "Apps read what their connections can't", how: "LinkedIn notifications, an Instagram feed and more: Izuki opens the page in its signed-in browser and reads it for you." },
  { icon: "🧭", title: "A fuller Quick setup", how: "A Back button, a progress bar, and TV, phone & TV link, the extension, buddy mode and colours — all from one place." },
  { icon: "🎛️", title: "A status screen you can use", how: "Say “wake up”: live CPU, memory, battery and network; tap a gauge, an email, a meeting or an app to ask about it; music controls; your Later list; and an Ask bar with one-tap actions.", try: { label: "Show me", say: "wake up" } },
  { icon: "🎯", title: "Catches its own misclicks", how: "If a click slips onto the taskbar and opens Search or Start by mistake, Izuki closes it and aims again." },
  { icon: "📺", title: "Izuki TV — full control of your TV", how: "On Android TV, Google TV and Fire TV: a big-screen Izuki that opens any app, plays and pauses, changes the volume, and reads what's on the TV to press, search and pick shows for you. Say “Hey Nova” or hold OK on the remote. A small orb floats over Netflix while it listens.", try: { label: "Set up my TV", tab: "settings", id: "settings-tv" } },
  { icon: "🔗", title: "One setup for everything", how: "Link your phone or TV to this PC (Settings → Control my TV → “Let my phone and TV link”). Press Allow here and it copies your AI keys, connected apps and memories — then it works on its own, even when this PC is off.", try: { label: "Turn it on", tab: "settings", id: "settings-tv" } },
  { icon: "🗒️", title: "Later list", how: "“Remind me later I'm buying Scrubbing Bubbles and Sensodyne.” No time needed — it lands on your Later list (in the Chat tab), and Izuki brings it up when you're back, in the morning and before the shops close. “I got the toothpaste” ticks it off.", try: { label: "Try it", say: "what's on my list?" } },
  { icon: "🔊", title: "Izuki talks from the TV", how: "With the Izuki screen open on a Roku, Izuki's voice comes from the TV speakers — and the TV orb has its own looks, including Aurora and Nebula.", try: { label: "Choose", tab: "settings", id: "settings-tv" } },
  { icon: "🫶", title: "Izuki speaks up by itself", how: "Buddy mode: an important email (a job, money, a deadline), a meeting soon, low battery, the internet dropping — said out loud, and “welcome back” with what you missed. Important things reach your phone while you're away.", try: { label: "Choose", tab: "draw", id: "talk-card" } },
  { icon: "🧠", title: "Answers in the background", how: "Ask “how many GB is Zoom?” or “which apps don't I use?” and Izuki checks quietly and just tells you — no windows opened. Say “while I watch” to see it done on screen.", try: { label: "Try it", say: "how much free space is on my PC?" } },
  { icon: "✅", title: "Proof check", how: "After every change (uninstall, install, delete, close an app) Izuki looks again and shows “✓ Checked: Zoom is no longer installed” before saying it's done. It also catches itself if it ever claims something it didn't do." },
  { icon: "💬", title: "One clean reply in the chat", how: "Each job is one message: the steps it took, then the answer — with a live status line, Copy, Read aloud and Again, tidy lists and code boxes. Quick checks run without asking." },
  { icon: "📺", title: "Samsung & LG TVs too", how: "“Open Netflix on the TV”, “turn the TV up”, “pause the TV” — Roku, Samsung and LG over your Wi-Fi. Press Allow on the TV the first time.", try: { label: "Set up my TV", tab: "settings", id: "settings-tv" } },
  { icon: "🏝️", title: "The Island", how: "Push your mouse to the very top-middle of the screen. It shows what Izuki's doing, what's playing, reminders and smart suggestions." },
  { icon: "🧩", title: "Browser extension", how: "Add it to Chrome or Edge and Izuki sees web pages exactly — every link and button — so clicks never miss. In Jarvis mode it clicks inside the page itself.", try: { label: "Add it", tab: "settings", id: "settings-extension" } },
  { icon: "📝", title: "Nova Notes", how: "Say “take notes on this” on any page, PDF or quiz — or open the Notes tab. Then flashcards, quiz me, summarise or ask about them. Teacher mode saves lessons by itself.", try: { label: "Open Notes", tab: "notes" } },
  { icon: "🎨", title: "App colours", how: "Pick a colour theme for the app — or Auto, which changes with the time of day.", try: { label: "Pick colours", tab: "settings", id: "settings-theme" } },
  { icon: "🛡️", title: "Ask first or Auto-run — in the chat bar too", how: "The orb's chat bar has an Ask / Auto button. On Ask, Izuki says what it wants to run and waits for you to say or type “allow”." },
  { icon: "🫧", title: "Real 3D orbs & a hologram face", how: "Clear water, Pure water, Ferrofluid, Stardust, Hologram face… or just say “change your orb to stardust”.", try: { label: "Pick one", tab: "settings", id: "settings-look" } },
  { icon: "⚡", title: "Jarvis mode (no mouse)", how: "Izuki presses buttons and types straight through Windows — no pointer, nothing flashing. Tap the mode name at the top of Chat to switch.", try: { label: "Open Chat", tab: "chat" } },
  { icon: "🎩", title: "Jarvis voice", how: "Atlas — a calm, witty British AI assistant voice. Say “Jarvis voice” any time.", try: { label: "Switch to it", say: "switch to jarvis" } },
  { icon: "👩‍🏫", title: "Teacher mode", how: "On any quiz, say “teacher mode”: it explains each question with the pen, checks your answer, and clicks Next when you're ready." },
  { icon: "🎵", title: "Music mode", how: "While music plays, open the Island and tap ✨ Flow with it — the orb moves with the music." },
  { icon: "⌨️", title: "Say it, or hold a key", how: "Choose “Hey Nova” or hold Ctrl + Windows + Space to talk — plus wake-up strictness.", try: { label: "Choose", tab: "draw", id: "talk-card" } },
  { icon: "✨", title: "Smart suggestions", how: "The Island and the Chat tab offer the right help for what's on screen — a quiz, an email, an error, a video." },
];

/** Open a tab, then scroll to (and focus) a section in it once it's there. */
function goTo(setTab: (t: TabId) => void, tab: TabId, id?: string) {
  setTab(tab);
  if (!id) return;
  let tries = 0;
  const look = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    if (tries++ < 20) setTimeout(look, 100);
  };
  setTimeout(look, 80);
}

export function WhatsNewButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="What's new"
      className="izk-pill izk-no-drag flex h-[26px] items-center gap-1.5 px-2.5 text-[11px] font-semibold"
    >
      <Sparkles size={12} /> What's new
    </button>
  );
}

/** Shown once per version; `open` forces it from the button. */
export function useWhatsNew(blocked: boolean) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (blocked) return;
    try {
      if (localStorage.getItem(SEEN_KEY) !== pkg.version) setOpen(true);
    } catch {
      /* no storage — just don't auto-open */
    }
  }, [blocked]);
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, pkg.version);
    } catch {
      /* fine */
    }
  };
  return { open, show: () => setOpen(true), close };
}

export function WhatsNew({ onClose }: { onClose: () => void }) {
  const setTab = useIzuki((s) => s.setTab);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-tauri-drag-region
      className="izk-no-drag absolute inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 16, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="izk-card izk-grain relative w-full max-w-[560px] p-5"
        role="dialog"
        aria-label="What's new in Izuki"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 text-izk-muted hover:bg-white/10 hover:text-izk-ink">
          <X size={16} />
        </button>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-izk-teal">Izuki {pkg.version}</div>
        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-izk-ink">What's new — try it now</h2>
        <div className="mt-4 flex flex-col gap-2">
          {ITEMS.map((it) => (
            <div key={it.title} className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
              <div className="text-[22px] leading-none">{it.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-izk-ink">{it.title}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-izk-muted">{it.how}</div>
              </div>
              {it.try && (
                <button
                  type="button"
                  className="izk-btn-primary shrink-0 px-3 py-1.5 text-[11.5px]"
                  onClick={() => {
                    onClose();
                    if (it.try?.say) void sendChatCommand(it.try.say);
                    else if (it.try?.tab) goTo(setTab, it.try.tab, it.try.id);
                  }}
                >
                  {it.try.label}
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="izk-btn-primary mt-4 w-full py-2.5 text-[13px]">
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}
