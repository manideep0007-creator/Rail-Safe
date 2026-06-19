import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, Phone, ShieldCheck, TrainFront, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialRegister = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success] = useState(location.state?.message || '');
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Secure Access" title="Login to RailSafe" subtitle="Continue to live railway safety monitoring.">
      <form onSubmit={submit} className="space-y-4">
        {success && <Message tone="success">{success}</Message>}
        {error && <Message tone="error">{error}</Message>}
        <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field icon={LockKeyhole} label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
        <button disabled={submitting} className="premium-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
          <ShieldCheck className="h-5 w-5" />
          {submitting ? 'Authenticating...' : 'Login'}
        </button>
        <p className="text-center text-sm text-slate-300">
          New to RailSafe? <Link className="font-bold text-orange-200 hover:text-white" to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState(initialRegister);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await register(form);
      navigate('/login', { replace: true, state: { message: data.message || 'Registration successful. Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="New Operator" title="Create RailSafe Account" subtitle="Register a verified monitoring user for stored MongoDB access.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Message tone="error">{error}</Message>}
        <Field icon={UserRound} label="Full Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field icon={Phone} label="Phone Number" type="tel" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
        <Field icon={LockKeyhole} label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
        <Field icon={LockKeyhole} label="Confirm Password" type="password" value={form.confirmPassword} onChange={(value) => setForm({ ...form, confirmPassword: value })} />
        <button disabled={submitting} className="premium-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
          <ShieldCheck className="h-5 w-5" />
          {submitting ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-300">
          Already registered? <Link className="font-bold text-orange-200 hover:text-white" to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="rail-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-rail-navy px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(249,115,22,0.18),transparent_24%)]" />
      <motion.section initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55 }} className="glass relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-72 flex-col justify-between border-b border-white/10 bg-slate-950/35 p-7 md:border-b-0 md:border-r">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-glow">
              <TrainFront className="h-7 w-7" />
            </span>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-orange-200">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-white sm:text-4xl">RailSafe</h1>
            <p className="mt-3 text-lg font-semibold text-sky-100">Safer Tracks, Secure Lives</p>
          </div>
          <div className="track-line mt-10 h-24 overflow-hidden rounded-lg bg-white/5">
            <div className="sleepers absolute bottom-3 left-4 right-4 h-10 opacity-60" />
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-rail-orange">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-white">{title}</h2>
          <p className="mb-6 mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
          {children}
        </div>
      </motion.section>
    </main>
  );
}

function Field({ icon: Icon, label, type = 'text', value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3 ring-orange-400/40 focus-within:ring-2">
        <Icon className="h-5 w-5 text-orange-200" />
        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          placeholder={label}
        />
      </span>
    </label>
  );
}

function Message({ tone, children }) {
  const classes = tone === 'success'
    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
    : 'border-red-400/25 bg-red-500/10 text-red-100';

  return <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${classes}`}>{children}</div>;
}
