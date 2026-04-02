"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

// We keep track of the Firebase user. For Role, we rely on the session cookie server-side, 
// but we can also store the user state here for client fast-reactivity.
interface AuthContextType {
  user: User | null;
  centerId: string | null;
  centerName: string | null;
  role: string | null;
  userName: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  centerId: null,
  centerName: null,
  role: null,
  userName: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial hydration từ localStorage giúp giao diện mượt trơn không bị giật
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("authProfileCache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.role) setRole(parsed.role);
          if (parsed.centerId) setCenterId(parsed.centerId);
          if (parsed.centerName) setCenterName(parsed.centerName);
          if (parsed.userName) setUserName(parsed.userName);
        } catch(e) {}
      }
    }

    // 2. Lắng nghe auth state từ Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const fallBackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0];
        setUserName(fallBackName ?? null);

        try {
          const { getUserProfile } = await import("@/app/actions/auth");
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
    <AuthContext.Provider value={{ user, centerId, centerName, role, userName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
