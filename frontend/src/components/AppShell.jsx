import { Activity, Bell, Gauge, Home, LogOut, Map, ShieldCheck, TrainFront, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';

const nav = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'dashboard', label: 'Dashboard', icon: Gauge, path: '/dashboard' },
  { id: 'collision', label: 'Collision', icon: ShieldCheck, path: '/collision' },
  { id: 'track', label: 'Track Health', icon: Activity, path: '/track-health' },
  { id: 'map', label: 'Map', icon: Map, path: '/map' },
  { id: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' },
  { id: 'admin', label: 'Admin', icon: UserCog, path: '/admin' }
];

export default function AppShell({ active, onNav, user, onLogout, children }) {
  return (
    <div className="premium-bg min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1020]/72 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNav('home', '/dashboard')} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-glow ring-1 ring-white/10">
              <TrainFront className="h-6 w-6" />
            </span>
            <span>
              <span className="block bg-gradient-to-r from-white to-orange-100 bg-clip-text text-lg font-extrabold tracking-normal text-transparent">RailSafe</span>
              <span className="block text-xs font-medium text-slate-300">Indian Railways Safety Tech</span>
            </span>
          </motion.button>
          <nav className="glass hidden items-center gap-1 rounded-2xl px-2 py-2 lg:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNav(item.id, item.path)}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${active === item.id ? 'text-white' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
                >
                  {active === item.id && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_24px_rgba(255,138,0,0.28)]" transition={{ duration: 0.3 }} />}
                  <span className="relative flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-white">{user?.name || 'RailSafe User'}</p>
              <p className="text-xs capitalize text-slate-300">{user?.role || 'user'}</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onLogout} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-orange-100 transition hover:bg-orange-500 hover:text-white" aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNav(item.id, item.path)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${active === item.id ? 'bg-orange-500 text-white shadow-glow' : 'bg-white/8 text-slate-200'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </motion.button>
            );
          })}
          <motion.button whileTap={{ scale: 0.96 }} onClick={onLogout} className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-glow">
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
        </div>
      </header>
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>{children}</motion.main>
    </div>
  );
}
