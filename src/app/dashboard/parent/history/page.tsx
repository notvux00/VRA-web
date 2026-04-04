import { getParentChildren, getChildSessions } from "@/actions/parent";
import { History, Calendar, Clock, CheckCircle2, XCircle, Search, Filter, ArrowUpDown, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function SessionHistoryPage({ searchParams }: PageProps) {
  const { childId: currentChildId } = await searchParams;
  const { children, success: listSuccess } = await getParentChildren() as { children: any[], success: boolean };

  if (!listSuccess || !children || children.length === 0) {
    return (
      <div className="p-8 text-center pt-20">
        <p className="text-zinc-500 font-medium">Không tìm thấy hồ sơ trẻ.</p>
      </div>
    );
  }

  // If no child selected, show an instruction
  if (!currentChildId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-600">
           <Search size={40} />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-tighter">
          Chọn hồ sơ để xem lịch sử
        </h2>
        <p className="max-w-md text-zinc-500 font-medium">Vui lòng chọn một bé để xem lại toàn bộ lịch sử các buổi tập VR.</p>
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === currentChildId);
  if (!selectedChild) return notFound();

  const { sessions, success: sessionSuccess } = await getChildSessions(currentChildId);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <History size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Toàn bộ lịch sử</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Lịch sử học của {selectedChild.display_name}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">
            Tổng số: {sessions?.length || 0} buổi tập VR
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
           <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-black shadow-sm">
             <Filter size={16} /> Lọc
           </button>
           <button className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-sm font-black transition-all">
             <ArrowUpDown size={16} /> Sắp xếp
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ngày tập</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Bài tập / Bài học</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Thời lượng</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Điểm tập trung</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sessionSuccess && sessions && sessions.length > 0 ? (
                sessions.map((session: any) => {
                  const isCompleted = ["success", "Đã hoàn thành"].includes(session.completion_status);
                  const date = new Date(session.start_time).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
                  const duration = `${Math.round(session.duration / 60)} phút`;
                  
                  return (
                    <tr key={session.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500">
                             <Calendar size={18} />
                           </div>
                           <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase">{date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 transition-colors">
                          {session.lesson_id || "Bài tập VR Cơ bản"}
                        </p>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight">Kỹ năng Xã hội</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                          <Clock size={16} />
                          {duration}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            isCompleted 
                              ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" 
                              : "bg-red-100 dark:bg-red-500/10 text-red-700 border border-red-500/20"
                          }`}>
                            {isCompleted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {isCompleted ? "Thành công" : "Bị gián đoạn"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-lg font-black text-zinc-900 dark:text-white">
                          {session.score || "--"}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold ml-1">%</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 rounded-xl transition-all">
                            <MessageSquare size={18} />
                         </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-zinc-400 italic">
                    Chưa có lịch sử học tập được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
