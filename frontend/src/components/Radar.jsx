import { motion } from 'framer-motion';

export default function Radar({ alertLevel = 'Safe' }) {
  const dotColor = alertLevel === 'Emergency Stop' || alertLevel === 'Danger' ? 'bg-red-400' : alertLevel === 'Warning' ? 'bg-amber-300' : 'bg-emerald-300';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass status-glow-safe relative mx-auto flex aspect-square max-w-sm items-center justify-center overflow-hidden rounded-full border-sky-300/20"
    >
      {[8, 16, 24, 31].map((inset) => (
        <motion.div
          key={inset}
          className="absolute rounded-full border border-sky-300/20"
          style={{ inset }}
          animate={{ opacity: [0.32, 0.75, 0.32], scale: [1, 1.025, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: inset / 28 }}
        />
      ))}
      <div className="radar-sweep absolute h-1/2 w-1/2 origin-bottom-left rounded-tl-full opacity-70" />
      <div className="absolute h-px w-full bg-sky-200/15" />
      <div className="absolute h-full w-px bg-sky-200/15" />
      <span className={`absolute left-[62%] top-[36%] h-3 w-3 rounded-full ${dotColor} shadow-[0_0_18px_currentColor]`} />
      <span className="absolute left-[31%] top-[62%] h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_16px_currentColor]" />
      <span className="absolute right-[28%] bottom-[25%] rounded-full border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-slate-200">100m</span>
      <span className="absolute right-[37%] top-[29%] rounded-full border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-slate-200">50m</span>
      <span className="z-10 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-bold text-sky-100 shadow-[0_0_28px_rgba(125,211,252,0.18)]">RADAR ACTIVE</span>
    </motion.div>
  );
}
