const status = document.getElementById("status");
const H = { "X-Izuki-Extension": "1", "Content-Type": "application/json" };

fetch("http://127.0.0.1:47615/izuki/ping", { headers: H })
  .then((r) => r.json())
  .then(async () => {
    status.innerHTML = '<span class="ok">● Connected to Izuki on this PC</span>';
    // Focus mode on? Say how long's left.
    try {
      const f = await (await fetch("http://127.0.0.1:47615/izuki/focus", { method: "POST", headers: H, body: "{}" })).json();
      if (f.left) status.innerHTML += `<br>🎯 Focus mode — ${Math.ceil(f.left / 60)} min left`;
    } catch {}
  })
  .catch(() => {
    status.innerHTML = '<span class="no">● Izuki isn\'t running</span><br>Open the Izuki app on your PC — it connects by itself. (Read aloud works anyway.)';
  });

const ask = (task, question) => {
  chrome.runtime.sendMessage({ izukiAsk: { task, question } });
  window.close();
};

document.getElementById("ask").onsubmit = (e) => {
  e.preventDefault();
  const q = document.getElementById("q").value.trim();
  if (q) ask("ask", q);
};
document.querySelectorAll(".quick button").forEach((b) => {
  b.onclick = async () => {
    if (b.dataset.task) return ask(b.dataset.task, "");
    if (b.dataset.q) return ask("ask", b.dataset.q);
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab || !tab.id) return;
    const [r] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => (document.body ? document.body.innerText : "").slice(0, 14000) });
    const text = (r && r.result) || "";
    if (b.dataset.read) {
      chrome.runtime.sendMessage({ izukiSpeak: text });
      window.close();
    } else if (b.dataset.note) {
      status.textContent = "Saving to Nova Notes…";
      try {
        const n = await (await fetch("http://127.0.0.1:47615/izuki/note", { method: "POST", headers: H, body: JSON.stringify({ title: tab.title, url: tab.url, text, page: true }) })).json();
        status.textContent = n.text;
      } catch {
        status.textContent = "Izuki isn't running on this PC.";
      }
    }
  };
});
setTimeout(() => document.getElementById("q").focus(), 50);
