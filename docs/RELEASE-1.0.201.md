# Izuki 1.0.201: your keys stay safe on the way, and lighter ad skipping

A small update that makes two things safer and lighter.

## 🔒 Your AI keys never travel unencrypted

Izuki sends your AI key only over an encrypted (https) connection, or to a server on your own PC, such as Ollama or LM Studio.

- If an address in **Settings → Izuki's brain → Endpoint** starts with `http://` and points somewhere other than your PC, Izuki won't send your key there. A note under the field tells you so and asks for the `https://` address.
- If a server sends Izuki somewhere unencrypted (a redirect), the key isn't passed along.
- A server on your network that needs no key still works.

This covers the screen, chat, voices, hearing, web search and the free-model search.

## 📺 Lighter YouTube ad skipping

When the Izuki browser extension is connected, Izuki now asks it to press YouTube's own **Skip** button, instead of searching every button in the window while an ad plays. That's much less work for your PC. It only presses Skip in the YouTube tab you're looking at. Without the extension, or with an older copy, the old way still works.

The extension is now version 1.6.1. Izuki will tell you if yours needs updating.

## Checked before release

- **Automatic checks:**
  - the full Rust suite, including new tests for which addresses a key may go to, written several ways;
  - the TypeScript check;
  - the Windows, web and phone CI jobs.
- **Not yet tried:** a live YouTube ad with the new extension.

---

Free, as always. No account, no subscription, nothing to pay.
