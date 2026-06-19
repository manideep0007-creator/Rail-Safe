export const demoUsers = [
  { name: 'RailSafe User', email: 'user@railsafe.in', phone: '9876543210', password: 'user123', role: 'user' },
  { name: 'RailSafe Admin', email: 'admin@railsafe.in', phone: '9876543211', password: 'admin123', role: 'admin' }
];

export const demoTrains = [
  { trainId: 'TRN-12901', name: 'Mumbai Rajdhani', currentLocation: 'Kota', destination: 'Mumbai CSMT', route: 'New Delhi to Mumbai CSMT', speed: 86, status: 'Safe', driver: 'A. Sharma' },
  { trainId: 'TRN-12627', name: 'Karnataka Express', currentLocation: 'Nagpur', destination: 'New Delhi', route: 'Bengaluru to New Delhi', speed: 64, status: 'Warning', driver: 'S. Rao' },
  { trainId: 'TRN-12002', name: 'Shatabdi Express', currentLocation: 'Bhopal', destination: 'New Delhi', route: 'Bhopal to New Delhi', speed: 42, status: 'Safe', driver: 'R. Verma' }
];

export const demoSensors = [
  { sensorId: 'RS-08', type: 'Radar', trainId: 'TRN-12901', status: 'Online', battery: 94, lastReading: 38 },
  { sensorId: 'US-14', type: 'HC-SR04 Ultrasonic', trainId: 'TRN-12627', status: 'Online', battery: 88, lastReading: 22 },
  { sensorId: 'TN-14', type: 'Temperature', trainId: 'TRN-12002', status: 'Online', battery: 91, lastReading: 47 }
];

export const demoTrackHealth = [
  { sectionId: 'KM-184-7', looseBoltScore: 86, crackScore: 94, misalignmentScore: 79, temperature: 47, healthScore: 83, status: 'Warning' },
  { sectionId: 'KM-191-2', looseBoltScore: 96, crackScore: 98, misalignmentScore: 93, temperature: 41, healthScore: 95, status: 'Safe' }
];

export const demoAlerts = [
  { alertId: 'ALT-901', type: 'Obstacle Detected', level: 'Danger', location: 'KM 184/7 Kota Sector', status: 'Active', message: 'Obstacle detected on Up Main Line near KM 184/7', source: 'Radar Sensor RS-08' },
  { alertId: 'ALT-884', type: 'High Temperature Detected', level: 'Warning', location: 'Nagpur Sector', status: 'Active', message: 'Track temperature above threshold near Nagpur sector', source: 'Thermal Node TN-14' },
  { alertId: 'ALT-861', type: 'Track Crack Detected', level: 'Info', location: 'Central Zone', status: 'Resolved', message: 'Sensor health check completed for Central Zone', source: 'System' },
  { alertId: 'ALT-853', type: 'Loose Bolt Detected', level: 'Warning', location: 'Curve C-19', status: 'Active', message: 'Loose bolt probability 63% on curve section C-19', source: 'Vision Sensor VS-03' }
];

export const demoLocations = [
  { trainId: 'TRN-12901', latitude: 25.2138, longitude: 75.8648, currentCity: 'Kota', destination: 'Mumbai CSMT', routeProgress: 56 },
  { trainId: 'TRN-12627', latitude: 21.1458, longitude: 79.0882, currentCity: 'Nagpur', destination: 'New Delhi', routeProgress: 61 }
];
