//! The shared vocabulary. Every type here has a mirror in src/lib/types.ts.

use serde::{Deserialize, Serialize};

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub w: i32,
    pub h: i32,
}

impl Rect {
    pub fn center(&self) -> (i32, i32) {
        (self.x + self.w / 2, self.y + self.h / 2)
    }

    pub fn area(&self) -> i64 {
        self.w.max(0) as i64 * self.h.max(0) as i64
    }

    pub fn contains(&self, x: i32, y: i32) -> bool {
        x >= self.x && y >= self.y && x < self.x + self.w && y < self.y + self.h
    }

    /// Grow by `pad` on every side.
    pub fn inflate(&self, pad: i32) -> Rect {
        Rect {
            x: self.x - pad,
            y: self.y - pad,
            w: self.w + pad * 2,
            h: self.h + pad * 2,
        }
    }

    /// Clamp to `bounds`, returning `None` when nothing is left.
    pub fn clip_to(&self, bounds: &Rect) -> Option<Rect> {
        let x0 = self.x.max(bounds.x);
        let y0 = self.y.max(bounds.y);
        let x1 = (self.x + self.w).min(bounds.x + bounds.w);
        let y1 = (self.y + self.h).min(bounds.y + bounds.h);
        if x1 <= x0 || y1 <= y0 {
            return None;
        }
        Some(Rect {
            x: x0,
            y: y0,
            w: x1 - x0,
            h: y1 - y0,
        })
    }
}

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct DesktopBounds {
    pub x: i32,
    pub y: i32,
    pub w: i32,
    pub h: i32,
    pub scale: f64,
}

