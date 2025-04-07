"use client";
import { useAuth } from "@/contexts/AuthContext";


export default function Home() {
  const { user } = useAuth();
    return (
      <div>Hello {user?.email}!</div>
    );
  }