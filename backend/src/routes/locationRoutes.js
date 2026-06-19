import express from 'express';
import Location from '../models/Location.js';
import { demoLocations } from '../seed/demoData.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  if (Location.db.readyState !== 1) return res.json(demoLocations);
  const locations = await Location.find().sort({ updatedAt: -1 });
  res.json(locations.length ? locations : demoLocations);
});

router.post('/', async (req, res) => {
  if (Location.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to create locations' });
  const location = await Location.create(req.body);
  res.status(201).json(location);
});

export default router;
