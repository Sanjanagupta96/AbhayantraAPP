export type LanguageCode = 'en' | 'hi' | 'hinglish' | 'bn' | 'ta' | 'te' | 'mr' | 'kn';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyPin: string;
  language: LanguageCode;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  notifyOnSos: boolean;
  notifyOnWalk: boolean;
}

export interface ConfidenceZone {
  id: string;
  name: string;
  category: 'police' | 'pharmacy' | 'cafe' | 'transit' | 'safe_hub';
  lat: number;
  lng: number;
  address: string;
  lightingScore: number;
  crowdLevel: 'High' | 'Moderate' | 'Low';
  isOpen24x7: boolean;
  verifiedCount: number;
  addedBy: string;
}

export interface SafeRoute {
  type: string;
  tag: string;
  lightingScore: number;
  crowdScore: number;
  distanceKm: number;
  estimatedMinutes: number;
  confidenceCheckpoints: ConfidenceZone[];
  safetyFeatures: string[];
  pathCoordinates: [number, number][];
}

export interface SosAlert {
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

export interface WalkSession {
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
