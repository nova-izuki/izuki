# IZUKI design audit — 2026-11-08

**Status:** pre-change study. No production visual component has been changed in this pass.

**Scope:** the floating config panel, command strip, Island, AIR Control surface and the shared Nova material language. Eye Control is out of scope and remains Claude’s file area.

**Sources read:** `src/styles.css`, `src/components/GlassConfigPanel.tsx`, `src/components/Island.tsx`, `src/components/TalkToIzuki.tsx`, `src/components/AirControl.tsx`, `src/components/Hud.tsx`, `src/components/IzukiMark.tsx`, `src/components/EdgeGlow.tsx`; current-build captures in `docs/shots/panel-*.jpg`.

**Comparison:** [`design-evolution-2026-11-08.html`](./design-evolution-2026-11-08.html)

---

## 1. What IZUKI already is

IZUKI is not a blank canvas. The current shell has a coherent, ownable language:

| Signature | Where it lives now | Why it matters |
| --- | --- | --- |
| **The palm mark + wordmark** | `IzukiMark`, `GlassConfigPanel` header | The chrome hand is the product’s face. It is already distinctive at taskbar size. |
| **“YO IZUKI, DO IT.”** | Header, docs, product copy | Short, direct, slightly playful. It is part of the voice, not decoration. |
| **Nova deep-glass** | `.izk-sheet`, `.izk-grain`, aurora spans | Almost-black glass with a violet/teal/blue wash. This is the atmosphere people recognise. |
| **Floating panel silhouette** | `.izk-window` / `.izk-sheet` | Generous 32px radius, inset rim, real desktop behind it. It reads as an object, not a page. |
| **Capsule segmented navigation** | `Segmented`, Draw/Chat/Apps/Notes/Flows/Watchers/Style/Settings | Compact, friendly, and faster to scan than a sidebar. Keep the shape and order. |
| **Floating command strip** | `DrawCommandBar` | Type a command directly under the tabs; it is the shortest path from thought to action. It must stay central. |
| **The Island** | `Island`, `IslandPal` | A 372px black pill at the top of the screen, with a liquid orb face, live activity and push-to-open behaviour. It is the always-with-you surface. |
| **AIR Control holographics** | `AirControl`, `Hud`, `EdgeGlow` | Cyan scanlines, corner brackets, turning rings, hand tracking and a calm status line. This is IZUKI’s “instrument panel” mode. |
| **Quiet craft** | Static aurora, one-shot transitions, forbidden loops over video | The current build deliberately protects the graphics chip. Any visual upgrade has to respect this. |

## 2. What must remain recognisable

1. The palm mark, the wordmark and the tagline stay.
2. The existing Nova colours stay the default: violet `#8a6cff`, teal `#4ecdc4`, blue `#5b8dff`. New effects may use these plus the existing cyan/violet/magenta HUD family.
3. The floating panel stays a compact desktop object with the same header rhythm and capsule tabs.
4. The floating command strip stays directly under the tabs, with the same “Tell Izuki what to do…” job.
5. The Island stays a small black pill at the top edge. It must not become a dashboard or a second window.
6. AIR Control keeps its cyan holographic language and its hand/ring/status hierarchy.
7. Existing copy, tab order, focus order and control placement are not redesigned for visual novelty.
8. The app remains dense and quick. No oversized marketing hero inside the product.

## 3. What is weak enough to improve

These are material and interaction improvements, not a new layout:

- **Edge light:** the glass rim is even; a little more specular concentration at the top and a softer inner falloff would add depth.
- **Active navigation:** the gradient pill is good, but its edge and label contrast can be more deliberate.
- **Command strip:** it currently reads as a standard inset field. It can feel like the same control with a more crafted focus state and a clearer send affordance.
- **Card surfaces:** large cards can use a subtle top-light and local bloom to separate layers without adding more borders.
- **Island active state:** the orb is expressive; the pill around it can pick up a restrained holographic rim while busy, without growing.
- **AIR hierarchy:** the cyan HUD is strong but dense. A clearer “you / the machine / the next gesture” reading order would make it feel more advanced, not louder.
- **Motion:** the existing transitions are tasteful. Add one-shot entrances, pointer-reactive light and state transitions; avoid permanent looped blur.

