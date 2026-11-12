import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'nexai_chat_v1';
const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/chat`;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((m) => m && m.content) : [];
  } catch {
    return [];
  }
}

/** All chat state: messages, streaming from POST /api/chat, stop, regenerate, new chat, localStorage. */
export default function useChat() {
  const [messages, setMessages] = useState(loadSaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // persist finished conversations only
  useEffect(() => {
    if (busy) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch {
      /* storage full or blocked - chat still works */
    }
  }, [messages, busy]);

  const patchLast = (fn) =>
    setMessages((prev) => {
      if (!prev.length) return prev;
      const next = prev.slice();
      next[next.length - 1] = fn(next[next.length - 1]);
      return next;
    });

  // Streams a reply for `history` (which must end with a user message) into a new assistant message.
  const run = useCallback(async (history) => {
    setError('');
    setBusy(true);
    setMessages([...history, { id: uid(), role: 'assistant', content: '', streaming: true }]);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try { message = (await res.json()).message || message; } catch { /* not json */ }
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const handle = (block) => {
        let event = 'message';
        let data = '';
        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data) return;
        const payload = JSON.parse(data);
        if (event === 'token') patchLast((m) => ({ ...m, content: m.content + payload.text }));
        else if (event === 'error') throw new Error(payload.message);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop();
        blocks.forEach(handle);
      }
      if (buffer.trim()) handle(buffer);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message === 'Failed to fetch' ? 'Cannot reach the NEXAI server. Is the backend running on port 5000?' : err.message);
      }
    } finally {
      controllerRef.current = null;
      setBusy(false);
      // finalize: drop the streaming flag, remove an empty placeholder
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) return prev.slice(0, -1);
        return prev.map((m) => (m.streaming ? { ...m, streaming: false } : m));
      });
    }
  }, []);

  const send = useCallback((text) => {
    const content = text.trim();
    if (!content || controllerRef.current) return;
    run([...messagesRef.current.filter((m) => m.content), { id: uid(), role: 'user', content }]);
  }, [run]);

  const regenerate = useCallback(() => {
    if (controllerRef.current) return;
    const history = messagesRef.current.slice();
    if (history[history.length - 1]?.role === 'assistant') history.pop();
    if (history.length && history[history.length - 1].role === 'user') run(history);
  }, [run]);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const newChat = useCallback(() => {
    controllerRef.current?.abort();
    setMessages([]);
    setError('');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { messages, busy, error, setError, send, regenerate, stop, newChat };
}
