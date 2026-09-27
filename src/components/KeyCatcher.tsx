import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, KeyRound, Loader2, XCircle } from "lucide-react";
import { api } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import { applyKey, isExpected, keySaved } from "../lib/setup";
import type { FoundKey } from "../lib/types";

/**
 * "Copy it on the website, come back, done." When Izuki's window comes back
 * into focus with a key on the clipboard (a Gemini key, a Composio key…),
 * this offers to use it — or just uses it, when the user went off to get
 * exactly that key from a setup button.
 */

const DISMISSED = "izuki.keys.dismissed";
const fingerprint = (k: string) => `${k.length}:${k.slice(0, 6)}${k.slice(-6)}`;
function dismissed(k: string): boolean {
  try {
    return (JSON.parse(localStorage.getItem(DISMISSED) ?? "[]") as string[]).includes(fingerprint(k));
  } catch {
    return false;
  }
}
function dismiss(k: string) {
  try {
    const all = JSON.parse(localStorage.getItem(DISMISSED) ?? "[]") as string[];
    localStorage.setItem(DISMISSED, JSON.stringify([...all.slice(-20), fingerprint(k)]));
  } catch {
    /* it'll just be offered again */
  }
}

export function KeyCatcher() {
  const [found, setFound] = useState<FoundKey | null>(null);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const use = async (f: FoundKey) => {
    setWorking(true);
    setFound(f);
    try {
      setResult(await applyKey(f));
    } catch (e) {
      setResult({ ok: false, text: String(e) });
    } finally {
      setWorking(false);
      setFound(null);
      setTimeout(() => setResult(null), 7000);
    }
  };

  useEffect(() => {
    let busy = false;
    const look = async () => {
      if (busy) return;
      busy = true;
      try {
        const f = await api.clipboardKey().catch(() => null);
        const st = useIzuki.getState();
        if (!f || !st.settingsLoaded || keySaved(st.settings, f) || dismissed(f.key)) return;
        if (isExpected(f.kind)) void use(f);
        else setFound((cur) => cur ?? f);
      } finally {
        busy = false;
      }
    };
    const onFocus = () => void look();
    const onVisible = () => document.visibilityState === "visible" && void look();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const first = setTimeout(look, 1500);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(first);
    };
  }, []);

  const show = found || result;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="izk-no-drag absolute inset-x-[18px] bottom-[16px] z-[55] rounded-[18px] border border-izk-violet/35 bg-[#141726]/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          {result ? (
            <div className={`flex items-start gap-2 text-[12px] leading-snug ${result.ok ? "text-izk-good" : "text-izk-danger"}`}>
              {result.ok ? <CheckCircle2 size={15} className="mt-[1px] shrink-0" /> : <XCircle size={15} className="mt-[1px] shrink-0" />}
              <span className="text-izk-ink">{result.text}</span>
            </div>
          ) : (
            found && (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 text-[12px] leading-snug text-izk-ink">
                  <KeyRound size={15} className="mt-[1px] shrink-0 text-izk-violet" />
                  <span>
                    You copied a <b>{found.label}</b>. Want Izuki to use it?
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void use(found)}
                    className="izk-btn-primary h-[30px] flex-1 px-3 text-[12px]"
                  >
                    {working ? <Loader2 size={12} className="animate-spin" /> : "Use it"}
                  </button>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => {
                      dismiss(found.key);
                      setFound(null);
                    }}
                    className="izk-pill h-[30px] px-3 text-[12px]"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
