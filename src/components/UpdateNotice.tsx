import { useEffect, useState } from "react";
import { api, on } from "../lib/ipc";

/** Updates are an offer, never a surprise install or restart. */
export function UpdateNotice() {
  const [version, setVersion] = useState("");
  useEffect(() => {
    const off = on<string>("izuki://update-available", setVersion);
    return () => void off.then((f) => f());
  }, []);
  if (!version) return null;
  return <div role="status" className="mx-[18px] mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-izk-teal/25 bg-izk-teal/10 p-3 text-[12px] text-izk-ink">
    <span className="flex-1">Izuki {version} is ready. Update when it suits you.</span>
    <button className="izk-pill izk-no-drag px-3 py-1" onClick={() => void api.openUrl("https://nova-izuki.github.io/izuki/#download")}>Download</button>
    <button className="izk-pill izk-no-drag px-3 py-1" onClick={() => setVersion("")}>Later</button>
  </div>;
}