## 4. Evolution principles

1. **Same bones, better material.** Keep DOM structure, sizes, copy and interaction model; change light, depth, contrast and state feedback.
2. **Light follows attention.** The panel’s glow responds to the pointer; the active tab catches a thin lens; the command strip wakes on focus. No animation runs for its own sake.
3. **Depth, not decoration.** Two or three elevation levels, a consistent light direction and a real specular edge. No new ornamental frames.
4. **Motion is a reply.** Every transition answers an action: open, focus, send, listen, finish. Nothing loops behind live video.
5. **The desktop stays visible.** The panel remains translucent enough to feel native to Windows; effects must not turn it into an opaque web card.
6. **Performance is part of the look.** Animate transform/opacity only; keep the aurora static; pause when hidden; respect `prefers-reduced-motion`.
7. **Accessibility is not a finish pass.** Maintain focus rings, 44px targets, readable contrast and non-colour state labels.

## 5. Proposed component changes

### Floating panel
- Keep the 32px outer radius, 22px card radius, padding and title bar.
- Add a restrained top-edge specular and a pointer-reactive inner bloom.
- Keep the aurora static; let the highlight move, not the blurred colour.
- Slightly strengthen the active tab’s inner rim and label contrast.
- Add a one-shot entrance for tab content; keep the existing 260ms blur/translate.
- No changes to window controls, tab order or feature finder.

### Floating command strip
- Keep the same 38px input and 16px radius.
- Add a focused “listening” state: a thin cyan/violet rim, a soft inner light and a send button that brightens only when there is text.
- Keep the same placeholder and Enter behaviour.
- Add a small sparkle/command glyph as a visual anchor, but do not add a second toolbar.
- No new modal or separate command palette.

### Island
- Keep the 372px footprint, docked placement, compact height and black glass.
- Keep the liquid orb and eyes exactly as the identity anchor.
- While listening/thinking/working, let only the rim and a small orbital highlight respond.
- Keep rest state still; no idle loop over the desktop.
- No larger expanded state unless the user opens it.

### AIR Control
- Keep cyan, rings, hand glyphs, bracket corners and the bottom status line.
- Improve hierarchy: ring first, hand/gesture second, status/metrics third.
- Use a single restrained scan sweep only while live; stop when idle.
- Keep the guide’s existing steps and controls.

### Motion system
- **Panel open:** 220–260ms, blur + 8px rise, spring ease.
- **Tab change:** existing 260ms; add a 1px active-edge settle.
- **Command focus:** 180ms border/glow; no layout shift.
- **Island state:** 180–240ms rim/glow crossfade; orb motion remains the existing rAF.
- **Reduced motion:** all nonessential transitions collapse; keep state changes visible.
- **Performance budget:** no new permanent filters over the overlay; no blur on moving video; no React re-render per pointer frame.

## 6. Explicit non-goals

- No Monolith-style split layout, editorial sidebar, oversized headline or beige/bone palette.
- No replacement of the floating command bar with a landing-page composer.
- No new app-wide navigation model.
- No removing the Island or turning it into a large widget.
- No changing AIR Control’s gesture model.
- No touching Eye Control files.

The earlier Monolith / Tidal / Field Notes board remains an archive of explorations, not the proposed direction.

## 7. Before/after study

Open `design-evolution-2026-11-08.html`.

It contains:

- the current build’s Chat panel as the “before”;
- the same panel, same copy and same component placement as the “evolved” proposal;
- before/after command strip, Island and AIR Control language studies;
- a short “keep / lift / protect” system sheet.

The preview is intentionally a working-surface study, not a new product mockup. Any implementation should be made component by component behind the existing markup and checked against the guardrails above.

## 8. Acceptance bar for implementation

- Header, tab order, copy, keyboard focus order and command-strip placement are unchanged.
- No functionality is removed or hidden behind a new mode.
- 200% zoom and 320px-wide panel remain usable; no horizontal overflow.
- `prefers-reduced-motion` removes decorative motion.
- No new animation runs while the overlay is idle.
- The app remains responsive while AIR Control and the Island are mounted.
- Current screenshot and new screenshot can be compared at the same window size.
