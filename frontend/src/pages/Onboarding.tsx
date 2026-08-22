import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { User, Language } from '../types';
import { UserPlus, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Onboarding() {
  const { t, setLanguage } = useTranslation();
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [existingUsers, setExistingUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await api.getUsers();
        const unique = Array.from(new Map(users.map(item => [item.display_name, item])).values());
        setExistingUsers(unique);
      } catch {}
    }
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;

    try {
      const result = await api.createUser({
        display_name: name.trim(),
        age: parseInt(age, 10),
        preferred_language: preferredLanguage,
        voice_enabled: voiceEnabled,
      });

      const newUser: User = {
        id: result.id,
        display_name: name.trim(),
        age: parseInt(age, 10),
        preferred_language: preferredLanguage,
        voice_enabled: voiceEnabled,
        created_at: new Date().toISOString(),
      };

      setLanguage(preferredLanguage);
      setCurrentUser(newUser);
      navigate('/session');
    } catch (err) {
      const fakeUser: User = {
        id: Date.now(),
        display_name: name.trim(),
        age: parseInt(age, 10),
        preferred_language: preferredLanguage,
        voice_enabled: voiceEnabled,
        created_at: new Date().toISOString(),
      };
      setLanguage(preferredLanguage);
      setCurrentUser(fakeUser);
      navigate('/session');
    }
  };

  const handleSelectUser = (user: User) => {
    if (user.preferred_language && (user.preferred_language === 'en' || user.preferred_language === 'hi' || user.preferred_language === 'te')) {
      setLanguage(user.preferred_language as Language);
    }
    setCurrentUser(user);
    navigate('/session');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen flex items-center justify-center p-6 relative z-10"
    >
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate('/')}
          className="mb-4 inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20"
        >
          <ArrowLeft size={20} /> Back to Welcome
        </button>

        <h1 className="text-4xl font-bold text-white mb-2 text-center">User Profile</h1>
        <p className="text-lg text-indigo-200 mb-8 text-center">
          Create or choose your profile to begin cognitive activities
        </p>

        {/* Existing Users Selection */}
        {existingUsers.length > 0 && (
          <div className="mb-8 cosmic-card p-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-3">Select Existing Profile</h2>
            <div className="flex flex-col gap-3">
              {existingUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-400 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-white font-bold">
                      {user.display_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg group-hover:text-indigo-300 transition-colors">
                        {user.display_name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Age: {user.age} • Language: {user.preferred_language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Profile Form */}
        <form onSubmit={handleSubmit} className="cosmic-card p-6 flex flex-col gap-5">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-400" /> Create New Profile
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full text-lg p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 72"
              className="w-full text-lg p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Language</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPreferredLanguage('en')}
                className={`py-3 px-2 rounded-xl text-sm font-semibold border transition-all ${
                  preferredLanguage === 'en'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-900 border-indigo-500/20 text-slate-300 hover:border-indigo-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage('hi')}
                className={`py-3 px-2 rounded-xl text-sm font-semibold border transition-all ${
                  preferredLanguage === 'hi'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-900 border-indigo-500/20 text-slate-300 hover:border-indigo-400'
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage('te')}
                className={`py-3 px-2 rounded-xl text-sm font-semibold border transition-all ${
                  preferredLanguage === 'te'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-900 border-indigo-500/20 text-slate-300 hover:border-indigo-400'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-indigo-500/20">
            <div>
              <span className="text-sm font-medium text-slate-200">Voice Assistant</span>
              <p className="text-xs text-slate-400">Speak questions and feedback</p>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={e => setVoiceEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="elderly-btn-primary w-full text-xl font-bold py-4 mt-2"
          >
            Create Profile & Start
          </button>
        </form>
      </div>
    </motion.div>
  );
}
