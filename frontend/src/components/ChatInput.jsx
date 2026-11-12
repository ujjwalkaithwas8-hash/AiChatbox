import { useEffect } from 'react';
import { ArrowUp, Loader2, Square } from 'lucide-react';

export default function ChatInput({ value, onChange, onSend, onStop, busy, inputRef }) {
  // auto-resize up to ~8 lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value, inputRef]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!busy && value.trim()) onSend();
    }
  };

  return (
    <div className="relative z-10 bg-gradient-to-t from-bg via-bg to-transparent px-4 pb-4 pt-3">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-line bg-panel p-2 shadow-2xl shadow-black/40 transition focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/20">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef} rows={1} value={value} maxLength={12000} autoFocus
              onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
              placeholder="Message NEXAI..." aria-label="Message NEXAI"
              className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.95rem] text-white placeholder:text-mute focus:outline-none"
            />
            {busy && (
              <span className="mb-2.5 hidden items-center gap-1.5 text-xs text-mute sm:flex"><Loader2 size={14} className="animate-spin text-accent" /> Generating</span>
            )}
            {busy ? (
              <button onClick={onStop} className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-bg transition hover:opacity-90" aria-label="Stop generating" title="Stop generating">
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={onSend} disabled={!value.trim()} aria-label="Send message" title="Send (Enter)"
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-mute">Enter to send · Shift + Enter for a new line · NEXAI can make mistakes, so check important info.</p>
      </div>
    </div>
  );
}
