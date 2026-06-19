const styles = {
  Safe: 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/35',
  Warning: 'bg-amber-400/15 text-amber-100 ring-amber-400/35',
  Danger: 'bg-red-500/15 text-red-100 ring-red-400/40',
  Emergency: 'bg-red-500/15 text-red-100 ring-red-400/40',
  'Emergency Stop': 'bg-red-500/15 text-red-100 ring-red-400/40',
  Critical: 'bg-red-500/15 text-red-100 ring-red-400/40',
  Info: 'bg-sky-400/15 text-sky-100 ring-sky-400/35'
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status] || styles.Info}`}>
      <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      {status}
    </span>
  );
}
