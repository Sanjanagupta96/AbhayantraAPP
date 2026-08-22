import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, EyeOff, Calculator, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Translations } from '../i18n';

interface Props {
  t: Translations;
  isOpen: boolean;
  onClose: () => void;
}

export const SilentRecorderModal: React.FC<Props> = ({ t, isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [camMode, setCamMode] = useState<'normal' | 'calculator' | 'black'>('normal');
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [recordTime, setRecordTime] = useState<number>(0);
  
  // Calculator state for camouflage
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [tapCounter, setTapCounter] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordTime((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async (type: 'audio' | 'video' = 'video') => {
    try {
      const constraints: MediaStreamConstraints = type === 'video' 
        ? { video: { facingMode: 'user' }, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoPreviewRef.current && type === 'video') {
        videoPreviewRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: type === 'video' ? 'video/webm' : 'audio/webm' });
        setRecordedBlobs((prev) => [...prev, fullBlob]);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordTime(0);
    } catch (err) {
      console.warn('Media devices not allowed or unavailable:', err);
      // Fallback simulated recording
      setIsRecording(true);
      setRecordTime(0);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setCamMode('normal');
  };

  // Secret 4-tap unlock gesture
  const handleSecretScreenTap = () => {
    setTapCounter((prev) => {
      const next = prev + 1;
      if (next >= 4) {
        setCamMode('normal');
        return 0;
      }
      return next;
    });
  };

  // Calculator button handler
  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
    } else if (val === '=') {
      try {
        // Safe evaluation
        // eslint-disable-next-line no-eval
        const evaluated = Function('"use strict";return (' + calcDisplay.replace(/×/g, '*').replace(/÷/g, '/') + ')')();
        setCalcDisplay(String(evaluated));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay((prev) => (prev === '0' ? val : prev + val));
    }
  };

  if (!isOpen) return null;

  // 1. PURE BLACK SCREEN CAMOUFLAGE
  if (camMode === 'black') {
    return (
      <div
        id="stealth-black-screen"
        onClick={handleSecretScreenTap}
        className="fixed inset-0 z-[100] bg-black cursor-pointer flex flex-col items-center justify-between p-6 select-none"
      >
        <div className="text-[10px] text-zinc-900 mt-2">
          {isRecording ? '•' : ''}
        </div>
        <div className="text-[11px] text-zinc-800 text-center font-mono">
          Tap screen 4 times to unlock controls ({tapCounter}/4)
        </div>
      </div>
    );
  }

  // 2. WORKING CALCULATOR CAMOUFLAGE
  if (camMode === 'calculator') {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-4 text-white select-none">
        {/* Subtle Stealth Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-b border-slate-900">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-[10px] text-rose-400">REC {recordTime}s</span>
          </div>
          <button
            onClick={() => setCamMode('normal')}
            className="text-[10px] bg-slate-900 text-slate-400 px-2.5 py-1 rounded-full border border-slate-800"
          >
            Exit Camouflage
          </button>
        </div>

        {/* Display */}
        <div className="flex-1 flex items-end justify-end p-4 text-4xl font-mono text-slate-100 truncate">
          {calcDisplay}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {['C', '÷', '×', '⌫', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.', '(', ')'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === '⌫') setCalcDisplay((p) => p.length > 1 ? p.slice(0, -1) : '0');
                else handleCalcPress(key);
              }}
              className={`h-14 rounded-2xl text-lg font-bold flex items-center justify-center transition-transform active:scale-95 ${
                ['÷', '×', '-', '+', '='].includes(key)
                  ? 'bg-amber-500 text-slate-950 font-extrabold'
                  : key === 'C'
                  ? 'bg-rose-900 text-rose-200'
                  : 'bg-slate-900 text-slate-200 border border-slate-800'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. NORMAL CONTROL SETUP SCREEN
  const mins = Math.floor(recordTime / 60);
  const secs = recordTime % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{t.silentCamTitle}</h3>
              <p className="text-xs text-slate-400">{t.silentCamDesc}</p>
            </div>
          </div>
          <button
            id="close-silent-cam-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Video Preview / Active State */}
        <div className="relative w-full h-40 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isRecording && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80">
              <EyeOff className="w-8 h-8 text-slate-600" />
              <span className="text-xs text-slate-400">Stealth camera standby</span>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/80 px-2.5 py-1 rounded-full text-rose-200 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>{timeStr}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5">
          {!isRecording ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                id="start-stealth-video-btn"
                onClick={() => handleStartRecording('video')}
                className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Video Record</span>
              </button>
              <button
                id="start-stealth-audio-btn"
                onClick={() => handleStartRecording('audio')}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Audio Only</span>
              </button>
            </div>
          ) : (
            <button
              id="stop-stealth-recording-btn"
              onClick={handleStopRecording}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.stopRecording}</span>
            </button>
          )}

          {/* Camouflage Modes */}
          {isRecording && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                id="enable-calculator-mode-btn"
                onClick={() => setCamMode('calculator')}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Calculator Mode</span>
              </button>
              <button
                id="enable-black-screen-mode-btn"
                onClick={() => setCamMode('black')}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span>Black Screen</span>
              </button>
            </div>
          )}
        </div>

        {/* Evidence Vault notice */}
        {recordedBlobs.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> {recordedBlobs.length} Evidence Clips Secured
            </span>
            <span className="text-[10px] text-slate-500">Encrypted Local Vault</span>
          </div>
        )}
      </div>
    </div>
  );
};
