const status = document.getElementById("status");
fetch("http://127.0.0.1:47615/izuki/ping", { headers: { "X-Izuki-Extension": "1" } })
  .then((r) => r.json())
  .then(() => {
    status.innerHTML = '<span class="ok">● Connected to Izuki on this PC</span>';
  })
  .catch(() => {
    status.innerHTML = '<span class="no">● Izuki isn\'t running</span><br>Open the Izuki app on your PC — it connects by itself.';
  });
