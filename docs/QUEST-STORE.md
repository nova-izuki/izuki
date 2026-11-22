# IZUKI NOVA in the Meta Horizon Store

Everything for the store page of the Quest app (`com.novaizuki.vr`, Meta app ID 1490038460856480): the pictures, the words to paste, and the steps. Signing is in [ANDROID-SIGNING.md](ANDROID-SIGNING.md); the app itself in [VR.md](VR.md).

## The pictures

`node tools/quest-store-art.cjs` makes all of them in `quest/store-art/` (git-ignored, about a minute; it uses the installed Edge and asks no AI). Run it again after the room changes, so the screenshots stay true.

- The branded art uses the room's own orb shader and the exact title, **IZUKI NOVA**, with no other text (Meta: the title must match exactly, no taglines, badges or prices).
- The five screenshots are the real 3D room (the flat preview, its helper toolbar hidden), with a pretend PC on the same machine showing izukinova.ai. The PC, notes and look answers come from the app's own code. The two conversations in screenshots 2 and 5 (salmon, eggs, train) are example lines typed into the caption, not live AI answers.

| Store field | File | Size, format |
| --- | --- | --- |
| Hero | `hero-3000x900.png` | 3000×900, 24-bit PNG |
| Cover, landscape | `cover-landscape-2560x1440.png` | 2560×1440, 24-bit |
| Cover, square | `cover-square-1440x1440.png` | 1440×1440, 24-bit |
| Cover, portrait | `cover-portrait-1008x1440.png` | 1008×1440, 24-bit |
| Mini landscape | `mini-landscape-1080x360.png` | 1080×360, 24-bit |
| Logo (transparent) | `logo-transparent-3600x720.png` | 3600×720, 32-bit, transparent |
| Icon | `icon-512x512.png` | 512×512, 24-bit, square corners, solid |
| Spatialized tile | `spatial-tile-background-512x512.png` + `spatial-tile-foreground-512x512.png` (and the optional 180×180 pair, `spatial-icon-…`) | 512×512 each; the back is solid, the front transparent with the orb inside the 392 px safe area and fully solid (the dashboard refuses a front layer with no solid pixels) |
| Screenshots (5) | `screenshot-1-…` to `screenshot-5-…` | 2560×1440, 24-bit |
| Trailer cover | `trailer-cover-2560x1440.png` | 2560×1440, 24-bit |

Sizes and rules from Meta's [asset guidelines](https://developers.meta.com/horizon/resources/asset-guidelines/) (updated May 2026). Not made yet: a trailer (MP4, 30 s to 2 min, 1080p to 2K), which is optional.

## The words to paste

**Name** (matches the art exactly): `IZUKI NOVA`

**Short description:**

> Your own AI companion, floating in your room. Ask anything out loud and IZUKI NOVA answers in a natural voice. Hold something up and ask "what's this?": it looks and circles the answer. Bring your PC's screen into the room, big, and watch it work there. Free, with your own free AI key.

**Long description:**

> IZUKI NOVA is a free AI that lives with you: on your PC, on your phone, and now in your headset.
>
> Talk, don't type. Say "Hey Nova" any time, or point at the orb and pinch. It listens, answers in a natural voice, and shows its words under the orb.
>
> Look and ask. On Quest 3 and 3S, ask "what's this?" about anything in front of you: a plant, a label, a gadget, a recipe. After you allow the camera, it takes one photo, answers, and circles what it means. Quizzes and tests get coaching, never answers.
>
> Your PC, big. Pair your Windows PC once and say "show my PC": its screen opens on a large panel in your room. Point and click on it, scroll with the thumbstick, or say "open Spotify" and watch it happen. Anything consequential still asks for your approval on the PC.
>
> Your photos, around you. "Show my photos" opens your PC's Pictures as a gallery. Pick one and ask about it.
>
> Keep what matters. "Pin that" turns an answer into a card you can put anywhere, and it's there next time.
>
> Calm by design, with five looks from Midnight to Pearl. No ads, no account, no tracking.
>
> Free for everyone: add a free AI key from Google Gemini or Groq (a minute, in the app), or your own key from another provider. Needs an internet connection. The PC features need the free IZUKI NOVA app for Windows.

