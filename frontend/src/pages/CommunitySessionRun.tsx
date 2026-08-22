import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, ArrowRight, CheckCircle2, Users, Sparkles, MessageSquare, Brain, Clock, ShieldCheck, Volume2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export default function CommunitySessionRun() {
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<any>(null);
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [showVisualPrompt, setShowVisualPrompt] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [participantNotes, setParticipantNotes] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('mindmitra_active_community_session');
    if (raw) {
      try {
        setSessionData(JSON.parse(raw));
      } catch {}
    } else {
      // Fallback demo community session
      setSessionData({
        id: 101,
        name: 'Morning Memory & Story Circle',
        activity_type: 'memory_circle',
        participants: [
          { id: 1, display_name: 'Rajesh Kumar', name: 'Rajesh Kumar', age: 72 },
          { id: 2, display_name: 'Sunita Devi', name: 'Sunita Devi', age: 68 },
          { id: 3, display_name: 'Ramesh Kumar', name: 'Ramesh Kumar', age: 75 },
        ]
      });
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      setShowVisualPrompt(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6">
        <div className="text-center font-bold">Loading Group Session...</div>
      </div>
    );
  }

  const participants: User[] = sessionData.participants || [];
  const currentParticipant = participants[activeTurnIndex] || participants[0] || { display_name: 'Group', id: 0 };

  const handleNextTurn = () => {
    if (participants.length > 0) {
      setActiveTurnIndex((prev) => (prev + 1) % participants.length);
    }
  };

  const handleCompleteSession = async () => {
    setCompleting(true);
    try {
      if (sessionData.id) {
        await api.completeCommunitySession(sessionData.id, 15, 'Facilitated group session completed successfully', participantNotes);
      }
      sessionStorage.removeItem('mindmitra_active_community_session');
      navigate('/community');
    } catch (err: any) {
      alert(`Error saving session: ${err.message || 'Error'}`);
    }
    setCompleting(false);
  };

  const conversationPrompts = [
    { title: "Favorite Festival Memories", prompt: "What was your absolute favorite dish or traditional song during festival celebrations when you were young?" },
    { title: "First Memory of a Journey", prompt: "What was the very first town or city you traveled to outside your home village?" },
    { title: "Games of Childhood", prompt: "What outdoor game did you and your friends play together every evening?" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6 transition-all">
      {/* Top Facilitator Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/community')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Community Mode • Pass-and-Play
              </span>
              <h1 className="text-base font-extrabold text-white">{sessionData.name}</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Facilitator View • Shared Screen • {participants.length} Active Participants
            </p>
          </div>
        </div>

        <button
          onClick={handleCompleteSession}
          disabled={completing}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg"
        >
          <CheckCircle2 size={16} />
          <span>{completing ? 'Saving...' : 'Finish Group Session'}</span>
        </button>
      </div>

      {/* Main Group Presentation Canvas */}
      <div className="my-auto max-w-4xl mx-auto w-full py-6 space-y-6">
        {/* Pass-and-Play Turn Indicator Card */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-indigo-400/30">
              {(currentParticipant.display_name || currentParticipant.name || 'P').charAt(0)}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 block">
                Current Turn (Pass Device)
              </span>
              <h2 className="text-2xl font-black text-white">
                {currentParticipant.display_name || currentParticipant.name}'s Turn
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNextTurn}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <span>Next Participant</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Activity 1: Memory Circle Prompt */}
        {sessionData.activity_type === 'memory_circle' && (
          <div className="bg-slate-850 rounded-3xl p-6 border border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Brain size={18} /> Visual Group Recall Scene
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsTimerRunning(true);
                    setShowVisualPrompt(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700"
                >
                  <Clock size={14} /> Start 30s Reveal ({timerSeconds}s)
                </button>

                <button
                  onClick={() => setShowVisualPrompt(prev => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700"
                >
                  {showVisualPrompt ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showVisualPrompt ? 'Hide Scene' : 'Show Scene'}</span>
                </button>
              </div>
            </div>

            {showVisualPrompt ? (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 text-center space-y-4">
                <div className="text-6xl">🏡 🌻 🐕 🚲 🌺 ☀️</div>
                <h4 className="text-lg font-black text-white">Visual Scene: "Sunny Courtyard"</h4>
                <p className="text-xs text-indigo-200 max-w-md mx-auto">
                  Look closely at the items in this courtyard scene. In 30 seconds, we will hide it and answer recall questions together!
                </p>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto font-black text-xl">
                  ❓
                </div>
                <h4 className="text-xl font-extrabold text-white">Group Discussion Prompts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="font-bold text-indigo-300 block mb-1">Question 1</span>
                    What animal was resting in the garden?
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="font-bold text-indigo-300 block mb-1">Question 2</span>
                    What vehicle was parked near the house?
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <span className="font-bold text-indigo-300 block mb-1">Question 3</span>
                    What color were the flowers in the courtyard?
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity 2: Conversation Circle */}
        {(sessionData.activity_type === 'conversation_circle' || sessionData.activity_type === 'story_chain') && (
          <div className="bg-slate-850 rounded-3xl p-8 border border-slate-700 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <MessageSquare size={16} /> Today's Conversation Card
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug max-w-2xl mx-auto">
              "{conversationPrompts[0].prompt}"
            </h3>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Facilitator prompt: Ask {currentParticipant.display_name || currentParticipant.name} to share their thought, then invite others to add their own experiences.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Participant Quick Selector & Facilitator Note */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400">Participants:</span>
          {participants.map((p, index) => (
            <button
              key={p.id}
              onClick={() => setActiveTurnIndex(index)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                index === activeTurnIndex
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.display_name || p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder={`Note for ${currentParticipant.display_name || currentParticipant.name}...`}
            value={participantNotes[currentParticipant.id] || ''}
            onChange={(e) => setParticipantNotes({ ...participantNotes, [currentParticipant.id]: e.target.value })}
            className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-medium text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>
    </div>
  );
}
