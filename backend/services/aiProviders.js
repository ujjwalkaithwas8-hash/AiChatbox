const SYSTEM_PROMPT = `You are NEXAI, a friendly and highly capable AI assistant.
- Answer clearly and accurately. Use Markdown: short paragraphs, lists, tables and headings only when they help.
- Put all code in fenced code blocks with a language tag.
- When teaching, explain step by step with small examples.
- If you are unsure, say so instead of guessing.`;

class ProviderError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

function getProvider() {
  const wanted = (process.env.AI_PROVIDER || '').toLowerCase();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (wanted === 'openai' && hasOpenAI) return 'openai';
  if (wanted === 'gemini' && hasGemini) return 'gemini';
  if (hasGemini) return 'gemini';
  if (hasOpenAI) return 'openai';
  return null;
}

async function* readSSE(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('data:')) yield t.slice(5).trim();
    }
  }
  const rest = buffer.trim();
  if (rest.startsWith('data:')) yield rest.slice(5).trim();
}

async function failure(res, name) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body?.error?.message || body?.message || '';
  } catch {
    /* not json */
  }
  const hint =
    res.status === 429 ? ' - rate limit or quota reached, try again shortly'
    : res.status === 401 || res.status === 403 || res.status === 400 && /api key/i.test(detail) ? ' - check the API key in backend/.env'
    : res.status === 404 ? ' - model not found, set GEMINI_MODEL / OPENAI_MODEL in backend/.env'
    : '';
  return new ProviderError(`${name} request failed${hint}${detail ? ` (${detail})` : ''}`, res.status === 429 ? 429 : 502);
}

// ---------- Gemini retry with exponential backoff ----------
// Only temporary overload errors are retried. Bad keys, bad requests, quota (429) and
// unknown models fail immediately through failure() below.
const RETRYABLE_STATUS = new Set([503, 504]);
const MAX_RETRIES = 3; // 1 original attempt + up to 3 retries
const BASE_DELAY_MS = Number(process.env.GEMINI_RETRY_BASE_MS) || 1000; // waits ~1s, ~2s, ~4s (+ small jitter)
const OVERLOAD_MESSAGE = 'Gemini is under heavy demand right now and did not respond after several attempts. Please wait a moment and try again.';

const abortError = () => Object.assign(new Error('Request aborted'), { name: 'AbortError' });

// Sleeps, but wakes immediately if the user presses Stop or closes the page.
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    let timer;
    const onAbort = () => { clearTimeout(timer); reject(abortError()); };
    timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function fetchGeminiWithRetry(url, options, signal) {
  for (let attempt = 0; ; attempt += 1) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (!RETRYABLE_STATUS.has(res.status)) throw await failure(res, 'Gemini'); // permanent error: no retry

    try { await res.body?.cancel(); } catch { /* ignore */ }

    if (attempt >= MAX_RETRIES) {
      console.error(`[gemini] still unavailable (HTTP ${res.status}) after ${MAX_RETRIES} retries - giving up`);
      throw new ProviderError(OVERLOAD_MESSAGE, 503);
    }
    const delay = BASE_DELAY_MS * 2 ** attempt + Math.floor(Math.random() * 250);
    console.warn(`[gemini] HTTP ${res.status}, retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
    await sleep(delay, signal);
  }
}

async function* streamGemini(messages, signal) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
  const res = await fetchGeminiWithRetry(
    url,
    {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      }),
    },
    signal
  );
  for await (const data of readSSE(res)) {
    let json;
    try { json = JSON.parse(data); } catch { continue; }
    const text = (json.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    if (text) yield text;
  }
}

async function* streamOpenAI(messages, signal) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, stream: true, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages] }),
  });
  if (!res.ok) throw await failure(res, 'OpenAI');
  for await (const data of readSSE(res)) {
    if (data === '[DONE]') return;
    let json;
    try { json = JSON.parse(data); } catch { continue; }
    const text = json.choices?.[0]?.delta?.content;
    if (text) yield text;
  }
}

/** Async generator of text chunks from the configured provider. */
function streamReply(provider, messages, signal) {
  return provider === 'openai' ? streamOpenAI(messages, signal) : streamGemini(messages, signal);
}

module.exports = { getProvider, streamReply, ProviderError };