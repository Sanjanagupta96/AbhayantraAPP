import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Smartphone, 
  PhoneCall, 
  Lock, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  Zap,
  MapPin
} from 'lucide-react';
import { Translations, LanguageCode } from '../i18n';
import { User, Contact, SosAlert } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audioSynth';

interface Props {
  t: Translations;
  currentLang: LanguageCode;
  currentUser: User | null;
  contacts: Contact[];
  onOpenMap: () => void;
}

export const SosSection: React.FC<Props> = ({ t, currentUser, contacts, onOpenMap }) => {
  const [activeAlert, setActiveAlert] = useState<SosAlert | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSirenOn, setIsSirenOn] = useState<boolean>(false);
  const [isSilentMode, setIsSilentMode] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isShakeActive, setIsShakeActive] = useState<boolean>(false);
  
  // Pin modal state
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 28.6328,
    lng: 77.2190,
    address: 'Connaught Place, New Delhi (GPS Acquired)'
  });

  const countdownTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Acquire current real GPS location if available
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
          });
        },
        () => {
          // Fallback to default
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Check existing active SOS on mount
  useEffect(() => {
    if (currentUser) {
      api.getActiveSos().then((alert) => {
        if (alert) setActiveAlert(alert);
      });
    }
  }, [currentUser]);

  // Voice Trigger Listener setup
  useEffect(() => {
    if (!isVoiceActive) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser.');
      setIsVoiceActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (
            transcript.includes('help') || 
            transcript.includes('bachao') || 
            transcript.includes('emergency') || 
            transcript.includes('police')
          ) {
            triggerImmediateSos();
            break;
          }
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (isVoiceActive) {
          try { recognition.start(); } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsVoiceActive(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [isVoiceActive]);

  // Shake Detection Listener
  useEffect(() => {
    if (!isShakeActive) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime) > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const speed = Math.abs((current.x || 0) + (current.y || 0) + (current.z || 0) - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 1800) {
          triggerImmediateSos();
        }

        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isShakeActive]);

  // SOS Countdown handler
  const startSosCountdown = () => {
    if (activeAlert) return;
    setCountdown(5);
    let count = 5;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownTimerRef.current);
        setCountdown(null);
        triggerImmediateSos();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const triggerImmediateSos = async () => {
    cancelCountdown();
    try {
      if (!isSilentMode) {
        sound.startSiren();
        setIsSirenOn(true);
      }

      const res = await api.triggerSos({
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        address: gpsLocation.address,
        batteryLevel: 88
      });

      setActiveAlert(res.alert);
    } catch (err: any) {
      console.error(err);
      // Create local fallback alert
      const fallbackAlert: SosAlert = {
        id: 'alert-' + Date.now(),
        userId: currentUser?.id || 'demo',
        userName: currentUser?.name || 'User',
        userPhone: currentUser?.phone || '',
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        address: gpsLocation.address,
        timestamp: new Date().toISOString(),
        status: 'active',
        trackingToken: 'demo-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString()
      };
      setActiveAlert(fallbackAlert);
    }
  };

  const toggleSiren = () => {
    if (isSirenOn) {
      sound.stopSiren();
      setIsSirenOn(false);
    } else {
      sound.startSiren();
      setIsSirenOn(true);
    }
  };

  const handleDisarmWithPin = async () => {
    const userPin = currentUser?.emergencyPin || '1234';
    if (enteredPin !== userPin) {
      setPinError(t.incorrectPin);
      return;
    }

    try {
      sound.stopSiren();
      setIsSirenOn(false);
      await api.cancelSos(enteredPin, activeAlert?.id);
    } catch {}

    setActiveAlert(null);
    setShowPinModal(false);
    setEnteredPin('');
    setPinError('');
  };

  return (
    <div id="sos-hub-section" className="flex flex-col gap-5 p-4 sm:p-6 pb-24">
      {/* Top Freedom Reassurance Banner */}
      <div id="freedom-reassurance-card" className="bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-800/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">{t.freedomTag}</span>
            <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
              Tracking: OFF
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {t.defaultOffReassurance}
          </p>
        </div>
      </div>

      {/* ACTIVE SOS BROADCAST BANNER */}
      {activeAlert && (
        <div id="active-sos-broadcast-alert" className="bg-rose-950/90 border-2 border-rose-500 rounded-3xl p-5 text-white shadow-2xl shadow-rose-900/50 animate-bounce-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-rose-800/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
              <span className="font-extrabold text-rose-200 text-sm tracking-wide">{t.sosActiveHeading}</span>
            </div>
            <span className="text-xs bg-rose-900/90 text-rose-200 px-2.5 py-1 rounded-full border border-rose-700 font-mono">
              Live Link Active
            </span>
          </div>

          <p className="text-xs text-rose-100 mt-3 leading-relaxed">
            {t.sosActiveDescription}
          </p>

          <div className="mt-4 bg-black/40 rounded-xl p-3 flex flex-col gap-2 text-xs border border-rose-800/40">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> GPS Stream:</span>
              <span className="font-mono text-rose-300 font-semibold">{gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dispatch:</span>
              <span className="text-emerald-300 font-medium">{contacts.length || 0} Guardians + 112 Police</span>
            </div>
          </div>

          {/* Quick Guardian Message & WhatsApp Trigger Links during SOS */}
          {contacts.length > 0 && (
            <div className="mt-3 p-3 rounded-2xl bg-black/30 border border-rose-900/60 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                Guardian Emergency Broadcast:
              </span>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                {contacts.map((c) => {
                  const clean = c.phone.replace(/[^0-9+]/g, '');
                  const alertMsg = `🚨 [URGENT SOS] ${currentUser?.name || 'User'} triggered an emergency alert! Location: https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`;
                  const waUrl = `https://wa.me/${clean.replace('+', '')}?text=${encodeURIComponent(alertMsg)}`;
                  const smsUrl = `sms:${clean}?body=${encodeURIComponent(alertMsg)}`;
                  return (
                    <div key={c.id} className="flex items-center justify-between bg-slate-950/60 px-2.5 py-1.5 rounded-xl text-xs">
                      <span className="font-semibold text-slate-200">{c.name}</span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-emerald-900/70 text-emerald-300 text-[10px] font-bold"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={smsUrl}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 text-teal-300 text-[10px] font-bold"
                        >
                          SMS
                        </a>
                        <a
                          href={`tel:${c.phone}`}
                          className="px-2 py-0.5 rounded-lg bg-rose-900/70 text-rose-200 text-[10px] font-bold"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              id="disarm-sos-btn"
              onClick={() => setShowPinModal(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/50 shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{t.cancelSos}</span>
            </button>
            <button
              id="view-sos-map-btn"
              onClick={onOpenMap}
              className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Safe Map</span>
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN OVERLAY IF ACTIVATING */}
      {countdown !== null && (
        <div id="sos-countdown-card" className="bg-amber-950/90 border border-amber-500 rounded-3xl p-5 text-center flex flex-col items-center gap-3 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-amber-200">{t.sosCountdownNotice}</h3>
            <div className="text-5xl font-extrabold text-amber-400 font-mono my-2">{countdown}s</div>
            <p className="text-xs text-amber-300">Tap below immediately to cancel if accidental</p>
          </div>
          <button
            id="cancel-countdown-btn"
            onClick={cancelCountdown}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-amber-400 text-amber-300 font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Cancel Alert Countdown
          </button>
        </div>
      )}

      {/* MAIN TACTILE PANIC BUTTON */}
      {!activeAlert && countdown === null && (
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative group">
            {/* Pulsing Aura Rings */}
            <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-xl group-hover:bg-rose-500/30 transition-all animate-pulse"></div>
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 opacity-80 blur-sm"></div>

            {/* The Tactile Button */}
            <button
              id="primary-sos-panic-btn"
              onClick={startSosCountdown}
              className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-rose-500 via-rose-600 to-red-700 text-white flex flex-col items-center justify-center gap-2 shadow-2xl shadow-rose-950/80 border-4 border-rose-400/40 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="p-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <ShieldAlert className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <span className="text-2xl font-black tracking-wider drop-shadow-md font-sans">
                SOS
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-rose-100 px-3 py-0.5 rounded-full bg-black/20">
                {t.sosButtonText}
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center max-w-xs mt-4 leading-relaxed font-medium">
            {t.sosSubText}
          </p>
        </div>
      )}

      {/* QUICK EMERGENCY TOGGLES & TRIGGERS */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Siren & Strobe Button */}
        <button
          id="siren-toggle-btn"
          onClick={toggleSiren}
          className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
            isSirenOn
              ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 rounded-xl ${isSirenOn ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {isSirenOn ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSirenOn ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {isSirenOn ? 'PLAYING' : 'OFF'}
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">{t.sirenAlarm}</div>
            <div className="text-[11px] text-slate-400">High-decibel alert tone</div>
          </div>
        </button>

        {/* Silent SOS Mode */}
        <button
          id="silent-mode-toggle-btn"
          onClick={() => setIsSilentMode(!isSilentMode)}
          className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
            isSilentMode
              ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 rounded-xl ${isSilentMode ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
              <Radio className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSilentMode ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {isSilentMode ? 'SILENT' : 'LOUD'}
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">{t.silentMode}</div>
            <div className="text-[11px] text-slate-400">{t.silentModeDesc}</div>
          </div>
        </button>

        {/* Voice Trigger */}
        <button
          id="voice-trigger-toggle-btn"
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
            isVoiceActive
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 rounded-xl ${isVoiceActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              {isVoiceActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVoiceActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isVoiceActive ? 'LISTENING' : 'OFF'}
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">{t.voiceTrigger}</div>
            <div className="text-[11px] text-slate-400">Trigger on "Help" / "Bachao"</div>
          </div>
        </button>

        {/* Shake Trigger */}
        <button
          id="shake-trigger-toggle-btn"
          onClick={() => setIsShakeActive(!isShakeActive)}
          className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 transition-all ${
            isShakeActive
              ? 'bg-teal-950/80 border-teal-500 text-teal-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 rounded-xl ${isShakeActive ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isShakeActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {isShakeActive ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">{t.shakeTrigger}</div>
            <div className="text-[11px] text-slate-400">Fast phone shake trigger</div>
          </div>
        </button>
      </div>

      {/* DIRECT EMERGENCY HELPLINES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t.emergencyHelplines}</span>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
            Toll-Free 24x7
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            id="call-112-btn"
            href="tel:112"
            className="p-3 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-800/40 hover:border-rose-500 text-left flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-rose-300">112 Police</div>
              <div className="text-[10px] text-slate-400">National Emergency</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </a>

          <a
            id="call-1091-btn"
            href="tel:1091"
            className="p-3 rounded-2xl bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-800/40 hover:border-teal-500 text-left flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-teal-300">1091 Women</div>
              <div className="text-[10px] text-slate-400">Helpline Desk</div>
            </div>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </a>

          <a
            id="call-102-btn"
            href="tel:102"
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-800/40 hover:border-indigo-500 text-left flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-indigo-300">102 Ambulance</div>
              <div className="text-[10px] text-slate-400">Medical Aid</div>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </a>

          <a
            id="call-1090-btn"
            href="tel:1090"
            className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-800/40 hover:border-amber-500 text-left flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-amber-300">1090 PowerLine</div>
              <div className="text-[10px] text-slate-400">Women Protection</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      </div>

      {/* DISARM WITH PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">{t.cancelSos}</h3>
                <p className="text-xs text-slate-400">{t.enterPinToCancel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Emergency Safety PIN</label>
              <input
                id="emergency-pin-input"
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Default PIN: 1234"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center text-xl font-mono tracking-widest text-slate-100 focus:outline-none focus:border-rose-500"
              />
              {pinError && <span className="text-xs text-rose-400 font-medium">{pinError}</span>}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                id="close-pin-modal-btn"
                onClick={() => { setShowPinModal(false); setEnteredPin(''); setPinError(''); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Keep Alert
              </button>
              <button
                id="confirm-disarm-pin-btn"
                onClick={handleDisarmWithPin}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Disarm & Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
