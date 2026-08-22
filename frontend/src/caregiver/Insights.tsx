import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, ListOrdered, Eye, Sparkles, AlertCircle, Loader2, Users, ShieldCheck, Info } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import { User, TrendData } from '../types';
import { motion } from 'framer-motion';

const DOMAIN_ICONS: Record<string, string> = {
  short_term_memory: '🧠',
  sequential_episodic_memory: '📋',
  visual_familiar_recognition: '🔍',
  pattern_attention: '✨',
  memory_match: '🧠',
  daily_routine: '📋',
  object_recognition: '🔍',
  pattern_recall: '✨',
};

const DOMAIN_LABELS: Record<string, string> = {
  short_term_memory: 'Short-Term Memory',
  sequential_episodic_memory: 'Sequential / Episodic Memory',
  visual_familiar_recognition: 'Visual & Familiar-Person Recognition',
  pattern_attention: 'Pattern Recognition & Attention',
  memory_match: 'Short-Term Memory',
  daily_routine: 'Sequential / Episodic Memory',
  object_recognition: 'Visual & Familiar-Person Recognition',
  pattern_recall: 'Pattern Recognition & Attention',
};

const STATUS_BADGES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  stable: { color: 'text-indigo-300', bg: 'bg-indigo-950/60', border: 'border-indigo-500/30', label: 'Stable' },
  improving: { color: 'text-emerald-300', bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', label: 'Improving' },
  recent_change: { color: 'text-amber-300', bg: 'bg-amber-950/60', border: 'border-amber-500/40', label: 'Recent Change' },
  variable: { color: 'text-purple-300', bg: 'bg-purple-950/60', border: 'border-purple-500/40', label: 'Variable' },
  observation_available: { color: 'text-blue-300', bg: 'bg-blue-950/60', border: 'border-blue-500/30', label: 'Observation Available' },
  insufficient_history: { color: 'text-slate-400', bg: 'bg-slate-900/60', border: 'border-slate-700', label: 'Insufficient History' },
};

export default function Insights() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();
  const { currentUser, switchProfile, logout } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [explanations, setExplanations] = useState<Record<string, { text: string; provider: string }>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);
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
  }, [profileId]);

  useEffect(() => {
    if (!selectedUserId) return;
    async function loadData() {
      setLoading(true);
      try {
        const [t, insights] = await Promise.all([
          api.getTrends(selectedUserId!),
          api.getAllInsights(selectedUserId!),
        ]);
        setTrends(t);

        const expMap: Record<string, { text: string; provider: string }> = {};
        for (const ins of insights) {
          expMap[ins.domain || ins.game_type || ''] = {
            text: ins.insight,
            provider: ins.provider || 'gemini-2.0-flash',
          };
        }
        setExplanations(expMap);
      } catch (err) {
        console.log('Could not load insights');
      }
      setLoading(false);
    }
    loadData();
  }, [selectedUserId]);

  const generateExplanation = async (t: TrendData) => {
    setLoadingExplanation(t.domain);
    try {
      const result = await api.explainInsight(t.domain, t.trend, t.observation_note || '');
      setExplanations(prev => ({
        ...prev,
        [t.domain]: {
          text: result.explanation,
          provider: result.provider || 'gemini-2.0-flash',
        },
      }));
    } catch {
      setExplanations(prev => ({
        ...prev,
        [t.domain]: {
          text: `Recent performance in ${t.domain_label || t.domain} differs from the user's established baseline. Prototype behavioral insight — not a medical diagnosis.`,
          provider: 'deterministic_template',
        },
      }));
    }
    setLoadingExplanation(null);
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/caregiver')} className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Explainable AI Insights</h1>
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

      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
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
          <Link to="/caregiver/insights" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow">
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <span className="ml-3 text-xl text-slate-300">Analyzing structured observations...</span>
          </div>
        ) : trends.length === 0 ? (
          <div className="cosmic-card p-12 text-center text-slate-400 text-xl">
            No cognitive domain data available yet. Complete daily sessions to see insights.
          </div>
        ) : (
          trends.map((t, idx) => {
            const badge = STATUS_BADGES[t.trend] || STATUS_BADGES.insufficient_history;
            const expObj = explanations[t.domain] || explanations[t.game_type];
            const isRecentChange = t.trend === 'recent_change';

            return (
              <motion.div
                key={t.domain || t.game_type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`cosmic-card overflow-hidden border-2 ${
                  isRecentChange ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-indigo-500/30'
                }`}
              >
                {/* Header */}
                <div className={`p-5 flex items-center justify-between border-b ${
                  isRecentChange ? 'bg-amber-950/30 border-amber-500/30' : 'bg-slate-900/40 border-indigo-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{t.domain_icon || DOMAIN_ICONS[t.domain] || '📊'}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t.domain_label || DOMAIN_LABELS[t.domain] || t.game_type}</h3>
                      <p className="text-xs text-slate-400">Cognitive domain behavioral telemetry</p>
                    </div>
                  </div>

                  <span className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${badge.border} ${badge.bg} ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Evidence Body */}
                <div className="p-6">
                  {t.trend !== 'insufficient_history' ? (
                    <>
                      {/* Stat Metrics Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 uppercase">Current Performance</p>
                          <p className="text-2xl font-bold text-white">
                            {t.current_performance != null ? `${Math.round(t.current_performance * 100)}%` : '—'}
                          </p>
                        </div>
                        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 uppercase">Personal Baseline</p>
                          <p className="text-2xl font-bold text-indigo-300">
                            {t.baseline != null ? `${Math.round(t.baseline * 100)}%` : '—'}
                          </p>
                        </div>
                        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 uppercase">Baseline Deviation</p>
                          <p className={`text-2xl font-bold ${t.deviation && t.deviation < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {t.deviation != null ? `${t.deviation > 0 ? '+' : ''}${Math.round(t.deviation * 100)}%` : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Structured Observation Note */}
                      <div className="mb-6 p-4 bg-slate-900/80 rounded-2xl border border-indigo-500/30">
                        <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2 text-sm">
                          <Info size={16} /> Structured Observation:
                        </h4>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {t.observation_note || 'Performance is consistent with the established personal baseline.'}
                        </p>
                      </div>

                      {/* AI Caregiver Explanation (3-tier cascade) */}
                      <div className="bg-indigo-950/40 rounded-2xl p-5 border border-indigo-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-indigo-300" />
                            <h4 className="font-bold text-indigo-200 text-sm">Caregiver Natural Language Explanation</h4>
                          </div>
                          {expObj && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300 font-mono">
                              Model: {expObj.provider}
                            </span>
                          )}
                        </div>

                        {expObj ? (
                          <p className="text-slate-200 text-base leading-relaxed">{expObj.text}</p>
                        ) : loadingExplanation === t.domain ? (
                          <div className="flex items-center gap-2 text-indigo-300 py-2">
                            <Loader2 size={18} className="animate-spin" />
                            Synthesizing caregiver explanation...
                          </div>
                        ) : (
                          <button
                            onClick={() => generateExplanation(t)}
                            className="text-indigo-300 hover:text-indigo-100 font-semibold text-sm underline flex items-center gap-1.5 py-1"
                          >
                            <span>✨</span> Generate AI Explanation →
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400 text-center py-4">
                      Collecting sessions to establish a reliable personal baseline.
                    </p>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="px-6 pb-4">
                  <p className="text-xs text-slate-400/80 italic flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-indigo-400" />
                    Prototype behavioral insight — not a medical diagnosis.
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
