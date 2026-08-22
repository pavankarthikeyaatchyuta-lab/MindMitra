import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronRight, Activity, Users, Brain, ListOrdered, Eye, Sparkles, X, Filter } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
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
      // Sort sessions descending by started_at
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

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'memory_match': return <Brain size={18} className="text-blue-400" />;
      case 'daily_routine': return <ListOrdered size={18} className="text-emerald-400" />;
      case 'object_recognition': return <Eye size={18} className="text-purple-400" />;
      default: return <Sparkles size={18} className="text-amber-400" />;
    }
  };

  // Group sessions by friendly date label
  const groupSessionsByDate = () => {
    const groups: Record<string, Session[]> = {
      Today: [],
      Yesterday: [],
      'Earlier This Week': [],
      'Historical Sessions': [],
    };

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    sessions.forEach(s => {
      const sDate = new Date(s.started_at);
      const sDateStr = sDate.toDateString();
      const diffDays = Math.floor((now.getTime() - sDate.getTime()) / (1000 * 3600 * 24));

      if (sDateStr === todayStr) {
        groups.Today.push(s);
      } else if (sDateStr === yesterdayStr) {
        groups.Yesterday.push(s);
      } else if (diffDays <= 7) {
        groups['Earlier This Week'].push(s);
      } else {
        groups['Historical Sessions'].push(s);
      }
    });

    return groups;
  };

  const grouped = groupSessionsByDate();

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/caregiver')} className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
              <Calendar size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Session History</h1>
              <p className="text-xs text-indigo-300">Chronological Cognitive Activity Log</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {users.length > 0 && (
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              <select
                value={selectedUserId ?? ''}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    navigate('/profiles');
                  } else {
                    const newId = Number(e.target.value);
                    setSelectedUserId(newId);
                    const user = users.find(u => u.id === newId);
                    if (user) switchProfile(user);
                  }
                }}
                className="p-2 px-3.5 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-white text-sm focus:border-indigo-400 focus:outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.name} (Age {u.age})
                  </option>
                ))}
                <option value="new">+ Add Elderly Profile</option>
              </select>
            </div>
          )}

          <CaregiverAccountMenu />
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6 w-full flex-grow">
        {/* Responsive Navigation Tabs without horizontal scrollbar */}
        <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-indigo-500/20 pb-3 text-xs sm:text-sm font-semibold">
          <Link to="/caregiver" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Overview
          </Link>
          <Link to="/session" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>Today's Session</span>
          </Link>
          <Link to="/caregiver/trends" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Trends & Adaptive AI
          </Link>
          <Link to="/caregiver/insights" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Explainable Insights
          </Link>
          <Link to="/caregiver/people" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Familiar People
          </Link>
          <Link to="/caregiver/reminders" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Reminders
          </Link>
          <Link to="/caregiver/history" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow">
            Session History
          </Link>
        </div>

        {/* Sessions Grouped List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading session history...</div>
        ) : sessions.length === 0 ? (
          <div className="cosmic-card p-12 text-center">
            <Calendar size={36} className="mx-auto text-slate-500 mb-2" />
            <p className="text-base font-bold text-white">No sessions recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Start today's cognitive session to begin tracking longitudinal history.</p>
            <button
              onClick={() => navigate('/session')}
              className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Start First Session
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([groupTitle, sessionList]) => {
              if (sessionList.length === 0) return null;

              return (
                <div key={groupTitle} className="space-y-3">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider pl-1">
                    {groupTitle} ({sessionList.length})
                  </h3>

                  <div className="space-y-2.5">
                    {sessionList.map(s => {
                      const matchingGames = gameSessions.filter(g => g.session_id === s.id);
                      const avgAcc = matchingGames.length > 0
                        ? Math.round((matchingGames.reduce((acc, g) => acc + (g.accuracy || 0), 0) / matchingGames.length) * 100)
                        : 0;
                      const sTime = new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const sDate = new Date(s.started_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                      return (
                        <div
                          key={s.id}
                          onClick={() => handleOpenDetail(s)}
                          className="cosmic-card p-4 sm:p-5 border border-indigo-500/20 hover:border-indigo-400/60 bg-slate-900/70 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                              <CheckCircle2 size={20} className="text-emerald-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm sm:text-base font-bold text-white">{sDate} at {sTime}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono">
                                  ID #{s.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {matchingGames.length}/4 cognitive activities completed
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {matchingGames.length > 0 && (
                              <div className="text-right">
                                <span className="text-xs sm:text-sm font-bold text-emerald-400">{avgAcc}%</span>
                                <span className="block text-[10px] text-slate-400">Mean Accuracy</span>
                              </div>
                            )}
                            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Drilldown Detail Modal */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cosmic-card w-full max-w-2xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl animate-fadeIn relative">
            <button
              onClick={() => setSelectedSessionDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Session Breakdown — #{selectedSessionDetail.session.id}
                </h3>
                <p className="text-xs text-indigo-300">
                  Recorded on {new Date(selectedSessionDetail.session.started_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedSessionDetail.games.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 bg-slate-900 rounded-xl text-center">
                  Individual activity breakdown not available for this legacy record.
                </p>
              ) : (
                selectedSessionDetail.games.map((g, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/20 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-bold text-white">
                        {getGameIcon(g.game_type)}
                        <span>{getGameLabel(g.game_type)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px]">
                        Level {g.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-indigo-500/10 text-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Accuracy</span>
                        <strong className="text-emerald-400 text-xs">{Math.round((g.accuracy || 0) * 100)}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Avg Latency</span>
                        <strong className="text-slate-200 text-xs">{Math.round(g.avg_response_time_ms || 0)} ms</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Repeat Errors</span>
                        <strong className="text-amber-400 text-xs">{g.repeat_errors || 0}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Corrections</span>
                        <strong className="text-blue-400 text-xs">{g.corrections || 0}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-500/20 flex justify-end">
              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
