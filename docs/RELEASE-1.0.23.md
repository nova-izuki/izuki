# Izuki 1.0.23

The teaching pen finally lands where it should.

## Marks go on the exact words

- **It finds the words on your screen.** When Izuki underlines, boxes or
  circles something it's explaining, it now reads your screen with Windows'
  own text recognition and draws on the words themselves — not on a guess
  made from a shrunken screenshot. Works in a browser, a PDF or a paused
  video, at any screen size or display scaling (tested at 100 % and 150 %).
- **Working-out notes go under what it marked.** "3 × $2 = $6" is written
  right below the words it just explained, never in a random corner.
- **Free AIs can teach too.** Small free models get a simple pen command, and
  Izuki places every mark itself. In testing, Groq's free model explained a
  maths question step by step — underlining the price, the amount and the
  "total cost", then writing the answer — in under 2 seconds.
- **Marks around buttons and links** use the control's real edges (both
  corners, not one corner and a guess).

## It always knows your screen size

- Every pen mark and pointer move now carries the real screen size, and the
  overlay works it out by itself on start and whenever the display changes
  (resolution, scaling, a monitor plugged in). Before, an overlay that hadn't
  been told the size drew everything 1.5× off on a 150 %-scaled screen.

## "Explain more" explains more

- Asking it to explain further now gets a fuller explanation with an example
  and new marks — never a shorter one that stops after a line.

## Search

- Every release page now links to the website, so Google sends people to the
  site instead of only to GitHub.
