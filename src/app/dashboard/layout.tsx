"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, Users, Calendar, Settings, HelpCircle, Bell, Menu, X, LogOut, Search, Sun, Moon, ChevronDown, User as UserIcon, PlayCircle, Building, ShieldCheck, BarChart3, Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { removeSession } from "@/app/actions/auth";
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, centerName } = useAuth();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Search logic for Admin only
  useEffect(() => {
    const isAdmin = pathname.includes("/dashboard/admin");
    if (!isAdmin || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const centersRef = collection(db, "centers");
        // Simple prefix search using startAt/endAt
        const q = query(
          centersRef, 
          orderBy("name"),
          startAt(searchQuery),
          endAt(searchQuery + "\uf8ff"),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, pathname]);

  // Close dropdowns when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await removeSession();
  };

  const isTherapist = pathname.includes("/dashboard/therapist");
  const isAdmin = pathname.includes("/dashboard/admin");
  const isCenter = pathname.includes("/dashboard/center");

  const parentNavigation = [
    { name: "Tổng quan", href: "/dashboard/parent", icon: LayoutDashboard },
  ];

  const therapistNavigation = [
    { name: "Trang chủ", href: "/dashboard/therapist", icon: LayoutDashboard },
  ];

  const adminNavigation = [
    { name: "Tổng quan", href: "/dashboard/admin", icon: ShieldCheck },
    { name: "Trung tâm", href: "/dashboard/admin/centers", icon: Building },
  ];

  const centerNavigation = [
    { name: "Tổng quan", href: "/dashboard/center", icon: Building },
  ];

  let navigation = parentNavigation;
  if (isTherapist) navigation = therapistNavigation;
  if (isAdmin) navigation = adminNavigation;
  if (isCenter) navigation = centerNavigation;

  const roleName = isAdmin ? "Quản trị viên" : isCenter ? "Quản lý Trung tâm" : isTherapist ? "Chuyên gia" : "Phụ huynh";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex overflow-hidden font-sans transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-transparent dark:border-transparent mt-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
               {/* Custom VR / VRA Logo */}
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                 <path d="M4 14a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3.4l-1.6 3h-6l-1.6-3H4z" />
               </svg>
             </div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 truncate max-w-[150px]">
                {isCenter && centerName ? centerName : "VRA"}
              </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">
            Menu chính
          </div>
          <nav className="space-y-1.5 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive 
                      ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20 dark:bg-blue-600/90" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <Menu size={24} />
            </button>
            
            {isAdmin && (
              <div className="hidden sm:flex items-center relative" ref={searchRef}>
                <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute left-3" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm trung tâm..." 
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm w-64 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500 dark:focus:border-zinc-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-zinc-600 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {isSearching && (
                  <div className="absolute right-3">
                    <Loader2 size={16} className="animate-spin text-zinc-400" />
                  </div>
                )}

                {/* Search Results Dropdown */}
                {searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Kết quả tìm kiếm</span>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">{searchResults.length} Tìm thấy</span>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="p-1">
                          {searchResults.map((center) => (
                            <Link 
                              key={center.id}
                              href={`/dashboard/admin/centers/${center.id}`}
                              onClick={() => setSearchQuery("")}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-700">
                                <Building size={18} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">{center.name}</div>
                                <div className="text-[10px] text-zinc-500 truncate">{center.address || "Chưa có địa chỉ"}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        !isSearching && (
                          <div className="p-8 text-center">
                            <Search size={32} className="mx-auto text-zinc-200 mb-3" />
                            <p className="text-xs text-zinc-500 font-medium">Không tìm thấy trung tâm nào khớp với "{searchQuery}"</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Chuyển đổi chủ đề"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            <button className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative pl-2 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800" ref={menuRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">
                    {user?.displayName || user?.email?.split('@')[0] || roleName}
                  </div>
                  <div className="text-xs text-zinc-500 capitalize">{roleName}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-zinc-800 border-2 border-blue-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                  <UserIcon size={20} className="text-blue-600 dark:text-zinc-400" />
                </div>
                <ChevronDown size={16} className="text-zinc-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 sm:hidden">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user?.email || "Người dùng"}</p>
                  </div>
                  <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Settings size={16} /> Cài đặt người dùng
                  </Link>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900/40 dark:via-black dark:to-black">
          {children}
        </main>
      </div>
    </div>
  );
}
