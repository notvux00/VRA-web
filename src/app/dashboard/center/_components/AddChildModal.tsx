import React, { useState, useEffect } from "react";
import { UserPlus, X, User, ChevronRight, Shield, Loader2, AlertCircle, CheckCircle, Ruler, Weight, Waves, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createChildProfile } from "@/app/actions/center";

// VRA_MODAL_SYNCED_V7.0 (FINAL PROFESSIONAL ALIGNMENT)

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const { centerId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "", linkCode: "" });
  
  const [formData, setFormData] = useState({
    name: "",
    age: 6,
    gender: "male",
    condition: "ASD - Mức độ 1",
    height_cm: 110,
    weight_kg: 20,
    sound_sensitivity: 3,
    anxiety_triggers: "",
    diagnosis_notes: ""
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerId) return;
    
    setLoading(true);
    setMessage({ type: "", text: "", linkCode: "" });

    try {
      const processedData = {
        ...formData,
        anxiety_triggers: formData.anxiety_triggers.split(",").map(t => t.trim()).filter(t => t !== "")
      };

      const result = await createChildProfile(centerId, processedData);
      if (result.success) {
        setMessage({ 
          type: "success", 
          text: "Hồ sơ trẻ đã được tạo thành công!", 
          linkCode: result.linkCode || "" 
        });
        setFormData({ 
          name: "", age: 6, gender: "male", condition: "ASD - Mức độ 1",
          height_cm: 110, weight_kg: 20, sound_sensitivity: 3,
          anxiety_triggers: "", diagnosis_notes: ""
        });
        setStep(1);
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra.", linkCode: "" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ.", linkCode: "" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Cơ bản" },
    { id: 2, title: "Lâm sàng" },
    { id: 3, title: "Chi tiết" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Modal Header - Synchronized Style */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
               <Shield size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Thêm Hồ sơ Trẻ</h3>
          </div>
          <button 
            onClick={() => { if(message.linkCode) onSuccess(); onClose(); }}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Indicators - Integrated Style */}
        <div className="px-6 flex gap-1.5 py-3 border-b border-zinc-50 dark:border-zinc-800/50">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`h-1 rounded-full flex-1 transition-all duration-500 ${step >= s.id ? "bg-emerald-500" : "bg-zinc-100 dark:bg-zinc-800"}`} 
            />
          ))}
        </div>

        {/* Scrollable Content - Synchronized Padding */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {message.linkCode ? (
            <div className="p-8 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 dark:border-emerald-500/5">
                <CheckCircle size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-zinc-900 dark:text-white">Tạo thành công!</h4>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">Hồ sơ trẻ đã được khởi tạo thành công. Bây giờ bạn có thể phân công Chuyên gia và liên kết Phụ huynh.</p>
              </div>
              
              <button 
                onClick={() => { onSuccess(); onClose(); }}
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-extrabold py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-zinc-500/10"
              >
                Hoàn tất
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Họ và tên trẻ</label>
                      <div className="relative group">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                          <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                            placeholder="Nguyễn Văn A"
                            required
                          />
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Tuổi bệnh nhi</label>
                      <div className="relative group">
                          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                          <input 
                            type="number" 
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white"
                            min="1"
                            required
                          />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Giới tính</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                   </div>
                </div>
              )}

              {/* Step 2: Clinical Stats */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Mức độ hỗ trợ (ASD)</label>
                      <select 
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="ASD - Mức độ 1">Mức độ 1 - Cơ bản</option>
                        <option value="ASD - Mức độ 2">Mức độ 2 - Trung bình</option>
                        <option value="ASD - Mức độ 3">Mức độ 3 - Đặc biệt</option>
                      </select>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                          <Ruler size={12} /> Chiều cao (CM)
                        </label>
                        <input 
                          type="number" 
                          value={formData.height_cm}
                          onChange={(e) => setFormData({...formData, height_cm: parseFloat(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-medium focus:border-emerald-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                          <Weight size={12} /> Cân nặng (KG)
                        </label>
                        <input 
                          type="number" 
                          value={formData.weight_kg}
                          onChange={(e) => setFormData({...formData, weight_kg: parseFloat(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-medium focus:border-emerald-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                   </div>

                   <div className="space-y-3 pt-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                           <Waves size={14} /> Nhạy cảm âm thanh
                        </label>
                        <span className="text-emerald-500 font-black text-xs">Phản ứng: {formData.sound_sensitivity}/5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="5" step="1"
                        value={formData.sound_sensitivity}
                        onChange={(e) => setFormData({...formData, sound_sensitivity: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                   </div>
                </div>
              )}

              {/* Step 3: Deep Insights */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Yếu tố gây lo âu</label>
                      <textarea 
                        value={formData.anxiety_triggers}
                        onChange={(e) => setFormData({...formData, anxiety_triggers: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white min-h-[80px] resize-none"
                        placeholder="Tiếng ồn lớn, đèn chớp..."
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Ghi chú & Mục tiêu</label>
                      <textarea 
                        value={formData.diagnosis_notes}
                        onChange={(e) => setFormData({...formData, diagnosis_notes: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white min-h-[100px] resize-none"
                        placeholder="Mô tả mục tiêu trị liệu..."
                      />
                   </div>
                </div>
              )}

              {message.type === "error" && (
                <div className="p-4 rounded-2xl flex items-center gap-3 text-xs font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {message.text}
                </div>
              )}

              {/* Navigation Footer - Synchronized Style */}
              <div className="pt-2 flex flex-col gap-3">
                {step < 3 ? (
                  <button 
                    onClick={handleNext}
                    disabled={step === 1 && !formData.name}
                    className="w-full bg-zinc-950 dark:bg-emerald-600 text-white font-extrabold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight size={18} strokeWidth={3} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="w-full bg-zinc-950 dark:bg-emerald-600 text-white font-extrabold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <UserPlus size={18} strokeWidth={3} />
                        <span>Tạo hồ sơ Trẻ ngay</span>
                      </>
                    )}
                  </button>
                )}
                
                {step > 1 && (
                  <button 
                    onClick={handleBack}
                    className="w-full py-2 text-[10px] font-black text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-[0.2em]"
                  >
                    Quay lại bước trước
                  </button>
                )}
                
                {step === 1 && (
                  <p className="text-[10px] text-center text-zinc-400 font-bold italic px-8 leading-relaxed">
                    * Thông tin lâm sàng được bảo mật theo tiêu chuẩn HIPAA
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
