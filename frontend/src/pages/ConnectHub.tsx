import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, PhoneCall, PhoneOff, Mic, Plus, Users, Shield, Heart, Music, Sparkles, BookOpen, Trash2, ArrowLeft, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import ThemeToggle from '../components/ThemeToggle';
import { User, TrustedConnection, MemoryStory } from '../types';

export default function ConnectHub() {
  const navigate = useNavigate();
  const { currentProfile, caregiver } = useApp();

  const [connections, setConnections] = useState<TrustedConnection[]>([]);
  const [stories, setStories] = useState<MemoryStory[]>([]);
  const [activeCallContact, setActiveCallContact] = useState<TrustedConnection | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Daughter');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryText, setNewStoryText] = useState('');
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProfile?.id) return;
    loadData();
  }, [currentProfile]);

  const loadData = async () => {
    if (!currentProfile?.id) return;
    setLoading(true);
    try {
      const [conns, stors] = await Promise.all([
        api.getProfileConnections(currentProfile.id),
        api.getProfileStories(currentProfile.id),
      ]);
      setConnections(conns);
      setStories(stors);
    } catch (err) {
      console.error('Error loading connect data:', err);
    }
    setLoading(false);
  };

  const handleStartCall = (contact: TrustedConnection) => {
    setActiveCallContact(contact);
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    setActiveCallContact(null);
  };

  const handleAddContact = async () => {
    if (!currentProfile?.id || !newContactName) return;
    try {
      await api.addTrustedConnection({
        profile_id: currentProfile.id,
        contact_name: newContactName,
        relationship: newContactRel,
        phone_or_address: newContactPhone,
      });
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContactModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error adding contact: ${err.message}`);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    try {
      await api.deleteTrustedConnection(id);
      loadData();
    } catch (err: any) {
      alert(`Error deleting connection: ${err.message}`);
    }
  };

  const handleAddStory = async () => {
    if (!currentProfile?.id || !newStoryTitle) return;
    try {
      await api.createMemoryStory({
        profile_id: currentProfile.id,
        title: newStoryTitle,
        transcript_text: newStoryText,
        category: 'Life Memory',
        is_private: true,
      });
      setNewStoryTitle('');
      setNewStoryText('');
      setShowAddStoryModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error saving story: ${err.message}`);
    }
  };

  const interestCircles = [
    { title: 'Traditional Music & Bhajans', category: 'Music', icon: Music, color: 'from-purple-500 to-indigo-600', members: '12 Seniors' },
    { title: 'Childhood & Village Stories', category: 'Stories', icon: BookOpen, color: 'from-amber-500 to-orange-600', members: '18 Seniors' },
    { title: 'Gardening & Herbal Plants', category: 'Gardening', icon: Sparkles, color: 'from-emerald-500 to-teal-600', members: '9 Seniors' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150">
      {/* Top Navbar */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/caregiver')}
            className="text-slate-900 dark:text-slate-300 hover:text-black dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            title="Back to Overview"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white">Trusted Connect Mode</h1>
              {currentProfile && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                  {currentProfile.display_name || currentProfile.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              Voice-First Trusted Connections & Memory Story Recordings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <CaregiverAccountMenu />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Active Voice Call Modal Banner */}
        {activeCallContact && (
          <div className="card p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-emerald-400/30 animate-pulse">
                <PhoneCall size={26} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                  {callStatus === 'calling' ? 'Ringing Contact...' : 'Voice Call Connected'}
                </span>
                <h2 className="text-xl font-black text-white">{activeCallContact.contact_name}</h2>
                <p className="text-xs text-emerald-100 font-medium">{activeCallContact.relationship} • Safe Trusted Connection</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleEndCall}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center gap-2 shadow-lg"
              >
                <PhoneOff size={18} />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Trusted Voice Contacts & Memory Stories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trusted Voice Connections Card */}
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Phone className="text-emerald-600 dark:text-emerald-400" size={20} />
                    <span>Trusted Voice Connections</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Caregiver-approved family members & care contacts
                  </p>
                </div>

                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-extrabold flex items-center gap-1 border border-slate-300 dark:border-slate-700"
                >
                  <Plus size={15} />
                  <span>Add Contact</span>
                </button>
              </div>

              {connections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center">
                          {conn.contact_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{conn.contact_name}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                            {conn.relationship} • Approved
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartCall(conn)}
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-xs"
                          title="Call Contact"
                        >
                          <PhoneCall size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(conn.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Shield size={32} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">No trusted connections added yet</p>
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="elderly-btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Trusted Family Contact
                  </button>
                </div>
              )}
            </div>

            {/* My Memory Stories Card */}
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="text-amber-600 dark:text-amber-400" size={20} />
                    <span>My Memory Stories</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Private audio & text recordings for {currentProfile?.display_name || currentProfile?.name || 'Elderly Profile'}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddStoryModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1 shadow-xs"
                >
                  <Mic size={15} />
                  <span>Record Story</span>
                </button>
              </div>

              {stories.length > 0 ? (
                <div className="space-y-3">
                  {stories.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{st.title}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                          {st.category || 'Life Memory'}
                        </span>
                      </div>
                      {st.transcript_text && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                          "{st.transcript_text}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        <Volume2 size={14} className="text-amber-500" />
                        <span>Private Family Story • Recorded on {new Date(st.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">
                  No memory stories recorded yet. Tap "Record Story" to preserve a childhood or family story.
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Interest Circles */}
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                <span>Social Interest Circles</span>
              </h3>

              <div className="space-y-3">
                {interestCircles.map((circle, ci) => {
                  const Icon = circle.icon;
                  return (
                    <div key={ci} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${circle.color} text-white flex items-center justify-center font-bold shadow-xs shrink-0`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white">{circle.title}</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{circle.members}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Add Contact */}
        {showAddContactModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl">
              <h3 className="text-base font-extrabold">Add Trusted Family Contact</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  placeholder="e.g. Anitha Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Primary Caregiver">Primary Caregiver</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="elderly-btn-primary text-xs py-2 px-5 rounded-xl"
                >
                  Save Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Story */}
        {showAddStoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl">
              <h3 className="text-base font-extrabold">Record Private Memory Story</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Story Title</label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  placeholder="e.g. My First Harvest Festival"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Story Transcript / Notes</label>
                <textarea
                  rows={3}
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
                  placeholder="Write or transcribe the memory story..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddStoryModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStory}
                  className="elderly-btn-primary text-xs py-2 px-5 rounded-xl"
                >
                  Save Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
