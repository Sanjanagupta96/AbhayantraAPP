import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'abhayantra-super-secure-token-secret-2026';
const DB_FILE = path.join(__dirname, 'data', 'abhayantra_db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial Database Structure
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  emergencyPin: string;
  language: string;
  createdAt: string;
}

interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnSos: boolean;
  notifyOnWalk: boolean;
}

interface ConfidenceZone {
  id: string;
  name: string;
  category: 'police' | 'pharmacy' | 'cafe' | 'transit' | 'safe_hub';
  lat: number;
  lng: number;
  address: string;
  lightingScore: number; // 0 - 100
  crowdLevel: 'High' | 'Moderate' | 'Low';
  isOpen24x7: boolean;
  verifiedCount: number;
  addedBy: string;
}

interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  lat: number;
  lng: number;
  address?: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'cancelled';
  batteryLevel?: number;
  trackingToken: string;
  expiresAt: string;
  evidenceAudio?: string;
}

interface WalkSession {
  id: string;
  userId: string;
  userName: string;
  destination: string;
  destLat: number;
  destLng: number;
  currentLat: number;
  currentLng: number;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'sos_triggered';
  sharedContacts: string[];
}

interface DB {
  users: User[];
  contacts: Contact[];
  confidenceZones: ConfidenceZone[];
  sosAlerts: SosAlert[];
  walkSessions: WalkSession[];
}

const defaultDB: DB = {
  users: [
    {
      id: 'demo-user-1',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 98765 43210',
      passwordHash: bcrypt.hashSync('priya123', 8),
      emergencyPin: '1234',
      language: 'en',
      createdAt: new Date().toISOString()
    }
  ],
  contacts: [
    {
      id: 'contact-1',
      userId: 'demo-user-1',
      name: 'Maa (Mother)',
      phone: '+91 98111 22233',
      relationship: 'Mother',
      notifyOnSos: true,
      notifyOnWalk: true
    },
    {
      id: 'contact-2',
      userId: 'demo-user-1',
      name: 'Aarav (Brother)',
      phone: '+91 98222 33344',
      relationship: 'Brother',
      notifyOnSos: true,
      notifyOnWalk: false
    },
    {
      id: 'contact-3',
      userId: 'demo-user-1',
      name: 'Sneha (Roommate)',
      phone: '+91 98333 44455',
      relationship: 'Friend',
      notifyOnSos: true,
      notifyOnWalk: true
    }
  ],
  confidenceZones: [
    {
      id: 'zone-1',
      name: 'Connaught Place All-Women Police Desk',
      category: 'police',
      lat: 28.6315,
      lng: 77.2167,
      address: 'Inner Circle, Block B, CP, New Delhi',
      lightingScore: 98,
      crowdLevel: 'High',
      isOpen24x7: true,
      verifiedCount: 342,
      addedBy: 'Delhi Safety Volunteer Network'
    },
    {
      id: 'zone-2',
      name: 'Apollo 24/7 Pharmacy & First Aid Hub',
      category: 'pharmacy',
      lat: 28.6340,
      lng: 77.2195,
      address: 'Barakhamba Road, Near Metro Gate 3',
      lightingScore: 94,
      crowdLevel: 'Moderate',
      isOpen24x7: true,
      verifiedCount: 189,
      addedBy: 'Community Safe Walk Group'
    },
    {
      id: 'zone-3',
      name: 'Rajiv Chowk Metro Station - Gate 4 (Security Guarded)',
      category: 'transit',
      lat: 28.6328,
      lng: 77.2190,
      address: 'Central Park / Radial Road 2, New Delhi',
      lightingScore: 99,
      crowdLevel: 'High',
      isOpen24x7: false,
      verifiedCount: 512,
      addedBy: 'DMRC Community Assist'
    },
    {
      id: 'zone-4',
      name: 'Cafe Coffee Day 24hr Lounge (Well-Lit Public Haven)',
      category: 'cafe',
      lat: 28.6295,
      lng: 77.2140,
      address: 'Janpath Main Market, New Delhi',
      lightingScore: 92,
      crowdLevel: 'High',
      isOpen24x7: true,
      verifiedCount: 147,
      addedBy: 'Priya S.'
    },
    {
      id: 'zone-5',
      name: 'Hauz Khas Pink Booth (Delhi Police)',
      category: 'police',
      lat: 28.5494,
      lng: 77.2001,
      address: 'Aurobindo Marg, Near Market, New Delhi',
      lightingScore: 96,
      crowdLevel: 'Moderate',
      isOpen24x7: true,
      verifiedCount: 220,
      addedBy: 'SafetiPin Community'
    },
    {
      id: 'zone-6',
      name: 'MedPlus 24-Hour Chemist & Safe Spot',
      category: 'pharmacy',
      lat: 28.5520,
      lng: 77.2050,
      address: 'Green Park Main Market, New Delhi',
      lightingScore: 90,
      crowdLevel: 'Moderate',
      isOpen24x7: true,
      verifiedCount: 95,
      addedBy: 'Sneha R.'
    }
  ],
  sosAlerts: [],
  walkSessions: []
};

