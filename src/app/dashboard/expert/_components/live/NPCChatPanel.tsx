"use client";

import React from "react";
import { MessageCircle, Volume2, MessageSquarePlus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { ChildProfile } from "@/types";

interface NPCChatPanelProps {
  npcText: string;
  setNpcText: (text: string) => void;
  sendingNpc: boolean;
  onSendNpcScript: (text?: string) => void;
  child: ChildProfile | null;
  lessonDocId: string;
  currentQuest: string;
  lessonQuests: any[];
}

export default function NPCChatPanel({
  npcText,
  setNpcText,
  sendingNpc,
  onSendNpcScript,
  child,
  lessonDocId,
  currentQuest,
  lessonQuests
}: NPCChatPanelProps) {
  const childPhrases = (child as any)?.quick_phrases || {};
  const lessonPhrases = childPhrases[lessonDocId] || {};
  const lessonQuestKeys = Object.keys(lessonPhrases).filter(k => k !== "general");
  const activeQuestPhrases = lessonPhrases[currentQuest] || [];
  const generalPhrases = lessonPhrases["general"] || childPhrases["general"] || ["Con làm tốt lắm!", "Tuyệt vời!", "Cố lên con!"];
  const otherQuests = lessonQuestKeys.filter(k => k !== currentQuest);

  const activeQuestObj = lessonQuests.find((q: any) => q.id === currentQuest);
  const activeQuestTitle = activeQuestObj ? activeQuestObj.title : currentQuest;

  return (
    <div className="space-y-4">
      {/* Nói qua NPC (TTS) */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
        <div className="text-xs font-bold text-zinc-200 flex items-center gap-2">
          <MessageCircle size={14} className="text-blue-400" />
          <span>Nói qua NPC (TTS)</span>
        </div>
        <textarea
          value={npcText}
          onChange={(e) => setNpcText(e.target.value)}
          placeholder="Nhập nội dung thoại tiếng Việt (tối đa 200 ký tự)..."
          maxLength={200}
          className="w-full bg-black border border-white/10 rounded p-2.5 text-xs text-white resize-none h-16 focus:outline-none focus:border-zinc-500"
        />
        <button
          disabled={sendingNpc || !npcText.trim()}
          onClick={() => onSendNpcScript()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          {sendingNpc ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <span>Gửi câu thoại</span>
          )}
        </button>
      </div>

      {/* Mẫu câu nhanh */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-4 max-h-[450px] overflow-y-auto">
        <div className="text-xs font-bold text-zinc-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquarePlus size={14} className="text-emerald-400" />
            <span>Mẫu câu nhanh</span>
          </span>
        </div>

        {/* Active Quest Phrases */}
        <div className="space-y-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
            Nhiệm vụ: {activeQuestTitle}
          </div>
          {activeQuestPhrases.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {activeQuestPhrases.map((phrase: string, idx: number) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between gap-2 bg-black/40 border border-white/5 hover:border-blue-500/30 rounded-lg p-2 text-xs transition-colors"
                >
                  <button
                    onClick={() => setNpcText(phrase)}
                    className="text-left text-zinc-300 hover:text-white flex-1 line-clamp-2"
                    title="Click để chỉnh sửa câu thoại"
                  >
                    {phrase}
                  </button>
                  <button
                    onClick={() => onSendNpcScript(phrase)}
                    disabled={sendingNpc}
                    className="p-1 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 rounded transition-colors active:scale-95 disabled:opacity-50"
                    title="Gửi ngay câu thoại này"
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-zinc-500 italic">Không có mẫu câu cho nhiệm vụ này.</p>
          )}
        </div>

        {/* General Phrases */}
        <div className="space-y-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
            Khích lệ chung
          </div>
          <div className="flex flex-col gap-1.5">
            {generalPhrases.map((phrase: string, idx: number) => (
              <div
                key={idx}
                className="group flex items-center justify-between gap-2 bg-black/40 border border-white/5 hover:border-purple-500/30 rounded-lg p-2 text-xs transition-colors"
              >
                <button
                  onClick={() => setNpcText(phrase)}
                  className="text-left text-zinc-300 hover:text-white flex-1 line-clamp-2"
                  title="Click để chỉnh sửa câu thoại"
                >
                  {phrase}
                </button>
                <button
                  onClick={() => onSendNpcScript(phrase)}
                  disabled={sendingNpc}
                  className="p-1 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 rounded transition-colors active:scale-95 disabled:opacity-50"
                  title="Gửi ngay câu thoại này"
                >
                  <Volume2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Other Quests Accordion */}
        {otherQuests.length > 0 && (
          <details className="group/details space-y-2">
            <summary className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold cursor-pointer hover:text-zinc-200 transition-colors list-none flex items-center justify-between">
              <span>Các nhiệm vụ khác ({otherQuests.length})</span>
              <ChevronDown size={14} className="group-open/details:hidden" />
              <ChevronUp size={14} className="hidden group-open/details:block" />
            </summary>
            <div className="flex flex-col gap-4 mt-2 border-t border-white/5 pt-2">
              {otherQuests.map(qId => {
                const qTitle = lessonQuests.find((q: any) => q.id === qId)?.title || qId;
                const phrases = lessonPhrases[qId] || [];
                return (
                  <div key={qId} className="space-y-1">
                    <div className="text-[10px] text-zinc-500">{qTitle}</div>
                    <div className="flex flex-col gap-1.5">
                      {phrases.map((phrase: string, idx: number) => (
                        <div
                          key={idx}
                          className="group flex items-center justify-between gap-2 bg-black/40 border border-white/5 hover:border-zinc-500/30 rounded-lg p-2 text-xs transition-colors"
                        >
                          <button
                            onClick={() => setNpcText(phrase)}
                            className="text-left text-zinc-400 hover:text-white flex-1 line-clamp-2"
                          >
                            {phrase}
                          </button>
                          <button
                            onClick={() => onSendNpcScript(phrase)}
                            disabled={sendingNpc}
                            className="p-1 hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-400 rounded transition-colors active:scale-95 disabled:opacity-50"
                          >
                            <Volume2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
