"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal, Eye, EyeOff, MessageCircle, Save,
  Loader2, CheckCircle, AlertCircle, RotateCcw, Zap,
  Film, BookOpen, Copy, Clipboard, X, ChevronDown
} from "lucide-react";
import { updateDefaultLessonParams, importChildSettings } from "@/actions/expert";

interface LessonParamsEditorProps {
  childId: string;
  childName: string;
  initialParams?: any;
  initialPhrases?: any;
}

// -1 = dùng mặc định hệ thống (VR Inspector fallback)
const DEFAULT_PARAMS = {
  actions: {
    enable_auto_hint: true,
    enable_visual_guidance: true,
    enable_bubble_hints: true,
    speech_silence_timeout: -1,
    action_reminder_cycle: -1,
    gaze_cone_angle: -1,
  },
  quiz: {
    quiz_intro_delay: -1,
    quiz_sound_gap: -1,
    quiz_end_delay: -1,
  },
  exploration: {
    camera_move_speed: -1,
    sound_to_description_gap: -1,
  },
};

function mergeWithDefaults(initial: any) {
  const res = {
    actions: { ...DEFAULT_PARAMS.actions },
    quiz: { ...DEFAULT_PARAMS.quiz },
    exploration: { ...DEFAULT_PARAMS.exploration },
  };
  if (!initial) return res;

  const mergeCategory = (category: "actions" | "quiz" | "exploration") => {
    if (initial[category]) {
      const target = res[category] as Record<string, number | boolean>;
      const source = initial[category] as Record<string, number | boolean | null | undefined>;

      Object.keys(target).forEach((key) => {
        const val = source[key];
        if (val !== undefined && val !== null) {
          target[key] = val;
        }
      });
    }
  };

  mergeCategory("actions");
  mergeCategory("quiz");
  mergeCategory("exploration");

  return res;
}

