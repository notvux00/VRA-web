import { useEffect, useRef } from 'react';
import {
  subscribeToWebRTCOffer,
  subscribeToVRCandidates,
  pushWebRTCAnswer,
  pushWebRTCCandidate,
  cleanupWebRTCSignaling
} from '@/lib/firebase/rtdb';

interface UseWebRTCSignalingProps {
  sessionId: string;
  onOfferReceived: (offerJson: string) => void;
  onIceCandidateReceived: (candidateJson: string) => void;
}

export function useWebRTCSignaling({
  sessionId,
  onOfferReceived,
  onIceCandidateReceived,
}: UseWebRTCSignalingProps) {
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!sessionId || isListeningRef.current) return;
    
    isListeningRef.current = true;

    const unsubOffer = subscribeToWebRTCOffer(sessionId, onOfferReceived);
    const unsubCandidates = subscribeToVRCandidates(sessionId, onIceCandidateReceived);

    return () => {
      unsubOffer();
      unsubCandidates();
      isListeningRef.current = false;
    };
  }, [sessionId, onOfferReceived, onIceCandidateReceived]);

  const sendAnswer = async (answerJson: string) => {
    if (!sessionId) return;
    await pushWebRTCAnswer(sessionId, answerJson);
  };

  const sendIceCandidate = async (candidateJson: string) => {
    if (!sessionId) return;
    await pushWebRTCCandidate(sessionId, candidateJson);
  };

  const cleanup = async () => {
    if (!sessionId) return;
    await cleanupWebRTCSignaling(sessionId);
  };

  return {
    sendAnswer,
    sendIceCandidate,
    cleanup,
  };
}
