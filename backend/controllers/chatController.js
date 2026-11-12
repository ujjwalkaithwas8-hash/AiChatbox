const { getProvider, streamReply } = require('../services/aiProviders');

const MAX_MESSAGES = 40; // context window sent to the model
const MAX_LENGTH = 12000;

function validate(body) {
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array';
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return 'each message needs a role of "user" or "assistant"';
    if (typeof m.content !== 'string' || !m.content.trim()) return 'each message needs non-empty text content';
    if (m.content.length > MAX_LENGTH) return `a message is too long (max ${MAX_LENGTH} characters)`;
  }
  if (messages[messages.length - 1].role !== 'user') return 'the last message must come from the user';
  return null;
}

/**
 * POST /api/chat
 * Body: { messages: [{role, content}], stream?: boolean (default true) }
 * stream=true  -> Server-Sent Events: `token` {text}*, then `done` (or `error` {message})
 * stream=false -> JSON { reply }
 */
exports.chat = async (req, res, next) => {
  const problem = validate(req.body);
  if (problem) return res.status(400).json({ message: problem });

  const provider = getProvider();
  if (!provider) return res.status(503).json({ message: 'No AI key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to backend/.env and restart the server.' });

  const messages = req.body.messages.slice(-MAX_MESSAGES).map(({ role, content }) => ({ role, content: content.trim() }));
  const wantsStream = req.body.stream !== false;

  const controller = new AbortController();
  let finished = false;
  res.on('close', () => { if (!finished) controller.abort(); }); // client pressed Stop or left

  try {
    const iterator = streamReply(provider, messages, controller.signal)[Symbol.asyncIterator]();

    // Pull the first chunk before sending headers so key/model/quota errors become proper HTTP errors.
    let first = await iterator.next();

    if (!wantsStream) {
      let reply = '';
      while (!first.done) { reply += first.value; first = await iterator.next(); }
      finished = true;
      return res.json({ reply });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const send = (event, data) => { if (!res.writableEnded && !res.destroyed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); };

    try {
      while (!first.done) {
        send('token', { text: first.value });
        first = await iterator.next();
      }
      send('done', {});
    } catch (err) {
      if (err.name !== 'AbortError') send('error', { message: err.message || 'The AI provider returned an error' });
    }
    finished = true;
    res.end();
  } catch (err) {
    finished = true;
    if (err.name === 'AbortError') return undefined;
    return next(err);
  }
  return undefined;
};
