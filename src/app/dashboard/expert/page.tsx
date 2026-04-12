import { getAssignedChildren, getExpertStats } from "@/actions/expert";
import ExpertProfilePicker from "./_components/dashboard/ExpertProfilePicker";
import VRPairingOverlay from "./_components/dashboard/VRPairingOverlay";
import ExpertStats from "./_components/dashboard/ExpertStats";
import { Baby, Cast, Info } from "lucide-react";
import React from "react";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ childId?: string; vr?: string; session?: string; pin?: string }>;
}

interface Child {
  id: string;
  display_name?: string;
  name?: string;
  sessionCount?: number;
  [key: string]: any;
}

export default async function ExpertDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;
  const vrStatus = params.vr;

  if (childId && (vrStatus === "connected" || vrStatus === "skipped")) {
    // Giữ nguyên TẤT CẢ query params khi redirect sang stats
    const q = new URLSearchParams();
    q.set("childId", childId);
    if (vrStatus) q.set("vr", vrStatus);
    if (params.session) q.set("session", params.session);
    if (params.pin) q.set("pin", params.pin);
    redirect(`/dashboard/expert/stats?${q.toString()}`);
  }

  const { children, success: childrenSuccess } = await getAssignedChildren() as { children: Child[] | undefined, success: boolean };
  const { stats, success: statsSuccess } = await getExpertStats();

  if (!childrenSuccess || !statsSuccess) {
    return (
      <div className="p-8 text-center pt-20 text-red-500">
        <h1 className="text-2xl font-bold">Lỗi tải dữ liệu</h1>
        <p>Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // Stage 1: Profile Selection
  if (!childId) {
    return <ExpertProfilePicker childrenList={children || []} />;
  }

  const selectedChild = children?.find(c => c.id === childId);
  const isVRConnected = vrStatus === "connected";
  const isVRSkipped = vrStatus === "skipped";

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Stage 2: VR Pairing Overlay (Demo - only if not connected OR skipped) */}
      {!isVRConnected && !isVRSkipped && (
        <VRPairingOverlay 
          childId={selectedChild?.id}
          childName={selectedChild?.display_name || selectedChild?.name || "Trẻ"}
        />
      )}

      {/* Stage 3: Child Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Baby size={20} />
             </div>
             <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
               Đang quản lý: {selectedChild?.display_name || selectedChild?.name}
             </p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Bảng điều khiển chuyên gia
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Theo dõi, can thiệp và đánh giá tiến trình VR của trẻ
          </p>
        </div>

        {/* VR Status Indicator */}
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${
          isVRConnected 
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600" 
            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-zinc-400"
        }`}>
          <Cast size={20} className={isVRConnected ? "animate-pulse" : ""} />
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60">Thiết bị VR</p>
            <p className="text-xs font-black uppercase tracking-tight">
              {isVRConnected ? "Đã kết nối" : "Chưa kết nối"}
            </p>
          </div>
        </div>
      </div>

      <ExpertStats 
        totalChildren={1} // In child view, focus on 1 child
        totalSessions={selectedChild?.sessionCount || 0}
        activeSessions={isVRConnected ? 1 : 0}
      />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-900/40">
           <Info size={40} />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Vui lòng chọn tính năng từ Sidebar</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Hãy sử dụng menu bên trái để xem thống kê chi tiết, quản lý danh sách bài học hoặc xem bài học gợi ý cho <b>{selectedChild?.display_name || selectedChild?.name}</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
