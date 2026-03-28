import React, { useState } from "react";
import { UserPlus, X, User, Calendar, Shield, Loader2, AlertCircle, CheckCircle, Baby, Fingerprint } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createChildProfile } from "@/app/actions/center";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const { centerId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "", linkCode: "" });
  
  const [formData, setFormData] = useState({
    name: "",
    age: 6,
    gender: "male",
    condition: "ASD - Mức độ 1"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerId) return;
    
    setLoading(true);
    setMessage({ type: "", text: "", linkCode: "" });

    try {
      const result = await createChildProfile(centerId, formData);
      if (result.success) {
        setMessage({ 
          type: "success", 
          text: "Hồ sơ trẻ đã được tạo thành công!", 
          linkCode: result.linkCode || "" 
        });
        setFormData({ name: "", age: 6, gender: "male", condition: "ASD - Mức độ 1" });
        // Don't close immediately so they can see the link code
      } else {
        setMessage({ type: "error", text: result.error || "Có lỗi xảy ra.", linkCode: "" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ.", linkCode: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Baby size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Thêm Hồ sơ Trẻ</h3>
          </div>
          <button onClick={() => { onSuccess(); onClose(); }} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {message.linkCode ? (
          <div className="p-8 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50 dark:border-green-500/5">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white">Thành công!</h4>
              <p className="text-sm text-zinc-500 font-medium">Hồ sơ đã được tạo. Hãy gửi mã này cho phụ huynh để liên kết tài khoản.</p>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border-2 border-dashed border-green-200 dark:border-green-500/20 space-y-3">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mã liên kết (Link Code)</p>
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-widest">
                {message.linkCode}
              </div>
              <p className="text-[10px] text-zinc-400 font-bold italic">Mã có hiệu lực trong 48 giờ</p>
            </div>
            
            <button 
              onClick={() => { onSuccess(); onClose(); }}
              className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-extrabold py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-zinc-500/10"
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Họ và tên trẻ</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white"
                    placeholder="Nhập tên của trẻ"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Tuổi</label>
                  <div className="relative group">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors" />
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white"
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
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white appearance-none"
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Mức độ hỗ trợ (ASD)</label>
                <div className="relative group">
                  <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                  <select 
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all dark:text-white appearance-none"
                    required
                  >
                    <option value="ASD - Mức độ 1">Mức độ 1 (Cần hỗ trợ)</option>
                    <option value="ASD - Mức độ 2">Mức độ 2 (Cần hỗ trợ đáng kể)</option>
                    <option value="ASD - Mức độ 3">Mức độ 3 (Cần hỗ trợ rất đáng kể)</option>
                  </select>
                </div>
              </div>
            </div>

            {message.type === "error" && (
              <div className="p-4 rounded-2xl flex items-center gap-3 text-sm font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} />
                {message.text}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-zinc-950 dark:bg-purple-600 text-white font-extrabold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Tạo hồ sơ và Lấy mã"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
