import { Star, User, Eye, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toggleExpertStatus } from "@/app/actions/center";

interface ExpertRosterProps {
  experts: any[];
  onRefresh: () => void;
}

export default function ExpertRoster({ experts, onRefresh }: ExpertRosterProps) {
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    setTogglingStatus(uid);
    try {
      const res = await toggleExpertStatus(uid, currentStatus);
      if (res.success) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingStatus(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden h-fit transition-all duration-300">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">Đội ngũ Chuyên gia</h2>
        <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700/50">
          {experts.length} Thành viên
        </span>
      </div>
      
      <div className="p-4 space-y-3">
        {experts.length > 0 ? (
          experts.map((expert) => (
            <div 
              key={expert.uid} 
              className={`group flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-white dark:hover:bg-zinc-800/60 transition-all duration-300 ${expert.status === 'Inactive' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/center/experts/${expert.uid}`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover:scale-110 transition-transform">
                    <User size={18} />
                  </div>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/center/experts/${expert.uid}`}>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">{expert.name}</h4>
                    </Link>
                    {expert.status === 'Inactive' && (
                      <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-1 py-0.5 rounded">Ngưng</span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-zinc-500 font-bold tracking-tight">
                    {expert.specialization} &bull; {expert.status === 'Inactive' ? "Ngưng hoạt động" : "Sẵn sàng"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-l border-zinc-200 dark:border-zinc-800 ml-1 pl-3 gap-1">
                   <Link 
                    href={`/dashboard/center/experts/${expert.uid}`}
                    className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                   >
                     <Eye size={16} />
                   </Link>
                   <button 
                    onClick={() => handleToggleStatus(expert.uid, expert.status || "Active")}
                    disabled={togglingStatus === expert.uid}
                    className={`p-1.5 transition-colors ${expert.status === 'Inactive' ? 'text-zinc-400 hover:text-emerald-500' : 'text-emerald-500 hover:text-zinc-400'}`}
                   >
                     {togglingStatus === expert.uid ? <Loader2 size={16} className="animate-spin" /> : (expert.status === 'Inactive' ? <ToggleLeft size={18} /> : <ToggleRight size={18} />)}
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-300 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
              <User size={30} />
            </div>
            <p className="text-sm font-medium text-zinc-500 mb-1">Chưa có chuyên gia nào</p>
            <p className="text-xs text-zinc-400">Hãy thêm chuyên gia đầu tiên để bắt đầu quản lý.</p>
          </div>
        )}
      </div>
    </div>
  );
}