Lengths: the short description is 286 characters and the long one 1,290, under the 500 and 1,500 limits noted on 2026-11-22 (the form shows its own counter).

**Category:** Apps. Primary genre Productivity, additional genre Learning ("Media" would ask for a media type that doesn't fit).

**Search keywords** (up to 5, single words: the form refuses spaces; generic words only, never other products' names): assistant, AI, companion, voice, productivity.

**Details:**
- Price: Free. In-app purchases: none.
- Devices: Quest 3, Quest 3S, Quest 2, Quest Pro ("what's this?" needs the Quest 3 or 3S camera).
- Early Access: on (the store page says it's still being built; it can only be added in the first submission and removed any time).
- Input: Touch controller, Hands, Voice. Player mode: Single player. Play area: No Movement. Physical modes: Sitting, Standing. Comfort: Comfortable (you never move; nothing moves you). Social features: No. Subscription: not required.
- Languages: English. Internet: required.
- Website: https://izukinova.ai · Privacy policy: https://izukinova.ai/privacy/ (it has an "Izuki in VR" part since 2026-11-22) · Support: https://izukinova.ai/help/ and support@izukinova.ai

## Where the dashboard stands (2026-11-22)

Filled in and saved by Claude in the owner's signed-in dashboard: Name, Categorization, Specs, Details and every picture (covers, hero, icon, logo, five screenshots, the 512 tile). Left for the owner, on purpose:
- **Content rating**: country of origin, a contact email (shared with IARC) and the IARC questionnaire.
- **Pricing → listing type**: can't be changed after submission. Suggested: *Full release* (free, with the Early Access label). *Coming soon* would only collect wishlists.
- **Submission tab**: organization verification, the Developer Distribution Agreement, app sharing preferences, the contact email, then *Submit for Review*.
- **Build**: the store APK goes to a test channel first (below).

## Age rating and data use (the dashboard's forms)

Answer them yourself, truthfully; what's true today:
- No violence, no gambling, no purchases, no ads, no account, no chat between people.
- An AI answers in its own words, and with "show my PC" the person can see and use any website on their own PC. If the age-rating form asks about unrestricted web access or AI-made content, the answer is yes.
- Data: the microphone (the person's voice goes to the speech-to-text service they chose, Groq or Google), Izuki's spoken replies (their words go to Gemini's voice, or to Groq's whenever Gemini's gives no sound and there's a Groq key), the camera (one photo, only when they ask "what's this?" and allow it, to their AI), and their PC's screen and folders (from their own paired PC; a PC photo or screen picture goes to their AI when they ask about it). Nothing goes to us, and nothing from their Meta account is used.

## Uploading (names in the dashboard may differ slightly)

1. **Try it on a real Quest first.** No one has yet; the store reviewers will test it on one.
2. Get the store build: after this change merges, GitHub → Actions → "Build Izuki VR for Meta Quest" (the run on `main`) → download `izuki-vr-quest-store` (the APK signed with the store key; the other one, `izuki-vr-quest`, is the sideload preview).
3. https://developers.meta.com/horizon/manage → IZUKI NOVA → upload the APK to a test channel (Alpha), install it on the Quest from there, and try it.
4. Store listing: paste the words above and upload the pictures (the table).
5. Fill the age rating and data use forms, then submit for review.
6. Back up `izuki\.private\quest` (the store key). Every future update must be signed with it.

## Getting to the top

Nobody can buy or promise the top spot. What moves an app up in the store's search and lists, roughly in order:
- **Ratings and reviews.** Ask the first people who like it to rate it, from the app's own pages and izukinova.ai (never with rewards: Meta forbids that).
- **People who keep using it.** First-visit suggestions and the spoken tour are there for this.
- **The words people search.** "AI assistant", "AI companion" and "voice assistant" appear in the first lines of the descriptions.
- **The first look.** One clear subject (the orb), the exact title, and five screenshots that each show something different.
- **A trailer.** Listings with one tend to convert better; make it from the 3D room when there's time.
- **Telling people.** A "Get it on Meta Quest" link at izukinova.ai/vr and the phone app once it's live, and a post in the Quest communities.
- **Updates.** Each update with notes keeps the listing fresh.
