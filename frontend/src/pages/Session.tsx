import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Brain, ListOrdered, Search, Sparkles, CheckCircle, ChevronRight, ArrowLeft, Play, ShieldCheck, Clock, Users } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';

const ACTIVITIES = [
  {
    id: 'memory',
    type: 'memory_match',
    title: 'Memory Match',
    domain: 'Short-Term Memory',
    desc: 'Match familiar celestial and daily symbols to stimulate working memory.',
    icon: Brain,
    emoji: '🧠',
  },
  {
    id: 'routine',
    type: 'daily_routine',
    title: 'Daily Routine Recall',
    domain: 'Sequential & Episodic Memory',
    desc: 'Reconstruct logical sequences of familiar daily tasks and morning rituals.',
    icon: ListOrdered,
    emoji: '📋',
  },
  {
    id: 'recognition',
    type: 'object_recognition',
    title: 'Object & Familiar Person Recognition',
    domain: 'Visual & Face Recognition',
    desc: 'Identify everyday household objects and caregiver-uploaded family photos.',
    icon: Search,
    emoji: '🔍',
  },
  {
    id: 'pattern',
    type: 'pattern_recall',
    title: 'Pattern Recall',
    domain: 'Pattern Recognition & Attention',
    desc: 'Observe symbol patterns and test sustained attention and recall speed.',
    icon: Sparkles,
    emoji: '✨',
  },
];

