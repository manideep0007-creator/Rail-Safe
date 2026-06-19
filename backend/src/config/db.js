import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/railsafe';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.warn('MongoDB unavailable. API will continue with in-memory demo data.');
    console.warn(error.message);
  }
}
