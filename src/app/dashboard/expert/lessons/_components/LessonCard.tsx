import React from "react";
import { PlayCircle, Clock, Star, Users } from "lucide-react";

interface LessonCardProps {
  id: string;
  title: string;
  category: string;
  duration: string;
  ageGroup: string;
  difficulty: "Dễ" | "Vừa" | "Khó";
  imageUrl: string;
  description: string;
  onStart: (id: string, title: string) => void;
}

export default function LessonCard({
  id,
  title,
  category,
  duration,
  ageGroup,
  difficulty,
  imageUrl,
  description,
  onStart
}: LessonCardProps) {
  
  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case "Dễ": return "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
      case "Vừa": return "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
      case "Khó": return "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
      default: return "text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Thumbnail Area */}
      <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-black/80 text-zinc-800 dark:text-zinc-200 backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-sm">
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(difficulty)} backdrop-blur-md`}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <Clock size={14} className="text-blue-500" />
            <span>{duration} phút</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <Users size={14} className="text-purple-500" />
            <span>{ageGroup}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium col-span-2">
            <Star size={14} className="text-amber-500" />
            <span>Phù hợp đánh giá: {difficulty}</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onStart(id, title)}
          className="w-full bg-zinc-100 hover:bg-blue-600 dark:bg-zinc-800 dark:hover:bg-blue-600 text-zinc-900 hover:text-white dark:text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 shadow-sm group-hover:shadow-md border border-transparent dark:border-zinc-700"
        >
          <PlayCircle size={18} />
          <span>Bắt đầu bài học</span>
        </button>
      </div>
    </div>
  );
}
