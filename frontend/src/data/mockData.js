export const stats = [
  { label: 'Trains Monitored', value: 28, suffix: '+', tone: 'cyan' },
  { label: 'Obstacles Detected', value: 143, suffix: '', tone: 'orange' },
  { label: 'Track Health Status', value: 92, suffix: '%', tone: 'green' },
  { label: 'Safety Alerts Generated', value: 418, suffix: '', tone: 'amber' }
];

export const trains = [
  { id: 'TRN-12901', trainId: 'TRN-12901', name: 'Mumbai Rajdhani', speed: 86, status: 'Safe', line: 'Delhi-Mumbai', currentLocation: 'Kota', destination: 'Mumbai CSMT', driver: 'A. Sharma', createdAt: '2026-06-18T15:00:00.000Z' },
  { id: 'TRN-12627', trainId: 'TRN-12627', name: 'Karnataka Express', speed: 64, status: 'Warning', line: 'Bengaluru-New Delhi', currentLocation: 'Nagpur', destination: 'New Delhi', driver: 'S. Rao', createdAt: '2026-06-18T15:08:00.000Z' },
  { id: 'TRN-12002', trainId: 'TRN-12002', name: 'Shatabdi Express', speed: 42, status: 'Safe', line: 'Bhopal-New Delhi', currentLocation: 'Bhopal', destination: 'New Delhi', driver: 'R. Verma', createdAt: '2026-06-18T15:16:00.000Z' }
];

export const alerts = [
  { id: 'ALT-901', type: 'Obstacle Detected', level: 'Danger', location: 'KM 184/7 Kota Sector', status: 'Active', message: 'Obstacle detected on Up Main Line near KM 184/7', time: '09:42 PM', source: 'Radar Sensor RS-08' },
  { id: 'ALT-884', type: 'High Temperature Detected', level: 'Warning', location: 'Nagpur Sector', status: 'Active', message: 'Track temperature above threshold near Nagpur sector', time: '09:34 PM', source: 'Thermal Node TN-14' },
  { id: 'ALT-861', type: 'Track Crack Detected', level: 'Info', location: 'Central Zone', status: 'Resolved', message: 'Sensor health check completed for Central Zone', time: '09:22 PM', source: 'System' },
  { id: 'ALT-853', type: 'Loose Bolt Detected', level: 'Warning', location: 'Curve C-19', status: 'Active', message: 'Loose bolt probability 63% on curve section C-19', time: '09:11 PM', source: 'Vision Sensor VS-03' }
];

export const trackHealth = [
  { metric: 'Loose Bolt Detection', score: 86, status: 'Warning', value: '3 suspects' },
  { metric: 'Rail Crack Detection', score: 94, status: 'Safe', value: 'No crack' },
  { metric: 'Track Misalignment Detection', score: 79, status: 'Warning', value: '8 mm drift' },
  { metric: 'Temperature Monitoring', score: 72, status: 'Warning', value: '47 C' }
];

export const chartData = [
  { time: '18:00', speed: 86, distance: 92, alerts: 2 },
  { time: '18:30', speed: 82, distance: 74, alerts: 3 },
  { time: '19:00', speed: 78, distance: 61, alerts: 4 },
  { time: '19:30', speed: 72, distance: 48, alerts: 6 },
  { time: '20:00', speed: 63, distance: 35, alerts: 9 },
  { time: '20:30', speed: 54, distance: 28, alerts: 11 },
  { time: '21:00', speed: 46, distance: 19, alerts: 14 }
];

export const routeStops = [
  { city: 'New Delhi', x: 16, y: 27, kind: 'origin' },
  { city: 'Mathura', x: 30, y: 39, kind: 'checkpoint' },
  { city: 'Kota', x: 46, y: 55, kind: 'current' },
  { city: 'Vadodara', x: 65, y: 68, kind: 'checkpoint' },
  { city: 'Mumbai CSMT', x: 82, y: 78, kind: 'destination' }
];
