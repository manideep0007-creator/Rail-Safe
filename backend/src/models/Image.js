import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    imageId: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    capturedAt: { type: Date, default: Date.now },
    location: {
      latitude: Number,
      longitude: Number,
      label: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Image', imageSchema);
