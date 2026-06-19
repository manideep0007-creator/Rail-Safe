import mongoose from 'mongoose';

const trackHealthSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true },
    looseBoltScore: Number,
    crackScore: Number,
    misalignmentScore: Number,
    temperature: Number,
    healthScore: Number,
    status: { type: String, enum: ['Safe', 'Warning', 'Critical'], default: 'Safe' }
  },
  { timestamps: true }
);

export default mongoose.model('TrackHealth', trackHealthSchema);
