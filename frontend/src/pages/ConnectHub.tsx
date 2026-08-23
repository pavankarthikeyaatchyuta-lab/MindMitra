import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Plus,
  Users,
  Shield,
  Heart,
  Music,
  Sparkles,
  BookOpen,
  Trash2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  Play,
  Square,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useCall } from '../context/CallContext';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import ThemeToggle from '../components/ThemeToggle';
import { User, TrustedConnection, MemoryStory } from '../types';

export default function ConnectHub() {
  const navigate = useNavigate();
  const { currentProfile, caregiver } = useApp();
  const { startCall, callState, activeCall } = useCall();

  const [connections, setConnections] = useState<TrustedConnection[]>([]);
  const [stories, setStories] = useState<MemoryStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactPresence, setContactPresence] = useState<Record<number, boolean>>({});

  // --- CONTACT MODAL STATE ---
  const [contactType, setContactType] = useState<'mindmitra_user' | 'external'>('mindmitra_user');
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Neighbor');
  const [newContactCaregiver, setNewContactCaregiver] = useState('Atchyuta Pavan Karthikeya');
  const [newContactTargetId, setNewContactTargetId] = useState<number>(2);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // --- EXTERNAL PHONE CALL MODAL ---
  const [selectedPhoneContact, setSelectedPhoneContact] = useState<TrustedConnection | null>(null);

  // --- REAL MICROPHONE RECORDING STATE ---
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryCategory, setNewStoryCategory] = useState('Childhood & Village');
  const [newStoryText, setNewStoryText] = useState('');
  const [isRecordingStory, setIsRecordingStory] = useState(false);
  const [recordTimerSeconds, setRecordTimerSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);

  // --- INTEREST CIRCLE MODAL STATE ---
  const [selectedCircle, setSelectedCircle] = useState<any | null>(null);

  useEffect(() => {
    if (!currentProfile?.id) return;
    loadData();

    const presenceInterval = setInterval(checkPresences, 3000);
    return () => clearInterval(presenceInterval);
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

      // Check online presence for contacts
      const presenceMap: Record<number, boolean> = {};
      for (const conn of conns) {
        const targetId = conn.target_user_id || conn.contact_user_id || conn.profile_id;
        if (targetId) {
          try {
            const pres = await api.getCallPresence(targetId);
            presenceMap[conn.id] = pres.online;
          } catch {
            presenceMap[conn.id] = false;
          }
        }
      }
      setContactPresence(presenceMap);
    } catch (err) {
      console.error('Error loading connect data:', err);
    }
    setLoading(false);
  };

  const checkPresences = async () => {
    if (!connections.length) return;
    const presenceMap: Record<number, boolean> = { ...contactPresence };
    for (const conn of connections) {
      const targetId = conn.target_user_id || conn.contact_user_id || conn.profile_id;
      if (targetId) {
        try {
          const pres = await api.getCallPresence(targetId);
          presenceMap[conn.id] = pres.online;
        } catch {
          presenceMap[conn.id] = false;
        }
      }
    }
    setContactPresence(presenceMap);
  };

  // --- ADD CONTACT HANDLER ---
  const handleAddContact = async () => {
    if (!newContactName.trim() || !currentProfile?.id) return;
    try {
      await api.addTrustedConnection({
        profile_id: currentProfile.id,
        contact_name: newContactName,
        display_name: newContactName,
        contact_type: contactType,
        relationship: newContactRel,
        caregiver_name: newContactCaregiver,
        target_user_id: contactType === 'mindmitra_user' ? newContactTargetId : undefined,
        contact_user_id: contactType === 'mindmitra_user' ? newContactTargetId : undefined,
        phone_number: contactType === 'external' ? newContactPhone : undefined,
        phone_or_address: contactType === 'external' ? newContactPhone : `Account #${newContactTargetId}`,
        status: 'approved',
      });
      setShowAddContactModal(false);
      setNewContactName('');
      setNewContactPhone('');
      loadData();
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  // --- DELETE CONTACT HANDLER ---
  const handleDeleteContact = async (id: number) => {
    try {
      await api.deleteTrustedConnection(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  // --- REAL MICROPHONE RECORDING HANDLERS ---
  const startStoryRecording = async () => {
    audioChunksRef.current = [];
    setRecordTimerSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudioBase64(reader.result as string);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingStory(true);

      recordIntervalRef.current = setInterval(() => {
        setRecordTimerSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone permission denied for story recording:', err);
      alert('Microphone access is required to record memory stories.');
    }
  };

  const stopStoryRecording = () => {
    if (mediaRecorderRef.current && isRecordingStory) {
      mediaRecorderRef.current.stop();
      setIsRecordingStory(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
  };

  const handleSaveRecordedStory = async () => {
    if (!newStoryTitle.trim() || !currentProfile?.id) return;
    try {
      await api.createMemoryStory({
        profile_id: currentProfile.id,
        title: newStoryTitle,
        category: newStoryCategory,
        transcript_text: newStoryText,
        audio_url: recordedAudioBase64 || '',
        is_private: true,
      });
      setShowAddStoryModal(false);
      setNewStoryTitle('');
      setNewStoryText('');
      setRecordedAudioUrl(null);
      setRecordedAudioBase64(null);
      loadData();
    } catch (err) {
      console.error('Failed to save memory story:', err);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const interestCircles = [
    {
      id: 'bhajans',
      title: 'Morning Bhajans & Stotrams',
      members: 14,
      desc: 'Shared spiritual hymns, morning devotional recitations, and calm daily prayer.',
      icon: Music,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'gardening',
      title: 'Courtyard Gardening & Plants',
      members: 9,
      desc: 'Growing Tulsi, jasmine flowers, and organic terrace vegetables together.',
      icon: Heart,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'stories',
      title: 'Folk Tales & Heritage Memories',
      members: 18,
      desc: 'Preserving village histories, ancestral recipes, and family folklore across generations.',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/caregiver')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
              title="Return to Caregiver Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PhoneCall className="text-emerald-600 dark:text-emerald-400" size={24} />
                  <span>Connect Mode & Trusted Calling</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Real WebRTC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Profile:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {currentProfile?.display_name || currentProfile?.name || 'Selected Elderly Profile'}
                </strong>{' '}
                • Caregiver:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {caregiver?.name || 'Atchyuta Pavan Karthikeya'}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CaregiverAccountMenu />
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Trusted Voice Contacts & Memory Stories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trusted Voice Connections Card */}
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Phone className="text-emerald-600 dark:text-emerald-400" size={20} />
                    <span>Trusted Contacts</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Verified MindMitra WebRTC Calls & Family Phone Directory
                  </p>
                </div>

                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus size={16} />
                  <span>Add Contact</span>
                </button>
              </div>

              {connections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connections.map((conn) => {
                    const contactName = conn.display_name || conn.contact_name;
                    const isMindMitra = conn.contact_type === 'mindmitra_user' || !!conn.target_user_id;
                    const isOnline = !!contactPresence[conn.id];

                    return (
                      <div
                        key={conn.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 flex flex-col justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-base flex items-center justify-center relative">
                                {contactName.charAt(0)}
                                {isMindMitra && (
                                  <span
                                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                      isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                    title={isOnline ? 'Online (Ready to Call)' : 'Standby / Offline'}
                                  />
                                )}
                              </div>
                              <div>
                                <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                                  {contactName}
                                </h4>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  {conn.relationship}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteContact(conn.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Remove Connection"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Contact Metadata */}
                          <div className="space-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <p className="flex items-center gap-1">
                              <Shield size={12} className="text-blue-500" />
                              <span>Caregiver: {conn.caregiver_name || 'Atchyuta Pavan Karthikeya'}</span>
                            </p>
                            {isMindMitra ? (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                  MindMitra Contact
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isOnline
                                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {isOnline ? '● Online' : '○ Standby'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                  External Contact
                                </span>
                                {conn.phone_number && (
                                  <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                    {conn.phone_number}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div>
                          {isMindMitra ? (
                            <button
                              onClick={() => startCall(conn)}
                              disabled={callState === 'CALLING' || callState === 'CONNECTED'}
                              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all"
                            >
                              <PhoneCall size={16} />
                              <span>Call {contactName}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedPhoneContact(conn)}
                              className="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                            >
                              <Smartphone size={16} />
                              <span>Phone Call</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <Phone className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Trusted Contacts Added Yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Add family members or neighbors for instant 1-tap calling.
                  </p>
                </div>
              )}
            </div>

            {/* Memory Stories Card */}
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="text-amber-500" size={20} />
                    <span>Private Voice Memory Stories</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Audio recordings preserved for reminiscence and family archives
                  </p>
                </div>

                <button
                  onClick={() => setShowAddStoryModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Mic size={16} />
                  <span>Record Story</span>
                </button>
              </div>

              {stories.length > 0 ? (
                <div className="space-y-3">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{story.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {story.category}
                          </span>
                        </div>
                        {story.transcript_text && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {story.transcript_text}
                          </p>
                        )}
                      </div>

                      {story.audio_url && (
                        <div className="w-full sm:w-auto shrink-0">
                          <audio controls src={story.audio_url} className="w-full sm:w-60 h-8" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <Mic className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Memory Stories Recorded</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Capture precious memories and life stories using your microphone.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interest Circles */}
          <div className="space-y-6">
            <div className="card p-6 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={20} />
                    <span>Peer Interest Circles</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Neighborhood social topics
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {interestCircles.map((circle) => {
                  const Icon = circle.icon;
                  return (
                    <div
                      key={circle.id}
                      onClick={() => setSelectedCircle(circle)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${circle.color} text-white flex items-center justify-center shadow-md`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{circle.title}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {circle.members} Active Members
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{circle.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: External Phone Call Dialog */}
        {selectedPhoneContact && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <Smartphone size={20} className="text-purple-500" />
                  <span>External Phone Call</span>
                </h3>
                <button
                  onClick={() => setSelectedPhoneContact(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-center">
                <h4 className="text-xl font-bold">{selectedPhoneContact.display_name || selectedPhoneContact.contact_name}</h4>
                <p className="text-xs text-slate-500">{selectedPhoneContact.relationship} • External Contact</p>
                <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {selectedPhoneContact.phone_number || 'No phone number stored'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Caregiver Verified: {selectedPhoneContact.caregiver_name || 'Atchyuta Pavan Karthikeya'}
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                This external contact will be dialed directly through your device's cellular telephone line.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedPhoneContact(null)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                {selectedPhoneContact.phone_number && (
                  <a
                    href={`tel:${selectedPhoneContact.phone_number}`}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-md shadow-purple-600/30"
                  >
                    <Phone size={14} />
                    <span>Dial {selectedPhoneContact.phone_number}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Trusted Contact */}
        {showAddContactModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <UserCheck size={18} className="text-emerald-600" />
                  <span>Add Trusted Contact</span>
                </h3>
                <button
                  onClick={() => setShowAddContactModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contact Type Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <button
                  onClick={() => setContactType('mindmitra_user')}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all ${
                    contactType === 'mindmitra_user'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  MindMitra Contact
                </button>
                <button
                  onClick={() => setContactType('external')}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all ${
                    contactType === 'external'
                      ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  External Contact
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  placeholder="e.g. Leelu, Anita, Suresh"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                >
                  <option value="Neighbor">Neighbor</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Primary Caregiver">Primary Caregiver</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Caregiver Name</label>
                <input
                  type="text"
                  value={newContactCaregiver}
                  onChange={(e) => setNewContactCaregiver(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  placeholder="Atchyuta Pavan Karthikeya"
                />
              </div>

              {contactType === 'mindmitra_user' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    MindMitra Target User / Profile ID
                  </label>
                  <input
                    type="number"
                    value={newContactTargetId}
                    onChange={(e) => setNewContactTargetId(Number(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                    placeholder="2"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Routes real-time WebRTC audio signals directly to this authenticated account session.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                    placeholder="+91 98765 43210"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  disabled={!newContactName.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Memory Story Recording */}
        {showAddStoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4 text-slate-900 dark:text-white shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Mic size={18} className="text-amber-500" />
                  <span>Record Memory Story</span>
                </h3>
                <button
                  onClick={() => setShowAddStoryModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Story Title</label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  placeholder="e.g. My First Harvest Festival in Village"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newStoryCategory}
                  onChange={(e) => setNewStoryCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                >
                  <option value="Childhood & Village">Childhood & Village</option>
                  <option value="Festivals & Traditions">Festivals & Traditions</option>
                  <option value="Family & Life Lessons">Family & Life Lessons</option>
                  <option value="Travel & Pilgrimages">Travel & Pilgrimages</option>
                </select>
              </div>

              {/* Real Audio Recorder Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Microphone Audio Capture:
                </span>

                {isRecordingStory ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 font-black text-xs animate-pulse">
                      <Radio size={14} />
                      <span>Recording... ({formatTimer(recordTimerSeconds)})</span>
                    </div>
                    <div>
                      <button
                        onClick={stopStoryRecording}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 mx-auto shadow-md"
                      >
                        <Square size={14} />
                        <span>Stop Recording</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={startStoryRecording}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 mx-auto shadow-md"
                    >
                      <Mic size={15} />
                      <span>{recordedAudioUrl ? 'Re-Record Audio' : 'Start Voice Recording'}</span>
                    </button>
                  </div>
                )}

                {recordedAudioUrl && (
                  <div className="pt-2">
                    <audio controls src={recordedAudioUrl} className="w-full h-8" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transcript / Family Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
                  placeholder="Optional summary or notes..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddStoryModal(false);
                    setRecordedAudioUrl(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRecordedStory}
                  disabled={!newStoryTitle.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
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
