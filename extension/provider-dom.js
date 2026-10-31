(function(root) {
async function typeIntoComposer(text, composerSelectors, sendSelectors, autoSend, expectedOrigin = "", requestId = "") {
  if (expectedOrigin && location.origin !== expectedOrigin) return { ok: false, why: "changed-page" };
  const visible = (el) => {
    if (!el) return false;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return box.width > 1 && box.height > 1 && style.visibility !== "hidden" && style.display !== "none";
  };
  let box;
  for (const selector of composerSelectors) {
    const matches = [...new Set([...document.querySelectorAll(selector)].filter(visible))];
    if (matches.length > 1) return { ok: false, why: "ambiguous" };
    if (matches.length === 1) { box = matches[0]; break; }
  }
  if (!box) return { ok: false, why: "no-composer" };
  if (box.disabled || box.readOnly || box.getAttribute("aria-disabled") === "true" || box.getAttribute("type") === "password") return { ok: false, why: "busy" };
  if (String(box.value || box.textContent || "").trim()) return { ok: false, why: "draft" };
  if ([...document.querySelectorAll('button[data-testid="stop-button"],button[aria-label*="Stop generating" i],button[aria-label*="Stop response" i]')].some(visible)) return { ok: false, why: "busy" };

  box.focus();
  const native = box.tagName === "TEXTAREA" || box.tagName === "INPUT";
  // React tracks the value on the element; set it through the prototype
  // setter so its own onChange fires instead of being skipped.
  const setValue = (value) => {
    if (native) {
      const setter = Object.getOwnPropertyDescriptor(
        box.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        "value"
      )?.set;
      if (setter) setter.call(box, value);
      else box.value = value;
    } else {
      box.textContent = value;
    }
    box.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
    box.dispatchEvent(new Event("change", { bubbles: true }));
  };
  if (!native) {
    // A contenteditable editor: paste, which Lexical and ProseMirror both
    // understand. Their handler is asynchronous, so the text is checked
    // after it has had a moment before anything is typed over it.
    const data = new DataTransfer();
    data.setData("text/plain", text);
    box.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  // Did the words actually land? A paste event is a request, not a paste:
  // an editor can cancel it and insert nothing, and synthetic input is
  // frequently discarded on the next render. Pressing Send after that sends
  // an empty message — the panel would say "handed over" while nothing was
  // asked, which is the worst possible answer.
  // Whichever the editor keeps its text in: a textarea's value, or the
  // contenteditable's text. Some editors expose a stale `value` beside a
  // filled editor, so an empty one is never taken over a full one.
  const inBox = () =>
    String(box.value ?? "").replace(/\s+/g, " ").trim() ||
    String(box.textContent ?? "").replace(/\s+/g, " ").trim();
  const probe = text.replace(/\s+/g, " ").trim().slice(0, 24);
  const landed = () => Boolean(probe) && inBox().includes(probe);
  if (!landed()) {
    setValue(text);
    // An editor that re-renders from its own state throws a plain text node
    // away on the next frame. Give it that frame, then believe what's there.
    if (!native) await new Promise((resolve) => setTimeout(resolve, 120));
    if (!landed()) return { ok: false, why: "no-text" };
  }

  if (!autoSend) return { ok: true, sent: false };
  const ready = (el) => visible(el) && !el.disabled && el.getAttribute("aria-disabled") !== "true";
  const form = box.closest?.("form");
  let button;
  for (const selector of sendSelectors) {
    // A generic Submit belongs to this composer, never an unrelated form.
    const scope = selector === 'button[type="submit"]' ? form : document;
    if (!scope) continue;
    const matches = [...new Set([...scope.querySelectorAll(selector)].filter(ready))];
    if (matches.length === 1) { button = matches[0]; break; }
    if (matches.length > 1) return { ok: false, why: "ambiguous-send" };
  }
  if (button) {
    if (requestId && globalThis.__izukiStoppedRelay?.has(requestId)) return {ok:false,why:"stopped"};
    button.click();
    return { ok: true, sent: true };
  }
  return { ok: false, why: "no-send" };
}


// Runs in the connected tab. Never falls back to the whole page or form values.
function readAssistant(responseSelectors, userSelectors, expectedOrigin) {
  if (location.origin !== expectedOrigin) return {ok:false,why:"changed-page"};
  const visible = el => {
    if (!el || el.closest('textarea,input,[contenteditable="true"],[hidden],[aria-hidden="true"],[data-message-author-role="user"]')) return false;
    const style=getComputedStyle(el), box=el.getBoundingClientRect();
    return style.display!=="none" && style.visibility!=="hidden" && box.width>0 && box.height>0;
  };
  let nodes=[];
  for (const selector of responseSelectors.slice(0,8)) {
    nodes=[...document.querySelectorAll(selector)].filter(visible);
    if (nodes.length) break;
  }
  let user="";
  for(const selector of userSelectors.slice(0,8)) {
    const found=[...document.querySelectorAll(selector)].filter(el=>{
      const box=el.getBoundingClientRect(),style=getComputedStyle(el);
      return box.width>0&&box.height>0&&style.display!=="none"&&style.visibility!=="hidden";
    });
    if(found.length){user=(found.at(-1).innerText||found.at(-1).textContent||"").slice(0,18000);break;}
  }
  const stopSelectors='button[data-testid="stop-button"],button[aria-label*="Stop generating" i],button[aria-label*="Stop response" i],button[aria-label*="Stop answering" i],button[aria-label="Stop" i],button.stop-button';
  const busy=[...document.querySelectorAll(stopSelectors)].some(el=>{
    const box=el.getBoundingClientRect(),style=getComputedStyle(el);
    return box.width>0&&box.height>0&&style.display!=="none"&&style.visibility!=="hidden";
  });
  const last=nodes.at(-1);
  return {ok:true,count:nodes.length,text:last?String(last.innerText||last.textContent||"").trim().slice(0,18000):"",user,busy};
}
root.IzukiProviderDOM = { typeIntoComposer, readAssistant };
})(globalThis);
