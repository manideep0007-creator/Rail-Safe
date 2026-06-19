import express from 'express';
import TrackHealth from '../models/TrackHealth.js';
import { demoTrackHealth } from '../seed/demoData.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  if (TrackHealth.db.readyState !== 1) return res.json(demoTrackHealth);
  const records = await TrackHealth.find().sort({ updatedAt: -1 });
  res.json(records.length ? records : demoTrackHealth);
});

router.post('/', async (req, res) => {
  if (TrackHealth.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to create health records' });
  const record = await TrackHealth.create(req.body);
  res.status(201).json(record);
});

export default router;
