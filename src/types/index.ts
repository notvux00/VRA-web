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
  expertUids: string[];
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

export interface Session {
  id: string;
  centerId: string;
  childId: string;
  expertUid: string;
  lessonId: string;
  startTime: string;
  endTime?: string;
  status: "in-progress" | "completed" | "cancelled";
  notes?: string;
}
