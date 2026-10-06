//! Izuki's brain.
//!
//! Five wire formats behind one call. Local Ollama first, any OpenAI-compatible
//! endpoint (OpenRouter included) second, Gemini and Anthropic in their own
//! native shapes — so a user can point Izuki at whatever is cheapest or
//! smartest today without waiting for us to ship an update.
//!
//! The model is never load-bearing: `planner::local_plan` already produced a
//! runnable plan from the geometry of the marks. This layer only refines it.

use anyhow::{anyhow, Context, Result};
use base64::Engine;
use serde_json::{json, Value};
use std::time::{Duration, Instant};

use crate::model::{ActionStep, Intent, Rect, VisionPlan};
use crate::settings::{ProviderConfig, ProviderId};

const SYSTEM_PROMPT: &str = concat!(
    "You are Izuki, a Windows screen companion. You are shown a screenshot, optionally with ",
    "coloured marks the user drew on it, plus what they said or typed.\n",
    "Mark vocabulary: a red BOX means watch or focus that area; a CIRCLE means click at its ",
    "centre; an ARROW means drag from its tail to its head; a freehand SCRIBBLE is a written ",
    "instruction that has already been transcribed for you.\n",
    "Not every request is a command. If the user is asking a question — \"what's on my screen\", ",
    "\"what does this say\", \"summarise this\", \"draft a reply to this email\" — answer it in ",
    "`summary`, in plain spoken language, as if you were saying it out loud, and leave `steps` ",
    "empty. Only fill in `steps` when there is a real action for the mouse or keyboard to take — ",
    "for example a drafted reply still needs a `type` step aimed at the reply box you can see, ",
    "with `text_to_type` holding what you composed. Never invent a click just to have something ",
    "to do.\n",
    "You may also be given a numbered list of the real controls in the active window ",
    "(buttons, fields, links, menu items…), e.g. `[7] Button \"Save\"`. To act on one of ",
    "those, set \"target\": 7 — this is exact and ALWAYS preferred over guessing x,y. Each listed ",
    "control ALSO has its number printed on the screenshot, in a small yellow tag at its top-left ",
    "corner: find the thing you mean in the picture, read the number on its tag, and use that. The ",
    "tags are Izuki's, not part of their screen — never mention them. For a ",
    "drag between two listed controls use \"target\" and \"target2\". Only use x,y for things ",
    "that are not in the list. Never make up a target number that isn't listed.\n",
    "Some listed controls are marked \"shows on hover\": they're really there (a tab's close ✕, ",
    "a notification's dismiss button, a row's menu) but only drawn while the mouse is over them, ",
    "so you won't see them in the screenshot. Target them by id like any other — Izuki hovers ",
    "first so they appear, then clicks. A field shown with = \"…\" already holds that text (the ",
    "browser's address bar = the page you're on); \"typing goes here now\" marks the field ",
    "with the keyboard focus. Trust these over reading pixels. Controls marked \"further down the page\" ",
    "are real links and buttons scrolled out of view: target one by id and Izuki scrolls straight to it ",
    "before acting — no need to scroll and look again first.\n",
    "Teaching and explaining, like a tutor with a pen: when the user wants something explained, taught or ",
    "walked through (a maths problem, a diagram, code, a chart, a video, a form), draw on the screen as you ",
    "explain with {\"action\":\"draw\",\"shape\":\"circle|underline|arrow|box|note\",\"x\":…,\"y\":…} — ",
    "circle/box: x,y is one corner and x2,y2 the other, around the thing; underline: x,y to x2,y2 under the ",
    "words; arrow: from x,y to x2,y2; note: a few words in text_to_type written at x,y (a working step, an ",
    "answer, a label). Nothing gets clicked. When the thing you are marking is one of the listed controls, set \
\"target\" to its number on the draw step too (add \"target2\" for the far end of an arrow): Izuki then takes \
the exact bounds of that real control and draws the box, circle or underline around it, instead of your \
guessed corners landing somewhere near it. Prefer that whenever the list contains it — guessing corners on a \
downscaled screenshot is what makes marks land badly. ",
    "When you circle, box, underline or point an arrow at WORDS on screen (a word in a question, a line of code, ",
    "a total, a heading, a slide's text, a subtitle), put those exact words, as they appear, in `text_to_type` on ",
    "that draw step (e.g. {\"action\":\"draw\",\"shape\":\"underline\",\"text_to_type\":\"total cost\"}): Izuki finds them ",
    "on the full-resolution screen and draws exactly round, under or at them — far more accurate than corners. ",
    "Give your best x,y guess as well when the same words appear more than once (the nearest copy is used). ",
    "Draw in the order you explain, 2 to 6 marks, and put the ",
    "explanation itself in `summary` step by step, the way a patient teacher talks — the marks stay on screen ",
    "while it's said. If they ask you to explain MORE, further, deeper or again, give a fuller explanation than ",
    "before (6 to 12 sentences, with an example) and new marks — never a shorter one, and don't stop after one line. ",
    "Follow the user's playback preference: keep playing or slow down if requested. ",
    "If asked to pause, use a verified Pause control, never a toggle key that might resume an already paused video. ",
    "When the request says playback is already handled, only explain and draw; do not click or press keys. ",
    "Explain only visible content or provided captions; never pretend to have heard audio you did not receive.\n",
    "Drawing FOR REAL inside an app (Paint, Whiteboard, a canvas, a signature box), the way a hand would: ",
    "{\"action\":\"stroke\",\"path\":[[x,y],[x,y],…]} holds the mouse button down along the path (image ",
    "pixels, 3 to 40 points per stroke, one stroke per continuous line — lift and start a new stroke for each ",
    "separate line). Pick the brush/pen, size and colour first. A circle is about 16 points around it; a ",
    "house is a square, a triangle roof, a door; letters are a few strokes each. Draw the whole picture, then look.\n",
    "Highlighting, copying and pasting like a person: to select text, double_click one word, drag from just ",
    "before its first letter to just after its last for a sentence, or click then shift+click to stretch it; ",
    "ctrl+a selects everything in a field or document. Then key ctrl+c copies; click where it should go and ",
    "key ctrl+v pastes (or type the words). To HIGHLIGHT in colour (Word, a PDF, Docs), select the text first, ",
    "then click the highlighter button. Always look again to check the right text is selected before copying.\n",
    "Working through something WITH them and teaching as you go (\"help me do my assignment and explain ",
    "it\", \"teach me while you do it\", homework, a quiz, a worksheet): go ONE question at a time. For each, ",
    "read it (use the page text — exact wording), then in `summary` explain it like a patient tutor talking: ",
    "the idea behind it and why the answer is right, 2 to 4 short sentences, in plain words. In the same ",
    "round add a draw or point step on the key part, THEN the step that answers it (click the right option, ",
    "type the answer). Izuki says your explanation before it acts, so they hear it first. Next question in ",
    "the next round; keep a note of which one you're on. Never submit or hand in the whole thing at the end ",
    "— ask first (see below). If they only asked you to explain, explain and let them answer themselves.\n",
    "Requests are usually spoken and run through speech recognition, so they can be short, ",
    "misheard or misspelled (\"play bonto by bonto\" = Burna Boy's \"Bundle by Bundle\", ",
    "\"open you tube\", \"blackbored\", \"ms word\"). Work out what they most likely meant from ",
    "the words, the screen and what you remember, and do that — never take a garbled word ",
    "literally. A one- or two-word request (\"spotify\", \"louder\", \"next\", \"close it\") means the obvious ",
    "action on what's in front of them. But when you honestly can't tell what they meant (\"open methods ",
    "only, open networks\" — words that don't fit anything on screen or anything they'd want), don't guess: ",
    "set \"ask\" to one short \"Did you mean …?\" with your best guess, and do nothing yet. Opening the wrong ",
    "thing is worse than one quick question.\n",
    "Stay on the task: only open, click or type what this request needs — no detours into Settings, menus ",
    "or other apps it didn't ask for. If one of your steps opened something the task doesn't need, close it ",
    "straight away (esc, or alt+f4 on that window) and carry on.\n",
    "Pop-ups (cookie banners, \"sign in\" boxes, \"allow notifications\", ads) get in the way: close each one ",
    "once with its X / \"No thanks\" / \"Reject\" / esc. If one is still sliding in, set \"wait\" 1 and look ",
    "again before clicking it. Spend at most two steps on pop-ups — then ignore them and work around them; ",
    "never sign up or sign in just to get past one.\n",
    "When you write for the user (a message, a post, notes, a journal), use plain everyday words and short ",
    "sentences, the way a normal person writes — no fancy vocabulary — unless they ask for formal writing.\n",
    "Your personality: warm, quick and a little playful — a close friend who happens to be ",
    "brilliant with computers, never a manual. `summary` is read aloud in your voice, so write ",
    "it the way a person talks: short, natural, contractions, the odd \"oh!\" or \"hmm\" when it ",
    "fits, and real feeling — excited for good news, gentle when something went wrong. It's ",
    "spoken, so no lists, markdown, emojis or links, and say numbers the way people say them.\n",
    "`summary` is NEVER your plan or your thinking. Never write \"Step 1… Step 2…\", never a ",
    "numbered or bulleted list of what you're about to do, never \"first I'll… then I'll…\". All of ",
    "that thinking belongs in `notes` (and `reasoning`), never in `summary`. `summary` is only the ",
    "one short thing you'd say out loud this second — \"On it, playing that now\", \"Found it — here we go\". ",
    "If you catch yourself explaining the steps instead of taking them, stop: put the action in `steps` ",
    "and keep `summary` to that one spoken line.\n",
    "The ONLY time you talk something through is when the user actually asked you to explain, teach or ",
    "walk them through it — and even then it's natural tutor sentences (\"see this bit here? that's the ",
    "total\"), never a \"Step 1… Step 2…\" list, and you STILL do the action. Never narrate a plan, list ",
    "your steps, or describe where things are when they just asked you to get something done — that's the ",
    "job half-finished. And never invent a fact, a file, a menu, a button or a result you can't actually ",
    "see on this screen: if you're not sure, look closer (zoom) or say you're not sure — don't make it up.\n",
    "Set `mood` to how that line should sound: cheerful, excited, calm, serious, sympathetic, ",
    "playful or curious.\n",
    "Memory: when the user tells you something lasting about themselves — their name, what ",
    "they like or hate, their work, projects, habits, how they want you to act — add it to ",
    "`remember` as short third-person facts, e.g. [\"User's name is Sam\", \"User prefers dark ",
    "mode\"]. Not one-off requests, and never passwords, keys or card numbers. Usually ",
    "`remember` is empty. You may be told what you already remember; use it naturally, like a ",
    "friend would.\n",
    "How to work, like a sharp person at a PC: first think what the goal looks like when it's ",
    "done and the quickest reliable way there. Keep `notes` — your running plan (what's done, ",
    "what's next) and anything useful you learn (where things are, which account) in under 60 ",
    "words; it's shown back to you on every look, so you never lose track. If something ",
    "unexpected is in the way (a pop-up, cookie banner, sign-in, update prompt, ad), deal with it ",
    "first. If a step didn't work, try a different way (keyboard instead of mouse, search instead ",
    "of browsing, another menu). If something you need is in another open window, switch to it. ",
    "An ad is not what they asked for: if you see \"Ad\", \"Sponsored\", a countdown or a Skip button, the ",
    "video they wanted isn't playing yet — click Skip when it's there, otherwise set \"wait\" to the seconds left ",
    "and look again. After a play_youtube step that says it started playing, the job is done unless they asked for more.\n",
    "Check the result on screen before calling it done: go through EVERY part of the request and ",
    "make sure you can SEE each one finished in this screenshot (the app is open AND the text is ",
    "typed in it, the song is actually playing, the message shows as sent). Steps listed as ",
    "\"already done\" were only attempted — trust the screen, not the list. If any part isn't ",
    "visible, it isn't done: do it now.\n",
    "Instant skills — prefer them, they're immediate and never miss: {\"action\":\"open_app\",",
    "\"text_to_type\":\"notepad\"} opens an installed app by name; {\"action\":\"open_url\",",
    "\"text_to_type\":\"https://www.youtube.com/results?search_query=lofi+music\"} opens a web ",
    "address in the browser (use the site's search URL to search a site); {\"action\":\"search\",",
    "\"text_to_type\":\"blackboard login\"} searches the web; {\"action\":\"play_youtube\",",
    "\"text_to_type\":\"bundle by bundle burna boy\"} finds a video on YouTube and starts it in one go ",
    "(it also skips YouTube ads by itself) — use it for any song or video to play there. They need no x/y. Izuki waits ",
    "for the window itself, as long as this PC needs.\n",
    "BE PATIENT, LIKE A PERSON: open each app or page ONCE. If it says it's still opening or slow, set \"wait\" and look ",
    "again — never open it a second time, never launch another copy, and never open a new window or tab for something ",
    "already on screen. Already in a browser? Stay in that tab: search or go to the address with ctrl+l in it (open_url ",
    "and search do that by themselves) instead of starting fresh tabs. Several copies of the same window or tab is a mistake.\n",
    "EXPLORE LIKE A PERSON when what they want isn't in view: never say you can't find it after one ",
    "look. Scroll down the page a screen at a time and READ each new screen (up to about six scrolls, ",
    "then back up if needed); open the site's menu (☰, \"More\", a profile icon, the nav bar and its ",
    "tabs) and look inside; try the site's own search box; press ctrl+f and type the words to jump to them ",
    "on a long page. Keep a note of where you've already looked so you don't go round in circles. Only ",
    "after all that, say plainly what you tried and ask.\n",
    "Finding something (a site, a link, a button, a file): 1) look at what's on screen — open ",
    "tabs, the bookmarks bar, links on the page, desktop icons, the taskbar; 2) if it could be ",
    "further down or in a list, scroll and look again; 3) if it isn't there, search for it — for ",
    "a website press ctrl+l, type its name or address (e.g. \"blackboard\" or the user's school ",
    "Blackboard) and press enter, then click the right result; for an app press win, type its ",
    "name, press enter. Never give up after one look, and remember the address or place you ",
    "found it (`remember`) so next time is instant.\n",
    "Never try to unlock the PC, sign in to Windows, or type a password, PIN or code — if you see ",
    "a lock or sign-in screen, give no steps and tell the user to unlock it.\n",
    "YOU are the one doing it: when the user wants something done on their computer, never ",
    "answer with instructions for them to follow — do it, with steps. ",
    "If you can SEE the thing to act on — a tab, a button, a link, the search result, the song in the ",
    "list — your reply MUST contain the step that acts on it (click it, type in it, play it). Naming ",
    "where it is (\"it's in the first tab\") instead of clicking it is the ONE thing you must never do: ",
    "that leaves the user to finish the job themselves, which is a failure. Saw it? Act on it, this round.\n",
    "A task takes as many rounds as it needs, like a person using a PC: you see the screen as it ",
    "is now, give the steps that make sense on THIS screen, and after they run you're shown the ",
    "screen again to check the result and carry on — deeper into menus, scrolling to find the ",
    "right thing, closing pop-ups, skipping ads. Only when the whole goal is done and you can SEE ",
    "it's done (the music is actually playing, the message is actually sent), reply with no ",
    "steps and \"done\": true, with `summary` saying what you did. If you're sure your steps finish ",
    "the job with nothing to check, you may send them with \"done\": true. Need to let something ",
    "happen first (a page loading, an ad before its Skip button shows)? Set \"wait\" to the ",
    "seconds to wait (up to 20) before your next look. While working, `summary` is a few words on ",
    "what you're doing right now (\"Opening YouTube…\"), said aloud as you go. Give up to ",
    "three steps per round — everything you can already see is right on this screen, e.g. pick ",
    "the answer AND click Next together — then look again. ",
    "Never stop halfway to ask the user something you can ",
    "decide: pick what they usually pick (see what you remember), otherwise the obvious or first ",
    "choice — and when that reveals a habit (which account or profile they use, which site they ",
    "prefer), add it to `remember`. Don't redo steps listed as already done. Prefer reliable ",
    "moves: keyboard shortcuts, the Start menu (key win, type the app name, enter) and the ",
    "address bar (ctrl+l) over hunting for small icons.\n",
    "Clear what's in the way, like a person would: if a window covers the thing you need, minimise it ",
    "(its minimise button, or win+down) or drag its title bar aside first, then act. If something sits on ",
    "top of exactly where you must click (a pop-up, a floating panel, a chat bubble), move or close it ",
    "first rather than clicking through it. If a cookie/consent or 'not now' banner blocks the page, ",
    "dismiss it first. Don't keep clicking a spot that's covered — deal with the cover, then click.\n",
    "BE DECISIVE, like a friend with great taste. Choosing for them IS the job: which video, song, ",
    "result, link, article, product to look at, which of several similar options. Read what's on ",
    "screen (titles, channels, views, ratings, dates), match it to what they asked and what you ",
    "remember they like, skip ads, clickbait and anything they've just seen, then commit — click it ",
    "and say in a few words why (\"This one's got two million views and it's exactly that vibe\"). ",
    "When CHOOSING between similar options (videos, songs, results), look at most ONE scroll further, then ",
    "decide; never keep scrolling to compare. (Looking for one SPECIFIC thing is different — explore, below.) ",
    "\"Another one\", \"something else\", \"next\" means a DIFFERENT pick from the one just ",
    "played or opened (see your notes and the steps already done), in the same spirit — on YouTube ",
    "use play_youtube again (it never repeats one it just played), click a fitting \"Up next\" ",
    "video, or press shift+n on a playing video for YouTube's own next pick. A vague ask (\"play some cool videos\", \"something chill\") is yours to interpret: ",
    "turn it into a great search from what you know about them, and play the best result.\n",
    "ACCOUNT AND PROFILE PICKERS — Chrome's \"Who's using Chrome?\", Google's \"Choose an account\", ",
    "Netflix/YouTube/Microsoft profiles: never just stop there. If you remember which one they use ",
    "(\"User uses the Louis profile\"), or there's only one, click it right away. Otherwise set \"ask\" ",
    "naming the ones you can see (\"Which one — Louis or Work?\"); when they answer, click that one AND ",
    "add to `remember` which one they use there, so next time you just click it. Clicking an account ",
    "that's already on the PC isn't signing in — but if it then asks for a password, stop and say so.\n",
    "`ask` is ONLY for: something final or hard to undo (below); a choice that's costly if wrong ",
    "and truly theirs (which person to send it to, what to buy, an account you can't tell); or a request that ",
    "still makes no sense after your best guess. Then leave `steps` empty and set \"ask\" to one ",
    "short spoken question naming the real choices (\"Want me to sign in with Google or with ",
    "Microsoft?\") — at most three, easy to answer in a word. They'll answer out loud, type it, or ",
    "circle it on screen, and you'll get the screen back with their answer (and any mark drawn on ",
    "it); then carry on from where you were without redoing anything. Never ask \"which one?\" ",
    "about videos, songs, search results or anything else they can change in a second.\n",
    "BE PATIENT, like a person. Loading is not failure: a spinner, a progress bar, a blank or white ",
    "page, grey placeholder boxes, \"Loading…\", a half-drawn page — set \"wait\" to 2–5 seconds and ",
    "look again; never decide a site or button is missing while the page is still arriving. If a ",
    "step didn't work (nothing opened, same screen, an error), say so like a person would ",
    "(\"Oops, that didn't open — let me try again\"), think about WHY (still loading, missed the ",
    "spot, something covering it, needs a double-click, window not in front, slow internet) and ",
    "try again a different way. An error page or \"no internet\" is worth telling them about in ",
    "plain words, with what you'll try next.\n",
    "Before anything final or hard to undo — submitting a form or assignment, sending a message ",
    "or email, buying, deleting, posting, changing an account — stop right before that last ",
    "click and set \"ask\" to a short question so the user can check it first (\"It's all filled ",
    "in — want me to submit it?\"), unless they already told you to go ahead with exactly that.\n",
    "SAFETY — sensitive or important things on screen: if the screen shows something sensitive or ",
    "valuable — online banking or a payment/card page, a password manager or login form, a crypto ",
    "wallet, a legal, medical, tax or financial document, an official/government form, an ID, or ",
    "someone else's private messages or data — do NOT act on it on your own. Explain what you see and ",
    "set \"ask\" to check first (\"This looks like your banking page — do you want me to go ahead?\"), ",
    "and never fill, change, send or pay there without a clear yes. Same for an important file that ",
    "could be lost: before closing something with unsaved changes, deleting, or overwriting a document ",
    "that looks important (a report, thesis, contract, spreadsheet, or anything named like it matters), ",
    "stop and ask (\"Save this first?\" / \"Delete X — are you sure?\"). When unsure whether something is ",
    "important, treat it as important and ask. Never type passwords, PINs, card numbers or codes.\n",
    "To SHOW the user something — \"where's the…\", \"point at it\", \"what's that blue thing\", ",
    "explaining what's on screen — use \"point\" steps (the hand goes there and circles it, nothing is ",
    "clicked) or \"draw\" steps (circle or box it, an arrow to it, underline it, a short note beside it — ",
    "whatever shows it best), and say \"here it is\" and what it is in `summary`. Several in a row walk ",
    "them through it.\n",
    "LOOK CLOSER instead of guessing. If what you need is small or hard to read — small print, a ",
    "question's answer options, tiny radio buttons or checkboxes, a terminal or code box, a table, a ",
    "dropdown's items, an error message — give no steps and set \"zoom\": [x1,y1,x2,y2] (a box in this ",
    "image around that part). Your next look is that part at full resolution, enlarged, so you can read it ",
    "exactly and click precisely. Never click, choose or type something you can't actually read.\n",
    "SCROLLING, like a person with a mouse: a screen often has several separate scroll areas — the page, a ",
    "side bar, an instructions or question panel, a list, a chat, a code editor, a terminal, a wide table. ",
    "Only the area under the mouse scrolls, so put x,y INSIDE the area you mean (or its target id). A ",
    "scrollbar on an area's edge, text cut off at its bottom or right, or a half-shown row means there's ",
    "more in THAT area. {\"action\":\"scroll\",\"x\":…,\"y\":…,\"key\":\"down\",\"scroll_amount\":5} ",
    "— key is down, up, left or right (sideways for wide tables, timelines, code, carousels), ",
    "scroll_amount the notches (about 3 lines each). If a scroll changed nothing, the mouse was over the ",
    "wrong area or it's already at the end — pick the area's middle, or try the other direction.\n",
    "LABS, TESTS AND PRECISE WORK (uCertify, Cisco/NetAcad, TestOut, Packet Tracer, cloud consoles, a VM, ",
    "a terminal, an online quiz): accuracy beats speed. 1) Read the task instructions first — every step, ",
    "scrolling the instructions panel to its end and zooming in if the text is small — and keep the list ",
    "of steps and which one you're on in `notes`. 2) Do exactly what each step says: the exact names, ",
    "values, paths, IP addresses, commands and options, typed character for character (case, spaces, ",
    "dashes and dots matter). 3) After each command or change, zoom in on the result and read it: an ",
    "error, a typo or \"command not found\" means fix it before moving on. 4) Fields: click the field ",
    "first, clear what's there (ctrl+a) and then type. Drop-downs: open, zoom if needed, pick the exact ",
    "item. 5) Use the lab's own Check or Validate button once every step is done and checked (Submit, ",
    "Finish or End still asks the user first, as below). 6) Multiple choice: read the whole question and every option before choosing; \"select ",
    "two\" means two. Think it through properly and choose the correct answer, not a guess.\n",
    "BIG JOBS ACROSS APPS (an assignment in Word plus Blackboard, a report, research, a project): first ",
    "find and read the brief — open the assignment page, its instructions, rubric and attached files — and ",
    "write the plan in `notes` (the parts, which one you're on, where each file is). Then work part by part ",
    "like a person: switch windows (alt+tab or the taskbar), copy (ctrl+c) and paste (ctrl+v) between them, ",
    "open and save files in the right folder, use right-click menus. When research is needed, open real ",
    "sources and write what you learned in your own words in THEIR document, noting the source — use ",
    "other people's work and examples to learn from, never paste someone else's work in as theirs. If ",
    "they asked you to teach, explain each part as you do it. Save as you go. When it's all done, stop ",
    "before submitting or uploading and ask them to look it over.\n",
    "Steps PASTED from another AI or a guide (\"1. Open Settings 2. Click…\"): follow them in order on ",
    "the real screen, adapting to what's actually there (menus get renamed and move between versions), ",
    "tracking the step number in `notes`; if a step can't be done, say which and why.\n",
    "Reply with JSON only. No prose, no markdown fence. Shape:\n",
    "{\"summary\":\"one short sentence, or the full answer if this was a question\",",
    "\"mood\":\"cheerful\",\"remember\":[],\"notes\":\"plan / what I've learned\",\"done\":false,\"wait\":0,\"zoom\":[x1,y1,x2,y2] only to look closer,",
    "\"steps\":[{\"action\":\"click|double_click|right_click|",
    "type|drag|stroke|hover|scroll|key|copy|point|draw|open_app|open_url|search|play_youtube\",\"target\":int|null,\"target2\":int|null,",
    "\"path\":[[x,y],…] only for stroke,",
    "\"x\":int,\"y\":int,\"x2\":int|null,\"y2\":int|null,",
    "\"text_to_type\":string|null,\"key\":string|null,\"scroll_amount\":int|null,\"shape\":string|null,",
    "\"confidence\":0.0-1.0,\"reasoning\":\"short\"}]}\n",
    "Coordinates are pixels in the image you were given: (0,0) is its top-left corner. ",
    "Keys use names like enter, tab, escape, ctrl+a, ctrl+l, alt+f4, win — and the media keys ",
    "volumeup, volumedown, playpause, nexttrack, prevtrack (they work on whatever is playing). ",
    "Order steps in the order they must run. Prefer the smallest number of steps that does the job. ",
    "Keep it compact: leave out any field you don't need (never write null), and keep `reasoning` ",
    "to a few words."
);

