"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ChildrenTable from "../_components/ChildrenTable";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedChildren } from "@/actions/expert";

export default function ExpertChildrenPage() {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      
      try {
        const res = await getAssignedChildren(user.uid);
        if (res.success) setChildren(res.children || []);
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
           <Link href="/dashboard/expert" className="text-zinc-500 hover:text-blue-600 flex items-center gap-2 text-sm mb-4 transition-colors font-medium">
              <ArrowLeft size={16} />
              Quay lại tổng quan
           </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Danh sách Trẻ em</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Danh sách tất cả các trẻ em bạn đang trực tiếp hỗ trợ và can thiệp.</p>
        </div>
      </div>

      <ChildrenTable children={children} />
    </div>
  );
}
