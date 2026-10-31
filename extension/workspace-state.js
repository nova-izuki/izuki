// Shared by the service worker and panel. Conversations stay in this browser.
(function (root) {
  const KEY = "izkWorkspaceHistory";
  const cut = (value, max) => {
    let text = String(value || "").slice(0, max);
    if (/[\uD800-\uDBFF]$/.test(text)) text = text.slice(0, -1);
    return text;
  };
  function messages(value) {
    return Array.isArray(value) ? value.filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim())
      .slice(-20).map(m => ({ role:m.role, content:cut(m.content, m.role === "user" ? 6000 : 16000) })) : [];
  }
  function clean(value) {
    const state = { epoch:Math.max(0, Number.isSafeInteger(value?.epoch) ? value.epoch : 0), active:{}, chats:[],
      // Chats deleted one by one: an answer still running for one of these is
      // not saved back. (Clear all bumps the epoch instead.) Kept through
      // clean(), which runs on every save.
      removed:(Array.isArray(value?.removed) ? value.removed : []).filter(id => typeof id === "string" && id && id.length <= 80).slice(-40) };
    if (value?.active && typeof value.active === "object") {
      for (const [key, id] of Object.entries(value.active).slice(-30)) if (/^\d+$/.test(key) && typeof id === "string" && id.length <= 80) state.active[key] = id;
    }
    for (const item of Array.isArray(value?.chats) ? value.chats : []) {
      if (!item || typeof item.id !== "string" || !item.id || item.id.length > 80 || state.chats.some(c => c.id === item.id)) continue;
      const history = messages(item.history);
      if (!history.some(m => m.role === "assistant")) continue;
      state.chats.push({ id:item.id, title:cut(item.title || history.find(m => m.role === "user")?.content || "Chat", 90),
        updatedAt:Math.min(Date.now(), Math.max(0, Number(item.updatedAt) || 0)), provider:cut(item.provider, 60), history,
        requests:(Array.isArray(item.requests) ? item.requests : []).filter(id => typeof id === "string" && id.length <= 80).slice(-40) });
    }
    state.chats.sort((a,b) => b.updatedAt-a.updatedAt);
    state.chats = state.chats.slice(0,20);
    while (state.chats.length > 1 && JSON.stringify(state.chats).length > 500000) state.chats.pop();
    return state;
  }
  function createHistoryStore(storage, uuid = () => crypto.randomUUID()) {
    let lane = Promise.resolve();
    const transaction = job => {
      const result = lane.then(async () => {
        const state = clean((await storage.get(KEY))?.[KEY]);
        const response = await job(state);
        await storage.set({ [KEY]:clean(state) });
        return response;
      });
      lane = result.catch(() => {});
      return result;
    };
    const snapshot = (state, windowId) => ({ ok:true, epoch:state.epoch, id:state.active[windowId] || null,
      chat:state.chats.find(c => c.id === state.active[windowId]) || null,
      chats:state.chats.map(({id,title,updatedAt,provider}) => ({id,title,updatedAt,provider})) });
    const windowKey = id => { if (!Number.isSafeInteger(id) || id < 0) throw Error("Choose a browser window first."); return String(id); };
    return {
      load(windowId) { const key=windowKey(windowId); return transaction(s => snapshot(s,key)); },
      begin(windowId) { const key=windowKey(windowId); return transaction(s => { if (!s.active[key]) s.active[key]=uuid(); return snapshot(s,key); }); },
      fresh(windowId) { const key=windowKey(windowId); return transaction(s => { s.active[key]=uuid(); return snapshot(s,key); }); },
      open(windowId,id) { const key=windowKey(windowId); return transaction(s => {
        if (!s.chats.some(c=>c.id===id)) throw Error("That chat was removed. Choose another recent chat.");
        s.active[key]=id; return snapshot(s,key);
      }); },
      commit(windowId, entry) { const key=windowKey(windowId); return transaction(s => {
        if (entry.epoch !== s.epoch) return {ok:false, text:"History was cleared while this answer was running. The old chat was not saved again."};
        if ((s.removed||[]).includes(entry.id)) return {ok:false, text:"That chat was deleted while this answer was running, so it wasn't saved back."};
        if (typeof entry.id !== "string" || !entry.id || entry.id.length>80 || typeof entry.requestId!=="string" || !entry.requestId || entry.requestId.length>80) throw Error("The chat could not be identified.");
        const pair = messages([{role:"user",content:entry.question},{role:"assistant",content:entry.answer}]);
        if (pair.length!==2) throw Error("An empty answer is not a saved conversation.");
        let chat=s.chats.find(c=>c.id===entry.id);
        if (!chat) { chat={id:entry.id,title:cut(pair[0].content,90),updatedAt:Date.now(),provider:"",history:[],requests:[]}; s.chats.push(chat); }
        if (!chat.requests.includes(entry.requestId)) {
          chat.history=messages([...chat.history,...pair]); chat.requests=[...chat.requests,entry.requestId].slice(-40);
          chat.updatedAt=Date.now(); chat.provider=cut(entry.provider,60);
        }
        // A late answer never selects an abandoned chat after New chat.
        const saved=clean(s); Object.assign(s,saved); return snapshot(s,key);
      }); },
      forget(windowId,id) { const key=windowKey(windowId); return transaction(s => {
        // Only this chat's late answers are refused. Bumping the epoch here (as
        // Clear all does) refused every answer still running, for every chat.
        s.removed=[...(s.removed||[]).filter(r=>r!==id),id].slice(-40);
        s.chats=s.chats.filter(c=>c.id!==id); for(const window of Object.keys(s.active)) if(s.active[window]===id) delete s.active[window];
        return snapshot(s,key);
      }); },
      clear(windowId) { const key=windowKey(windowId); return transaction(s => { s.epoch++;s.chats=[];s.active={};return snapshot(s,key); }); },
    };
  }
  root.IzukiWorkspaceState = { KEY, cut, messages, clean, createHistoryStore };
})(globalThis);