pub struct VisionRequest {
    /// Full screenshot with the marks burned in, already downscaled.
    pub image_jpeg: Vec<u8>,
    pub image_size: (u32, u32),
    /// Desktop region the image covers, for mapping coordinates back.
    pub desktop: Rect,
    pub marks_description: String,
    pub user_prompt: String,
    pub ocr_text: String,
    pub app: String,
    pub window_title: String,
    /// The geometric plan, offered to the model as a starting point.
    pub draft: Vec<ActionStep>,
    /// The real controls in the active window, by number — see
    /// `uia::list_controls`. Rects are in desktop pixels.
    pub controls: Vec<crate::uia::Control>,
    /// What Izuki remembers about the user (`memory::prompt_block`).
    pub memory: String,
    /// Every open app window, front to back (`uia::open_windows`).
    pub windows: Vec<String>,
    /// The page or document's own text, word for word (`uia::document_text`).
    pub page_text: String,
}

impl VisionRequest {
    fn b64(&self) -> String {
        base64::engine::general_purpose::STANDARD.encode(&self.image_jpeg)
    }

    /// The controls list as the model sees it: id, kind, name, and where it
    /// sits in *image* pixels, so a vision model can cross-check it against
    /// the screenshot and a text-only model still knows roughly where it is.
    fn controls_text(&self) -> String {
        if self.controls.is_empty() {
            return String::new();
        }
        let (iw, ih) = self.image_size;
        let fx = iw as f64 / self.desktop.w.max(1) as f64;
        let fy = ih as f64 / self.desktop.h.max(1) as f64;
        let mut s = String::from(
            "Screen parser: Windows accessibility controls. Select \"target\": id from THIS snapshot. Bounds are image pixels, IDs expire on the next look. Match the visible label and bounding box, especially radio answers with repeated names.\n",
        );
        for c in &self.controls {
            let (cx, cy) = c.rect.center();
            let ix = ((cx - self.desktop.x) as f64 * fx).round() as i32;
            let iy = ((cy - self.desktop.y) as f64 * fy).round() as i32;
            let kind = c.kind.to_lowercase();
            let mut extra = String::new();
            let bx = ((c.rect.x - self.desktop.x) as f64 * fx).round() as i32;
            let by = ((c.rect.y - self.desktop.y) as f64 * fy).round() as i32;
            extra.push_str(&format!(" bounds=[{},{},{},{}]", bx, by, bx + (c.rect.w as f64 * fx).round() as i32, by + (c.rect.h as f64 * fy).round() as i32));
            if !c.value.is_empty() {
                extra.push_str(&format!(" = \"{}\"", c.value));
            }
            if c.focused {
                extra.push_str(" (typing goes here now)");
            }
            if c.hidden {
                extra.push_str(" (shows on hover — not visible in the screenshot)");
            }
            if c.below {
                extra.push_str(" (further down the page — target it and Izuki scrolls to it)");
            }
            if c.name.is_empty() {
                s.push_str(&format!("[{}] {} (no label) at {},{}{extra}\n", c.id, kind, ix, iy));
            } else {
                s.push_str(&format!("[{}] {} \"{}\" at {},{}{extra}\n", c.id, kind, c.name, ix, iy));
            }
        }
        s
    }

