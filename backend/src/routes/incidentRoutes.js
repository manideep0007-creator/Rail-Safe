import express from 'express';
import Alert from '../models/Alert.js';
import Image from '../models/Image.js';
import Incident from '../models/Incident.js';

const router = express.Router();

const alertTypeFromObject = (objectType, riskLevel) => {
  if (riskLevel === 'Danger') return 'Emergency Braking Activated';
  if (objectType === 'Opposite Train') return 'Opposite Train Detected';
  if (objectType === 'Track Crack') return 'Track Crack Detected';
  if (objectType === 'Loose Bolt') return 'Loose Bolt Detected';
  if (objectType === 'High Temperature') return 'High Temperature Detected';
  return 'Obstacle Detected';
};

router.get('/', async (_req, res) => {
  if (Incident.db.readyState !== 1) return res.json([]);
  res.json(await Incident.find().sort({ timestamp: -1 }).limit(50));
});

router.post('/', async (req, res) => {
  if (Incident.db.readyState !== 1) return res.status(503).json({ message: 'MongoDB is required to create incidents' });

  const { incidentId, trainId, objectType, imageUrl, latitude, longitude, distance, riskLevel } = req.body;
  if (!incidentId || !trainId || !objectType || !imageUrl || latitude === undefined || longitude === undefined || distance === undefined || !riskLevel) {
    return res.status(400).json({ message: 'All incident fields are required' });
  }

  const incident = await Incident.create({
    incidentId,
    trainId,
    objectType,
    imageUrl,
    latitude: Number(latitude),
    longitude: Number(longitude),
    distance: Number(distance),
    riskLevel
  });

  const image = await Image.create({
    imageId: `IMG-${incidentId}`,
    imageUrl,
    capturedAt: incident.timestamp,
    location: { latitude: incident.latitude, longitude: incident.longitude, label: `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}` }
  });

  const alert = await Alert.create({
    alertId: `ALT-${incidentId}`,
    type: alertTypeFromObject(objectType, riskLevel),
    level: riskLevel,
    location: image.location.label,
    status: riskLevel === 'Safe' ? 'Resolved' : 'Active',
    message: `${objectType} detected ${distance}m from ${trainId}`,
    source: 'RailSafe Sensor Fusion',
    imageUrl,
    incidentId
  });

  req.app.get('io')?.emit('incident:new', incident);
  req.app.get('io')?.emit('alert:new', alert);
  res.status(201).json({ message: 'Incident captured successfully', incident, image, alert });
});

export default router;
