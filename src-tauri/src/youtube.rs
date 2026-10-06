//! YouTube, done properly — "play Bundle by Bundle by Burna Boy on YouTube".
//!
//! This used to go through the screen agent: open YouTube, wait, screenshot,
//! ask the AI, click — seconds per step, and when a free AI was busy the
//! task quietly ended with nothing playing. And once a video did play, the
//! AI called the job done while an ad was running, and never skipped it.
//!
//! Now it's a skill with no AI at all: open the search, read the results
//! the way a screen reader does (UI Automation), click the video whose title
//! best matches, and keep an eye out for ads — the moment a "Skip" button
//! appears, it's pressed, for every ad, for the next few minutes. The ad
//! watch also starts whenever the agent opens or clicks around YouTube.

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use anyhow::Result;
use parking_lot::Mutex;

/// Keep skipping ads until then.
static WATCH_UNTIL: Mutex<Option<Instant>> = Mutex::new(None);
static WATCHING: AtomicBool = AtomicBool::new(false);
/// What it played lately, so "another one" is another one.
static RECENT: Mutex<Vec<String>> = Mutex::new(Vec::new());
/// How long ads are watched for after something is played.
pub const AD_WATCH: Duration = Duration::from_secs(4 * 60);

/// A YouTube request said any normal way.
#[derive(Debug, Clone, PartialEq)]
pub enum YtAsk {
    Play(String),
    Search(String),
}

/// "open chrome and play how to make money, skip the ads", "watch lofi on
/// youtube", "play drake in the browser", "search youtube for cat videos".
/// Plain "play X" (no YouTube, browser or Chrome) isn't one — it might mean
/// Spotify or what's already on screen.
pub fn parse_request(said: &str) -> Option<YtAsk> {
    let mut s = said.to_lowercase().replace(['“', '”', '"'], "");
    s = s.trim().trim_end_matches(['.', '!', '?']).trim().to_string();
    for lead in ["hey nova", "hey izuki", "ok nova", "okay nova", "please", "can you", "could you", "would you"] {
        if let Some(r) = s.strip_prefix(lead) {
            s = r.trim_start_matches([',', ' ']).to_string();
        }
    }
    // The ads are always skipped: the words about them just go.
    for tail in [" and skip any ads", " and skip the ads", " and skip all the ads", " and skip ads", " and skip the ad", " skip the ads", " skip ads", " skip the ad", " without ads", " with no ads", " no ads", " for me", " please"] {
        if let Some(i) = s.find(tail) {
            s.truncate(i);
        }
    }
    let mut s = s.trim().trim_end_matches([',', ' ', '.', ';', '!']).to_string();
    let mut youtubey = false;
    for opener in ["open google chrome", "open chrome", "open the browser", "open my browser", "open a browser", "open edge", "open youtube", "go to youtube", "pull up youtube", "launch chrome", "launch youtube"] {
        if let Some(r) = s.strip_prefix(opener) {
            let r = r.trim_start_matches([',', ' ']);
            if let Some(r) = r.strip_prefix("and ").or_else(|| r.strip_prefix("then ")).or_else(|| r.strip_prefix("and then ")) {
                s = r.trim().to_string();
                youtubey = true;
            }
            break;
        }
    }
    let clean = |t: &str, youtubey: &mut bool| -> String {
        let mut t = t.trim().to_string();
        for tail in [" on youtube", " in youtube", " from youtube", " off youtube", " on chrome", " in chrome", " on google chrome", " in the browser", " on the browser", " in my browser"] {
            if let Some(i) = t.find(tail) {
                t.truncate(i);
                *youtubey = true;
            }
        }
        t.trim().trim_start_matches("the video ").trim_start_matches("a video ").trim_start_matches("a video about ").trim_start_matches("videos about ").trim().to_string()
    };
    for lead in ["search youtube for ", "search on youtube for ", "youtube search ", "look up on youtube "] {
        if let Some(q) = s.strip_prefix(lead) {
            let q = clean(q, &mut youtubey);
            return (!q.is_empty()).then_some(YtAsk::Search(q));
        }
    }
    if youtubey {
        for lead in ["search for ", "search ", "look up ", "find "] {
            if let Some(q) = s.strip_prefix(lead) {
                let q = clean(q, &mut youtubey);
                return (!q.is_empty()).then_some(YtAsk::Search(q));
            }
        }
    }
    if let Some(q) = s.strip_prefix("youtube ") {
        let q = clean(q, &mut youtubey);
        return (q.split_whitespace().count() >= 1).then_some(YtAsk::Play(q));
    }
    for lead in ["find and play ", "play ", "watch ", "put on ", "show me "] {
        if let Some(q) = s.strip_prefix(lead) {
            let q = clean(q, &mut youtubey);
            if youtubey && !q.is_empty() && !["it", "this", "that", "something", "music", "a video"].contains(&q.as_str()) {
                return Some(YtAsk::Play(q));
            }
            return None;
        }
    }
    None
}

