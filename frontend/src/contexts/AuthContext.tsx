"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi, clearToken } from "@/lib/api";

export type Role = "ADMIN" | "MANAGER" | "AFFILIATE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        const userData = await fetchApi("/auth/me");
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user", error);
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
