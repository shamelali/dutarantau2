"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserPersona {
  id: number;
  name: string;
  email: string;
  role: string;
  city: string;
  country: string;
  profession: string;
  avatar: string | null;
  bio?: string | null;
  phone?: string | null;
  verified?: boolean;
}

interface AuthContextType {
  user: UserPersona | null;
  personas: UserPersona[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  switchPersona: (userId: number) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "register";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPersona | null>(null);
  const [personas, setPersonas] = useState<UserPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPersonas = async () => {
    try {
      const res = await fetch("/api/auth/personas");
      if (res.ok) {
        const data = await res.json();
        if (data.personas) {
          setPersonas(data.personas);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchPersonas();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setIsAuthModalOpen(false);
        return true;
      } else {
        throw new Error(data.error || "Login gagal");
      }
    } catch (e: any) {
      alert(e.message);
      return false;
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        fetchPersonas();
        setIsAuthModalOpen(false);
        return true;
      } else {
        throw new Error(data.error || "Pendaftaran gagal");
      }
    } catch (e: any) {
      alert(e.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const switchPersona = async (userId: number) => {
    try {
      const res = await fetch("/api/auth/switch-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        personas,
        isLoading,
        login,
        register,
        logout,
        switchPersona,
        refreshUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}