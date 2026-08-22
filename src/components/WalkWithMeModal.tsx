import React, { useState, useEffect, useRef } from 'react';
import { Footprints, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Translations } from '../i18n';
import { WalkSession, Contact } from '../types';
import { api } from '../services/api';

interface Props {
  t: Translations;
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
}

export const WalkWithMeModal: React.FC<Props> = ({ t, isOpen, onClose, contacts }) => {
  const [activeWalk, setActiveWalk] = useState<WalkSession | null>(null);
  const [destination, setDestination] = useState<string>('Home / Hostel Gate');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isCompletedMsg, setIsCompletedMsg] = useState<string>('');

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      api.getActiveWalk().then((walk) => {
        if (walk) {
          setActiveWalk(walk);
          const diff = Math.max(0, Math.floor((new Date(walk.expiresAt).getTime() - Date.now()) / 1000));
          setRemainingSeconds(diff);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeWalk && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSosTrigger();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeWalk]);

  const handleStartWalk = async () => {
    try {
      const walk = await api.startWalk({
        destination,
        durationMinutes,
        startLat: 28.6328,
        startLng: 77.2190
      });
      setActiveWalk(walk);
      setRemainingSeconds(durationMinutes * 60);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleExtend10Mins = () => {
    setRemainingSeconds((prev) => prev + 600);
  };

  const handleReachedSafely = async () => {
    try {
      await api.completeWalk();
      setIsCompletedMsg(t.privacyAutoDeleteNotice);
      setTimeout(() => {
        setActiveWalk(null);
        setIsCompletedMsg('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setActiveWalk(null);
      onClose();
    }
  };

  const handleAutoSosTrigger = async () => {
    try {
      await api.triggerSos({
        lat: 28.6328,
        lng: 77.2190,
        address: `Walk With Me Timer Expired near ${destination}`
      });
    } catch {}
  };

  if (!isOpen) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{t.walkWithMeTitle}</h3>
              <p className="text-xs text-slate-400">{t.walkWithMeDesc}</p>
            </div>
          </div>
          <button
            id="close-walk-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            ✕
          </button>
        </div>

        {isCompletedMsg ? (
          <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <h4 className="text-sm font-bold text-emerald-200">Safely Completed!</h4>
            <p className="text-xs text-emerald-300 leading-relaxed">{isCompletedMsg}</p>
          </div>
        ) : activeWalk ? (
          /* ACTIVE WALK COMPANION VIEW */
          <div className="flex flex-col items-center gap-4 bg-slate-950 p-5 rounded-2xl border border-teal-900/40">
            <div className="flex items-center gap-1.5 bg-teal-950 px-3 py-1 rounded-full text-teal-300 text-xs font-semibold border border-teal-800 animate-pulse">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.activeWalk}</span>
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400 block mb-1">Heading to: <strong className="text-slate-200">{activeWalk.destination}</strong></span>
              <div className="text-4xl font-extrabold font-mono text-emerald-400">{timeStr}</div>
              <span className="text-[11px] text-slate-500 font-medium">Auto-alert triggers if time expires</span>
            </div>

            <div className="w-full flex gap-2">
              <button
                id="extend-walk-time-btn"
                onClick={handleExtend10Mins}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.extend10Mins}</span>
              </button>

              <button
                id="reached-safely-btn"
                onClick={handleReachedSafely}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/80 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.reachedSafely}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              🛡️ {t.privacyAutoDeleteNotice}
            </p>
          </div>
        ) : (
          /* START WALK SETUP */
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Destination Landmark</label>
              <input
                id="walk-destination-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Metro Station Gate 3"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.setJourneyDuration}</label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 20, 30, 45].map((minsOption) => (
                  <button
                    key={minsOption}
                    id={`walk-duration-${minsOption}m`}
                    onClick={() => setDurationMinutes(minsOption)}
                    className={`py-2 text-center rounded-xl border text-xs font-medium transition-all ${
                      durationMinutes === minsOption
                        ? 'bg-teal-950 border-teal-500 text-teal-200 ring-1 ring-teal-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {minsOption}m
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Guardians will only be alerted if you do not check in before the timer ends. No ongoing tracking is logged.
              </span>
            </div>

            <button
              id="start-walk-submit-btn"
              onClick={handleStartWalk}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 mt-1"
            >
              <Footprints className="w-4 h-4" />
              <span>{t.startWalk}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
