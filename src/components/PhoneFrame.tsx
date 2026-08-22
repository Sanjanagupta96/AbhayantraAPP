import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface Props {
  isPhoneMode: boolean;
  onTogglePhoneMode: () => void;
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<Props> = ({ isPhoneMode, onTogglePhoneMode, children }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!isPhoneMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
        {/* Floating View Switcher for Web Mode */}
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/95 border border-slate-800 backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xl ring-1 ring-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-semibold hidden sm:inline">Web Dashboard</span>
          <button
            id="view-toggle-phone-btn"
            onClick={onTogglePhoneMode}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md"
            title="Switch to Mobile Phone Simulator"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Switch to Phone Frame</span>
          </button>
        </div>
        <div className="w-full flex-1 flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 select-none">
      {/* Top Floating Control */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-300 tracking-wide">Abhayantra Mobile Preview</span>
        </div>
        <button
          id="view-toggle-desktop-btn"
          onClick={onTogglePhoneMode}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>
      </div>

      {/* Smartphone Device Frame */}
      <div className="relative w-full max-w-[400px] h-[850px] max-h-[92vh] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 shadow-teal-950/40 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
        
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-black px-4 py-1.5 rounded-full border border-slate-800/80 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
          <div className="w-10 h-1.5 rounded-full bg-slate-800"></div>
        </div>

        {/* Screen Bezel Container */}
        <div className="w-full h-full bg-slate-950 rounded-[34px] flex flex-col overflow-hidden relative border border-slate-900">
          
          {/* iOS / Android Status Bar */}
          <div className="h-11 pt-2 px-6 flex items-center justify-between text-xs text-slate-300 z-30 shrink-0 select-none bg-slate-950/80 backdrop-blur-sm">
            <span className="font-semibold text-xs tracking-tight text-slate-200">{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono text-slate-300">88%</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* App Body Viewport */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative scrollbar-none">
            {children}
          </div>

          {/* Home Navigation Indicator Bar */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
            <div className="w-32 h-1 rounded-full bg-slate-700/80"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