export default function Session() {
  const { t } = useTranslation();
  const { profileId } = useParams<{ profileId?: string }>();
  const { currentUser, setCurrentUser, switchProfile, currentSession, setCurrentSession, currentDifficulty } = useApp();
  const navigate = useNavigate();

  const [completedGames, setCompletedGames] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('mindmitra_completed_games');
    return saved ? JSON.parse(saved) : [];
  });
  const [sessionId, setSessionId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('mindmitra_session_id');
    return saved ? Number(saved) : null;
  });
  const [starting, setStarting] = useState(false);

  // Initialize or recover active profile
  useEffect(() => {
    async function recoverProfile() {
      if (profileId) {
        try {
          const profile = await api.getProfile(Number(profileId));
          if (profile) switchProfile(profile);
        } catch {}
      } else if (!currentUser) {
        try {
          const profiles = await api.getProfiles(false);
          if (profiles && profiles.length > 0) {
            switchProfile(profiles[0]);
          }
        } catch {}
      }
    }
    recoverProfile();
  }, [profileId]);

  // Ensure active session exists in backend/sessionStorage
  useEffect(() => {
    async function initSession() {
      if (!sessionId && currentUser) {
        try {
          const result = await api.startSession(currentUser.id);
          setSessionId(result.id);
          sessionStorage.setItem('mindmitra_session_id', String(result.id));
          setCurrentSession({
            id: result.id,
            user_id: currentUser.id,
            started_at: new Date().toISOString(),
            completed_at: null,
            status: 'active',
          });
        } catch (err) {
          const fallbackId = Date.now();
          setSessionId(fallbackId);
          sessionStorage.setItem('mindmitra_session_id', String(fallbackId));
          setCurrentSession({
            id: fallbackId,
            user_id: currentUser.id,
            started_at: new Date().toISOString(),
            completed_at: null,
            status: 'active',
          });
        }
      }
    }
    initSession();
  }, [currentUser]);

  // Check if any game was completed in previous step
  useEffect(() => {
    ACTIVITIES.forEach(a => {
      if (sessionStorage.getItem(`mindmitra_game_done_${a.id}`) === 'true') {
        setCompletedGames(prev => {
          if (!prev.includes(a.id)) {
            const next = [...prev, a.id];
            sessionStorage.setItem('mindmitra_completed_games', JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    });
  }, []);

  const handleLaunchGame = async (gameId: string) => {
    setStarting(true);
    let activeSid = sessionId;

    // Ensure session ID is valid before launching
    if (!activeSid) {
      const uid = currentUser ? currentUser.id : 1;
      try {
        const res = await api.startSession(uid);
        activeSid = res.id;
      } catch {
        activeSid = Date.now();
      }
      setSessionId(activeSid);
      sessionStorage.setItem('mindmitra_session_id', String(activeSid));
      setCurrentSession({
        id: activeSid,
        user_id: uid,
        started_at: new Date().toISOString(),
        completed_at: null,
        status: 'active',
      });
    }

    sessionStorage.setItem('mindmitra_last_game', gameId);
    navigate(`/games/${gameId}`);
  };

  const handleStartFirstUnfinished = () => {
    const nextUnfinished = ACTIVITIES.find(a => !completedGames.includes(a.id));
    if (nextUnfinished) {
      handleLaunchGame(nextUnfinished.id);
    } else {
      handleLaunchGame('memory');
    }
  };

  const allCompleted = ACTIVITIES.every(g => completedGames.includes(g.id));

  const handleCompleteSession = async () => {
    if (sessionId) {
      try {
        await api.completeSession(sessionId);
      } catch {}
    }
    sessionStorage.removeItem('mindmitra_completed_games');
    sessionStorage.removeItem('mindmitra_session_id');
    ACTIVITIES.forEach(a => sessionStorage.removeItem(`mindmitra_game_done_${a.id}`));
    navigate('/session/complete');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 md:p-12 relative z-10"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/caregiver"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/80 rounded-xl border border-indigo-500/30 text-xs sm:text-sm font-semibold transition-all shadow"
            >
              <ArrowLeft size={16} /> Back to Overview
            </Link>

            {currentUser && (
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                👤 {currentUser.display_name || currentUser.name} (Age {currentUser.age})
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
            Today's Cognitive Exploration
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* Primary Quick Start CTA */}
          {!allCompleted && (
            <div className="mt-6">
              <button
                onClick={handleStartFirstUnfinished}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-lg sm:text-xl font-bold shadow-xl shadow-indigo-600/30 inline-flex items-center gap-3 transition-all transform hover:scale-105"
              >
                <Play size={24} fill="currentColor" />
                <span>
                  {completedGames.length === 0 ? "Start Today's Session" : `Continue Session (${completedGames.length}/4 Completed)`}
                </span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </header>

        {/* 4 Activities List */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {ACTIVITIES.map((activity, index) => {
            const isCompleted = completedGames.includes(activity.id);
            const diff = currentDifficulty[activity.type as keyof typeof currentDifficulty] || 1;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`cosmic-card p-5 sm:p-7 border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-indigo-500/30 hover:border-indigo-400 bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl text-3xl shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-900/60 border border-emerald-400/40 text-emerald-300'
                        : 'bg-indigo-900/40 border border-indigo-400/30 text-indigo-200'
                    }`}>
                      {isCompleted ? '✓' : activity.emoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{activity.title}</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-semibold font-mono">
                          Level {diff}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-300/90 mt-0.5">{activity.domain}</p>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{activity.desc}</p>
                    </div>
                  </div>

                  <div className="flex sm:justify-end shrink-0">
                    {!isCompleted ? (
                      <button
                        onClick={() => handleLaunchGame(activity.id)}
                        className="elderly-btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base py-3 px-6 rounded-xl"
                      >
                        <span>Play Activity</span>
                        <ChevronRight size={18} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-5 py-2.5 rounded-xl w-full sm:w-auto justify-center">
                        <CheckCircle size={18} /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion Action */}
        <div className="mt-10 text-center">
          {allCompleted ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleCompleteSession}
              className="elderly-btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 text-xl sm:text-2xl font-bold py-5 px-10 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 mx-auto"
            >
              <span>✨ Complete Session & View Insights</span>
            </motion.button>
          ) : (
            <div className="text-slate-400 text-xs sm:text-sm">
              {completedGames.length} of {ACTIVITIES.length} activities completed today
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
