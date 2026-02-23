/**
 * ═══════════════════════════════════════════════════════════
 *  Beesto AI — v2.0  |  app.js
 *  Full Alpine.js application logic
 * ═══════════════════════════════════════════════════════════
 */
function app() {
  return {

    /* ─────────────────────────────── UI STATE */
    theme: 'dark',
    isDark: true,
    sidebarOpen: window.innerWidth >= 768,
    showSettings: false,
    dragOver: false,
    searchQuery: '',
    toast: '',
    _toastTimer: null,

    /* ─────────────────────────────── CHAT STATE */
    chats: [],
    currentChatId: null,
    currentChat: null,
    userMessage: '',
    attachments: [],
    isGenerating: false,
    streamingContent: '',
    abortController: null,

    /* ─────────────────────────────── SETTINGS */
    systemPrompt: 'You are Beesto AI, a highly capable, friendly, and articulate assistant. Provide clear, accurate, and well-formatted responses. Use markdown for structure when it adds clarity — code blocks for code, tables for comparisons, bullet points for lists.',

    apiKeys: { groq: '', gemini: '', xai: '', openrouter: '', openai: '' },

    apiKeyProviders: [
      { id: 'openrouter', name: 'OpenRouter',    placeholder: 'sk-or-v1-…',    hint: 'Recommended — access 100+ models with one key', link: 'https://openrouter.ai/keys',                  visible: false },
      { id: 'openai',     name: 'OpenAI',         placeholder: 'sk-…',           hint: 'GPT-4o, GPT-4o Mini, o4-mini',                  link: 'https://platform.openai.com/api-keys',        visible: false },
      { id: 'gemini',     name: 'Google Gemini',  placeholder: 'AIzaSy…',        hint: 'Gemini 2.5 Pro, Flash and more',                 link: 'https://aistudio.google.com/apikey',          visible: false },
      { id: 'groq',       name: 'Groq',           placeholder: 'gsk_…',          hint: 'Ultra-fast inference — LLaMA, Mixtral, Gemma',   link: 'https://console.groq.com/keys',               visible: false },
      { id: 'xai',        name: 'xAI (Grok)',     placeholder: 'xai-…',          hint: 'Grok 3, Grok 3 Mini, Grok Vision',              link: 'https://console.x.ai',                        visible: false },
    ],

    /* ─────────────────────────────── MODELS */
    selectedModel: { id: 'openrouter/auto', name: 'Auto (Best)', provider: 'openrouter', vision: true, fast: false },

    modelProviders: [
      {
        name: 'OpenRouter',
        models: [
          { id: 'openrouter/auto',                       name: 'Auto (Best Model)',       provider: 'openrouter', vision: true,  fast: false },
          { id: 'anthropic/claude-sonnet-4-5',           name: 'Claude Sonnet 4.5',       provider: 'openrouter', vision: true,  fast: false },
          { id: 'anthropic/claude-3-5-haiku',            name: 'Claude 3.5 Haiku',        provider: 'openrouter', vision: true,  fast: true  },
          { id: 'openai/gpt-4o',                         name: 'GPT-4o',                  provider: 'openrouter', vision: true,  fast: false },
          { id: 'openai/gpt-4o-mini',                    name: 'GPT-4o Mini',             provider: 'openrouter', vision: true,  fast: true  },
          { id: 'google/gemini-2.5-pro-preview',         name: 'Gemini 2.5 Pro',          provider: 'openrouter', vision: true,  fast: false },
          { id: 'google/gemini-2.5-flash-preview',       name: 'Gemini 2.5 Flash',        provider: 'openrouter', vision: true,  fast: true  },
          { id: 'meta-llama/llama-4-maverick',           name: 'LLaMA 4 Maverick',        provider: 'openrouter', vision: false, fast: false },
          { id: 'deepseek/deepseek-r1',                  name: 'DeepSeek R1',             provider: 'openrouter', vision: false, fast: false },
          { id: 'mistralai/mistral-large',               name: 'Mistral Large',           provider: 'openrouter', vision: false, fast: false },
          { id: 'qwen/qwen-2.5-72b-instruct',            name: 'Qwen 2.5 72B',            provider: 'openrouter', vision: false, fast: false },
          { id: 'x-ai/grok-3-beta',                      name: 'Grok 3 (via OpenRouter)', provider: 'openrouter', vision: false, fast: false },
        ]
      },
      {
        name: 'OpenAI',
        models: [
          { id: 'gpt-4o',       name: 'GPT-4o',         provider: 'openai', vision: true,  fast: false },
          { id: 'gpt-4o-mini',  name: 'GPT-4o Mini',    provider: 'openai', vision: true,  fast: true  },
          { id: 'gpt-4.1',      name: 'GPT-4.1',        provider: 'openai', vision: true,  fast: false },
          { id: 'o4-mini',      name: 'o4 Mini',        provider: 'openai', vision: false, fast: true  },
          { id: 'o3-mini',      name: 'o3 Mini',        provider: 'openai', vision: false, fast: false },
        ]
      },
      {
        name: 'Google Gemini',
        models: [
          { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', provider: 'gemini', vision: true, fast: true  },
          { id: 'gemini-2.5-pro-preview-05-06',   name: 'Gemini 2.5 Pro',   provider: 'gemini', vision: true, fast: false },
          { id: 'gemini-2.0-flash',               name: 'Gemini 2.0 Flash', provider: 'gemini', vision: true, fast: true  },
          { id: 'gemini-1.5-flash',               name: 'Gemini 1.5 Flash', provider: 'gemini', vision: true, fast: true  },
          { id: 'gemini-1.5-pro',                 name: 'Gemini 1.5 Pro',   provider: 'gemini', vision: true, fast: false },
        ]
      },
      {
        name: 'Groq (Ultra-Fast)',
        models: [
          { id: 'llama-3.3-70b-versatile',      name: 'LLaMA 3.3 70B',          provider: 'groq', vision: false, fast: true },
          { id: 'llama-3.1-8b-instant',         name: 'LLaMA 3.1 8B',           provider: 'groq', vision: false, fast: true },
          { id: 'mixtral-8x7b-32768',           name: 'Mixtral 8x7B',           provider: 'groq', vision: false, fast: true },
          { id: 'gemma2-9b-it',                 name: 'Gemma 2 9B',             provider: 'groq', vision: false, fast: true },
          { id: 'llama-3.2-90b-vision-preview', name: 'LLaMA 3.2 90B Vision',  provider: 'groq', vision: true,  fast: true },
          { id: 'llama-3.2-11b-vision-preview', name: 'LLaMA 3.2 11B Vision',  provider: 'groq', vision: true,  fast: true },
        ]
      },
      {
        name: 'xAI (Grok)',
        models: [
          { id: 'grok-3',             name: 'Grok 3',        provider: 'xai', vision: false, fast: false },
          { id: 'grok-3-mini',        name: 'Grok 3 Mini',   provider: 'xai', vision: false, fast: true  },
          { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', provider: 'xai', vision: true,  fast: false },
        ]
      },
    ],

    /* ─────────────────────────────── WELCOME SUGGESTIONS */
    suggestions: [
      { icon: '💡', title: 'Explain a concept',    subtitle: 'Break down complex topics simply',     text: 'Explain how large language models work in simple terms' },
      { icon: '🧑‍💻', title: 'Write code',           subtitle: 'Any language, any task',               text: 'Write a Python function that fetches data from a REST API with error handling' },
      { icon: '✍️', title: 'Draft content',         subtitle: 'Emails, essays, summaries',            text: 'Help me write a professional email declining a meeting politely' },
      { icon: '🔍', title: 'Analyse & review',      subtitle: 'Debug code, review writing, find bugs', text: 'Review my code and suggest improvements for readability and performance' },
    ],

    /* ─────────────────────────────── COMPUTED */
    get filteredChats() {
      const sorted = [...this.chats].sort((a, b) => b.updatedAt - a.updatedAt);
      if (!this.searchQuery.trim()) return sorted;
      const q = this.searchQuery.toLowerCase();
      return sorted.filter(c => c.title.toLowerCase().includes(q));
    },

    /* ─────────────────────────────── INIT */
    init() {
      this.loadSettings();
      this.loadChatsFromStorage();

      // Theme
      window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => {
        if (this.theme === 'system') this.applyTheme();
      });

      // Responsive sidebar
      const handleResize = () => {
        if (window.innerWidth >= 768) this.sidebarOpen = true;
        else this.sidebarOpen = false;
      };
      window.addEventListener('resize', handleResize);
    },

    /* ─────────────────────────────── THEME */
    applyTheme() {
      if (this.theme === 'dark')   this.isDark = true;
      else if (this.theme === 'light') this.isDark = false;
      else this.isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    },

    toggleTheme() {
      this.theme = this.isDark ? 'light' : 'dark';
      this.applyTheme();
      this.saveSettings();
    },

    /* ─────────────────────────────── SETTINGS */
    loadSettings() {
      try {
        const s = JSON.parse(localStorage.getItem('beesto-settings') || '{}');
        if (s.theme)        { this.theme = s.theme; this.applyTheme(); }
        if (s.apiKeys)      this.apiKeys = { ...this.apiKeys, ...s.apiKeys };
        if (s.systemPrompt) this.systemPrompt = s.systemPrompt;
        if (s.selectedModel) {
          const found = this.modelProviders.flatMap(p => p.models).find(m => m.id === s.selectedModel.id);
          if (found) this.selectedModel = found;
        }
      } catch (e) { /* use defaults */ }
    },

    saveSettings() {
      try {
        localStorage.setItem('beesto-settings', JSON.stringify({
          theme: this.theme,
          apiKeys: this.apiKeys,
          systemPrompt: this.systemPrompt,
          selectedModel: { id: this.selectedModel.id }
        }));
      } catch (e) { console.warn('Settings save failed:', e); }
    },

    /* ─────────────────────────────── CHAT MANAGEMENT */
    loadChatsFromStorage() {
      try {
        this.chats = JSON.parse(localStorage.getItem('beesto-chats') || '[]');
        if (this.chats.length > 0) {
          const latest = [...this.chats].sort((a, b) => b.updatedAt - a.updatedAt)[0];
          this.currentChatId = latest.id;
          this.currentChat = this.chats.find(c => c.id === latest.id) || null;
        }
      } catch (e) { this.chats = []; }
    },

    saveChats() {
      try {
        localStorage.setItem('beesto-chats', JSON.stringify(this.chats));
      } catch (e) { console.warn('Chat save failed:', e); }
    },

    newChat() {
      const chat = {
        id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
        title: 'New conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.chats.unshift(chat);
      this.currentChatId = chat.id;
      this.currentChat = chat;
      this.attachments = [];
      this.userMessage = '';
      this.saveChats();
      if (window.innerWidth < 768) this.sidebarOpen = false;
    },

    loadChat(id) {
      this.currentChatId = id;
      this.currentChat = this.chats.find(c => c.id === id) || null;
      if (window.innerWidth < 768) this.sidebarOpen = false;
      this.$nextTick(() => this.scrollToBottom());
    },

    deleteChat(id) {
      if (!confirm('Delete this conversation?')) return;
      this.chats = this.chats.filter(c => c.id !== id);
      if (this.currentChatId === id) {
        const next = this.filteredChats[0] || null;
        this.currentChatId = next ? next.id : null;
        this.currentChat = next;
      }
      this.saveChats();
    },

    clearAllChats() {
      if (!confirm('Delete ALL conversations? This cannot be undone.')) return;
      this.chats = [];
      this.currentChatId = null;
      this.currentChat = null;
      this.saveChats();
      this.showSettings = false;
    },

    /* ─────────────────────────────── FILES */
    handleFileSelect(e) {
      Array.from(e.target.files).forEach(f => this.processFile(f));
      e.target.value = '';
    },

    handleDrop(e) {
      this.dragOver = false;
      Array.from(e.dataTransfer.files).forEach(f => this.processFile(f));
    },

    processFile(file) {
      const MAX = 20 * 1024 * 1024; // 20 MB
      if (file.size > MAX) {
        this.showToast(`"${file.name}" is too large (max 20 MB)`);
        return;
      }
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = e => this.attachments.push({
          name: file.name, type: file.type, size: file.size,
          dataUrl: e.target.result, base64: e.target.result.split(',')[1]
        });
        reader.readAsDataURL(file);
      } else {
        reader.onload = e => this.attachments.push({
          name: file.name, type: file.type || 'text/plain', size: file.size,
          dataUrl: null, textContent: e.target.result
        });
        reader.readAsText(file);
      }
    },

    /* ─────────────────────────────── SEND MESSAGE */
    async sendMessage(prefill) {
      const text = (prefill || this.userMessage || '').trim();
      if (!text && this.attachments.length === 0) return;
      if (this.isGenerating) return;

      if (!this.currentChat) this.newChat();

      const userMsg = {
        role: 'user',
        content: text,
        attachments: [...this.attachments],
        timestamp: Date.now()
      };
      this.currentChat.messages.push(userMsg);

      // Auto-title from first user message
      const userMsgs = this.currentChat.messages.filter(m => m.role === 'user');
      if (userMsgs.length === 1 && text) {
        this.currentChat.title = text.length > 55 ? text.slice(0, 55) + '…' : text;
      }

      this.userMessage = '';
      this.attachments = [];
      this.currentChat.updatedAt = Date.now();
      this.saveChats();
      this.$nextTick(() => {
        this.scrollToBottom();
        if (this.$refs.msgInput) this.$refs.msgInput.style.height = 'auto';
      });

      await this.callAPI();
    },

    /* ─────────────────────────────── API */
    async callAPI() {
      const provider = this.selectedModel.provider;
      const key = this.apiKeys[provider];

      if (!key) {
        const providerNames = {
          openrouter: 'OpenRouter (openrouter.ai/keys)',
          openai:     'OpenAI (platform.openai.com/api-keys)',
          gemini:     'Google Gemini (aistudio.google.com/apikey)',
          groq:       'Groq (console.groq.com/keys)',
          xai:        'xAI (console.x.ai)',
        };
        this.pushSystemMessage(
          `### 🔑 API Key Required\n\nNo API key is set for **${provider.toUpperCase()}**.\n\n**To fix this:**\n1. Click ⚙️ **Settings** in the sidebar\n2. Add your **${providerNames[provider] || provider}** key\n3. Try again\n\nDon't have a key? Get a free one from the link above.`
        );
        return;
      }

      this.isGenerating = true;
      this.streamingContent = '';
      this.abortController = new AbortController();

      try {
        const messages = this.buildMessages();
        const { url, headers, body } = this.buildRequest(provider, key, messages);

        const resp = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: this.abortController.signal
        });

        if (!resp.ok) {
          let errText = await resp.text();
          try {
            const errJson = JSON.parse(errText);
            errText = errJson.error?.message || errJson.message || errText;
          } catch (_) {}
          throw new Error(`${resp.status} — ${errText}`);
        }

        // ── Stream reading
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                this.streamingContent += delta;
                this.scrollToBottom();
              }
            } catch (_) { /* partial chunk, skip */ }
          }
        }

        if (this.streamingContent) {
          this.currentChat.messages.push({
            role: 'assistant',
            content: this.streamingContent,
            model: this.selectedModel.name,
            timestamp: Date.now()
          });
        }

      } catch (err) {
        if (err.name !== 'AbortError') {
          this.pushSystemMessage(`### ❌ Request Failed\n\n\`\`\`\n${err.message}\n\`\`\`\n\nCheck your API key and internet connection, then try again.`);
        }
      } finally {
        this.isGenerating = false;
        this.streamingContent = '';
        this.abortController = null;
        if (this.currentChat) this.currentChat.updatedAt = Date.now();
        this.saveChats();
        this.scrollToBottom();
      }
    },

    buildRequest(provider, key, messages) {
      const base = { model: this.selectedModel.id, messages, stream: true, max_tokens: 8192 };
      switch (provider) {
        case 'openai':
          return {
            url: 'https://api.openai.com/v1/chat/completions',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
            body: { ...base, max_tokens: 4096 }
          };
        case 'gemini':
          return {
            url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
            body: base
          };
        case 'groq':
          return {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
            body: { ...base, max_tokens: 8192 }
          };
        case 'xai':
          return {
            url: 'https://api.x.ai/v1/chat/completions',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
            body: { ...base, max_tokens: 4096 }
          };
        case 'openrouter':
        default:
          return {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            headers: {
              'Authorization': 'Bearer ' + key,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.href,
              'X-Title': 'Beesto AI'
            },
            body: base
          };
      }
    },

    buildMessages() {
      const msgs = [];
      if (this.systemPrompt) msgs.push({ role: 'system', content: this.systemPrompt });

      for (const msg of this.currentChat.messages) {
        if (msg.role !== 'user') {
          msgs.push({ role: 'assistant', content: msg.content || '' });
          continue;
        }

        const imgs = (msg.attachments || []).filter(a => a.type?.startsWith('image/') && a.base64);
        const txts = (msg.attachments || []).filter(a => a.textContent);

        if (imgs.length > 0 && this.selectedModel.vision) {
          const parts = [];
          if (msg.content) parts.push({ type: 'text', text: msg.content });
          imgs.forEach(a => parts.push({ type: 'image_url', image_url: { url: a.dataUrl } }));
          txts.forEach(a => parts.push({ type: 'text', text: `\n\n**[File: ${a.name}]**\n\`\`\`\n${a.textContent}\n\`\`\`` }));
          msgs.push({ role: 'user', content: parts });
        } else {
          let text = msg.content || '';
          txts.forEach(a => { text += `\n\n**[File: ${a.name}]**\n\`\`\`\n${a.textContent}\n\`\`\``; });
          imgs.forEach(a => {
            if (!this.selectedModel.vision) text += `\n\n*[Image attached: ${a.name} — switch to a Vision model to analyse images]*`;
          });
          msgs.push({ role: 'user', content: text });
        }
      }
      return msgs;
    },

    pushSystemMessage(content) {
      if (!this.currentChat) this.newChat();
      this.currentChat.messages.push({ role: 'assistant', content, timestamp: Date.now() });
      this.saveChats();
      this.$nextTick(() => this.scrollToBottom());
    },

    stopGeneration() {
      if (this.abortController) this.abortController.abort();
    },

    async regenerate() {
      if (!this.currentChat || this.isGenerating) return;
      const last = this.currentChat.messages[this.currentChat.messages.length - 1];
      if (last?.role === 'assistant') {
        this.currentChat.messages.pop();
        this.saveChats();
        await this.callAPI();
      }
    },

    /* ─────────────────────────────── MARKDOWN */
    renderMarkdown(text) {
      if (!text) return '';
      try {
        const renderer = new marked.Renderer();

        // Custom code block with header bar + copy button
        renderer.code = (code, language) => {
          const lang = language || '';
          let highlighted = code;
          try {
            if (lang && hljs.getLanguage(lang)) {
              highlighted = hljs.highlight(code, { language: lang }).value;
            } else {
              highlighted = hljs.highlightAuto(code).value;
            }
          } catch (_) { highlighted = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

          const escapedCode = code.replace(/`/g,'&#96;').replace(/\\/g,'\\\\');
          return `<div class="code-wrapper">
            <pre>
              <div class="code-block-header">
                <span class="code-block-lang">${lang || 'text'}</span>
                <button class="copy-code-btn" data-code="${encodeURIComponent(code)}"
                  onclick="(function(btn){
                    const code=decodeURIComponent(btn.getAttribute('data-code'));
                    navigator.clipboard.writeText(code).then(()=>{
                      btn.textContent='✓ Copied';
                      btn.classList.add('copied');
                      setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);
                    });
                  })(this)">Copy</button>
              </div>
              <code class="hljs language-${lang}">${highlighted}</code>
            </pre>
          </div>`;
        };

        marked.setOptions({ renderer, breaks: true, gfm: true });
        let html = marked.parse(text);
        html = DOMPurify.sanitize(html, {
          ADD_ATTR: ['onclick', 'data-code', 'class'],
          FORCE_BODY: false
        });
        return html;
      } catch (e) {
        return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
      }
    },

    /* ─────────────────────────────── UTILITIES */
    copyMessage(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied to clipboard');
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(() => { btn.textContent = orig; }, 2000);
        }
      }).catch(() => this.showToast('Copy failed'));
    },

    showToast(msg) {
      this.toast = msg;
      if (this._toastTimer) clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this.toast = ''; }, 2500);
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = document.getElementById('chat-messages');
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    },

    autoResize(el) {
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 180) + 'px';
    },

    exportAllChats() {
      if (!this.chats.length) { this.showToast('No chats to export'); return; }
      const blob = new Blob([JSON.stringify(this.chats, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `beesto-ai-export-${new Date().toISOString().slice(0,10)}.json`
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Chats exported successfully');
    }
  };
}
