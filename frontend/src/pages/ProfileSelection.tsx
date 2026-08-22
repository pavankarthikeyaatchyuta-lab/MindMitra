import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Brain, ArrowRight, ShieldCheck, MoreVertical, Edit2, Archive, Trash2, RotateCcw, Download, Search, Volume2, Globe, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';

export default function ProfileSelection() {
  const navigate = useNavigate();
  const { caregiver, currentUser, switchProfile } = useApp();
  
  const [activeProfiles, setActiveProfiles] = useState<any[]>([]);
  const [archivedProfiles, setArchivedProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [archivingProfile, setArchivingProfile] = useState<any | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<any | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State (for Create & Edit)
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState<number | ''>(70);
  const [formLanguage, setFormLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [formVoice, setFormVoice] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllProfiles = async () => {
    setLoading(true);
    try {
      const [actives, archives] = await Promise.all([
        api.getProfiles(false),
        api.getArchivedProfiles(),
      ]);
      setActiveProfiles(actives);
      setArchivedProfiles(archives);
    } catch (err) {
      console.log('Error loading profiles');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllProfiles();
  }, []);

  const handleSelectProfile = (profile: any) => {
    switchProfile(profile);
    navigate('/caregiver');
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const created = await api.createProfile({
        name: formName.trim(),
        age: Number(formAge) || 70,
        preferred_language: formLanguage,
        voice_enabled: formVoice,
      });

      setShowAddModal(false);
      setFormName('');
      showToast(`${created.name} added successfully.`);
      await loadAllProfiles();
      switchProfile(created);
      navigate('/caregiver');
    } catch {
      showToast('Failed to create profile.');
    }
  };

  const handleOpenEdit = (profile: any) => {
    setActionMenuOpenId(null);
    setEditingProfile(profile);
    setFormName(profile.name || profile.display_name);
    setFormAge(profile.age);
    setFormLanguage(profile.preferred_language || 'en');
    setFormVoice(profile.voice_enabled ?? true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !formName.trim()) return;

    try {
      await api.updateProfile(editingProfile.id, {
        name: formName.trim(),
        age: Number(formAge) || 70,
        preferred_language: formLanguage,
        voice_enabled: formVoice,
      });

      showToast(`Profile updated for ${formName}.`);
      setEditingProfile(null);
      await loadAllProfiles();
    } catch {
      showToast('Failed to update profile.');
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingProfile) return;
    try {
      await api.archiveProfile(archivingProfile.id);
      showToast(`${archivingProfile.name || archivingProfile.display_name} archived.`);
      setArchivingProfile(null);
      if (currentUser && currentUser.id === archivingProfile.id) {
        switchProfile(null);
      }
      await loadAllProfiles();
    } catch {
      showToast('Failed to archive profile.');
    }
  };

  const handleRestore = async (profile: any) => {
    try {
      await api.restoreProfile(profile.id);
      showToast(`${profile.name || profile.display_name} restored to active profiles.`);
      await loadAllProfiles();
    } catch {
      showToast('Failed to restore profile.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProfile) return;
    const expectedName = (deletingProfile.name || deletingProfile.display_name).trim().toLowerCase();
    if (deleteConfirmInput.trim().toLowerCase() !== expectedName) return;

    try {
      await api.deleteProfilePermanently(deletingProfile.id);
      showToast(`${deletingProfile.name || deletingProfile.display_name} permanently deleted.`);
      setDeletingProfile(null);
      setDeleteConfirmInput('');
      if (currentUser && currentUser.id === deletingProfile.id) {
        switchProfile(null);
      }
      await loadAllProfiles();
    } catch {
      showToast('Failed to delete profile.');
    }
  };

  const handleExportData = async (profile: any) => {
    setActionMenuOpenId(null);
    try {
      const data = await api.exportProfileData(profile.id);
      const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonStr);
      downloadAnchor.setAttribute('download', `mindmitra_${profile.name || 'profile'}_export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported data for ${profile.name || profile.display_name}.`);
    } catch {
      showToast('Failed to export profile data.');
    }
  };

  const displayedProfiles = (activeTab === 'active' ? activeProfiles : archivedProfiles).filter(p => {
    const pName = (p.name || p.display_name || '').toLowerCase();
    return pName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen relative z-10 flex flex-col justify-between p-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-indigo-950 border border-indigo-400 text-white text-sm font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Account Menu */}
      <header className="flex justify-between items-center py-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MindMitra</h1>
            <p className="text-xs text-indigo-300">Caregiver Multi-Profile Hub</p>
          </div>
        </div>

        <CaregiverAccountMenu />
      </header>

      {/* Main Section */}
      <main className="my-8 flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Who are you caring for today?
          </h2>
          <p className="text-indigo-200 mt-2 text-base max-w-xl">
            Select an elderly profile. All game sessions, baselines, and family memories remain completely isolated.
          </p>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-indigo-500/30">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'active'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Profiles ({activeProfiles.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'archived'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Archived ({archivedProfiles.length})
            </button>
          </div>

          {(activeProfiles.length > 2 || archivedProfiles.length > 0) && (
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-white text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
          )}
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {displayedProfiles.map((p) => {
            const isSelected = currentUser && currentUser.id === p.id;
            const isMenuOpen = actionMenuOpenId === p.id;

            return (
              <div
                key={p.id}
                className={`cosmic-card p-6 border-2 transition-all relative flex flex-col justify-between group ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-950/40 shadow-xl shadow-indigo-500/20'
                    : 'border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-900/90'
                }`}
              >
                {/* Card Top: Avatar, Lang Badge, and [ ⋮ ] Action Menu */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      onClick={() => activeTab === 'active' && handleSelectProfile(p)}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-md cursor-pointer"
                    >
                      {p.name ? p.name.charAt(0) : p.display_name?.charAt(0) || '👤'}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300 font-mono uppercase">
                        {p.preferred_language || 'EN'}
                      </span>

                      {/* Action Menu Trigger */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(isMenuOpen ? null : p.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 border border-indigo-500/20 text-slate-400 hover:text-white hover:border-indigo-400"
                          title="Profile Options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Action Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl p-1.5 z-40 text-xs animate-fadeIn"
                          >
                            {activeTab === 'active' ? (
                              <>
                                <button
                                  onClick={() => handleSelectProfile(p)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-900 font-medium"
                                >
                                  <ArrowRight size={14} className="text-indigo-400" />
                                  <span>Open Profile</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-900 font-medium"
                                >
                                  <Edit2 size={14} className="text-indigo-400" />
                                  <span>Edit Profile</span>
                                </button>
                                <button
                                  onClick={() => handleExportData(p)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-900 font-medium"
                                >
                                  <Download size={14} className="text-indigo-400" />
                                  <span>Export Data (JSON)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActionMenuOpenId(null);
                                    setArchivingProfile(p);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-950/40 font-medium"
                                >
                                  <Archive size={14} />
                                  <span>Archive Profile</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setActionMenuOpenId(null);
                                  handleRestore(p);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-950/40 font-medium"
                              >
                                <RotateCcw size={14} />
                                <span>Restore Profile</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-indigo-500/20" />

                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                setDeletingProfile(p);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 font-bold"
                            >
                              <Trash2 size={14} />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3
                    onClick={() => activeTab === 'active' && handleSelectProfile(p)}
                    className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {p.name || p.display_name}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Age {p.age} • Voice: {p.voice_enabled ? 'ON' : 'OFF'}
                  </p>
                </div>

                {/* Card Bottom CTA */}
                <div className="mt-6 pt-4 border-t border-indigo-500/20 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {activeTab === 'active' ? 'Elderly Profile' : 'Archived Profile'}
                  </span>

                  {activeTab === 'active' ? (
                    <button
                      onClick={() => handleSelectProfile(p)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-400/40 text-xs font-bold text-indigo-200 hover:text-white transition-all"
                    >
                      <span>Open Profile</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(p)}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <RotateCcw size={14} />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* + Add Elderly Profile Card (Only shown in Active tab) */}
          {activeTab === 'active' && (
            <div
              onClick={() => {
                setFormName('');
                setFormAge(70);
                setShowAddModal(true);
              }}
              className="cosmic-card p-6 border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[220px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-110 group-hover:text-white transition-all mb-3">
                <Plus size={28} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                + Add Elderly Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add a family member or senior to monitor
              </p>
            </div>
          )}
        </div>

        {/* Empty State Active */}
        {displayedProfiles.length === 0 && activeTab === 'active' && (
          <div className="p-12 text-center text-slate-400 cosmic-card w-full mt-4">
            <User size={36} className="mx-auto text-slate-500 mb-2" />
            <p className="text-lg font-bold text-white">No elderly profiles yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add a profile to begin a personalized cognitive support journey.
            </p>
            <button
              onClick={() => {
                setFormName('');
                setFormAge(70);
                setShowAddModal(true);
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg"
            >
              + Add Elderly Profile
            </button>
          </div>
        )}

        {/* Empty State Archived */}
        {displayedProfiles.length === 0 && activeTab === 'archived' && (
          <div className="p-12 text-center text-slate-400 cosmic-card w-full mt-4">
            <Archive size={36} className="mx-auto text-slate-500 mb-2" />
            <p className="text-base font-bold text-white">No archived profiles</p>
            <p className="text-xs text-slate-400 mt-1">Archived family profiles will appear here for easy restoration.</p>
          </div>
        )}
      </main>

      {/* 1. Add / Edit Profile Modal */}
      {(showAddModal || editingProfile) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cosmic-card w-full max-w-md p-6 border border-indigo-500/40 shadow-2xl animate-fadeIn relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingProfile(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold text-white mb-1">
              {editingProfile ? 'Edit Elderly Profile' : 'Create Elderly Profile'}
            </h3>
            <p className="text-xs text-indigo-300 mb-6">
              {editingProfile
                ? 'Update details while preserving all historical sessions, baselines, and memories.'
                : 'Establish a new independent longitudinal cognitive profile.'}
            </p>

            <form onSubmit={editingProfile ? handleSaveEdit : handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Senior's Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="70"
                  min="50"
                  max="120"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Preferred Spoken & UI Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'hi', label: 'हिंदी (Hindi)' },
                    { id: 'te', label: 'తెలుగు (Telugu)' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setFormLanguage(l.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        formLanguage === l.id
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-slate-900 border-indigo-500/20 text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/70 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Volume2 size={18} className="text-indigo-400" />
                  <span>Voice Guidance (TTS)</span>
                </div>
                <input
                  type="checkbox"
                  checked={formVoice}
                  onChange={(e) => setFormVoice(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProfile(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 font-semibold hover:bg-slate-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg text-sm"
                >
                  {editingProfile ? 'Save Changes' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Archive Confirmation Modal */}
      {archivingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cosmic-card w-full max-w-md p-6 border border-amber-500/40 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-3 text-amber-400">
              <Archive size={26} />
              <h3 className="text-2xl font-bold text-white">Archive {archivingProfile.name || archivingProfile.display_name}?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              This hides the profile from active care selection. All historical session telemetry, baselines, trends, reminders, and familiar photos are <strong>fully preserved</strong> and can be restored at any time.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setArchivingProfile(null)}
                className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 font-semibold hover:bg-slate-800 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveConfirm}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow"
              >
                Archive Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Permanent Deletion Modal with Strict Confirmation Requirement */}
      {deletingProfile && (() => {
        const pName = deletingProfile.name || deletingProfile.display_name;
        const matches = deleteConfirmInput.trim().toLowerCase() === pName.trim().toLowerCase();

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="cosmic-card w-full max-w-md p-6 border border-red-500/50 shadow-2xl animate-fadeIn">
              <div className="flex items-center gap-3 mb-3 text-red-400">
                <AlertTriangle size={26} />
                <h3 className="text-2xl font-bold text-white">Delete Permanently?</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                This will permanently erase <strong>{pName}</strong> and all associated sessions, gameplay metrics, baselines, trends, reminders, familiar people, and photos. <span className="text-red-400 font-semibold">This action cannot be undone.</span>
              </p>

              <div className="mb-5 p-3.5 bg-slate-900 rounded-xl border border-red-500/30">
                <label className="block text-[11px] text-slate-400 mb-1.5">
                  Type <span className="text-white font-bold font-mono">"{pName}"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={pName}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-400 font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeletingProfile(null);
                    setDeleteConfirmInput('');
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 font-semibold hover:bg-slate-800 text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={!matches}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow transition-all ${
                    matches
                      ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                      : 'bg-red-950/40 text-slate-500 border border-red-950 cursor-not-allowed'
                  }`}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-indigo-500/20 flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-emerald-400" />
        <span>One Caregiver Account • Multiple Isolated Elderly Profiles • Longitudinal Privacy Guaranteed</span>
      </footer>
    </div>
  );
}
