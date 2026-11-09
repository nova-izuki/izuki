import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Eye, Loader2, MessageSquare, Search } from "lucide-react";
import { api } from "../lib/ipc";
import { getKey } from "../lib/setup";
import { useIzuki } from "../lib/store";
import type { FreeSearch, ProviderConfig } from "../lib/types";

/** "meta/llama-4-maverick-17b-128e-instruct" → "llama-4-maverick-17b-128e-instruct". */
const short = (id: string) => id.split("/").pop() ?? id;

/**
 * A free NVIDIA brain, step by step: where to get the key, what NVIDIA's free
 * tier is, and a search of the person's own key for the free models that fit
 * Izuki. NVIDIA's free list changes every few weeks, so nothing here trusts a
 * model by name: each likely one is tried for real (freebrains.rs).
 */
export function NvidiaGuide({ provider, onModel }: { provider: ProviderConfig; onModel: (model: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<FreeSearch | null>(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState("");
  const hasKey = !!provider.api_key.trim();
  const modelRef = useRef(provider.model);
  modelRef.current = provider.model;
  const onModelRef = useRef(onModel);
  onModelRef.current = onModel;

  /** One search at a time (a copied key and a click can both start one). */
  const running = useRef(false);

  /** `choose`: put the best one in use when the model set now didn't answer. */
  const search = useCallback(
    async (choose: boolean) => {
      if (running.current) return;
      running.current = true;
      setBusy(true);
      setError("");
      setPicked("");
      try {
        // A key pasted a moment ago is still in the debounced save.
        await useIzuki.getState().flushSettings();
        const result = await api.freeModelsSearch("nvidia");
        setFound(result);
        const best = result.working.find((m) => m.sees) ?? result.working[0];
        if (choose && best && !result.working.some((m) => m.id === modelRef.current)) {
          onModelRef.current(best.id);
          setPicked(best.id);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        running.current = false;
        setBusy(false);
      }
    },
    []
  );

  // The key was copied from NVIDIA's page and saved (setup.ts): look for the
  // models that fit straight away, and put the best one in use if needed.
  useEffect(() => {
    const onKey = (e: Event) => {
      if ((e as CustomEvent).detail === "nvidia") void search(true);
    };
    window.addEventListener("izuki:key", onKey);
    return () => window.removeEventListener("izuki:key", onKey);
  }, [search]);

  const best = found?.working.find((m) => m.sees) ?? found?.working[0];

  return (
    <div className="rounded-[12px] border border-izk-hand/25 bg-izk-hand/8 px-2.5 py-2 text-[10.5px] leading-relaxed text-izk-muted">
      <div className="mb-1 text-[11.5px] font-semibold text-izk-ink">A free NVIDIA brain, in three steps</div>
      <ol className="flex list-decimal flex-col gap-1.5 pl-4">
        <li>
          Open NVIDIA's key page and sign in, or join the free{" "}
          <b className="text-izk-ink">NVIDIA Developer Program</b>. No card is needed; NVIDIA may check your phone number.
          <div className="mt-1">
            <button
              type="button"
              onClick={() => getKey("nvidia")}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              <ExternalLink size={11} strokeWidth={2.4} />
              Open build.nvidia.com
            </button>
          </div>
        </li>
        <li>
          Under <b className="text-izk-ink">Settings → API Keys</b>, press <b className="text-izk-ink">Generate API Key</b> and
          copy it (it starts with <span className="font-mono text-izk-ink">nvapi-</span>). Izuki picks it up when you copy it, or
          paste it in the API key box below.
        </li>
        <li>
          Izuki tries the free models on your key and picks the ones that fit: one that can see your screen to do things, and a
          fast one for chat.
          <div className="mt-1">
            <button
              type="button"
              disabled={!hasKey || busy}
              onClick={() => void search(true)}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px] disabled:opacity-50"
              title={hasKey ? "Try the free models on your key" : "Add your key first"}
            >
              {busy ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} strokeWidth={2.4} />}
              {busy ? "Trying the free models… (up to half a minute)" : "Find free models"}
            </button>
          </div>
        </li>
      </ol>

      {error && <div className="mt-1.5 text-izk-danger">{error}</div>}
      {picked && (
        <div className="mt-1.5 text-izk-good">
          Picked <b>{short(picked)}</b> for you: it answered{best?.sees ? " and can see your screen" : ""}.
        </div>
      )}
      {found && !busy && found.working.length === 0 && (
        <div className="mt-1.5">
          None of the {found.tried} free models Izuki tried answered just now. NVIDIA's free models are sometimes busy, so try
          again in a minute. If it keeps happening with a brand-new key, give NVIDIA a little while: some new keys can list
          models before they can use them.
        </div>
      )}
      {found && found.working.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-1" aria-label="Free models that answered">
          {found.working.slice(0, 5).map((m) => {
            const inUse = m.id === provider.model;
            return (
              <li key={m.id} className="flex items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-izk-ink" title={m.id}>
                  {short(m.id)}
                </span>
                {m === best && <span className="shrink-0 text-[10px] font-semibold text-izk-good">Best for Izuki</span>}
                <span className="flex shrink-0 items-center gap-0.5 text-[10px]">
                  {m.sees ? <Eye size={10} /> : <MessageSquare size={10} />}
                  {m.sees ? "sees your screen" : "chat only"} · {(m.ms / 1000).toFixed(1)} s
                </span>
                <button
                  type="button"
                  disabled={inUse}
                  onClick={() => onModel(m.id)}
                  className="izk-pill izk-no-drag h-[22px] shrink-0 px-2 text-[10.5px] disabled:opacity-60"
                >
                  {inUse ? <Check size={10} strokeWidth={2.6} /> : null}
                  {inUse ? "In use" : "Use"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-1.5 text-[10px] text-izk-muted/80">
        NVIDIA's free tier is for trying things out: about 40 requests a minute, and it isn't offered in every country. NVIDIA
        records free-tier requests and may use them to improve its models, so keep private things off the screen while it's
        Izuki's brain.
      </div>
    </div>
  );
}
