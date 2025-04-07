"use client";

import { useState } from "react";
import API from "@/services/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/signup', { name, email, password });
            login(res.data.token, res.data.user);
            router.push('/');
        } catch (error) {
            console.error("Signup failed:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-20">
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded">Signup</button>
        </form>
    )
}