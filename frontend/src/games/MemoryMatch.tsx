import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { Sparkles, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';

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

// Constellation and celestial/everyday symbols for memory
const CELESTIAL_EMOJIS = [
  '⭐', '🌙', '🪐', '☀️', '🌺', '🍎', '🏠', '🕊️', '🔔', '🦋',
  '🎨', '💧', '🎵', '🌿', '🍇', '⛵', '🌈', '🌻', '🏮', '💎'
];

const getPairCount = (difficulty: number) => {
  switch (difficulty) {
    case 1: return 3; // 6 cards (3x2)
    case 2: return 5; // 10 cards (5x2)
    case 3: return 7; // 14 cards (7x2 or 4x4-2)
    case 4: return 9; // 18 cards (6x3)
    default: return 5;
  }
};

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatch({ difficulty, userId, gameSessionId, onComplete }: GameProps) {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const stats = useRef({
    flips: 0,
    matches: 0,
    errors: 0,
    repeatErrors: 0,
    corrections: 0,
    responseTimes: [] as number[],
    startTime: 0,
    lastActionTime: 0,
    seenCards: new Set<string>()
  });

  const pairCount = getPairCount(difficulty);

  useEffect(() => {
    initGame();
  }, [difficulty, gameSessionId]);

  useEffect(() => {
    let timer: any;
    if (!isComplete && stats.current.startTime > 0) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - stats.current.startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isComplete]);

  const initGame = () => {
    const selectedEmojis = CELESTIAL_EMOJIS.slice(0, pairCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({
        id: idx,
        emoji,
        isFlipped: false,
        isMatched: false
      }));

    setCards(deck);
    setFlippedIndices([]);
    setIsLocked(false);
    setIsComplete(false);
    setElapsedTime(0);

    stats.current = {
      flips: 0,
      matches: 0,
      errors: 0,
      repeatErrors: 0,
      corrections: 0,
      responseTimes: [],
      startTime: Date.now(),
      lastActionTime: Date.now(),
      seenCards: new Set<string>()
    };
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    const now = Date.now();
    const latency = now - stats.current.lastActionTime;
    stats.current.responseTimes.push(latency);
    stats.current.lastActionTime = now;
    stats.current.flips += 1;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [idx1, idx2] = newFlipped;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];

      const key1 = `${idx1}-${card1.emoji}`;
      const key2 = `${idx2}-${card2.emoji}`;

      if (card1.emoji === card2.emoji) {
        // MATCH!
        stats.current.matches += 1;
        setTimeout(() => {
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsLocked(false);

          // Check win condition
          if (newCards.every(c => c.isMatched)) {
            finishGame();
          }
        }, 500);
      } else {
        // MISMATCH
        stats.current.errors += 1;
        if (stats.current.seenCards.has(key1) || stats.current.seenCards.has(key2)) {
          stats.current.repeatErrors += 1;
        }
        stats.current.seenCards.add(key1);
        stats.current.seenCards.add(key2);

        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  };

  const finishGame = () => {
    setIsComplete(true);
    const now = Date.now();
    const totalTime = now - stats.current.startTime;
    const avgRt = stats.current.responseTimes.length > 0
      ? stats.current.responseTimes.reduce((a, b) => a + b, 0) / stats.current.responseTimes.length
      : 2000;

    const accuracy = stats.current.matches / Math.max(1, stats.current.matches + stats.current.errors);

    onComplete({
      accuracy: Math.min(1.0, Math.max(0.1, accuracy)),
      avg_response_time_ms: avgRt,
      repeat_errors: stats.current.repeatErrors,
      corrections: stats.current.corrections,
      completion_time_ms: totalTime,
      total_events: stats.current.flips
    });
  };

  const matchesFound = cards.filter(c => c.isMatched).length / 2;

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto py-4">
      {/* Header Info */}
      <div className="w-full cosmic-card p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-300 flex items-center gap-3">
            <span>✨</span> {t('games.memory.title', 'Memory Match')}
          </h2>
          <p className="text-lg text-slate-300 mt-1">
            {t('games.memory.instructions', 'Flip the cards to match pairs of symbols.')}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Pairs Found</span>
            <span className="text-2xl font-bold text-emerald-400">{matchesFound} / {pairCount}</span>
          </div>

          <div className="text-center px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Time</span>
            <span className="text-2xl font-bold text-indigo-300">{elapsedTime}s</span>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div
        className={`grid gap-4 w-full max-w-3xl justify-center ${
          pairCount <= 4
            ? 'grid-cols-3 sm:grid-cols-3'
            : pairCount <= 6
            ? 'grid-cols-4 sm:grid-cols-4'
            : 'grid-cols-4 sm:grid-cols-6'
        }`}
      >
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            disabled={card.isFlipped || card.isMatched || isLocked}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.04 } : {}}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.96 } : {}}
            className={`h-28 sm:h-32 w-full rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition-all duration-300 shadow-lg ${
              card.isMatched
                ? 'bg-emerald-950/80 border-2 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : card.isFlipped
                ? 'bg-indigo-950/90 border-2 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                : 'bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-400/80 text-transparent cursor-pointer'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {card.emoji}
              </motion.span>
            ) : (
              <span className="text-2xl text-indigo-400/50">✦</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