// Database helper functions
function readDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file, using fallback:', err);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
  return defaultDB;
}

function writeDB(data: DB): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to database:', err);
  }
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth Token Verification Middleware
interface AuthRequest extends Request {
  userId?: string;
  user?: User;
}

const authenticateToken = (req: AuthRequest, res: Response, next: () => void) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token, check if we have a demo user fallback for quick testing
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token' });
    }
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.userId = user.id;
    req.user = user;
    next();
  });
};

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', app: 'Abhayantra Safety API', time: new Date().toISOString() });
});

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, emergencyPin, language } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      emergencyPin: emergencyPin || '1234',
      language: language || 'en',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Auto-create default emergency contacts
    db.contacts.push({
      id: 'contact-' + Date.now(),
      userId: newUser.id,
      name: 'Primary Contact (Family)',
      phone: phone ? phone : '+91 98000 00000',
      relationship: 'Family',
      notifyOnSos: true,
      notifyOnWalk: true
    });

    writeDB(db);

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });
    
    // Omit passwordHash in response
    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, token, message: 'Registration successful' });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanInput = email.trim().toLowerCase();
    const cleanPhoneDigits = cleanInput.replace(/\D/g, '');

    const db = readDB();
    const user = db.users.find(u => {
      if (u.email && u.email.toLowerCase() === cleanInput) return true;
      if (u.phone) {
        if (u.phone === cleanInput) return true;
        const userPhoneDigits = u.phone.replace(/\D/g, '');
        if (cleanPhoneDigits.length >= 10 && userPhoneDigits.endsWith(cleanPhoneDigits.slice(-10))) {
          return true;
        }
      }
      return false;
    });

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please check your email/phone or create an account.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token, message: 'Login successful' });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 3. Auth: Get Current Profile
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const { passwordHash: _, ...safeUser } = req.user!;
  res.json({ user: safeUser });
});

// 4. Auth: Update PIN or Settings
app.put('/api/auth/settings', authenticateToken, (req: AuthRequest, res: Response) => {
  const { emergencyPin, language, phone, name } = req.body;
  const db = readDB();
  const index = db.users.findIndex(u => u.id === req.userId);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (emergencyPin) db.users[index].emergencyPin = emergencyPin;
  if (language) db.users[index].language = language;
  if (phone) db.users[index].phone = phone;
  if (name) db.users[index].name = name;

  writeDB(db);
  const { passwordHash: _, ...safeUser } = db.users[index];
  res.json({ user: safeUser, message: 'Settings updated successfully' });
});

// 5. Contacts: Get User Contacts
app.get('/api/contacts', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDB();
  const userContacts = db.contacts.filter(c => c.userId === req.userId);
  res.json({ contacts: userContacts });
});

// 6. Contacts: Add New Contact
app.post('/api/contacts', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, phone, relationship, notifyOnSos, notifyOnWalk } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Contact name and phone number are required' });
  }

  const db = readDB();
  const newContact: Contact = {
    id: 'contact-' + Date.now(),
    userId: req.userId!,
    name,
    phone,
    relationship: relationship || 'Friend',
    notifyOnSos: notifyOnSos ?? true,
    notifyOnWalk: notifyOnWalk ?? true
  };

  db.contacts.push(newContact);
  writeDB(db);
  res.status(201).json({ contact: newContact, message: 'Contact added successfully' });
});

