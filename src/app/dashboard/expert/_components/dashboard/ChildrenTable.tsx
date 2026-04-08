import { Clock, FileText, PlayCircle, Search, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Child {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastSessionAt?: string;
  status: string;
}

interface ChildrenTableProps {
  children: Child[];
}

export default function ChildrenTable({ children: initialChildren }: ChildrenTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChildren = initialChildren.filter(child => 
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Danh sách hồ sơ</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-zinc-600 transition-all font-medium"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-widest border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4">Hồ sơ</th>
              <th className="px-6 py-4">Tình trạng</th>
              <th className="px-6 py-4">Buổi tập cuối</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredChildren.map((child) => (
              <tr key={child.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-zinc-300 font-bold text-sm shadow-sm">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">{child.name}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">ID: {child.id} &bull; {child.age} tuổi</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                    {child.condition}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <Clock size={12} className="text-zinc-400" />
                    {child.lastSessionAt || "Chưa có"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${child.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-600 dark:text-zinc-400">{child.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/dashboard/expert/children/${child.id}`}
                      className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Xem Hồ sơ"
                    >
                      <FileText size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/expert/lessons?childId=${child.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500"
                    >
                      <PlayCircle size={14} />
                      Bắt đầu tập
                    </Link>
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Thêm tùy chọn">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredChildren.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 dark:text-zinc-400">
                  Không tìm thấy hồ sơ nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
