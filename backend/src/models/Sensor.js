import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Radar', 'HC-SR04 Ultrasonic', 'Temperature', 'Vision', 'Vibration'], required: true },
    trainId: String,
    status: { type: String, enum: ['Online', 'Offline', 'Maintenance'], default: 'Online' },
    battery: { type: Number, default: 100 },
    lastReading: Number
  },
  { timestamps: true }
);

export default mongoose.model('Sensor', sensorSchema);
