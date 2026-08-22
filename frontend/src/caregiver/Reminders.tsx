import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pill, Droplets, Calendar, Activity, Plus, Trash2, ShieldCheck, Users, Check, Power, Volume2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import { User, Reminder, Language } from '../types';
import { useVoice } from '../hooks/useVoice';
import { useTranslation } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reminders() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();
  const { currentUser, switchProfile, logout } = useApp();
  const { speak } = useVoice();
  const { language } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  // Form State
  const [type, setType] = useState('medication');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [repeatPattern, setRepeatPattern] = useState('Daily');

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
    loadReminders();
  }, [selectedUserId]);

  const loadReminders = async () => {
    try {
      const data = await api.getReminders(selectedUserId!);
      setReminders(data);
    } catch {
      console.log('Error loading reminders');
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.createReminder({
        user_id: selectedUserId!,
        type,
        title: title.trim(),
        time,
        repeat_pattern: repeatPattern,
        enabled: true,
      });

      setTitle('');
      setShowAdd(false);
      loadReminders();
    } catch {
      console.log('Error saving reminder');
    }
  };

  const handleToggleEnabled = async (rem: Reminder) => {
    if (!rem.id) return;
    try {
      await api.updateReminder(rem.id, {
        ...rem,
        enabled: !rem.enabled,
      });
      loadReminders();
    } catch {
      console.log('Error toggling reminder');
    }
  };

  const handleSpeakReminder = async (rem: Reminder) => {
    if (!rem.id) return;
    setSpeakingId(rem.id);

    const targetUser = users.find(u => u.id === selectedUserId);
    const userLang = (targetUser?.preferred_language as Language) || language;

    let phrase = rem.title;
    if (rem.type === 'medication') {
      phrase = userLang === 'te'
        ? `నమస్కారం, మీ ${rem.title} తీసుకునే సమయం అయింది.`
        : userLang === 'hi'
        ? `नमस्ते, आपकी ${rem.title} का समय हो गया है।`
        : `Hello, it is time for your ${rem.title}.`;
    } else if (rem.type === 'hydration') {
      phrase = userLang === 'te'
        ? 'దయచేసి కొంచెం మంచి నీరు త్రాగండి.'
        : userLang === 'hi'
        ? 'कृपया थोड़ा ताजा पानी पिएं।'
        : 'Please take a sip of fresh water.';
    } else {
      phrase = userLang === 'te'
        ? `జ్ఞాపిక: ${rem.title}`
        : userLang === 'hi'
        ? `अनुस्मारक: ${rem.title}`
        : `Reminder: ${rem.title}`;
    }

    await speak(phrase, userLang);
    setSpeakingId(null);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await api.deleteReminder(id);
      loadReminders();
    } catch {}
  };

  const getIcon = (t: string) => {
    switch (t) {
      case 'medication': return <Pill size={24} className="text-rose-400" />;
      case 'hydration': return <Droplets size={24} className="text-cyan-400" />;
      case 'calendar': return <Calendar size={24} className="text-amber-400" />;
      default: return <Activity size={24} className="text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/caregiver')} className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Reminders & Daily Schedule</h1>
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
          <Link to="/caregiver/insights" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Explainable Insights
          </Link>
          <Link to="/caregiver/people" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Familiar People
          </Link>
          <Link to="/caregiver/reminders" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow">
            Reminders
          </Link>
          <Link to="/caregiver/history" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Session History
          </Link>
        </div>

        {/* Action Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Daily Routine & Health Alerts</h2>
            <p className="text-sm text-slate-400">Gentle multilingual voice alerts scheduled for elderly assistance</p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="elderly-btn-primary flex items-center gap-2 text-base py-3 px-5 min-h-[48px]"
          >
            <Plus size={20} /> Add Reminder
          </button>
        </div>

        {/* Reminders List */}
        <div className="flex flex-col gap-3">
          {reminders.map(rem => (
            <div
              key={rem.id}
              className={`cosmic-card p-5 flex items-center justify-between gap-4 border transition-all ${
                rem.enabled ? 'border-indigo-500/30' : 'border-slate-800 opacity-60 bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20">
                  {getIcon(rem.type)}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${rem.enabled ? 'text-white' : 'text-slate-400 line-through'}`}>
                    {rem.title}
                  </h3>
                  <p className="text-sm text-indigo-300">
                    {rem.time} • Repeat: {rem.repeat_pattern}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSpeakReminder(rem)}
                  disabled={speakingId === rem.id}
                  className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 hover:text-white hover:bg-indigo-900 flex items-center gap-1.5 text-xs font-semibold"
                  title="Test spoken alert in user language"
                >
                  <Volume2 size={16} className={speakingId === rem.id ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
                  <span className="hidden sm:inline">Play Voice Alert</span>
                </button>

                <button
                  onClick={() => handleToggleEnabled(rem)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    rem.enabled
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                  title="Click to toggle active state"
                >
                  <Power size={13} />
                  {rem.enabled ? 'Active' : 'Paused'}
                </button>

                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-2 rounded-lg bg-slate-900 border border-rose-500/30 text-rose-400 hover:border-rose-400"
                  title="Delete Reminder"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {reminders.length === 0 && (
            <div className="cosmic-card p-12 text-center text-slate-400">
              No reminders scheduled. Click "+ Add Reminder" to schedule daily hydration, medication, or walk alerts.
            </div>
          )}
        </div>

        {/* Add Reminder Modal */}
        <AnimatePresence>
          {showAdd && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="cosmic-card p-8 max-w-lg w-full bg-slate-950 border border-indigo-500/40 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Add Routine Reminder</h3>
                <form onSubmit={handleAddReminder} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none"
                    >
                      <option value="medication">💊 Medication</option>
                      <option value="hydration">💧 Hydration (Drink Water)</option>
                      <option value="activity">🚶 Activity / Walk</option>
                      <option value="calendar">📅 Appointment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Reminder Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Afternoon Blood Pressure Tablet"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Repeat</label>
                      <select
                        value={repeatPattern}
                        onChange={(e) => setRepeatPattern(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Every 2 Hours">Every 2 Hours</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Once">Once</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdd(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="elderly-btn-primary py-2.5 px-6 min-h-[44px] text-base font-bold"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
