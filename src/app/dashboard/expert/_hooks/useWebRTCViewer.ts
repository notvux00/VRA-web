import { useState, useRef, useEffect, useCallback } from 'react';
import { useWebRTCSignaling } from './useWebRTCSignaling';

export type WebRTCConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';

export function useWebRTCViewer(sessionId: string) {
  const [connectionState, setConnectionState] = useState<WebRTCConnectionState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Memoize handlers to prevent infinite re-renders in useWebRTCSignaling
  const handleOfferReceived = useCallback(async (offerJson: string) => {
    console.log('Received WebRTC Offer', offerJson);
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
      
      sendAnswer(answerJson);
    } catch (e) {
      console.error('Error handling offer', e);
    }
  }, []);

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
        sendIceCandidate(candJson);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track', event.streams[0]);
      setStream(event.streams[0]);
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
  }, [sendIceCandidate]);

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
    // Only init if we have a sessionId
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
