import React from 'react';
import { LanguageCode } from '../types';
import { Globe } from 'lucide-react';

interface Props {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

const languages: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' }
];

export const LanguageSelector: React.FC<Props> = ({ currentLang, onSelectLang }) => {
  return (
    <div id="language-selector-wrapper" className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none">
      <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold uppercase tracking-wider pl-1 pr-2 shrink-0">
        <Globe className="w-3.5 h-3.5" />
        <span>Lang</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {languages.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              onClick={() => onSelectLang(lang.code)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              {lang.native}
            </button>
          );
        })}
      </div>
    </div>
  );
};
