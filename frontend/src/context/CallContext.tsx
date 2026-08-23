import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { api } from '../services/api';
import { useAppContext } from './AppContext';
import { TrustedConnection } from '../types';

export type CallState =
  | 'IDLE'
  | 'CALLING'
  | 'RINGING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DECLINED'
  | 'UNAVAILABLE'
  | 'FAILED'
  | 'ENDED';

export interface ActiveCallInfo {
  targetUserId: number;
  displayName: string;
  relationship?: string;
  caregiverName?: string;
  callerProfileId?: number;
  callId?: string;
  isIncoming: boolean;
}

interface CallContextType {
  callState: CallState;
  activeCall: ActiveCallInfo | null;
  callDuration: number;
  isMuted: boolean;
  callError: string | null;
  startCall: (contact: TrustedConnection) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  clearCallState: () => void;
}

const CallContext = createContext<CallContextType>({
  callState: 'IDLE',
  activeCall: null,
  callDuration: 0,
  isMuted: false,
  callError: null,
  startCall: async () => {},
  acceptCall: async () => {},
  declineCall: async () => {},
  endCall: async () => {},
  toggleMute: () => {},
  clearCallState: () => {},
});

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function CallProvider({ children }: { children: ReactNode }) {
  const { currentUser, caregiver } = useAppContext();
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [callError, setCallError] = useState<string | null>(null);

  // References to WebRTC instances and timers
  const peerConnRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutTimerRef = useRef<any>(null);
  const pendingOfferPayloadRef = useRef<any>(null);

  // Current active user ID for signaling presence
  const activeUserId = currentUser?.id || caregiver?.id || 1;

  // Cleanup helper
  const teardownCallResources = () => {
    if (ringTimeoutTimerRef.current) {
      clearTimeout(ringTimeoutTimerRef.current);
      ringTimeoutTimerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnRef.current) {
      try {
        peerConnRef.current.close();
      } catch (e) {}
      peerConnRef.current = null;
    }
    pendingOfferPayloadRef.current = null;
  };

  // 1. Continuous Heartbeat (every 3 seconds)
  useEffect(() => {
    if (!activeUserId) return;
    const sendBeat = async () => {
      try {
        await api.sendPresenceHeartbeat(activeUserId);
      } catch (e) {}
    };
    sendBeat();
    const interval = setInterval(sendBeat, 3000);
    return () => clearInterval(interval);
  }, [activeUserId]);

  // 2. Duration Timer when Connected
  useEffect(() => {
    let interval: any = null;
    if (callState === 'CONNECTED') {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (callState === 'IDLE') {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // 3. Continuous Background Signaling Poller (every 1.2 seconds)
  useEffect(() => {
    if (!activeUserId) return;

    let isPolling = false;
    const pollSignals = async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        const res = await api.pollCallSignals(activeUserId);
        if (res && res.signals && res.signals.length > 0) {
          for (const sig of res.signals) {
            await handleIncomingSignal(sig);
          }
        }
      } catch (e) {
      } finally {
        isPolling = false;
      }
    };

    const interval = setInterval(pollSignals, 1200);
    return () => clearInterval(interval);
  }, [activeUserId, callState, activeCall]);

  // Signal Handler
  const handleIncomingSignal = async (sig: any) => {
    const { signal_type, payload, caller_name, caller_relationship, caller_profile_id, call_id } = sig;

    if (signal_type === 'incoming_call' || signal_type === 'offer') {
      if (callState === 'IDLE' || callState === 'ENDED' || callState === 'DECLINED' || callState === 'UNAVAILABLE') {
        pendingOfferPayloadRef.current = payload;
        setActiveCall({
          targetUserId: caller_profile_id,
          displayName: caller_name || `User #${caller_profile_id}`,
          relationship: caller_relationship || 'Neighbor',
          caregiverName: 'Atchyuta Pavan Karthikeya',
          callerProfileId: caller_profile_id,
          callId: call_id,
          isIncoming: true,
        });
        setCallError(null);
        setCallState('RINGING');

        // Ring timeout for recipient (auto-dismiss after 25s if unanswered)
        if (ringTimeoutTimerRef.current) clearTimeout(ringTimeoutTimerRef.current);
        ringTimeoutTimerRef.current = setTimeout(() => {
          setCallState((curr) => {
            if (curr === 'RINGING') {
              teardownCallResources();
              setActiveCall(null);
              return 'IDLE';
            }
            return curr;
          });
        }, 25000);
      }
    } else if (signal_type === 'answer') {
      if (callState === 'CALLING' || callState === 'CONNECTING') {
        if (ringTimeoutTimerRef.current) clearTimeout(ringTimeoutTimerRef.current);
        if (peerConnRef.current && payload) {
          try {
            await peerConnRef.current.setRemoteDescription(new RTCSessionDescription(payload));
            setCallState('CONNECTED');
          } catch (e: any) {
            console.error('[WebRTC] Failed to set remote answer:', e);
            setCallError('Failed to establish audio connection.');
            setCallState('FAILED');
          }
        }
      }
    } else if (signal_type === 'ice-candidate') {
      if (peerConnRef.current && payload) {
        try {
          await peerConnRef.current.addIceCandidate(new RTCIceCandidate(payload));
        } catch (e) {}
      }
    } else if (signal_type === 'declined') {
      if (callState === 'CALLING' || callState === 'CONNECTING') {
        teardownCallResources();
        setCallState('DECLINED');
        setTimeout(() => {
          setCallState('IDLE');
          setActiveCall(null);
        }, 3500);
      }
    } else if (signal_type === 'hangup') {
      teardownCallResources();
      setCallState('ENDED');
      setTimeout(() => {
        setCallState('IDLE');
        setActiveCall(null);
      }, 2500);
    }
  };

  // Action: Start Outgoing Call
  const startCall = async (contact: TrustedConnection) => {
    const targetUserId = contact.target_user_id || contact.contact_user_id;
    if (!targetUserId) {
      setCallError('Cannot place call: Contact does not have a linked MindMitra account ID.');
      setCallState('FAILED');
      return;
    }

    setCallError(null);
    setCallState('CALLING');
    setActiveCall({
      targetUserId,
      displayName: contact.display_name || contact.contact_name,
      relationship: contact.relationship,
      caregiverName: contact.caregiver_name || 'Atchyuta Pavan Karthikeya',
      isIncoming: false,
    });

    try {
      // 1. Get Local Microphone Stream
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
      } catch (micErr: any) {
        teardownCallResources();
        setCallError('Microphone access is required to place this call. Please allow microphone permissions.');
        setCallState('FAILED');
        return;
      }

      // 2. Setup RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnRef.current = pc;

      // Add local audio tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Play remote audio
      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // Send ICE candidates to target user
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          api.sendCallSignal(activeUserId, targetUserId, 'ice-candidate', event.candidate.toJSON());
        }
      };

      // 3. Create Offer
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      // 4. Send Offer Signal via DB-backed API
      const callerName = currentUser?.display_name || (caregiver ? caregiver.name : 'Polayya');
      await api.sendCallSignal(activeUserId, targetUserId, 'offer', offer, undefined, callerName);

      // 5. 25-Second Ring Timeout
      if (ringTimeoutTimerRef.current) clearTimeout(ringTimeoutTimerRef.current);
      ringTimeoutTimerRef.current = setTimeout(() => {
        if (callState === 'CALLING' || callState === 'CONNECTING') {
          teardownCallResources();
          setCallState('UNAVAILABLE');
          setTimeout(() => {
            setCallState('IDLE');
            setActiveCall(null);
          }, 4000);
        }
      }, 25000);
    } catch (err: any) {
      console.error('[WebRTC] Call setup error:', err);
      teardownCallResources();
      setCallError('Unable to establish call connection. Please try again.');
      setCallState('FAILED');
    }
  };

  // Action: Accept Incoming Call
  const acceptCall = async () => {
    if (!activeCall) return;
    if (ringTimeoutTimerRef.current) clearTimeout(ringTimeoutTimerRef.current);

    setCallState('CONNECTING');

    try {
      // 1. Get Local Microphone
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
      } catch (micErr) {
        teardownCallResources();
        setCallError('Microphone access is required to answer this call. Please allow microphone permissions.');
        setCallState('FAILED');
        return;
      }

      // 2. Setup RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          api.sendCallSignal(activeUserId, activeCall.targetUserId, 'ice-candidate', event.candidate.toJSON());
        }
      };

      // 3. Set Remote Offer & Create Answer
      if (pendingOfferPayloadRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferPayloadRef.current));
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 4. Send Answer back to caller
      const responderName = currentUser?.display_name || (caregiver ? caregiver.name : 'Leelu');
      await api.sendCallSignal(activeUserId, activeCall.targetUserId, 'answer', answer, activeCall.callId, responderName);

      setCallState('CONNECTED');
    } catch (err: any) {
      console.error('[WebRTC] Failed to answer call:', err);
      teardownCallResources();
      setCallError('Error establishing audio link.');
      setCallState('FAILED');
    }
  };

  // Action: Decline Incoming Call
  const declineCall = async () => {
    if (activeCall) {
      try {
        await api.sendCallSignal(activeUserId, activeCall.targetUserId, 'declined');
      } catch (e) {}
    }
    teardownCallResources();
    setCallState('IDLE');
    setActiveCall(null);
  };

  // Action: End Active Call
  const endCall = async () => {
    if (activeCall) {
      try {
        await api.endCallSignal(activeUserId, activeCall.targetUserId, activeCall.callId);
      } catch (e) {}
    }
    teardownCallResources();
    setCallState('ENDED');
    setTimeout(() => {
      setCallState('IDLE');
      setActiveCall(null);
    }, 2000);
  };

  // Action: Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuted = !isMuted;
        audioTracks[0].enabled = !nextMuted;
        setIsMuted(nextMuted);
      }
    }
  };

  const clearCallState = () => {
    teardownCallResources();
    setCallState('IDLE');
    setActiveCall(null);
    setCallError(null);
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        activeCall,
        callDuration,
        isMuted,
        callError,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        clearCallState,
      }}
    >
      {/* Hidden audio element for WebRTC audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);
