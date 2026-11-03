(function(root) {
  // Before anything private goes to "Izuki on this PC" (a question, page text,
  // a selection, a task), check it really is Izuki. Its /ping answer is signed
  // with this user's pairing key: the same key the bridge jobs carry (Izuki
  // wrote it into this folder as pairing.json; src-tauri/src/ext.rs). A program
  // holding Izuki's port while Izuki isn't running can't sign, so nothing is
  // sent to it. A good answer is trusted for a minute.
  //
  // It works the other way too: every request this extension sends is signed
  // with the same key (signedFetch), so another program on this PC (another
  // Windows user's, say) can't pose as the extension to take Izuki's jobs, use
  // this user's AI or start a desktop task. Izuki refuses unsigned requests.
  const PING = "http://127.0.0.1:47615/izuki/ping";
  const hexBytes = (h) => new Uint8Array(h.match(/../g).map((b) => parseInt(b, 16)));
  const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  let key = null, provenUntil = 0;
  async function pairingKey() {
    if (key) return key;
    try {
      const { key: k } = await (await fetch(chrome.runtime.getURL("pairing.json"))).json();
      if (!/^[0-9a-f]{64}$/.test(k || "")) return null;
      key = await crypto.subtle.importKey("raw", hexBytes(k), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
      return key;
    } catch {
      return null;
    }
  }
  /** fetch() to Izuki's bridge, signed: HMAC of "time\npath\nsha256(body)"
   *  (ext.rs request_signed). Unpaired, it goes unsigned and Izuki says to set
   *  the extension up from Izuki. */
  async function signedFetch(url, options = {}) {
    const body = options.body ?? "";
    if (typeof body !== "string") throw new TypeError("Izuki bridge requests send text.");
    const headers = { "X-Izuki-Extension": "1", ...(options.headers || {}) };
    const k = await pairingKey();
    if (k) {
      const time = String(Date.now()), { pathname, search } = new URL(url);
      const digest = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body)));
      headers["X-Izuki-Time"] = time;
      headers["X-Izuki-Signature"] = hex(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`${time}\n${pathname}${search}\n${digest}`)));
    }
    return fetch(url, { ...options, headers });
  }
  /** {ok} if Izuki on this PC proved itself; otherwise {ok:false, why}. */
  async function check() {
    if (Date.now() < provenUntil) return { ok: true };
    const k = await pairingKey();
    if (!k) return { ok: false, why: "unpaired" };
    const nonce = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
    let reply;
    try {
      reply = await (await signedFetch(PING, { headers: { "X-Izuki-Nonce": nonce }, signal: AbortSignal.timeout(2500) })).json();
    } catch {
      return { ok: false, why: "offline" };
    }
    const proof = String(reply?.proof || "");
    const good = /^[0-9a-f]{64}$/.test(proof) && await crypto.subtle.verify("HMAC", k, hexBytes(proof), new TextEncoder().encode(`${nonce}\nping`));
    if (!good) return { ok: false, why: "unproven" };
    provenUntil = Date.now() + 60000;
    return { ok: true };
  }
  const message = {
    unpaired: "Set this extension up from Izuki on your PC first (Izuki: Settings → Browser extension), so it can check it's really talking to Izuki.",
    offline: "Izuki isn't running on this PC — open the Izuki app and try again.",
    unproven: "Something other than Izuki is answering on Izuki's port, so nothing was sent. Restart Izuki, then try again.",
  };
  /** Throws a plain message unless it's really Izuki on this PC. */
  async function require() {
    const r = await check();
    if (!r.ok) throw new Error(message[r.why]);
  }
  root.IzukiBridgeProof = { check, require, message, fetch: signedFetch };
})(globalThis);
