import { useCallback, useEffect, useState } from "react";
import { CreditCard, FileUp, Loader2, Plus, ShoppingBag, Trash2, TrendingUp, Wallet, X } from "lucide-react";
import { api, type MoneyView, type ShopView } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import { Section, cx } from "./ui";

/**
 * Empire part two: money and the shop (money.rs, shop.rs). A bank statement
 * understood — where it went, what's unusual, what repeats every month — a
 * watchlist, and Stripe/Shopify read with read-only keys. Nothing here can
 * move money, buy, sell or change anything.
 */

const usd = (v: number) => `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2, maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 })}`;
const cents = (c: number, cur: string) => (cur.toLowerCase() === "usd" ? usd(c / 100) : `${(c / 100).toFixed(2)} ${cur.toUpperCase()}`);
const monthLabel = (m: string) => new Date(`${m}-01T12:00:00`).toLocaleDateString([], { month: "short" });

export function MoneyCard() {
  const [view, setView] = useState<MoneyView | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [symbol, setSymbol] = useState("");
  const [prices, setPrices] = useState("");
  const reload = useCallback(() => void api.moneyView().then(setView).catch(() => undefined), []);
  useEffect(reload, [reload]);

  const run = (key: string, what: () => Promise<void>) => {
    setBusy(key);
    setNote("");
    void what()
      .catch((e) => setNote(String(e)))
      .finally(() => setBusy(null));
  };

  const months = view?.months ?? [];
  const now = months[months.length - 1];
  const top = Math.max(1, ...months.map((m) => Math.max(m.money_in, m.money_out)));
  const kept = now ? now.money_in - now.money_out : 0;
  const catTop = Math.max(1, ...(now?.categories ?? []).map(([, v]) => v));
  const subTotal = (view?.subscriptions ?? []).reduce((n, s) => n + s.amount, 0);

  return (
    <Section
      id="apps-money"
      title="Money"
      hint="Your bank statement, understood — on this PC only. Izuki never moves money, buys or sells."
      right={<Wallet size={14} className="text-izk-muted" />}
    >
      {!view || view.transactions === 0 ? (
        <div className="izk-inset rounded-[14px] p-3">
          <p className="text-[12px] text-izk-ink">Download a statement (CSV) from your bank's website and bring it in.</p>
          <p className="mt-1 text-[11px] text-izk-muted">Then ask “how much did I spend this month?”, “any unusual spending?” or “what subscriptions am I paying for?”.</p>
        </div>
      ) : (
        <>
          {/* This month, big */}
          {now && (
            <div className="grid grid-cols-3 gap-2">
              {[
                ["In", now.money_in, "text-emerald-300"],
                ["Out", now.money_out, "text-rose-300"],
                [kept >= 0 ? "Kept" : "Down", Math.abs(kept), kept >= 0 ? "text-izk-teal" : "text-amber-300"],
              ].map(([label, v, tone]) => (
                <div key={label as string} className="izk-inset rounded-[14px] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-izk-muted">{label as string}</div>
                  <div className={cx("mt-0.5 text-[18px] font-semibold tabular-nums tracking-tight", tone as string)}>{usd(v as number)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Six months: in vs out */}
          {months.length > 1 && (
            <div className="izk-inset mt-2 flex h-[92px] items-end gap-2 rounded-[14px] px-3 pb-2 pt-3" aria-label="Money in and out by month">
              {months.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-[56px] w-full items-end justify-center gap-[3px]">
                    <div className="w-[38%] rounded-t-[3px] bg-emerald-400/70 transition-[height] duration-500" style={{ height: `${(m.money_in / top) * 100}%` }} title={`In ${usd(m.money_in)}`} />
                    <div className="w-[38%] rounded-t-[3px] bg-rose-400/70 transition-[height] duration-500" style={{ height: `${(m.money_out / top) * 100}%` }} title={`Out ${usd(m.money_out)}`} />
                  </div>
                  <span className="text-[9.5px] text-izk-muted">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Where it went */}
          {now && now.categories.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {now.categories.slice(0, 6).map(([cat, v]) => (
                <div key={cat} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-[150px] shrink-0 truncate text-izk-ink">{cat}</span>
                  <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-izk-teal/70" style={{ width: `${(v / catTop) * 100}%` }} />
                  </div>
                  <span className="w-[70px] shrink-0 text-right tabular-nums text-izk-muted">{usd(v)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Worth a look */}
          {view.unusual.length > 0 && (
            <div className="mt-2 rounded-[14px] border border-amber-300/25 bg-amber-300/[0.06] p-2.5">
              <div className="text-[12px] font-semibold text-izk-ink">Worth a look ({view.unusual.length})</div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-izk-muted">
                {view.unusual.slice(0, 5).map((u, i) => (
                  <li key={i}>
                    <span className="text-izk-ink">{u.desc}</span> {usd(u.amount)} · {u.why}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Every month */}
          {view.subscriptions.length > 0 && (
            <div className="izk-inset mt-2 rounded-[14px] p-2.5">
              <div className="flex items-baseline justify-between text-[12px] font-semibold text-izk-ink">
                <span>Every month</span>
                <span className="tabular-nums text-izk-muted">
                  {usd(subTotal)}/mo · {usd(subTotal * 12)}/yr
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {view.subscriptions.slice(0, 12).map((s) => (
                  <span key={s.merchant} className={cx("rounded-full px-2 py-0.5 text-[11px]", s.went_up ? "bg-amber-300/15 text-amber-200" : "bg-white/[0.07] text-izk-ink")} title={s.went_up ? `Went up from ${usd(s.went_up[0])}` : `Last charged ${s.last}`}>
                    {s.merchant} {usd(s.amount)}
                    {s.went_up && " ↑"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run("import", async () => {
              const said = await api.moneyImport();
              if (said) setNote(said);
              reload();
            })
          }
          className="izk-btn-primary izk-no-drag flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] disabled:opacity-50"
        >
          {busy === "import" ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />} Import a statement (CSV)
        </button>
        {view && view.transactions > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Forget every imported transaction? (Your bank isn't touched.)")) run("clear", async () => { await api.moneyClear(); reload(); });
            }}
            className="izk-pill izk-no-drag flex items-center gap-1 px-2.5 py-1 text-[11px]"
          >
            <Trash2 size={11} /> Forget all
          </button>
        )}
        {view && view.transactions > 0 && <span className="text-[10.5px] text-izk-muted">{view.transactions} transactions</span>}
      </div>

      {/* Watchlist */}
      <div className="izk-inset mt-3 rounded-[14px] p-2.5">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-izk-ink">
          <TrendingUp size={13} /> Watchlist <span className="font-normal text-izk-muted">· prices only, never advice</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {(view?.watchlist ?? []).map((s) => (
            <span key={s} className="flex items-center gap-1 rounded-full bg-white/[0.07] py-0.5 pl-2 pr-1 text-[11px] text-izk-ink">
              {s}
              <button type="button" aria-label={`Remove ${s}`} onClick={() => run("watch", async () => { await api.moneyWatch(s, false); reload(); })} className="rounded-full p-0.5 text-izk-muted hover:text-izk-danger">
                <X size={10} />
              </button>
            </span>
          ))}
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              const s = symbol.trim();
              if (s) run("watch", async () => { await api.moneyWatch(s, true); setSymbol(""); reload(); });
            }}
          >
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" maxLength={12} className="izk-field izk-no-drag h-[24px] w-[72px] py-0 text-[11px] uppercase" />
            <button type="submit" aria-label="Add to watchlist" className="izk-pill izk-no-drag h-[24px] px-1.5"><Plus size={11} /></button>
          </form>
          {(view?.watchlist.length ?? 0) > 0 && (
            <button type="button" disabled={busy !== null} onClick={() => run("prices", async () => setPrices(await api.moneyQuotes()))} className="izk-pill izk-no-drag ml-auto px-2.5 py-0.5 text-[11px]">
              {busy === "prices" ? <Loader2 size={11} className="animate-spin" /> : "Prices now"}
            </button>
          )}
        </div>
        {prices && <pre className="mt-1.5 whitespace-pre-wrap text-[11px] leading-snug text-izk-ink">{prices}</pre>}
      </div>

      <ShopPanel />
      {note && <p className="mt-2 text-[11.5px] text-izk-ink">{note}</p>}
    </Section>
  );
}

/** Stripe and Shopify, read with read-only keys. */
function ShopPanel() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [shop, setShop] = useState<ShopView | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const linked = !!settings.stripe_key?.trim() || !!settings.shopify_token?.trim();
  const check = () => {
    setBusy(true);
    // A key just pasted must be saved before the PC reads it.
    void useIzuki
      .getState()
      .flushSettings()
      .then(() => api.shopView())
      .then(setShop)
      .catch(() => undefined)
      .finally(() => setBusy(false));
  };
  useEffect(() => {
    if (linked) check();
    // Once, when the card opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="izk-inset mt-3 rounded-[14px] p-2.5">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-izk-ink">
        <ShoppingBag size={13} /> Shop & payments <span className="font-normal text-izk-muted">· read only</span>
        <button type="button" onClick={() => setOpen((o) => !o)} className="izk-pill izk-no-drag ml-auto px-2 py-0.5 text-[10.5px]">
          {open ? "Done" : linked ? "Keys" : "Connect"}
        </button>
        {linked && (
          <button type="button" disabled={busy} onClick={check} className="izk-pill izk-no-drag px-2 py-0.5 text-[10.5px]">
            {busy ? <Loader2 size={11} className="animate-spin" /> : "Check now"}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 space-y-2 text-[11px] text-izk-muted">
          <div>
            <div className="flex items-center gap-1 text-izk-ink"><CreditCard size={12} /> Stripe — a <b>restricted</b> key (Developers → API keys → Create restricted key; Charges and Balance: Read).</div>
            <input type="password" autoComplete="off" value={settings.stripe_key ?? ""} onChange={(e) => patch({ stripe_key: e.target.value.trim() })} placeholder="rk_live_…" className="izk-field izk-no-drag mt-1 w-full py-1 text-[11.5px]" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-izk-ink"><ShoppingBag size={12} /> Shopify — your store, and an Admin API token from a custom app (Settings → Apps → Develop apps; read_orders, read_products).</div>
            <div className="mt-1 flex gap-1.5">
              <input value={settings.shopify_store ?? ""} onChange={(e) => patch({ shopify_store: e.target.value.trim() })} placeholder="my-store.myshopify.com" className="izk-field izk-no-drag w-1/2 py-1 text-[11.5px]" />
              <input type="password" autoComplete="off" value={settings.shopify_token ?? ""} onChange={(e) => patch({ shopify_token: e.target.value.trim() })} placeholder="shpat_…" className="izk-field izk-no-drag w-1/2 py-1 text-[11.5px]" />
            </div>
          </div>
          <p>Keys stay on this PC — never in the log, never sent to your phone. Izuki can only read: no charges, refunds or changes.</p>
        </div>
      )}

      {!linked && !open && <p className="mt-1 text-[11px] text-izk-muted">Got a shop? Connect Stripe or Shopify and ask “how are sales today?”, “any new orders?”, “what's low on stock?”.</p>}

      {shop?.stripe && (
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
          {[
            ["Today", cents(shop.stripe.today, shop.stripe.currency), `${shop.stripe.today_count} payments`],
            ["This month", cents(shop.stripe.month, shop.stripe.currency), `${shop.stripe.month_count} payments`],
            ["Available", cents(shop.stripe.available, shop.stripe.currency), `${cents(shop.stripe.pending, shop.stripe.currency)} on the way`],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-[10px] bg-white/[0.05] px-2 py-1.5">
              <div className="text-[9.5px] uppercase tracking-[0.12em] text-izk-muted">{a}</div>
              <div className="text-[14px] font-semibold tabular-nums text-izk-ink">{b}</div>
              <div className="text-[9.5px] text-izk-muted">{c}</div>
            </div>
          ))}
        </div>
      )}
      {shop?.stripe_error && <p className="mt-1.5 text-[11px] text-izk-danger">Stripe: {shop.stripe_error}</p>}
      {shop?.shopify && (
        <div className="mt-2 text-[11.5px] text-izk-ink">
          <div>
            🛍️ Today {shop.shopify.today_orders} orders · this month {shop.shopify.month_orders}
            {shop.shopify.to_ship > 0 && <span className="text-amber-200"> · 📦 {shop.shopify.to_ship} to send</span>}
          </div>
          {shop.shopify.low_stock.length > 0 && <div className="mt-0.5 text-amber-200">⚠️ Low: {shop.shopify.low_stock.slice(0, 4).map(([n, q]) => `${n} (${q})`).join(", ")}</div>}
        </div>
      )}
      {shop?.shopify_error && <p className="mt-1.5 text-[11px] text-izk-danger">Shopify: {shop.shopify_error}</p>}
    </div>
  );
}
