import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BellRing, Camera, CheckCircle2, Cpu, Gauge, Loader2, MapPin, Pencil, Plus, RadioTower, ShieldAlert, ShieldCheck, Siren, Thermometer, TrainFront, Trash2, Volume2, VolumeX, X, XCircle } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from './components/AppShell';
import MetricCard from './components/MetricCard';
import ProtectedRoute from './components/ProtectedRoute';
import Radar from './components/Radar';
import Section from './components/Section';
import StatusPill from './components/StatusPill';
import TrainAnimation from './components/TrainAnimation';
import { createIncident, createSocket, createTrain, deleteTrain, getIncidents, getOverview, updateTrain } from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { alerts as fallbackAlerts, chartData, routeStops, stats as fallbackStats, trackHealth as fallbackTrackHealth, trains as fallbackTrains } from './data/mockData';
import { LoginPage, RegisterPage } from './pages/AuthPages';

const statusFromDistance = (distance) => {
  if (distance < 18) return 'Emergency Stop';
  if (distance < 45) return 'Warning';
  return 'Safe';
};

const riskFromDistance = (distance) => {
  if (distance < 50) return 'Danger';
  if (distance <= 100) return 'Warning';
  return 'Safe';
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<RailSafeExperience initialSection="dashboard" />} />
            <Route path="/collision" element={<RailSafeExperience initialSection="collision" />} />
            <Route path="/track-health" element={<RailSafeExperience initialSection="track" />} />
            <Route path="/map" element={<RailSafeExperience initialSection="map" />} />
            <Route path="/alerts" element={<RailSafeExperience initialSection="alerts" />} />
            <Route path="/admin" element={<RailSafeExperience initialSection="admin" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function mapAlert(alert) {
  return {
    id: alert.alertId || alert.id,
    type: alert.type,
    level: alert.level,
    location: alert.location,
    status: alert.status,
    message: alert.message,
    source: alert.source,
    imageUrl: alert.imageUrl,
    incidentId: alert.incidentId,
    time: alert.createdAt
      ? new Date(alert.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : alert.time
  };
}

function createIncidentImage({ objectType, risk, distance, timestamp }) {
  const danger = risk === 'Danger';
  const accent = danger ? '#ef4444' : '#f59e0b';
  const title = objectType.toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#061427"/>
          <stop offset="1" stop-color="#0a2544"/>
        </linearGradient>
      </defs>
      <rect width="720" height="405" fill="url(#bg)"/>
      <g opacity="0.22" stroke="#7dd3fc" stroke-width="1">
        ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 42}" y1="0" x2="${i * 42 - 180}" y2="405"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="720" y2="${i * 50}"/>`).join('')}
      </g>
      <path d="M70 330 L650 330 M120 360 L600 360" stroke="#f8fafc" stroke-width="8" stroke-linecap="round"/>
      <g stroke="#94a3b8" stroke-width="5" opacity="0.85">
        ${Array.from({ length: 12 }, (_, i) => `<line x1="${95 + i * 48}" y1="315" x2="${75 + i * 48}" y2="375"/>`).join('')}
      </g>
      <rect x="72" y="42" width="576" height="72" rx="16" fill="rgba(2,8,23,0.72)" stroke="${accent}" stroke-width="3"/>
      <text x="96" y="86" fill="#fff" font-family="Inter, Arial" font-size="28" font-weight="800">${title}</text>
      <text x="96" y="108" fill="#cbd5e1" font-family="Inter, Arial" font-size="16">${new Date(timestamp).toLocaleString('en-IN')} | Distance ${distance}m</text>
      <circle cx="${objectType === 'Opposite Train' ? 500 : 375}" cy="238" r="${danger ? 48 : 34}" fill="${accent}" opacity="0.88"/>
      <circle cx="${objectType === 'Opposite Train' ? 500 : 375}" cy="238" r="${danger ? 78 : 58}" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="10 10"/>
      <rect x="110" y="220" width="180" height="58" rx="10" fill="#0f172a" stroke="#7dd3fc" stroke-width="3"/>
      <rect x="150" y="198" width="76" height="32" rx="8" fill="#0f172a" stroke="#7dd3fc" stroke-width="3"/>
      <circle cx="150" cy="286" r="15" fill="#020817" stroke="#f8fafc" stroke-width="6"/>
      <circle cx="250" cy="286" r="15" fill="#020817" stroke="#f8fafc" stroke-width="6"/>
      <text x="96" y="382" fill="${accent}" font-family="Inter, Arial" font-size="20" font-weight="800">RISK: ${risk.toUpperCase()}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function playAlertTone(risk) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = risk === 'Danger' ? 'sawtooth' : 'sine';
    oscillator.frequency.value = risk === 'Danger' ? 820 : 520;
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.34);
  } catch {
    // Browsers may block sound until the user interacts with the page.
  }
}

