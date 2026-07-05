import { getChildProfileDetail, getChildSessions } from "@/actions/parent";
import { getChildAlertStats } from "@/actions/analytics";
import { notFound } from "next/navigation";
import ChildChartsContainer from "../../../_components/ChildChartsContainer";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChildChartsPage({ params }: PageProps) {
  const { id } = await params;
  const [result, sessionsResult, alertResult] = await Promise.all([
    getChildProfileDetail(id),
    getChildSessions(id),
    getChildAlertStats(id)
  ]);

  if (!result.success || !result.child) return notFound();
  
  const child = result.child as import("@/types").ChildProfile;
  const sessions = "success" in sessionsResult && sessionsResult.success ? (((sessionsResult as unknown) as { sessions: import("@/types").Session[] }).sessions || []) : [];
  const radarData = "success" in alertResult && alertResult.success ? (((alertResult as unknown) as { radarData: { subject: string; A: number; fullMark: number }[] }).radarData || []) : [];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/parent/children/${id}`}
          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group shadow-sm"
        >
          <ArrowLeft className="text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" size={20} />
        </Link>
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
