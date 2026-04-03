"use client";

import React, { useState } from "react";
import { 
  Settings2, ShieldAlert, Zap, Search, 
  ChevronRight, Save, Loader2, CheckCircle,
  AlertCircle, Info
} from "lucide-react";
import { updateAlertProfile } from "@/actions/expert";
import { useAuth } from "@/contexts/AuthContext";

interface AlertProfileEditorProps {
  childId: string;
  initialProfile?: any;
}

const DEFAULT_PROFILE = {
  thresholds: {
    distraction_threshold_sec: 8,
    freeze_threshold_sec: 10,
    deviation_angle_deg: 30,
    idle_threshold_sec: 12,
    hesitation_count: 3,
  },
  groups: {
    stress_overwhelm: { enabled: true, severity: "high" },
    distraction: { enabled: true, severity: "medium" },
    execution_difficulty: { enabled: true, severity: "low" },
  }
};

export default function AlertProfileEditor({ childId, initialProfile }: AlertProfileEditorProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialProfile || DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGroupToggle = (groupKey: string) => {
    setProfile((prev: any) => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupKey]: {
          ...prev.groups[groupKey],
          enabled: !prev.groups[groupKey].enabled
        }
      }
    }));
  };

  const handleThresholdChange = (key: string, value: number) => {
    setProfile((prev: any) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateAlertProfile(user.uid, childId, profile);
      if (res.success) {
        setMessage({ type: "success", text: "Đã cập nhật cấu hình Alert Profile thành công!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Lỗi khi cập nhật cấu hình." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm shadow-zinc-200/50 dark:shadow-none">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings2 size={20} className="text-blue-600" />
          Cấu hình Hỗ trợ & Gợi ý (Assistance)
        </h3>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-zinc-950 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-zinc-500/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          LƯU CẤU HÌNH
        </button>
      </div>

      <div className="p-6 space-y-8">
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 transition-all animate-in zoom-in-95 ${
            message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Support Groups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AlertGroupCard 
            label="😰 Stress / Meltdown"
            isEnabled={profile.groups?.stress_overwhelm?.enabled}
            severity="high"
            onToggle={() => handleGroupToggle('stress_overwhelm')}
          />
          <AlertGroupCard 
            label="😵 Mất tập trung"
            isEnabled={profile.groups?.distraction?.enabled}
            severity="medium"
            onToggle={() => handleGroupToggle('distraction')}
          />
          <AlertGroupCard 
            label="🤔 Cần hướng dẫn"
            isEnabled={profile.groups?.execution_difficulty?.enabled}
            severity="low"
            onToggle={() => handleGroupToggle('execution_difficulty')}
          />
        </div>

        {/* Thresholds */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
            <Zap size={12} /> Thời gian phản hồi (Response Thresholds)
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <ThresholdSlider 
              label="Gợi ý khi đứng hình (Giây)"
              description="Hệ thống nhắc nhở nếu bé không chuyển động"
              value={profile.thresholds?.freeze_threshold_sec}
              min={5}
              max={30}
              onChange={(v) => handleThresholdChange('freeze_threshold_sec', v)}
            />
            <ThresholdSlider 
              label="Nhắc nhở xao nhãng (Giây)"
              description="Gợi ý quay lại mục tiêu nếu bé nhìn ra ngoài"
              value={profile.thresholds?.distraction_threshold_sec}
              min={3}
              max={20}
              onChange={(v) => handleThresholdChange('distraction_threshold_sec', v)}
            />
            <ThresholdSlider 
              label="Góc sai lệch tối đa (Độ)"
              description="Độ lệch góc đầu để bắt đầu tính xao nhãng"
              value={profile.thresholds?.deviation_angle_deg}
              min={10}
              max={60}
              onChange={(v) => handleThresholdChange('deviation_angle_deg', v)}
            />
            <ThresholdSlider 
              label="Hỗ trợ tương tác (Giây)"
              description="Gợi ý hành động nếu bé chưa tương tác với vật thể"
              value={profile.thresholds?.idle_threshold_sec}
              min={5}
              max={60}
              onChange={(v) => handleThresholdChange('idle_threshold_sec', v)}
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
          <Info size={18} className="text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
            Việc điều chỉnh các chỉ số này giúp cá nhân hóa bài tập cho từng trẻ. Khi đạt đến ngưỡng thời gian quy định, hệ thống VR sẽ tự động đưa ra các gợi ý (Audio/Visual Hint) để hỗ trợ trẻ hoàn thành bài tập.
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertGroupCard({ label, isEnabled, severity, onToggle }: { label: string, isEnabled: boolean, severity: string, onToggle: () => void }) {
  const getSeverityColor = () => {
    if (severity === 'high') return 'bg-red-500';
    if (severity === 'medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div 
      onClick={onToggle}
      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
        isEnabled 
          ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-md ring-2 ring-blue-500/20' 
          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60 grayscale'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className={`w-2 h-2 rounded-full ${getSeverityColor()}`} />
        <div className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isEnabled ? 'right-0.5' : 'left-0.5'}`} />
        </div>
      </div>
      <p className={`text-xs font-black uppercase tracking-tight ${isEnabled ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
        {label}
      </p>
    </div>
  );
}

function ThresholdSlider({ label, description, value, min, max, onChange }: { label: string, description: string, value: number, min: number, max: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-zinc-900 dark:text-white">{label}</p>
          <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
        </div>
        <span className="text-sm font-black text-blue-600">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}
