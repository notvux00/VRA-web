import { Brain } from "lucide-react";

export default function ExpertNote() {
  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Nhận xét từ chuyên gia</h2>
      <div className="bg-blue-50 dark:bg-black/50 border border-blue-100 dark:border-zinc-800/50 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-700">
            <Brain size={18} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-zinc-900 dark:text-white font-medium mb-1">BS. Sarah Jenkins</h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-3 leading-relaxed">
              "Tommy đã cho thấy sự tiến bộ vượt bậc hôm nay trong mô-đun nhận thức không gian. Bé duy trì sự tập trung trong 12 phút liên tục mà không cần nhắc nhở thị giác, đây là thành tích tốt nhất của bé từ trước đến nay. Hãy tiếp tục thực hành các bài tập thở mà chúng ta đã thảo luận nhé!"
            </p>
            <span className="text-xs text-zinc-500 dark:text-zinc-600 font-medium uppercase tracking-wider">Đăng 2 giờ trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}
