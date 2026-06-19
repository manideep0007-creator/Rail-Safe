import { motion } from 'framer-motion';

export default function TrainAnimation({ braking = false }) {
  return (
    <div className={`track-line relative h-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] ${braking ? 'status-glow-danger' : 'status-glow-safe'}`}>
      <div className="rail-grid absolute inset-0 opacity-50" />
      <motion.div
        className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="sleepers absolute bottom-3 left-6 right-6 h-12 opacity-60" />
      <motion.div
        className="absolute bottom-14 left-4 flex h-20 w-56 items-end"
        animate={{ x: braking ? [0, 120, 145, 145] : [0, 420] }}
        transition={{ duration: braking ? 2.2 : 5.5, repeat: Infinity, repeatType: 'loop', ease: braking ? 'easeOut' : 'linear' }}
      >
        <div className="relative h-16 w-full rounded-xl border border-sky-200/25 bg-gradient-to-r from-sky-950 via-slate-800 to-orange-600 shadow-glow">
          <div className="absolute -top-7 left-8 h-8 w-24 rounded-t-xl border border-sky-200/20 bg-sky-900/90" />
          <div className="absolute left-5 top-4 h-4 w-8 rounded bg-sky-200/85 shadow-[0_0_14px_rgba(125,211,252,0.45)]" />
          <div className="absolute left-16 top-4 h-4 w-8 rounded bg-sky-200/85 shadow-[0_0_14px_rgba(125,211,252,0.45)]" />
          <div className="absolute right-5 top-4 h-4 w-8 rounded bg-sky-200/85 shadow-[0_0_14px_rgba(125,211,252,0.45)]" />
          <div className="absolute -right-4 bottom-2 h-7 w-8 rounded-r-full bg-orange-500 shadow-[0_0_24px_rgba(255,138,0,0.55)]" />
          <div className="absolute bottom-[-10px] left-9 h-5 w-5 rounded-full border-4 border-slate-300 bg-slate-950" />
          <div className="absolute bottom-[-10px] right-12 h-5 w-5 rounded-full border-4 border-slate-300 bg-slate-950" />
        </div>
      </motion.div>
      {braking && (
        <motion.div
          className="absolute bottom-20 left-[58%] rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-100 shadow-[0_0_26px_rgba(239,68,68,0.45)] ring-1 ring-red-400/40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0.7], y: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          Emergency Brake
        </motion.div>
      )}
    </div>
  );
}
