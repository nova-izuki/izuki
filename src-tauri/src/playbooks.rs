//! How each app really works (packages/app-playbooks): its own keyboard
//! shortcuts and how an expert works it. While that app is in front, its
//! playbook goes to the brain — so in FL Studio, Premiere or Photoshop
//! (apps that draw their own interface) Izuki uses keys and menus instead of
//! dragging by pixels. More playbooks can be dropped into
//! `<data>/playbooks/*.json`.

use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Playbook {
    pub id: String,
    pub name: String,
    #[serde(rename = "match")]
    pub matches: Vec<String>,
    #[serde(default)]
    pub canvas: bool,
    #[serde(default)]
    pub notes: Vec<String>,
    #[serde(default)]
    pub keys: Vec<(String, String)>,
}

#[derive(Deserialize)]
struct Book {
    apps: Vec<Playbook>,
}

const BUILT_IN: &str = include_str!("../../packages/app-playbooks/playbooks.json");

/// Every playbook: yours first (so they win), then the built-in ones.
fn all() -> Vec<Playbook> {
    let mut out = Vec::new();
    if let Ok(dir) = std::fs::read_dir(crate::store::data_dir().join("playbooks")) {
        for f in dir.flatten() {
            let Ok(text) = std::fs::read_to_string(f.path()) else { continue };
            if let Ok(book) = serde_json::from_str::<Book>(&text) {
                out.extend(book.apps);
            } else if let Ok(one) = serde_json::from_str::<Playbook>(&text) {
                out.push(one);
            }
        }
    }
    if let Ok(book) = serde_json::from_str::<Book>(BUILT_IN) {
        out.extend(book.apps);
    }
    out
}

/// The playbook for the app in front (by its program name or window title).
pub fn find(app: &str, title: &str) -> Option<Playbook> {
    let app = app.to_lowercase();
    let title = title.to_lowercase();
    all().into_iter().find(|p| {
        p.matches.iter().any(|m| {
            let m = m.to_lowercase();
            if m.ends_with(".exe") { app == m || app == m.trim_end_matches(".exe") } else { app.contains(&m) || title.contains(&m) }
        })
    })
}

/// The playbook as the brain reads it ("" when there's none).
pub fn prompt_block(app: &str, title: &str) -> String {
    let Some(p) = find(app, title) else { return String::new() };
    let mut s = format!("APP PLAYBOOK — {}:\n", p.name);
    if p.canvas {
        s.push_str("- This app draws its own interface: the controls list can't see what's inside its canvases. Prefer its keyboard shortcuts (a \"key\" step) and menus by name over clicking or dragging inside the canvas.\n");
    }
    for n in &p.notes {
        s.push_str(&format!("- {n}\n"));
    }
    if !p.keys.is_empty() {
        let keys: Vec<String> = p.keys.iter().map(|(k, what)| format!("{k} = {what}")).collect();
        s.push_str(&format!("- Its shortcuts: {}\n", keys.join("; ")));
    }
    s
}

/// "What are the shortcuts here?", "how do I use this app": the playbook
/// for the app in front, said plainly. None when it isn't that question.
pub fn answer(said: &str) -> Option<String> {
    let s = said.to_lowercase();
    let asks = (s.contains("shortcut") || s.contains("hotkey") || s.contains("keyboard keys"))
        && (s.contains("here") || s.contains("this app") || s.contains("this program") || s.contains("for this") || s.contains("what are") || s.contains("show me"));
    if !asks {
        return None;
    }
    let app = crate::uia::foreground_app();
    let title = crate::uia::foreground_title();
    let Some(p) = find(&app, &title) else {
        return Some("I don't have a playbook for this app yet — ask me what you want to do in it and I'll find the way.".into());
    };
    let keys: Vec<String> = p.keys.iter().take(12).map(|(k, what)| format!("{k} — {what}")).collect();
    let mut out = format!("In {}: {}.", p.name, keys.join("; "));
    if let Some(tip) = p.notes.first() {
        out.push_str(&format!(" Tip: {tip}"));
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_apps_by_program_or_title() {
        assert!(serde_json::from_str::<Book>(BUILT_IN).is_ok(), "the built-in playbooks parse");
        assert_eq!(find("FL64.exe", "").map(|p| p.id), Some("fl-studio".into()));
        assert_eq!(find("chrome.exe", "Blackboard Learn").map(|p| p.id), Some("browser".into()));
        assert!(find("notepad.exe", "Untitled").is_none());
        let block = prompt_block("FL64.exe", "My beat - FL Studio");
        assert!(block.contains("F7 = Piano Roll") && block.contains("draws its own interface"));
        assert!(prompt_block("notepad.exe", "").is_empty());
    }
}
