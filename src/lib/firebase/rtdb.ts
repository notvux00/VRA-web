"use client";

import { rtdb } from "@/lib/firebase/client";
import { ref, get, update, remove, onValue, off, onChildAdded, push, set, serverTimestamp } from "firebase/database";

// ─────────────────────────────────────────────────────
// Tất cả logic RTDB pairing nằm ở đây, các component chỉ gọi hàm
// ─────────────────────────────────────────────────────

/**
 * Kết nối (Pair) với thiết bị VR bằng mã PIN.
 * Ghi child_id hiện tại vào RTDB ngay lập tức.
 * Trả về pin.
 */
export async function pairWithDevice(pinCode: string, childId: string, hostId: string): Promise<{ pin: string }> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  const snapshot = await get(pinRef);

  if (!snapshot.exists()) {
    throw new Error("Mã PIN không tồn tại hoặc đã hết hạn.");
  }

  const data = snapshot.val();
  if (data.status !== "waiting") {
    throw new Error("Thiết bị không ở trạng thái chờ ghép nối.");
  }

  // Không tạo sessionId lúc Pair, chỉ cập nhật trạng thái
  await update(pinRef, {
    status: "paired",
    current_child_id: childId || "",
    host_id: hostId,
  });

  return { pin: pinCode };
}

/**
 * Gửi lệnh chạy Bài học tới Kính VR.
 * Lúc này mới sinh SessionId và truyền kèm theo LessonId + SceneName.
 * @param sceneName - Tên chính xác của file .unity (VD: "Bathroom", "Farm")
 * @param lessonId  - ID bài học trên Firestore (VD: "WashingHand_1")
 * @param hostId    - UID của Expert đang điều khiển buổi học
 */
export async function startLessonOnDevice(pinCode: string, sceneName: string, lessonId: string, hostId: string): Promise<string> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  const sessionId = crypto.randomUUID();

  await update(pinRef, {
    current_lesson_id: lessonId,
    current_session_id: sessionId,
    target_scene_name: sceneName,
    host_id: hostId,
  });

  return sessionId;
}

/**
 * Cập nhật child_id trên RTDB khi Expert đổi hồ sơ trẻ.
 * Gọi hàm này mỗi khi user chọn profile mới.
 */
export async function updateChildOnDevice(pinCode: string, childId: string): Promise<void> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  await update(pinRef, {
    current_child_id: childId || "",
  });
}

/**
 * Ngắt kết nối: set status về "waiting" và xoá các field session.
 */
export async function disconnectDevice(pinCode: string): Promise<void> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  await update(pinRef, {
    status: "waiting",
    current_child_id: "",
    current_lesson_id: "",
    current_session_id: "",
    target_scene_name: "",
  });
}

/**
 * Kết thúc bài học trên Kính VR.
 * Xoá session hiện tại để Kính VR tự động quay về Lobby.
 */
export async function endLessonOnDevice(pinCode: string): Promise<void> {
  const pinRef = ref(rtdb, `pairing_codes/${pinCode}`);
  await update(pinRef, {
    current_lesson_id: "",
    current_session_id: "",
    target_scene_name: "",
  });
}

/**
 * Giao tiếp Handshake: Lắng nghe VR xác nhận đã vào scene bài học.
 *
 * VR sẽ tự tạo node `LIVE_SESSIONS/{sessionId}` và ghi `vr_state` sau khi scene load xong.
 * Hàm này lắng nghe node đó và gọi callback khi `vr_state.status === "ready"`.
 *
 * @param sessionId    - Session ID đã được giao cho VR qua pairing_codes
 * @param onReady      - Callback khi VR xác nhận vào scene
 * @param onEnded      - Callback khi VR kết thúc bài học (status = "ended")
 * @param onDisconnect - Callback khi VR ngắt đột ngột (status = "disconnected")
 * @returns Unsubscribe function — gọi khi component unmount
 */
