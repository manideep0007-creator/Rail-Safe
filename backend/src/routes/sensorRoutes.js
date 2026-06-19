import express from 'express';
import Sensor from '../models/Sensor.js';
import { demoSensors } from '../seed/demoData.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  if (Sensor.db.readyState !== 1) return res.json(demoSensors);
  const sensors = await Sensor.find().sort({ updatedAt: -1 });
  res.json(sensors.length ? sensors : demoSensors);
});

router.post('/', async (req, res) => {
  if (Sensor.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to create sensors' });
  const sensor = await Sensor.create(req.body);
  res.status(201).json(sensor);
});

export default router;
