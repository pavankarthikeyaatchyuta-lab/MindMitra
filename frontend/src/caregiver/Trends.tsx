import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Clock, ShieldCheck, Users, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import { User, TrendData, AdaptiveDecision, GameSession } from '../types';

export default function Trends() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();
  const { currentUser, switchProfile, logout } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [adaptiveHistory, setAdaptiveHistory] = useState<AdaptiveDecision[]>([]);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);

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
  }, [profileId]);

  useEffect(() => {
    if (!selectedUserId) return;
    async function loadData() {
      try {
        const [ah, gs, t] = await Promise.all([
          api.getAdaptiveHistory(selectedUserId!),
          api.getUserGameSessions(selectedUserId!),
          api.getTrends(selectedUserId!),
        ]);
        setAdaptiveHistory(ah);
        setGameSessions(gs);
        setTrends(t);
      } catch (err) {
        console.log('Could not load trends data');
      }
    }
    loadData();
  }, [selectedUserId]);

  // Aggregate multi-game longitudinal timeline
  const sessionsByNumber: Record<number, any> = {};
  gameSessions.forEach((gs, idx) => {
    const sNum = Math.floor(idx / 4) + 1;
    if (!sessionsByNumber[sNum]) {
      sessionsByNumber[sNum] = { session: `S${sNum}` };
    }
    if (gs.game_type === 'memory_match') {
      sessionsByNumber[sNum].memory_acc = Math.round((gs.accuracy || 0) * 100);
      sessionsByNumber[sNum].memory_diff = gs.difficulty || 1;
    } else if (gs.game_type === 'daily_routine') {
      sessionsByNumber[sNum].routine_acc = Math.round((gs.accuracy || 0) * 100);
      sessionsByNumber[sNum].routine_diff = gs.difficulty || 1;
    } else if (gs.game_type === 'object_recognition') {
      sessionsByNumber[sNum].recognition_acc = Math.round((gs.accuracy || 0) * 100);
      sessionsByNumber[sNum].recognition_diff = gs.difficulty || 1;
    } else if (gs.game_type === 'pattern_recall') {
      sessionsByNumber[sNum].pattern_acc = Math.round((gs.accuracy || 0) * 100);
      sessionsByNumber[sNum].pattern_diff = gs.difficulty || 1;
    }
  });

  const timelineData = Object.values(sessionsByNumber);

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/caregiver')} className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Longitudinal Trends & Adaptive ML</h1>
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

      <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
        {/* Responsive Navigation Tabs without horizontal scrollbar */}
        <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-indigo-500/20 pb-3 text-xs sm:text-sm font-semibold">
          <Link to="/caregiver" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Overview
          </Link>
          <Link to="/session" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>Today's Session</span>
          </Link>
          <Link to="/caregiver/trends" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow">
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
          <Link to="/caregiver/history" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Session History
          </Link>
        </div>

        {/* 1. Multi-Domain Performance Trends Chart */}
        <div className="cosmic-card p-6">
          <h2 className="text-xl font-bold text-white mb-2">Cognitive Domain Performance Over Time</h2>
          <p className="text-sm text-slate-400 mb-6">4 domains tracked simultaneously across demo historical sessions</p>

          <div className="h-[340px] w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="session" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc' }} />
                  <Legend />
                  <Line type="monotone" dataKey="memory_acc" stroke="#60a5fa" name="Short-Term Memory" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="routine_acc" stroke="#34d399" name="Sequential Memory" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="recognition_acc" stroke="#fbbf24" name="Visual Recognition" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pattern_acc" stroke="#c084fc" name="Pattern Recall" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No longitudinal session data available.
              </div>
            )}
          </div>
        </div>

        {/* 2. Difficulty Trajectory Chart */}
        <div className="cosmic-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={22} className="text-amber-400" />
            <h2 className="text-xl font-bold text-white">Adaptive Difficulty Trajectory</h2>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Observes how the adaptive machine learning model calibrated difficulty levels (Level 1 to 4) over time
          </p>

          <div className="h-[280px] w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="session" stroke="#94a3b8" />
                  <YAxis domain={[1, 4]} stroke="#94a3b8" ticks={[1, 2, 3, 4]} unit=" Level" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc' }} />
                  <Legend />
                  <Line type="stepAfter" dataKey="memory_diff" stroke="#60a5fa" name="Memory Level" strokeWidth={2.5} />
                  <Line type="stepAfter" dataKey="routine_diff" stroke="#34d399" name="Routine Level" strokeWidth={2.5} />
                  <Line type="stepAfter" dataKey="recognition_diff" stroke="#fbbf24" name="Recognition Level" strokeWidth={2.5} />
                  <Line type="stepAfter" dataKey="pattern_diff" stroke="#c084fc" name="Pattern Level" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No difficulty trajectory data recorded.
              </div>
            )}
          </div>
        </div>

        {/* 3. "Why Did Difficulty Change?" Caregiver Explanation Section */}
        <div className="cosmic-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={22} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Why Did Difficulty Change? (AI Decision Log)</h2>
          </div>

          <div className="flex flex-col gap-3">
            {adaptiveHistory.slice(0, 6).map(dec => {
              const isInc = dec.recommendation === 'increase';
              const isDec = dec.recommendation === 'decrease';

              return (
                <div
                  key={dec.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isInc
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : isDec
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : 'bg-slate-900/60 border-indigo-500/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-white capitalize">
                        {dec.game_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                        Level {dec.previous_difficulty} → Level {dec.recommended_difficulty}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                        isInc ? 'bg-emerald-900 text-emerald-300' : isDec ? 'bg-amber-900 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {dec.recommendation}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 mt-1">
                      <strong>AI Decision:</strong> {dec.reason || 'Difficulty calibrated based on response latency and accuracy patterns.'}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 shrink-0 text-right">
                    <p>Model: {dec.model_used.toUpperCase()} (Confidence: {(dec.confidence * 100).toFixed(0)}%)</p>
                    <p className="text-slate-500">{new Date(dec.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}

            {adaptiveHistory.length === 0 && (
              <p className="text-slate-400 text-center py-4">No adaptive decisions logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
