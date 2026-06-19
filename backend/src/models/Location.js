import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    trainId: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    currentCity: String,
    destination: String,
    routeProgress: Number
  },
  { timestamps: true }
);

export default mongoose.model('Location', locationSchema);