pub fn search_url(query: &str) -> String {
    let q: String = query
        .trim()
        .bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect();
    format!("https://www.youtube.com/results?search_query={q}")
}

/// Search YouTube for `query` and start the best video for it — a friend's
/// pick, not a menu: the closest match to what was asked, skipping what it
/// played lately; for something vague ("cool videos", "something chill")
/// the most-watched of the top results. `Some(title)` once it clicked one;
/// `None` if the results never showed (they're left on screen).
pub fn play(query: &str) -> Result<Option<String>> {
    // One song at a time: whatever else is playing stops first.
    crate::media::pause_others();
    // The YouTube tab it already has up, rather than a new tab per song.
    crate::patience::go_to(&search_url(query))?;
    watch_ads(AD_WATCH);
    let words = words(query);
    let started = Instant::now();
    // The results take a moment to arrive; look a few times rather than
    // waiting a fixed while.
    while started.elapsed() < Duration::from_secs(12) {
        std::thread::sleep(Duration::from_millis(700));
        if crate::automation::aborted() {
            return Ok(None);
        }
        if !crate::uia::foreground_title().to_lowercase().contains("youtube") {
            continue;
        }
        let controls = crate::uia::list_controls(160);
        let recent = RECENT.lock().clone();
        if let Some(best) = best_result(&controls, &words, &recent) {
            let (x, y) = best.rect.center();
            eprintln!("[youtube] playing \"{}\"", best.name);
            crate::automation::click_at(x, y, enigo::Button::Left, 1, 260)?;
            let mut r = RECENT.lock();
            r.push(key_of(&best.name));
            if r.len() > 12 {
                r.remove(0);
            }
            return Ok(Some(short_title(&best.name)));
        }
    }
    Ok(None)
}

fn words(s: &str) -> Vec<String> {
    s.to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() > 1 && !matches!(*w, "on" | "the" | "by" | "youtube" | "play" | "video" | "song" | "music"))
        .map(str::to_string)
        .collect()
}

/// A video, recognisably: its title, lower-cased and cut short.
fn key_of(name: &str) -> String {
    short_title(name).to_lowercase()
}

/// "… 1.2M views …" / "… 12,345,678 views …" → how many.
fn views(name: &str) -> Option<u64> {
    let lower = name.to_lowercase();
    let at = lower.find(" views")?;
    let before = lower[..at].trim_end();
    let token = before.rsplit(' ').next()?;
    let (num, mult) = match token.chars().last()? {
        'k' => (&token[..token.len() - 1], 1e3),
        'm' => (&token[..token.len() - 1], 1e6),
        'b' => (&token[..token.len() - 1], 1e9),
        _ => (token, 1.0),
    };
    let n: f64 = num.replace(',', "").parse().ok()?;
    Some((n * mult) as u64)
}

