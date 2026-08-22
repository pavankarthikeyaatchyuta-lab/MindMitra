import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { Sparkles, CheckCircle2, Eye, HelpCircle, ArrowRight } from 'lucide-react';

export interface GameMetrics {
  accuracy: number;
  avg_response_time_ms: number;
  repeat_errors: number;
  corrections: number;
  completion_time_ms: number;
  total_events: number;
}

export interface GameProps {
  difficulty: number;
  userId: number;
  gameSessionId: number;
  onComplete: (metrics: GameMetrics) => void;
}

const SYMBOLS = ['★', '✦', '⬤', '▲', '◆', '☀️', '🌙', '🪐'];

interface RoundData {
  pattern: string[];
  options: {
    id: string;
    pattern: string[];
    isCorrect: boolean;
  }[];
}

export default function PatternRecall({ difficulty, userId, gameSessionId, onComplete }: GameProps) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<'memorize' | 'recall'>('memorize');
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(4);

  const stats = useRef({
    correctRounds: 0,
    errors: 0,
    corrections: 0,
    responseTimes: [] as number[],
    startTime: 0,
    lastActionTime: 0
  });

  const patternLength = Math.min(6, difficulty + 2); // Level 1: 3, Level 2: 4, Level 3: 5, Level 4: 6
  const totalRounds = 3;

  useEffect(() => {
    initGame();
  }, [difficulty, gameSessionId]);

  useEffect(() => {
    let timer: any;
    if (stage === 'memorize' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            startRecall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, countdown]);

  const generateRounds = (): RoundData[] => {
    const generated: RoundData[] = [];
    for (let r = 0; r < totalRounds; r++) {
      const pattern: string[] = [];
      for (let i = 0; i < patternLength; i++) {
        pattern.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }

      // Generate 3 candidate distractor patterns
      const distractors: string[][] = [];
      while (distractors.length < 3) {
        const altered = [...pattern];
        const swapIdx = Math.floor(Math.random() * patternLength);
        const newSym = SYMBOLS.filter(s => s !== pattern[swapIdx])[Math.floor(Math.random() * (SYMBOLS.length - 1))];
        altered[swapIdx] = newSym;

        const isDup = distractors.some(d => d.join('') === altered.join('')) || altered.join('') === pattern.join('');
        if (!isDup) {
          distractors.push(altered);
        }
      }

      const options = [
        { id: `opt-c-${r}`, pattern: [...pattern], isCorrect: true },
        ...distractors.map((d, dIdx) => ({ id: `opt-d-${r}-${dIdx}`, pattern: d, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      generated.push({ pattern, options });
    }
    return generated;
  };

  const initGame = () => {
    const newRounds = generateRounds();
    setRounds(newRounds);
    setCurrentRoundIdx(0);
    setStage('memorize');
    setCountdown(4);
    setSelectedOptionId(null);
    setFeedback(null);
    setIsLocked(false);

    stats.current = {
      correctRounds: 0,
      errors: 0,
      corrections: 0,
      responseTimes: [],
      startTime: Date.now(),
      lastActionTime: Date.now()
    };
  };

  const startRecall = () => {
    setStage('recall');
    stats.current.lastActionTime = Date.now();
  };

  const handleSelectOption = (option: RoundData['options'][0]) => {
    if (isLocked) return;

    const now = Date.now();
    const latency = now - stats.current.lastActionTime;
    stats.current.responseTimes.push(latency);
    stats.current.lastActionTime = now;

    setSelectedOptionId(option.id);
    setIsLocked(true);

    if (option.isCorrect) {
      stats.current.correctRounds += 1;
      setFeedback('correct');
    } else {
      stats.current.errors += 1;
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (currentRoundIdx + 1 < rounds.length) {
        setCurrentRoundIdx(prev => prev + 1);
        setStage('memorize');
        setCountdown(4);
        setSelectedOptionId(null);
        setFeedback(null);
        setIsLocked(false);
      } else {
        finishGame();
      }
    }, 1400);
  };

  const finishGame = () => {
    const now = Date.now();
    const totalTime = now - stats.current.startTime;
    const avgRt = stats.current.responseTimes.length > 0
      ? stats.current.responseTimes.reduce((a, b) => a + b, 0) / stats.current.responseTimes.length
      : 2400;

    const totalEvents = stats.current.correctRounds + stats.current.errors;
    const accuracy = stats.current.correctRounds / Math.max(1, totalEvents);

    onComplete({
      accuracy: Math.min(1.0, Math.max(0.1, accuracy)),
      avg_response_time_ms: avgRt,
      repeat_errors: 0,
      corrections: stats.current.corrections,
      completion_time_ms: totalTime,
      total_events: totalEvents
    });
  };

  if (rounds.length === 0) return null;

  const currentRound = rounds[currentRoundIdx];

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-4">
      {/* Header Info */}
      <div className="w-full cosmic-card p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-300 flex items-center gap-3">
            <span>✨</span> Pattern Recall
          </h2>
          <p className="text-lg text-slate-300 mt-1">
            {stage === 'memorize'
              ? 'Observe the constellation pattern before it disappears.'
              : 'Choose the matching pattern that you just observed.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20 text-indigo-300 font-bold text-lg">
            Round {currentRoundIdx + 1} / {rounds.length}
          </div>
        </div>
      </div>

      {/* Main Pattern Stage Card */}
      <div className="w-full cosmic-card p-8 flex flex-col items-center min-h-[380px] justify-center">
        {stage === 'memorize' ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-lg font-medium mb-6">
              <Eye size={22} /> Memorize this pattern ({countdown}s)
            </div>

            {/* Pattern Display */}
            <div className="flex items-center gap-4 bg-slate-900/90 border-2 border-indigo-400 p-6 sm:p-8 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-8">
              {currentRound.pattern.map((sym, sIdx) => (
                <span
                  key={sIdx}
                  className="text-5xl sm:text-6xl text-indigo-200 font-bold drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                >
                  {sym}
                </span>
              ))}
            </div>

            <button
              onClick={startRecall}
              className="elderly-btn-primary flex items-center gap-2 text-xl"
            >
              I've Got It — Ready <ArrowRight size={22} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">
              Which pattern did you see?
            </h3>

            {/* Multiple Choice Pattern Candidates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {currentRound.options.map((opt, optIdx) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800 text-white';

                if (isSelected) {
                  if (feedback === 'correct') {
                    btnStyle = 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
                  } else if (feedback === 'incorrect') {
                    btnStyle = 'bg-rose-950/90 border-2 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
                  }
                }

                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isLocked}
                    whileHover={!isLocked ? { scale: 1.03 } : {}}
                    whileTap={!isLocked ? { scale: 0.97 } : {}}
                    className={`p-5 rounded-2xl flex items-center justify-center gap-3 transition-all min-h-[90px] shadow-md cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-sm">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <div className="flex items-center gap-3 text-3xl sm:text-4xl text-indigo-100">
                      {opt.pattern.map((s, sI) => (
                        <span key={sI}>{s}</span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
