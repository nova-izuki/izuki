//! Persistent mission contracts and cooperative execution budgets. These
//! describe an existing authorization; they never grant new permissions.
use std::{cell::RefCell, marker::PhantomData, rc::Rc, sync::Arc, time::Instant};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use crate::model::TaskOutcome;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthorizedScope { ExistingPermissions }

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Verification { ObservedRequestedOutcome }

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Budget {
    pub max_duration_ms: u64,
    pub max_rounds: u32,
    pub max_actions: u32,
    pub max_requests: u32,
}

impl Default for Budget {
    fn default() -> Self {
        Self { max_duration_ms: 180_000, max_rounds: 16, max_actions: 80, max_requests: 32 }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TaskContract {
    pub version: u32,
    pub objective: String,
    pub authorized_scope: AuthorizedScope,
    pub success_criteria: Vec<String>,
    pub verification: Verification,
    pub budget: Budget,
}

impl TaskContract {
    pub fn new(objective: &str) -> Self {
        Self {
            version: 1, objective: objective.into(),
            authorized_scope: AuthorizedScope::ExistingPermissions,
            // V1 preserves the whole requested outcome; it does not silently
            // replace a compound goal with an easier generated subgoal.
            success_criteria: vec![objective.into()],
            verification: Verification::ObservedRequestedOutcome,
            budget: Budget::default(),
        }
    }

    pub fn validate(&self, objective: &str) -> Result<(), &'static str> {
        if self.version != 1 || self.objective != objective || objective.trim().is_empty()
            || objective.chars().count() > 400 || self.success_criteria != [objective.to_string()] {
            return Err("The mission contract does not match the saved objective.");
        }
        let b = &self.budget;
        if b.max_duration_ms == 0 || b.max_duration_ms > 600_000 || b.max_rounds == 0 || b.max_rounds > 16
            || b.max_actions == 0 || b.max_actions > 200 || b.max_requests == 0 || b.max_requests > 64 {
            return Err("The mission's execution budget is invalid.");
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StopReason { Cancelled, Deadline, Rounds, Actions, Requests, CheckpointFailure }

impl StopReason {
    pub fn explanation(self) -> &'static str {
        match self {
            Self::Cancelled => "Stopped at an execution boundary. Inspect the current result before retrying.",
            Self::Deadline => "Paused at the mission's time limit. Inspect the current result before continuing.",
            Self::Rounds => "Paused at the mission's reasoning-round limit. Inspect the current result before continuing.",
            Self::Actions => "Paused at the mission's action limit. Inspect the current result before continuing.",
            Self::Requests => "Paused at the mission's connected-service request limit. Inspect the current result before continuing.",
            Self::CheckpointFailure => "Paused because execution evidence could not be saved. Inspect the current result before continuing.",
        }
    }
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Usage {
    pub elapsed_ms: u64,
    pub rounds: u32,
    pub actions: u32,
    pub requests: u32,
    pub stop_reason: Option<StopReason>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Checkpoint {
    pub started_at: i64,
    pub updated_at: i64,
    /// running, returned, or interrupted. No automatic action replay.
    pub phase: String,
    pub usage: Usage,
    #[serde(default)]
    pub journal_version: Option<u8>,
    #[serde(default)]
    pub evidence: Vec<crate::mission_journal::Evidence>,
    #[serde(default)]
    pub journal_incomplete: bool,
}

#[derive(Clone, Copy)]
pub enum Work { Round, Action, Request }

pub(crate) struct Context {
    budget: Budget,
    started: Instant,
    usage: Mutex<Usage>,
    cancelled: Arc<dyn Fn() -> bool + Send + Sync>,
    journal: Option<Arc<crate::mission_journal::Journal>>,
}

impl Context {
    fn check(&self, work: Option<Work>) -> Result<(), StopReason> {
        let mut u = self.usage.lock();
        u.elapsed_ms = self.started.elapsed().as_millis().min(u64::MAX as u128) as u64;
        // Cancellation always wins, including after a previously hit limit.
        if (self.cancelled)() { u.stop_reason = Some(StopReason::Cancelled); }
        if u.stop_reason.is_none() && self.journal.as_ref().is_some_and(|j| !j.healthy()) { u.stop_reason = Some(StopReason::CheckpointFailure); }
        if u.stop_reason.is_none() && u.elapsed_ms >= self.budget.max_duration_ms { u.stop_reason = Some(StopReason::Deadline); }
        if let Some(reason) = u.stop_reason { return Err(reason); }
        let (count, limit, reason) = match work {
            Some(Work::Round) => (&mut u.rounds, self.budget.max_rounds, StopReason::Rounds),
            Some(Work::Action) => (&mut u.actions, self.budget.max_actions, StopReason::Actions),
            Some(Work::Request) => (&mut u.requests, self.budget.max_requests, StopReason::Requests),
            None => return Ok(()),
        };
        if *count >= limit { u.stop_reason = Some(reason); return Err(reason); }
        *count += 1;
        Ok(())
    }
}

thread_local! { static CURRENT: RefCell<Option<Arc<Context>>> = const { RefCell::new(None) }; }

/// Thread-bound guard: restore the caller's context even after a panic.
pub struct Scope {
    context: Arc<Context>,
    previous: Option<Arc<Context>>,
    _thread_bound: PhantomData<Rc<()>>,
}

impl Scope {
    pub fn enter(contract: &TaskContract, cancelled: impl Fn() -> bool + Send + Sync + 'static) -> Result<Self, &'static str> {
        Self::create(contract, cancelled, None)
    }

    pub fn enter_recorded(contract: &TaskContract, cancelled: impl Fn() -> bool + Send + Sync + 'static, journal: Arc<crate::mission_journal::Journal>) -> Result<Self, &'static str> {
        Self::create(contract, cancelled, Some(journal))
    }

    fn create(contract: &TaskContract, cancelled: impl Fn() -> bool + Send + Sync + 'static, journal: Option<Arc<crate::mission_journal::Journal>>) -> Result<Self, &'static str> {
        contract.validate(&contract.objective)?;
        let context = Arc::new(Context { budget: contract.budget.clone(), started: Instant::now(), usage: Mutex::new(Usage::default()), cancelled: Arc::new(cancelled), journal });
        Ok(install(context))
    }

    pub fn usage(&self) -> Usage {
        let _ = self.context.check(None);
        self.context.usage.lock().clone()
    }

    pub fn finish(&self, reply: &mut crate::companion::Reply) -> Usage {
        let usage = self.usage();
        if let Some(reason) = usage.stop_reason {
            reply.outcome = if reason == StopReason::Cancelled { TaskOutcome::Cancelled }
                else if usage.actions > 0 || usage.requests > 0 { TaskOutcome::Partial }
                else { TaskOutcome::Blocked };
            reply.text = format!("{} {}", reason.explanation(), reply.text).trim().to_string();
        }
        usage
    }
}

fn install(context: Arc<Context>) -> Scope {
    let previous = CURRENT.with(|c| c.replace(Some(context.clone())));
    Scope { context, previous, _thread_bound: PhantomData }
}

impl Drop for Scope {
    fn drop(&mut self) { CURRENT.with(|c| c.replace(self.previous.take())); }
}

pub(crate) fn current() -> Option<Arc<Context>> { CURRENT.with(|c| c.borrow().clone()) }
pub(crate) fn attach(context: Option<Arc<Context>>) -> Option<Scope> { context.map(install) }
pub fn check() -> Result<(), StopReason> { current().map_or(Ok(()), |c| c.check(None)) }
pub fn charge(work: Work) -> Result<(), StopReason> { current().map_or(Ok(()), |c| c.check(Some(work))) }
pub fn allowed() -> bool { check().is_ok() }

pub fn begin_step(kind: crate::mission_journal::EvidenceKind, operation: &str, account: Option<&str>) -> Result<Option<crate::mission_journal::Step>, StopReason> {
    check()?;
    let Some(journal) = current().and_then(|c| c.journal.clone()) else { return Ok(None) };
    journal.begin(kind, operation, account).map(Some).map_err(|_| StopReason::CheckpointFailure)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::time::Duration;

    #[test]
    fn contracts_preserve_the_whole_goal_and_reject_changed_scope_or_limits() {
        let mut c = TaskContract::new("Find the assignment and save a summary");
        assert!(c.validate(&c.objective).is_ok());
        assert!(c.validate("Just open the browser").is_err());
        c.success_criteria = vec!["Open browser".into()];
        assert!(c.validate(&c.objective).is_err());
        c = TaskContract::new("Read inbox");
        c.budget.max_actions = 0;
        assert!(c.validate(&c.objective).is_err());
        c.budget.max_actions = 201;
        assert!(c.validate(&c.objective).is_err());
        assert!(serde_json::from_str::<AuthorizedScope>("\"unrestricted\"").is_err());
    }

    #[test]
    fn limits_prevent_the_next_action_and_never_reset_after_failure() {
        let mut c = TaskContract::new("Read inbox");
        c.budget.max_actions = 1;
        let s = Scope::enter(&c, || false).unwrap();
        assert!(charge(Work::Action).is_ok());
        assert_eq!(charge(Work::Action), Err(StopReason::Actions));
        assert_eq!(charge(Work::Request), Err(StopReason::Actions));
        let mut reply = crate::companion::Reply { text: "Done".into(), outcome: TaskOutcome::Verified, ..Default::default() };
        s.finish(&mut reply);
        assert_eq!(reply.outcome, TaskOutcome::Partial);
        assert_eq!(s.usage().actions, 1);
    }

    #[test]
    fn every_budget_category_is_enforced() {
        for (work, reason) in [(Work::Round, StopReason::Rounds), (Work::Request, StopReason::Requests)] {
            let mut c = TaskContract::new("Inspect a project");
            c.budget.max_rounds = 1; c.budget.max_requests = 1;
            let _s = Scope::enter(&c, || false).unwrap();
            assert!(charge(work).is_ok());
            assert_eq!(charge(work), Err(reason));
        }
    }

    #[test]
    fn elapsed_time_blocks_actions_and_cancel_overrides_delayed_success() {
        let c = TaskContract::new("Inspect a project");
        let flag = Arc::new(AtomicBool::new(false));
        let signal = flag.clone();
        let s = Scope::enter(&c, move || signal.load(Ordering::SeqCst)).unwrap();
        flag.store(true, Ordering::SeqCst);
        assert_eq!(check(), Err(StopReason::Cancelled));
        let mut reply = crate::companion::Reply { outcome: TaskOutcome::Verified, ..Default::default() };
        s.finish(&mut reply);
        assert_eq!(reply.outcome, TaskOutcome::Cancelled);
        drop(s);
        let context = Arc::new(Context { budget: c.budget, started: Instant::now() - Duration::from_secs(181), usage: Mutex::new(Usage::default()), cancelled: Arc::new(|| false), journal: None });
        let _s = install(context);
        assert_eq!(charge(Work::Action), Err(StopReason::Deadline));
        let mut reply = crate::companion::Reply { outcome: TaskOutcome::Verified, ..Default::default() };
        _s.finish(&mut reply);
        assert_eq!(reply.outcome, TaskOutcome::Blocked);
    }

    #[test]
    fn worker_threads_share_budget_and_scopes_do_not_leak() {
        assert!(current().is_none());
        let mut c = TaskContract::new("Read inbox"); c.budget.max_requests = 1;
        let s = Scope::enter(&c, || false).unwrap();
        let context = current();
        std::thread::spawn(move || { let _s = attach(context); assert!(charge(Work::Request).is_ok()); }).join().unwrap();
        assert_eq!(charge(Work::Request), Err(StopReason::Requests));
        drop(s);
        assert!(charge(Work::Request).is_ok());
        assert!(current().is_none());
    }

    #[test]
    fn panicking_nested_work_restores_the_parent_budget() {
        let mut c = TaskContract::new("Inspect a project"); c.budget.max_actions = 1;
        let _parent = Scope::enter(&c, || false).unwrap();
        assert!(charge(Work::Action).is_ok());
        let panic = std::panic::catch_unwind(|| {
            let _nested = Scope::enter(&TaskContract::new("Read inbox"), || false).unwrap();
            assert!(charge(Work::Action).is_ok());
            panic!("synthetic executor failure");
        });
        assert!(panic.is_err());
        assert_eq!(charge(Work::Action), Err(StopReason::Actions));
    }
}
