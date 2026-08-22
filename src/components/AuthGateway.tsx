import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Radio,
  ArrowRight,
  Zap,
  PhoneCall,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { Translations, LanguageCode } from '../i18n';
import { User as UserType } from '../types';
import { api } from '../services/api';
import { LanguageSelector } from './LanguageSelector';

interface Props {
  t: Translations;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onAuthenticated: (user: UserType) => void;
}

export const AuthGateway: React.FC<Props> = ({ 
  t, 
  currentLang, 
  onLanguageChange, 
  onAuthenticated 
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('+91 ');
  const [emergencyPin, setEmergencyPin] = useState<string>('1234');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        if (!emergencyPin || emergencyPin.length < 4) throw new Error('Emergency PIN must be 4 digits');

        await api.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          emergencyPin,
          language: currentLang
        });

        // Prompt user to log in now with their credentials
        setSuccessMsg(`🎉 Account registered successfully for ${name.trim()}! Please sign in with your password to open the app.`);
        setAuthMode('login');
        setPassword('');
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email/mobile and password');
        const res = await api.login({ 
          email: email.trim(), 
          password 
        });
        setSuccessMsg(`✓ Login successful! Welcome back, ${res.user.name}. Opening safety portal...`);
        setTimeout(() => {
          onAuthenticated(res.user);
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      try {
        const res = await api.login({ email: 'priya@example.com', password: 'priya123' });
        onAuthenticated(res.user);
      } catch {
        // If not existing yet, create demo
        const res = await api.register({
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 98765 43210',
          password: 'priya123',
          emergencyPin: '1234',
          language: currentLang
        });
        onAuthenticated(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize demo session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-rose-950/60 ring-1 ring-rose-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-slate-100 font-sans">
                ABHAYANTRA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Freedom-First Safety & Emergency Network
            </p>
          </div>
        </div>

        {/* Language selector in header */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Language:</span>
          </div>
          <div className="max-w-[260px]">
            <LanguageSelector currentLang={currentLang} onSelectLang={onLanguageChange} />
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Value Proposition & Security Guarantees */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-300 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authentication Protected • Sign In Required</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                Your Personal Security, <br />
                <span className="bg-gradient-to-r from-rose-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Strictly On Your Terms.
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Abhayantra is designed around empowerment, not surveillance. No continuous background tracking. Everything is on-demand, private, and encrypted.
              </p>
            </div>

            {/* Core Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-200">One-Tap SOS & Siren</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instant dual-tone siren, Police 112 trigger & auto-calling.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-200">Safe Map & Safe Spots</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Street lighting scores, 24/7 pharmacies, cafes & police hubs.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-200">Discreet Escape Tools</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Realistic incoming fake calls, walk timer & silent audio recorder.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-200">Guardian SMS Alerts</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct SMS & WhatsApp broadcast with real-time GPS link.</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Login CTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Want to test instantly?</div>
                  <div className="text-[11px] text-slate-400">Pre-configured with demo guardians & Delhi safe spots</div>
                </div>
              </div>
              <button
                id="quick-demo-login-btn"
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <span>Demo Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              
              {/* Card Header & Tab Switcher */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-100">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Safety Account'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authMode === 'login' ? 'Sign in to access emergency tools' : 'Set up your encrypted safety credentials'}
                  </p>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    id="switch-to-login-tab"
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      authMode === 'login'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    id="switch-to-register-tab"
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      authMode === 'register'
                        ? 'bg-slate-800 text-rose-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Status Notifications */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {authMode === 'login' ? 'Email Address or Mobile Number' : 'Email Address'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-email-input"
                      type={authMode === 'login' ? 'text' : 'email'}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={authMode === 'login' ? 'name@example.com or +91 98765 43210' : 'name@example.com'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Mobile Phone (for SOS SMS identification)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-phone-input"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                        <span>Emergency Disarm PIN</span>
                      </label>
                      <span className="text-[10px] text-rose-400 font-mono font-bold">Required to Cancel SOS</span>
                    </div>
                    <input
                      id="auth-pin-input"
                      type="password"
                      maxLength={4}
                      required
                      value={emergencyPin}
                      onChange={(e) => setEmergencyPin(e.target.value)}
                      placeholder="4-digit PIN (e.g. 1234)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono text-base tracking-widest text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      When SOS is triggered, attackers cannot stop it without this 4-digit safety PIN.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                    authMode === 'login'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Sign In & Access Safety App' : 'Complete Setup & Enter Vault'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sample test credentials note */}
              {authMode === 'login' && (
                <div className="mt-4 pt-4 border-t border-slate-800 text-center flex flex-col items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">
                    Quick Fill Test Credentials:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('priya@example.com');
                      setPassword('priya123');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>priya@example.com</span>
                    <span className="text-slate-600">•</span>
                    <span>priya123</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60 font-sans">
                      Click to fill
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Abhayantra Women Safety Protocol. No background tracking without user consent.</span>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Encrypted Local Vault</span>
          <span>•</span>
          <span>Police 112 Interop</span>
          <span>•</span>
          <span>Web & Mobile Ready</span>
        </div>
      </footer>
    </div>
  );
};
