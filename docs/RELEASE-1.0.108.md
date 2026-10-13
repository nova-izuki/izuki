# Izuki 1.0.108: the talk key works, Air control without accidents, nothing sent without your yes

## 🎙️ The talk key (Ctrl+Win+Space) works again
Your log showed why pressing it did nothing: **"couldn't register: Ctrl+Super+Space"**. Windows keeps that combination for switching keyboard languages, so it never reached Izuki.

Now, when Windows won't hand it over, Izuki catches the talk key itself, with the same keyboard watcher Esc uses:
- **Press it:** the orb and waveform come up and Izuki listens.
- **Hold it and let go:** what you said is sent.
- **Windows' language switch** doesn't also fire, and the Start menu doesn't pop open when you let go of the Windows key.

Every press is logged ("talk key pressed (caught directly)"), so any remaining problem shows up.

## 🖐️ Air control: no more accidents
- **Only a raised hand drives it.** Your hand needs to be up in front of the camera, fingers pointing up. Hands resting on the keyboard while you type are ignored now, so they no longer move the mouse. The ring disappears until you raise your hand.
- **No more surprise clicks.** A pinch has to be held for a moment (80 ms) to count, so fingers brushing past each other while you move don't click.
- **Small buttons are easier.** When the ring is on a small button it moves at half speed, like aim assist, so a little wobble doesn't slip off before you pinch. The pinch still lands on the button's centre.

**Tested with a fake camera:** hands typing on a laptop keyboard were seen by the tracker but moved the ring zero times. A raised hand moved it 329 times, and the 🤙 call gesture still works.

## 🔒 Nothing sent without your yes
Emails, messages, posts, calendar changes and other actions in your linked apps now have a hard safety check in Izuki's own code, not just an instruction to the AI:
- **You see the draft first:** who it's to, the subject and the words.
- **Only an explicit yes sends it** ("yes", "send it", "go ahead"). "Yes but make it shorter" or "no wait" doesn't count.
- **A yes approves exactly that draft.** If the AI tries a different action, recipient or wording, you're shown the new draft and asked again.
- **The same message can't be sent twice** within ten minutes. If sending definitely failed, you can try again. If the connection dropped mid-send, Izuki won't risk sending it twice.
- **Reading, searching and saving a draft** need no approval.

## Reviewed
- **Tests:** 263 Rust tests, including new ones for the send check and the talk key, plus the build and the Air, conversation and phone tests.
- **CodeRabbit:** 7 findings fixed.
