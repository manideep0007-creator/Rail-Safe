import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const toneMap = {
  cyan: 'from-sky-400/20 to-sky-400/5 text-sky-100',
  orange: 'from-orange-500/25 to-orange-500/5 text-orange-100',
  green: 'from-emerald-400/20 to-emerald-400/5 text-emerald-100',
  amber: 'from-amber-400/20 to-amber-400/5 text-amber-100'
};

export default function MetricCard({ label, value, suffix = '', tone = 'cyan', icon: Icon }) {
  const numericValue = Number(value);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 900, bounce: 0 });
  const displayValue = useTransform(springValue, (latest) => Number.isFinite(numericValue) ? Math.round(latest) : value);

  useEffect(() => {
    if (Number.isFinite(numericValue)) motionValue.set(numericValue);
  }, [motionValue, numericValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -7, scale: 1.015 }}
      className={`glass group overflow-hidden rounded-2xl bg-gradient-to-br p-5 transition-shadow hover:shadow-[0_24px_80px_rgba(255,138,0,0.16)] ${toneMap[tone]}`}
    >
      <div className="relative z-10 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300">{label}</p>
        {Icon && <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-orange-200 ring-1 ring-white/10 transition group-hover:bg-orange-500 group-hover:text-white"><Icon className="h-5 w-5" /></span>}
      </div>
      <div className="relative z-10 mt-4 text-3xl font-extrabold tracking-normal text-white">
        {Number.isFinite(numericValue) ? <motion.span>{displayValue}</motion.span> : value}{suffix}
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl transition group-hover:bg-orange-400/20" />
    </motion.div>
  );
}
