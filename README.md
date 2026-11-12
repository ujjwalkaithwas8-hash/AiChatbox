# NEXAI - Generative AI Chatbox

One page. Type a question, get a real AI answer, streamed live. No login, no database.

**Stack:** React 18 + Vite, Tailwind CSS, Framer Motion, Lucide React - Node.js + Express - Gemini or OpenAI.

## Features
- Streaming responses with Markdown and syntax-highlighted code (copy button on every code block)
- Copy response, regenerate response, stop generating, New chat
- Conversation context: the current chat is sent with every request
- Enter to send, Shift+Enter for a new line, auto-resizing input, send disabled while the AI responds
- Chat survives a page refresh (browser localStorage; cleared by New chat)
- Responsive, dark premium UI

## Setup

**1. Get an API key** (either one): [Gemini](https://aistudio.google.com/apikey) (free tier) or [OpenAI](https://platform.openai.com/api-keys)

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# open .env and paste your key into GEMINI_API_KEY or OPENAI_API_KEY
npm run dev               # http://localhost:5000
```

**3. Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```
Open http://localhost:5173 and start chatting. Node.js 18+ is required.

## Folder structure
```
nexai/
├── frontend/src/
│   ├── components/  ChatInput, ChatMessage, ChatWindow, Header, Welcome, AiOrb, Markdown, Logo
│   ├── hooks/useChat.js     chat state, streaming, stop/regenerate, localStorage
│   ├── App.jsx  main.jsx  index.css
└── backend/
    ├── routes/chatRoutes.js
    ├── controllers/chatController.js   validation + streaming response
    ├── services/aiProviders.js         Gemini / OpenAI calls
    └── server.js
```

## API
`POST /api/chat`
```json
{ "messages": [{ "role": "user", "content": "Hello" }], "stream": true }
```
- `stream: true` (default): Server-Sent Events - `token` `{text}` repeated, then `done` (or `error` `{message}`)
- `stream: false`: JSON `{ "reply": "..." }`
- Errors return `{ "message": "..." }` with 400 (bad input), 429 (rate/quota), 502 (provider error), 503 (no API key)

The API key is read from `backend/.env` with `process.env` and never reaches the browser.

## Configuration (`backend/.env`)
| Variable | Default | Notes |
|---|---|---|
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | - | Set one. If both, Gemini is used unless `AI_PROVIDER=openai` |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Change if Google retires the name |
| `OPENAI_MODEL` | `gpt-4o-mini` | |
| `PORT` | `5000` | |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s), comma separated |

## Troubleshooting
- **"Cannot reach the NEXAI server"** - start the backend (`npm run dev` in `backend/`).
- **"No AI key configured"** - add the key to `backend/.env` and restart the backend.
- **"model not found"** - set `GEMINI_MODEL` or `OPENAI_MODEL` to a model your key can use.
- **429 errors** - you hit the provider's free-tier limit; wait a minute.

## Deploy
Build with `npm run build` in `frontend/` and host `dist/` (Netlify/Vercel). Host `backend/` on Render/Railway, set `CLIENT_URL` to the frontend URL, and set `VITE_API_URL` to the backend URL before building. Avoid proxies that buffer responses on `/api/chat`, or streaming will arrive all at once.
