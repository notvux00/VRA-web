import { getParentChildren } from "@/actions/parent";
import ParentStats from "./_components/ParentStats";
import FocusChart from "./_components/FocusChart";
import RecentSessions from "./_components/RecentSessions";
import ProfilePicker from "./_components/ProfilePicker";
import HeatmapChart from "./_components/HeatmapChart";
import { Phone, AlertCircle, Baby } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ childId?: string }>;
}

export default async function ParentDashboard({ searchParams }: PageProps) {
  const { children, centerPhone, success } = await getParentChildren() as { children: any[], centerPhone: string | null, success: boolean };
  const params = await searchParams;
  const childId = params.childId;

  if (!success) {
    return (
      <div className="p-8 text-center pt-20">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Đã xảy ra lỗi</h1>
        <p className="text-zinc-500">Không thể tải thông tin hồ sơ của bạn lúc này.</p>
      </div>
    );
  }

  // Handle Empty State: Unlinked Account
  if (!children || children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border-2 border-amber-100 dark:border-amber-500/20">
          <AlertCircle className="text-amber-600 dark:text-amber-500" size={48} />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
          Tài khoản chưa được liên kết
        </h1>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400 mb-10 text-lg leading-relaxed">
          Hiện tại tài khoản phụ huynh của bạn chưa được liên kết với hồ sơ của trẻ nào. 
          Vui lòng liên hệ trung tâm để hoàn tất thủ tục này.
        </p>
        
        {centerPhone && (
          <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-blue-500/5 max-w-sm w-full">
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 mb-6 uppercase tracking-[0.2em]">
              Thông tin hỗ trợ
            </p>
            <a 
              href={`tel:${centerPhone}`}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Phone size={32} />
              </div>
              <span className="text-2xl font-black text-zinc-900 dark:text-white">{centerPhone}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  // If no childId is provided in URL, show the Netflix-style Profile Picker
  if (!childId) {
    return <ProfilePicker childrenList={children} />;
  }

  // Find the selected child from the list
  const selectedChild = children.find(c => c.id === childId) || children[0];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Baby size={16} />
             </div>
             <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{selectedChild.display_name || selectedChild.name}</p>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase transition-all">
            Báo cáo tiến trình chi tiết
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Dữ liệu tổng quan và đánh giá hoạt động VR của trẻ
          </p>
        </div>

      </div>

      <ParentStats childId={selectedChild.id} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <HeatmapChart childId={selectedChild.id} />
          <FocusChart childId={selectedChild.id} />
        </div>
        <div className="space-y-10">
          <RecentSessions childId={selectedChild.id} />
        </div>
      </div>
    </div>
  );
}
