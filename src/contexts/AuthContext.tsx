"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

// We keep track of the Firebase user. For Role, we rely on the session cookie server-side, 
// but we can also store the user state here for client fast-reactivity.
interface AuthContextType {
  user: User | null;
  centerId: string | null;
  centerName: string | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  centerId: null,
  centerName: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const { getUserProfile } = await import("@/app/actions/auth");
          const result = await getUserProfile(firebaseUser.uid);
          
          if (result.success && result.profile) {
            setRole(result.profile.role);
            setCenterId(result.profile.centerId);
            setCenterName(result.profile.centerName);
          }
        } catch (error) {
          console.error("Error fetching user profile via server action:", error);
        }
      } else {
        setRole(null);
        setCenterId(null);
        setCenterName(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, centerId, centerName, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