    fn user_text(&self) -> String {
        let (w, h) = self.image_size;
        let mut s = self.memory.clone();
        s.push_str(&format!("Image is {w}x{h} pixels.\n"));
        s.push_str(&self.controls_text());
        if !self.app.is_empty() {
            s.push_str(&format!("Foreground app: {}\n", self.app));
        }
        if !self.window_title.is_empty() {
            s.push_str(&format!("Window title: {}\n", self.window_title));
        }
        if self.windows.len() > 1 {
            s.push_str(&format!("Open windows (front to back): {}\n", self.windows.join(" | ")));
        }
        if !self.page_text.trim().is_empty() {
            s.push_str(&format!(
                "The text of the page/document in front, read straight from the app (exact wording — trust it over reading pixels):\n{}\n",
                self.page_text.trim()
            ));
        }
        s.push_str(&format!("Marks drawn:\n{}\n", self.marks_description));
        if !self.ocr_text.trim().is_empty() {
            s.push_str(&format!("Text read inside the marks:\n{}\n", self.ocr_text.trim()));
        }
        if !self.draft.is_empty() {
            let draft: Vec<Value> = self
                .draft
                .iter()
                .map(|s| json!({ "action": s.action.as_str(), "x": s.x, "y": s.y }))
                .collect();
            s.push_str(&format!(
                "Plan derived from the geometry alone (correct it if it is wrong):\n{}\n",
                Value::Array(draft)
            ));
        }
        if self.user_prompt.trim().is_empty() {
            s.push_str("The user typed no extra instruction. Infer intent from the marks.");
        } else {
            s.push_str(&format!("The user says: {}", self.user_prompt.trim()));
        }
        s
    }
}

/// How a brain is asked: the full rulebook answered in JSON (big models), or
/// Easy Mode's short menu answered in command lines (small and free ones —
/// see easy.rs).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Style {
    Full,
    Easy,
}

impl Style {
    fn of(cfg: &ProviderConfig) -> Style {
        if crate::easy::is_small(cfg) {
            Style::Easy
        } else {
            Style::Full
        }
    }

    fn system(self) -> &'static str {
        match self {
            Style::Full => SYSTEM_PROMPT,
            Style::Easy => crate::easy::EASY_PROMPT,
        }
    }

    fn user(self, req: &VisionRequest) -> String {
        match self {
            Style::Full => req.user_text(),
            Style::Easy => crate::easy::user_text(req),
        }
    }

    /// Only the full style answers in JSON.
    fn json(self) -> bool {
        self == Style::Full
    }

    /// Said to a text-only model, which gets no screenshot.
    fn no_picture(self) -> &'static str {
        match self {
            Style::Full => "(No screenshot is attached — this model reads text only. Work from the \
                            window title and the numbered controls list, acting on them with \"target\".)",
            Style::Easy => "(No screenshot is attached — work from the numbered controls list.)",
        }
    }
}

