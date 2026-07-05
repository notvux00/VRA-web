import { getChildProfileDetail, getChildSessions } from "@/actions/parent";
import { getChildAlertStats } from "@/actions/analytics";
import { notFound } from "next/navigation";
import ChildChartsContainer from "../_components/ChildChartsContainer";
import { BarChart3 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function ParentChartsPage({ searchParams }: PageProps) {
  const { childId } = await searchParams;
  
  if (!childId) {
    return (
      <div className="p-20 flex flex-col items-center justify-center h-full text-center space-y-4">
        <BarChart3 size={48} className="text-zinc-300 dark:text-zinc-700" />
        <h2 className="text-xl font-black text-zinc-400 uppercase tracking-widest">
          Vui lòng chọn hồ sơ trẻ
        </h2>
        <p className="text-zinc-500">Bạn cần chọn một hồ sơ trẻ cụ thể để xem biểu đồ thống kê.</p>
      </div>
    );
  }

  const [result, sessionsResult, alertResult] = await Promise.all([
    getChildProfileDetail(childId),
    getChildSessions(childId),
    getChildAlertStats(childId)
  ]);

  if (!result.success || !result.child) return notFound();
  
  const child = result.child as import("@/types").ChildProfile;
  const sessions = "success" in sessionsResult && sessionsResult.success ? (((sessionsResult as unknown) as { sessions: import("@/types").Session[] }).sessions || []) : [];
  const radarData = "success" in alertResult && alertResult.success ? (((alertResult as unknown) as { radarData: { subject: string; A: number; fullMark: number }[] }).radarData || []) : [];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3 tracking-tight">
            <BarChart3 className="text-blue-500" /> 
            Báo cáo Thống kê: {child.name}
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">Phân tích chuyên sâu về tiến độ và hành vi của trẻ</p>
        </div>
      </div>

      <ChildChartsContainer sessions={sessions} radarData={radarData} />
    </div>
  );
}
