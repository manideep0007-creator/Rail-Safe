import express from 'express';
import Train from '../models/Train.js';
import { demoTrains } from '../seed/demoData.js';

const router = express.Router();
const statuses = ['Safe', 'Warning', 'Emergency'];

const normalizeTrain = (body) => ({
  trainId: body.trainId?.trim(),
  name: body.name?.trim(),
  speed: Number(body.speed),
  currentLocation: body.currentLocation?.trim(),
  destination: body.destination?.trim(),
  route: `${body.currentLocation?.trim()} to ${body.destination?.trim()}`,
  status: body.status
});

const validateTrain = (body) => {
  const train = normalizeTrain(body);
  if (!train.trainId || !train.name || !body.speed?.toString() || !train.currentLocation || !train.destination || !train.status) {
    return { error: 'All train fields are required' };
  }
  if (Number.isNaN(train.speed)) {
    return { error: 'Speed must be numeric' };
  }
  if (!statuses.includes(train.status)) {
    return { error: 'Status must be Safe, Warning, or Emergency' };
  }
  return { train };
};

router.get('/', async (_req, res) => {
  if (Train.db.readyState !== 1) return res.json(demoTrains);
  const trains = await Train.find().sort({ updatedAt: -1 });
  res.json(trains.length ? trains : demoTrains);
});

router.post('/', async (req, res) => {
  if (Train.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to create trains' });
  const { error, train } = validateTrain(req.body);
  if (error) return res.status(400).json({ message: error });

  const existingTrain = await Train.findOne({ trainId: train.trainId });
  if (existingTrain) return res.status(409).json({ message: 'Train Number must be unique' });

  const createdTrain = await Train.create(train);
  res.status(201).json({ message: 'Train added successfully', train: createdTrain });
});

router.put('/:trainId', async (req, res) => {
  if (Train.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to update trains' });
  const { error, train } = validateTrain({ ...req.body, trainId: req.params.trainId });
  if (error) return res.status(400).json({ message: error });

  const updatedTrain = await Train.findOneAndUpdate(
    { trainId: req.params.trainId },
    { ...train, trainId: req.params.trainId },
    { new: true, runValidators: true }
  );

  if (!updatedTrain) return res.status(404).json({ message: 'Train not found' });
  res.json({ message: 'Train updated successfully', train: updatedTrain });
});

router.delete('/:trainId', async (req, res) => {
  if (Train.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to delete trains' });
  const deletedTrain = await Train.findOneAndDelete({ trainId: req.params.trainId });
  if (!deletedTrain) return res.status(404).json({ message: 'Train not found' });
  res.json({ message: 'Train deleted successfully', train: deletedTrain });
});

router.patch('/:trainId/status', async (req, res) => {
  if (Train.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to update trains' });
  const train = await Train.findOneAndUpdate({ trainId: req.params.trainId }, req.body, { new: true });
  res.json(train);
});

export default router;
