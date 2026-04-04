import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  PlayCircle, 
  Building, 
  ShieldCheck, 
  BarChart3, 
  Stethoscope, 
  Baby, 
  History,
  MessageSquare,
  Sparkles,
  Cast,
} from "lucide-react";

export const parentNavigation = [
  { name: "Tổng quan", href: "/dashboard/parent", icon: LayoutDashboard },
  { name: "Hồ sơ của trẻ", href: "/dashboard/parent/children", icon: Baby },
  { name: "Lịch sử học", href: "/dashboard/parent/history", icon: History },
  { name: "Nhắn tin", href: "/dashboard/parent/messages", icon: MessageSquare },
];

export const expertNavigation = [
  { name: "Thống kê trẻ", href: "/dashboard/expert/stats", icon: BarChart3 },
  { name: "Danh sách bài học", href: "/dashboard/expert/lessons", icon: PlayCircle },
  { name: "Bài học gợi ý", href: "/dashboard/expert/suggestions", icon: Sparkles },
  { name: "Lịch sử học", href: "/dashboard/expert/history", icon: History },
  { name: "Kết nối thiết bị VR", href: "/dashboard/expert/connection", icon: Cast },
  { name: "Nhắn tin", href: "/dashboard/expert/messages", icon: MessageSquare },
];

export const adminNavigation = [
  { name: "Tổng quan", href: "/dashboard/admin", icon: ShieldCheck },
  { name: "Trung tâm", href: "/dashboard/admin/centers", icon: Building },
];

export const centerNavigation = [
  { name: "Tổng quan", href: "/dashboard/center", icon: LayoutDashboard },
  { name: "Chuyên gia", href: "/dashboard/center/experts", icon: Stethoscope },
  { name: "Trẻ em", href: "/dashboard/center/children", icon: Baby },
  { name: " Phụ huynh", href: "/dashboard/center/parents", icon: ShieldCheck },
  { name: "Báo cáo", href: "/dashboard/center/reports", icon: BarChart3 },
];

export function getNavigationByRole(role: string) {
  switch (role) {
    case "admin": return adminNavigation;
    case "center": return centerNavigation;
    case "expert":
    case "therapist": 
      return expertNavigation;
    case "parent": return parentNavigation;
    default: return parentNavigation;
  }
}

export function getRoleName(role: string) {
  switch (role) {
    case "admin": return "Quản trị viên";
    case "center": return "Quản lý Trung tâm";
    case "expert":
    case "therapist":
      return "Chuyên gia";
    case "parent": return "Phụ huynh";
    default: return "Phụ huynh";
  }
}
