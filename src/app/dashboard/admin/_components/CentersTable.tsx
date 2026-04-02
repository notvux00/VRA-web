import { Building, Loader2, Power, Trash2 } from "lucide-react";

interface Center {
  id: string;
  name: string;
  email: string;
  status: string;
  expertCount?: number;
}

interface CentersTableProps {
  centers: Center[];
  loading: boolean;
  onToggleStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function CentersTable({ centers, loading, onToggleStatus, onDelete }: CentersTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Danh sách Trung tâm</h2>
        <div className="text-xs text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full uppercase tracking-tighter">
          Đang hoạt động: {centers.filter(c => c.status === "Active").length}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm text-zinc-500">Đang tải dữ liệu...</span>
          </div>
        ) : centers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400"><Building /></div>
            <h3 className="text-zinc-900 dark:text-white font-bold">Chưa có trung tâm nào.</h3>
            <p className="text-zinc-500 text-sm max-w-xs mt-1">Bắt đầu bằng cách tạo trung tâm trị liệu đầu tiên.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-widest border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Trung tâm</th>
                <th className="px-6 py-4 text-center">Đội ngũ</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {centers.map((center) => (
                <tr key={center.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-zinc-900 dark:text-white">{center.name}</div>
                    <div className="text-xs text-zinc-500 font-medium">{center.email}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {center.expertCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      center.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {center.status === "Active" ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleStatus(center.id, center.status)}
                        className={`p-2 rounded-lg border transition-all ${
                          center.status === "Active"
                            ? "text-amber-500 hover:bg-amber-50 border-amber-200"
                            : "text-emerald-500 hover:bg-emerald-50 border-emerald-200"
                        }`}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(center.id)}
                        className="p-2 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
