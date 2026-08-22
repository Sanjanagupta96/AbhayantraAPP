import React, { useState } from 'react';
import { 
  Phone, 
  Camera, 
  Footprints, 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { Translations } from '../i18n';
import { FakeCallModal } from './FakeCallModal';
import { SilentRecorderModal } from './SilentRecorderModal';
import { WalkWithMeModal } from './WalkWithMeModal';
import { Contact } from '../types';

interface Props {
  t: Translations;
  contacts: Contact[];
}

export const DiscreetHub: React.FC<Props> = ({ t, contacts }) => {
  const [showFakeCall, setShowFakeCall] = useState<boolean>(false);
  const [showRecorder, setShowRecorder] = useState<boolean>(false);
  const [showWalkWithMe, setShowWalkWithMe] = useState<boolean>(false);

  return (
    <div id="discreet-tools-hub" className="flex flex-col gap-4 p-4 sm:p-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>{t.discreetToolsTitle}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          {t.discreetToolsDesc}
        </p>
      </div>

      {/* TOOLS GRID */}
      <div className="flex flex-col gap-3">
        {/* 1. Fake Call Escape */}
        <div
          id="open-fake-call-tool-btn"
          onClick={() => setShowFakeCall(true)}
          className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/60 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{t.fakeCallTitle}</span>
                <span className="text-[10px] bg-teal-950 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-800">
                  Escape Tool
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.fakeCallDesc}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors shrink-0" />
        </div>

        {/* 2. Silent Evidence Recorder */}
        <div
          id="open-silent-cam-tool-btn"
          onClick={() => setShowRecorder(true)}
          className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{t.silentCamTitle}</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 font-semibold px-2 py-0.5 rounded-full border border-rose-800">
                  Camouflage
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.silentCamDesc}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-rose-400 transition-colors shrink-0" />
        </div>

        {/* 3. Walk With Me */}
        <div
          id="open-walk-with-me-tool-btn"
          onClick={() => setShowWalkWithMe(true)}
          className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Footprints className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{t.walkWithMeTitle}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-800">
                  Auto-Wipe
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.walkWithMeDesc}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
        </div>
      </div>

      {/* FREEDOM ARCHITECTURE BANNER */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Freedom Philosophy & Privacy Guarantee</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlike ordinary monitoring apps that enforce non-stop tracking by family members, Abhayantra is built on <strong>positive confidence and on-demand safety</strong>. All location sharing is strictly opt-in, trip-specific, and auto-expiring.
        </p>
      </div>

      {/* Modals */}
      <FakeCallModal t={t} isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
      <SilentRecorderModal t={t} isOpen={showRecorder} onClose={() => setShowRecorder(false)} />
      <WalkWithMeModal t={t} isOpen={showWalkWithMe} onClose={() => setShowWalkWithMe(false)} contacts={contacts} />
    </div>
  );
};
