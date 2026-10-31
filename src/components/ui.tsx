import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { foldSections } from "../lib/sections";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const SectionContext = createContext<{
  search: string;
  setSearch: (value: string) => void;
  root: RefObject<HTMLDivElement | null>;
} | null>(null);

/** A compact settings page; each card remembers whether it was open. */
export function CollapsibleSections({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const root = useRef<HTMLDivElement>(null);
  return (
    <SectionContext.Provider value={{ search, setSearch, root }}>
      <div ref={root} data-izk-section-scope="" className="contents">{children}</div>
    </SectionContext.Provider>
  );
}

export function SectionControls() {
  const scope = useContext(SectionContext);
  if (!scope) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-izk-muted">
      <span>Open a section to see its settings.</span>
      <button type="button" disabled={!!scope.search.trim()} className="izk-pill izk-no-drag px-2.5 py-1 disabled:opacity-40" onClick={() => scope.root.current && foldSections(scope.root.current, false)}>Expand all</button>
      <button type="button" disabled={!!scope.search.trim()} className="izk-pill izk-no-drag px-2.5 py-1 disabled:opacity-40" onClick={() => scope.root.current && foldSections(scope.root.current, true)}>Collapse all</button>
    </div>
  );
}

/** A titled glass card — the basic unit of the config panel. */
export function Section({
  title,
  hint,
  right,
  children,
  className,
  contentClassName,
  id,
  group,
  foldable,
}: {
  title?: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
  /** Which part of Settings this belongs to ("Voice", "Island", …). */
  group?: string;
  /** Can be folded away, and remembers that you folded it. */
  foldable?: boolean;
}) {
  const scope = useContext(SectionContext);
  const canFold = !!title && (foldable ?? true);
  const contentId = useId();
  const key = `izk.fold.${id ?? title ?? ""}`;
  const [folded, setFolded] = useState(() => {
    if (!canFold) return false;
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? !!scope : saved === "1";
    } catch {
      return !!scope;
    }
  });
  // Searching temporarily reveals contents without overwriting saved choices.
  const closed = canFold && folded && !scope?.search.trim();
  const fold = (on: boolean) => {
    setFolded(on);
    try {
      localStorage.setItem(key, on ? "1" : "0");
    } catch {
      /* a private window: it just won't be remembered */
    }
  };
  return (
    <div
      id={id}
      // The search box in Settings finds sections by this, and by their words.
      data-izk-section={title ?? ""}
      data-izk-group={group ?? ""}
      data-izk-foldable={canFold ? "" : undefined}
      className={cx("izk-card izk-grain p-4", className)}
    >
      {(title || right) && (
        <div className={cx("flex items-start justify-between gap-3", !closed && "mb-3")}>
          <div className="min-w-0 flex-1">
            {title &&
              (canFold ? (
                <button
                  type="button"
                  onClick={() => fold(!closed)}
                  aria-expanded={!closed}
                  aria-controls={contentId}
                  disabled={!!scope?.search.trim()}
                  data-izk-section-toggle=""
                  className="izk-no-drag flex min-h-8 w-full items-center gap-2 rounded-md text-left text-[13px] font-semibold tracking-[-0.01em] text-izk-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-izk-teal"
                >
                  <span aria-hidden className={cx("text-[10px] text-izk-muted transition-transform", closed ? "" : "rotate-90")}>▶</span>
                  {title}
                </button>
              ) : (
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-izk-ink">{title}</h3>
              ))}
            {hint && !closed && <p className="mt-0.5 text-[11.5px] leading-snug text-izk-muted">{hint}</p>}
          </div>
          {right && <div onClickCapture={() => { if (closed) fold(false); }}>{right}</div>}
        </div>
      )}
      {/* Keep inputs and drafts alive; hidden controls cannot receive focus. */}
      <div id={contentId} hidden={closed} style={closed ? { display: "none" } : undefined} className={contentClassName}>{children}</div>
    </div>
  );
}

/**
 * Find any setting by name.
 *
 * Settings has grown past what anyone can scan, so this hides every section
 * that doesn't mention what you typed. It reads the rendered words rather
 * than a hand-kept list, so a setting added later is findable with no extra
 * work — and nothing can fall out of the index by being forgotten.
 */
export function SettingsSearch({ placeholder = "Search settings…" }: { placeholder?: string }) {
  const scope = useContext(SectionContext);
  const [localQuery, setLocalQuery] = useState("");
  const q = scope?.search ?? localQuery;
  const setQ = scope?.setSearch ?? setLocalQuery;
  useEffect(() => {
    const want = q.trim().toLowerCase();
    const root = scope?.root.current ?? document;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-izk-section]"));
    for (const el of sections) {
      const hit = !want || (el.textContent ?? "").toLowerCase().includes(want) || (el.dataset.izkGroup ?? "").toLowerCase().includes(want);
      el.style.display = hit ? "" : "none";
    }
    return () => {
      for (const el of sections) el.style.display = "";
    };
  }, [q]);
  return (
    <div className="izk-card izk-grain flex items-center gap-2 px-3 py-2">
      <span aria-hidden className="text-[12px] text-izk-muted">🔍</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search settings"
        className="izk-no-drag min-w-0 flex-1 bg-transparent text-[12.5px] text-izk-ink outline-none placeholder:text-izk-muted"
      />
      {q && (
        <button type="button" onClick={() => setQ("")} data-izk-clear-search="" aria-label="Clear the search" className="izk-pill px-2 py-0.5 text-[11px]">
          Clear
        </button>
      )}
    </div>
  );
}

