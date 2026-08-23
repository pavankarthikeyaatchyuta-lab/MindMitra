import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, PhoneCall, Mic, MicOff, AlertCircle, Clock, User, ShieldCheck } from 'lucide-react';
import { useCall } from '../context/CallContext';

export const GlobalCallOverlay: React.FC = () => {
  const {
    callState,
    activeCall,
    callDuration,
    isMuted,
    callError,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    clearCallState,
  } = useCall();

  if (callState === 'IDLE') return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {/* 1. Incoming Call Dialog Modal */}
      {callState === 'RINGING' && activeCall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
          >
            {/* Animated ringing pulse circles */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
              <div className="w-64 h-64 bg-emerald-500/10 rounded-full animate-ping duration-1000" />
            </div>

            <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center border-4 border-emerald-500/40 animate-bounce">
              <PhoneCall className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              ● Incoming Trusted Call
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
              {activeCall.displayName}
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 font-medium mb-1">
              {activeCall.relationship || 'Trusted Contact'}
            </p>

            <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
              Caregiver: {activeCall.caregiverName || 'Atchyuta Pavan Karthikeya'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={declineCall}
                className="py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              >
                <PhoneOff className="w-6 h-6" />
                Decline
              </button>

              <button
                onClick={acceptCall}
                className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 animate-pulse"
              >
                <Phone className="w-6 h-6" />
                Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 2. Outgoing Call / Active Call / Call Status Overlay Modal */}
      {callState !== 'RINGING' && activeCall && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-6 right-6 z-[9999] max-w-md w-full sm:w-96 bg-white dark:bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  callState === 'CONNECTED'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                    : callState === 'FAILED' || callState === 'UNAVAILABLE' || callState === 'DECLINED'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 animate-pulse'
                }`}
              >
                {callState === 'CONNECTED' ? (
                  <Phone className="w-6 h-6" />
                ) : callState === 'FAILED' || callState === 'UNAVAILABLE' || callState === 'DECLINED' ? (
                  <PhoneOff className="w-6 h-6" />
                ) : (
                  <PhoneCall className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  {activeCall.displayName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeCall.relationship || 'Trusted Contact'} • {activeCall.caregiverName || 'Caregiver Verified'}
                </p>
              </div>
            </div>

            {callState === 'CONNECTED' && (
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(callDuration)}
              </span>
            )}
          </div>

          {/* Status Indicators */}
          <div className="mb-4">
            {callState === 'CALLING' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-xl text-center">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Calling {activeCall.displayName}...
                </p>
                <p className="text-xs text-blue-500/80 mt-0.5">Ringing recipient browser</p>
              </div>
            )}

            {callState === 'CONNECTING' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Establishing secure audio stream...
                </p>
              </div>
            )}

            {callState === 'CONNECTED' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Encrypted WebRTC Audio
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live 2-Way</span>
              </div>
            )}

            {callState === 'UNAVAILABLE' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl text-center">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {activeCall.displayName} is currently unavailable
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">No answer within 25 seconds</p>
              </div>
            )}

            {callState === 'DECLINED' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-center">
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Call Declined</p>
              </div>
            )}

            {callState === 'FAILED' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-center">
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Call Failed
                </p>
                {callError && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{callError}</p>}
              </div>
            )}

            {callState === 'ENDED' && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Call Ended</p>
              </div>
            )}
          </div>

          {/* Active Call Controls */}
          <div className="flex items-center gap-3">
            {callState === 'CONNECTED' && (
              <button
                onClick={toggleMute}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
                  isMuted
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Unmute' : 'Mute Mic'}
              </button>
            )}

            {(callState === 'CALLING' || callState === 'CONNECTING' || callState === 'CONNECTED') && (
              <button
                onClick={endCall}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition-transform active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            )}

            {(callState === 'FAILED' || callState === 'UNAVAILABLE' || callState === 'DECLINED' || callState === 'ENDED') && (
              <button
                onClick={clearCallState}
                className="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
              >
                Dismiss
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
