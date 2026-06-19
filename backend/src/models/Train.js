import mongoose from 'mongoose';

const trainSchema = new mongoose.Schema(
  {
    trainId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    speed: { type: Number, required: true, default: 0 },
    currentLocation: { type: String, required: true },
    destination: { type: String, required: true },
    route: String,
    status: { type: String, enum: ['Safe', 'Warning', 'Emergency'], default: 'Safe' },
    driver: String
  },
  { timestamps: true }
);

export default mongoose.model('Train', trainSchema);
