import { getAssignedChildDetail } from "@/actions/expert";
import { getChildSessions } from "@/actions/parent";
import { getChildAlertStats } from "@/actions/analytics";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import ChildChartsContainer from "../../parent/_components/ChildChartsContainer";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function ExpertChartsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.childId;

  if (!childId) {
    return (
      <div className="p-20 text-center uppercase font-black text-zinc-400">
        Vui lòng chọn hồ sơ trẻ trước
      </div>
    );
  }

  const [result, sessionsResult, alertResult] = await Promise.all([
    getAssignedChildDetail(childId),
    getChildSessions(childId),
    getChildAlertStats(childId)
  ]);

  if (!result.success || !result.child) return notFound();
  
  const child = result.child as any;
  const sessions = (sessionsResult as any).success ? ((sessionsResult as any).sessions || []) : [];
  const radarData = (alertResult as any).success ? ((alertResult as any).radarData || []) : [];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3 tracking-tight">
            <BarChart3 className="text-blue-500" /> 
            Báo cáo Thống kê: {child.name || child.display_name}
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">Phân tích chuyên sâu về tiến độ và hành vi của trẻ</p>
        </div>
      </div>

      <ChildChartsContainer sessions={sessions} radarData={radarData} />
    </div>
  );
}
