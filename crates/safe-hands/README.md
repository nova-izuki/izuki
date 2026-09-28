# Safe Hands 🖐️

**Accurate, checked mouse and keyboard actions for AI agents on Windows.**
The hands behind [Izuki](https://nova-izuki.github.io/izuki/), as a small
Rust library you can use in your own agent. MIT licensed.

An AI that drives a PC fails in predictable ways: it guesses pixels, the page
moves under it, a pop-up sits on the button, the button is greyed out, a
letter gets lost while typing, a second monitor throws the coordinates off.
Safe Hands deals with all of those, so your model only has to *choose*.

## What it does

| | |
|---|---|
| **Numbered real controls** | `controls::list(window, 80)` reads the window's real buttons, links, fields and tabs from Windows UI Automation, numbered in reading order. Give the list (and a screenshot) to your model — it answers "click 7" instead of guessing coordinates. |
| **The part you can see** | Each control's box is cut to what's visible: the window, and inside a browser the page itself. A link half-scrolled under the address bar is clicked on its visible half — not on the toolbar. |
| **Check before clicking** | `safe_click` asks Windows what is *really* under the point first (a few milliseconds). Pages shift after the screenshot as ads and pictures load — then it clicks the control where it is **now**. Greyed out? It doesn't click and tells you. |
| **Covered? Press it directly** | If another app's window, a notification or a chat head sits on top, the button is pressed through UI Automation (Invoke / Toggle / Select / default action) — no mouse needed. Microsoft's UFO² desktop agent found acting on controls directly recovers over a quarter of failed clicks. |
| **Typing, read back** | `type_and_check` types (any language), reads the box back, and retypes a short box once if a letter went missing. Long boxes — a document — are never select-all'd, so nothing is ever wiped. Password boxes are never read. |
| **Exact pixel, any monitor** | `pointer::place` puts the cursor on the exact physical pixel with `SetCursorPos`. A popular mouse library's absolute move scales against the *main* screen only, so clicks on a second monitor land on the first one's edge. |

## Quick start

```toml
[dependencies]
safe-hands = { git = "https://github.com/nova-izuki/izuki" }
```

```rust
use safe_hands::{controls, safe_click, Outcome};

safe_hands::dpi_aware(); // once, first thing: real pixels everywhere
let window = controls::foreground_window().expect("a window in front");
let list = controls::list(window, 80);

// Show your model the list:
let prompt: String = list.iter().map(|c| c.line() + "\n").collect();
// [1] button "Back"
// [2] edit "Search" (typing goes here)
// [3] hyperlink "Sign in"
// …the model answers "3"…

match safe_click(window, &list[2]) {
    Outcome::Clicked | Outcome::ClickedWhereItMoved => {}
    Outcome::PressedDirectly { cover } => println!("{cover} was in the way — pressed it directly"),
    Outcome::Disabled => println!("greyed out — fill in the form first"),
    Outcome::Covered { by } => println!("{by} is on top — close it first"),
    Outcome::Failed(why) => println!("{why}"),
}
```

Try it on any window:

```
cargo run --example list_and_click -- "Sign in"
```

## Tips from building Izuki

- **Screenshots at about 1280 px wide**, coordinates scaled back yourself —
  never send the full-size screen ([Anthropic's guidance](https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude)).
- **Put the instruction before the screenshot** in the message.
- **Print each control's number on the screenshot** at its top-left corner
  (set-of-marks), so the model can match the picture to the list.
- **Small or free models** do far better answering in short command lines
  (`CLICK 7`, `TYPE 3 "hello"`, `SCROLL down`) than in a long JSON schema.
- **Let a model zoom in** on a small area before choosing tiny targets, and
  prefer keyboard shortcuts for very small ones.

## Sources

- Microsoft Research — [UFO²: The Desktop AgentOS](https://arxiv.org/html/2504.14603v1)
- Microsoft — [UFO](https://github.com/microsoft/ufo), [OmniParser](https://github.com/microsoft/omniparser)
- Anthropic — [Best practices for computer and browser use](https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude)

## License

MIT — use it in anything, including commercial products. A mention of
[Izuki](https://nova-izuki.github.io/izuki/) is appreciated.