/// The video to play: the one whose title shares the most words with the
/// request; when nothing really matches (a vague ask), the most-watched of
/// the first results. Never an ad, a Short, a channel, the page's own
/// links, or something it played lately.
fn best_result<'a>(
    controls: &'a [crate::uia::Control],
    want: &[String],
    recent: &[String],
) -> Option<&'a crate::uia::Control> {
    let mut best: Option<(usize, &crate::uia::Control)> = None;
    // Fallback for vague asks: (views, control) among the first few videos.
    let mut popular: Option<(u64, &crate::uia::Control)> = None;
    let mut videos_seen = 0;
    for c in controls {
        if c.kind != "Hyperlink" || c.hidden || c.rect.w < 80 {
            continue;
        }
        let name = c.name.to_lowercase();
        if name.len() < 6
            || ["sponsored", "shorts", "subscribe", "skip navigation", "sign in", "home", "channel"]
                .iter()
                .any(|bad| name.contains(bad))
        {
            continue;
        }
        if recent.iter().any(|r| *r == key_of(&c.name)) {
            continue;
        }
        if let Some(v) = views(&c.name) {
            videos_seen += 1;
            if videos_seen <= 8 && popular.is_none_or(|(p, _)| v > p) {
                popular = Some((v, c));
            }
        }
        let have = words(&name);
        let hits = want.iter().filter(|w| have.contains(w)).count();
        // Most of what was asked for, at least.
        if hits * 2 < want.len() || hits == 0 {
            continue;
        }
        // Reading order breaks ties: the topmost result wins.
        if best.is_none_or(|(b, _)| hits > b) {
            best = Some((hits, c));
        }
    }
    best.map(|(_, c)| c).or(popular.map(|(_, c)| c))
}

/// "Burna Boy - Bundle by Bundle [Official Video] 3 minutes…" → the title part.
fn short_title(name: &str) -> String {
    let cut = name.find(" by ").filter(|i| *i > 8).unwrap_or(name.len());
    name[..cut].trim().chars().take(60).collect()
}

/// Press YouTube's "Skip" button whenever it shows up, for `how_long` (a new
/// call just extends the watch). Cheap: a look at the page's buttons about
/// once a second, only while YouTube is the window in front, no AI.
pub fn watch_ads(how_long: Duration) {
    *WATCH_UNTIL.lock() = Some(Instant::now() + how_long);
    if WATCHING.swap(true, Ordering::SeqCst) {
        return;
    }
    std::thread::Builder::new()
        .name("izuki-ads".into())
        .spawn(|| {
            loop {
                std::thread::sleep(Duration::from_millis(1100));
                let until = *WATCH_UNTIL.lock();
                if until.is_none_or(|u| Instant::now() > u) {
                    break;
                }
                if crate::uia::screen_locked() || !crate::uia::foreground_title().to_lowercase().contains("youtube") {
                    continue;
                }
                let controls = crate::uia::list_controls(140);
                if let Some(skip) = controls.iter().find(|c| is_skip_button(c)) {
                    let (x, y) = skip.rect.center();
                    // Put the pointer back where the user had it.
                    let back = crate::capture::cursor_pos();
                    if crate::automation::click_at(x, y, enigo::Button::Left, 1, 120).is_ok() {
                        eprintln!("[youtube] skipped an ad");
                        let _ = crate::automation::glide_to(back.0, back.1, 120);
                    }
                    std::thread::sleep(Duration::from_millis(1500));
                }
            }
            WATCHING.store(false, Ordering::SeqCst);
        })
        .ok();
}

/// Stop pressing Skip (the stop keys). The watch thread ends within a second.
pub fn stop_watching_ads() {
    *WATCH_UNTIL.lock() = None;
}

#[cfg(test)]
mod request_tests {
    use super::*;

    #[test]
    fn understands_youtube_requests() {
        assert_eq!(parse_request("open chrome and play how to make money. skip the ads"), Some(YtAsk::Play("how to make money".into())));
        assert_eq!(parse_request("open chrome and play how to make money, skip the ads"), Some(YtAsk::Play("how to make money".into())));
        assert_eq!(parse_request("play burna boy last last on youtube and skip the ads"), Some(YtAsk::Play("burna boy last last".into())));
        assert_eq!(parse_request("watch lofi beats in the browser"), Some(YtAsk::Play("lofi beats".into())));
        assert_eq!(parse_request("hey nova, open youtube and search for cat videos"), Some(YtAsk::Search("cat videos".into())));
        assert_eq!(parse_request("search youtube for minecraft builds"), Some(YtAsk::Search("minecraft builds".into())));
        assert_eq!(parse_request("youtube drake"), Some(YtAsk::Play("drake".into())));
        assert_eq!(parse_request("play some music"), None);
        assert_eq!(parse_request("play it"), None);
        assert_eq!(parse_request("open chrome"), None);
    }
}

