"use client";

import { 
  Cast, Smartphone, Wifi, Bluetooth, Radio, Battery, Power, ShieldCheck, Zap, Activity, Info, XCircle, LogOut, CheckCircle2 
} from "lucide-react";
import React, { useState, useEffect } from "react";
import VRPairingForm from "../_components/VRPairingForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function ExpertConnectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vrStatus = searchParams.get("vr");
  const isConnected = vrStatus === "connected";
  
  const [showToast, setShowToast] = useState(false);

  const handleDisconnect = () => {
    // Show notification
    setShowToast(true);
    
    // Process "Disconnection" - basically clear the VR param
    setTimeout(() => {
      const current = new URLSearchParams(searchParams.toString());
      current.delete("vr");
      router.push(`/dashboard/expert/connection?${current.toString()}`);
      
      // Clear toast after a bit more time
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const devices = [
    { name: "Meta Quest 3", type: "Headset", battery: 85, status: "Connected", icon: Cast },
    { name: "Quest Controller (L)", type: "Controller", battery: 92, status: "Connected", icon: Radio },
    { name: "Quest Controller (R)", type: "Controller", battery: 42, status: "Warning", icon: Radio },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 sm:p-8 max-w-7xl mx-auto flex flex-col relative pb-32">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3 border border-emerald-400/20 backdrop-blur-md">
              <CheckCircle2 size={18} className="animate-bounce" />
              <p className="text-xs font-black uppercase tracking-widest">Đã ngắt kết nối thành công</p>
           </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        {isConnected ? (
          /* Connected State: Show Devices & Disconnect Button */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {/* Left: Hardware List */}
             <div className="lg:col-span-12">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                   <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                      <Cast size={200} />
                   </div>
                   
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-zinc-50 dark:border-zinc-800 pb-8">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={14} className="text-blue-500" /> Trạng thái phần cứng đang hoạt động
                      </h3>
                      
                      <button 
                        onClick={handleDisconnect}
                        className="flex items-center gap-3 px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 group/btn"
                      >
                         <LogOut size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                         Ngắt kết nối ngay
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                      {devices.map((dev, idx) => (
                         <div key={idx} className="flex flex-col gap-4 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-transparent hover:border-blue-500/20 transition-all group/item hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:shadow-blue-500/5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/item:scale-110 ${
                               dev.status === "Warning" 
                                 ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 shadow-lg shadow-amber-500/10" 
                                 : "bg-white dark:bg-zinc-900 text-zinc-400 group-hover/item:text-blue-500 shadow-md"
                            }`}>
                               <dev.icon size={22} />
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{dev.type}</p>
                               <h4 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">{dev.name}</h4>
                            </div>
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <Battery size={14} className={dev.battery < 50 ? "text-amber-500" : "text-emerald-500"} />
                                  <span className={`text-xs font-black ${dev.battery < 50 ? "text-amber-600" : "text-zinc-900 dark:text-white"}`}>{dev.battery}%</span>
                               </div>
                               <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg border border-emerald-100 dark:border-emerald-500/10">
                                  <div className={`w-1 h-1 rounded-full ${dev.status === "Connected" || dev.status === "Warning" ? "bg-emerald-500" : "bg-zinc-300"}`} />
                                  <span className="text-[8px] font-bold uppercase tracking-tighter opacity-80 text-emerald-600">
                                     {dev.status}
                                  </span>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>

                   {/* Maintenance Tag */}
                   <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex items-start gap-4 border-l-4 border-l-amber-500 relative z-10 transition-all hover:translate-x-1">
                      <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                         <Info size={20} />
                      </div>
                      <div>
                         <h4 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1 italic">Gợi ý bảo trì từ hệ thống</h4>
                         <p className="text-xs font-medium text-amber-900/70 dark:text-amber-400/70 leading-relaxed">
                            Pin tay cầm <span className="font-bold underline text-amber-600 dark:text-amber-500">Quest Controller (R)</span> đang ở mức thấp (42%). Hệ thống đề nghị sạc ngay sau khi kết thúc phiên can thiệp hiện tại để bảo đảm trải nghiệm tốt nhất cho bé.
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          /* Disconnected State: Centered PIN Form Only */
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000 mb-20">
             <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl transition-all duration-700 group-hover:scale-150" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl transition-all duration-700 group-hover:scale-150" />

                <div className="max-w-sm space-y-4 relative z-10">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mx-auto border border-blue-200 dark:border-blue-900/30 mb-6 shadow-xl shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                      <Cast size={24} />
                   </div>
                   <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-tight">Thiết lập kết nối mới</h3>
                   <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                      Lấy mã PIN 6 chữ số đang hiển thị trên ứng dụng <span className="text-blue-600 dark:text-blue-400 font-bold">VRA</span> trên thiết bị VR của bé để bắt đầu phiên.
                   </p>
                </div>

                <div className="relative z-10 w-full flex justify-center">
                   <VRPairingForm />
                </div>

                <button 
                   onClick={() => router.push('/dashboard/expert/connection?vr=connected')}
                   className="mt-6 text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors relative z-10"
                >
                   🚀 Demo nhanh trạng thái đã kết nối
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
