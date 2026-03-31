import React, { useState } from "react";
import { X, Smartphone, AlertCircle, Loader2, CheckCircle2, MonitorSmartphone } from "lucide-react";

interface VRPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson: { id: string; title: string } | null;
}

export default function VRPairingModal({ isOpen, onClose, selectedLesson }: VRPairingModalProps) {
  const [pin, setPin] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Developer Mode - Simulated VR Headset
  const [simulatedPin, setSimulatedPin] = useState<string | null>(null);

  if (!isOpen || !selectedLesson) return null;

  const handleGenerateSimulatedPin = () => {
    // Tạo ngẫu nhiên mã PIN 6 chữ số
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedPin(randomPin);
    setError(""); // Xóa lỗi cũ nếu có
  };

  const handleConnect = () => {
    if (pin.length < 6) {
      setError("Vui lòng nhập đủ mã PIN 6 chữ số hiển thị trên kính VR.");
      return;
    }
    
    setError("");
    setIsConnecting(true);
    
    // Giả lập thời gian chờ kết nối mạng
    setTimeout(() => {
      setIsConnecting(false);
      
      // So sánh mã PIN với mã giả lập (hoặc mã dev cứng "123456")
      if (pin === simulatedPin || pin === "123456") {
        setSuccess(true);
      } else {
        setError("Mã PIN không hợp lệ hoặc thiết bị VR đã ngắt kết nối.");
      }
    }, 1500);
  };

  const handleClose = () => {
    setPin("");
    setError("");
    setSuccess(false);
    setIsConnecting(false);
    setSimulatedPin(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Ghép nối thiết bị VR</h2>
            <p className="text-sm text-zinc-500 mt-1 line-clamp-1">Bài học: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedLesson.title}</span></p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 bg-white/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors absolute top-6 right-6"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/60 dark:to-purple-900/60 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <Smartphone size={40} className="text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full flex items-center justify-center animate-ping pointer-events-none"></div>
          </div>
          
          <h3 className="text-lg font-bold text-center mb-2 text-zinc-900 dark:text-white">Nhập mã kết nối</h3>
          <p className="text-sm text-zinc-500 text-center mb-6 w-5/6">
            Mở ứng dụng VR trên kính của trẻ, nhìn vào màn hình chờ và nhập mã hiển thị gồm 6 chữ số vào đây.
          </p>

          <div className="flex gap-2 w-full justify-center mb-2">
            <input 
              type="text" 
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6))}
              className={`w-full text-center text-3xl tracking-[0.5em] font-mono font-bold bg-zinc-100 dark:bg-zinc-950 border-2 rounded-2xl py-4 focus:outline-none focus:ring-4 transition-all text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700
                ${success ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-600 dark:text-emerald-400" : 
                  error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-600 dark:text-red-400" : 
                  "border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"}`}
              placeholder="000000"
              disabled={isConnecting || success}
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 w-full animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-600 dark:text-red-400 leading-snug">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex flex-col items-center text-center gap-2 w-full animate-in zoom-in-95 duration-300">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Kết nối thành công!</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-500/80">Kính VR số hiệu #{simulatedPin || "123456"} đã sẵn sàng. Trẻ đang ở màn hình chờ...</p>
              <button 
                onClick={handleClose}
                className="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-500/20 transition-colors"
              >
                Vào Bảng Điều Khiển Session
              </button>
            </div>
          )}

          {!success && (
            <button 
              onClick={handleConnect}
              disabled={isConnecting || pin.length < 6}
              className={`w-full mt-6 py-4 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-white transition-all shadow-lg shadow-blue-500/30
                ${isConnecting ? "bg-blue-400 cursor-not-allowed" : pin.length < 6 ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98]"}`}
            >
              {isConnecting ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-xs font-medium opacity-80">Đang tìm thiết bị...</span>
                </>
              ) : (
                <span className="text-lg">Ghép nối & Khởi động</span>
              )}
            </button>
          )}

          {/* Dev Mode - Simulator Tools */}
          {!success && (
            <div className="mt-8 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 w-full flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-3">Công cụ Giả lập (Developer)</span>
              
              {!simulatedPin ? (
                <button
                  onClick={handleGenerateSimulatedPin}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  <MonitorSmartphone size={14} />
                  <span>Bật Kính VR Ảo</span>
                </button>
              ) : (
                <div className="bg-zinc-900 dark:bg-black rounded-xl p-4 w-full border border-zinc-800 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <MonitorSmartphone className="text-blue-500" size={20} />
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium">KÍNH VR ĐANG HIỂN THỊ MÃ</p>
                      <p className="text-lg font-mono font-bold text-white tracking-[0.2em]">{simulatedPin}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPin(simulatedPin)}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 rounded text-xs font-bold transition-colors"
                  >
                    Sao chép
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
