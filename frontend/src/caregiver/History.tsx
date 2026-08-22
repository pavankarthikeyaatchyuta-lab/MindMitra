import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronRight, Activity, Users, Brain, ListOrdered, Eye, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import ThemeToggle from '../components/ThemeToggle';
import { User, Session, GameSession } from '../types';

export default function History() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();
  const { currentUser, switchProfile } = useApp();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<{ session: Session; games: GameSession[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const profiles = await api.getProfiles(false);
        setUsers(profiles);
        if (profileId) {
          const targetId = Number(profileId);
          setSelectedUserId(targetId);
          const found = profiles.find(p => p.id === targetId);
          if (found) switchProfile(found);
        } else if (currentUser) {
          setSelectedUserId(currentUser.id);
        } else if (profiles.length > 0) {
          setSelectedUserId(profiles[0].id);
          switchProfile(profiles[0]);
        }
      } catch {}
    }
    init();
  }, [profileId, currentUser]);

  useEffect(() => {
    if (!selectedUserId) return;
    loadHistory();
  }, [selectedUserId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [sList, gList] = await Promise.all([
        api.getUserSessions(selectedUserId!),
        api.getUserGameSessions(selectedUserId!),
      ]);
      const sorted = (sList || []).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      setSessions(sorted);
      setGameSessions(gList || []);
    } catch {
      console.log('Error loading history');
    }
    setLoading(false);
  };

  const handleOpenDetail = (session: Session) => {
    const matchingGames = gameSessions.filter(g => g.session_id === session.id);
    setSelectedSessionDetail({ session, games: matchingGames });
  };

  const getGameLabel = (type: string) => {
    switch (type) {
      case 'memory_match': return 'Memory Match (Short-Term)';
      case 'daily_routine': return 'Daily Routine Recall (Sequential)';
      case 'object_recognition': return 'Object & Face Recognition (Visual)';
      case 'pattern_recall': return 'Pattern Recall (Attention)';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150">
      {/* Top Navbar */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/caregiver')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            title="Back to Overview"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Session History</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Complete timeline of recorded cognitive sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {users.length > 0 && (
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
              <select
                value={selectedUserId ?? ''}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  setSelectedUserId(newId);
                  const u = users.find(user => user.id === newId);
                  if (u) switchProfile(u);
                }}
                className="p-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.display_name || u.name}</option>
                ))}
              </select>
            </div>
          )}

          <ThemeToggle />
          <CaregiverAccountMenu />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs sm:text-sm font-semibold">
          <Link to="/caregiver" className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
            Overview
          </Link>
          <Link to="/session" className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>Today's Session</span>
          </Link>
          <Link to="/caregiver/trends" className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
            Trends & Adaptive AI
          </Link>
          <Link to="/caregiver/insights" className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
            Explainable Insights
          </Link>
          <Link to="/caregiver/people" className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
            Familiar People
          </Link>
          <Link to="/caregiver/reminders" className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all">
            Reminders
          </Link>
          <Link to="/caregiver/history" className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
            Session History
          </Link>
        </div>

        {/* Sessions List */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recorded Sessions ({sessions.length})</h2>

          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((s) => {
                const sGames = gameSessions.filter(g => g.session_id === s.id);
                const avgScore = sGames.length > 0
                  ? Math.round((sGames.reduce((acc, g) => acc + (g.accuracy || 0), 0) / sGames.length) * 100)
                  : null;

                return (
                  <div
                    key={s.id}
                    onClick={() => handleOpenDetail(s)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        #{s.id}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Session #{s.id} — {new Date(s.started_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {sGames.length} activities completed • {s.status === 'completed' ? 'Completed ✓' : 'In Progress'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {avgScore != null && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {avgScore}% Avg
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No sessions found for this profile.
            </div>
          )}
        </div>

        {/* Session Detail Modal */}
        {selectedSessionDetail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="card max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Session #{selectedSessionDetail.session.id} Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Recorded on {new Date(selectedSessionDetail.session.started_at).toLocaleString()}
              </p>

              <div className="space-y-3">
                {selectedSessionDetail.games.map((g, gi) => (
                  <div key={gi} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{getGameLabel(g.game_type)}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Level {g.difficulty || 1} • {Math.round((g.avg_response_time_ms || 0) / 1000)}s latency
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {Math.round((g.accuracy || 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSessionDetail(null)}
                  className="elderly-btn-primary text-xs py-2 px-5 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
