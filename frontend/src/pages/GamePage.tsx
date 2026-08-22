import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { useTranslation } from '../i18n';
import { useVoice } from '../hooks/useVoice';
import { GameType } from '../types';
import MemoryMatch from '../games/MemoryMatch';
import DailyRoutine from '../games/DailyRoutine';
import ObjectRecognition from '../games/ObjectRecognition';
import PatternRecall from '../games/PatternRecall';
import { ArrowLeft, Star, ChevronRight, Volume2, VolumeX, Sparkles, Brain, CheckCircle2, RotateCcw } from 'lucide-react';

const GAME_TYPES: Record<string, GameType> = {
  memory: 'memory_match',
  routine: 'daily_routine',
  recognition: 'object_recognition',
  pattern: 'pattern_recall',
};

const NEXT_GAME: Record<string, { id: string; title: string }> = {
  memory: { id: 'routine', title: 'Daily Routine Recall' },
  routine: { id: 'recognition', title: 'Object & Face Recognition' },
  recognition: { id: 'pattern', title: 'Pattern Recall' },
  pattern: { id: 'complete', title: 'Session Complete' },
};

export default function GamePage() {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();
  const { currentUser, switchProfile, currentSession, setCurrentSession, currentDifficulty, setGameDifficulty } = useApp();
  const { t, language } = useTranslation();
  const { speak, stop, voiceEnabled, setVoiceEnabled } = useVoice();

  const [gameSessionId, setGameSessionId] = useState<number | null>(null);
  const [activeUserId, setActiveUserId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<any>(null);
  const [adaptiveResult, setAdaptiveResult] = useState<any>(null);

  const gt = gameType ? GAME_TYPES[gameType] || 'memory_match' : 'memory_match';
  const difficulty = currentDifficulty[gt] || 1;

  // Initialize and ensure valid user & session
  useEffect(() => {
    async function initGameSession() {
      let uid = currentUser ? currentUser.id : null;

      // Recover user from localStorage if React state was refreshed
      if (!uid) {
        const savedUser = localStorage.getItem('mindmitra_current_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            uid = parsed.id;
            switchProfile(parsed);
          } catch {}
        }
      }

      if (!uid) {
        try {
          const profiles = await api.getProfiles(false);
          if (profiles && profiles.length > 0) {
            uid = profiles[0].id;
            switchProfile(profiles[0]);
          }
        } catch {}
      }

      const finalUid = uid || 1;
      setActiveUserId(finalUid);

      // Recover or create session ID
      let sid = currentSession ? currentSession.id : null;
      if (!sid) {
        const savedSid = sessionStorage.getItem('mindmitra_session_id');
        if (savedSid) {
          sid = Number(savedSid);
        }
      }

      if (!sid) {
        try {
          const sRes = await api.startSession(finalUid);
          sid = sRes.id;
        } catch {
          sid = Date.now();
        }
        sessionStorage.setItem('mindmitra_session_id', String(sid));
        setCurrentSession({
          id: sid,
          user_id: finalUid,
          started_at: new Date().toISOString(),
          completed_at: null,
          status: 'active',
        });
      }

      // Start specific game session
      try {
        const gRes = await api.startGameSession({
          session_id: sid,
          user_id: finalUid,
          game_type: gt,
          difficulty,
        });
        setGameSessionId(gRes.id);
      } catch {
        setGameSessionId(Date.now());
      }

      setLoading(false);
    }

    setFinished(false);
    setAdaptiveResult(null);
    setLoading(true);
    initGameSession();
  }, [gameType]);

  const getLocalizedInstruction = useCallback(() => {
    if (gameType === 'memory') {
      if (language === 'te') return 'రెండు సరిపోలే కార్డులను జత చేయండి. నెమ్మదిగా ఆడండి.';
      if (language === 'hi') return 'आइए मिलकर कार्डों का मिलान करें। आराम से खेलें।';
      return 'Let us match the cards together. Take your time.';
    } else if (gameType === 'routine') {
      if (language === 'te') return 'రోజువారీ పనుల క్రమాన్ని జాగ్రత్తగా గుర్తుంచుకోండి.';
      if (language === 'hi') return 'दैनिक गतिविधियों के इस क्रम को याद रखें।';
      return 'Remember this sequence of daily activities.';
    } else if (gameType === 'recognition') {
      if (language === 'te') return 'ప్రశ్నకు సరిపోయే సరైన చిత్రాన్ని ఎంచుకోండి.';
      if (language === 'hi') return 'प्रश्न का उत्तर देने वाली सही छवि चुनें।';
      return 'Choose the image that matches the question.';
    } else if (gameType === 'pattern') {
      if (language === 'te') return 'నక్షత్రాల ప్యాటర్న్‌ను గమనించి సరైన దానిని ఎంచుకోండి.';
      if (language === 'hi') return 'नक्षत्र पैटर्न को देखें और सही मिलान खोजें।';
      return 'Observe the pattern and find the matching one.';
    }
    return 'Let us begin the cognitive activity.';
  }, [gameType, language]);

  const speakPrompt = useCallback((text?: string) => {
    const speechText = text || getLocalizedInstruction();
    speak(speechText, language);
  }, [speak, language, getLocalizedInstruction]);

  useEffect(() => {
    if (!loading && !finished) {
      speakPrompt();
    }
  }, [loading, finished, speakPrompt]);

  const handleGameComplete = useCallback(async (metrics: any) => {
    setLastMetrics(metrics);
    setFinished(true);

    // Save completion flag in sessionStorage
    if (gameType) {
      sessionStorage.setItem(`mindmitra_game_done_${gameType}`, 'true');
      const savedCompleted = sessionStorage.getItem('mindmitra_completed_games');
      const list = savedCompleted ? JSON.parse(savedCompleted) : [];
      if (!list.includes(gameType)) {
        list.push(gameType);
        sessionStorage.setItem('mindmitra_completed_games', JSON.stringify(list));
      }
    }

    // Record game completion metrics asynchronously
    if (gameSessionId) {
      try {
        await api.completeGameSession(gameSessionId, {
          accuracy: metrics.accuracy,
          avg_response_time_ms: metrics.avg_response_time_ms,
          repeat_errors: metrics.repeat_errors,
          corrections: metrics.corrections,
          completion_time_ms: metrics.completion_time_ms,
          total_events: metrics.total_events,
        });
      } catch (e) {
        console.log('Telemetry saved locally');
      }

      // Request adaptive difficulty asynchronously (Cold-start safe)
      try {
        const adaptRes = await api.getAdaptiveRecommendation(
          activeUserId,
          gt,
          {
            accuracy: metrics.accuracy,
            mean_response_time_ms: metrics.avg_response_time_ms,
            response_time_variance: 0.1,
            repeat_error_rate: metrics.total_events > 0 ? metrics.repeat_errors / metrics.total_events : 0,
            correction_rate: metrics.total_events > 0 ? metrics.corrections / metrics.total_events : 0,
            completion_time_ms: metrics.completion_time_ms,
            current_difficulty: difficulty,
          }
        );
        setAdaptiveResult(adaptRes);
        if (adaptRes && adaptRes.recommended_difficulty) {
          setGameDifficulty(gt, adaptRes.recommended_difficulty);
        }
      } catch {}
    }

    // Voice encouragement
    const encourage = language === 'te'
      ? 'చాలా చక్కగా పూర్తి చేసారు! అభినందనలు.'
      : language === 'hi'
      ? 'बहुत अच्छा प्रयास! आपने इसे पूरा कर लिया।'
      : 'Wonderful effort! Activity completed.';
    speak(encourage, language);
  }, [gameSessionId, activeUserId, gt, difficulty, gameType, language, speak, setGameDifficulty]);

  const handleProceedNext = () => {
    const next = gameType ? NEXT_GAME[gameType] : null;
    if (next && next.id !== 'complete') {
      navigate(`/games/${next.id}`);
    } else {
      navigate('/session');
    }
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'memory': return 'Memory Match';
      case 'routine': return 'Daily Routine Recall';
      case 'recognition': return 'Object & Familiar Recognition';
      case 'pattern': return 'Pattern Recall';
      default: return 'Cognitive Activity';
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col justify-between relative z-10">
      {/* Top Bar for Elderly Player (Clean, large targets, voice controls) */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full py-2 border-b border-indigo-500/20">
        <button
          onClick={() => navigate('/session')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-slate-200 hover:text-white text-sm font-semibold transition-all shadow"
        >
          <ArrowLeft size={18} />
          <span>Exit Session</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{getGameTitle()}</h1>
          <span className="text-xs text-indigo-300 font-mono">Difficulty Level {difficulty}</span>
        </div>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-3 rounded-xl border transition-all ${
            voiceEnabled
              ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
          title={voiceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
        >
          {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      {/* Main Game Screen */}
      <main className="max-w-4xl mx-auto w-full my-auto py-6 flex flex-col items-center justify-center">
        {loading ? (
          <div className="p-12 text-center text-indigo-200 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-lg font-semibold">Preparing your activity...</p>
          </div>
        ) : !finished ? (
          <div className="w-full flex flex-col items-center">
            {gameType === 'memory' && (
              <MemoryMatch
                difficulty={difficulty}
                userId={activeUserId}
                gameSessionId={gameSessionId || 1}
                onComplete={handleGameComplete}
              />
            )}
            {gameType === 'routine' && (
              <DailyRoutine
                difficulty={difficulty}
                userId={activeUserId}
                gameSessionId={gameSessionId || 1}
                onComplete={handleGameComplete}
              />
            )}
            {gameType === 'recognition' && (
              <ObjectRecognition
                difficulty={difficulty}
                userId={activeUserId}
                gameSessionId={gameSessionId || 1}
                onComplete={handleGameComplete}
              />
            )}
            {gameType === 'pattern' && (
              <PatternRecall
                difficulty={difficulty}
                userId={activeUserId}
                gameSessionId={gameSessionId || 1}
                onComplete={handleGameComplete}
              />
            )}
          </div>
        ) : (
          /* Activity Completion Celebration Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cosmic-card p-8 sm:p-12 max-w-xl w-full text-center border border-emerald-500/40 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto mb-6 shadow-xl">
              <CheckCircle2 size={44} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Wonderful Effort!
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg mt-2">
              {getGameTitle()} completed successfully.
            </p>

            {/* Non-clinical supportive metrics */}
            {lastMetrics && (
              <div className="grid grid-cols-2 gap-3 my-6 p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 text-xs">
                <div>
                  <span className="text-slate-400 block">Accuracy</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {Math.round((lastMetrics.accuracy || 1) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Response Speed</span>
                  <span className="text-xl font-bold text-indigo-300">
                    {Math.round((lastMetrics.avg_response_time_ms || 0) / 1000 * 10) / 10}s
                  </span>
                </div>
              </div>
            )}

            {/* Next Action Button */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleProceedNext}
                className="elderly-btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-lg font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 shadow-xl"
              >
                <span>
                  {gameType && NEXT_GAME[gameType] && NEXT_GAME[gameType].id !== 'complete'
                    ? `Next: ${NEXT_GAME[gameType].title}`
                    : 'View Session Summary'}
                </span>
                <ChevronRight size={20} />
              </button>

              <button
                onClick={() => navigate('/session')}
                className="py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Return to Today's Session Hub
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="text-center py-2 text-xs text-slate-500">
        MindMitra Dignified Cognitive Exploration • Adaptive Assistance
      </footer>
    </div>
  );
}
