import { User, Contact, ConfidenceZone, SafeRoute, SosAlert, WalkSession } from '../types';

const API_BASE = '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('abhayantra_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; phone?: string; password: string; emergencyPin?: string; language?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to register');
    return result;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to login');
    localStorage.setItem('abhayantra_token', result.token);
    return result;
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch user');
    return result.user;
  },

  async updateSettings(data: { emergencyPin?: string; language?: string; phone?: string; name?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/settings`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update settings');
    return result.user;
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const res = await fetch(`${API_BASE}/contacts`, {
      headers: getAuthHeader()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load contacts');
    return result.contacts || [];
  },

  async addContact(data: { name: string; phone: string; relationship?: string; notifyOnSos?: boolean; notifyOnWalk?: boolean }): Promise<Contact> {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add contact');
    return result.contact;
  },

  async deleteContact(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Failed to delete contact');
    }
  },

  async sendGuardianAlert(data: { contactId?: string; message?: string; lat?: number; lng?: number; type?: 'sos' | 'test' | 'walk' }): Promise<any> {
    const res = await fetch(`${API_BASE}/contacts/send-sms-alert`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send guardian alert');
    return result;
  },

  // Confidence Zones
  async getConfidenceZones(category?: string): Promise<ConfidenceZone[]> {
    const url = category && category !== 'all' ? `${API_BASE}/confidence-zones?category=${category}` : `${API_BASE}/confidence-zones`;
    const res = await fetch(url);
    const result = await res.json();
    return result.zones || [];
  },

  async addConfidenceZone(data: Partial<ConfidenceZone>): Promise<ConfidenceZone> {
    const res = await fetch(`${API_BASE}/confidence-zones`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add safe spot');
    return result.zone;
  },

  // Safe Route Planner
  async calculateSafeRoute(params: { startLat: number; startLng: number; destLat?: number; destLng?: number }): Promise<{ routes: SafeRoute[]; advisory: string }> {
    const res = await fetch(`${API_BASE}/routes/safe-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const result = await res.json();
    return result;
  },

  // SOS Emergency
  async triggerSos(data: { lat: number; lng: number; address?: string; batteryLevel?: number; evidenceAudio?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/sos/trigger`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to trigger SOS');
    return result;
  },

  async cancelSos(pin: string, alertId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sos/cancel`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ pin, alertId })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to cancel SOS');
    return result;
  },

  async getActiveSos(): Promise<SosAlert | null> {
    try {
      const res = await fetch(`${API_BASE}/sos/active`, {
        headers: getAuthHeader()
      });
      if (!res.ok) return null;
      const result = await res.json();
      return result.activeAlert;
    } catch {
      return null;
    }
  },

  // Walk With Me
  async startWalk(data: { destination: string; destLat?: number; destLng?: number; startLat: number; startLng: number; durationMinutes: number }): Promise<WalkSession> {
    const res = await fetch(`${API_BASE}/walk/start`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to start Walk With Me');
    return result.walk;
  },

  async completeWalk(): Promise<void> {
    const res = await fetch(`${API_BASE}/walk/complete`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Failed to complete walk');
    }
  },

  async getActiveWalk(): Promise<WalkSession | null> {
    try {
      const res = await fetch(`${API_BASE}/walk/active`, {
        headers: getAuthHeader()
      });
      if (!res.ok) return null;
      const result = await res.json();
      return result.activeWalk;
    } catch {
      return null;
    }
  }
};