function RailSafeExperience({ initialSection = 'dashboard' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [active, setActive] = useState(initialSection);
  const [overview, setOverview] = useState({
    stats: fallbackStats,
    trains: fallbackTrains,
    alerts: fallbackAlerts,
    trackHealth: fallbackTrackHealth
  });
  const [distance, setDistance] = useState(72);
  const [oppositeDistance, setOppositeDistance] = useState(142);
  const [speed, setSpeed] = useState(86);
  const [incidents, setIncidents] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [soundMuted, setSoundMuted] = useState(false);
  const lastRiskRef = useRef({ obstacle: 'Safe', opposite: 'Safe' });

  const status = useMemo(() => statusFromDistance(distance), [distance]);
  const obstacleRisk = useMemo(() => riskFromDistance(distance), [distance]);
  const oppositeRisk = useMemo(() => riskFromDistance(oppositeDistance), [oppositeDistance]);
  const highestRisk = oppositeRisk === 'Danger' || obstacleRisk === 'Danger' ? 'Danger' : oppositeRisk === 'Warning' || obstacleRisk === 'Warning' ? 'Warning' : 'Safe';
  const refreshOverview = useCallback(async () => {
    const data = await getOverview();
    setOverview(data);
    setLiveAlerts(data.alerts || []);
    return data;
  }, []);

  useEffect(() => {
    refreshOverview();
    getIncidents().then(setIncidents).catch(() => setIncidents([]));
  }, [refreshOverview]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDistance((current) => {
        const next = current <= 9 ? 92 : current - Math.round(Math.random() * 9 + 4);
        setSpeed(next < 18 ? 0 : next < 45 ? Math.max(32, speed - 8) : Math.min(96, speed + 3));
        return next;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [speed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOppositeDistance((current) => current <= 24 ? 168 : current - Math.round(Math.random() * 12 + 8));
    }, 2100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = createSocket();
    socket.on('incident:new', (incident) => {
      setIncidents((current) => [incident, ...current.filter((item) => item.incidentId !== incident.incidentId)].slice(0, 12));
    });
    socket.on('alert:new', (alert) => {
      setLiveAlerts((current) => [mapAlert(alert), ...current.filter((item) => item.id !== alert.alertId)].slice(0, 12));
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const candidates = [
      { key: 'obstacle', distance, risk: obstacleRisk, objectType: 'Static Obstacle', alertType: 'Obstacle Detected' },
      { key: 'opposite', distance: oppositeDistance, risk: oppositeRisk, objectType: 'Opposite Train', alertType: 'Opposite Train Detected' }
    ];

    candidates.forEach((candidate) => {
      if (candidate.risk !== 'Safe' && candidate.risk !== lastRiskRef.current[candidate.key]) {
        registerDetection(candidate);
      }
      lastRiskRef.current[candidate.key] = candidate.risk;
    });
  }, [distance, obstacleRisk, oppositeDistance, oppositeRisk]);

  useEffect(() => {
    if (soundMuted || highestRisk === 'Safe') return undefined;
    const timer = window.setInterval(() => playAlertTone(highestRisk), highestRisk === 'Danger' ? 520 : 1100);
    playAlertTone(highestRisk);
    return () => window.clearInterval(timer);
  }, [highestRisk, soundMuted]);

  useEffect(() => {
    setActive(initialSection);
    requestAnimationFrame(() => document.getElementById(initialSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [initialSection]);

  const navTo = (id, path) => {
    setActive(id);
    if (path) navigate(path);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const registerDetection = async ({ distance: detectedDistance, risk, objectType, alertType }) => {
    const incidentId = `INC-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const latitude = 25.2138 + (Math.random() - 0.5) * 0.08;
    const longitude = 75.8648 + (Math.random() - 0.5) * 0.08;
    const imageUrl = createIncidentImage({ objectType, risk, distance: detectedDistance, timestamp });

    const localIncident = {
      incidentId,
      trainId: 'TRN-12901',
      objectType,
      imageUrl,
      latitude,
      longitude,
      distance: detectedDistance,
      riskLevel: risk,
      timestamp
    };
    const localAlert = {
      id: `ALT-${incidentId}`,
      type: risk === 'Danger' ? 'Emergency Braking Activated' : alertType,
      level: risk,
      location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      status: 'Active',
      message: `${objectType} detected ${detectedDistance}m from TRN-12901`,
      source: 'RailSafe Sensor Fusion',
      time: new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      imageUrl,
      incidentId
    };

    setIncidents((current) => [localIncident, ...current].slice(0, 12));
    setLiveAlerts((current) => [localAlert, ...current].slice(0, 12));
    if (risk === 'Warning') setSpeed((current) => Math.max(34, current - 14));
    if (risk === 'Danger') setSpeed(0);

    try {
      await createIncident(localIncident);
    } catch {
      // The local command center still updates instantly if the database is temporarily unavailable.
    }
  };

  return (
    <AppShell active={active} onNav={navTo} user={user} onLogout={handleLogout}>
      <Home stats={overview.stats} onStart={() => navTo('dashboard', '/dashboard')} />
      <Dashboard trains={overview.trains} alerts={liveAlerts} incidents={incidents} speed={speed} distance={distance} oppositeDistance={oppositeDistance} status={status} obstacleRisk={obstacleRisk} oppositeRisk={oppositeRisk} highestRisk={highestRisk} soundMuted={soundMuted} onToggleSound={() => setSoundMuted((value) => !value)} />
      <Collision distance={distance} status={status} oppositeDistance={oppositeDistance} oppositeRisk={oppositeRisk} />
      <TrackHealth data={overview.trackHealth} />
      <MapModule incidents={incidents} />
      <AlertsCenter alerts={liveAlerts} />
      <AdminPanel user={user} trains={overview.trains} onRefresh={refreshOverview} />
    </AppShell>
  );
}

function Home({ stats, onStart }) {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="rail-grid absolute inset-0 opacity-45" />
      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10">
          <p className="mb-4 inline-flex rounded-full border border-orange-300/25 bg-orange-500/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-orange-100">
            Smart Railway Collision Avoidance
          </p>
          <h1 className="text-5xl font-extrabold tracking-normal text-white sm:text-6xl lg:text-7xl">RailSafe</h1>
          <p className="mt-5 max-w-2xl text-2xl font-semibold text-orange-100">Safer Tracks, Secure Lives</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            A presentation-ready railway safety prototype for Indian Railways, combining obstacle detection, GPS tracking, emergency braking, and track health intelligence.
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onStart} className="premium-button mt-8 inline-flex items-center gap-3 rounded-2xl px-6 py-4 font-bold text-white">
            <RadioTower className="h-5 w-5" />
            Start Monitoring
          </motion.button>
        </motion.div>
        <div className="relative z-10">
          <TrainAnimation />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((item, index) => (
          <MetricCard key={item.label} {...item} icon={[TrainFront, ShieldAlert, ShieldCheck, BellRing][index]} />
        ))}
      </div>
    </section>
  );
}

function Dashboard({ trains, alerts, incidents, speed, distance, oppositeDistance, status, obstacleRisk, oppositeRisk, highestRisk, soundMuted, onToggleSound }) {
  const latestIncident = incidents[0];
  const glowClass = highestRisk === 'Danger' ? 'status-glow-danger' : highestRisk === 'Warning' ? 'status-glow-warning' : 'status-glow-safe';
  return (
    <Section id="dashboard" eyebrow="Operations Dashboard" title="Real-Time Train Monitoring">
      <div className="mb-5 grid gap-4 lg:grid-cols-4">
        <RiskCard title="Smart Risk Analysis" distance={Math.min(distance, oppositeDistance)} risk={highestRisk} />
        <RiskCard title="Static Obstacle" distance={distance} risk={obstacleRisk} />
        <RiskCard title="Opposite Train" distance={oppositeDistance} risk={oppositeRisk} />
        <div className="glass rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Sound Alert System</p>
              <h3 className="mt-2 text-xl font-extrabold text-white">{soundMuted ? 'Muted' : highestRisk === 'Danger' ? 'Emergency Siren' : highestRisk === 'Warning' ? 'Warning Tone' : 'Standby'}</h3>
            </div>
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={onToggleSound} className="premium-button flex h-11 w-11 items-center justify-center rounded-xl text-white" aria-label="Toggle sound alerts">
              {soundMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </motion.button>
          </div>
          <p className="mt-4 text-sm text-slate-300">Warning and siren tones continue while risk remains active.</p>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`glass ${glowClass} overflow-hidden rounded-2xl p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Active Train</p>
              <h3 className="text-2xl font-bold text-white">TRN-12901 Mumbai Rajdhani</h3>
            </div>
            <StatusPill status={status} />
          </div>
          <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
            <TrainMonitoringWidget speed={speed} distance={distance} oppositeDistance={oppositeDistance} status={highestRisk} />
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Train Speed" value={speed} suffix=" km/h" tone={status === 'Emergency Stop' ? 'orange' : 'cyan'} icon={Gauge} />
              <MetricCard label="Distance to Obstacle" value={distance} suffix=" m" tone={status === 'Safe' ? 'green' : 'orange'} icon={AlertTriangle} />
              <MetricCard label="Train-to-Train Distance" value={oppositeDistance} suffix=" m" tone={oppositeRisk === 'Safe' ? 'green' : 'orange'} icon={TrainFront} />
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="speed" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#061427', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="speed" stroke="#38bdf8" fill="url(#speed)" strokeWidth={3} />
                <Line type="monotone" dataKey="distance" stroke="#f97316" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid gap-5">
          <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h3 className="mb-3 text-lg font-bold text-white">Live Radar View</h3>
            <Radar alertLevel={highestRisk === 'Danger' ? 'Emergency Stop' : highestRisk} />
          </motion.div>
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-4 text-lg font-bold text-white">Real-Time Alert Dashboard</h3>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <StatusPill status={alert.level} />
                    <span className="text-xs text-slate-400">{alert.time}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{alert.type || 'Safety Alert'}</p>
                  <p className="mt-1 text-sm text-slate-200">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{alert.location} | {alert.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <LiveIncidentPanel incident={latestIncident} />
        <CameraAndGallery incidents={incidents} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <DetectionFeed distance={distance} oppositeDistance={oppositeDistance} obstacleRisk={obstacleRisk} oppositeRisk={oppositeRisk} />
        <AlertHistoryTable alerts={alerts} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {trains.map((train) => (
          <div key={train.id} className="glass rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{train.id}</p>
                <h3 className="mt-1 font-bold text-white">{train.name}</h3>
              </div>
              <StatusPill status={train.status} />
            </div>
            <p className="mt-4 text-sm text-slate-300">{train.line}</p>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-orange-500" style={{ width: `${train.speed}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="glass mt-5 overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-bold text-white">Train Monitoring Table</h3>
          <span className="text-sm font-semibold text-orange-100">{trains.length} active records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="enterprise-table w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-slate-300">
              <tr>
                <th className="px-4 py-3">Train Number</th>
                <th className="px-4 py-3">Train Name</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trains.map((train) => (
                <tr key={`row-${train.id}`} className="bg-slate-950/20">
                  <td className="px-4 py-3 font-bold text-white">{train.id}</td>
                  <td className="px-4 py-3 text-slate-200">{train.name}</td>
                  <td className="px-4 py-3 text-slate-200">{train.speed} km/h</td>
                  <td className="px-4 py-3 text-slate-200">{train.currentLocation || 'Control Zone'}</td>
                  <td className="px-4 py-3 text-slate-200">{train.destination || 'Assigned Terminal'}</td>
                  <td className="px-4 py-3"><StatusPill status={train.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

function TrainMonitoringWidget({ speed, distance, oppositeDistance, status }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35 p-5"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">Premium Train Monitoring</p>
          <h3 className="mt-2 text-xl font-extrabold text-white">TRN-12901</h3>
          <p className="text-sm text-slate-400">Mumbai Rajdhani | Active control link</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-orange-500/25 text-orange-100 ring-1 ring-white/10">
          <TrainFront className="h-7 w-7" />
        </span>
      </div>
      <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr] xl:grid-cols-1">
        <SpeedGauge value={speed} />
        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <span className="text-sm text-slate-300">Obstacle distance</span>
            <span className="font-bold text-white">{distance}m</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <span className="text-sm text-slate-300">Opposite train</span>
            <span className="font-bold text-white">{oppositeDistance}m</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <span className="text-sm text-slate-300">Status</span>
            <StatusPill status={status} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SpeedGauge({ value }) {
  const clamped = Math.max(0, Math.min(120, Number(value) || 0));
  const angle = -120 + (clamped / 120) * 240;
  return (
    <div className="mx-auto flex max-w-56 flex-col items-center">
      <div className="relative h-32 w-56 overflow-hidden">
        <div className="absolute left-1/2 top-4 h-48 w-48 -translate-x-1/2 rounded-full border-[14px] border-slate-800" />
        <div className="absolute left-1/2 top-4 h-48 w-48 -translate-x-1/2 rounded-full border-[14px] border-transparent border-t-emerald-400 border-r-yellow-300 border-b-orange-500 rotate-45 opacity-85" />
        <motion.div
          className="absolute bottom-3 left-1/2 h-1.5 w-20 origin-left rounded-full bg-orange-300 shadow-[0_0_18px_rgba(255,138,0,0.55)]"
          animate={{ rotate: angle }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        <div className="absolute bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
      </div>
      <p className="text-3xl font-extrabold text-white">{value}<span className="text-sm text-slate-400"> km/h</span></p>
    </div>
  );
}

function RiskCard({ title, distance, risk }) {
  const tone = risk === 'Danger' ? 'border-red-400/35 bg-red-500/10 text-red-100' : risk === 'Warning' ? 'border-amber-300/35 bg-amber-400/10 text-amber-100' : 'border-emerald-300/35 bg-emerald-400/10 text-emerald-100';
  return (
    <div className={`rounded-lg border p-5 ${tone}`}>
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-extrabold text-white">{distance}m</p>
          <StatusPill status={risk} />
        </div>
        {risk === 'Danger' ? <Siren className="h-9 w-9 text-red-200" /> : <ShieldCheck className="h-9 w-9" />}
      </div>
    </div>
  );
}

function LiveIncidentPanel({ incident }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">Live Incident Monitoring</p>
          <h3 className="mt-2 text-xl font-extrabold text-white">Latest Detection Snapshot</h3>
        </div>
        <Camera className="h-6 w-6 text-orange-200" />
      </div>
      {incident ? (
        <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <img className="aspect-video w-full rounded-lg border border-white/10 object-cover" src={incident.imageUrl} alt={`${incident.objectType} captured by RailSafe camera`} />
          <div className="space-y-3 text-sm">
            <IncidentRow label="Detection Time" value={formatDate(incident.timestamp)} />
            <IncidentRow label="GPS Location" value={`${Number(incident.latitude).toFixed(4)}, ${Number(incident.longitude).toFixed(4)}`} />
            <IncidentRow label="Distance" value={`${incident.distance} m`} />
            <IncidentRow label="Object Type" value={incident.objectType} />
            <IncidentRow label="Risk Level" value={<StatusPill status={incident.riskLevel} />} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-slate-300">Camera module is armed. Incident images will appear here automatically when a detection crosses the warning zone.</div>
      )}
    </div>
  );
}

function IncidentRow({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className="mt-1 font-semibold text-white">{value}</div>
    </div>
  );
}

function CameraAndGallery({ incidents }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">Live Camera Feed and Incident Image Gallery</h3>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">TRANSMITTING</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(incidents.length ? incidents.slice(0, 6) : [null, null, null]).map((incident, index) => (
          <div key={incident?.incidentId || index} className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
            {incident ? (
              <>
                <img className="aspect-video w-full object-cover" src={incident.imageUrl} alt={`${incident.objectType} incident`} />
                <div className="p-3">
                  <p className="text-sm font-bold text-white">{incident.objectType}</p>
                  <p className="text-xs text-slate-400">{formatDate(incident.timestamp)}</p>
                </div>
              </>
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-slate-500">Awaiting capture</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetectionFeed({ distance, oppositeDistance, obstacleRisk, oppositeRisk }) {
  return (
    <div className="glass rounded-lg p-5">
      <h3 className="text-lg font-bold text-white">Obstacle Detection Feed</h3>
      <div className="mt-4 grid gap-3">
        <DetectionRow label="Static obstacle on track" distance={distance} risk={obstacleRisk} />
        <DetectionRow label="Opposite train approaching same track" distance={oppositeDistance} risk={oppositeRisk} />
        <DetectionRow label="Closing distance analysis" distance={Math.max(0, oppositeDistance - distance)} risk={riskFromDistance(Math.min(distance, oppositeDistance))} />
      </div>
    </div>
  );
}

function DetectionRow({ label, distance, risk }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-slate-400">{distance} meters from active train</p>
      </div>
      <StatusPill status={risk} />
    </div>
  );
}

function AlertHistoryTable({ alerts }) {
  return (
    <div className="glass overflow-hidden rounded-lg">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-lg font-bold text-white">Alert History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Alert ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date and Time</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {alerts.slice(0, 8).map((alert) => (
              <tr key={`history-${alert.id}`} className="bg-slate-950/20">
                <td className="px-4 py-3 font-bold text-white">{alert.id}</td>
                <td className="px-4 py-3 text-slate-200">{alert.type || 'Safety Alert'}</td>
                <td className="px-4 py-3 text-slate-300">{alert.time}</td>
                <td className="px-4 py-3 text-slate-300">{alert.location || 'Control Zone'}</td>
                <td className="px-4 py-3"><StatusPill status={alert.level} /></td>
                <td className="px-4 py-3 text-slate-300">{alert.status || 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Collision({ distance, status, oppositeDistance, oppositeRisk }) {
  const braking = status === 'Emergency Stop';
  return (
    <Section id="collision" eyebrow="Collision Detection Module" title="Ultrasonic and Radar Sensor Simulation">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <TrainAnimation braking={braking} />
        <div className={`glass rounded-2xl p-6 ${braking ? 'status-glow-danger' : status === 'Warning' ? 'status-glow-warning' : 'status-glow-safe'}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">HC-SR04 / Radar Reading</p>
              <h3 className="mt-2 text-5xl font-extrabold text-white">{distance}m</h3>
            </div>
            <StatusPill status={status} />
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-300">Opposite Train Detection</p>
                <p className="mt-1 text-2xl font-extrabold text-white">{oppositeDistance}m</p>
              </div>
              <StatusPill status={oppositeRisk} />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {['Obstacle detected within threshold', 'Driver cabin warning triggered', 'Automatic braking logic engaged'].map((item, index) => (
              <motion.div key={item} whileHover={{ x: 4 }} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <span className={`h-3 w-3 rounded-full ${index === 0 && status !== 'Safe' ? 'bg-orange-400' : index === 2 && braking ? 'bg-red-400' : 'bg-emerald-400'}`} />
                <span className="text-sm text-slate-200">{item}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
              <span>Distance Visualization</span>
              <span>{distance}m</span>
            </div>
            <div className="relative h-4 rounded-full bg-white/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, distance)}%` }} transition={{ duration: 0.45 }} className="h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-300 to-emerald-400" />
              <motion.span animate={{ left: `${Math.min(96, Math.max(4, distance))}%` }} transition={{ duration: 0.45 }} className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-950 bg-orange-400 shadow-[0_0_20px_rgba(255,138,0,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function TrackHealth({ data }) {
  return (
    <Section id="track" eyebrow="Track Health Monitoring" title="Predictive Maintenance Intelligence">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-lg p-6">
          <p className="text-sm text-slate-300">Overall Health Score</p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <CircularProgress value={83} label="Network Health" />
            <div className="flex-1">
              <div className="text-6xl font-extrabold text-white">83%</div>
              <div className="mt-5 h-3 rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '83%' }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-orange-500 shadow-[0_0_22px_rgba(34,197,94,0.35)]" />
              </div>
            </div>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="metric" hide />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#061427', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {data.map((entry) => <Cell key={entry.metric} fill={entry.score > 90 ? '#34d399' : entry.score > 75 ? '#f59e0b' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((item) => (
            <motion.div key={item.metric} whileHover={{ y: -5, scale: 1.01 }} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-white">{item.metric}</h3>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-4 text-2xl font-extrabold text-orange-100">{item.value}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.score}%` }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="h-2 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(125,211,252,0.45)]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CircularProgress({ value, label }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#healthGradient)"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="healthGradient" x1="0" x2="1">
            <stop stopColor="#22C55E" />
            <stop offset="1" stopColor="#FF8A00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold text-white">{value}%</span>
        <span className="max-w-24 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      </div>
    </div>
  );
}

function MapModule({ incidents = [] }) {
  return (
    <Section id="map" eyebrow="Map and Location Module" title="GPS Tracking and Route Visualization">
      <div className="glass relative min-h-[430px] overflow-hidden rounded-lg p-5">
        <div className="rail-grid absolute inset-0 opacity-35" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M16 27 C 28 42, 37 45, 46 55 S 68 68, 82 78" fill="none" stroke="rgba(249,115,22,0.9)" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
        {routeStops.map((stop) => (
          <div key={stop.city} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${stop.x}%`, top: `${stop.y}%` }}>
            <motion.div animate={stop.kind === 'current' ? { scale: [1, 1.22, 1] } : {}} transition={{ duration: 1.4, repeat: Infinity }} className={`flex h-12 w-12 items-center justify-center rounded-full border ${stop.kind === 'current' ? 'border-orange-300 bg-orange-500 text-white shadow-glow' : 'border-sky-200/30 bg-slate-950/80 text-sky-100'}`}>
              {stop.kind === 'current' ? <TrainFront className="h-6 w-6" /> : <MapPin className="h-5 w-5" />}
            </motion.div>
            <div className="mt-2 rounded-md bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">{stop.city}</div>
          </div>
        ))}
        {incidents.slice(0, 5).map((incident, index) => {
          const left = Math.min(90, Math.max(10, 48 + (Number(incident.longitude) - 75.8648) * 420 + index * 3));
          const top = Math.min(86, Math.max(14, 52 - (Number(incident.latitude) - 25.2138) * 420 + index * 4));
          return (
            <div key={`incident-map-${incident.incidentId}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }}>
              <motion.div animate={{ scale: [1, 1.28, 1] }} transition={{ duration: 1.1, repeat: Infinity }} className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.55)]">
                <AlertTriangle className="h-5 w-5" />
              </motion.div>
              <div className="mt-2 whitespace-nowrap rounded-md bg-red-950/90 px-3 py-1 text-xs font-bold text-red-100 ring-1 ring-red-300/25">{incident.objectType}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <MetricCard label="GPS Train ID" value="TRN-12901" tone="cyan" icon={MapPin} />
        <MetricCard label="Stored Incidents" value={incidents.length} tone="orange" icon={AlertTriangle} />
        <MetricCard label="Latest Latitude" value={incidents[0] ? Number(incidents[0].latitude).toFixed(3) : '25.214'} tone="green" icon={RadioTower} />
      </div>
    </Section>
  );
}

function AlertsCenter({ alerts }) {
  return (
    <Section id="alerts" eyebrow="Alerts Center" title="Critical Alerts and Notification History">
      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="glass rounded-lg p-5">
          <h3 className="font-bold text-white">Alert Distribution</h3>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#061427', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="alerts" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="glass rounded-lg p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StatusPill status={alert.level} />
                    <span className="text-sm text-slate-400">{alert.id} | {alert.time}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-orange-200">{alert.type || 'Safety Alert'}</p>
                  <p className="mt-2 font-semibold text-white">{alert.message}</p>
                  <p className="mt-1 text-sm text-slate-400">{alert.location || 'Control Zone'} | {alert.status || 'Active'} | {alert.source}</p>
                </div>
                {alert.imageUrl && <img className="h-24 w-40 rounded-lg border border-white/10 object-cover" src={alert.imageUrl} alt={`${alert.type} captured incident`} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

const emptyTrainForm = {
  trainId: '',
  name: '',
  speed: '',
  currentLocation: '',
  destination: '',
  status: 'Safe'
};

function AdminPanel({ user, trains, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [form, setForm] = useState(emptyTrainForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 3200);
  };

  const openAddModal = () => {
    setEditingTrain(null);
    setForm(emptyTrainForm);
    setModalOpen(true);
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    setForm({
      trainId: train.id,
      name: train.name,
      speed: train.speed?.toString() || '',
      currentLocation: train.currentLocation || '',
      destination: train.destination || '',
      status: train.status === 'Emergency Stop' ? 'Emergency' : train.status
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const submitTrain = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        trainId: form.trainId.trim(),
        name: form.name.trim(),
        speed: form.speed,
        currentLocation: form.currentLocation.trim(),
        destination: form.destination.trim(),
        status: form.status
      };

      const result = editingTrain
        ? await updateTrain(editingTrain.id, payload)
        : await createTrain(payload);

      await onRefresh();
      setModalOpen(false);
      showToast('success', result.message || (editingTrain ? 'Train updated successfully' : 'Train added successfully'));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Unable to save train');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteTrain = async (train) => {
    const confirmed = window.confirm(`Delete ${train.id} - ${train.name}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(train.id);
    try {
      const result = await deleteTrain(train.id);
      await onRefresh();
      showToast('success', result.message || 'Train deleted successfully');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Unable to delete train');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Section id="admin" eyebrow="Admin Panel" title="Control Room Administration">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass rounded-lg p-6">
          <h3 className="text-xl font-bold text-white">Authenticated Session</h3>
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">Operator</p>
              <p className="mt-2 text-lg font-bold text-white">{user?.name}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">Email</p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-200">{user?.email}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">Role</p>
              <p className="mt-2 text-sm font-semibold capitalize text-slate-200">{user?.role}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-white">Analytics and Management</h3>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAddModal} className="premium-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white">
              <Plus className="h-4 w-4" />Add Train
            </motion.button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Trains Registered" value={trains.length} tone="green" icon={TrainFront} />
            <MetricCard label="Reports Today" value={31} tone="cyan" icon={BellRing} />
            <MetricCard label="Thermal Nodes" value={52} tone="amber" icon={Thermometer} />
          </div>
          <div className="mt-5 overflow-x-auto rounded-lg border border-white/10">
            <table className="enterprise-table w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Train Number</th>
                  <th className="px-4 py-3">Train Name</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {trains.map((train) => (
                  <tr key={`admin-${train.id}`} className="bg-slate-950/20">
                    <td className="px-4 py-3 font-bold text-white">{train.id}</td>
                    <td className="px-4 py-3 text-slate-200">{train.name}</td>
                    <td className="px-4 py-3 text-slate-200">{train.speed} km/h</td>
                    <td className="px-4 py-3 text-slate-200">{train.currentLocation || 'Control Zone'}</td>
                    <td className="px-4 py-3 text-slate-200">{train.destination || 'Assigned Terminal'}</td>
                    <td className="px-4 py-3"><StatusPill status={train.status} /></td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(train.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(train)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sky-100 transition hover:bg-sky-500 hover:text-white" aria-label={`Edit ${train.id}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => confirmDeleteTrain(train)} disabled={deletingId === train.id} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-red-100 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60" aria-label={`Delete ${train.id}`}>
                          {deletingId === train.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TrainModal
        open={modalOpen}
        editing={Boolean(editingTrain)}
        form={form}
        setForm={setForm}
        saving={saving}
        onClose={closeModal}
        onSubmit={submitTrain}
      />
    </Section>
  );
}

function TrainModal({ open, editing, form, setForm, saving, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={onSubmit}
        className="glass max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">{editing ? 'Edit Train' : 'Add Train'}</p>
            <h3 className="mt-2 text-2xl font-extrabold text-white">{editing ? 'Update Train Record' : 'Register New Train'}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10" aria-label="Close train modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <TrainField label="Train Number" value={form.trainId} disabled={editing} onChange={(value) => setForm({ ...form, trainId: value })} />
          <TrainField label="Train Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <TrainField label="Current Speed" type="number" value={form.speed} onChange={(value) => setForm({ ...form, speed: value })} />
          <TrainField label="Current Location" value={form.currentLocation} onChange={(value) => setForm({ ...form, currentLocation: value })} />
          <TrainField label="Destination" value={form.destination} onChange={(value) => setForm({ ...form, destination: value })} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">Status</span>
            <select
              required
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-orange-400/40 focus:ring-2"
            >
              <option>Safe</option>
              <option>Warning</option>
              <option>Emergency</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-white/10 px-5 py-3 font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-60">Cancel</button>
          <button disabled={saving} className="premium-button inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            {saving ? 'Saving...' : editing ? 'Update Train' : 'Add Train'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function TrainField({ label, type = 'text', value, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <input
        required
        disabled={disabled}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-orange-400/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={label}
      />
    </label>
  );
}

function Toast({ type, message, onClose }) {
  const success = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed right-4 top-24 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-panel ${success ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100' : 'border-red-400/30 bg-red-500/15 text-red-100'}`}
    >
      {success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 text-current opacity-80 hover:opacity-100" aria-label="Close notification">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function formatDate(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
