// Runs inside a normal website. This has no native/IPC privileges.
(() => {
  if (window.__izukiPage) return;
  let targets = new Map();
  const visible = (el) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const privateField = (el) => el.matches('input[type=password],[autocomplete=current-password],[autocomplete=new-password],[autocomplete=one-time-code],[autocomplete^="cc-"]');
  const label = (el) => (el.getAttribute('aria-label') || el.innerText || el.placeholder || el.title || el.name || '').trim().replace(/\s+/g, ' ').slice(0, 100);
  const resolve = (n) => {
    const t = targets.get(n);
    if (!t || !t.el.isConnected || !visible(t.el) || label(t.el) !== t.label) throw Error('The page changed. Read it again before acting.');
    if (privateField(t.el)) throw Error('Sign in or enter private details yourself in the browser.');
    if (t.el.disabled || t.el.getAttribute('aria-disabled') === 'true') throw Error('That control is disabled.');
    return t.el;
  };
  window.__izukiPage = {
    snapshot() {
      targets = new Map();
      const items = []; let n = 0;
      for (const el of document.querySelectorAll('a[href],button,input,textarea,select,[role=button],[role=link],[role=tab],[role=menuitem],[contenteditable=true]')) {
        if (items.length >= 70 || !visible(el) || privateField(el) || el.type === 'hidden') continue;
        const name = label(el), field = el.matches('input,textarea,[contenteditable=true]');
        if (!name && !field) continue;
        targets.set(++n, { el, label: name });
        const kind = field ? 'field' : el.tagName === 'A' ? 'link' : el.tagName === 'SELECT' ? 'menu' : 'button';
        const value = el.matches('input,textarea,select') && el.value ? ' = ' + el.value.slice(0, 160) : '';
        items.push(`${n}. [${kind}${el.disabled ? ', disabled' : ''}] ${name || '(empty)'}${value}`);
      }
      return JSON.stringify({ title: document.title || '', url: location.href,
        text: (document.body?.innerText || '').replace(/\n{3,}/g, '\n\n').slice(0, 9000), items,
        password: [...document.querySelectorAll('input[type=password]')].some(visible) });
    },
    click(n) {
      try { const el = resolve(n); el.scrollIntoView({ block: 'center' }); el.click(); return 'ok'; }
      catch (e) { return String(e.message); }
    },
    type(n, value, submit) {
      try {
        const el = resolve(n);
        if (!el.matches('input,textarea,select,[contenteditable=true]') || el.readOnly) return 'That is not an editable field.';
        el.scrollIntoView({ block: 'center' }); el.focus();
        if (el.isContentEditable) el.textContent = value;
        else {
          const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if ((el.isContentEditable ? el.textContent : el.value) !== value) return 'The field did not keep that text. Read the page again.';
        // A real form submission is one action; synthetic Enter plus submit
        // used to submit some forms twice.
        if (submit) {
          if (el.form?.requestSubmit) el.form.requestSubmit();
          else return 'Text entered. Use the visible submit button to finish.';
        }
        return 'ok';
      } catch (e) { return String(e.message); }
    },
    video(action) {
      const videos = [...document.querySelectorAll('video')].filter(visible).sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight);
      const v = videos[0];
      if (!v) return JSON.stringify({ error: 'Open a video in the Izuki browser first. Embedded players may need opening on their own website.' });
      if (action === 'pause') v.pause();
      else if (action === 'play') { const p = v.play(); if (p?.catch) p.catch(() => {}); }
      else if (action === 'slow') v.playbackRate = 0.75;
      else if (action === 'normal') v.playbackRate = 1;
      const captions = [...document.querySelectorAll('.ytp-caption-segment')].map((e) => e.textContent).join(' ').slice(0, 1800);
      return JSON.stringify({ paused: v.paused, rate: v.playbackRate, time: v.currentTime, title: document.title, url: location.href, captions });
    }
  };

  const toolbar = () => {
    if (!document.body || document.getElementById('__izuki_nav')) return;
    const host = document.createElement('div'); host.id = '__izuki_nav';
    host.style.cssText = 'position:fixed;top:8px;left:3%;width:94%;z-index:2147483647;';
    const root = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = '.bar{display:flex;gap:6px;align-items:center;padding:8px;border:1px solid #ffffff30;border-radius:16px;background:#151326ee;color:white;box-shadow:0 8px 25px #0004;font:13px system-ui}button,input{font:inherit;color:inherit;border:1px solid #ffffff20;background:#ffffff0c;border-radius:9px;padding:6px 9px}button{cursor:pointer}button:hover{background:#7c5cff55}input{min-width:60px;flex:1}span{font-weight:600;color:#70dfd5}';
    const bar = document.createElement('form'); bar.className = 'bar';
    const brand = document.createElement('span'); brand.textContent = 'Izuki'; bar.append(brand);
    const button = (text, title, action) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.title = title; b.setAttribute('aria-label', title); b.onclick = action; bar.append(b); };
    button('←', 'Back', () => history.back()); button('→', 'Forward', () => history.forward()); button('↻', 'Reload', () => location.reload());
    const address = document.createElement('input'); address.type = 'text'; address.setAttribute('aria-label', 'Search or enter a web address'); address.value = location.href === 'about:blank' ? '' : location.href; address.placeholder = 'Search or enter a web address'; bar.append(address);
    const go = () => {
      const text = address.value.trim(); if (!text) return;
      let url;
      try { url = new URL(/^https?:\/\//i.test(text) ? text : !/\s/.test(text) && text.includes('.') ? 'https://' + text : 'https://duckduckgo.com/?q=' + encodeURIComponent(text)); } catch { return; }
      if (['http:', 'https:'].includes(url.protocol)) location.href = url.href;
    };
    button('Go', 'Go', go); bar.onsubmit = (e) => { e.preventDefault(); go(); };
    button('−', 'Collapse toolbar', () => { const collapsed = address.hidden; for (const el of bar.children) if (el !== brand && el !== bar.lastChild) el.hidden = !collapsed; });
    root.append(style, bar); document.body.append(host);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', toolbar, { once: true }); else toolbar();
})();