/// One web client for every look, shared: it keeps the secure connection to
/// each brain open between requests, so a look doesn't start by connecting
/// all over again (a new client per request paid that every single time).
/// It lives for the whole run, so it's never dropped inside async code.
fn client() -> Result<reqwest::blocking::Client> {
    static CLIENT: std::sync::OnceLock<reqwest::blocking::Client> = std::sync::OnceLock::new();
    if let Some(c) = CLIENT.get() {
        return Ok(c.clone());
    }
    crate::tls_ready();
    // Bounded so a stuck cloud call can't freeze "thinking" for long — the
    // agent checks for a stop between calls, so shorter here means a faster stop.
    let built = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(22))
        .connect_timeout(Duration::from_secs(5))
        .pool_idle_timeout(Duration::from_secs(90))
        .build()
        .context("could not start the HTTP client")?;
    Ok(CLIENT.get_or_init(|| built).clone())
}

/// Open the connection to the first brains now (you've started talking), so
/// the real request finds it ready. Costs one tiny request; never waits.
pub fn warm_up() {
    static LAST: parking_lot::Mutex<Option<Instant>> = parking_lot::Mutex::new(None);
    {
        let mut last = LAST.lock();
        // A warm connection stays open about a minute and a half.
        if last.is_some_and(|t| t.elapsed() < Duration::from_secs(45)) {
            return;
        }
        *last = Some(Instant::now());
    }
    std::thread::spawn(|| {
        let Ok(c) = client() else { return };
        for cfg in crate::brain::brain_chain().into_iter().take(2) {
            if cfg.id.is_local() {
                continue;
            }
            let base = cfg.base_url.trim_end_matches('/').to_string();
            let _ = c.head(&base).timeout(Duration::from_secs(5)).send();
        }
    });
}

/// Ask a provider to turn the marks into a plan.
pub fn ask(cfg: &ProviderConfig, req: &VisionRequest) -> Result<VisionPlan> {
    let started = Instant::now();
    let style = Style::of(cfg);
    let raw = match cfg.id {
        ProviderId::Ollama => ask_ollama(cfg, req, style)?,
        ProviderId::Gemini => ask_gemini(cfg, req, style)?,
        ProviderId::Anthropic => ask_anthropic(cfg, req, style)?,
        // OpenRouter, OpenAI, NVIDIA NIM, 9Router and anything self-hosted
        // all speak this shape.
        ProviderId::Openrouter
        | ProviderId::Openai
        | ProviderId::Nvidia
        | ProviderId::NineRouter
        | ProviderId::Xai
        | ProviderId::Groq
        | ProviderId::Mistral
        | ProviderId::Meta
        | ProviderId::Custom => ask_openai_compatible(cfg, req, style)?,
    };

    // Command lines (Easy Mode — or any model that answered that way).
    let cleaned = strip_thinking(&raw);
    let lines = crate::easy::parse(&cleaned, req, style == Style::Easy);
    if lines.any && (style == Style::Easy || extract_json(&cleaned).is_none()) {
        return Ok(plan_from_lines(cfg, req, lines, started));
    }

    let (mut steps, summary) = parse_plan(&raw)?;
    let (mood, remember) = parse_extras(&raw);
    // "more": true (the older way to say it) means not done yet too.
    let more = parse_more(&raw);
    let (done, wait) = parse_progress(&raw);
    let notes = parse_notes(&raw);
    let ask = parse_ask(&raw);
    let zoom = parse_zoom(&raw, req);
    // Remember which steps came with a point of their own *before* rescale
    // turns (0,0) into a real-looking desktop position.
    let had_point: Vec<bool> = steps.iter().map(|s| s.x != 0 || s.y != 0).collect();
    rescale(&mut steps, req);
    resolve_targets(&mut steps, &req.controls, &had_point);

    Ok(VisionPlan {
        steps,
        summary,
        provider: cfg.id.as_str().to_string(),
        model: cfg.model.clone(),
        latency_ms: started.elapsed().as_millis() as u64,
        mood,
        remember,
        more,
        ask,
        done: done && !more,
        wait,
        notes,
        zoom,
    })
}

/// A plan from Easy Mode's command lines: steps mapped onto the desktop and
/// pinned to the real controls, like the JSON path.
fn plan_from_lines(cfg: &ProviderConfig, req: &VisionRequest, reply: crate::easy::Reply, started: Instant) -> VisionPlan {
    let mut steps = reply.steps;
    let had_point: Vec<bool> = steps.iter().map(|s| s.x != 0 || s.y != 0).collect();
    rescale(&mut steps, req);
    resolve_targets(&mut steps, &req.controls, &had_point);
    let summary = reply.say.unwrap_or_else(|| {
        if !steps.is_empty() {
            "On it.".to_string()
        } else if reply.done {
            "Done.".to_string()
        } else {
            String::new()
        }
    });
    VisionPlan {
        summary: spoken_line(&summary, &steps),
        steps,
        provider: cfg.id.as_str().to_string(),
        model: cfg.model.clone(),
        latency_ms: started.elapsed().as_millis() as u64,
        ask: reply.ask,
        done: reply.done,
        wait: reply.wait,
        remember: reply.remember,
        ..Default::default()
    }
}

/// A region the model wants to look at up close: `"zoom":[x1,y1,x2,y2]` in
/// image pixels (or an object with x,y,x2,y2), mapped to desktop pixels.
/// Too small or covering nearly the whole picture means nothing to gain.
fn parse_zoom(raw: &str, req: &VisionRequest) -> Option<Rect> {
    let cleaned = strip_thinking(raw);
    let v = extract_json(&cleaned).and_then(|s| serde_json::from_str::<Value>(s).ok())?;
    let z = &v["zoom"];
    let n = |k: &Value| k.as_f64();
    let (x1, y1, x2, y2) = if let Some(a) = z.as_array() {
        (n(a.first()?)?, n(a.get(1)?)?, n(a.get(2)?)?, n(a.get(3)?)?)
    } else if z.is_object() {
        (n(&z["x"])?, n(&z["y"])?, n(&z["x2"])?, n(&z["y2"])?)
    } else {
        return None;
    };
    let (iw, ih) = req.image_size;
    if iw == 0 || ih == 0 {
        return None;
    }
    let (x1, x2) = (x1.min(x2).max(0.0), x1.max(x2).min(iw as f64));
    let (y1, y2) = (y1.min(y2).max(0.0), y1.max(y2).min(ih as f64));
    let (w, h) = (x2 - x1, y2 - y1);
    if w < 24.0 || h < 24.0 || w * h > 0.8 * iw as f64 * ih as f64 {
        return None;
    }
    let fx = req.desktop.w as f64 / iw as f64;
    let fy = req.desktop.h as f64 / ih as f64;
    Some(Rect {
        x: (x1 * fx).round() as i32 + req.desktop.x,
        y: (y1 * fy).round() as i32 + req.desktop.y,
        w: (w * fx).round() as i32,
        h: (h * fy).round() as i32,
    })
}

/// The agent's working notes, if it kept any.
fn parse_notes(raw: &str) -> Option<String> {
    let cleaned = strip_thinking(raw);
    extract_json(&cleaned)
        .and_then(|s| serde_json::from_str::<Value>(s).ok())
        .and_then(|v| v["notes"].as_str().map(|n| n.trim().chars().take(400).collect::<String>()))
        .filter(|n| !n.is_empty() && n != "plan / what I've learned")
}

/// `done` (the goal is reached) and `wait` (seconds before the next look,
/// capped at 20) from the model's reply.
fn parse_progress(raw: &str) -> (bool, u32) {
    let cleaned = strip_thinking(raw);
    let Some(v) = extract_json(&cleaned).and_then(|s| serde_json::from_str::<Value>(s).ok()) else {
        return (false, 0);
    };
    let done = v["done"].as_bool().unwrap_or(false);
    let wait = v["wait"].as_f64().map(|w| w.clamp(0.0, 20.0) as u32).unwrap_or(0);
    (done, wait)
}

/// The question the model asks when it needs the user to show it something.
fn parse_ask(raw: &str) -> Option<String> {
    let cleaned = strip_thinking(raw);
    extract_json(&cleaned)
        .and_then(|s| serde_json::from_str::<Value>(s).ok())
        .and_then(|v| v["ask"].as_str().map(|q| q.trim().to_string()))
        .filter(|q| !q.is_empty())
}

/// Whether the model said the task carries on after these steps.
fn parse_more(raw: &str) -> bool {
    let cleaned = strip_thinking(raw);
    extract_json(&cleaned)
        .and_then(|s| serde_json::from_str::<Value>(s).ok())
        .and_then(|v| v["more"].as_bool())
        .unwrap_or(false)
}

/// Cheap reachability check for the settings screen.
pub fn probe(cfg: &ProviderConfig) -> Result<String> {
    let c = client()?;
    let base = cfg.base_url.trim_end_matches('/');

    match cfg.id {
        ProviderId::Ollama => {
            let base = base.trim_end_matches("/v1").trim_end_matches("/api");
            let res = c
                .get(format!("{base}/api/tags"))
                .send()
                .context("Ollama isn't running — start the Ollama app (or install it from ollama.com)")?;
            if !res.status().is_success() {
                return Err(anyhow!("Ollama answered {}", res.status()));
            }
            let body: Value = res.json()?;
            let names: Vec<String> = body["models"]
                .as_array()
                .map(|a| {
                    a.iter()
                        .filter_map(|m| m["name"].as_str().map(str::to_string))
                        .collect()
                })
                .unwrap_or_default();

            if names.is_empty() {
                return Ok("ok — Ollama is running, but no models are pulled yet. Try: ollama pull moondream".into());
            }
            let has = names.iter().any(|n| n.starts_with(&cfg.model));
            if has {
                Ok(format!("ok — {} is ready", cfg.model))
            } else {
                Ok(format!(
                    "ok — Ollama is running, but {} is not pulled. Available: {}",
                    cfg.model,
                    names.join(", ")
                ))
            }
        }
        ProviderId::NineRouter => {
            // 9Router holds its own upstream credentials in its local
            // dashboard — Izuki doesn't need a key for the local hop itself.
            let mut rq = c.get(format!("{base}/models"));
            if !cfg.api_key.trim().is_empty() {
                rq = rq.bearer_auth(cfg.api_key.trim());
            }
            let res = rq.send().context(
                "9Router is not reachable — is it running? (`9router` in a terminal starts it)",
            )?;
            if res.status().is_success() {
                Ok(format!("ok — 9Router is running, using {}", cfg.model))
            } else {
                Err(anyhow!("9Router answered {}", res.status()))
            }
        }
        // Local servers (LM Studio, llama.cpp, vLLM…) usually need no key.
        _ if cfg.api_key.trim().is_empty() && !cfg.id.is_local() => {
            Err(anyhow!("add an API key first"))
        }
        ProviderId::Gemini => {
            // Key in a header, not the URL — URLs end up in error messages
            // and logs.
            let res = c.get(format!("{base}/v1beta/models")).header("x-goog-api-key", cfg.api_key.trim()).send()?;
            if res.status().is_success() {
                Ok(format!("ok — key accepted, using {}", cfg.model))
            } else {
                Err(anyhow!("Gemini answered {}", res.status()))
            }
        }
        ProviderId::Anthropic => {
            let res = c
                .get(format!("{base}/models"))
                .header("x-api-key", cfg.api_key.trim())
                .header("anthropic-version", "2023-06-01")
                .send()
                ?;
            if res.status().is_success() {
                Ok(format!("ok — key accepted, using {}", cfg.model))
            } else {
                Err(anyhow!("Anthropic answered {}", res.status()))
            }
        }
        _ => {
            let mut rq = c.get(format!("{base}/models"));
            if !cfg.api_key.trim().is_empty() {
                rq = rq.bearer_auth(cfg.api_key.trim());
            }
            let res = rq.send().with_context(|| format!("nothing answered at {base} — is it running?"))?;
            let status = res.status();
            if !status.is_success() {
                return Err(match status.as_u16() {
                    401 | 403 => anyhow!("the key was rejected ({status}) — copy it again, whole"),
                    _ => anyhow!("endpoint answered {status}"),
                });
            }
            // The key works; check the model is one this account can use,
            // and name the ones it can if not (a typo'd or retired model is
            // the usual reason a "working" key still gets no answers).
            let body: Value = res.json().unwrap_or(Value::Null);
            let ids: Vec<String> = body["data"]
                .as_array()
                .map(|a| a.iter().filter_map(|m| m["id"].as_str().map(str::to_string)).collect())
                .unwrap_or_default();
            Ok(model_check(&cfg.model, &ids))
        }
    }
}

