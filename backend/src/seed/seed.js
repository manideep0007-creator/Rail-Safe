import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Alert from '../models/Alert.js';
import Location from '../models/Location.js';
import Image from '../models/Image.js';
import Incident from '../models/Incident.js';
import Sensor from '../models/Sensor.js';
import TrackHealth from '../models/TrackHealth.js';
import Train from '../models/Train.js';
import User from '../models/User.js';
import { demoAlerts, demoLocations, demoSensors, demoTrackHealth, demoTrains, demoUsers } from './demoData.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railsafe';
await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

await Promise.all([
  User.deleteMany({}),
  Train.deleteMany({}),
  Sensor.deleteMany({}),
  TrackHealth.deleteMany({}),
  Alert.deleteMany({}),
  Location.deleteMany({}),
  Incident.deleteMany({}),
  Image.deleteMany({})
]);

await User.insertMany(await Promise.all(demoUsers.map(async (user) => ({
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  password: await bcrypt.hash(user.password, 10)
}))));
await Train.insertMany(demoTrains);
await Sensor.insertMany(demoSensors);
await TrackHealth.insertMany(demoTrackHealth);
await Alert.insertMany(demoAlerts);
await Location.insertMany(demoLocations);

console.log('RailSafe demo database seeded.');
await mongoose.disconnect();
