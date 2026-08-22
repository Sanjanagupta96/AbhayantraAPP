import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneIncoming, User, Clock, Shield } from 'lucide-react';
import { Translations } from '../i18n';
import { sound } from '../utils/audioSynth';

interface Props {
  t: Translations;
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<Props> = ({ t, isOpen, onClose }) => {
  const [callerName, setCallerName] = useState<string>('Mom (Urgent)');
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [connectedTimer, setConnectedTimer] = useState<number>(0);
  
  const timerRef = useRef<any>(null);
  const ringRef = useRef<any>(null);

  const callerVoices: Record<string, string> = {
    'Mom (Urgent)': 'Hello beta, where are you right now? Papa is waiting right outside with the car. Please come out quickly, we are right around the corner.',
    'Office Manager': 'Hi, I need you on this emergency conference bridge immediately. Can you excuse yourself and join right now?',
    'Cab Driver': 'Madam ji, I have arrived at your location in the white sedan. Hazard lights are blinking right in front of the gate.',
    'Security Officer': 'Namaste, this is campus safety desk. Are you reaching the gate or do you need assistance from the escort officer?'
  };

  useEffect(() => {
    if (!isOpen) {
      handleEndCall();
    }
  }, [isOpen]);

  // Handle call timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setConnectedTimer((prev) => prev + 1);
      }, 1000);

      // Play synthesized voice speech
      const dialogue = callerVoices[callerName] || callerVoices['Mom (Urgent)'];
      sound.speakDialogue(dialogue);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const handleStartCall = () => {
    if (delaySeconds > 0) {
      setTimeout(() => {
        setCallState('ringing');
        sound.startRingtone();
      }, delaySeconds * 1000);
      onClose(); // Hide setup dialog while waiting for delayed trigger
    } else {
      setCallState('ringing');
      sound.startRingtone();
    }
  };

  const handleAcceptCall = () => {
    sound.stopRingtone();
    setCallState('connected');
    setConnectedTimer(0);
  };

  const handleEndCall = () => {
    sound.stopRingtone();
    sound.stopSpeech();
    setCallState('idle');
    setConnectedTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!isOpen && callState === 'idle') return null;

  // RINGING SCREEN (Realistic Smartphone incoming call UI)
  if (callState === 'ringing') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-8 text-white select-none animate-fadeIn">
        <div className="flex flex-col items-center gap-3 mt-12">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl shadow-2xl">
            <User className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">{callerName}</h2>
          <span className="text-xs text-slate-400 font-mono tracking-wider">Mobile +91 98XXX XXXXX</span>
          <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 animate-pulse mt-2">
            Incoming Call...
          </span>
        </div>

        {/* Swipe / Action Buttons */}
        <div className="w-full max-w-xs flex items-center justify-between mb-10 px-4">
          <button
            id="decline-fake-call-btn"
            onClick={handleEndCall}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-500 flex items-center justify-center shadow-xl shadow-rose-950/60 transition-transform active:scale-95">
              <PhoneOff className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-slate-300 font-medium">{t.declineCall}</span>
          </button>

          <button
            id="accept-fake-call-btn"
            onClick={handleAcceptCall}
            className="flex flex-col items-center gap-2 group animate-bounce-subtle"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 group-hover:bg-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-950/60 transition-transform active:scale-95">
              <PhoneIncoming className="w-7 h-7 text-slate-950" />
            </div>
            <span className="text-xs text-slate-300 font-medium">{t.acceptCall}</span>
          </button>
        </div>
      </div>
    );
  }

  // CONNECTED CALL SCREEN (Active call timer & ongoing voice dialogue)
  if (callState === 'connected') {
    const mins = Math.floor(connectedTimer / 60);
    const secs = connectedTimer % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-8 text-white select-none">
        <div className="flex flex-col items-center gap-3 mt-12">
          <div className="w-24 h-24 rounded-full bg-emerald-950 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-2xl">
            <User className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">{callerName}</h2>
          <span className="text-sm font-mono text-emerald-400 font-semibold">{timeStr}</span>
          
          <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs text-center text-xs text-slate-300 leading-relaxed shadow-inner">
            <p className="italic text-slate-300">"{callerVoices[callerName]}"</p>
          </div>
        </div>

        {/* End Call Button */}
        <div className="w-full max-w-xs flex flex-col items-center mb-10">
          <button
            id="end-connected-call-btn"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-xl shadow-rose-950/80 active:scale-95 transition-all"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <span className="text-xs text-slate-400 font-medium mt-2">{t.endCall}</span>
        </div>
      </div>
    );
  }

  // SETUP MODAL (Choose caller and timer delay)
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{t.fakeCallTitle}</h3>
              <p className="text-xs text-slate-400">{t.fakeCallDesc}</p>
            </div>
          </div>
          <button
            id="close-fake-call-dialog-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.callerNameLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Mom (Urgent)', icon: '👩‍👧' },
                { label: 'Office Manager', icon: '💼' },
                { label: 'Cab Driver', icon: '🚖' },
                { label: 'Security Officer', icon: '🛡️' }
              ].map((c) => (
                <button
                  key={c.label}
                  id={`select-caller-${c.label.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setCallerName(c.label)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    callerName === c.label
                      ? 'bg-teal-950 border-teal-500 text-teal-200 ring-1 ring-teal-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.scheduleFakeCall}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sec: 0, label: 'Instant' },
                { sec: 10, label: 'In 10 sec' },
                { sec: 30, label: 'In 30 sec' }
              ].map((d) => (
                <button
                  key={d.sec}
                  id={`delay-btn-${d.sec}s`}
                  onClick={() => setDelaySeconds(d.sec)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    delaySeconds === d.sec
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          id="trigger-fake-call-submit-btn"
          onClick={handleStartCall}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 mt-1"
        >
          <Phone className="w-4 h-4" />
          <span>{delaySeconds === 0 ? t.startFakeCall : `Schedule Fake Call (${delaySeconds}s)`}</span>
        </button>
      </div>
    </div>
  );
};
