"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  MessageSquare, Send, Search, Loader2, 
  MoreVertical, Smile, Paperclip, ChevronLeft, User, Baby
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getConversationPartners, sendMessage, markMessagesAsRead } from "@/actions/messaging";

interface ChatInterfaceProps {
  role: "parent" | "expert";
}

export default function ChatInterface({ role }: ChatInterfaceProps) {
  const { user, loading: authLoading } = useAuth();
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversation partners
  useEffect(() => {
    async function fetchPartners() {
      const res = await getConversationPartners();
      if (res.success && res.partners) {
        setPartners(res.partners);
        if (res.partners.length > 0) {
          setSelectedPartner(res.partners[0]);
        }
      }
      setLoading(false);
    }
    if (!authLoading) fetchPartners();
  }, [authLoading]);

  // 2. Unread Messages Listener
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Since we now have per-child rooms, the unread count should probably be per room_id
        // but for now let's keep it simple: per sender+child combination
        const key = `${data.senderId}_${data.childId}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      setUnreadCounts(counts);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 3. Real-time Message Listener for Selected Partner (Room based)
  useEffect(() => {
    if (!user?.uid || !selectedPartner || !selectedPartner.childId) return;

    // Build the roomId: sorted([Me, Partner, Child])
    const roomId = [user.uid, selectedPartner.id, selectedPartner.childId].sort().join("_");

    const q = query(
      collection(db, "messages"),
      where("roomId", "==", roomId),
      where("participants", "array-contains", user.uid),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setMessages(msgs);

      // 4. Mark as read if there are unread messages from partner in THIS room
      const hasUnread = msgs.some(m => m.senderId === selectedPartner.id && m.read === false);
      if (hasUnread) {
        markMessagesAsRead(selectedPartner.id, selectedPartner.childId);
      }
    }, (error) => {
      console.error("Firestore Listen Error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid, selectedPartner?.id, selectedPartner?.childId]);

  // 3. Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage(""); 
    
    // Pass childId to ensure it goes to the correct room
    const res = await sendMessage(selectedPartner.id, content, selectedPartner.childId);
    if (!res.success) {
      console.error("Failed to send message:", res.error);
    }
    setSending(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col sm:flex-row gap-6 animate-in fade-in duration-700">
      {/* Sidebar: Partners List */}
      <div className={`w-full sm:w-80 lg:w-96 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm ${selectedPartner && "hidden sm:flex"}`}>
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-4">
            {role === 'parent' ? 'Liên hệ Chuyên gia' : 'Kết nối Phụ huynh'}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder={role === 'parent' ? "Tìm kiếm chuyên gia..." : "Tìm kiếm phụ huynh..."}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {partners.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 italic text-sm">
              Chưa có cuộc trò chuyện nào.
            </div>
          ) : (
            partners.map(partner => {
              const unreadKey = `${partner.id}_${partner.childId}`;
              const isSelected = selectedPartner?.id === partner.id && selectedPartner?.childId === partner.childId;
              
              return (
                <button
                  key={`${partner.id}_${partner.childId}`}
                  onClick={() => setSelectedPartner(partner)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0 ${
                    isSelected ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600"
                  }`}>
                    {partner.name[0]}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-bold truncate text-sm uppercase tracking-tight leading-tight">{partner.name}</h4>
                    <div className="flex items-center gap-1 mt-1 opacity-80">
                      <Baby size={10} className={isSelected ? "text-white" : "text-blue-500"} />
                      <p className={`text-[10px] font-black uppercase tracking-widest truncate ${
                        isSelected ? "text-white" : "text-zinc-500 dark:text-zinc-400"
                      }`}>
                        Bé: {partner.childName || "Tất cả"}
                      </p>
                    </div>
                  </div>
                  
                  {unreadCounts[unreadKey] > 0 && !isSelected && (
                    <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shrink-0">
                      {unreadCounts[unreadKey]}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm ${!selectedPartner && "hidden sm:flex"}`}>
        {selectedPartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedPartner(null)} className="sm:hidden p-2 text-zinc-500">
                  <ChevronLeft />
                </button>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-black">
                  {selectedPartner.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-sm leading-none">{selectedPartner.name}</h3>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-100 dark:border-blue-500/20 rounded text-[8px] font-black uppercase tracking-widest">
                       {role === 'expert' ? 'Phụ huynh' : 'Chuyên gia'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                       <Baby size={12} className="text-blue-500" />
                       <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">Trao đổi về bé: <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 underline-offset-2">{selectedPartner.childName}</span></p>
                    </div>
                    <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Trực tuyến</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {role === 'expert' && (
                  <button 
                    onClick={() => window.location.href = `/dashboard/expert/stats?childId=${selectedPartner.childId}`}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg shadow-zinc-500/10"
                  >
                    <User size={14} />
                    Hồ sơ trẻ
                  </button>
                )}
                <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/10 dark:bg-zinc-900/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                   <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/5 rounded-full flex items-center justify-center text-blue-200 mb-6 border border-blue-100 dark:border-blue-900/20 animate-pulse">
                      <MessageSquare size={36} />
                   </div>
                   <h4 className="text-zinc-900 dark:text-white font-black uppercase tracking-tighter text-base">Khởi đầu câu chuyện</h4>
                   <p className="text-zinc-500 dark:text-zinc-400 font-medium italic text-xs mt-2 max-w-[200px]">
                      Chưa có tin nhắn về bé <span className="text-blue-500 font-bold">{selectedPartner.childName}</span>. 
                      Hãy gửi lời chào đầu tiên!
                   </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] space-y-1`}>
                        <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                          isMe 
                            ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/20" 
                            : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-800"
                        }`}>
                          {msg.content}
                        </div>
                        <p className={`text-[9px] font-bold uppercase tracking-widest text-zinc-400 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-400">
                   <button type="button" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"><Paperclip size={20} /></button>
                   <button type="button" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"><Smile size={20} /></button>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Nhắn cho ${role === 'expert' ? 'Phụ huynh' : 'Chuyên gia'} về bé ${selectedPartner.childName}...`}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="absolute right-2 top-1.5 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center overflow-hidden h-[46px] w-[46px]"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-mr-1" />}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-50 backdrop-blur-3xl bg-zinc-50/10 dark:bg-zinc-800/5">
             <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 mb-8 border border-blue-100 dark:border-blue-800 rotate-12 transition-transform hover:rotate-0 duration-700">
                <MessageSquare size={40} />
             </div>
             <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-4">Hội thoại can thiệp</h3>
             <p className="max-w-xs text-zinc-500 dark:text-zinc-400 font-medium">Chọn một phiên làm việc với trẻ từ danh sách bên trái để trao đổi chi tiết với đối tác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
