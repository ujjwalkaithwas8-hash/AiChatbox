import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import Welcome from './Welcome';

export default function ChatWindow({ messages, busy, error, onDismissError, onRetry, onPick, onRegenerate }) {
  const scrollRef = useRef(null);
  const stick = useRef(true);

  // follow new text unless the user has scrolled up to read
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, error]);

  const onScroll = () => {
    const el = scrollRef.current;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  // a new user message always jumps back to the bottom
  useEffect(() => {
    if (messages[messages.length - 1]?.role === 'user') stick.current = true;
  }, [messages]);

  return (
    <div ref={scrollRef} onScroll={onScroll} className="relative z-0 flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <Welcome onPick={onPick} />
      ) : (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8" role="log" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <ChatMessage key={m.id || i} message={m} isLast={i === messages.length - 1} busy={busy} onRegenerate={onRegenerate} />
            ))}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="alert" className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-red-300">Couldn&apos;t get a response</p>
                <p className="mt-0.5 break-words text-red-200/80">{error}</p>
                <button onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 font-semibold text-red-100 transition hover:bg-red-500/30">
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
              <button className="icon-btn" onClick={onDismissError} aria-label="Dismiss error"><X size={16} /></button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
