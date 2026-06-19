import express from 'express';
import Image from '../models/Image.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  if (Image.db.readyState !== 1) return res.json([]);
  res.json(await Image.find().sort({ capturedAt: -1 }).limit(50));
});

export default router;
