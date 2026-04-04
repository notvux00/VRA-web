"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  MessageSquare, Send, Search, Loader2, 
  MoreVertical, Smile, Paperclip, ChevronLeft 
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit,
  or,
  and
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
        counts[data.senderId] = (counts[data.senderId] || 0) + 1;
      });
      setUnreadCounts(counts);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 3. Real-time Message Listener for Selected Partner
  useEffect(() => {
    if (!user?.uid || !selectedPartner) return;

    // Build the roomId: sorted([Me, Partner])
    const roomId = [user.uid, selectedPartner.id].sort().join("_");

    // Build the query: Simply filter by roomId AND ensure user is a participant
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

      // 4. Mark as read if there are unread messages from partner
      const hasUnread = msgs.some(m => m.senderId === selectedPartner.id && m.read === false);
      if (hasUnread) {
        markMessagesAsRead(selectedPartner.id);
      }
    }, (error) => {
      console.error("Firestore Listen Error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid, selectedPartner?.id]);

  // 3. Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    setSending(true);
    const content = newMessage;
    setNewMessage(""); // Clear input early for better UX
    
    const res = await sendMessage(selectedPartner.id, content);
    if (!res.success) {
      console.error("Failed to send message:", res.error);
      // Revert if failed? Or show error.
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
            partners.map(partner => (
              <button
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  selectedPartner?.id === partner.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                  selectedPartner?.id === partner.id ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600"
                }`}>
                  {partner.name[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-bold truncate text-sm uppercase tracking-tight">{partner.name}</h4>
                  <p className={`text-[10px] font-medium uppercase tracking-widest truncate ${
                    selectedPartner?.id === partner.id ? "text-white/70" : "text-zinc-400"
                  }`}>
                    {partner.description || (partner.role === 'expert' ? 'Chuyên gia phụ trách' : 'Phụ huynh học sinh')}
                  </p>
                </div>
                
                {unreadCounts[partner.id] > 0 && selectedPartner?.id !== partner.id && (
                  <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {unreadCounts[partner.id]}
                  </div>
                )}
              </button>
            ))
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
                  <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-sm">{selectedPartner.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Đang trực tuyến</p>
                  </div>
                </div>
              </div>
              <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/10 dark:bg-zinc-900/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <MessageSquare size={48} className="mb-4 text-zinc-300" />
                  <p className="text-zinc-500 font-medium italic">Không có tin nhắn nào. Hãy chào {selectedPartner.name}!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] space-y-1`}>
                        <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                          isMe 
                            ? "bg-blue-600 text-white rounded-tr-none" 
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
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="absolute right-2 top-1.2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-50">
             <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-8 border border-blue-100 dark:border-blue-800">
                <MessageSquare size={40} />
             </div>
             <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-4">Giao tiếp trực tuyến</h3>
             <p className="max-w-xs text-zinc-500 dark:text-zinc-400 font-medium">Chọn một đối tác từ danh sách bên trái để bắt đầu cuộc trò chuyện thời gian thực.</p>
          </div>
        )}
      </div>
    </div>
  );
}
