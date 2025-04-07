"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { User } from "../types/User";
import API from "@/services/api";

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User|null>(null);
  const router = useRouter();

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   console.log("Token from localStorage:", token);
  //   if (!token) {
  //     router.push('/login');
  //   }
  // }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/user/me'); 
        if (res.status === 200) {
          setUser(res.data);
        } else {
          router.push('/login'); 
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push('/login'); 
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};