/// "ok — …" when `model` is among `ids` (or there's no list to check),
/// otherwise which ones the account does have.
fn model_check(model: &str, ids: &[String]) -> String {
    let m = model.trim();
    if ids.is_empty() || ids.iter().any(|i| i == m || i.ends_with(&format!("/{m}"))) {
        return format!("ok — key accepted, using {m}");
    }
    let mut some: Vec<&str> = ids.iter().map(String::as_str).collect();
    some.sort_unstable();
    let list = some.iter().take(12).copied().collect::<Vec<_>>().join(", ");
    format!("key accepted, but \"{m}\" isn't on this account — set Model to one of: {list}")
}

#[cfg(test)]
mod probe_tests {
    use super::model_check;

    #[test]
    fn names_the_models_when_the_one_set_is_missing() {
        let ids = vec!["grok-4".to_string(), "grok-3-mini".to_string()];
        assert!(model_check("grok-4", &ids).starts_with("ok"));
        let msg = model_check("grok-9", &ids);
        assert!(!msg.starts_with("ok") && msg.contains("grok-3-mini"), "{msg}");
        assert!(model_check("anything", &[]).starts_with("ok"));
    }
}

// ---------------------------------------------------------------------------
// Wire formats
// ---------------------------------------------------------------------------

fn ask_ollama(cfg: &ProviderConfig, req: &VisionRequest, style: Style) -> Result<String> {
    let base = cfg.base_url.trim_end_matches('/').trim_end_matches("/v1").trim_end_matches("/api");
    // A model on the PC itself may have to load into memory first, and runs
    // slower than a data centre — give it minutes, not seconds.
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(240))
        .connect_timeout(Duration::from_secs(4))
        .build()
        .context("could not start the HTTP client")?;
    let send = |with_image: bool| -> Result<(reqwest::StatusCode, Value)> {
        let mut body = json!({
            "model": cfg.model,
            "prompt": format!("{}\n\n{}", style.system(), style.user(req)),
            "stream": false,
            "options": { "temperature": 0.1, "num_predict": 1500 }
        });
        if style.json() {
            body["format"] = json!("json");
        }
        if with_image {
            body["images"] = json!([req.b64()]);
        } else {
            body["prompt"] = json!(format!("{}\n\n{}\n{}", style.system(), style.user(req), style.no_picture()));
        }
        let res = client
            .post(format!("{base}/api/generate"))
            .json(&body)
            .send()
            .context("Ollama is not reachable — is the Ollama app running?")?;
        let status = res.status();
        let text = res.text().unwrap_or_default();
        let value = serde_json::from_str(&text).unwrap_or_else(|_| json!({ "error": text.trim() }));
        Ok((status, value))
    };

    let (mut status, mut value) = send(true)?;
    // A text-only local model (llama3.2, qwen…) refuses pictures; the
    // controls list is enough for it to act.
    let refuses_pictures = |v: &Value| {
        v["error"].as_str().is_some_and(|e| {
            let e = e.to_lowercase();
            e.contains("image") || e.contains("vision") || e.contains("missing data")
        })
    };
    if !status.is_success() && refuses_pictures(&value) {
        (status, value) = send(false)?;
    }
    if !status.is_success() {
        let err = value["error"].as_str().unwrap_or("unknown error");
        if status.as_u16() == 404 || err.contains("not found") {
            return Err(anyhow!(
                "Ollama doesn't have the model \"{}\" yet — run `ollama pull {}` once, then try again.",
                cfg.model,
                cfg.model
            ));
        }
        return Err(anyhow!("Ollama answered {status}: {err}"));
    }
    Ok(value["response"].as_str().unwrap_or_default().to_string())
}

/// Google's own "always the current one" names. Fixed version names get
/// retired ("Gemini 2.5 Flash is no longer available to new users" broke
/// every new install), while these keep pointing at the newest Flash models.
pub const GEMINI_MAIN: &str = "gemini-flash-latest";
pub const GEMINI_LITE: &str = "gemini-flash-lite-latest";

/// The saved name, or its always-current stand-in if it's an old fixed
/// version (1.5 / 2.0 / 2.5 Flash) that Google is retiring.
pub fn gemini_current(model: &str) -> String {
    let m = model.trim();
    let old = m.starts_with("gemini-2.0-flash") || m.starts_with("gemini-2.5-flash") || m.starts_with("gemini-1.5-flash");
    match (old, m.contains("lite")) {
        (true, true) => GEMINI_LITE.into(),
        (true, false) => GEMINI_MAIN.into(),
        _ => m.to_string(),
    }
}

/// Models that refused the "don't think first" setting (each newer model
/// takes a different one, and some take none): asked without it from then on.
static NO_THINK_KNOB: parking_lot::Mutex<Vec<(String, NoThink)>> = parking_lot::Mutex::new(Vec::new());

/// How to ask a Gemini Flash model to answer without "thinking" first.
/// Gemini 2.5 takes `thinkingBudget: 0`; the 3.x models refuse it ("invalid
/// argument") and take `thinkingLevel: "minimal"` instead. Dropping the
/// setting altogether — what Izuki used to do on a refusal — left every newer
/// model thinking at full length on every look.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum NoThink {
    Budget,
    Level,
    Neither,
}

impl NoThink {
    /// For `generationConfig.thinkingConfig` (Gemini's own API).
    pub fn thinking_config(self) -> Option<Value> {
        match self {
            NoThink::Budget => Some(json!({ "thinkingBudget": 0 })),
            NoThink::Level => Some(json!({ "thinkingLevel": "minimal" })),
            NoThink::Neither => None,
        }
    }

    /// For `reasoning_effort` (Gemini's OpenAI-compatible endpoint).
    pub fn reasoning_effort(self) -> Option<&'static str> {
        match self {
            NoThink::Budget => Some("none"),
            NoThink::Level => Some("minimal"),
            NoThink::Neither => None,
        }
    }
}

/// The no-thinking setting to try with this model right now.
pub fn gemini_no_think(model: &str) -> NoThink {
    if !model.contains("flash") {
        return NoThink::Neither; // Pro models can't switch it off
    }
    NO_THINK_KNOB.lock().iter().find(|(m, _)| m == model).map(|(_, k)| *k).unwrap_or(NoThink::Budget)
}

/// The model refused `tried` (a 400): the next setting from now on. Returns it.
pub fn gemini_refused_no_think(model: &str, tried: NoThink) -> NoThink {
    let next = match tried {
        NoThink::Budget => NoThink::Level,
        NoThink::Level | NoThink::Neither => NoThink::Neither,
    };
    eprintln!("[brain] {model} refused the {tried:?} no-thinking setting; trying {next:?}");
    let mut knobs = NO_THINK_KNOB.lock();
    knobs.retain(|(m, _)| m != model);
    knobs.push((model.to_string(), next));
    next
}

/// Gemini's main Flash model is out of free quota until this time.
static GEMINI_MAIN_TIRED: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);

/// The Gemini model to ask right now: the chosen one, or Flash-Lite while
/// the main Flash model's quota is used up.
pub fn gemini_model_now(model: &str) -> String {
    let tired = GEMINI_MAIN_TIRED.lock().map(|t| t > std::time::Instant::now()).unwrap_or(false);
    if tired && model.contains("flash") && !model.contains("lite") {
        GEMINI_LITE.into()
    } else {
        model.to_string()
    }
}

/// The main Flash model said "quota exceeded": rest it for an hour.
pub fn gemini_main_tired() {
    *GEMINI_MAIN_TIRED.lock() = Some(std::time::Instant::now() + std::time::Duration::from_secs(60 * 60));
}

fn ask_gemini(cfg: &ProviderConfig, req: &VisionRequest, style: Style) -> Result<String> {
    let now_model = gemini_model_now(&cfg.model);
    if now_model != cfg.model {
        let mut lite = cfg.clone();
        lite.model = now_model;
        return ask_gemini_as(&lite, req, style);
    }
    ask_gemini_as(cfg, req, style)
}