export default function LessonParametersEditor({ childId, childName, initialParams, initialPhrases }: LessonParamsEditorProps) {
  const [params, setParams] = useState(mergeWithDefaults(initialParams));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States for Sharing/Importing Settings
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCodeText, setImportCodeText] = useState("");
  const [decodedImportData, setDecodedImportData] = useState<any>(null);
  const [importError, setImportError] = useState("");
  const [importPhrasesOption, setImportPhrasesOption] = useState(true);
  const [importParamsOption, setImportParamsOption] = useState(true);
  const [importing, setImporting] = useState(false);

  // Export current child configuration as base64 token
  const handleExportConfig = () => {
    try {
      const configObj = {
        type: "vra-autism-config",
        version: "1.0",
        childName: childName,
        quick_phrases: initialPhrases || {},
        default_lesson_params: params
      };
      
      const jsonString = JSON.stringify(configObj);
      const base64Code = "VRA-CFG-" + btoa(unescape(encodeURIComponent(jsonString)));
      
      navigator.clipboard.writeText(base64Code);
      setMessage({ type: "success", text: `Đã sao chép mã cài đặt của bé ${childName} vào bộ nhớ tạm!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error("Lỗi khi tạo mã cài đặt:", e);
      setMessage({ type: "error", text: "Không thể tạo mã cài đặt." });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Decode and validate token in real-time
  const handleImportCodeChange = (val: string) => {
    setImportCodeText(val);
    setImportError("");
    setDecodedImportData(null);
    if (!val.trim()) return;

    try {
      const cleanVal = val.trim();
      if (!cleanVal.startsWith("VRA-CFG-")) {
        setImportError("Mã cài đặt không đúng định dạng VRA-CFG-...");
        return;
      }

      const base64String = cleanVal.substring(8);
      const jsonString = decodeURIComponent(escape(atob(base64String)));
      const parsed = JSON.parse(jsonString);

      if (parsed.type !== "vra-autism-config") {
        setImportError("Mã cài đặt không đúng định dạng!");
        return;
      }

      setDecodedImportData(parsed);
      setImportPhrasesOption(!!parsed.quick_phrases);
      setImportParamsOption(!!parsed.default_lesson_params);
    } catch (e) {
      setImportError("Mã cài đặt bị lỗi hoặc không thể giải mã!");
    }
  };

  // Submit imported config to Firestore and update local state
  const handleApplyImport = async () => {
    if (!decodedImportData) return;
    setImporting(true);
    setImportError("");
    try {
      const importPayload: any = {};
      if (importPhrasesOption && decodedImportData.quick_phrases) {
        importPayload.quick_phrases = decodedImportData.quick_phrases;
      }
      if (importParamsOption && decodedImportData.default_lesson_params) {
        importPayload.default_lesson_params = decodedImportData.default_lesson_params;
      }

      const res = await importChildSettings(childId, importPayload);
      if (res.success) {
        if (importPayload.default_lesson_params) {
          setParams(mergeWithDefaults(importPayload.default_lesson_params));
        }
        setMessage({ 
          type: "success", 
          text: `Đã áp dụng thành công cài đặt của bé ${decodedImportData.childName} cho bé ${childName}!` 
        });
        setTimeout(() => setMessage(null), 4000);
        setIsImportModalOpen(false);
        setImportCodeText("");
        setDecodedImportData(null);
      } else {
        setImportError(res.error || "Không thể lưu cài đặt nhập vào.");
      }
    } catch (e: unknown) {
      setImportError("Lỗi kết nối mạng khi áp dụng cài đặt.");
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateDefaultLessonParams(childId, params);
      if (res.success) {
        setMessage({ type: "success", text: "Đã lưu cấu hình tham số bài học thành công!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Lỗi khi lưu cấu hình." });
      }
    } catch {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    setMessage(null);
  };

  const setActions = (patch: Partial<typeof DEFAULT_PARAMS.actions>) =>
    setParams(p => ({ ...p, actions: { ...p.actions, ...patch } }));

  const setQuiz = (patch: Partial<typeof DEFAULT_PARAMS.quiz>) =>
    setParams(p => ({ ...p, quiz: { ...p.quiz, ...patch } }));

  const setExploration = (patch: Partial<typeof DEFAULT_PARAMS.exploration>) =>
    setParams(p => ({ ...p, exploration: { ...p.exploration, ...patch } }));

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-4 bg-zinc-50/50 dark:bg-zinc-800/10">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <SlidersHorizontal size={22} className="text-indigo-600" />
          Tham Số Bài Học VR (Lesson Parameters)
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Đặt lại
          </button>

          {/* Copy & Apply settings menu (Story 3.9) */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Copy size={13} className="text-indigo-600 dark:text-indigo-450" />
              Sao chép / Áp dụng
              <ChevronDown size={13} className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl z-20 py-2 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      handleExportConfig();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer"
                  >
                    <Copy size={14} className="text-zinc-500" />
                    Sao chép mã cài đặt
                  </button>
                  <button
                    onClick={() => {
                      setIsImportModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer"
                  >
                    <Clipboard size={14} className="text-zinc-500" />
                    Áp dụng cài đặt
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            LƯU
          </button>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Toast */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 border border-emerald-100 dark:border-emerald-500/20"
              : "bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20"
          }`}>
            {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* ── Dạng bài: Actions ── */}
        <Section icon={<Zap size={16} className="text-amber-500" />} title="Bài tập Hành vi (Actions)">
          {/* Enable Auto Hint toggle */}
          <ToggleRow
            label="Tự động nhắc nhở (Auto Hint)"
            description="Bật/Tắt chế độ tự động nhắc nhở hoặc hiển thị nháy viền từ hệ thống."
            icon={<Zap size={16} />}
            checked={params.actions.enable_auto_hint}
            onChange={v => setActions({ enable_auto_hint: v })}
          />
          {/* Visual Guidance toggle */}
          <ToggleRow
            label="Hiệu ứng viền phát sáng (Outline)"
            description="Tắt khi trẻ nhạy cảm với ánh sáng nhấp nháy."
            icon={params.actions.enable_visual_guidance ? <Eye size={16} /> : <EyeOff size={16} />}
            checked={params.actions.enable_visual_guidance}
            onChange={v => setActions({ enable_visual_guidance: v })}
          />
          {/* Bubble Hints toggle */}
          <ToggleRow
            label="Bong bóng câu hỏi (Bubble Hints)"
            description="Tắt nếu trẻ bị phân tâm bởi thông tin nổi."
            icon={<MessageCircle size={16} />}
            checked={params.actions.enable_bubble_hints}
            onChange={v => setActions({ enable_bubble_hints: v })}
          />
          {/* Action Reminder Cycle */}
          <SentinelSlider
            label="Chu kỳ nhắc nhở tự động (giây)"
            description="Khoảng cách giữa các lần hệ thống tự nhắc nếu trẻ không phản hồi."
            value={params.actions.action_reminder_cycle}
            min={5}
            max={60}
            systemDefault={10}
            onChange={v => setActions({ action_reminder_cycle: v })}
          />
          {/* Gaze Cone Angle */}
          <SentinelSlider
            label="Góc mở nón thị giác (độ)"
            description="Góc mở toàn phần của hình nón thị giác (từ 5 đến 15 độ) dùng để theo dõi độ tập trung ánh nhìn."
            value={params.actions.gaze_cone_angle}
            min={5}
            max={15}
            systemDefault={10}
            onChange={v => setActions({ gaze_cone_angle: v })}
          />
        </Section>

        {/* ── Dạng bài: Quiz ── */}
        <Section icon={<BookOpen size={16} className="text-blue-500" />} title="Bài trắc nghiệm (Quiz)">
          <SentinelSlider
            label="Trễ giới thiệu Quiz (giây)"
            description="Thời gian chờ trước khi phát âm thanh intro."
            value={params.quiz.quiz_intro_delay}
            min={0}
            max={10}
            systemDefault={2}
            onChange={v => setQuiz({ quiz_intro_delay: v })}
          />
          <SentinelSlider
            label="Khoảng dừng giữa các âm thanh (giây)"
            description="Khoảng cách giữa câu hỏi và âm thanh tiếng kêu con vật."
            value={params.quiz.quiz_sound_gap}
            min={0}
            max={5}
            systemDefault={0.5}
            step={0.1}
            onChange={v => setQuiz({ quiz_sound_gap: v })}
          />
          <SentinelSlider
            label="Trễ kết thúc Quiz (giây)"
            description="Thời gian đợi trước khi trở về màn hình chờ sau khi Quiz hoàn thành."
            value={params.quiz.quiz_end_delay}
            min={1}
            max={10}
            systemDefault={3}
            onChange={v => setQuiz({ quiz_end_delay: v })}
          />
        </Section>

        {/* ── Dạng bài: Exploration ── */}
        <Section icon={<Film size={16} className="text-emerald-500" />} title="Tham quan động vật (Exploration)">
          <SentinelSlider
            label="Tốc độ di chuyển camera"
            description="Tốc độ lerp camera giữa các chuồng thú. Chậm hơn giúp trẻ không bị chóng mặt."
            value={params.exploration.camera_move_speed}
            min={0.2}
            max={5}
            systemDefault={2}
            step={0.1}
            onChange={v => setExploration({ camera_move_speed: v })}
          />
          <SentinelSlider
            label="Dừng giữa tiếng kêu và mô tả (giây)"
            description="Khoảng dừng sau tiếng kêu trước khi phát thông tin mô tả."
            value={params.exploration.sound_to_description_gap}
            min={0}
            max={10}
            systemDefault={4}
            onChange={v => setExploration({ sound_to_description_gap: v })}
          />
        </Section>

        {/* Info note */}
        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed">
          Các cài đặt này sẽ được đồng bộ tự động vào kính VR ngay khi buổi học bắt đầu.
          Giá trị &quot;<strong>Mặc định hệ thống</strong>&quot; có nghĩa là kính VR sẽ dùng cấu hình được cài sẵn trong Unity Inspector — phù hợp khi không cần tùy chỉnh đặc biệt cho bé.
        </div>
      </div>
    </div>
      
      {/* Import Modal Overlay (Story 3.9) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <Clipboard size={18} className="text-indigo-600" />
                Áp dụng cài đặt từ bé khác
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportCodeText("");
                  setDecodedImportData(null);
                  setImportError("");
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-250 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Nhập mã cấu hình (VRA-CFG-...)
                </label>
                <textarea
                  value={importCodeText}
                  onChange={(e) => handleImportCodeChange(e.target.value)}
                  placeholder="Dán mã cấu hình của trẻ nguồn tại đây..."
                  rows={4}
                  className="w-full p-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all resize-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600"
                />
              </div>

              {/* Error Message */}
              {importError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-500/20 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}

              {/* Decoded configuration details */}
              {decodedImportData && (
                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nguồn cấu hình:</span>
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-1 rounded-lg">
                      Bé {decodedImportData.childName}
                    </span>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                      Tùy chọn áp dụng:
                    </span>
                    
                    {decodedImportData.quick_phrases && (
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={importPhrasesOption}
                          onChange={(e) => setImportPhrasesOption(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black text-zinc-850 dark:text-zinc-200">Các mẫu câu nói nhanh (Quick Phrases)</p>
                          <p className="text-[10px] text-zinc-400">Sao chép bộ câu mẫu thiết lập cho bé {decodedImportData.childName}</p>
                        </div>
                      </label>
                    )}

                    {decodedImportData.default_lesson_params && (
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={importParamsOption}
                          onChange={(e) => setImportParamsOption(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black text-zinc-850 dark:text-zinc-200">Tham số mặc định bài học (Parameters)</p>
                          <p className="text-[10px] text-zinc-400">Tốc độ camera, chu kỳ nhắc nhở, góc mở nón thị giác...</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportCodeText("");
                  setDecodedImportData(null);
                  setImportError("");
                }}
                disabled={importing}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                disabled={importing || !decodedImportData || (!importPhrasesOption && !importParamsOption)}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer"
              >
                {importing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Xác nhận áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
        {icon} {title}
      </h4>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, icon, checked, onChange }: {
  label: string; description: string; icon: React.ReactNode;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
        checked
          ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm ring-1 ring-indigo-500/10"
          : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800 opacity-60"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 p-2 rounded-xl ${checked ? "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-zinc-900 dark:text-white">{label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        </div>
      </div>
      {/* Toggle pill */}
      <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ml-4 ${checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "right-1" : "left-1"}`} />
      </div>
    </div>
  );
}

function SentinelSlider({ label, description, value, min, max, systemDefault, step = 1, onChange }: {
  label: string; description: string;
  value: number; min: number; max: number; systemDefault: number;
  step?: number; onChange: (v: number) => void;
}) {
  const isDefault = value === -1 || value === undefined || value === null;
  const displayValue = isDefault ? systemDefault : value;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-zinc-900 dark:text-white">{label}</p>
          <p className="text-[10px] text-zinc-500 font-medium tracking-tight mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* "Use system default" toggle */}
          <button
            onClick={() => onChange(isDefault ? systemDefault : -1)}
            className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all border ${
              isDefault
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/30"
            }`}
          >
            {isDefault ? "Mặc định HT" : "Tuỳ chỉnh"}
          </button>
          <span className={`text-base font-black px-3 py-1 rounded-lg ${isDefault ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600"}`}>
            {isDefault ? "—" : `${displayValue}`}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        disabled={isDefault}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
      />
    </div>
  );
}
