"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Loader2 } from "lucide-react";
import ExpertStats from "./_components/ExpertStats";
import ChildrenTable from "./_components/ChildrenTable";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedChildren, getExpertStats } from "@/actions/expert";

export default function ExpertDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalChildren: 0, totalSessions: 0, activeSessions: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      
      try {
        const [childrenRes, statsRes] = await Promise.all([
          getAssignedChildren(user.uid),
          getExpertStats(user.uid)
        ]);

        if (childrenRes.success) setChildren(childrenRes.children || []);
        if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      } catch (error) {
        console.error("Error fetching expert data:", error);
      } finally {
        setDataLoading(false);
      }
    }

    if (!authLoading) {
      fetchData();
    }
  }, [user?.uid, authLoading]);

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Trang Chuyên gia</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Theo dõi hồ sơ trẻ em và điều phối các buổi tập VR.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all shadow-sm">
            <FileText size={16} />
            <span>Báo cáo</span>
          </button>
        </div>
      </div>

      <ExpertStats 
        totalChildren={stats.totalChildren}
        totalSessions={stats.totalSessions}
        activeSessions={stats.activeSessions}
      />
      
      <ChildrenTable children={children} />
    </div>
  );
}
