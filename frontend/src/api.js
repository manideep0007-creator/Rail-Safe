import axios from 'axios';
import { io } from 'socket.io-client';
import { alerts, stats, trackHealth, trains } from './data/mockData';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 8000
});


client.interceptors.request.use((config) => {
  const token = localStorage.getItem('railsafe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getOverview() {
  try {
    const { data } = await client.get('/overview');
    return data;
  } catch {
    return { stats, trains, alerts, trackHealth };
  }
}

export async function getTrains() {
  const { data } = await client.get('/trains');
  return data;
}

export async function createTrain(payload) {
  const { data } = await client.post('/trains', payload);
  return data;
}

export async function updateTrain(trainId, payload) {
  const { data } = await client.put(`/trains/${encodeURIComponent(trainId)}`, payload);
  return data;
}

export async function deleteTrain(trainId) {
  const { data } = await client.delete(`/trains/${encodeURIComponent(trainId)}`);
  return data;
}

export async function registerUser(payload) {
  const { data } = await client.post('/auth/register', payload);
  return data;
}

export async function loginUser(credentials) {
  const { data } = await client.post('/auth/login', credentials);
  return data;
}

export async function getProfile() {
  const { data } = await client.get('/auth/profile');
  return data.user;
}

export async function getIncidents() {
  const { data } = await client.get('/incidents');
  return data;
}

export async function createIncident(payload) {
  const { data } = await client.post('/incidents', payload);
  return data;
}

export async function getImages() {
  const { data } = await client.get('/images');
  return data;
}

export function createSocket() {
  return io('https://rail-safe-production.up.railway.app', {
    transports: ['websocket', 'polling']
  });
}
