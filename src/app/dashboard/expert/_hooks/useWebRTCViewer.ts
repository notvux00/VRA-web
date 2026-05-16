import { useState, useRef, useEffect, useCallback } from 'react';
import { useWebRTCSignaling } from './useWebRTCSignaling';

export type WebRTCConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';

export function useWebRTCViewer(sessionId: string) {
  const [connectionState, setConnectionState] = useState<WebRTCConnectionState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // ── Ref-based approach: always call the LATEST version of signaling functions ──
  // This prevents stale closures when sessionId changes between renders.
  const sendAnswerRef = useRef<(json: string) => void>(() => {});
  const sendIceCandidateRef = useRef<(json: string) => void>(() => {});

  const initPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return;

    setConnectionState('connecting');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candJson = JSON.stringify({
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        });
        sendIceCandidateRef.current(candJson);
      }
    };

    pc.ontrack = (event) => {
      // Unity's AddTrack doesn't associate a MediaStream,
      // so event.streams[0] may be undefined. Create one from the raw track.
      const remoteStream = event.streams?.[0] ?? new MediaStream([event.track]);
      console.log('Received remote track', remoteStream.id);
      setStream(remoteStream);
      setConnectionState('connected');
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setConnectionState('disconnected');
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionState('connected');
      }
    };

    pc.onconnectionstatechange = () => {
       if (pc.connectionState === 'failed') {
          setConnectionState('failed');
       }
    };

    peerConnectionRef.current = pc;
  }, []); // No deps needed — uses refs for signaling

  const handleOfferReceived = useCallback(async (offerJson: string) => {
    console.log('Received WebRTC Offer');
    try {
      const offer = JSON.parse(offerJson);
      if (!peerConnectionRef.current) {
        initPeerConnection();
      }
      
      const pc = peerConnectionRef.current!;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      const answerJson = JSON.stringify({
        type: answer.type,
        sdp: answer.sdp
      });
      
      // Use ref to always call the LATEST sendAnswer (with valid sessionId)
      sendAnswerRef.current(answerJson);
    } catch (e) {
      console.error('Error handling offer', e);
    }
  }, [initPeerConnection]);

  const handleIceCandidateReceived = useCallback(async (candidateJson: string) => {
    console.log('Received Remote ICE Candidate');
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      
      const candObj = JSON.parse(candidateJson);
      const candidate = new RTCIceCandidate(candObj);
      await pc.addIceCandidate(candidate);
    } catch (e) {
      console.error('Error adding ICE candidate', e);
    }
  }, []);

  const { sendAnswer, sendIceCandidate, cleanup: cleanupSignaling } = useWebRTCSignaling({
    sessionId,
    onOfferReceived: handleOfferReceived,
    onIceCandidateReceived: handleIceCandidateReceived
  });

  // Keep refs in sync with latest signaling functions
  useEffect(() => { sendAnswerRef.current = sendAnswer; }, [sendAnswer]);
  useEffect(() => { sendIceCandidateRef.current = sendIceCandidate; }, [sendIceCandidate]);

  const disconnect = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setStream(null);
    setConnectionState('disconnected');
    cleanupSignaling();
  }, [cleanupSignaling]);

  useEffect(() => {
    if (sessionId) {
      initPeerConnection();
    }
    return () => {
      disconnect();
    };
  }, [sessionId, initPeerConnection, disconnect]);

  return {
    stream,
    connectionState,
    disconnect
  };
}
