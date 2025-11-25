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
  updatePassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  login: (email: string, password: string) => Promise<void>;
  googleSignUp: () => Promise<{ user: User; isNewUser: boolean }>;
  googleLogin: () => Promise<void>; // Add this back
  setUserPassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("🔄 Auth state changed:", currentUser?.email);

      if (currentUser) {
        setUser(currentUser);
        console.log("✅ User logged in");
      } else {
        setUser(null);
        console.log("👤 User logged out");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      console.log("🔐 Creating account for:", email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("✅ User created successfully:", user.uid);

      // Update profile with display name
      await updateProfile(user, {
        displayName: name,
      });

      console.log("✅ Profile updated with name:", name);

      return user;
    } catch (error) {
      console.error("❌ AuthContext signup error:", error);
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

  const googleSignUp = async (): Promise<{
    user: User;
    isNewUser: boolean;
  }> => {
    try {
      console.log("🔐 Google sign-up initiated");

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Simple check: user is new if they don't have password provider
      const isNewUser = !user.providerData.some(
        (provider) => provider.providerId === "password"
      );

      console.log("✅ Google sign-up successful. New user:", isNewUser);

      return { user, isNewUser };
    } catch (error: any) {
      console.error("❌ Google sign-up error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-up was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        throw new Error(
          "Popup was blocked. Please allow popups for this site."
        );
      } else {
        throw new Error(
          error.message || "Google sign-up failed. Please try again."
        );
      }
    }
  };

  // Add the googleLogin function back
  const googleLogin = async (): Promise<void> => {
    try {
      console.log("🔐 Google login initiated");
      await signInWithPopup(auth, googleProvider);
      console.log("✅ Google login successful");
    } catch (error: any) {
      console.error("❌ Google login error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        throw new Error(
          "Popup was blocked. Please allow popups for this site."
        );
      } else if (error.code === "auth/user-not-found") {
        throw new Error(
          "No account found with this Google email. Please sign up first."
        );
      } else {
        throw new Error(
          error.message || "Google sign-in failed. Please try again."
        );
      }
    }
  };

  const setUserPassword = async (password: string): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error("No user logged in");
      }

      console.log("🔐 Setting password for user:", auth.currentUser.email);

      // Set password for the current user
      await updatePassword(auth.currentUser, password);

      console.log("✅ Password set successfully");
    } catch (error: any) {
      console.error("❌ Set password error:", error);

      if (error.code === "auth/requires-recent-login") {
        // If re-authentication is required, throw a specific error
        throw new Error(
          "Security verification required. Please sign in with Google again."
        );
      } else {
        throw new Error(
          error.message || "Failed to set password. Please try again."
        );
      }
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
    googleSignUp,
    googleLogin, // Make sure this is included
    setUserPassword,
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
