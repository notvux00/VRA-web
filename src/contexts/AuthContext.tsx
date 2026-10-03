"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { removeSession } from "@/actions/auth";

// We keep track of the Firebase user. For Role, we rely on the session cookie server-side, 
// but we can also store the user state here for client fast-reactivity.
interface AuthContextType {
  user: User | null;
  centerId: string | null;
  centerName: string | null;
  role: string | null;
  userName: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  centerId: null,
  centerName: null,
  role: null,
  userName: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      // 1. Xoá Firebase Auth
      await auth.signOut();
    } catch (error) {
      console.error("Lỗi đăng xuất Firebase:", error);
    }
    
    // 2. Xoá Cache Client
    if (typeof window !== "undefined") {
      localStorage.removeItem("authProfileCache");
    }

    try {
      // 3. Xoá Session Cookie trên Server
      await removeSession();
    } catch (error: any) {
      console.error("Lỗi xoá session:", error);
      
      // Next.js redirect() throws an error with digest NEXT_REDIRECT.
      // If we catch it, we need to let it bubble or do a hard redirect.
      if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
        throw error;
      }
      
      // Fallback redirect nếu removeSession lỗi khác
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    // 1. Initial hydration từ localStorage giúp giao diện mượt trơn không bị giật
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("authProfileCache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          Promise.resolve().then(() => {
            if (parsed.role) setRole(parsed.role);
            if (parsed.centerId) setCenterId(parsed.centerId);
            if (parsed.centerName) setCenterName(parsed.centerName);
            if (parsed.userName) setUserName(parsed.userName);
          });
        } catch {}
      }
    }

    // 2. Lắng nghe auth state từ Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const fallBackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0];
        setUserName(fallBackName ?? null);

        try {
          const { getUserProfile } = await import("@/actions/auth");
          const result = await getUserProfile(firebaseUser.uid);
          
          if (result.success && result.profile) {
            setRole(result.profile.role);
            setCenterId(result.profile.centerId);
            setCenterName(result.profile.centerName);
            
            const finalName = result.profile.name || fallBackName;
            setUserName(finalName);

            // 3. Cache lại profile để lần sau load siêu tốc
            if (typeof window !== "undefined") {
               localStorage.setItem("authProfileCache", JSON.stringify({
                  role: result.profile.role,
                  centerId: result.profile.centerId,
                  centerName: result.profile.centerName,
                  userName: finalName
               }));
            }
          }
        } catch (error) {
          console.error("Error fetching user profile via server action:", error);
        }
      } else {
        setRole(null);
        setCenterId(null);
        setCenterName(null);
        setUserName(null);
        if (typeof window !== "undefined") localStorage.removeItem("authProfileCache");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, centerId, centerName, role, userName, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
