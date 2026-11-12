import { SquarePen } from 'lucide-react';
import Logo from './Logo';

export default function Header({ onNewChat, canReset }) {
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-line/70 bg-bg/70 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Logo size={34} />
        <div className="leading-tight">
          <div className="font-display text-lg font-extrabold tracking-tight">NEXAI</div>
          <div className="text-xs text-mute">AI Assistant</div>
        </div>
      </div>
      <button
        onClick={onNewChat}
        disabled={!canReset}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-semibold transition hover:border-primary/60 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SquarePen size={16} className="text-primary-soft" /> New chat
      </button>
    </header>
  );
}
