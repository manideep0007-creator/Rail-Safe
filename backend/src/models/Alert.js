import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: [
        'Obstacle Detected',
        'Opposite Train Detected',
        'Track Crack Detected',
        'Loose Bolt Detected',
        'High Temperature Detected',
        'Emergency Braking Activated'
      ],
      default: 'Obstacle Detected'
    },
    level: { type: String, enum: ['Safe', 'Warning', 'Danger', 'Critical', 'Info'], required: true },
    location: String,
    status: { type: String, enum: ['Active', 'Resolved', 'Acknowledged'], default: 'Active' },
    message: { type: String, required: true },
    source: String,
    imageUrl: String,
    incidentId: String,
    acknowledged: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Alert', alertSchema);
