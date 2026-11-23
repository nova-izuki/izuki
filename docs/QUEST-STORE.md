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

> Your own AI companion, floating in your room. Ask anything out loud and IZUKI NOVA answers in a natural voice. Learn in 3D with holograms it builds for you, browse the web right in the room, and bring your PC's screen in, big. Hold something up and ask "what's this?". Free, with your own free AI key (adults 18+).

**Long description:**

> IZUKI NOVA is a free AI that lives with you: on your PC, on your phone, and now in your headset.
>
> Just talk. Say "Hey Nova", ask a question out loud, or hold a button to talk. It answers in a natural voice and shows its words under the orb. Grab the orb with your hand and put it anywhere.
>
> Learn in 3D. Ask it to teach you something and it builds a hologram in your room: models, maps, steps, timelines and charts you walk through with "next".
>
> Look it up. A browser opens right in the room: search the web, read a page, and ask about it.
>
> Look and ask. On Quest 3 and 3S, ask "what's this?" about anything in front of you. After you allow the camera, it takes one photo, answers, and circles what it means. Quizzes and tests get coaching, never answers.
>
> Your PC, big. Pair your Windows PC and say "show my PC": its screen opens on a large panel in your room. Point, click, scroll, or say "open Spotify" and watch it happen. Anything important still asks for your approval.
>
> Little helpers: timers, a guided breathing break, your PC's photos as a gallery, and "pin that" to keep any answer as a card.
>
> Calm by design, with five looks from Midnight to Pearl. No ads, no account, no tracking.
>
> For adults 18+: add a free AI key from Google Gemini or Groq (about a minute, in the app), or your own key from another provider. Needs an internet connection. The PC features need the free IZUKI NOVA app for Windows.

Lengths: the short description is 314 characters and the long one 1,411, under the 500 and 1,500 limits (the form shows its own counter). Saved in the dashboard on 2026-11-22 (round three: browser, 3D lessons, hand grab, timers, breathing, and the adults-18+ line for the AI key).

Why "adults 18+" in a 13+ listing: Meta's age groups have no 18+ choice (only Teens and adults 13+, Mixed ages, Children; developers.meta.com/vr/resources/age-groups), while Google's Gemini API terms say its users must be 18 or older. So the listing stays Teens and adults and both descriptions say the AI key needs an adult.

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

Filled in and saved by Claude in the owner's signed-in dashboard: Name, Categorization, Specs, Details and every picture (covers, hero, icon, logo, five screenshots, the 512 tile). Done by the owner: the age group self-certification and the Developer Distribution Agreement. The first store build (version 1.0.13, build 469013) is on the private Alpha channel. Left for the owner, on purpose:
- **Content rating**: country of origin, a contact email (shared with IARC) and the IARC questionnaire.
- **Pricing → listing type**: can't be changed after submission. Suggested: *Full release* (free, with the Early Access label). *Coming soon* would only collect wishlists.
- **Submission tab**: organization verification, app sharing preferences, the contact email, then *Submit for Review*.
- **Build page**: confirm the age group for the build (*Confirm*), add the Quest's account email under Alpha → Users (then accept Meta's emailed invitation), and try it on the headset.

## Age rating and data use (the dashboard's forms)

