"use client";

import React from "react";
import Link from "next/link";
import { X, RefreshCcw } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigation: NavigationItem[];
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, navigation }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");
  const isParentRoute = pathname.startsWith("/dashboard/parent");
  const isExpertRoute = pathname.startsWith("/dashboard/expert");
  const isCenterRoute = pathname.startsWith("/dashboard/center");

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-zinc-100 dark:border-zinc-800 mt-2">
          <Link 
            href={(() => {
              if (childId && isParentRoute) return `/dashboard/parent?childId=${childId}`;
              if (childId && isExpertRoute) {
                const q = new URLSearchParams();
                q.set("childId", childId);
                const vrStatus = searchParams.get("vr");
                const sessionId = searchParams.get("session");
                const pin = searchParams.get("pin");
                
                if (vrStatus === "connected") {
                  q.set("vr", "connected");
                  if (sessionId) q.set("session", sessionId);
                  if (pin) q.set("pin", pin);
                } else {
                  q.set("vr", "skipped");
                }
                return `/dashboard/expert?${q.toString()}`;
              }
              return "/dashboard";
            })()}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0 text-center">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 inline-block">
                 <path d="M4 14a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3.4l-1.6 3h-6l-1.6-3H4z" />
               </svg>
             </div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 truncate max-w-[150px]">
                VRA
              </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col">
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">
            Menu chính
          </div>
          <nav className="space-y-1.5 px-3 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              // Handle query params for both parent and expert routes
              let hrefWithChild = item.href;
              if (isParentRoute || isExpertRoute) {
                const query = new URLSearchParams();
                if (childId) query.set("childId", childId);
                
                const vrStatus = searchParams.get("vr");
                if (vrStatus) query.set("vr", vrStatus);
                
                const sessionId = searchParams.get("session");
                if (sessionId) query.set("session", sessionId);
                
                const pin = searchParams.get("pin");
                if (pin) query.set("pin", pin);

                // Special case: Direct navigation to child profile if already selected (Parents)
                if (item.href === "/dashboard/parent/children" && childId) {
                  hrefWithChild = `/dashboard/parent/children/${childId}`;
                }

                if (query.toString()) {
                  hrefWithChild = `${hrefWithChild}?${query.toString()}`;
                }
              }

              return (
                <Link
                  key={item.name}
                  href={hrefWithChild}
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

          {/* Switch Profile Button for Parents & Experts */}
          {((isParentRoute || isExpertRoute) && childId) && (
            <div className="mt-auto px-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
               <Link
                href={(() => {
                   const q = new URLSearchParams();
                   const vrStatus = searchParams.get("vr");
                   const sessionId = searchParams.get("session");
                   const pin = searchParams.get("pin");
                   
                   if (vrStatus) q.set("vr", vrStatus);
                   if (sessionId) q.set("session", sessionId);
                   if (pin) q.set("pin", pin);

                  const basePath = isParentRoute ? "/dashboard/parent" : "/dashboard/expert";
                  return q.toString() ? `${basePath}?${q.toString()}` : basePath;
                })()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20"
              >
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm font-bold">Đổi hồ sơ trẻ</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