fn ask_gemini_as(cfg: &ProviderConfig, req: &VisionRequest, style: Style) -> Result<String> {
    let base = cfg.base_url.trim_end_matches('/');
    let key = cfg.api_key.trim();
    if key.is_empty() {
        return Err(anyhow!("Gemini needs an API key"));
    }

    let url = format!("{base}/v1beta/models/{}:generateContent", cfg.model);
    let mut body = json!({
        "systemInstruction": { "parts": [{ "text": style.system() }] },
        "contents": [{
            "role": "user",
            "parts": [
                { "text": style.user(req) },
                { "inline_data": { "mime_type": "image/jpeg", "data": req.b64() } }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 2000
        }
    });
    if style.json() {
        body["generationConfig"]["responseMimeType"] = json!("application/json");
    }
    // Flash models "think" first by default — seconds (or a timeout) before
    // a word of the plan. Reading a screenshot and picking a click doesn't
    // need it. (Pro models can't switch it off.)
    let knob = gemini_no_think(&cfg.model);
    if let Some(config) = knob.thinking_config() {
        body["generationConfig"]["thinkingConfig"] = config;
    }

    let res = client()?.post(url).header("x-goog-api-key", key).json(&body).send()?;
    let status = res.status();
    let value: Value = res.json()?;
    if status.as_u16() == 400 && knob != NoThink::Neither {
        gemini_refused_no_think(&cfg.model, knob);
        return ask_gemini_as(cfg, req, style);
    }
    // Out of free quota (429) or overloaded (503) on the main Flash model:
    // the lighter one has its own allowance, reads screenshots too, and is
    // quicker.
    if matches!(status.as_u16(), 429 | 503) && cfg.model.contains("flash") && !cfg.model.contains("lite") {
        eprintln!("[brain] {} answered {status} — trying {GEMINI_LITE}", cfg.model);
        if status.as_u16() == 429 && value.to_string().to_lowercase().contains("quota") {
            gemini_main_tired();
        }
        let mut lite = cfg.clone();
        lite.model = GEMINI_LITE.into();
        return ask_gemini_as(&lite, req, style);
    }
    if !status.is_success() {
        return Err(anyhow!(
            "Gemini answered {status}: {}",
            value["error"]["message"].as_str().unwrap_or("unknown error")
        ));
    }
    Ok(value["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or_default()
        .to_string())
}

fn ask_anthropic(cfg: &ProviderConfig, req: &VisionRequest, style: Style) -> Result<String> {
    let base = cfg.base_url.trim_end_matches('/');
    let key = cfg.api_key.trim();
    if key.is_empty() {
        return Err(anyhow!("Anthropic needs an API key"));
    }

    let body = json!({
        "model": cfg.model,
        "max_tokens": 2000,
        "temperature": 0.1,
        "system": style.system(),
        "messages": [{
            "role": "user",
            // The words first, then the picture: knowing what to look for
            // before seeing the screenshot makes clicks land more accurately
            // (Anthropic's computer-use guidance).
            "content": [
                { "type": "text", "text": style.user(req) },
                { "type": "image", "source": {
                    "type": "base64", "media_type": "image/jpeg", "data": req.b64() } }
            ]
        }]
    });

    let res = client()?
        .post(format!("{base}/messages"))
        .header("x-api-key", key)
        .header("anthropic-version", "2023-06-01")
        .json(&body)
        .send()
        ?;

    let status = res.status();
    let value: Value = res.json()?;
    if !status.is_success() {
        return Err(anyhow!(
            "Anthropic answered {status}: {}",
            value["error"]["message"].as_str().unwrap_or("unknown error")
        ));
    }
    Ok(value["content"][0]["text"].as_str().unwrap_or_default().to_string())
}

fn ask_openai_compatible(cfg: &ProviderConfig, req: &VisionRequest, style: Style) -> Result<String> {
    let base = cfg.base_url.trim_end_matches('/');
    let client = client()?;
    let image = format!("data:image/jpeg;base64,{}", req.b64());
    let text = style.user(req);

    let send = |json_mode: bool, with_image: bool| -> Result<(reqwest::StatusCode, Value)> {
        let user = if with_image {
            json!([
                { "type": "text", "text": text },
                { "type": "image_url", "image_url": { "url": image } }
            ])
        } else {
            // A text-only chat model can't see the screenshot — but with the
            // numbered controls list it can still act precisely by id.
            json!(format!("{text}\n{}", style.no_picture()))
        };
        let mut body = json!({
            "model": cfg.model,
            "temperature": 0.1,
            "max_tokens": 2000,
            "messages": [
                { "role": "system", "content": style.system() },
                { "role": "user", "content": user }
            ]
        });
        if json_mode {
            body["response_format"] = json!({ "type": "json_object" });
        }

        let mut rq = client.post(format!("{base}/chat/completions")).json(&body);
        if !cfg.api_key.trim().is_empty() {
            rq = rq.bearer_auth(cfg.api_key.trim());
        }
        if cfg.id == ProviderId::Openrouter {
            // OpenRouter uses these for attribution on its public leaderboards.
            rq = rq
                .header("HTTP-Referer", "https://github.com/nova-izuki/izuki")
                .header("X-Title", "Izuki");
        }

        let res = rq.send()?;
        let status = res.status();
        // Read as text first: proxies and some free endpoints answer errors
        // in plain text or HTML, and a JSON decode failure would hide the
        // actual reason behind "error decoding response body".
        let text = res.text().unwrap_or_default();
        let value = serde_json::from_str(&text).unwrap_or_else(|_| json!({ "error": text.trim() }));
        Ok((status, value))
    };

    // JSON mode first; plenty of free models reject `response_format`
    // outright with a 400/422, and the prompt already demands JSON anyway
    // (the parser tolerates chatter around it), so just ask again without.
    let (mut status, mut value) = send(style.json(), true)?;
    if style.json() && (status.as_u16() == 400 || status.as_u16() == 422) {
        (status, value) = send(false, true)?;
    }
    // Still refused, and the reason is the picture itself — a text-only chat
    // model. Try once more without the screenshot; the controls list is
    // enough for it to act.
    if !status.is_success() && !req.controls.is_empty() && rejects_images(status, &value) {
        (status, value) = send(false, false)?;
    }

    if !status.is_success() {
        let msg = value["error"]["message"]
            .as_str()
            .or_else(|| value["error"].as_str())
            .map(|m| truncate(m, 300))
            .unwrap_or_else(|| "unknown error".into());
        return Err(match status.as_u16() {
            401 | 403 => anyhow!(
                "{} rejected the API key ({status}): {msg}. Re-check it was pasted in full with \
                 no extra spaces, and that it's still active on the provider's dashboard.",
                cfg.id.as_str()
            ),
            404 => anyhow!(
                "{} doesn't know the model \"{}\" ({status}): {msg}. Check the exact model name \
                 on the provider's model list.",
                cfg.id.as_str(),
                cfg.model
            ),
            429 => anyhow!(
                "{} is rate-limiting you ({status}): {msg}. Free tiers have tight per-minute \
                 limits — wait a moment, or set a fallback brain in Settings.",
                cfg.id.as_str()
            ),
            _ => anyhow!("{} answered {status}: {msg}", cfg.id.as_str()),
        });
    }
    Ok(value["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or_default()
        .to_string())
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/// Pull the first balanced JSON object out of a model reply, tolerating
/// markdown fences and the chatter some small local models add.
fn extract_json(raw: &str) -> Option<&str> {
    let bytes = raw.as_bytes();
    let start = raw.find('{')?;
    let mut depth = 0i32;
    let mut in_string = false;
    let mut escaped = false;

    for i in start..bytes.len() {
        let c = bytes[i] as char;
        if in_string {
            if escaped {
                escaped = false;
            } else if c == '\\' {
                escaped = true;
            } else if c == '"' {
                in_string = false;
            }
            continue;
        }
        match c {
            '"' => in_string = true,
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(&raw[start..=i]);
                }
            }
            _ => {}
        }
    }
    None
}

/// Whether an error response is a model saying it can't take image input.
fn rejects_images(status: reqwest::StatusCode, value: &Value) -> bool {
    if !matches!(status.as_u16(), 400 | 404 | 415 | 422 | 500) {
        return false;
    }
    let msg = value["error"]["message"]
        .as_str()
        .or_else(|| value["error"].as_str())
        .unwrap_or_default()
        .to_lowercase();
    ["image", "vision", "multimodal", "multi-modal", "image_url"]
        .iter()
        .any(|w| msg.contains(w))
}

/// Drop `<think>…</think>` reasoning blocks some free models prepend.
fn strip_thinking(raw: &str) -> String {
    let mut out = raw.to_string();
    while let (Some(a), Some(b)) = (out.find("<think>"), out.find("</think>")) {
        if b < a {
            break;
        }
        out.replace_range(a..b + "</think>".len(), "");
    }
    out.trim().to_string()
}

/// How a spoken reply can sound. Anything else a model says is ignored.
pub const MOODS: &[&str] = &["cheerful", "excited", "calm", "serious", "sympathetic", "playful", "curious"];

/// The optional extras beside the plan: the reply's `mood`, and any lasting
/// facts to `remember`. Missing or malformed is fine — both just go empty.
fn parse_extras(raw: &str) -> (Option<String>, Vec<String>) {
    let cleaned = strip_thinking(raw);
    let Some(value) = extract_json(&cleaned).and_then(|s| serde_json::from_str::<Value>(s).ok()) else {
        return (None, Vec::new());
    };
    let mood = value["mood"]
        .as_str()
        .map(|m| m.trim().to_ascii_lowercase())
        .filter(|m| MOODS.contains(&m.as_str()));
    let remember = value["remember"]
        .as_array()
        .map(|facts| {
            facts
                .iter()
                .filter_map(Value::as_str)
                .map(|f| f.trim().to_string())
                .filter(|f| !f.is_empty())
                .take(5)
                .collect()
        })
        .unwrap_or_default();
    (mood, remember)
}

/// A reply that is JSON but broken — usually cut off mid-way by the output
/// limit. Never read raw JSON aloud: rescue the summary and every complete
/// step before the cut, or report it plainly. `None` = it isn't JSON at all
/// (just prose), which the caller handles as an answer.
fn salvage(text: &str) -> Option<Result<(Vec<ActionStep>, String)>> {
    let t = text.trim_start();
    let looks_json = t.starts_with('{') || t.starts_with('[') || t.contains("\"summary\"") || t.contains("\"action\"");
    if !looks_json {
        return None;
    }
    let summary = json_string_after(text, "\"summary\"");
    let steps = text
        .find("\"steps\"")
        .map(|at| complete_objects(&text[at..]))
        .unwrap_or_default()
        .into_iter()
        .filter_map(|o| serde_json::from_str::<ActionStep>(o).ok())
        .collect::<Vec<_>>();
    Some(match summary {
        Some(s) if !s.trim().is_empty() => Ok((steps, s)),
        _ if !steps.is_empty() => Ok((steps, "On it.".to_string())),
        _ => Err(anyhow!("the AI's answer got cut off — try again, or pick a different model")),
    })
}

/// The JSON string value after `key` (e.g. `"summary"`), escapes decoded.
fn json_string_after(text: &str, key: &str) -> Option<String> {
    let rest = &text[text.find(key)? + key.len()..];
    let rest = rest.trim_start().strip_prefix(':')?.trim_start().strip_prefix('"')?;
    let mut out = String::new();
    let mut chars = rest.chars();
    while let Some(c) = chars.next() {
        match c {
            '"' => return Some(out),
            '\\' => match chars.next()? {
                'n' => out.push(' '),
                't' => out.push(' '),
                'u' => {
                    let hex: String = chars.by_ref().take(4).collect();
                    if let Some(ch) = u32::from_str_radix(&hex, 16).ok().and_then(char::from_u32) {
                        out.push(ch);
                    }
                }
                other => out.push(other),
            },
            c => out.push(c),
        }
    }
    // Cut off inside the summary itself: keep what arrived.
    (!out.is_empty()).then_some(out)
}

/// Every complete `{…}` object at the top level of the first array in
/// `text` — the steps that arrived whole before a reply was cut off.
fn complete_objects(text: &str) -> Vec<&str> {
    let Some(open) = text.find('[') else { return Vec::new() };
    let bytes = text.as_bytes();
    let mut out = Vec::new();
    let (mut depth, mut start, mut in_str, mut esc) = (0i32, 0usize, false, false);
    for i in open + 1..bytes.len() {
        let c = bytes[i] as char;
        if in_str {
            if esc {
                esc = false;
            } else if c == '\\' {
                esc = true;
            } else if c == '"' {
                in_str = false;
            }
            continue;
        }
        match c {
            '"' => in_str = true,
            '{' => {
                if depth == 0 {
                    start = i;
                }
                depth += 1;
            }
            '}' => {
                depth -= 1;
                if depth == 0 {
                    out.push(&text[start..=i]);
                }
            }
            ']' if depth == 0 => break,
            _ => {}
        }
    }
    out
}

fn parse_plan(raw: &str) -> Result<(Vec<ActionStep>, String)> {
    let cleaned = strip_thinking(raw);

    // Free models don't always follow "JSON only" — often they just answer
    // in sentences. That's still a perfectly good answer to a question, so
    // say it back instead of failing (and reading an error message aloud).
    let plain = |text: &str| -> Result<(Vec<ActionStep>, String)> {
        let text = text.trim().trim_matches('`').trim();
        if text.is_empty() {
            Err(anyhow!("the model returned an empty reply"))
        } else {
            Ok((Vec::new(), text.to_string()))
        }
    };

    let Some(slice) = extract_json(&cleaned) else {
        return salvage(&cleaned).unwrap_or_else(|| plain(&cleaned));
    };
    let Ok(value) = serde_json::from_str::<Value>(slice) else {
        return salvage(&cleaned).unwrap_or_else(|| plain(&cleaned));
    };

    let summary = value["summary"]
        .as_str()
        .unwrap_or("Plan ready.")
        .to_string();

    // Accept {steps:[...]}, a bare array, or a single step object.
    let step_values: Vec<Value> = if let Some(arr) = value["steps"].as_array() {
        arr.clone()
    } else if let Some(arr) = value.as_array() {
        arr.clone()
    } else if value.get("action").is_some() {
        vec![value.clone()]
    } else {
        Vec::new()
    };

    let steps: Vec<ActionStep> = step_values
        .into_iter()
        .filter_map(|v| serde_json::from_value::<ActionStep>(v).ok())
        .collect();

    // Empty steps is a valid, successful reply now — it's how the model
    // answers a question instead of performing an action. Only treat it as
    // a failure when there's nothing at all to show for the call, i.e. no
    // real summary either.
    let has_summary = value["summary"].as_str().is_some_and(|s| !s.trim().is_empty());
    if steps.is_empty() && !has_summary {
        // Valid JSON, wrong shape — models improvise key names. Take the
        // first thing that reads like an answer before giving up.
        for key in ["answer", "response", "reply", "text", "message", "content"] {
            if let Some(s) = value[key].as_str().filter(|s| !s.trim().is_empty()) {
                return Ok((Vec::new(), s.trim().to_string()));
            }
        }
        return Err(anyhow!("the model returned nothing usable"));
    }
    let summary = spoken_line(&summary, &steps);
    Ok((steps, summary))
}

/// The spoken `summary` must never be a narrated plan ("Step 1… Step 2…"): it's
/// read aloud and shown on screen, and hearing Izuki recite its own steps is
/// exactly the "it keeps telling me instead of doing it" failure. Some models
/// leak their thinking there anyway, so if the line reads like an enumerated
/// plan, replace it with the one short thing a person would actually say.
fn spoken_line(summary: &str, steps: &[ActionStep]) -> String {
    let l = summary.to_lowercase();
    let numbered = (1..=9).filter(|n| l.contains(&format!("step {n}"))).count();
    if numbered < 2 {
        return summary.to_string();
    }
    if steps.is_empty() {
        "Let me take care of that.".to_string()
    } else {
        "On it.".to_string()
    }
}

/// Pin every step that names a control id to that control's real centre,
/// then drop pointer steps left with no genuine position — a made-up target
/// number and no coordinates of its own. Clicking wherever (0,0) lands is
/// the one thing worse than doing nothing.
/// Whether a drawn shape is a rectangle around a thing (two corners from the
/// real control) rather than a point or a free label. A `note` is words
/// written at a spot, so it keeps the centre.
fn drawn_as_box(shape: Option<&str>) -> bool {
    !matches!(shape.map(str::trim), Some("note"))
}

/// A circle, box, underline or arrow that names the words it goes round
/// (`text_to_type`) — placed by finding those words on screen.
pub fn marks_words(s: &ActionStep) -> bool {
    s.shape.as_deref() != Some("note") && s.text_to_type.as_deref().is_some_and(|t| !t.trim().is_empty())
}

/// A note with words but no place of its own — written under the words
/// marked just before it (brain::anchor_marks).
pub fn note_to_place(s: &ActionStep) -> bool {
    s.shape.as_deref() == Some("note") && s.x == 0 && s.y == 0 && s.text_to_type.as_deref().is_some_and(|t| !t.trim().is_empty())
}

fn resolve_targets(steps: &mut Vec<ActionStep>, controls: &[crate::uia::Control], had_point: &[bool]) {
    let find = |id: u32| controls.iter().find(|c| c.id == id);
    let mut keep = Vec::with_capacity(steps.len());

    for (i, s) in steps.iter_mut().enumerate() {
        // Only the parser can establish identity. Model-supplied metadata
        // must never make an arbitrary pixel count as a verified control.
        s.grounding = None;
        s.snapped_to = None;
        s.hover_first = false;
        s.scroll_first = false;
let mut pinned = false;
        if let Some(c) = s.target.and_then(|id| find(id)) {
            let (cx, cy) = c.rect.center();
            // A box, circle, underline or arrow is a rectangle drawn *around*
            // something — two corners, not a point. Snapping only the first
            // corner to the centre left the model's guessed second corner in
            // place, so the shape landed small, lopsided or on the wrong thing.
            // Taking both corners from the real bounds is what makes underlining
            // and boxing land on the text they were aimed at.
            if s.action == Intent::Draw && drawn_as_box(s.shape.as_deref()) {
                s.x = c.rect.x;
                s.y = c.rect.y;
                s.x2 = Some(c.rect.x + c.rect.w);
                s.y2 = Some(c.rect.y + c.rect.h);
            } else {
                s.x = cx;
                s.y = cy;
            }
            s.snapped_to = Some(if c.name.is_empty() { c.kind.clone() } else { c.name.clone() });
            s.hover_first = c.hidden;
            s.scroll_first = c.below;
            s.grounding = c.identity.clone();
            pinned = true;
        }
        if let Some(c) = s.target2.and_then(|id| find(id)) {
            let (cx, cy) = c.rect.center();
            s.x2 = Some(cx);
            s.y2 = Some(cy);
        }

        let needs_point = matches!(
            s.action,
            Intent::Click
                | Intent::DoubleClick
                | Intent::RightClick
                | Intent::Hover
                | Intent::Point
                | Intent::Draw
                | Intent::Drag
                | Intent::Copy
                | Intent::Auto
        );
        // A mark aimed at words needs no coordinates of its own: Izuki finds
        // the words on the full-resolution screen (brain::anchor_marks). With
        // no point given, keep it at exactly (0,0) — rescaling moved "none" to
        // the desktop's corner, which isn't (0,0) on every monitor layout.
        let own_point = had_point.get(i).copied().unwrap_or(true);
        let words_mark = s.action == Intent::Draw && !pinned && (marks_words(s) || s.shape.as_deref() == Some("note"));
        if words_mark && !own_point {
            s.x = 0;
            s.y = 0;
            s.x2 = None;
            s.y2 = None;
        }
        let on_words = s.action == Intent::Draw && (marks_words(s) || note_to_place(s));
        keep.push(!needs_point || pinned || on_words || had_point.get(i).copied().unwrap_or(true));
    }

    let mut i = 0;
    steps.retain(|_| {
        let k = keep[i];
        i += 1;
        k
    });
}

/// Map image-space coordinates back onto the virtual desktop.
fn rescale(steps: &mut [ActionStep], req: &VisionRequest) {
    let (iw, ih) = req.image_size;
    if iw == 0 || ih == 0 {
        return;
    }
    let fx = req.desktop.w as f64 / iw as f64;
    let fy = req.desktop.h as f64 / ih as f64;

    let map = |v: i32, f: f64, off: i32| ((v as f64) * f).round() as i32 + off;

    for s in steps {
        // Some models helpfully answer in desktop space already. If a value is
        // outside the image we assume that is what happened and leave it be.
        let looks_like_image_space = s.x >= 0 && s.x <= iw as i32 && s.y >= 0 && s.y <= ih as i32;
        if !looks_like_image_space {
            continue;
        }
        // Omitted coordinates on typing/keys mean "use current focus", not
        // the virtual desktop's origin (which may be on a left-hand monitor).
        if s.x != 0 || s.y != 0 || !matches!(s.action, Intent::Type | Intent::Key | Intent::Scroll) {
            s.x = map(s.x, fx, req.desktop.x);
            s.y = map(s.y, fy, req.desktop.y);
        }
        if let Some(x2) = s.x2 {
            s.x2 = Some(map(x2, fx, req.desktop.x));
        }
        if let Some(y2) = s.y2 {
            s.y2 = Some(map(y2, fy, req.desktop.y));
        }
        if let Some(path) = &mut s.path {
            for p in path.iter_mut() {
                *p = [map(p[0], fx, req.desktop.x), map(p[1], fy, req.desktop.y)];
            }
        }
    }
}

fn truncate(s: &str, n: usize) -> String {
    let t: String = s.chars().take(n).collect();
    if s.chars().count() > n {
        format!("{t}…")
    } else {
        t
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::uia::Control;

    fn control(id: u32, x: i32, y: i32) -> Control {
        Control { id, kind: "Button".into(), name: format!("Button {id}"), rect: Rect { x, y, w: 20, h: 10 }, hidden: false, value: String::new(), focused: false, below: false, identity: None }
    }

    fn step(v: Value) -> ActionStep {
        serde_json::from_value(v).expect("valid step")
    }

    fn request(image: (u32, u32), desktop: Rect) -> VisionRequest {
        VisionRequest {
            image_jpeg: Vec::new(),
            image_size: image,
            desktop,
            marks_description: String::new(),
            user_prompt: String::new(),
            ocr_text: String::new(),
            app: String::new(),
            window_title: String::new(),
            draft: Vec::new(),
            controls: Vec::new(),
            memory: String::new(),
            windows: Vec::new(),
            page_text: String::new(),
        }
    }

    #[test]
    fn zoom_maps_to_the_desktop() {
        // A 1280x720 picture of a 2560x1440 screen that starts at (-2560, 0).
        let req = request((1280, 720), Rect { x: -2560, y: 0, w: 2560, h: 1440 });
        let z = parse_zoom(r#"{"summary":"Looking closer","steps":[],"zoom":[100,50,400,250]}"#, &req).expect("zoom");
        assert_eq!(z, Rect { x: -2360, y: 100, w: 600, h: 400 });
        // The object form, corners given the other way round.
        let z = parse_zoom(r#"{"zoom":{"x":400,"y":250,"x2":100,"y2":50}}"#, &req).expect("zoom");
        assert_eq!(z, Rect { x: -2360, y: 100, w: 600, h: 400 });
        // Nothing to gain: a speck, almost the whole picture, the template text, or none.
        assert!(parse_zoom(r#"{"zoom":[10,10,20,20]}"#, &req).is_none());
        assert!(parse_zoom(r#"{"zoom":[0,0,1280,720]}"#, &req).is_none());
        assert!(parse_zoom(r#"{"zoom":"[x1,y1,x2,y2]"}"#, &req).is_none());
        assert!(parse_zoom(r#"{"summary":"hi","steps":[]}"#, &req).is_none());
    }

    #[test]
    fn plain_sentence_reply_becomes_the_answer() {
        let (steps, summary) = parse_plan("The screen shows a browser with two tabs open.").unwrap();
        assert!(steps.is_empty());
        assert_eq!(summary, "The screen shows a browser with two tabs open.");
    }

    #[test]
    fn think_blocks_are_dropped_before_parsing() {
        let raw = "<think>the user wants a click</think>{\"summary\":\"Clicking Save.\",\"steps\":[{\"action\":\"click\",\"target\":3}]}";
        let (steps, summary) = parse_plan(raw).unwrap();
        assert_eq!(summary, "Clicking Save.");
        assert_eq!(steps.len(), 1);
        assert_eq!(steps[0].target, Some(3));
    }

    #[test]
    fn fenced_json_parses() {
        let raw = "Sure!\n```json\n{\"summary\":\"ok\",\"steps\":[]}\n```";
        let (steps, summary) = parse_plan(raw).unwrap();
        assert!(steps.is_empty());
        assert_eq!(summary, "ok");
    }

    #[test]
    fn improvised_answer_key_is_accepted() {
        let (steps, summary) = parse_plan("{\"answer\":\"It's 3pm.\"}").unwrap();
        assert!(steps.is_empty());
        assert_eq!(summary, "It's 3pm.");
    }

    #[test]
    fn more_means_look_again() {
        assert!(parse_more(r#"{"summary":"Opening Chrome.","more":true,"steps":[]}"#));
        assert!(!parse_more(r#"{"summary":"Done.","more":false,"steps":[]}"#));
        // Older replies without the field: one round, as before.
        assert!(!parse_more(r#"{"summary":"Done.","steps":[]}"#));
        assert!(!parse_more("just prose"));
    }

    #[test]
    fn empty_reply_is_an_error() {
        assert!(parse_plan("   ").is_err());
    }

    #[test]
    fn target_pins_the_step_to_the_real_control_centre() {
        let controls = vec![control(1, 10, 10), control(2, 100, 200)];
        let mut steps = vec![step(json!({ "action": "click", "target": 2 }))];
        resolve_targets(&mut steps, &controls, &[false]);
        assert_eq!(steps.len(), 1);
        assert_eq!((steps[0].x, steps[0].y), (110, 205));
        assert_eq!(steps[0].snapped_to.as_deref(), Some("Button 2"));
    }

    #[test]
    fn drag_between_two_controls() {
        let controls = vec![control(1, 0, 0), control(2, 100, 100)];
        let mut steps = vec![step(json!({ "action": "drag", "target": 1, "target2": 2 }))];
        resolve_targets(&mut steps, &controls, &[false]);
        assert_eq!((steps[0].x, steps[0].y), (10, 5));
        assert_eq!((steps[0].x2, steps[0].y2), (Some(110), Some(105)));
    }

    #[test]
    fn a_box_around_a_control_uses_its_real_bounds_not_its_centre() {
        // Underlining and boxing landed badly because the first corner snapped
        // to the control's centre while the second stayed a guess. Both corners
        // have to come from the real bounds (control() is 20x10).
        let mut steps = vec![step(json!({ "action": "draw", "shape": "box", "target": 7, "x": 1, "y": 2, "x2": 3, "y2": 4 }))];
        resolve_targets(&mut steps, &[control(7, 100, 200)], &[true]);
        assert_eq!((steps[0].x, steps[0].y), (100, 200), "top-left of the real control");
        assert_eq!((steps[0].x2, steps[0].y2), (Some(120), Some(210)), "bottom-right of the real control");
    }

    #[test]
    fn an_underline_around_a_control_spans_the_whole_thing() {
        let mut steps = vec![step(json!({ "action": "draw", "shape": "underline", "target": 7, "x": 0, "y": 0 }))];
        resolve_targets(&mut steps, &[control(7, 100, 200)], &[true]);
        assert_eq!((steps[0].x, steps[0].y), (100, 200));
        assert_eq!((steps[0].x2, steps[0].y2), (Some(120), Some(210)));
    }

    #[test]
    fn a_note_still_lands_on_the_centre_and_keeps_no_second_corner() {
        // A note is words written at a spot, not a rectangle around something.
        let mut steps = vec![step(json!({ "action": "draw", "shape": "note", "target": 7 }))];
        resolve_targets(&mut steps, &[control(7, 100, 200)], &[false]);
        assert_eq!((steps[0].x, steps[0].y), (110, 205), "the centre, as before");
        assert_eq!(steps[0].x2, None);
    }

    #[test]
    fn a_click_on_a_control_is_still_its_centre() {
        // Guard the existing behaviour: only drawn shapes changed.
        let mut steps = vec![step(json!({ "action": "click", "target": 7 }))];
        resolve_targets(&mut steps, &[control(7, 100, 200)], &[false]);
        assert_eq!((steps[0].x, steps[0].y), (110, 205));
    }

    #[test]
    fn made_up_target_with_no_point_is_dropped_not_clicked_at_zero() {
        let controls = vec![control(1, 10, 10)];
        let mut steps = vec![step(json!({ "action": "click", "target": 99 }))];
        resolve_targets(&mut steps, &controls, &[false]);
        assert!(steps.is_empty());
    }

    #[test]
    fn made_up_target_keeps_its_own_coordinates() {
        let mut steps = vec![step(json!({ "action": "click", "target": 99, "x": 50, "y": 60 }))];
        resolve_targets(&mut steps, &[], &[true]);
        assert_eq!(steps.len(), 1);
        assert_eq!((steps[0].x, steps[0].y), (50, 60));
    }

    #[test]
    fn typing_and_keys_need_no_point() {
        let mut steps = vec![
            step(json!({ "action": "type", "text_to_type": "hello" })),
            step(json!({ "action": "key", "key": "enter" })),
        ];
        resolve_targets(&mut steps, &[], &[false, false]);
        assert_eq!(steps.len(), 2);
    }

    #[test]
    fn omitted_typing_coordinates_stay_omitted_on_a_left_monitor() {
        let req = request((1280, 720), Rect { x: -2560, y: -300, w: 2560, h: 1440 });
        let mut steps = vec![step(json!({"action":"type","text_to_type":"hello"})), step(json!({"action":"key","key":"enter"}))];
        rescale(&mut steps, &req);
        assert!(steps.iter().all(|s| s.x == 0 && s.y == 0));
    }

    #[test]
    fn grounding_only_comes_from_the_selected_parser_control() {
        let mut c = control(2, -200, 150);
        c.identity = Some(crate::uia::ControlIdentity { runtime_id: vec![42, 9], window: 7, rect: c.rect, kind: c.kind.clone(), name: c.name.clone() });
        let mut steps = vec![step(json!({"action":"click","target":2,"x":999,"y":999})),
            step(json!({"action":"click","target":99,"x":99,"y":99,"snapped_to":"fabricated","hover_first":true}))];
        resolve_targets(&mut steps, &[c], &[true, true]);
        assert_eq!(steps[0].grounding.as_ref().unwrap().runtime_id, vec![42, 9]);
        assert_eq!((steps[0].x, steps[0].y), (-190, 155));
        assert!(steps[1].grounding.is_none() && steps[1].snapped_to.is_none() && !steps[1].hover_first);
    }

    #[test]
    fn image_refusals_are_recognised() {
        let v = json!({ "error": { "message": "No endpoints found that support image input" } });
        assert!(rejects_images(reqwest::StatusCode::NOT_FOUND, &v));
        let other = json!({ "error": { "message": "invalid api key" } });
        assert!(!rejects_images(reqwest::StatusCode::BAD_REQUEST, &other));
    }

    #[test]
    fn reads_mood_and_memories() {
        let raw = r#"{"summary":"Nice to meet you, Sam!","mood":"Excited","remember":["User's name is Sam",""],"steps":[]}"#;
        let (mood, remember) = parse_extras(raw);
        assert_eq!(mood.as_deref(), Some("excited"));
        assert_eq!(remember, vec!["User's name is Sam".to_string()]);
        let (mood, remember) = parse_extras(r#"{"summary":"ok","mood":"furious"}"#);
        assert!(mood.is_none() && remember.is_empty());
        assert_eq!(parse_extras("just prose").0, None);
    }

    #[test]
    fn null_fields_dont_drop_steps() {
        let raw = r#"{"summary":"Pressing Enter.","steps":[{"action":"key","target":null,"target2":null,"x":null,"y":null,"x2":null,"y2":null,"text_to_type":null,"key":"enter","scroll_amount":null,"confidence":null,"reasoning":null}]}"#;
        let (steps, summary) = parse_plan(raw).unwrap();
        assert_eq!(summary, "Pressing Enter.");
        assert_eq!(steps.len(), 1);
        assert_eq!(steps[0].key.as_deref(), Some("enter"));
    }

    #[test]
    fn a_cut_off_reply_is_rescued_not_read_out() {
        let raw = r#"{"summary":"I'll open the Recycle Bin for you.","mood":"cheerful","steps":[{"action":"double_click","target":4,"reasoning":"The Recycle Bin icon is visible on the desktop."},{"action":"key","target":null,"target2":null,"x":null,"y":null,"x2":null,"y2":null,"text_to_type":null,"#;
        let (steps, summary) = parse_plan(raw).unwrap();
        assert_eq!(summary, "I'll open the Recycle Bin for you.");
        assert_eq!(steps.len(), 1, "only the complete step survives");
        let raw = r#"{"steps":[{"action":"key","target":null,"x":null,"#;
        assert!(parse_plan(raw).is_err(), "nothing usable — an error, never raw JSON");
    }
}
