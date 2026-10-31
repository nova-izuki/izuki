(function(root) {
/** A composer that works on nearly every chat site, tried in order. */
const COMMON_COMPOSER = [
  'div[contenteditable="true"][role="textbox"]',
  'textarea[placeholder]',
  'div[contenteditable="true"]',
  "textarea",
];

const PROVIDERS = [
  {
    id: "izuki",
    name: "Izuki on this PC",
    local: true,
    note: "Answers here in the panel, using the AI you set up in the Izuki app.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    hosts: ["chatgpt.com", "chat.openai.com"],
    open: "https://chatgpt.com/",
    composer: ["#prompt-textarea", ...COMMON_COMPOSER],
    send: ['button[data-testid="send-button"]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "gemini",
    name: "Gemini",
    hosts: ["gemini.google.com"],
    open: "https://gemini.google.com/app",
    composer: [".ql-editor", 'rich-textarea div[contenteditable="true"]', ...COMMON_COMPOSER],
    send: ["button.send-button", 'button[aria-label*="Send" i]'],
  },
  {
    id: "claude",
    name: "Claude",
    hosts: ["claude.ai"],
    open: "https://claude.ai/new",
    composer: ['div[contenteditable="true"].ProseMirror', ...COMMON_COMPOSER],
    send: ['button[aria-label*="Send" i]'],
  },
  {
    id: "copilot",
    name: "Copilot",
    hosts: ["copilot.microsoft.com", "m365.cloud.microsoft"],
    open: "https://copilot.microsoft.com/",
    composer: ["#userInput", 'textarea[id*="prompt" i]', ...COMMON_COMPOSER],
    send: ['button[title*="Submit" i]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    hosts: ["www.perplexity.ai", "perplexity.ai"],
    open: "https://www.perplexity.ai/",
    composer: ['textarea[placeholder*="ask" i]', ...COMMON_COMPOSER],
    send: ['button[aria-label*="Submit" i]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "grok",
    name: "Grok",
    hosts: ["grok.com", "x.com"],
    open: "https://grok.com/",
    composer: COMMON_COMPOSER,
    send: ['button[aria-label*="Submit" i]', 'button[type="submit"]'],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    hosts: ["chat.deepseek.com"],
    open: "https://chat.deepseek.com/",
    composer: ["#chat-input", ...COMMON_COMPOSER],
    send: ['button[aria-label*="Send" i]', 'button[type="submit"]'],
  },
  {
    id: "mistral",
    name: "Le Chat (Mistral)",
    hosts: ["chat.mistral.ai"],
    open: "https://chat.mistral.ai/chat",
    composer: COMMON_COMPOSER,
    send: ['button[type="submit"]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "any",
    name: "Any AI tab I pick",
    hosts: [],
    composer: COMMON_COMPOSER,
    send: ['button[type="submit"]', 'button[aria-label*="Send" i]', 'button[aria-label*="Submit" i]'],
    note: "Pick any tab with a chat box. The panel types the question into it.",
  },
];


const responses = {
  chatgpt:['[data-message-author-role="assistant"]'],
  gemini:['model-response .model-response-text','model-response message-content','model-response'],
  claude:['[data-testid="assistant-message"]','.font-claude-response'],
  copilot:['[data-content="ai-message"]','[data-testid="ai-message"]','[data-author="bot"]'],
  perplexity:['[data-testid="answer"]','[data-message-author-role="assistant"]'],
  grok:['[data-testid="message-assistant"]','[data-message-author-role="assistant"]','.message-bubble.assistant'],
  deepseek:['[data-role="assistant"]','[data-message-author-role="assistant"]','.ds-markdown'],
  mistral:['[data-message-author-role="assistant"]','[data-role="assistant"]'],
};
for (const p of PROVIDERS) if (!p.local) {
  p.responses = responses[p.id] || ['[data-message-author-role="assistant"]','[data-role="assistant"]','.assistant-message'];
  p.users = p.id==='gemini' ? ['user-query'] : ['[data-message-author-role="user"]','[data-testid="user-message"]','[data-role="user"]'];
}
root.IzukiProviderSpecs = PROVIDERS;
})(globalThis);
