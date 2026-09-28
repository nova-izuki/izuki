import { Component, type ErrorInfo, type ReactNode } from "react";
import { api } from "../lib/ipc";

/**
 * A safety net under each part of Izuki's windows. Without it, one error
 * while drawing any part of the page unmounts the whole thing and the
 * panel sits there empty — just the glass, forever — until Izuki restarts.
 *
 * Instead the error goes into Izuki's log (with where it happened, so it
 * can be fixed), and that part quietly builds itself again. If it keeps
 * failing, it shows a small card with a Reload button rather than looping.
 */
interface Props {
  /** Which part this guards, for the log ("panel", "voice", "tab:chat"…). */
  name: string;
  children: ReactNode;
  /** Draw nothing while broken (for invisible parts like the voice engine). */
  silent?: boolean;
  /**
   * Clear whatever this part keeps between visits (the chat's saved
   * conversation) — tried after a second crash, since state that outlives
   * the part would otherwise break it again on every retry.
   */
  onReset?: () => void;
}

interface State {
  broken: boolean;
  attempt: number;
  /** The last error, shown small on the card so a screenshot says what broke. */
  error?: string;
}

const RETRY_MS = 400;
/** More crashes than this within the window and it stops retrying. */
const MAX_RETRIES = 3;
const WINDOW_MS = 30_000;

export class Recover extends Component<Props, State> {
  state: State = { broken: false, attempt: 0 };
  private crashes: number[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const e = error as { message?: string } | undefined;
    return { broken: true, error: String(e?.message ?? error).slice(0, 180) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const now = Date.now();
    this.crashes = [...this.crashes.filter((t) => now - t < WINDOW_MS), now];
    const where = (info.componentStack ?? "").trim().split("\n").slice(0, 6).join(" | ");
    // "[error]" marks it for the bug catcher (bugs.rs), which reports it.
    void api.log(`[error] [${this.props.name}] crashed: ${error?.message ?? error} :: ${where} :: ${(error?.stack ?? "").split("\n").slice(0, 4).join(" | ")}`);
    if (this.crashes.length === 2 && this.props.onReset) {
      void api.log(`[${this.props.name}] starting it fresh`);
      try {
        this.props.onReset();
      } catch {
        /* the retry still happens */
      }
    }
    if (this.crashes.length <= MAX_RETRIES) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.setState((s) => ({ broken: false, attempt: s.attempt + 1 })), RETRY_MS);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    if (!this.state.broken) {
      // A new key on each retry: a fresh copy, not the one that just broke.
      return <RecoverKey key={this.state.attempt}>{this.props.children}</RecoverKey>;
    }
    if (this.props.silent || this.crashes.length <= MAX_RETRIES) return null;
    return (
      <div className="m-4 flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-[13px] text-izk-muted">
        <span className="font-semibold text-izk-ink">Something went wrong here.</span>
        <span>Izuki saved what happened so it can be fixed. Reloading usually sorts it out.</span>
        <button
          type="button"
          onClick={() => {
            try {
              this.props.onReset?.();
            } catch {
              /* reload anyway */
            }
            location.reload();
          }}
          className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[12px] font-semibold text-izk-ink hover:bg-white/14"
        >
          {this.props.onReset ? "Start fresh" : "Reload"}
        </button>
        {this.state.error && <span className="font-mono text-[10.5px] text-izk-muted/70">{this.state.error}</span>}
      </div>
    );
  }
}

function RecoverKey({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Errors outside React (timers, promises, listeners) go to the log too. */
export function logUncaught(name: string) {
  window.addEventListener("error", (e) => {
    const stack = (e.error as Error | undefined)?.stack?.split("\n").slice(0, 5).join(" | ") ?? "";
    void api.log(`[error] [${name}] ${e.message} @ ${e.filename}:${e.lineno}:${e.colno}${stack ? " :: " + stack : ""}`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason as { message?: string; stack?: string } | string | undefined;
    const text = typeof r === "string" ? r : (r?.stack ?? r?.message ?? String(r));
    void api.log(`[error] [${name}] unhandled: ${String(text).split("\n").slice(0, 4).join(" | ")}`);
  });
}