/** A label + control row with the iOS settings rhythm. */
export function Row({
  label,
  hint,
  children,
  icon,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    // Wraps rather than squeezes: a control too wide to sit beside its
    // label (a five-way picker) drops onto its own line, right-aligned,
    // instead of crushing the label into a one-word column.
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
      <div className="flex min-w-[160px] flex-1 basis-[160px] items-center gap-2.5">
        {icon && <span className="shrink-0 text-izk-muted">{icon}</span>}
        <div className="min-w-0">
          <div className="text-[13px] font-medium tracking-[-0.01em] text-izk-ink">{label}</div>
          {hint && <div className="mt-0.5 text-[11px] leading-snug text-izk-muted">{hint}</div>}
        </div>
      </div>
      <div className="ml-auto max-w-full shrink-0">{children}</div>
    </div>
  );
}

/** Big iOS-style toggle with a gradient track. */
export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "izk-no-drag relative h-[30px] w-[52px] shrink-0 rounded-full border transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-izk-violet/25",
        disabled && "cursor-not-allowed opacity-40",
        checked
          ? "border-white/30 shadow-[0_6px_20px_rgba(124,92,255,0.45),inset_0_1px_0_rgba(255,255,255,0.45)]"
          : "border-white/10 bg-black/35 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"
      )}
      style={
        checked
          ? { background: "linear-gradient(135deg,#7C5CFF 0%,#4ECDC4 100%)" }
          : undefined
      }
    >
      <span
        className={cx(
          "absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white transition-[left,transform] duration-300",
          "shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
        )}
        style={{
          left: checked ? 25 : 3,
          transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </button>
  );
}

/** Pill segmented control — used for tabs and small enum pickers. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  compact = false,
}: {
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  /** Tight space: every option keeps its name (a row of bare icons left
   *  people guessing which tab was which); only the chosen one shows its icon. */
  compact?: boolean;
}) {
  return (
    <div
      className={cx(
        "izk-no-drag izk-inset inline-flex items-center gap-1 rounded-full p-1",
        size === "sm" ? "text-[11.5px]" : "text-[12.5px]"
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            title={o.label}
            aria-label={o.label}
            onClick={() => onChange(o.value)}
            className={cx(
              "relative flex items-center gap-1.5 rounded-full font-medium transition-all duration-200",
              size === "sm" ? (compact ? "px-2 py-1" : "px-2.5 py-1") : "px-3 py-1.5",
              active
                ? "text-white shadow-[0_4px_14px_rgba(124,92,255,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]"
                : "text-izk-muted hover:text-izk-ink"
            )}
            style={
              active
                ? { background: "linear-gradient(135deg,rgba(124,92,255,0.9),rgba(78,205,196,0.75))" }
                : undefined
            }
          >
            {(!compact || active) && o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Gradient-filled range input. */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="izk-no-drag flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="izk-range h-[6px] w-[128px] cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(90deg,#7C5CFF 0%,#4ECDC4 ${pct}%,rgba(255,255,255,0.1) ${pct}%,rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <span className="w-[54px] text-right font-mono text-[11.5px] text-izk-muted">
        {value}
        {suffix}
      </span>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/7 text-izk-muted border-white/10",
    good: "bg-izk-good/12 text-izk-good border-izk-good/25",
    warn: "bg-izk-hand/12 text-izk-hand border-izk-hand/25",
    bad: "bg-izk-danger/12 text-izk-danger border-izk-danger/25",
    accent: "bg-izk-violet/15 text-izk-violet border-izk-violet/30",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10.5px] font-semibold tracking-[0.01em]",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

/** Monospace keycap, e.g. Ctrl + Shift + I. */
export function Kbd({ combo }: { combo: string }) {
  const keys = combo.split("+").map((k) => k.trim());
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((k, i) => (
        <span key={`${k}-${i}`} className="inline-flex items-center gap-1">
          <kbd className="rounded-[7px] border border-white/14 bg-white/8 px-[7px] py-[2px] font-mono text-[10.5px] font-semibold text-izk-ink shadow-[inset_0_-1px_0_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.1)]">
            {k}
          </kbd>
          {i < keys.length - 1 && <span className="text-[10px] text-izk-muted">+</span>}
        </span>
      ))}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 px-6 py-10 text-center">
      <div className="izk-breathe mb-3 text-izk-muted">{icon}</div>
      <div className="text-[13px] font-semibold text-izk-ink">{title}</div>
      <p className="mt-1 max-w-[280px] text-[11.5px] leading-relaxed text-izk-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
