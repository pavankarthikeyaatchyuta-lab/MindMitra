import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Users2, Sparkles, Play, ArrowLeft, CheckSquare, Square, MessageSquare, Brain, ListOrdered, Puzzle, Clock, History } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import ThemeToggle from '../components/ThemeToggle';
import { User, CommunitySession } from '../types';

export default function CommunityHub() {
  const navigate = useNavigate();
  const { caregiver } = useApp();

  const [profiles, setProfiles] = useState<User[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<number[]>([]);
  const [sessionName, setSessionName] = useState('Morning Memory Circle');
  const [selectedActivity, setSelectedActivity] = useState<'memory_circle' | 'story_chain' | 'sequence_relay' | 'conversation_circle' | 'group_puzzle'>('memory_circle');
  const [recentSessions, setRecentSessions] = useState<CommunitySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const profs = await api.getProfiles(false);
        setProfiles(profs);
        // Default select all active profiles
        setSelectedProfileIds(profs.map(p => p.id));

        if (caregiver?.id) {
          const sessions = await api.getCaregiverCommunitySessions(caregiver.id);
          setRecentSessions(sessions);
        }
      } catch (err) {
        console.error('Error loading community profiles:', err);
      }
      setLoading(false);
    }
    loadData();
  }, [caregiver]);

  const toggleProfile = (id: number) => {
    setSelectedProfileIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleStartSession = async () => {
    if (selectedProfileIds.length === 0) {
      alert('Please select at least 1 participant for the group session.');
      return;
    }

    setStarting(true);
    try {
      const newSession = await api.startCommunitySession(
        sessionName,
        selectedActivity,
        selectedProfileIds,
        `Facilitated group activity: ${selectedActivity}`
      );

      // Save active community session details to sessionStorage for the runner view
      sessionStorage.setItem('mindmitra_active_community_session', JSON.stringify({
        id: newSession.id,
        name: sessionName,
        activity_type: selectedActivity,
        profile_ids: selectedProfileIds,
        participants: profiles.filter(p => selectedProfileIds.includes(p.id))
      }));

      navigate('/community/run');
    } catch (err: any) {
      alert(`Failed to start community session: ${err.message || 'Error occurred'}`);
    }
    setStarting(false);
  };

  const activities = [
    {
      key: 'memory_circle',
      title: 'Memory Circle',
      tagline: 'Visual prompt & group recall',
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
      description: 'Display a rich visual scene for 30 seconds. Hide it and invite participants to recall details together.',
    },
    {
      key: 'story_chain',
      title: 'Story Chain',
      tagline: 'Collaborative story building',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      description: 'One participant starts a tale based on a prompt card, then passes to the next person to continue.',
    },
    {
      key: 'conversation_circle',
      title: "Today's Conversation Prompt",
      tagline: 'Facilitated discussion topic',
      icon: MessageSquare,
      color: 'from-amber-500 to-orange-600',
      description: 'Display an engaging life topic card to encourage shared storytelling and human connection.',
    },
    {
      key: 'sequence_relay',
      title: 'Sequence Relay',
      tagline: 'Pass-and-play step ordering',
      icon: ListOrdered,
      color: 'from-emerald-500 to-teal-600',
      description: 'Pass the device around to order sequence cards (e.g. Traditional Recipe or Morning Walk steps).',
    },
    {
      key: 'group_puzzle',
      title: 'Group Visual Puzzle',
      tagline: 'Shared problem solving',
      icon: Puzzle,
      color: 'from-cyan-500 to-blue-600',
      description: 'Identify hidden patterns or complete image puzzles as a group.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150">
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/caregiver')}
            className="text-slate-900 dark:text-slate-300 hover:text-black dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            title="Back to Caregiver Overview"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white">MindMitra Community</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                Low-Screen Group Engagement
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              Facilitate group activities on a single shared device • LOOK → THINK → TALK → SHARE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <CaregiverAccountMenu />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Main Banner */}
        <div className="card p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border-indigo-500/30 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
              <Users2 size={14} /> Facilitated Shared-Device Sessions
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">One Facilitator • One Screen • Multiple Participants</h2>
            <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-4">
              Community Mode encourages older adults to look up from screens and interact directly with each other. The device acts as a visual prompt and turn coordinator.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Session Creator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Name & Activity Picker */}
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">1</span>
                <span>Configure Community Session</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Session Title / Group Name
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Morning Memory Circle"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Select Group Activity
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activities.map((act) => {
                      const Icon = act.icon;
                      const isSelected = selectedActivity === act.key;
                      return (
                        <div
                          key={act.key}
                          onClick={() => setSelectedActivity(act.key as any)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 hover:border-indigo-400'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center font-black shadow-xs shrink-0`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{act.title}</h4>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{act.tagline}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-normal">
                            {act.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Select Participants */}
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">2</span>
                  <span>Select Group Participants ({selectedProfileIds.length} Selected)</span>
                </h3>

                <button
                  onClick={() => {
                    if (selectedProfileIds.length === profiles.length) {
                      setSelectedProfileIds([]);
                    } else {
                      setSelectedProfileIds(profiles.map(p => p.id));
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {selectedProfileIds.length === profiles.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {profiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profiles.map((p) => {
                    const isChecked = selectedProfileIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProfile(p.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center">
                            {(p.display_name || p.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block text-slate-900 dark:text-white">
                              {p.display_name || p.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                              Age {p.age || '—'}
                            </span>
                          </div>
                        </div>

                        {isChecked ? (
                          <CheckSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square size={18} className="text-slate-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No elderly profiles created yet. Create profiles in the Caregiver Overview first.
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleStartSession}
                  disabled={starting || selectedProfileIds.length === 0}
                  className="elderly-btn-primary py-3.5 px-8 text-sm font-extrabold rounded-2xl flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Play size={18} fill="currentColor" />
                  <span>{starting ? 'Starting Session...' : 'Start Group Session'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Past Community Sessions */}
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <History size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Recent Group History</span>
                </h3>
              </div>

              {recentSessions.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-extrabold text-slate-900 dark:text-white">{s.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {s.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
                        {new Date(s.started_at).toLocaleDateString()} • {s.participant_count || 0} Participants
                      </p>

                      {s.participants && s.participants.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {s.participants.map((p, pi) => (
                            <span key={pi} className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              {p.profile_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <Clock size={28} className="mx-auto mb-2 opacity-50" />
                  No completed group sessions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
