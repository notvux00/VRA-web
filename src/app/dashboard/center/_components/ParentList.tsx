"use client";

import React, { useState } from "react";
import { User, Plus, Mail, MessageSquare, MoreHorizontal, UserCheck, Loader2, Eye, Shield, Link as LinkIcon, X, Check, Baby } from "lucide-react";
import { linkParentToChild } from "@/actions/center";

interface ParentListProps {
  parents: any[];
  children: any[]; // All children for linking
  onRefresh: () => void;
}

export default function ParentList({ parents, children, onRefresh }: ParentListProps) {
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLink = async (parentUid: string) => {
    if (!selectedChild) return;
    setSubmitting(true);
    try {
      const res = await linkParentToChild(selectedChild, parentUid);
      if (res.success) {
        setIsLinking(null);
        setSelectedChild("");
        onRefresh();
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden h-fit transition-all duration-300">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">Danh sách Phụ huynh</h2>
          <p className="text-xs text-zinc-500 font-medium">Quản lý tài khoản và liên kết với trẻ</p>
        </div>
        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
          {parents.length} Tài khoản
        </div>
      </div>
      
      <div className="p-1">
        {parents.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {parents.map((parent) => (
              <div key={parent.uid} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/20">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white transition-colors">{parent.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] sm:text-xs font-bold text-zinc-500 flex items-center gap-1">
                           <Mail size={12} /> {parent.email}
                         </span>
                         <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                           {parent.status}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-white transition-colors">
                        <MessageSquare size={18} />
                     </button>
                     <button className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                     </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Baby size={14} className="text-zinc-400" />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tighter">Danh sách trẻ</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Filter children that have this parentUid */}
                    {children.filter(c => c.parentUid === parent.uid).length > 0 ? (
                      children.filter(c => c.parentUid === parent.uid).map((child) => (
                        <div key={child.id} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-full px-3 py-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check size={12} />
                          {child.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic font-medium py-1">Chưa liên kết với trẻ nào</p>
                    )}
                    
                    {isLinking === parent.uid ? (
                      <div className="flex items-center gap-2 mt-2 w-full animate-in slide-in-from-left-2 duration-300">
                        <select 
                          className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs p-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-zinc-200"
                          value={selectedChild}
                          onChange={(e) => setSelectedChild(e.target.value)}
                        >
                          <option value="">Chọn trẻ để liên kết...</option>
                          {children.filter(c => !c.parentUid).map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.linkCode})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleLink(parent.uid)}
                          disabled={submitting || !selectedChild}
                          className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/10 h-8 flex items-center justify-center min-w-[60px]"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={14} /> : "Liên kết"}
                        </button>
                        <button 
                          onClick={() => setIsLinking(null)}
                          className="text-zinc-500 hover:text-zinc-700 p-2 text-xs font-bold"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsLinking(parent.uid)}
                        className="flex items-center gap-1.5 py-1 px-3 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-emerald-600 hover:border-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-400 transition-all text-xs font-bold"
                      >
                        <LinkIcon size={12} /> Liên kết trẻ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 text-zinc-300 border-2 border-dashed border-zinc-100 dark:border-zinc-800 transform rotate-12">
              <User size={32} />
            </div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">Chưa có phụ huynh</h3>
            <p className="text-xs text-zinc-400 max-w-[200px] font-medium leading-relaxed">Hãy cấp tài khoản đầu tiên cho phụ huynh để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
