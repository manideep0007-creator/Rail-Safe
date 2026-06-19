import express from 'express';
import Alert from '../models/Alert.js';
import Sensor from '../models/Sensor.js';
import TrackHealth from '../models/TrackHealth.js';
import Train from '../models/Train.js';
import { demoAlerts, demoSensors, demoTrackHealth, demoTrains } from '../seed/demoData.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const connected = Train.db.readyState === 1;
  let trains = connected ? await Train.find().sort({ updatedAt: -1 }).lean() : demoTrains;
  let alerts = connected ? await Alert.find().sort({ createdAt: -1 }).limit(8).lean() : demoAlerts;
  let sensors = connected ? await Sensor.find().lean() : demoSensors;
  let trackHealthRows = connected ? await TrackHealth.find().lean() : demoTrackHealth;
  trains = trains.length ? trains : demoTrains;
  alerts = alerts.length ? alerts : demoAlerts;
  sensors = sensors.length ? sensors : demoSensors;
  trackHealthRows = trackHealthRows.length ? trackHealthRows : demoTrackHealth;
  const averageHealth = Math.round(trackHealthRows.reduce((sum, row) => sum + row.healthScore, 0) / Math.max(trackHealthRows.length, 1));

  res.json({
    stats: [
      { label: 'Trains Monitored', value: trains.length * 9 + 1, suffix: '+', tone: 'cyan' },
      { label: 'Obstacles Detected', value: 143, suffix: '', tone: 'orange' },
      { label: 'Track Health Status', value: averageHealth, suffix: '%', tone: 'green' },
      { label: 'Safety Alerts Generated', value: alerts.length * 102 + 10, suffix: '', tone: 'amber' }
    ],
    trains: trains.map((train) => ({
      id: train.trainId,
      name: train.name,
      speed: train.speed,
      status: train.status,
      line: train.route || `${train.currentLocation} to ${train.destination}`,
      currentLocation: train.currentLocation,
      destination: train.destination,
      driver: train.driver,
      createdAt: train.createdAt
    })),
    sensors,
    trackHealth: [
      { metric: 'Loose Bolt Detection', score: trackHealthRows[0]?.looseBoltScore || 86, status: 'Warning', value: '3 suspects' },
      { metric: 'Rail Crack Detection', score: trackHealthRows[0]?.crackScore || 94, status: 'Safe', value: 'No crack' },
      { metric: 'Track Misalignment Detection', score: trackHealthRows[0]?.misalignmentScore || 79, status: 'Warning', value: '8 mm drift' },
      { metric: 'Temperature Monitoring', score: 72, status: 'Warning', value: `${trackHealthRows[0]?.temperature || 47} C` }
    ],
    alerts: alerts.map((alert, index) => ({
      id: alert.alertId,
      type: alert.type,
      level: alert.level,
      location: alert.location,
      status: alert.status,
      imageUrl: alert.imageUrl,
      incidentId: alert.incidentId,
      message: alert.message,
      source: alert.source,
      time: index === 0 ? '09:42 PM' : `09:${34 - index * 7} PM`
    }))
  });
});

export default router;
