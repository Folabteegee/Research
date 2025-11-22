"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<{ name: string; email: string } | null>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Remove useSync from here to break circular dependency
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔄 Auth state changed:", currentUser?.email);

      if (currentUser) {
        setUser(currentUser);
        console.log(
          "✅ User logged in, sync will be handled by SyncInitializer"
        );
      } else {
        setUser(null);
        console.log("👤 User logged out");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Remove sync dependencies

  const signup = async (name: string, email: string, password: string) => {
    try {
      console.log("👤 Creating new account for:", email);
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        setUser(res.user);
        console.log("✅ Account created successfully");
      }
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("🔐 Logging in:", email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  const googleLogin = async (): Promise<{
    name: string;
    email: string;
  } | null> => {
    try {
      console.log("🔐 Google login initiated");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("✅ Google login successful:", user.email);

      return {
        name: user.displayName || user.email?.split("@")[0] || "",
        email: user.email || "",
      };
    } catch (error: any) {
      console.error("❌ Google login error:", error);
      throw new Error(error.message || "Google sign-in failed");
    }
  };

  const logout = async () => {
    try {
      console.log("👤 Logging out...");
      await signOut(auth);
      console.log("✅ Logout successful");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    signup,
    login,
    googleLogin,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
