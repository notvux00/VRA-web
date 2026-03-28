import { Users } from "lucide-react";

interface Manager {
  uid: string;
  name: string;
  email: string;
}

interface ManagerListProps {
  managers: Manager[];
}

export default function ManagerList({ managers }: ManagerListProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quản lý trung tâm</h2>
        </div>
        <span className="text-[10px] font-black bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
          {managers.length} Thành viên
        </span>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 min-h-[200px]">
        {managers.map((manager, idx) => (
          <div key={manager.uid} className="p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-white border border-zinc-200 dark:border-zinc-700">
                {manager.name[0]}
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  {manager.name}
                  {idx === 0 && (
                    <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md uppercase font-black tracking-widest">Chủ sở hữu chính</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 font-medium">{manager.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
