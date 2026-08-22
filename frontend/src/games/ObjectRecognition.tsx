import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { CheckCircle2, XCircle, ShieldCheck, Heart, User, Users, Info, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { FamiliarPerson } from '../types';

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

interface QuestionItem {
  id: string;
  type: 'object' | 'person';
  question: string;
  targetEmojiOrPhoto: string;
  isPhotoUrl?: boolean;
  personId?: number;
  options: {
    id: string;
    display: string; // Emoji for object, or Name text for person
    isCorrect: boolean;
  }[];
}

// Level 1: Highly familiar distinct objects (3 choices)
const LEVEL_1_QUESTIONS: QuestionItem[] = [
  {
    id: 'obj-1',
    type: 'object',
    question: 'Which one is the Apple?',
    targetEmojiOrPhoto: '🍎',
    options: [
      { id: '1a', display: '🍎', isCorrect: true },
      { id: '1b', display: '🪑', isCorrect: false },
      { id: '1c', display: '⏰', isCorrect: false },
    ]
  },
  {
    id: 'obj-2',
    type: 'object',
    question: 'Which one is the Chair?',
    targetEmojiOrPhoto: '🪑',
    options: [
      { id: '2a', display: '☕', isCorrect: false },
      { id: '2b', display: '🪑', isCorrect: true },
      { id: '2c', display: '🍌', isCorrect: false },
    ]
  },
  {
    id: 'obj-3',
    type: 'object',
    question: 'Which one is the Cup of Tea?',
    targetEmojiOrPhoto: '☕',
    options: [
      { id: '3a', display: '🕯️', isCorrect: false },
      { id: '3b', display: '👓', isCorrect: false },
      { id: '3c', display: '☕', isCorrect: true },
    ]
  }
];

// Level 2: Visually similar distractors (4 choices)
const LEVEL_2_QUESTIONS: QuestionItem[] = [
  {
    id: 'obj-4',
    type: 'object',
    question: 'Which one is the Apple?',
    targetEmojiOrPhoto: '🍎',
    options: [
      { id: '4a', display: '🍅', isCorrect: false }, // Tomato
      { id: '4b', display: '🍎', isCorrect: true },  // Apple
      { id: '4c', display: '🔴', isCorrect: false }, // Red ball
      { id: '4d', display: '🍊', isCorrect: false }  // Orange
    ]
  },
  {
    id: 'obj-5',
    type: 'object',
    question: 'Which one is the Teapot?',
    targetEmojiOrPhoto: '🫖',
    options: [
      { id: '5a', display: '☕', isCorrect: false },
      { id: '5b', display: '🫖', isCorrect: true },
      { id: '5c', display: '🥛', isCorrect: false },
      { id: '5d', display: '🥤', isCorrect: false }
    ]
  },
  {
    id: 'obj-6',
    type: 'object',
    question: 'Which one is the Clock?',
    targetEmojiOrPhoto: '⏰',
    options: [
      { id: '6a', display: '⏱️', isCorrect: false },
      { id: '6b', display: '⌚', isCorrect: false },
      { id: '6c', display: '⏰', isCorrect: true },
      { id: '6d', display: '🧭', isCorrect: false }
    ]
  }
];

// Level 3: Contextual / Semantic clues (4 choices)
const LEVEL_3_QUESTIONS: QuestionItem[] = [
  {
    id: 'obj-7',
    type: 'object',
    question: 'Which item is commonly used to prepare tea?',
    targetEmojiOrPhoto: '🫖',
    options: [
      { id: '7a', display: '🫖', isCorrect: true },
      { id: '7b', display: '🥣', isCorrect: false },
      { id: '7c', display: '🥢', isCorrect: false },
      { id: '7d', display: '🥄', isCorrect: false }
    ]
  },
  {
    id: 'obj-8',
    type: 'object',
    question: 'Which item protects you when it rains?',
    targetEmojiOrPhoto: '☂️',
    options: [
      { id: '8a', display: '🧥', isCorrect: false },
      { id: '8b', display: '🕶️', isCorrect: false },
      { id: '8c', display: '☂️', isCorrect: true },
      { id: '8d', display: '👒', isCorrect: false }
    ]
  },
  {
    id: 'obj-9',
    type: 'object',
    question: 'Which item provides light in the evening?',
    targetEmojiOrPhoto: '🕯️',
    options: [
      { id: '9a', display: '🕯️', isCorrect: true },
      { id: '9b', display: '🪞', isCorrect: false },
      { id: '9c', display: '🪴', isCorrect: false },
      { id: '9d', display: '🖼️', isCorrect: false }
    ]
  }
];

export default function ObjectRecognition({ difficulty, userId, gameSessionId, onComplete }: GameProps) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [familiarStatus, setFamiliarStatus] = useState<string | null>(null);

  const stats = useRef({
    correctAnswers: 0,
    errors: 0,
    corrections: 0,
    repeatConfusion: 0,
    responseTimes: [] as number[],
    startTime: 0,
    lastActionTime: 0,
    seenOptions: new Set<string>()
  });

  useEffect(() => {
    async function loadQuestions() {
      // Pick object questions based on difficulty (Level 1: 3 options, Level 2: 4 options, Level 3: semantic 4 options)
      let pool = difficulty <= 1 ? LEVEL_1_QUESTIONS : difficulty === 2 ? LEVEL_2_QUESTIONS : LEVEL_3_QUESTIONS;
      let combined: QuestionItem[] = [...pool.slice(0, 2)];

      // Check for caregiver-configured familiar people
      try {
        const familiar = await api.getFamiliarPeople(userId);
        if (!familiar || familiar.length === 0) {
          setFamiliarStatus('Familiar Person Recognition is not configured for this profile.');
        } else if (familiar.length < 3) {
          setFamiliarStatus(`Familiar Person Recognition requires 3 or more configured family members (currently ${familiar.length} configured).`);
          
          // Generate round with available names + distractors
          const person = familiar[0];
          const distractorNames = ['Anita Kumar', 'Ramesh Kumar', 'Lakshmi Devi', 'Suresh Kumar'].filter(n => n !== person.name);
          const optionNames = Array.from(new Set([person.name, ...distractorNames])).slice(0, 4);

          const personRound: QuestionItem = {
            id: `person-${person.id}`,
            type: 'person',
            question: 'Who is this?',
            targetEmojiOrPhoto: person.photo_url,
            isPhotoUrl: true,
            personId: person.id,
            options: optionNames.sort(() => Math.random() - 0.5).map((name, optIdx) => ({
              id: `popt-${optIdx}`,
              display: name,
              isCorrect: name === person.name
            }))
          };
          combined.push(personRound);
        } else {
          setFamiliarStatus(null);
          // Pick 1-2 random familiar people
          const shuffledFamiliar = [...familiar].sort(() => Math.random() - 0.5);
          const selectedPeople = shuffledFamiliar.slice(0, Math.min(2, familiar.length));

          selectedPeople.forEach((person, pIdx) => {
            const otherNames = familiar.filter(f => f.id !== person.id).map(f => f.name);
            const extraDistractors = ['Anita Kumar', 'Ramesh Kumar', 'Lakshmi Devi', 'Suresh Kumar', 'Meera Devi', 'Rajiv Kumar'];
            const optionNames = Array.from(new Set([
              person.name,
              ...otherNames,
              ...extraDistractors.filter(n => n !== person.name && !otherNames.includes(n))
            ])).slice(0, 4);

            combined.push({
              id: `person-${person.id}-${pIdx}`,
              type: 'person',
              question: 'Who is this?',
              targetEmojiOrPhoto: person.photo_url,
              isPhotoUrl: true,
              personId: person.id,
              options: optionNames.sort(() => Math.random() - 0.5).map((name, optIdx) => ({
                id: `popt-${pIdx}-${optIdx}`,
                display: name,
                isCorrect: name === person.name
              }))
            });
          });
        }
      } catch (err) {
        setFamiliarStatus('Familiar Person Recognition is not configured for this profile.');
      }

      setQuestions(combined.sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setFeedback(null);
      setIsLocked(false);

      stats.current = {
        correctAnswers: 0,
        errors: 0,
        corrections: 0,
        repeatConfusion: 0,
        responseTimes: [],
        startTime: Date.now(),
        lastActionTime: Date.now(),
        seenOptions: new Set<string>()
      };
    }

    loadQuestions();
  }, [difficulty, userId, gameSessionId]);

  const handleSelectOption = (option: QuestionItem['options'][0]) => {
    if (isLocked) return;

    const now = Date.now();
    const latency = now - stats.current.lastActionTime;
    stats.current.responseTimes.push(latency);
    stats.current.lastActionTime = now;

    setSelectedOptionId(option.id);
    setIsLocked(true);

    if (option.isCorrect) {
      stats.current.correctAnswers += 1;
      setFeedback('correct');
    } else {
      stats.current.errors += 1;
      if (stats.current.seenOptions.has(option.display)) {
        stats.current.repeatConfusion += 1;
      }
      stats.current.seenOptions.add(option.display);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOptionId(null);
        setFeedback(null);
        setIsLocked(false);
      } else {
        finishGame();
      }
    }, 1200);
  };

  const finishGame = () => {
    const now = Date.now();
    const totalTime = now - stats.current.startTime;
    const avgRt = stats.current.responseTimes.length > 0
      ? stats.current.responseTimes.reduce((a, b) => a + b, 0) / stats.current.responseTimes.length
      : 2100;

    const totalEvents = stats.current.correctAnswers + stats.current.errors;
    const accuracy = stats.current.correctAnswers / Math.max(1, totalEvents);

    onComplete({
      accuracy: Math.min(1.0, Math.max(0.1, accuracy)),
      avg_response_time_ms: avgRt,
      repeat_errors: stats.current.repeatConfusion,
      corrections: stats.current.corrections,
      completion_time_ms: totalTime,
      total_events: totalEvents
    });
  };

  if (questions.length === 0) {
    return (
      <div className="cosmic-card p-12 text-center text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Preparing recognition activity...
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="w-full cosmic-card p-6 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-300 flex items-center gap-3">
            <span>🔍</span> Object & Familiar Person Recognition
          </h2>
          <p className="text-lg text-slate-300 mt-1">
            {currentQ.type === 'person'
              ? 'Observe the photograph and identify the familiar person.'
              : 'Choose the image that answers the question. (Images only)'}
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20 text-indigo-300 font-bold text-lg">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Non-blocking Notice if Familiar People not configured */}
      {familiarStatus && (
        <div className="w-full mb-4 p-3 bg-slate-900/80 border border-indigo-500/30 rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
          <Info size={16} className="text-indigo-400 shrink-0" />
          <span>{familiarStatus} Caregivers can configure family photos in the Caregiver dashboard.</span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="w-full cosmic-card p-8 flex flex-col items-center shadow-2xl">
        {/* Question Title */}
        <h3 className="text-3xl font-bold text-white mb-8 text-center max-w-2xl">
          {currentQ.question}
        </h3>

        {/* Part B: Familiar Person Photo (NO name displayed near photo) */}
        {currentQ.type === 'person' && (
          <div className="flex flex-col items-center mb-8">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.35)] bg-slate-900 flex items-center justify-center">
              <img
                src={currentQ.targetEmojiOrPhoto}
                alt="Familiar Person"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-300/80 mt-3 bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
              <ShieldCheck size={14} className="text-emerald-400" />
              Private caregiver photograph • Not shared with external AI
            </div>
          </div>
        )}

        {/* Options Grid (Part A: Images Only with NO labels; Part B: 4 Name options) */}
        <div
          className={`w-full max-w-2xl grid gap-5 ${
            currentQ.type === 'person' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {currentQ.options.map(option => {
            const isSelected = selectedOptionId === option.id;

            let cardStyle = 'bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800 text-white';
            if (isSelected) {
              if (feedback === 'correct') {
                cardStyle = 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.4)]';
              } else if (feedback === 'incorrect') {
                cardStyle = 'bg-rose-950/90 border-2 border-rose-500 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.4)]';
              }
            }

            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={isLocked}
                whileHover={!isLocked ? { scale: 1.04 } : {}}
                whileTap={!isLocked ? { scale: 0.96 } : {}}
                className={`p-6 rounded-2xl flex flex-col items-center justify-center transition-all min-h-[130px] cursor-pointer shadow-lg ${cardStyle}`}
              >
                {currentQ.type === 'person' ? (
                  <span className="text-2xl font-bold tracking-wide">{option.display}</span>
                ) : (
                  // Part A: Image/Emoji Only — NO visible text name!
                  <span className="text-6xl sm:text-7xl">{option.display}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Immediate Feedback */}
        <div className="h-10 mt-6 flex items-center justify-center">
          <AnimatePresence>
            {feedback === 'correct' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-emerald-400 font-bold text-2xl"
              >
                <CheckCircle2 size={28} /> Excellent!
              </motion.div>
            )}
            {feedback === 'incorrect' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-rose-400 font-bold text-2xl"
              >
                <XCircle size={28} /> Let's keep exploring!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
