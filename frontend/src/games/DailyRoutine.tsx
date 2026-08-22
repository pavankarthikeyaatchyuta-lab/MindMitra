import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { CheckCircle2, RotateCcw, Eye, ArrowRight, Sparkles } from 'lucide-react';

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

interface RoutineItem {
  id: string;
  emoji: string;
  label: string;
  originalIndex: number;
}

const ROUTINES = [
  {
    name: 'Morning Schedule',
    items: [
      { emoji: '🌅', label: 'Wake up' },
      { emoji: '🪥', label: 'Brush teeth' },
      { emoji: '🍳', label: 'Eat breakfast' },
      { emoji: '💊', label: 'Take medicine' },
      { emoji: '📰', label: 'Read newspaper' },
      { emoji: '🚶', label: 'Go for morning walk' },
      { emoji: '🍲', label: 'Have lunch' }
    ]
  },
  {
    name: 'Evening Schedule',
    items: [
      { emoji: '🏠', label: 'Return home' },
      { emoji: '🧼', label: 'Wash hands' },
      { emoji: '☕', label: 'Enjoy tea' },
      { emoji: '📺', label: 'Watch news' },
      { emoji: '🍽️', label: 'Eat dinner' },
      { emoji: '💊', label: 'Take night pills' },
      { emoji: '💤', label: 'Go to sleep' }
    ]
  },
  {
    name: 'Cooking Activity',
    items: [
      { emoji: '🥬', label: 'Wash vegetables' },
      { emoji: '🔪', label: 'Chop vegetables' },
      { emoji: '🫕', label: 'Heat the pan' },
      { emoji: '🧂', label: 'Add fresh spices' },
      { emoji: '🍛', label: 'Cook and simmer' },
      { emoji: '🍽️', label: 'Serve warm on plate' },
      { emoji: '🧹', label: 'Clean kitchen counter' }
    ]
  }
];