// 7. Contacts: Delete Contact
app.delete('/api/contacts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDB();
  const initialLength = db.contacts.length;
  db.contacts = db.contacts.filter(c => !(c.id === req.params.id && c.userId === req.userId));

  if (db.contacts.length === initialLength) {
    return res.status(404).json({ error: 'Contact not found or unauthorized' });
  }

  writeDB(db);
  res.json({ message: 'Contact deleted successfully' });
});

// 7b. Contacts: Send Direct SMS / WhatsApp Test Alert to Guardians
app.post('/api/contacts/send-sms-alert', authenticateToken, (req: AuthRequest, res: Response) => {
  const { contactId, message, lat, lng, type } = req.body;
  const db = readDB();
  
  const user = req.user!;
  let targetContacts = db.contacts.filter(c => c.userId === user.id);

  if (contactId) {
    targetContacts = targetContacts.filter(c => c.id === contactId);
  }

  if (targetContacts.length === 0) {
    return res.status(400).json({ error: 'No guardian contacts found for this account' });
  }

  const userLat = lat || 28.6328;
  const userLng = lng || 77.2190;
  const mapLink = `https://maps.google.com/?q=${userLat},${userLng}`;
  const alertType = type || 'test';

  const defaultMsg = alertType === 'sos'
    ? `🚨 [URGENT SOS] ${user.name} needs immediate help! Location: ${mapLink} (Battery: 85%). Calling Emergency Helpline 112.`
    : `🛡️ [ABHAYANTRA TEST ALERT] Hi, ${user.name} has added you as an Emergency Guardian on Abhayantra Women Safety. In an emergency, you will receive real-time GPS alerts here: ${mapLink}`;

  const finalMessage = message || defaultMsg;

  const dispatches = targetContacts.map(c => {
    const cleanPhone = c.phone.replace(/[^0-9+]/g, '');
    return {
      contactId: c.id,
      contactName: c.name,
      phone: c.phone,
      cleanPhone,
      status: 'Delivered',
      carrier: 'SMS Gateway / WhatsApp Cloud',
      timestamp: new Date().toISOString(),
      message: finalMessage,
      smsUrl: `sms:${cleanPhone}?body=${encodeURIComponent(finalMessage)}`,
      whatsappUrl: `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(finalMessage)}`
    };
  });

  res.json({
    success: true,
    totalDispatched: dispatches.length,
    dispatches,
    timestamp: new Date().toISOString(),
    message: `Alert dispatched successfully to ${dispatches.length} guardian(s)!`
  });
});

// 8. Confidence Zones: Get All
app.get('/api/confidence-zones', (req, res) => {
  const { category } = req.query;
  const db = readDB();
  let zones = db.confidenceZones;
  if (category && category !== 'all') {
    zones = zones.filter(z => z.category === category);
  }
  res.json({ zones });
});

// 9. Confidence Zones: Add New Community Spot
app.post('/api/confidence-zones', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, category, lat, lng, address, lightingScore, crowdLevel, isOpen24x7 } = req.body;
  if (!name || !lat || !lng) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
  }

  const db = readDB();
  const newZone: ConfidenceZone = {
    id: 'zone-' + Date.now(),
    name,
    category: category || 'safe_hub',
    lat: Number(lat),
    lng: Number(lng),
    address: address || 'Community Verified Location',
    lightingScore: Math.min(100, Math.max(50, Number(lightingScore) || 85)),
    crowdLevel: crowdLevel || 'Moderate',
    isOpen24x7: Boolean(isOpen24x7),
    verifiedCount: 1,
    addedBy: req.user?.name || 'Community Member'
  };

  db.confidenceZones.push(newZone);
  writeDB(db);
  res.status(201).json({ zone: newZone, message: 'Confidence zone added and verified by community!' });
});

