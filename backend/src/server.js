import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import alertRoutes from './routes/alertRoutes.js';
import authRoutes from './routes/authRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import overviewRoutes from './routes/overviewRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import trackHealthRoutes from './routes/trackHealthRoutes.js';
import trainRoutes from './routes/trainRoutes.js';

dotenv.config();
await connectDB();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: clientUrl }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.emit('system:ready', { message: 'RailSafe control channel connected' });
});

app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: '8mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RailSafe API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/track-health', trackHealthRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/images', imageRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
});

server.listen(port, () => {
  console.log(`RailSafe API running on http://localhost:${port}`);
});
