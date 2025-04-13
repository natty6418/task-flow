"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { User } from "../types/type";
import API from "@/services/api";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = (userData: User) => {
    setUser(userData);
    setLoading(false);
    router.push('/'); // Redirect to the dashboard or home page
  };

  const logout = () => {
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
        const res = await API.get('/user/me', { withCredentials: true }); 
        if (res.status === 200) {
          setUser(res.data);
          setLoading(false);
        } else {
          router.push('/login'); 
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push('/login'); 
      }
    };

    checkAuth();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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