"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { getNavigationByRole, getRoleName } from "./_components/Navigation";
import VRConnectionMonitor from "@/app/dashboard/expert/_components/VRConnectionMonitor";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, userName } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const childId = searchParams.get("childId");
  const pin = searchParams.get("pin");
  const isVRConnected = searchParams.get("vr") === "connected";
  const navigation = getNavigationByRole(role || "");
  const roleName = getRoleName(role || "");

  // Netflix-style behavior: Hide UI if it's the selection screen
  const isProfileSelection = 
    (role === "parent" && pathname === "/dashboard/parent" && !childId) ||
    ((role === "expert" || role === "therapist") && pathname === "/dashboard/expert" && !childId);

  if (isProfileSelection) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans transition-colors duration-300 flex items-center justify-center">
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex overflow-hidden font-sans transition-colors duration-300">
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        navigation={navigation} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          role={role || ""}
          roleName={roleName}
          userName={userName ?? undefined}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900/40 dark:via-black dark:to-black">
          {children}
          
          {/* Trực ban theo dõi kết nối VR Xuyên suốt mọi trang */}
          {isVRConnected && pin && <VRConnectionMonitor pin={pin} />}
        </main>
      </div>
    </div>
  );
}