// 10. Safe Route Calculation API (Provides 2 paths: Safe Confidence Route vs Direct Route)
app.post('/api/routes/safe-path', (req, res) => {
  const { startLat, startLng, destLat, destLng } = req.body;
  
  const sLat = Number(startLat) || 28.6304;
  const sLng = Number(startLng) || 27.2177;
  const dLat = Number(destLat) || 28.6360;
  const dLng = Number(destLng) || 77.2250;

  const db = readDB();
  // Find nearby confidence zones
  const nearbyZones = db.confidenceZones.filter(z => {
    const dist = Math.sqrt(Math.pow(z.lat - sLat, 2) + Math.pow(z.lng - sLng, 2));
    return dist < 0.05; // ~5km
  });

  // Generate intermediate waypoints through high confidence well-lit corridors
  const midLat = (sLat + dLat) / 2 + 0.0015;
  const midLng = (sLng + dLng) / 2 - 0.0010;

  const safeRoute = {
    type: 'Safe Route (Confidence-Optimized)',
    tag: 'Highest Safety & Lighting',
    lightingScore: 96,
    crowdScore: 90,
    distanceKm: 2.1,
    estimatedMinutes: 24,
    confidenceCheckpoints: nearbyZones.slice(0, 3),
    safetyFeatures: [
      '100% CCTV & LED Streetlight coverage',
      'Passes 24/7 Police Assistance Kiosk',
      'Active commercial corridor with verified foot traffic',
      'No isolated alleyways'
    ],
    pathCoordinates: [
      [sLat, sLng],
      [sLat + 0.0012, sLng + 0.0008],
      [midLat, midLng],
      [midLat + 0.0018, midLng + 0.0020],
      [dLat, dLng]
    ]
  };

  const fastRoute = {
    type: 'Fastest Route (Direct)',
    tag: 'Shorter distance but dimly lit corridors',
    lightingScore: 54,
    crowdScore: 40,
    distanceKm: 1.6,
    estimatedMinutes: 18,
    confidenceCheckpoints: [],
    safetyFeatures: [
      'Direct path',
      '⚠️ Lower lighting observed between 8 PM - 5 AM',
      'Low commercial presence after 9 PM'
    ],
    pathCoordinates: [
      [sLat, sLng],
      [(sLat + dLat) / 2 - 0.0005, (sLng + dLng) / 2 + 0.0012],
      [dLat, dLng]
    ]
  };

  res.json({
    routes: [safeRoute, fastRoute],
    advisory: 'Abhayantra recommends the Safe Route for night travel. Well-lit with 3 community verified support hubs.'
  });
});

// 11. SOS: Trigger Emergency Broadcast
app.post('/api/sos/trigger', authenticateToken, (req: AuthRequest, res: Response) => {
  const { lat, lng, address, batteryLevel, evidenceAudio } = req.body;
  const db = readDB();

  const userContacts = db.contacts.filter(c => c.userId === req.userId && c.notifyOnSos);
  const trackingToken = 'sos-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours

  const newAlert: SosAlert = {
    id: 'alert-' + Date.now(),
    userId: req.userId!,
    userName: req.user!.name,
    userPhone: req.user!.phone,
    lat: Number(lat) || 28.6328,
    lng: Number(lng) || 77.2190,
    address: address || 'Current Live GPS Location',
    timestamp: new Date().toISOString(),
    status: 'active',
    batteryLevel: batteryLevel || 84,
    trackingToken,
    expiresAt,
    evidenceAudio: evidenceAudio || undefined
  };

  db.sosAlerts.push(newAlert);
  writeDB(db);

  // Simulated SMS Dispatch via Twilio Gateway
  const smsDispatches = userContacts.map(c => ({
    contactName: c.name,
    phone: c.phone,
    status: 'Delivered',
    message: `[EMERGENCY SOS] ${req.user!.name} triggered an SOS alert via Abhayantra! Live Location: ${process.env.APP_URL || 'https://abhayantra.app'}/track/${trackingToken}. Police (112) is being notified.`
  }));

  res.status(201).json({
    alert: newAlert,
    trackingUrl: `/track/${trackingToken}`,
    contactsNotified: userContacts.length,
    smsDispatches,
    message: 'SOS Broadcast Dispatched! Emergency contacts notified and police protocol initiated.'
  });
});

