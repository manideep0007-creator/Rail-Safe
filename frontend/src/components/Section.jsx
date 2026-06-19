import { motion } from 'framer-motion';

export default function Section({ id, eyebrow, title, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      {(eyebrow || title) && (
        <div className="mb-6">
          {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.24em] text-rail-orange">{eyebrow}</p>}
          {title && <h2 className="mt-2 bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-2xl font-extrabold tracking-normal text-transparent sm:text-3xl">{title}</h2>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
