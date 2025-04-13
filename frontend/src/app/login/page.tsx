"use client";

import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await API.post('/auth/login', { email, password }, { withCredentials: true });
    const res = await API.get('/user/me', { withCredentials: true });
    login(res.data);
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-20">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
    </form>
  );
}
