# Direct browser-store installation

The public install guide is `https://nova-izuki.github.io/izuki/extension/`.
There is no published store ID in this repository. Direct store installation
needs the owner's Chrome Web Store developer account or Edge Partner Center
account, submission and store approval. Browser confirmation remains required.
Do not use enterprise policy edits to install on a personal PC.

## Prepared upload

Run `node scripts/pack-extension.mjs --store`. It validates the current extension's
imports and creates `.work/extension-store/izuki-extension-store.zip`, with `manifest.json`
at the ZIP root. The regular unpacked download remains a separate archive.
The store ZIP must be regenerated whenever the extension changes.

Suggested listing:

- Name: Izuki — AI beside your page
- Summary: Ask about the page with Izuki or an AI tab you connect. Keep the
  conversation beside your browser and choose what page context to share.
- Website: https://nova-izuki.github.io/izuki/
- Privacy: https://nova-izuki.github.io/izuki/extension/privacy.html
- Support: https://github.com/nova-izuki/izuki/issues
- Description: Open Izuki's panel beside a page, ask a question, compare tabs you
  choose, and continue the conversation. Connect Izuki on your Windows PC or an
  AI website you already use. Optional Follow questions watches the chosen page.
  Explain, translate, summarise, read aloud, or save a selection from the context
  menu. Reviewed desktop tasks can be handed to the local Izuki app. AI websites
  may require their own account. Protected browser pages cannot be read.

## Permission explanations for review

| Permission | Feature |
| --- | --- |
| scripting | Read user-selected page context and place requests into the connected AI tab. |
| tabs | Let the user choose the page and AI tabs, and reject obsolete connections. |
| alarms | Schedule focus-guard checks. |
| contextMenus | Explain, translate, summarise, read, save and remind actions on selected text. |
| tts | Read selected text aloud. |
| sidePanel | Keep chat beside the page. |
| storage | Save preferences, connection state and conversation history. |
| all_urls | Work on the pages and AI websites the user chooses rather than a fixed website list. |

Add actual screenshots of the packaged extension to the store's screenshot
fields; a mock screenshot is not evidence of a live browser connection. Keep
the listing's provider/data disclosures consistent with `privacy.html` and the
submitted source. This is a submission draft, not a claim of store approval.

After approval, replace the install guide's store-status paragraph and the
desktop card's primary setup link with the exact published listing URL. Edge
can install from its own Add-ons store or, with its browser confirmation, the
Chrome Web Store. Firefox and Safari require separate builds and submissions.

Sources: [Chrome distribution](https://developer.chrome.com/docs/extensions/how-to/distribute),
[Edge publishing](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension).
