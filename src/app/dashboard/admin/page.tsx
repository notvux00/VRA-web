"use client";

import React, { useState, useEffect } from "react";
import { 
  Building, Users, Activity, ShieldCheck, 
  Server, AlertTriangle, Plus, Search, 
  Loader2, PlayCircle, Power, Trash2, 
  CheckCircle2, XCircle
} from "lucide-react";
import { getCenters, createCenter, getGlobalStats, updateCenterStatus, deleteCenter } from "@/app/actions/auth";

export default function AdminDashboard() {
  const [centers, setCenters] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalTherapists: 0,
    totalChildren: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCenter, setNewCenter] = useState({ 
    name: "", managerName: "", email: "", password: "",
    address: "", phone: "", centerEmail: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [centersRes, statsRes] = await Promise.all([
      getCenters(),
      getGlobalStats()
    ]);
    if (centersRes.success) setCenters(centersRes.centers || []);
    if (statsRes.success) setStats(statsRes.stats);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await createCenter(newCenter);
    if (result.success) {
      setIsModalOpen(false);
      setNewCenter({ 
        name: "", managerName: "", email: "", password: "",
        address: "", phone: "", centerEmail: ""
      });
      fetchData();
    } else {
      setError(result.error || "Không thể tạo trung tâm");
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (centerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const res = await updateCenterStatus(centerId, newStatus);
    if (res.success) {
      setCenters(centers.map(c => c.id === centerId ? { ...c, status: newStatus } : c));
    }
  };

  const handleDelete = async (centerId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trung tâm này? Hành động này không thể hoàn tác.")) {
      const res = await deleteCenter(centerId);
      if (res.success) {
        setCenters(centers.filter(c => c.id !== centerId));
        fetchData();
      }
    }
  };

  // Helper Components
  const StatCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Tổng trung tâm", value: loading ? "..." : stats.totalCenters, icon: Building, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10" },
        { label: "Chuyên gia", value: loading ? "..." : stats.totalTherapists, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10" },
        { label: "Trẻ em", value: loading ? "..." : stats.totalChildren, icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10" },
        { label: "Buổi tập VR", value: loading ? "..." : stats.totalSessions, icon: PlayCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10" },
      ].map((stat, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon size={20} /></div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</div>
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-4">{stat.value}</div>
        </div>
      ))}
    </div>
  );

  const AnalyticCharts = () => {
    const sessionData = [
      { month: "T10", count: 420 }, { month: "T11", count: 380 },
      { month: "T12", count: 510 }, { month: "T01", count: 480 },
      { month: "T02", count: 620 }, { month: "T03", count: 750 },
    ];
    const maxCount = Math.max(...sessionData.map(d => d.count));
    const width = 400;
    const height = 120;
    const points = sessionData.map((d, i) => {
      const x = (i / (sessionData.length - 1)) * width;
      const y = height - (d.count / maxCount) * height;
      return `${x},${y}`;
    }).join(" ");
    const areaPath = `0,${height} ${points} ${width},${height}`;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Hiệu suất Buổi tập</h3>
              <p className="text-xs text-zinc-500 font-medium tracking-tight">Thống kê lưu lượng tham gia VR trên toàn hệ thống.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">+12.5%</span>
            </div>
          </div>
          <div className="relative h-48 w-full mt-4 flex items-end">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline fill="url(#areaGradient)" points={areaPath} />
              <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
              {sessionData.map((d, i) => (
                <circle key={i} cx={(i / (sessionData.length - 1)) * width} cy={height - (d.count / maxCount) * height} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-4 px-1">
            {sessionData.map((d, i) => (<span key={i} className="text-[10px] font-bold text-zinc-400">{d.month}</span>))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-xl uppercase font-black text-[10px] tracking-tighter shrink-0 border border-amber-500/20">Top 5</div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Trung tâm Hoạt động</h3>
          </div>
          <div className="space-y-4 flex-1">
             {[
               { name: "Trung tâm Hy Vọng", sessions: 245 }, { name: "Cơ sở Hà Nội", sessions: 182 },
               { name: "Sunshine Clinic", sessions: 156 }, { name: "VRA Đà Nẵng", sessions: 94 },
               { name: "Green World", sessions: 67 },
             ].map((center, i) => (
               <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                     <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[140px]">{center.name}</span>
                     <span className="text-[10px] font-bold text-zinc-500">{center.sessions} buổi</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                     <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(center.sessions / 300) * 100}%` }} />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Tổng quan</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Theo dõi hoạt động và quản lý các trung tâm trên hệ thống.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          <span>Tạo Trung tâm</span>
        </button>
      </div>

      <StatCards />
      <AnalyticCharts />

      {/* Main Grid: Centers Table */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Danh sách Trung tâm</h2>
          <div className="text-xs text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full uppercase tracking-tighter">Đang hoạt động: {centers.filter(c => c.status === 'Active').length}</div>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-sm text-zinc-500">Đang tải dữ liệu...</span>
            </div>
          ) : centers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400"><Building /></div>
              <h3 className="text-zinc-900 dark:text-white font-bold">Chưa có trung tâm nào.</h3>
              <p className="text-zinc-500 text-sm max-w-xs mt-1">Bắt đầu bằng cách tạo trung tâm trị liệu đầu tiên.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Trung tâm</th>
                  <th className="px-6 py-4 text-center">Đội ngũ</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {centers.map((center) => (
                  <tr key={center.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-zinc-900 dark:text-white">{center.name}</div>
                      <div className="text-xs text-zinc-500 font-medium">{center.email}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {center.therapistCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${center.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/20'}`}>
                        {center.status === 'Active' ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(center.id, center.status)} 
                          className={`p-2 rounded-lg border transition-all ${center.status === 'Active' ? 'text-amber-500 hover:bg-amber-50 border-amber-200' : 'text-emerald-500 hover:bg-emerald-50 border-emerald-200'}`}
                        >
                          <Power size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(center.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Center Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 bg-zinc-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Tạo Trung tâm</h3>
                <p className="text-zinc-400 text-xs mt-1">Cấp tài khoản cho đối tác.</p>
              </div>
              <Building size={32} className="text-zinc-700" />
            </div>
            <form onSubmit={handleOnboard} className="p-8 space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tên Trung tâm</label>
                <input type="text" required className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 text-sm" value={newCenter.name} onChange={e => setNewCenter({...newCenter, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Địa chỉ</label>
                <input type="text" required className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 text-sm" value={newCenter.address} onChange={e => setNewCenter({...newCenter, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Số điện thoại</label>
                  <input type="tel" required className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 text-sm" value={newCenter.phone} onChange={e => setNewCenter({...newCenter, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email liên hệ</label>
                  <input type="email" required className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 text-sm" value={newCenter.centerEmail} onChange={e => setNewCenter({...newCenter, centerEmail: e.target.value})} />
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 pt-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tài khoản Quản lý</h4>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tên Quản lý</label>
                  <input type="text" required className="w-full bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm" value={newCenter.managerName} onChange={e => setNewCenter({...newCenter, managerName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email đăng nhập</label>
                     <input type="email" required className="w-full bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm" value={newCenter.email} onChange={e => setNewCenter({...newCenter, email: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Mật khẩu</label>
                     <input type="password" required className="w-full bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm" value={newCenter.password} onChange={e => setNewCenter({...newCenter, password: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-sm font-bold text-zinc-400">Hủy</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/20">{submitting ? "..." : "Tạo mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
