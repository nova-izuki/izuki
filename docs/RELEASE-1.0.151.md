# Izuki 1.0.151: lining up with a sample loop by ear, research you can continue, a character that really moves

## 🎧 Your notes, lined up with the beat as it really plays, sample loops included
**The problem:** you asked Izuki to fix 808 notes that weren't flowing with your beat, with the Piano roll open and your loop highlighted in red. Izuki went to its screen-clicking helper, which can only press FL's quantize button, then gave up and went back to listening. The log showed two root causes:
- **Your words weren't recognised.** The 808 fix only woke up on words like "808" plus "align", "sync" or "timing". "Allign", "not flowing with the beat" and "my notes" weren't among them.
- **It assumed a drum kit with a "Kick" channel.** Your beat is a **sample loop**: an audio clip in the Playlist, not made on FL's grid. Its hits don't sit exactly on the grid, which is why 808 notes that are on the grid still don't line up. The fix also played only the pattern, so it would never have heard your clip.

**What changed:**
- **Any words, typos included.** "My notes aren't flowing with the beat", "there's a misalignment", "the 808 doesn't allign with the loop", "make the 808 flow with the sample". Asking for a *new* part ("add an 808 that flows with the beat") still writes one.
- **The beat is whatever you actually hear.** With no programmed kick, or when you mention the sample, loop or clip, Izuki:
  - plays your highlighted loop in Song mode;
  - listens to everything except your notes, against FL's metronome;
  - then listens to your notes on their own, in the same loop.
- **It finds where your pattern sits in the loop itself.** The Piano roll script matches your notes to where they were heard, so it doesn't matter where the clip starts.
- **Your rhythm is kept.** Notes right by a hit in the sample land with it as it really plays, off the grid if that's where the sample hits. The 16ths between take the sample's feel. Triplets, rolls, lengths and slides are kept.
- **Everything goes back.** Your mutes, the metronome and Song or Pattern mode are always restored, even if something fails.
- **FL's pattern length is read correctly** (FL gives it in beats). Before, Izuki saw only part of the kick's steps in patterns longer than a bar.

**How it was checked:**
- Your own sentences are in the tests and now reach this fix.
- "Add an 808 that flows with the beat" still writes a new 808.
- "My notes aren't syncing" (Izuki's Notes) isn't taken as music.
- The script Izuki really writes was run on a made-up project: an 808 pattern one beat into the loop, a sample whose kicks sit off FL's grid, and an 808 that sounds slightly late. It found the pattern's place exactly and moved each note to the right spot, with triplets and rolls kept.

**Limits:**
- Restart FL once after this update (Izuki updates its FL script).
- Your notes' pattern must be in the Playlist under your highlighted loop, so they play together in Song mode.
- The metronome needs to be audible: it's Izuki's clock.
- Not yet tried inside FL itself.

## 🔭 Research you can continue, and it says what it couldn't read
**The problem:** deep research quietly dropped the pages it couldn't open, and everything it read was gone once the answer was written.

**What changed:**
- **Kept.** Every investigation is saved: the question, the searches, the pages and their text, and the answer.
- **Continued.** Say "continue the research", "research more about …" or "dig deeper into …", or tap **Dig deeper** under the answer. Izuki picks up where it left off: what it read stays read, and it searches only for what's missing, including whatever you asked to go deeper on.
- **Honest about gaps.** Each answer ends with **Couldn't read** and the reason: the site turned Izuki away (a sign-in, paywall or bot check), the page is gone, it's a PDF, it didn't load in time, or the search engines didn't answer.
- **"Go deeper" in an ordinary chat** still means "explain more". It only continues research right after a research answer.

## 🎞️ Real in-between frames: the character flows instead of cutting
**The problem:** Izuki's character still looked like it was cutting from picture to picture. 1.0.150 added body movement, but it didn't fix why the poses themselves jumped:
- **Separate paintings.** Each character has about 6 paintings per action (standing, talking, walking), and each one was painted on its own. They aren't drawings of the moments in between.
- **Standing.** Izuki swapped between 6 almost-identical paintings every few seconds. Every swap redrew the folds and the face slightly differently, so you saw a small jump with no actual movement.
- **Talking.** A different gesture about once a second, with a fade: a cut or a ghost every second.
- **Walking.** Six separately painted steps, so the robe "boiled".

The skeleton-rigged version of each character was tried again and rejected: bending one painting tears the cloth and turns arms to rubber.

**What changed:** real animation fills the gaps between key poses with in-between drawings, and Izuki now has them:
- **In-betweens for every character.** For each pose change the character makes, Izuki worked out where every part of the painting moves and drew the steps in between. That covers walking steps, gesture to gesture, standing to talking or thinking, and thinking to talking. It's about 50 changes for each of the 37 characters.
- **Gestures travel.** A hand now travels to the chin or up into a gesture. Each move eases out of one pose and into the next.
- **Walking is three times smoother:** about 30 pictures a second instead of 10. Walking across the screen is drawn at 60 a second.
- **Standing holds one painting,** alive only through breathing and a slow weight shift, so there are no more jumps from swapping near-identical paintings.
- **The live mouth and blinks** follow the face through every in-between.

**How it was checked:**
- Film strips of consecutive frames, drawn exactly as the app draws them, for standing → thinking, thinking → talking, talking gesture to gesture, and walking. Each one moves step by step, with no jumps in size or position.
- Two other ways of following the motion were tried and rejected because they lost the hand or tore the picture.
- Type check passes, and the original paintings are untouched.

**Limits:**
- During a fast arm move, the arm is soft for a moment, like motion blur, because the paintings don't show the arm halfway.
- Truly new poses would need new art.
- The in-betweens add about 17 MB to the app. They're stored smaller than the poses because each one is on screen only for a few hundredths of a second.

## 🛡️ Windows running as administrator: said plainly, not failed silently
**The problem:** Windows doesn't let an ordinary app click or type into an app running as administrator, such as Task Manager, an installer or an admin terminal. Izuki's clicks there silently did nothing, so the next look wondered why nothing had changed.

**What changed:**
- Before each click, key press or bit of typing, Izuki checks whether the window that would get it runs as administrator. For clicks it checks the window under the click; for typing, the one in front.
- If it does, Izuki stops and says so: that window is running as administrator, so do this part yourself, or run Izuki as administrator.
- Actions inside a web page, through the browser extension, aren't affected.
- This is the check Air control already used, now shared with the agent.

**How it was checked:**
- A test makes sure Izuki's own windows, and a plain program the test starts, are never reported as administrator. A false alarm would stop a task that would have worked.
- It hasn't yet been tried against a real administrator window.
