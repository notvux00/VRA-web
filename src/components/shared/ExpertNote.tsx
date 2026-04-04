import { MessageSquare, Quote } from "lucide-react";
import { getChildLatestNote } from "@/actions/parent";

interface ExpertNoteProps {
  childId: string;
}

export default async function ExpertNote({ childId }: ExpertNoteProps) {
  const result = await getChildLatestNote(childId);
  
  if (!result.success || !result.note) return null;

  return (
    <div className="bg-blue-600 dark:bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200 dark:shadow-none">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <MessageSquare size={20} />
          </div>
          <span className="text-sm font-medium uppercase tracking-widest opacity-80">
            Ghi chú từ Chuyên gia
          </span>
        </div>
        
        <div className="relative">
          <Quote className="absolute -top-4 -left-2 opacity-20 w-12 h-12" />
          <p className="text-xl font-medium leading-relaxed mb-6 italic">
            "{result.note}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              CG
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Chuyên gia phụ trách</p>
              <p className="text-xs opacity-70 mt-1">Cập nhật: {result.date || "Gần đây"}</p>
            </div>
          </div>
          <button className="text-sm font-bold px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
            Xem lịch sử
          </button>
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
    </div>
  );
}
