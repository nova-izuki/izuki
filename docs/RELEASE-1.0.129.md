# Izuki 1.0.129: Island 2.0, part 2 — approvals, phone sessions, errors, right-click and double-click

From the Living Island spec: the Island now shows what needs you, and you can act on it right there.

## ✋ "Waiting for your OK", on the Island
When Izuki holds something for your yes (an email to send, a message to post), the pill says **"Waiting for your OK · Gmail: To sam@… · Running late"**, with a few gentle amber pulses. Open the Island and **Allow** or **No** are at the top. No need to find the chat or your phone. If the answer doesn't go through, the buttons stay so you can try again.

## 📱 Your phone, connected
While your paired phone is viewing or controlling the PC, the pill says so ("Your phone is viewing your screen", in red when it's controlling). The open Island always has an **End** button, even while something else is going on.

## ⚠️ Errors you can do something about
When something fails, the pill shows what went wrong for 15 seconds. Open it for **Get help**, which sends the exact error to Nova, or **Dismiss**. A new task clears an old error.

## 🖱️ Right-click and double-click
- **Right-click the open Island:** Talk to Nova · move it left / centre / right · Quiet for an hour (only approvals and errors still show) · No more suggestions · Hide the Island.
- **Double-click its top row** (your greeting and the clock) to start talking.

Order of what the Island shows: an approval comes first, then an error, then everything else as before (finished, missions, working…), with a phone session before music and reminders.

Tested in the browser preview: the approval pill, the Allow / No card and the right-click menu all showed. CodeRabbit caught that a new approval could fail to appear on the pill; that's fixed.
