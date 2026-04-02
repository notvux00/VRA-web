"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { getNavigationByRole, getRoleName } from "./_components/Navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, userName } = useAuth();
  
  const navigation = getNavigationByRole(role || "");
  const roleName = getRoleName(role || "");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex overflow-hidden font-sans transition-colors duration-300">
      
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
        </main>
      </div>
    </div>
  );
}
