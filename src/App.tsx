import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Map, 
  Sparkles, 
  Users, 
  User as UserIcon, 
  Radio, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  Monitor,
  PhoneCall,
  Lock,
  LogOut,
  ChevronRight,
  Battery,
  Wifi,
  Signal,
  KeyRound
} from 'lucide-react';
import { LanguageCode, User as UserType, Contact } from './types';
import { translations } from './i18n';
import { api } from './services/api';
import { PhoneFrame } from './components/PhoneFrame';
import { LanguageSelector } from './components/LanguageSelector';
import { SosSection } from './components/SosSection';
import { SafeMapView } from './components/SafeMapView';
import { DiscreetHub } from './components/DiscreetHub';
import { ContactsManager } from './components/ContactsManager';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';

export default function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<'sos' | 'map' | 'discreet' | 'contacts' | 'profile'>('sos');
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = translations[currentLang] || translations.en;

  // Initial Auth Check (Verify existing token or present Authentication Gateway)
  useEffect(() => {
    async function checkAuthSession() {
      const savedToken = localStorage.getItem('abhayantra_token');
      if (savedToken) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
          if (user.language && translations[user.language as LanguageCode]) {
            setCurrentLang(user.language as LanguageCode);
          }
          await loadContacts();
        } catch (err) {
          // Token expired or invalid
          localStorage.removeItem('abhayantra_token');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    }
    checkAuthSession();
  }, []);

  const loadContacts = async () => {
    try {
      const list = await api.getContacts();
      setContacts(list);
    } catch {
      // Fallback
    }
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLang(lang);
    if (currentUser) {
      api.updateSettings({ language: lang }).catch(() => {});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('abhayantra_token');
    setCurrentUser(null);
    setActiveTab('sos');
  };

  // 1. Loading Splash Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-950" />
          </div>
        </div>
        <h2 className="mt-4 text-base font-extrabold tracking-widest text-slate-200 uppercase">Abhayantra</h2>
        <p className="text-xs text-slate-500 mt-1">Initializing Secure Safety Protocols...</p>
      </div>
    );
  }

  // 2. Authentication Gate: If not authenticated, require Sign In / Sign Up
  if (!currentUser) {
    return (
      <AuthGateway
        t={t}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          loadContacts();
        }}
      />
    );
  }

  // 3. Authenticated Application: Render Web or Phone Mode
  // If in Desktop / Web Dashboard mode:
  if (!isPhoneMode) {
    return (
      <PhoneFrame isPhoneMode={isPhoneMode} onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          
          {/* DESKTOP TOP NAVIGATION BAR */}
          <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 px-6 py-3.5 shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              
              {/* Left: Branding & Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-rose-950/50">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-black tracking-wider text-slate-100 font-sans">
                        {t.appName}
                      </h1>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        WEB PORTAL
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {t.tagline}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Protected Mode</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span>PIN: ****</span>
                  </div>
                </div>
              </div>

              {/* Center: Desktop Navigation Tabs */}
              <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
                <button
                  id="web-nav-tab-sos"
                  onClick={() => setActiveTab('sos')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'sos'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t.tabSos}</span>
                </button>

                <button
                  id="web-nav-tab-map"
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'map'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>{t.tabMap}</span>
                </button>

                <button
                  id="web-nav-tab-discreet"
                  onClick={() => setActiveTab('discreet')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'discreet'
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.tabDiscreet}</span>
                </button>

                <button
                  id="web-nav-tab-contacts"
                  onClick={() => setActiveTab('contacts')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'contacts'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{t.tabContacts} ({contacts.length})</span>
                </button>

                <button
                  id="web-nav-tab-profile"
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-slate-800 text-slate-100 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t.tabProfile}</span>
                </button>
              </nav>

              {/* Right: Quick Emergency Call, Language & Logout */}
              <div className="flex items-center gap-3">
                <a
                  id="desktop-emergency-112-btn"
                  href="tel:112"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/40 text-rose-200 text-xs font-bold transition-colors"
                  title="Call National Emergency 112"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Call 112</span>
                </a>

                {/* Language Selector */}
                <div className="max-w-[200px]">
                  <LanguageSelector currentLang={currentLang} onSelectLang={handleLanguageChange} />
                </div>

                {/* Profile & Logout */}
                <button
                  id="desktop-logout-btn"
                  onClick={handleLogout}
                  title="Log out of session"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-700/50 text-xs font-medium transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>

            </div>

            {/* Mobile Tab Fallback for small screens in Web View */}
            <div className="md:hidden flex items-center justify-around pt-3 mt-3 border-t border-slate-900">
              <button
                onClick={() => setActiveTab('sos')}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'sos' ? 'text-rose-400 bg-slate-900' : 'text-slate-400'}`}
              >
                {t.tabSos}
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'map' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
              >
                {t.tabMap}
              </button>
              <button
                onClick={() => setActiveTab('discreet')}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'discreet' ? 'text-teal-400 bg-slate-900' : 'text-slate-400'}`}
              >
                {t.tabDiscreet}
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'contacts' ? 'text-indigo-400 bg-slate-900' : 'text-slate-400'}`}
              >
                {t.tabContacts}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'profile' ? 'text-slate-100 bg-slate-900' : 'text-slate-400'}`}
              >
                {t.tabProfile}
              </button>
            </div>
          </header>

          {/* DESKTOP BODY VIEWPORT */}
          <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col">
            {activeTab === 'sos' && (
              <SosSection
                t={t}
                currentLang={currentLang}
                currentUser={currentUser}
                contacts={contacts}
                onOpenMap={() => setActiveTab('map')}
              />
            )}

            {activeTab === 'map' && (
              <SafeMapView t={t} currentLang={currentLang} />
            )}

            {activeTab === 'discreet' && (
              <DiscreetHub t={t} contacts={contacts} />
            )}

            {activeTab === 'contacts' && (
              <ContactsManager
                t={t}
                contacts={contacts}
                currentUser={currentUser}
                onRefreshContacts={loadContacts}
              />
            )}

            {activeTab === 'profile' && (
              <AuthModal
                t={t}
                currentLang={currentLang}
                currentUser={currentUser}
                onUserUpdate={(user) => {
                  setCurrentUser(user);
                  loadContacts();
                }}
              />
            )}
          </main>
        </div>
      </PhoneFrame>
    );
  }

  // 4. Smartphone Preview Mode
  return (
    <PhoneFrame isPhoneMode={isPhoneMode} onTogglePhoneMode={() => setIsPhoneMode(!isPhoneMode)}>
      <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-full relative select-none">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-4 py-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-950/50">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wider text-slate-100 font-sans flex items-center gap-1.5">
                  <span>{t.appName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    2.0
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* User Avatar / Profile Quick Link */}
            <button
              id="header-profile-btn"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
          </div>

          {/* Multilingual Selector Bar */}
          <LanguageSelector currentLang={currentLang} onSelectLang={handleLanguageChange} />
        </header>

        {/* MAIN BODY VIEWPORT */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'sos' && (
            <SosSection
              t={t}
              currentLang={currentLang}
              currentUser={currentUser}
              contacts={contacts}
              onOpenMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'map' && (
            <SafeMapView t={t} currentLang={currentLang} />
          )}

          {activeTab === 'discreet' && (
            <DiscreetHub t={t} contacts={contacts} />
          )}

          {activeTab === 'contacts' && (
            <ContactsManager
              t={t}
              contacts={contacts}
              currentUser={currentUser}
              onRefreshContacts={loadContacts}
            />
          )}

          {activeTab === 'profile' && (
            <AuthModal
              t={t}
              currentLang={currentLang}
              currentUser={currentUser}
              onUserUpdate={(user) => {
                setCurrentUser(user);
                loadContacts();
              }}
            />
          )}
        </main>

        {/* BOTTOM MOBILE NAVIGATION BAR */}
        <nav
          id="bottom-navigation-bar"
          className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl"
        >
          {/* Tab 1: SOS */}
          <button
            id="nav-tab-sos"
            onClick={() => setActiveTab('sos')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'sos'
                ? 'text-rose-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'sos' ? 'bg-rose-500/20 shadow-sm shadow-rose-500/30' : ''}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">{t.tabSos}</span>
          </button>

          {/* Tab 2: Safe Map */}
          <button
            id="nav-tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'map'
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'map' ? 'bg-emerald-500/20 shadow-sm shadow-emerald-500/30' : ''}`}>
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">{t.tabMap}</span>
          </button>

          {/* Tab 3: Discreet Tools */}
          <button
            id="nav-tab-discreet"
            onClick={() => setActiveTab('discreet')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'discreet'
                ? 'text-teal-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'discreet' ? 'bg-teal-500/20 shadow-sm shadow-teal-500/30' : ''}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">{t.tabDiscreet}</span>
          </button>

          {/* Tab 4: Guardians */}
          <button
            id="nav-tab-contacts"
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'contacts'
                ? 'text-indigo-400 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'contacts' ? 'bg-indigo-500/20 shadow-sm shadow-indigo-500/30' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">{t.tabContacts}</span>
          </button>

          {/* Tab 5: Profile */}
          <button
            id="nav-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'profile'
                ? 'text-slate-100 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'profile' ? 'bg-slate-800 shadow-sm' : ''}`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">{t.tabProfile}</span>
          </button>
        </nav>
      </div>
    </PhoneFrame>
  );
}
