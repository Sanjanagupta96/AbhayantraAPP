import React, { useState } from 'react';
import { User, Lock, Mail, Phone, Shield, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { Translations, LanguageCode } from '../i18n';
import { User as UserType } from '../types';
import { api } from '../services/api';

interface Props {
  t: Translations;
  currentLang: LanguageCode;
  currentUser: UserType | null;
  onUserUpdate: (user: UserType | null) => void;
}

export const AuthModal: React.FC<Props> = ({ t, currentLang, currentUser, onUserUpdate }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [emergencyPin, setEmergencyPin] = useState<string>('1234');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (authMode === 'register') {
        const res = await api.register({
          name,
          email,
          phone,
          password,
          emergencyPin,
          language: currentLang
        });
        onUserUpdate(res.user);
        setSuccessMsg('Account registered successfully with database persistence!');
      } else {
        const res = await api.login({ email, password });
        onUserUpdate(res.user);
        setSuccessMsg('Logged in successfully!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    }
  };

  const handleUpdatePin = async () => {
    if (!newPinInput || newPinInput.length < 4) {
      setErrorMsg('PIN must be at least 4 digits');
      return;
    }
    try {
      const updated = await api.updateSettings({ emergencyPin: newPinInput });
      onUserUpdate(updated);
      setNewPinInput('');
      setSuccessMsg('Emergency Safety PIN updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update PIN');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('abhayantra_token');
    onUserUpdate(null);
  };

  return (
    <div id="profile-auth-section" className="flex flex-col gap-4 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>{t.profileTitle}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your account credentials and personal safety PIN.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {currentUser ? (
        /* LOGGED IN PROFILE CARD */
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{currentUser.name}</h3>
                <span className="text-xs text-slate-400 font-mono block">{currentUser.email}</span>
                {currentUser.phone && (
                  <span className="text-[11px] text-emerald-400 font-mono">{currentUser.phone}</span>
                )}
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* EMERGENCY PIN CONFIGURATION */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{t.emergencyPinLabel}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-xl text-rose-400 border border-slate-800">
                Current: {currentUser.emergencyPin || '1234'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              This PIN is required to disarm or cancel active SOS alerts so nobody can force you to stop an alert without your consent.
            </p>

            <div className="flex gap-2">
              <input
                id="update-pin-input"
                type="password"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="New 4-digit PIN"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                id="save-new-pin-btn"
                onClick={handleUpdatePin}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                {t.updatePin}
              </button>
            </div>
          </div>

          {/* FREEDOM AUDIT ASSURANCE */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-800/40 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>{t.privacyAuditTitle}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{t.privacyAuditZeroTracking}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{t.privacyAuditOptInOnly}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LOGIN / REGISTER FORM */
        <form onSubmit={handleAuthSubmit} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-3 shadow-xl">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-1">
            <button
              type="button"
              id="switch-to-login-tab-btn"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              {t.login}
            </button>
            <button
              type="button"
              id="switch-to-register-tab-btn"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              {t.register}
            </button>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300">{t.fullName}</label>
              <input
                id="auth-register-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300">{t.email}</label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300">{t.phone}</label>
              <input
                id="auth-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300">{t.password}</label>
            <input
              id="auth-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300">Safety PIN (to disarm SOS)</label>
              <input
                id="auth-pin-input"
                type="password"
                maxLength={6}
                value={emergencyPin}
                onChange={(e) => setEmergencyPin(e.target.value)}
                placeholder="1234"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          <button
            id="submit-auth-form-btn"
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/60 transition-all mt-2"
          >
            {authMode === 'login' ? t.login : t.register}
          </button>
        </form>
      )}
    </div>
  );
};