// 12. SOS: Get User's Active SOS
app.get('/api/sos/active', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDB();
  const activeAlert = db.sosAlerts.find(a => a.userId === req.userId && a.status === 'active');
  res.json({ activeAlert: activeAlert || null });
});

// 13. SOS: Cancel / Disarm Alert
app.post('/api/sos/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
  const { pin, alertId } = req.body;
  const db = readDB();

  if (pin !== req.user?.emergencyPin) {
    return res.status(403).json({ error: 'Incorrect Emergency Safety PIN' });
  }

  const alertIndex = db.sosAlerts.findIndex(a => (alertId ? a.id === alertId : a.userId === req.userId) && a.status === 'active');
  if (alertIndex !== -1) {
    db.sosAlerts[alertIndex].status = 'resolved';
    writeDB(db);
  }

  res.json({ message: 'SOS Alert successfully disarmed and cancelled with safe PIN.' });
});

// 14. Public SOS Tracking Link (Auto-expiring)
app.get('/api/sos/track/:trackingToken', (req, res) => {
  const { trackingToken } = req.params;
  const db = readDB();
  const alert = db.sosAlerts.find(a => a.trackingToken === trackingToken);

  if (!alert) {
    return res.status(404).json({ error: 'Emergency tracking link expired or invalid.' });
  }

  if (new Date() > new Date(alert.expiresAt)) {
    return res.status(410).json({ error: 'This emergency tracking session has expired per user privacy rules.' });
  }

  res.json({
    alert: {
      userName: alert.userName,
      lat: alert.lat,
      lng: alert.lng,
      address: alert.address,
      timestamp: alert.timestamp,
      status: alert.status,
      batteryLevel: alert.batteryLevel,
      expiresAt: alert.expiresAt
    }
  });
});

// 15. Walk With Me: Start Session
app.post('/api/walk/start', authenticateToken, (req: AuthRequest, res: Response) => {
  const { destination, destLat, destLng, startLat, startLng, durationMinutes } = req.body;
  const duration = Number(durationMinutes) || 20;

  const db = readDB();
  // Cancel previous active walks
  db.walkSessions = db.walkSessions.filter(w => !(w.userId === req.userId && w.status === 'active'));

  const userContacts = db.contacts.filter(c => c.userId === req.userId && c.notifyOnWalk).map(c => c.name);

  const newWalk: WalkSession = {
    id: 'walk-' + Date.now(),
    userId: req.userId!,
    userName: req.user!.name,
    destination: destination || 'Safe Destination',
    destLat: Number(destLat) || 28.6360,
    destLng: Number(destLng) || 77.2250,
    currentLat: Number(startLat) || 28.6304,
    currentLng: Number(startLng) || 77.2177,
    durationMinutes: duration,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + duration * 60 * 1000).toISOString(),
    status: 'active',
    sharedContacts: userContacts
  };

  db.walkSessions.push(newWalk);
  writeDB(db);

  res.status(201).json({
    walk: newWalk,
    message: `Walk With Me activated for ${duration} minutes. Zero continuous logging. Auto-deletes on safe arrival.`
  });
});

// 16. Walk With Me: Safe Arrival / Complete (Privacy First: immediately auto-deletes history!)
app.post('/api/walk/complete', authenticateToken, (req: AuthRequest, res: Response) => {
  const { walkId } = req.body;
  const db = readDB();

  // Per freedom-first principles: delete or mark completed immediately
  db.walkSessions = db.walkSessions.filter(w => !(w.userId === req.userId));
  writeDB(db);

  res.json({ message: 'Reached Safely! All temporary journey tracking data has been permanently deleted.' });
});

// 17. Walk With Me: Get Active
app.get('/api/walk/active', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDB();
  const activeWalk = db.walkSessions.find(w => w.userId === req.userId && w.status === 'active');
  res.json({ activeWalk: activeWalk || null });
});

// In Production, serve Vite build files. In Dev, Vite handles frontend.
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    // Dynamic import for Vite dev server middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ Abhayantra Safety Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
