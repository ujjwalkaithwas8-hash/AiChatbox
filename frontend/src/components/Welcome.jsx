import { motion } from 'framer-motion';
import { BookOpen, Code2, Lightbulb, PenLine } from 'lucide-react';
import AiOrb from './AiOrb';

export const SUGGESTIONS = [
  { title: 'Explain Something', hint: 'Break down any topic simply', icon: BookOpen, tint: 'text-accent-soft bg-accent/15', prompt: 'Explain how the internet works, as if I am a curious beginner.' },
  { title: 'Write Content', hint: 'Emails, posts and articles', icon: PenLine, tint: 'text-primary-soft bg-primary/15', prompt: 'Write a short, friendly email asking a client for feedback on the project we just delivered.' },
  { title: 'Code Assistant', hint: 'Write, explain and debug code', icon: Code2, tint: 'text-emerald-300 bg-emerald-400/15', prompt: 'Write a React hook called useDebounce and show a small usage example.' },
  { title: 'Brainstorm Ideas', hint: 'Names, projects and angles', icon: Lightbulb, tint: 'text-amber-300 bg-amber-400/15', prompt: 'Give me 8 creative side-project ideas for a frontend developer, each with a one-line pitch.' },
];

export default function Welcome({ onPick }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-8 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <AiOrb />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">What can I help you with?</h1>
        <p className="mt-3 text-base text-mute sm:text-lg">Ask anything. Explore ideas. Get intelligent answers.</p>
      </motion.div>

      <div className="mt-9 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.title} onClick={() => onPick(s.prompt)}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 + i * 0.07 }}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-3.5 rounded-2xl border border-line bg-panel p-4 transition hover:border-primary/60"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tint}`}><s.icon size={20} /></span>
            <span className="min-w-0">
              <span className="block font-display font-bold">{s.title}</span>
              <span className="block text-sm text-mute">{s.hint}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