export function subscribeToVrHandshake(
  sessionId: string,
  onReady: (data: { scene_name: string; confirmed_at: number }) => void,
  onEnded?: () => void,
  onDisconnect?: () => void,
): () => void {
  const vrStateRef = ref(rtdb, `live_sessions/${sessionId}/vr_state`);

  const unsubscribe = onValue(vrStateRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.val();

    if (data?.status === "ready") {
      onReady({
        scene_name: data.scene_name || "",
        confirmed_at: data.confirmed_at || Date.now(),
      });
    } else if (data?.status === "ended") {
      onEnded?.();
    } else if (data?.status === "disconnected") {
      onDisconnect?.();
    }
  });

  // Trả về hàm dọn dẹp listener khi component unmount
  return () => off(vrStateRef, "value", unsubscribe);
}

/**
 * Lắng nghe luồng dữ liệu Telemetry từ VR.
 * VR đẩy dữ liệu vào behavior_snapshots/sessionId/timestamp
 */
export function subscribeToTelemetry(
  sessionId: string,
  onNewSnapshot: (timestamp: string, snapshot: any) => void
): () => void {
  const telemetryRef = ref(rtdb, `behavior_snapshots/${sessionId}`);
  
  const unsubscribe = onChildAdded(telemetryRef, (snapshot) => {
    if (snapshot.exists()) {
      onNewSnapshot(snapshot.key as string, snapshot.val());
    }
  });

  return () => off(telemetryRef, "child_added", unsubscribe);
}


/**
 * Lắng nghe WebRTC Offer từ thiết bị VR
 */
export function subscribeToWebRTCOffer(
  sessionId: string,
  onOffer: (offer: string) => void
): () => void {
  const offerRef = ref(rtdb, `webrtc_signaling/${sessionId}/offer`);
  const unsubscribe = onValue(offerRef, (snapshot) => {
    if (snapshot.exists()) {
      onOffer(snapshot.val());
    }
  });
  return () => off(offerRef, 'value', unsubscribe);
}

/**
 * Gửi WebRTC Answer tới thiết bị VR
 */
export async function pushWebRTCAnswer(sessionId: string, answer: string): Promise<void> {
  const answerRef = ref(rtdb, `webrtc_signaling/${sessionId}/answer`);
  await set(answerRef, answer);
}

/**
 * Gửi ICE Candidate của Web tới thiết bị VR
 */
export async function pushWebRTCCandidate(sessionId: string, candidate: string): Promise<void> {
  const candidatesRef = ref(rtdb, `webrtc_signaling/${sessionId}/web_candidates`);
  const newCandidateRef = push(candidatesRef);
  await set(newCandidateRef, candidate);
}

/**
 * Lắng nghe ICE Candidate từ thiết bị VR
 */
export function subscribeToVRCandidates(
  sessionId: string,
  onCandidate: (candidate: string) => void
): () => void {
  const candidatesRef = ref(rtdb, `webrtc_signaling/${sessionId}/vr_candidates`);
  const unsubscribe = onChildAdded(candidatesRef, (snapshot) => {
    if (snapshot.exists()) {
      onCandidate(snapshot.val());
    }
  });
  return () => off(candidatesRef, 'child_added', unsubscribe);
}

/**
 * Dọn dẹp Signaling
 */
export async function cleanupWebRTCSignaling(sessionId: string): Promise<void> {
  const signalingRef = ref(rtdb, `webrtc_signaling/${sessionId}`);
  await remove(signalingRef);
}

/**
 * Gửi lệnh điều khiển từ xa (Remote Command) tới kính VR qua RTDB.
 * Ghi vào live_sessions/${sessionId}/commands bằng push() để tạo một key ngẫu nhiên duy nhất.
 */
export async function pushRemoteCommand(
  sessionId: string,
  commandType: string,
  param: any = null
): Promise<void> {
  if (!sessionId) {
    console.error("pushRemoteCommand: sessionId is empty");
    return;
  }
  
  if (!commandType) {
    console.error("pushRemoteCommand: commandType is empty");
    return;
  }

  const commandsRef = ref(rtdb, `live_sessions/${sessionId}/commands`);
  const newCommandRef = push(commandsRef);

  await set(newCommandRef, {
    command_type: commandType,
    param: param,
    timestamp: serverTimestamp()
  });
}

