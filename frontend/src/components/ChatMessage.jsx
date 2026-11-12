import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, RefreshCw } from 'lucide-react';
import Logo from './Logo';
import Markdown from './Markdown';

function Typing() {
  return (
    <div className="flex items-center gap-1.5 py-2" role="status" aria-label="NEXAI is thinking">
      {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-blink rounded-full bg-primary" style={{ animationDelay: `${i * 0.18}s` }} />)}
    </div>
  );
}

export default function ChatMessage({ message, isLast, busy, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  if (message.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary-deep px-4 py-3 text-[0.95rem] leading-relaxed shadow-lg shadow-primary/15 sm:max-w-[75%]">
          {message.content}
        </div>
      </motion.div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex gap-3">
      <div className="mt-0.5"><Logo size={32} /></div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md border border-line bg-panel px-4 py-3">
          {message.content ? <Markdown content={message.content} streaming={message.streaming} /> : <Typing />}
        </div>
        {message.content && !message.streaming && (
          <div className="mt-2 flex items-center gap-1 pl-1">
            <button className="icon-btn" onClick={copy} aria-label="Copy response" title="Copy response">
              {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
            </button>
            {isLast && (
              <button className="icon-btn" onClick={onRegenerate} disabled={busy} aria-label="Regenerate response" title="Regenerate response">
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
