# Izuki 1.0.72: clicks on web pages land, less lag

Fixes found in Izuki's own log on a real PC, each reviewed by CodeRabbit before release.

## Web page clicks
- With the browser extension, a link Izuki had found (like **Next** on a course page) was refused with "I can't verify it here anymore". Its listed name included the link address, which Windows doesn't show. Fixed.
- In **Precision** mode, clicks through the browser extension never happened: they were refused before reaching it. Now the extension clicks or types right inside the page first, in every mode, and the screen is only used if that fails.

## Less waiting
- A local AI (9Router, Ollama, LM Studio) that isn't running used to cost ~2.4 s on the first try after every restart, and again every five minutes. Izuki now checks its port in about a tenth of a second (trying each address "localhost" can mean) and skips it.

## Phone call line
- With the internet down, the call tunnel was restarted every 2 seconds, hundreds of times a day. It now waits longer after each quick failure (up to 5 minutes), and notices straight away if you turn calls off or on.
