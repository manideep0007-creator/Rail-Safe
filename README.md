# RailSafe - Smart Railway Collision Avoidance and Track Health Monitoring System

RailSafe is a presentation-ready B.Tech Design Thinking & Innovation prototype for a railway safety product inspired by Indian Railways operations. It includes a futuristic React dashboard, live obstacle simulation, automatic braking UI, track health monitoring, GPS route visualization, alerts, admin login, and a Node/Express/MongoDB backend.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- Database collections: `users`, `trains`, `sensors`, `trackHealth`, `alerts`, `locations`

## Folder Structure

```text
railsafe-prototype/
  frontend/
    src/
      components/
      data/
      App.jsx
      api.js
      main.jsx
      styles.css
  backend/
    src/
      config/
      models/
      routes/
      seed/
      server.js
  README.md
```

## Quick Start

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

Open the frontend at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:5000
```

## MongoDB Setup

1. Start MongoDB locally.
2. Copy the backend environment file:

```bash
cd backend
copy .env.example .env
```

3. Seed the database:

```bash
npm run seed
```

If MongoDB is not running, the API still serves in-memory demo data so the frontend remains usable for presentations.

## Authentication

```text
User:
Email: user@railsafe.in
Password: user123

Admin:
Email: admin@railsafe.in
Password: admin123
```

The app includes MongoDB-backed registration and login. Passwords are hashed with bcrypt, JWT tokens are stored in `localStorage`, sessions are restored on refresh through `/api/auth/profile`, and protected pages redirect unauthenticated users to `/login`.

## API Routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/overview`
- `GET /api/trains`
- `POST /api/trains`
- `PATCH /api/trains/:trainId/status`
- `GET /api/sensors`
- `POST /api/sensors`
- `GET /api/track-health`
- `POST /api/track-health`
- `GET /api/alerts`
- `POST /api/alerts`
- `GET /api/locations`
- `POST /api/locations`

## Prototype Features

- Animated train moving on railway track
- Real-time train monitoring dashboard
- Live obstacle distance simulation
- Green, yellow, red train status logic
- Emergency braking animation
- Animated radar scanning effect
- Loose bolt, crack, misalignment, and temperature monitoring
- Health score and charts
- GPS route visualization from New Delhi to Mumbai CSMT
- Critical, warning, and info alert center
- Admin login and management dashboard
- Registration, login, persistent JWT sessions, and logout
- Responsive layout for desktop and mobile

## Presentation Notes

This prototype is designed as a polished product demo. During a presentation, start on the Home page, click **Start Monitoring**, then let the collision simulation cycle until it enters Warning and Emergency Stop states. Use the Dashboard, Collision Detection, Track Health, Map, Alerts, and Admin sections to explain the full safety workflow.