// ---------------------------------------------------------------------------
// Draw vocabulary
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ShapeKind {
    Box,
    Arrow,
    Circle,
    Pen,
    Text,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Intent {
    #[default]
    Auto,
    Click,
    DoubleClick,
    RightClick,
    Type,
    Drag,
    Watch,
    Copy,
    Scroll,
    Hover,
    Key,
    /// Circle something to *show* it — "point at it", "where's the…",
    /// "show me what that is" — without clicking it.
    Point,
    /// Instant skills (apps.rs) — `text_to_type` holds the app name, the web
    /// address, or the search.
    OpenApp,
    OpenUrl,
    Search,
    /// Play something on YouTube — `text_to_type` holds what (youtube.rs).
    PlayYoutube,
    /// Draw on the screen like a teacher's pen — `shape` says what (circle,
    /// underline, arrow, box, note), `text_to_type` holds a note's words.
    /// Nothing is clicked.
    Draw,
    /// Draw for real, inside an app (Paint, Whiteboard, a canvas): the left
    /// button held down along `path`, like a hand holding a pen.
    Stroke,
}

impl Intent {
    pub fn as_str(&self) -> &'static str {
        match self {
            Intent::Auto => "auto",
            Intent::Click => "click",
            Intent::DoubleClick => "double_click",
            Intent::RightClick => "right_click",
            Intent::Type => "type",
            Intent::Drag => "drag",
            Intent::Watch => "watch",
            Intent::Copy => "copy",
            Intent::Scroll => "scroll",
            Intent::Hover => "hover",
            Intent::Key => "key",
            Intent::Point => "point",
            Intent::OpenApp => "open_app",
            Intent::OpenUrl => "open_url",
            Intent::Search => "search",
            Intent::PlayYoutube => "play_youtube",
            Intent::Draw => "draw",
            Intent::Stroke => "stroke",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Mark {
    pub id: String,
    pub kind: ShapeKind,
    pub rect: Rect,
    #[serde(default)]
    pub points: Vec<Point>,
    #[serde(default)]
    pub intent: Intent,
    #[serde(default)]
    pub order: i32,
    #[serde(default)]
    pub text: Option<String>,
    #[serde(default)]
    pub ocr: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawSession {
    pub marks: Vec<Mark>,
    #[serde(default)]
    pub prompt: String,
    pub desktop: Rect,
    #[serde(default)]
    pub created_at: i64,
}

// ---------------------------------------------------------------------------
// What the brain returns
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionStep {
    pub action: Intent,
    /// Optional when `target` names a control — Izuki fills these in from
    /// the control's real bounds.
    #[serde(default, deserialize_with = "null_as_default")]
    pub x: i32,
    #[serde(default, deserialize_with = "null_as_default")]
    pub y: i32,
    /// A control id from the numbered list Izuki gave the model (see
    /// `uia::list_controls`). When set it wins over `x`/`y`: it's the exact
    /// centre of a real button/field, not a guess.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub target: Option<u32>,
    /// Drag destination as a control id, same idea as `target`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub target2: Option<u32>,
    #[serde(default)]
    pub x2: Option<i32>,
    #[serde(default)]
    pub y2: Option<i32>,
    #[serde(default)]
    pub text_to_type: Option<String>,
    #[serde(default)]
    pub key: Option<String>,
    #[serde(default)]
    pub scroll_amount: Option<i32>,
    #[serde(default = "half", deserialize_with = "null_as_half")]
    pub confidence: f32,
    #[serde(default, deserialize_with = "null_as_default")]
    pub reasoning: String,
    #[serde(default)]
    pub snapped_to: Option<String>,
    /// The control only appears while the mouse is over it: hover there
    /// and let it show before clicking.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub hover_first: bool,
    /// The control is further down the page: have the app scroll it into
    /// view (exactly — no blind wheel turns) before acting on it.
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    pub scroll_first: bool,
    /// For `draw`: circle, underline, arrow, box or note.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub shape: Option<String>,
    /// For `stroke`: the points the pen passes through, in order.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub path: Option<Vec<[i32; 2]>>,
}

fn half() -> f32 {
    0.5
}

/// Models often write every field, filling the unused ones with `null`
/// (`"x": null` on a key press). That means "not given", not "invalid" —
/// without this the whole step was thrown away.
fn null_as_default<'de, D, T>(d: D) -> Result<T, D::Error>
where
    D: serde::Deserializer<'de>,
    T: Default + Deserialize<'de>,
{
    Ok(Option::<T>::deserialize(d)?.unwrap_or_default())
}

fn null_as_half<'de, D>(d: D) -> Result<f32, D::Error>
where
    D: serde::Deserializer<'de>,
{
    Ok(Option::<f32>::deserialize(d)?.unwrap_or(0.5))
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct VisionPlan {
    pub steps: Vec<ActionStep>,
    pub summary: String,
    pub provider: String,
    pub model: String,
    pub latency_ms: u64,
    /// How the summary should sound spoken — see `vision::MOODS`.
    #[serde(default)]
    pub mood: Option<String>,
    /// Lasting facts about the user the model picked up this turn.
    #[serde(default)]
    pub remember: Vec<String>,
    /// The task isn't finished after these steps (a window will open, a
    /// page will load, a picker will appear): look at the screen again and
    /// carry on. See `brain::submit_voice_command`.
    #[serde(default)]
    pub more: bool,
    /// The model can't tell which thing the user means and asks them to
    /// show it (circle it, or say/type it) — see `brain::ask_user`.
    #[serde(default)]
    pub ask: Option<String>,
    /// The goal is reached (and checked on screen) — stop looking.
    #[serde(default)]
    pub done: bool,
    /// Seconds to let the screen settle (a page, an ad) before the next look.
    #[serde(default)]
    pub wait: u32,
    /// The agent's working notes — its running plan and what it has learned
    /// (where things are) — shown back to it on the next look.
    #[serde(default)]
    pub notes: Option<String>,
    /// Too small to read or hit exactly: the desktop region to look at up
    /// close next round (full resolution, enlarged) — see `brain::submit_task`.
    #[serde(default)]
    pub zoom: Option<Rect>,
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flow {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub app: String,
    pub steps: Vec<ActionStep>,
    #[serde(default)]
    pub prompt: String,
    #[serde(default)]
    pub thumbnail: Option<String>,
    pub created_at: i64,
    #[serde(default)]
    pub last_run: Option<i64>,
    #[serde(default)]
    pub run_count: u32,
    #[serde(default)]
    pub hotkey: Option<String>,
}

// ---------------------------------------------------------------------------
// Watchers
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum WatcherCondition {
    PixelColor { color: String, tolerance: u8 },
    RegionChanged { threshold: f32 },
    TextAppears { text: String },
    TextDisappears { text: String },
    Vision { question: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum WatcherAction {
    Click { x: i32, y: i32 },
    RunFlow { flow_id: String },
    Notify,
    Type { text: String },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WatcherStatus {
    Idle,
    Watching,
    Triggered,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Watcher {
    pub id: String,
    pub name: String,
    pub region: Rect,
    pub condition: WatcherCondition,
    pub action: WatcherAction,
    #[serde(default = "default_interval")]
    pub interval_ms: u64,
    #[serde(default = "yes")]
    pub enabled: bool,
    #[serde(default)]
    pub once: bool,
    pub created_at: i64,
    #[serde(default)]
    pub last_checked: Option<i64>,
    #[serde(default)]
    pub last_triggered: Option<i64>,
    #[serde(default)]
    pub trigger_count: u32,
    #[serde(default = "idle")]
    pub status: WatcherStatus,
    #[serde(default)]
    pub message: Option<String>,
}

fn default_interval() -> u64 {
    700
}

fn yes() -> bool {
    true
}

fn idle() -> WatcherStatus {
    WatcherStatus::Idle
}

// ---------------------------------------------------------------------------
// Events pushed to the windows
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
pub struct OverlayOpenPayload {
    pub desktop: DesktopBounds,
    pub freeze: bool,
    pub mode: &'static str,
    /// The mark shape to start on — only meaningful for `mode: "quickdraw"`.
    pub shape: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize)]
pub struct CursorPosition {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct HandCommand {
    pub x: i32,
    pub y: i32,
    /// Set for drags, so the overlay can sketch an arrow from `(x,y)` to
    /// here instead of just pointing at one spot.
    pub x2: Option<i32>,
    pub y2: Option<i32>,
    pub action: Intent,
    pub duration_ms: u64,
    pub label: Option<String>,
    /// For `draw`: the shape, and a note's words.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shape: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatusEvent {
    pub kind: &'static str,
    pub message: String,
    pub detail: Option<String>,
}

impl StatusEvent {
    pub fn info(msg: impl Into<String>) -> Self {
        Self { kind: "info", message: msg.into(), detail: None }
    }
    pub fn working(msg: impl Into<String>) -> Self {
        Self { kind: "working", message: msg.into(), detail: None }
    }
    pub fn success(msg: impl Into<String>) -> Self {
        Self { kind: "success", message: msg.into(), detail: None }
    }
    pub fn error(msg: impl Into<String>, detail: impl Into<String>) -> Self {
        Self {
            kind: "error",
            message: msg.into(),
            detail: Some(detail.into()),
        }
    }
}

pub fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}
