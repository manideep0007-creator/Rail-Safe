import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, required: true, unique: true },
    trainId: { type: String, required: true },
    objectType: { type: String, required: true },
    imageUrl: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    distance: { type: Number, required: true },
    riskLevel: { type: String, enum: ['Safe', 'Warning', 'Danger'], required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Incident', incidentSchema);