export default function DailyRoutine({ difficulty, userId, gameSessionId, onComplete }: GameProps) {
  const { t } = useTranslation();
  
  // Stages: 'memorize' (showing sequence first) -> 'recall' (rebuilding sequence)
  const [stage, setStage] = useState<'memorize' | 'recall'>('memorize');
  const [targetSequence, setTargetSequence] = useState<RoutineItem[]>([]);
  const [poolItems, setPoolItems] = useState<RoutineItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<RoutineItem[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const stats = useRef({
    correctPlacements: 0,
    errors: 0,
    corrections: 0,
    responseTimes: [] as number[],
    startTime: 0,
    lastActionTime: 0
  });

  const itemCount = Math.min(6, difficulty + 2); // Diff 1: 3 items, Diff 2: 4 items, Diff 3: 5 items, Diff 4: 6 items

  useEffect(() => {
    initGame();
  }, [difficulty, gameSessionId]);

  const initGame = () => {
    const routine = ROUTINES[Math.floor(Math.random() * ROUTINES.length)];
    const chosenItems = routine.items.slice(0, itemCount).map((item, idx) => ({
      id: `item-${idx}`,
      emoji: item.emoji,
      label: item.label,
      originalIndex: idx
    }));

    setTargetSequence(chosenItems);
    setSelectedItems([]);
    setStage('memorize');
    setIsComplete(false);

    stats.current = {
      correctPlacements: 0,
      errors: 0,
      corrections: 0,
      responseTimes: [],
      startTime: Date.now(),
      lastActionTime: Date.now()
    };
  };

  const handleStartRecall = () => {
    // Shuffle the items for the pool
    const shuffled = [...targetSequence].sort(() => Math.random() - 0.5);
    setPoolItems(shuffled);
    setStage('recall');
    stats.current.lastActionTime = Date.now();
  };

  const handleItemClick = (item: RoutineItem) => {
    const now = Date.now();
    const latency = now - stats.current.lastActionTime;
    stats.current.responseTimes.push(latency);
    stats.current.lastActionTime = now;

    const nextExpectedIdx = selectedItems.length;

    if (item.originalIndex === nextExpectedIdx) {
      // Correct in sequence!
      stats.current.correctPlacements += 1;
      const newSelected = [...selectedItems, item];
      setSelectedItems(newSelected);
      setPoolItems(poolItems.filter(p => p.id !== item.id));

      if (newSelected.length === targetSequence.length) {
        finishGame();
      }
    } else {
      // Incorrect item
      stats.current.errors += 1;
      setShakeId(item.id);
      setTimeout(() => setShakeId(null), 600);
    }
  };

  const handleUndo = () => {
    if (selectedItems.length === 0) return;
    stats.current.corrections += 1;
    const lastItem = selectedItems[selectedItems.length - 1];
    setSelectedItems(selectedItems.slice(0, -1));
    setPoolItems([...poolItems, lastItem]);
  };

  const finishGame = () => {
    setIsComplete(true);
    const now = Date.now();
    const totalTime = now - stats.current.startTime;
    const avgRt = stats.current.responseTimes.length > 0
      ? stats.current.responseTimes.reduce((a, b) => a + b, 0) / stats.current.responseTimes.length
      : 2200;

    const totalEvents = stats.current.correctPlacements + stats.current.errors;
    const accuracy = stats.current.correctPlacements / Math.max(1, totalEvents);

    onComplete({
      accuracy: Math.min(1.0, Math.max(0.1, accuracy)),
      avg_response_time_ms: avgRt,
      repeat_errors: 0,
      corrections: stats.current.corrections,
      completion_time_ms: totalTime,
      total_events: totalEvents
    });
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-4">
      {/* Header Info */}
      <div className="w-full cosmic-card p-6 mb-6">
        <h2 className="text-3xl font-bold text-blue-300 flex items-center gap-3">
          <span>📋</span> {t('games.routine.title', 'Daily Routine Recall')}
        </h2>
        <p className="text-lg text-slate-300 mt-1">
          {stage === 'memorize'
            ? 'Observe and remember the sequence of events shown below.'
            : 'Select the activities in the exact order you just memorized.'}
        </p>
      </div>

      {/* STAGE 1: MEMORIZE SEQUENCE */}
      {stage === 'memorize' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full cosmic-card p-8 flex flex-col items-center"
        >
          <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-6 text-xl">
            <Eye size={24} /> Step 1: Memorize This Sequence
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xl mb-8">
            {targetSequence.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 text-xl font-medium text-white shadow-md"
              >
                <span className="w-10 h-10 rounded-xl bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold text-lg">
                  {idx + 1}
                </span>
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-slate-100">{item.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartRecall}
            className="elderly-btn-primary flex items-center gap-3 text-2xl"
          >
            I'm Ready — Start Recall <ArrowRight size={24} />
          </button>
        </motion.div>
      )}

      {/* STAGE 2: RECALL AND SEQUENCE */}
      {stage === 'recall' && (
        <div className="w-full flex flex-col gap-6">
          {/* Target Placement Slots */}
          <div className="cosmic-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-300">
                Arranged Sequence ({selectedItems.length} / {targetSequence.length})
              </h3>
              {selectedItems.length > 0 && !isComplete && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-2 text-amber-300 hover:text-amber-200 text-lg px-4 py-2 bg-slate-900/60 rounded-xl border border-amber-500/30"
                >
                  <RotateCcw size={20} /> Undo Last
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 min-h-[140px]">
              {selectedItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 text-xl font-medium text-emerald-200 shadow-md"
                >
                  <span className="w-10 h-10 rounded-xl bg-emerald-700/50 text-emerald-200 flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-3xl">{item.emoji}</span>
                  <span>{item.label}</span>
                  <CheckCircle2 size={24} className="ml-auto text-emerald-400" />
                </motion.div>
              ))}

              {selectedItems.length < targetSequence.length && (
                <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-4 text-center text-slate-400 text-lg bg-slate-900/30">
                  Select item #{selectedItems.length + 1} from options below
                </div>
              )}
            </div>
          </div>

          {/* Options Pool */}
          <div className="cosmic-card p-6">
            <h3 className="text-xl font-semibold text-slate-300 mb-4">Available Activities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {poolItems.map(item => (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  animate={shakeId === item.id ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left text-xl font-medium transition-all shadow-md ${
                    shakeId === item.id
                      ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
