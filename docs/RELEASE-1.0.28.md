# Izuki 1.0.28

A particle orb, a holographic status screen, smarter quiz answers and
faster looks — plus everything from 1.0.27 (below), whose build was cut
off by a GitHub hiccup.

## Stardust orb

- **Settings → Voice orb → Stardust**: thousands of tiny glowing dots form
  the orb. They breathe at rest, burst outward in waves as Izuki talks, and
  while it's thinking they stream into a looping infinity sign — then
  gather back into a sphere.

## The status screen

- Say **"wake up"**, **"status report"** or **"what's on today"** and a
  holographic status screen appears while Izuki reads the briefing: the
  time inside turning rings, battery and memory gauges, free space, today's
  reminders, what's playing and your linked apps. It leaves by itself when
  the briefing's done (or tap ×, or Esc).

## Smarter and faster

- **Quiz answers come from the smartest brain you have.** Small, fast models
  (around 11B) got quiz answers wrong; questions now go to bigger ones first
  (like Groq's Qwen or Gemini), while clicks still use the fastest.
- **A local brain that isn't running is skipped.** If a brain on your PC
  (9Router, Ollama, LM Studio) is closed, every look used to waste about
  2.4 seconds trying it. Now Izuki leaves it alone for five minutes and
  goes straight to one that's answering.


## (1.0.27) Teacher mode

- On any quiz or worksheet, in any browser, say or type **"teacher mode"**
  (or "teach me this quiz", or tap **Teach me through this quiz** on the
  Island).
- For each question, Izuki explains it like a teacher: what it's really
  asking, the key idea, and what each option means, marking the important
  words with the pen as it talks. Then it asks which answer you think is
  right.
- Answer and it tells you whether you're right, and why. If you're not, it
  shows you the right answer and the reasoning, kindly.
- Say **"next"** and it clicks the quiz's Next button and teaches the next
  question the same way.
- It never picks answers by itself; it'll select yours if you ask.
  **"Stop teacher mode"** ends the lesson.
- Tested with a free AI (Groq): it underlined the key words, boxed and
  explained each option, didn't click anything or give the answer away, and
  asked "Which answer do you think is right?" in about 3 seconds.

## (1.0.27) A new orb: Pure water

- **Pure water** (Settings → Voice orb): truly see-through like a real drop
  — your screen shows through the middle, the world bends upside-down only
  near the rim, light gathers at the bottom, and it ripples with every word.
- Smoother surfaces on every 3D orb: the faint square-looking lines in the
  water are gone.

## (1.0.27) The Island notices questions

- The Island now spots a question with answer choices on any page — even
  when the page's title doesn't say "quiz" — and offers **Explain this
  question** and **Teach me through this quiz** (briefly peeking out by
  itself, at most once per page).
- A soft colour aurora drifts behind the Island when it's open.

## (1.0.27) Hold a key to talk

- **Talk → How do you start talking?** now asks plainly:
  **Say "Hey Nova"** (hands-free) or **Hold a key**. With "Hold a key",
  nothing listens until you hold Ctrl + Windows + Space: talk while the orb
  moves with your voice, let go and it sends.
- **Wake-up strictness** (Relaxed / Normal / Strict) for "Hey Nova": pick
  Strict if it sometimes wakes on words that only sound like it.

## (1.0.27) Nigerian English

- **Talk → Language I speak → Nigerian English**, alongside Pidgin, Yoruba,
  Igbo and Hausa — for when Izuki keeps mishearing your accent.

## (1.0.27) Tidier and easier to read

- **Saved flows clear themselves** after a day of not being used (choose a
  week, a month or never in Flows); flows with a shortcut key always stay,
  and old undo copies are removed after a week — so they never eat your
  drive space.
- The **"Say it shorter / Tell me more / Keep going"** chips under the chat
  now switch colours with the screen behind them, like the chat itself —
  readable on white pages too.

## (1.0.27) Draw freely

- The drawing toolbar has a grip: drag it anywhere and it stays there next
  time.
- While you draw, the toolbar and the prompt bar let your pen pass straight
  through them and almost disappear, so nothing blocks the page.
- The screen is barely dimmed in draw mode now.
