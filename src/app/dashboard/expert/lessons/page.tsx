"use client";

import React, { useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import LessonCard from "./_components/LessonCard";
import VRPairingModal from "./_components/VRPairingModal";

// Mock Data cho danh sách bài học
const mockLessons = [
  {
    id: "l1",
    title: "Nhận biết Cảm xúc Cơ bản",
    category: "Cảm xúc",
    duration: "15",
    ageGroup: "4-6 tuổi",
    difficulty: "Dễ" as const,
    description: "Trẻ học cách nhận biết 4 cảm xúc cơ bản: Vui, Buồn, Tức giận, Sợ hãi thông qua biểu cảm khuôn mặt của nhân vật ảo.",
    imageUrl: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "l2",
    title: "Giao tiếp Ánh mắt qua trò chơi",
    category: "Giao tiếp",
    duration: "20",
    ageGroup: "5-8 tuổi",
    difficulty: "Vừa" as const,
    description: "Khuyến khích trẻ duy trì giao tiếp ánh mắt (Eye-contact) với nhân vật NPC để nhận được vật phẩm trong không gian ảo.",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "l3",
    title: "Kiểm soát Hành vi chốn đông người",
    category: "Hành vi",
    duration: "25",
    ageGroup: "7-12 tuổi",
    difficulty: "Khó" as const,
    description: "Mô phỏng môi trường siêu thị ồn ào. Trẻ cần làm theo hướng dẫn trong khi hệ thống dần tăng mức độ xao nhãng.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "l4",
    title: "Luân phiên trong Hội thoại",
    category: "Giao tiếp",
    duration: "15",
    ageGroup: "6-10 tuổi",
    difficulty: "Vừa" as const,
    description: "Bài học luyện tập kỹ năng chờ đến lượt nói và phản hồi đúng ngữ cảnh trong một nhóm ảo.",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "l5",
    title: "Xếp hình Không gian 3D",
    category: "Nhận thức",
    duration: "10",
    ageGroup: "4-7 tuổi",
    difficulty: "Dễ" as const,
    description: "Nâng cao kỹ năng nhận thức không gian và vận động tinh thông qua việc ghép các khối hình khối màu sắc.",
    imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "l6",
    title: "Qua đường an toàn",
    category: "Kỹ năng sống",
    duration: "30",
    ageGroup: "8-12 tuổi",
    difficulty: "Khó" as const,
    description: "Giả lập môi trường đô thị với xe cộ. Trẻ học luật giao thông cơ bản và cách quan sát trước khi sang đường.",
    imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600&auto=format&fit=crop"
  }
];

const categories = ["Tất cả", "Cảm xúc", "Giao tiếp", "Nhận thức", "Hành vi", "Kỹ năng sống"];

export default function expertLessons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; title: string } | null>(null);

  // Filter lessons based on search query and category
  const filteredLessons = mockLessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Tất cả" || lesson.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartLesson = (id: string, title: string) => {
    setSelectedLesson({ id, title });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
            <BookOpen size={28} className="text-blue-600 dark:text-blue-500" />
            Thư viện Bài học
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Khám phá, lựa chọn và khởi động các phiên trị liệu VR phù hợp với từng trẻ.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full lg:w-auto relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tên bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full lg:w-72 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <LessonCard 
              key={lesson.id}
              {...lesson} 
              onStart={handleStartLesson} 
            />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Không tìm thấy bài học</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
              Rất tiếc, chúng tôi không tìm thấy bài học nào phù hợp với từ khóa "{searchQuery}" trong danh mục "{activeCategory}".
            </p>
          </div>
        )}
      </div>

      {/* VR Pairing Placeholder Modal */}
      <VRPairingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedLesson={selectedLesson}
      />
    </div>
  );
}