Answer them yourself, truthfully; what's true today:
- No violence, no gambling, no purchases, no ads, no account, no chat between people.
- An AI answers in its own words, and with "show my PC" the person can see and use any website on their own PC. If the age-rating form asks about unrestricted web access or AI-made content, the answer is yes.
- Data: the microphone (the person's voice goes to the speech-to-text service they chose, Groq or Google), Izuki's spoken replies (their words go to Gemini's voice, or to Groq's whenever Gemini's gives no sound and there's a Groq key), the camera (one photo, only when they ask "what's this?" and allow it, to their AI), and their PC's screen and folders (from their own paired PC; a PC photo or screen picture goes to their AI when they ask about it). Nothing goes to us, and nothing from their Meta account is used.

## Uploading (names in the dashboard may differ slightly)

1. **Try it on a real Quest first.** No one has yet; the store reviewers will test it on one.
2. Get the store build: GitHub → Actions → "Build Izuki VR for Meta Quest" (the run on `main`) → download `izuki-vr-quest-store` (the APK signed with the store key; the other one, `izuki-vr-quest`, is the sideload preview).
3. Upload it to a test channel. Meta's website no longer takes uploads: it's Meta's own uploader, `ovr-platform-util` (the Windows one is kept in `izuki\.private\quest`), run from the `izuki` folder in PowerShell:
   ```powershell
   .\.private\quest\ovr-platform-util.exe upload-quest-build --app-id 1490038460856480 --app-secret <the app secret> --apk <the store APK> --channel ALPHA --age-group TEENS_AND_ADULTS
   ```
   `TEENS_AND_ADULTS` is the owner's own age group self-certification in the dashboard (13+); a build uploaded without it waits for *Confirm* on its build page.
   The dashboard shows the app secret when you try to upload a build on the website (and on the app's API page). It's a password: never in the repository. Once it's in GitHub (below), `main` uploads by itself.
4. In the dashboard: Alpha → Users → add the email of the Meta account the Quest signs in with. Meta emails an invitation: open it and accept it while signed in to that same account. The app then shows up in that Quest's library. Install it and try it.
5. Store listing: paste the words above and upload the pictures (the table).
6. Fill the age rating and data use forms, then submit for review.
7. Back up `izuki\.private\quest` (the store key). Every future update must be signed with it.

## Updates

Almost every update needs no store update at all. The Quest app is a window onto the live web app (`izukinova.ai/app/?vr=app`), and the web app loads its files from the network first (`docs/app/sw.js`), so a change to the room is in everyone's headset the next time they open it, as soon as the site deploys.

A new store build is needed only when the app's own package changes: its name, icon, permissions or anything else in `quest/`. Then:
1. Merge the change. On `main`, "Build Izuki VR for Meta Quest" builds and signs the store version and, with the `IZUKI_QUEST_APP_SECRET` secret in GitHub, uploads it to the private Alpha channel by itself (each build's version code is the minute it was made, so it's always newer).
2. Try it on the Quest from Alpha.
3. For the store: GitHub → Actions → "Build Izuki VR for Meta Quest" → Run workflow on `main` with channel **store**. It makes a fresh store build of `main`'s latest commit (a new version code) and uploads it as a DRAFT in the Production (Store) channel (`--channel store --draft`): Meta attaches only such drafts to a submission, and nobody sees a draft until it is released. Or from a terminal: `gh workflow run quest.yml -R nova-izuki/izuki --ref main -f channel=store`. If `main` changed since the Alpha build you tried, that's a different build: try it first (the room itself comes from the live site, so usually only the app shell differs).
4. In the dashboard: the submission's Build tab → pick that draft → Submit for Review. Meta reviews updates too; once released, Quests install it by themselves.

To give GitHub the app secret once (from the `izuki` folder; the secret is never printed or committed):
```powershell
gh secret set IZUKI_QUEST_APP_SECRET -R nova-izuki/izuki
```
It asks for the value; paste the app secret and press Enter.

## Getting to the top

Nobody can buy or promise the top spot. What moves an app up in the store's search and lists, roughly in order:
- **Ratings and reviews.** Ask the first people who like it to rate it, from the app's own pages and izukinova.ai (never with rewards: Meta forbids that).
- **People who keep using it.** First-visit suggestions and the spoken tour are there for this.
- **The words people search.** "AI assistant", "AI companion" and "voice assistant" appear in the first lines of the descriptions.
- **The first look.** One clear subject (the orb), the exact title, and five screenshots that each show something different.
- **A trailer.** Listings with one tend to convert better; make it from the 3D room when there's time.
- **Telling people.** A "Get it on Meta Quest" link at izukinova.ai/vr and the phone app once it's live, and a post in the Quest communities.
- **Updates.** Each update with notes keeps the listing fresh.
