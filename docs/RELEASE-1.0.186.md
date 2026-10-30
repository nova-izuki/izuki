# Izuki 1.0.186: it stops making things up about you, and about itself

Three answers from one real chat, and what was behind each.

## 🌧️ "A bit of rain in London" — you aren't in London

Asked *"what's up today"*, Izuki said it was a quiet Friday with a bit of rain in London. You're not in London, and nothing had checked the weather.

Nothing in Izuki knew where you were. The chat was told to *"use their city from what you remember"* — and when there was nothing to remember, the AI filled the gap with the city AIs always reach for. Then *"I'm not in London bro"* got a cheerful "Gotcha" and went nowhere, because the chat couldn't save anything you told it.

Now:
- **It knows when it doesn't know.** Until Izuki knows your city, it's told plainly that it doesn't — and never to name a city or describe weather it hasn't looked up. If where you are matters, it asks.
- **Choose whether to remember a city from chat.** Turn on **Talk to Izuki → Learn my city from chat**, then say *"I'm in Dallas"*, *"I live in Lagos"*, or *"I'm not in London, I'm in Houston"*. Only the place name goes to Open-Meteo to check it before saving. This is off until you turn it on. You can always type your city directly instead.
- **Weather is looked up, never described from memory.**

You can still type it yourself under **Talk to Izuki → Your town or city**.

Map checks have a four-second total limit. Turning city learning off or editing your city while a check runs prevents that pending check from changing it. City-learning and weather-tool diagnostics no longer record the city name.

## 🎨 Five more desktop Looks

**Amber** brings warm terminal light, **Aurora** adds green and turquoise ribbons, **Deep Sea** has blue lights over dark waves, **Lavender** is a pale daytime canvas, and **Obsidian** pairs black with a thin gold halo. They appear alongside the existing Looks under **Style**, with previews and the same Undo control.

## Browser panel follow-ups

- **Stop cancels the backend answer.** A cancelled answer cannot return into a new chat. Completed history stays in its own browser window.
- **Follow stays with the page you chose.** It shares a stable new question once, pauses on navigation or a failed request, and waits for you to turn it on again. Turning off page sharing also stops reading other shared tabs.
- **Your AI drafts stay yours.** Connecting another AI tab does not overwrite a draft. Missing or ambiguous Send controls produce a clear message and a copy-prompt fallback, rather than pretending a message was sent.
- **Izuki in the panel can read websites in the background.** It uses the shared read-only search and webpage tools. Desktop tasks remain separate and run only from your reviewed request.

The extension is now **1.5.1**. Existing unpacked copies need the new files and **Reload** on the browser's extensions page; the desktop app can flag the older copy.

## 🔍 Asked about its own features, it read the web — and got versions a hundred releases old

*"What are Izuki's new features now"* ran ten web searches and answered from the GitHub pages for **1.0.36** and **1.0.172** — while you were on 1.0.185 — and put a made-up date on both.

Nothing about Izuki was inside Izuki. Now **this version's own release notes are built into the app**, taken straight from the notes written for each release, so there's no second copy to fall out of date. Ask what's new, what it can do, or what version it is, and it answers from those. It's told the web's answers about Izuki are old and wrong, and with **Deep** switched on, questions about Izuki itself no longer go off to research at all.

## ✍️ Underscores where italics should be

Research replies ended with *Say "continue the research"…* — but you saw it with the underscores either side, because chat understood `*this*` as italic and not `_this_`. Every AI writes both. Fixed, carefully: an underscore inside a word, a web address or a `file_name` stays exactly as written.

## 🎙️ "Speed 11.3× real time" meant the opposite

The log said the natural voice ran at *"speed 11.3× real time"* — which reads as eleven times faster than needed. It meant eleven times too slow, which is why Izuki uses the quick voice for short lines on this laptop. Every voice-speed line now says which side of real time it's on, so nobody reads a slow PC as a fast one.

---

Free, as always. No account, no subscription, nothing to pay.
