import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { ttsService, TTSState, LANGUAGE_CONFIGS } from '../services/ttsService';
import { Language } from '../types';
import { Volume2, VolumeX, RefreshCw, Sparkles, X, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TTSDebugPanel() {
  const { language, setLanguage } = useTranslation();
  const [ttsState, setTtsState] = useState<TTSState>(ttsService.getState());
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ttsService.onStateChange(s => setTtsState(s));
    return () => unsub();
  }, []);

  const config = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.en;

  const handleTest = async (lang: Language) => {
    setTestResult('🔊 Preparing speech...');
    const res = await ttsService.speak(LANGUAGE_CONFIGS[lang].testPhrase, lang);
    if (res.success) {
      setTestResult(`✓ Spoke successfully: ${res.voiceName} [${res.source}]`);
    } else {
      setTestResult(`⚠ ${res.error || 'Failed to speak'}`);
    }
  };

  const hasNativeVoice = !!ttsState.detectedVoice;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-indigo-300 hover:text-white hover:border-indigo-400 text-xs font-mono shadow-2xl flex items-center gap-2 backdrop-blur-md"
          title="Open Multilingual TTS Debugger"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          TTS Engine: {config.name} ({hasNativeVoice ? 'Browser Native' : 'Cloud Fallback Ready'})
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-96 p-4 rounded-2xl bg-slate-950/95 border border-indigo-500/50 text-white shadow-2xl backdrop-blur-xl text-xs flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
              <Sparkles size={16} /> Multilingual TTS Inspector
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Section 6 Diagnostic Readout */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-3 rounded-xl border border-indigo-500/20 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block">Selected Language:</span>
              <span className="font-bold text-white">{config.name} ({config.nativeName})</span>
            </div>
            <div>
              <span className="text-slate-400 block">Requested Locale:</span>
              <span className="font-bold text-indigo-300">{config.locale}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Browser Voice:</span>
              <span className={`font-bold ${hasNativeVoice ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasNativeVoice ? ttsState.detectedVoice?.name.split(' ')[0] : 'Unavailable'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Fallback Engine:</span>
              <span className="font-bold text-indigo-200">
                {language === 'te' ? 'Google Cloud Telugu TTS' : (language === 'hi' ? 'Google Cloud Hindi TTS' : 'N/A')}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">Active Provider:</span>
              <span className="font-bold text-slate-200 truncate block">
                {ttsState.ttsProvider}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Audio Status:</span>
              <span className="font-bold text-emerald-400">
                {ttsState.isPreparingCloudAudio ? '🔊 Preparing...' : 'Available'}
              </span>
            </div>
          </div>

          {/* Last Spoken Text */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/20 text-[11px]">
            <span className="text-slate-400 block mb-0.5">Spoken Text:</span>
            <p className="text-slate-200 italic font-serif">
              "{ttsState.lastSpokenText || config.testPhrase}"
            </p>
          </div>

          {testResult && (
            <div className="text-[11px] p-2 bg-indigo-950/80 rounded-lg border border-indigo-500/30 text-indigo-200 flex items-center gap-1.5">
              <Volume2 size={13} className="text-emerald-400 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Language Switch & Test Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Test Individual Audio Output:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  setLanguage('en');
                  handleTest('en');
                }}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs border flex items-center justify-center gap-1 ${
                  language === 'en' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <Volume2 size={12} /> EN (English)
              </button>
              <button
                onClick={() => {
                  setLanguage('hi');
                  handleTest('hi');
                }}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs border flex items-center justify-center gap-1 ${
                  language === 'hi' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <Volume2 size={12} /> HI (हिन्दी)
              </button>
              <button
                onClick={() => {
                  setLanguage('te');
                  handleTest('te');
                }}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs border flex items-center justify-center gap-1 ${
                  language === 'te' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <Volume2 size={12} /> TE (తెలుగు)
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
