export type UserRole = "admin" | "center" | "expert" | "parent";

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  role: UserRole;
  centerId?: string;
  centerName?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Center {
  id: string;
  centerId: string; // Duplicate identifier used in some parts of the system
  name: string;
  email: string;
  address?: string;
  phone?: string;
  ownerUid: string;
  managerUids: string[];
  createdAt: string;
  updatedAt?: string;
  status: "Active" | "Inactive";
  expertCount?: number;
  sessionCount?: number;
  totalChildren?: number;
}

export interface Expert {
  uid: string;
  name: string;
  email: string;
  role: "expert";
  centerId: string;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
  status: "Active" | "Inactive";
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  height_cm?: number;
  weight_kg?: number;
  sound_sensitivity?: number;
  attention_span_min?: number;
  anxiety_triggers?: string[];
  diagnosis_notes?: string;
  centerId: string;
  expertUid?: string;
  parentUid?: string;
  linkCode?: string;
  linkCodeExpires?: string;
  linkCodeUsed?: boolean;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  sessionCount: number;
}

export interface Parent {
  uid: string;
  name: string;
  email: string;
  role: "parent";
  centerId: string;
  createdAt: string;
  updatedAt: string;
  status: "Active" | "Inactive";
}

export interface QuestLog {
  completion_status: string;
  hints_physical: number;
  hints_verbal: number;
  hints_visual: number;
  index: number;
  quest_name: string;
  response_time: number;
}

export interface Session {
  id: string;
  child_profile_id: string;
  completion_status: string;
  device_id?: string;
  duration: number;
  finish_time: string;
  start_time: string;
  hosted_by: string;
  lesson_id: string;
  lesson_name: string;
  level_index?: number;
  level_name?: string;
  quest_logs?: QuestLog[];
  score: number;
  session_id: string;
  type: string;
  video_url?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Clinical data
  auto_alerts?: any[];
  behavior_logs?: any[];
  evaluation?: string;
  notes?: string;
}

// ─── AI Lesson Recommender Types ─────────────────────────────────────────────

export type RecommendationPriority = "high" | "medium" | "low";

export interface AILessonRecommendation {
  lessonId: string;
  lessonTitle: string;
  levelName: string;
  type: string;
  thumbnailUrl?: string | null;
  targetSkill: string;
  priority: RecommendationPriority;
  /** Điểm tin cậy từ 0 đến 1 */
  confidence: number;
  reason: string;
  expectedBenefit: string;
  specialistNotes: string;
  sceneName?: string;
  difficultyLevel?: string;
}

/** Document lưu trong Firestore tại ai_recommendations/{childId} */
export interface AIRecommendationCache {
  childId: string;
  model: string;
  generatedAt: string;
  generatedBy: string;
  /** Luôn sắp xếp theo finish_time desc — mới nhất trước */
  basedOnSessionIds: string[];
  status: "draft";
  insufficientData: boolean;
  summary: string;
  recommendations: AILessonRecommendation[];
  /** true khi chạy ở chế độ Demo (thiếu API key) */
  isDemo?: boolean;
}

/** Kiểu trả về của Server Actions ai-recommendations */
export interface GenerateAIRecommendationsResult {
  success: boolean;
  source?: "cache" | "gemini" | "demo";
  childId?: string;
  generatedAt?: string;
  basedOnSessionIds?: string[];
  /** true nếu danh sách 3 session mới nhất đã thay đổi so với cache */
  hasNewSessionData?: boolean;
  summary?: string;
  recommendations?: AILessonRecommendation[];
  insufficientData?: boolean;
  isDemo?: boolean;
  error?: string;
}
