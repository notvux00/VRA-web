"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, MicOff } from "lucide-react";
import { chatWithBot, ChatMessage } from "@/actions/chatbot";

interface VraChatbotProps {
  childId?: string;
}

export default function VraChatbot({ childId }: VraChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition - webkit prefixed in some browsers
  const SpeechRecognitionAPI = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
  const recognition = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognitionAPI) {
      recognition.current = new SpeechRecognitionAPI();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'vi-VN';

      recognition.current.onresult = (event: Event & { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send after voice?
        // handleSend(transcript); 
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (!childId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages([
          { role: "model", text: "Xin chào! Bạn đang ở trang chung. Xin vui lòng chọn vào một hồ sơ trẻ cụ thể để tôi có thể phân tích dữ liệu cho bạn nhé!" }
        ]);
      } else {
         
        setMessages([
          { role: "model", text: "Xin chào! Tôi là VRA Chatbot. Bạn muốn tôi phân tích dữ liệu hay giải đáp điều gì về tiến độ của bé hôm nay?" }
        ]);
      }
    }
  }, [isOpen, messages.length, childId]);



  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      setInput("");
      recognition.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (textToSend: string = input) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (!childId) {
      const errorMsg: ChatMessage = { role: "model", text: "Xin vui lòng chọn một hồ sơ cụ thể trước khi trò chuyện nhé!" };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
      return;
    }

    // Call Action
    const result = await chatWithBot(childId, textToSend, messages);
    
    if (result.success && result.text) {
      const modelMsg: ChatMessage = { role: "model", text: result.text };
      setMessages(prev => [...prev, modelMsg]);
    } else {
      const errorMsg: ChatMessage = { role: "model", text: "Xin lỗi, đã có lỗi xảy ra: " + (result.error || "Không thể kết nối với hệ thống.") };
      setMessages(prev => [...prev, errorMsg]);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 w-[380px] max-w-[calc(100vw-32px)] h-[550px] max-h-[calc(100vh-100px)] rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">VRA Chatbot</h3>
                <p className="text-blue-100 text-xs">Trợ lý Phân tích Dữ liệu AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-blue-100 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 shrink-0 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mt-auto mb-1">
                    <Bot className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                  </div>
                )}
                
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-sm shadow-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mt-auto mb-1">
                    <User className="text-zinc-500 w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="w-8 h-8 shrink-0 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mt-auto mb-1">
                  <Bot className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                </div>
                <div className="px-5 py-3.5 rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center h-[46px]">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <div className="relative flex items-center">
              <button 
                onClick={toggleListening}
                className={`absolute left-2 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isListening 
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30" 
                    : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-500"
                }`}
                title="Ra lệnh bằng giọng nói"
              >
                {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Đang nghe..." : "Hỏi Chatbot về tiến độ của bé..."}
                disabled={isLoading || isListening}
                className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-full py-3 pl-12 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
              />
              
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || isListening}
                className="absolute right-1.5 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 ${
          isOpen 
            ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900" 
            : "bg-blue-600 text-white"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
