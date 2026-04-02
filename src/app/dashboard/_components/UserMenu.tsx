"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings, ChevronDown, User as UserIcon } from "lucide-react";
import { removeSession } from "@/actions/auth";

interface UserMenuProps {
  user: any;
  userName?: string;
  roleName: string;
}

export default function UserMenu({ user, userName, roleName }: UserMenuProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await removeSession();
  };

  return (
    <div className="relative pl-2 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800" ref={menuRef}>
      <button 
        onClick={() => setProfileOpen(!profileOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">
            {userName || roleName}
          </div>
          <div className="text-xs text-zinc-500 capitalize">{roleName}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-zinc-800 border-2 border-blue-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
          <UserIcon size={20} className="text-blue-600 dark:text-zinc-400" />
        </div>
        <ChevronDown size={16} className="text-zinc-400 hidden sm:block" />
      </button>

      {profileOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 sm:hidden">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user?.email || "Người dùng"}</p>
          </div>
          <Link 
            href="/dashboard/settings" 
            onClick={() => setProfileOpen(false)} 
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
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
  );
}
