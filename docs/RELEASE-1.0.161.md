# Izuki 1.0.161: it does the clicks in FL Studio, and "do it" applies the 808 fix

## 🎯 "It doesn't even do anything"
**The problem:**
- **The 808 fix was handed to you.** On 1.0.160 Izuki finally heard your beat and wrote the fix for your 808, then gave you menu directions to apply it ("Piano roll menu → Tools → Scripting → Izuki align → Accept"). When you said "fix it", it answered "you ain't asked me nothing yet".
- **Clicks in FL were refused.** Your Izuki is set to Precision, which only clicks things Windows can list as real buttons. FL Studio draws its own buttons, so Windows lists none, and *every* click Izuki tried in FL was refused: "Precision needs a numbered target". Even clicks where Izuki had already read the button's label on screen were refused.

**What changed:**
- **A label read on screen counts as a real target.** When Izuki reads a button's words on the screen itself and moves the click onto them, that spot counts as a real target for a minute, so Precision lets it through. That works in FL Studio and any app that draws its own buttons. Guessed spots are still refused, and the window-button and final-button guards still apply.
- **"Do it" applies the 808 fix.** Within 15 minutes of Izuki writing the fix, "do it", "fix it", "yes", "apply it", "line them up" or "go ahead" makes Izuki run "Izuki align" in the Piano roll itself: menu, Tools, Scripting, Izuki align, Accept, nothing else. "Run the Izuki align script" works any time. Another request ("fix the hats", "make it louder") is still its own job.
- **The report now offers this** ("say “do it” and I'll run it there for you"), with the menu path only as a do-it-yourself option.

**How it was checked:** tests cover the go-aheads and the requests that aren't ("fix the hats", "make it louder", "why is it off?", "no", "open YouTube"). The FL menu clicks themselves haven't been watched live yet. If one fails, the log shows which label Izuki couldn't find.

**Limits:**
- FL doesn't let other apps run a Piano roll script directly, so this one is real clicks in FL's menus.
- Ctrl+Z in FL takes the fix back.
