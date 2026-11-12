import { motion } from 'framer-motion';

/** Abstract AI illustration: a glowing core with slow orbiting rings. */
export default function AiOrb() {
  return (
    <div className="relative mx-auto h-32 w-32 sm:h-36 sm:w-36" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
      <motion.svg viewBox="0 0 120 120" className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        <defs>
          <linearGradient id="orb-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="60" rx="54" ry="20" fill="none" stroke="url(#orb-ring)" strokeWidth="1.5" opacity=".7" transform="rotate(-25 60 60)" />
        <ellipse cx="60" cy="60" rx="54" ry="20" fill="none" stroke="url(#orb-ring)" strokeWidth="1.5" opacity=".45" transform="rotate(35 60 60)" />
        <circle cx="112" cy="50" r="3.5" fill="#22D3EE" />
        <circle cx="12" cy="74" r="2.5" fill="#A78BFA" />
      </motion.svg>
      <motion.div
        className="absolute inset-[26%] rounded-full bg-gradient-to-br from-primary via-primary-deep to-accent shadow-[0_0_40px_rgba(139,92,246,.55)]"
        animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 32 32" className="h-full w-full p-[22%]">
          <path d="M9 23V9l14 14V9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </motion.div>
    </div>
  );
}