fn is_skip_button(c: &crate::uia::Control) -> bool {
    if c.kind != "Button" || c.hidden {
        return false;
    }
    let n = c.name.trim().to_lowercase();
    n.starts_with("skip") && n.len() <= 24 && !n.contains("navigation") && !n.contains("intro") && !n.contains("forward")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Rect;
    use crate::uia::Control;

    fn c(id: u32, kind: &str, name: &str) -> Control {
        Control { id, kind: kind.into(), name: name.into(), rect: Rect { x: 0, y: id as i32 * 100, w: 300, h: 40 }, hidden: false, value: String::new(), focused: false, below: false, section: String::new(), identity: None }
    }

    #[test]
    fn picks_the_matching_video() {
        let list = vec![
            c(1, "Hyperlink", "Skip navigation"),
            c(2, "Hyperlink", "Sponsored · Burna Boy concert tickets"),
            c(3, "Hyperlink", "Burna Boy - Bundle by Bundle [Official Music Video] by Burna Boy 3 minutes"),
            c(4, "Hyperlink", "Burna Boy - Last Last"),
        ];
        let got = best_result(&list, &words("play bundle by bundle by burna boy on youtube"), &[]).unwrap();
        assert_eq!(got.id, 3);
        assert_eq!(short_title(&got.name), "Burna Boy - Bundle");
        assert!(best_result(&list, &words("taylor swift"), &[]).is_none());
    }

    #[test]
    fn picks_for_you_when_the_ask_is_vague_and_never_repeats() {
        let list = vec![
            c(1, "Hyperlink", "Sponsored · 50% off"),
            c(2, "Hyperlink", "Relaxing rain sounds by Calm Vibes 120K views 1 year ago 3 hours"),
            c(3, "Hyperlink", "Most satisfying video ever by Satisfy 48M views 2 years ago 10 minutes"),
            c(4, "Hyperlink", "Cool science tricks by Lab 3.1M views 5 months ago 12 minutes"),
            c(5, "Hyperlink", "Burna Boy"),
        ];
        // Nothing matches "cool stuff" well → the most-watched of the top results.
        let got = best_result(&list, &words("play some cool videos for me"), &[]).unwrap();
        assert_eq!(got.id, 3);
        // "Another one": the one it just played is skipped.
        let played = vec![key_of(&list[2].name)];
        let got = best_result(&list, &words("play some cool videos for me"), &played).unwrap();
        assert_eq!(got.id, 4);
        // A real match still wins over popularity.
        let got = best_result(&list, &words("rain sounds"), &[]).unwrap();
        assert_eq!(got.id, 2);
        assert_eq!(views("x by y 1,234 views"), Some(1234));
        assert_eq!(views("x 2.5M views"), Some(2_500_000));
        assert_eq!(views("no count here"), None);
    }

    #[test]
    fn knows_a_skip_button() {
        assert!(is_skip_button(&c(1, "Button", "Skip")));
        assert!(is_skip_button(&c(1, "Button", "Skip Ad")));
        assert!(is_skip_button(&c(1, "Button", "Skip ads")));
        assert!(!is_skip_button(&c(1, "Hyperlink", "Skip navigation")));
        assert!(!is_skip_button(&c(1, "Button", "Skip navigation")));
        assert!(!is_skip_button(&c(1, "Button", "Subscribe")));
    }

    #[test]
    fn builds_the_search_address() {
        assert_eq!(search_url("burna boy & wizkid"), "https://www.youtube.com/results?search_query=burna+boy+%26+wizkid");
    }
}
