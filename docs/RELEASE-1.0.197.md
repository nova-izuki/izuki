# Izuki 1.0.197: PDFs you can edit, an Open button, and a calmer hand

Izuki can now change words inside a PDF as well as Word, Excel and PowerPoint, opens the exact copy it wrote from the chat card, keeps the robot hand out of the way until it is doing something, and adds an optional eye calibration that waits for your own webcam test.

## 📄 Edit a PDF without touching the original

- Ask Izuki to change words in a PDF and it makes an edited copy beside it, named “(Izuki edit)”. Your original is never modified.
- It reopens the copy and checks the change is really there before keeping it.
- Some PDFs store their letters as font codes instead of readable text. Izuki refuses those in plain words and leaves no broken copy behind.
- Files you attach in chat are saved as real documents first, so “edit this PDF” works on the attachment too.

## 📂 Open the result

- An edited file's card in the chat now has an **Open** button. It opens the exact copy Izuki wrote — never a path the AI guessed — and says so if the file is missing.

## ✋ The robot hand only when it is working

- The idle hand no longer floats over your desktop. The optional hand appears only while Izuki is carrying out an action, and it stays off unless you turn it on.

## 👁️ An optional eye calibration

- With the eye camera on, look at a marker and blink once; Izuki learns where your eyes sit so later looks are steadier.
- It starts off, works only while the camera is on, and stops when the camera is off. A shaky hold or a wild anchor is rejected instead of skewing your looks.
- This is experimental until your own webcam test confirms it on your setup.

## Behind the scenes

- The helper bridge that coordinates the AI agents now restarts itself after an update or a crash, reports progress while an agent works, recovers a task whose run was interrupted, and treats a lost connection as an outage rather than a failed attempt.
- A safe Codex compatibility check and completion reader are in place for future backup work; automatic dispatch stays off.
- The last dead non-Windows screen-capture stub was removed.

## Checked before release

The full Rust suite, the TypeScript check, the frontend build, the scheduler and eye-control checks, the hand-overlay browser regression, and the Windows and web CI jobs all pass on the release commit. The eye calibration still needs a real webcam test on your PC, and the release page is updated only after the installer, signatures and updater manifest verify.

---

Free, as always. No account, no subscription, nothing to pay.
