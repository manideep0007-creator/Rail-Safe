import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET || 'railsafe-demo-secret',
  { expiresIn: '8h' }
);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt
});

router.post('/register', async (req, res) => {
  if (User.db.readyState !== 1) {
    return res.status(503).json({ message: 'MongoDB connection is required for registration' });
  }

  const { name, email, phone, password, confirmPassword } = req.body;
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password and confirm password must match' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password: hashedPassword
  });

  return res.status(201).json({
    message: 'Registration successful. Please login.',
    user: publicUser(user)
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  if (User.db.readyState !== 1) {
    return res.status(503).json({ message: 'MongoDB connection is required for login' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  return res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/profile', protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
