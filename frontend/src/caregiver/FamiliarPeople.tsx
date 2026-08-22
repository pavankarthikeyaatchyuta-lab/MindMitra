import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Edit2, ShieldCheck, Upload, AlertCircle, CheckCircle, Users, Sparkles, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import { User, FamiliarPerson } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function FamiliarPeople() {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId?: string }>();
  const { currentUser, switchProfile, logout } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [people, setPeople] = useState<FamiliarPerson[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
    loadPeople();
  }, [selectedUserId]);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const data = await api.getFamiliarPeople(selectedUserId!);
      setPeople(data);
    } catch (err) {
      console.log('Error loading familiar people');
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Image size is too large (Maximum 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (img.width < 120 || img.height < 120) {
          setValidationError('Please upload a clearer photo with one visible face.');
          return;
        }
        setPhotoUrl(result);
      };
      img.onerror = () => {
        setValidationError('Please upload a clearer photo with one visible face.');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim() || !relationship.trim()) {
      setValidationError('Name and relationship are required.');
      return;
    }

    if (!photoUrl) {
      setValidationError('Please upload a clear photograph of the family member.');
      return;
    }

    if (!consentConfirmed) {
      setValidationError('Please confirm consent permission before saving.');
      return;
    }

    try {
      if (editingId) {
        await api.updateFamiliarPerson(editingId, {
          name: name.trim(),
          relationship: relationship.trim(),
          photo_url: photoUrl,
          consent_confirmed: consentConfirmed,
        });
      } else {
        await api.addFamiliarPerson({
          user_id: selectedUserId!,
          name: name.trim(),
          relationship: relationship.trim(),
          photo_url: photoUrl,
          consent_confirmed: consentConfirmed,
        });
      }

      setName('');
      setRelationship('');
      setPhotoUrl('');
      setConsentConfirmed(false);
      setEditingId(null);
      setShowAddModal(false);
      loadPeople();
    } catch (err) {
      setValidationError('Failed to save familiar person. Try again.');
    }
  };

  const handleEdit = (person: FamiliarPerson) => {
    setEditingId(person.id);
    setName(person.name);
    setRelationship(person.relationship);
    setPhotoUrl(person.photo_url);
    setConsentConfirmed(person.consent_confirmed);
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this familiar person profile?')) return;
    try {
      await api.deleteFamiliarPerson(id);
      loadPeople();
    } catch (err) {
      console.log('Error deleting person');
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Navbar */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/caregiver')} className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-900/60 border border-indigo-500/20">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Familiar People</h1>
              <p className="text-xs text-indigo-300">Caregiver Recognition Setup</p>
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
          <Link to="/caregiver/people" className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white shadow">
            Familiar People
          </Link>
          <Link to="/caregiver/reminders" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Reminders
          </Link>
          <Link to="/caregiver/history" className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-indigo-500/20 transition-all">
            Session History
          </Link>
        </div>

        {/* Privacy Banner */}
        <div className="cosmic-card p-4 border border-indigo-500/30 bg-indigo-950/40 flex items-center gap-3">
          <ShieldCheck size={28} className="text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm text-slate-200">
            <strong>Strict Privacy Guarantee:</strong> Uploaded family photographs are private session data stored locally. They are <strong>never sent to Gemini or external LLMs</strong>, never used for training AI models, and never exposed publicly.
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Family & Familiar Faces for {selectedUser?.display_name || 'User'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Configured profiles used in Test 3 (Object & Familiar Person Recognition). Minimum 3 people recommended for 4-choice recognition.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setName('');
              setRelationship('');
              setPhotoUrl('');
              setConsentConfirmed(false);
              setValidationError(null);
              setShowAddModal(true);
            }}
            className="elderly-btn-primary flex items-center gap-2 text-base py-3 px-6 min-h-[48px] shrink-0"
          >
            <UserPlus size={20} /> Add Familiar Person
          </button>
        </div>

        {/* Status indicator badge */}
        <div className="flex items-center gap-2">
          {people.length >= 3 ? (
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5">
              🟢 {people.length} people configured — Familiar Person Recognition active in Test 3
            </span>
          ) : people.length > 0 ? (
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1.5">
              🟡 {people.length} configured — Add {3 - people.length} more for full 4-choice recognition
            </span>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-semibold flex items-center gap-1.5">
              ⚪ Not configured — Object recognition will run standalone until family members are added
            </span>
          )}
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {people.map(person => (
            <div key={person.id} className="cosmic-card p-6 flex flex-col items-center text-center relative border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-lg">
              <div className="w-32 h-32 rounded-2xl overflow-hidden mb-4 border-2 border-indigo-400/60 bg-slate-900 shadow-md">
                <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" />
              </div>

              <h3 className="text-2xl font-bold text-white">{person.name}</h3>
              <p className="text-base text-indigo-300 font-semibold mt-0.5">{person.relationship}</p>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => handleEdit(person)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 text-slate-300 hover:text-white text-sm"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/30 hover:border-rose-400 text-rose-400 text-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}

          {people.length === 0 && !loading && (
            <div className="col-span-full cosmic-card p-12 text-center text-slate-400">
              No familiar people configured for {selectedUser?.display_name}. Click "+ Add Familiar Person" above to upload photos.
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="cosmic-card p-8 max-w-lg w-full bg-slate-950 border border-indigo-500/40 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  {editingId ? 'Edit Familiar Person' : 'Add Familiar Person'}
                </h3>
                <p className="text-sm text-slate-400 mb-5">
                  Provide name, relationship, and a clear face photo.
                </p>

                {validationError && (
                  <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-sm flex items-center gap-2">
                    <AlertCircle size={20} className="shrink-0 text-rose-400" />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleSavePerson} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anita Kumar"
                      className="w-full p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Daughter, Son, Wife, Brother, Friend"
                      className="w-full p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-white focus:border-indigo-400 focus:outline-none text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Upload Face Photograph
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    />

                    {photoUrl && (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20">
                        <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-indigo-400" />
                        <div>
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={14} /> Photo verified
                          </span>
                          <span className="text-xs text-slate-400">Click upload to replace</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Required Exact Consent Checkbox */}
                  <div className="flex items-start gap-3 p-3.5 bg-slate-900/90 rounded-xl border border-indigo-500/30">
                    <input
                      type="checkbox"
                      id="consentCheck"
                      checked={consentConfirmed}
                      onChange={(e) => setConsentConfirmed(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />
                    <label htmlFor="consentCheck" className="text-xs text-slate-200 leading-snug cursor-pointer">
                      I confirm that I have permission to use this person's photo for this private recognition activity.
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="elderly-btn-primary py-2.5 px-6 min-h-[44px] text-base font-bold"
                    >
                      Save Person
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
