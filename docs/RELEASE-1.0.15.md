# Izuki 1.0.15 — verified precision, broader connections and a better classroom

## What changed

- **Precision screen actions are stricter.** In Precision (Jarvis-style) mode, Izuki now requires a live Windows control near a proposed click, checks it immediately before acting, and refuses an unverified pixel click. If a page shifts or the target cannot be verified, it asks for a fresh look rather than guessing. Mouse mode remains for canvas-style surfaces that expose no controls.
- **Connected apps are easier to find.** PC and phone now include a searchable, curated catalog across Google, Microsoft, work, code, file, creator, social and business services. Each tap still asks the connector to produce a real sign-in link; unsupported accounts report an error instead of showing a fake connected state.
- **Video classroom starts from a useful browser.** The Izuki browser now opens on a search page rather than a blank screen. Classroom can search the web or YouTube, explains the largest supported HTML5 video (not YouTube only), and defaults to pause, explain, then resume.
- **Mobile build checks are automated.** The native Android companion is built as a CI artifact and the iPhone project is checked with Xcode. The Android companion only exposes explicit, opt-in Home, Back, Recents, Notifications and Quick Settings actions; it does not read screen contents.
- **Liquid glass remains the unchanged default orb.** Ferrofluid droplets are an additional selectable style, not a replacement.

## Use it

1. Download `Izuki-Setup.exe` from the website and install it over the previous version.
2. In **Settings → Execution**, choose **Precision** for normal buttons, choices and form controls. If Izuki says it cannot verify a target, redraw the mark around that answer or use Mouse mode only for a canvas/game surface.
3. In **Apps**, search for a service, connect only the account you want, and approve sending, posting or deleting when prompted.
4. In **Draw → Video classroom**, type what you want to learn, choose Web video or YouTube, open a video, and press **Explain now**.

## Remaining platform limits

- The Windows installer is the public download in this release. Android preview packaging is validated in CI before a public APK is attached. A signed iPhone distribution package requires Apple developer signing.
- Third-party services control their own API availability, account types and pricing. Izuki does not charge for the companion; a connector can only work after the user authorizes a supported account. Personal iMessage and personal WhatsApp histories are not exposed as a general automation API.
