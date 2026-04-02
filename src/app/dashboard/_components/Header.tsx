"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Search, Sun, Moon, Bell, Loader2, Building } from "lucide-react";
import { collection, query, orderBy, startAt, endAt, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import UserMenu from "./UserMenu";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any;
  role: string;
  roleName: string;
  userName?: string;
}

export default function Header({ setSidebarOpen, user, role, roleName, userName }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Search logic for Admin only
  useEffect(() => {
    const isAdmin = role === "admin";
    if (!isAdmin || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const centersRef = collection(db, "centers");
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
  }, [searchQuery, role]);

  // Close search when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5"
        >
          <Menu size={24} />
        </button>
        
        {role === "admin" && (
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

        {/* User Profile */}
        <UserMenu user={user} userName={userName} roleName={roleName} />
      </div>
    </header>
  );
}
