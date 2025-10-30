"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    const newUser = { name, email };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const stored = localStorage.getItem("user");
    if (!stored) throw new Error("No account found. Please sign up first.");
    const userData = JSON.parse(stored);
    if (userData.email === email) setUser(userData);
    else throw new Error("Invalid email or password");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
