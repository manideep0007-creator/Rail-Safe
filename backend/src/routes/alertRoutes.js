import express from 'express';
import Alert from '../models/Alert.js';
import { demoAlerts } from '../seed/demoData.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  if (Alert.db.readyState !== 1) return res.json(demoAlerts);
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json(alerts.length ? alerts : demoAlerts);
});

router.post('/', async (req, res) => {
  if (Alert.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to create alerts' });
  const alert = await Alert.create(req.body);
  req.app.get('io')?.emit('alert:new', alert);
  res.status(201).json(alert);
});

export default router;
