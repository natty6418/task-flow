"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCurrentUser } from "@/services/userService";
import { signUp } from "@/services/authService";
import Link from "next/link";
import Image from "next/image";

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signUp(name, email, password);
            const res = await fetchCurrentUser();
            login(res);
            router.push("/");
        } catch (err: unknown) {
            setError(
                err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data && typeof err.response.data.message === 'string'
                    ? err.response.data.message
                    : "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = "http://localhost:4000/auth/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-8 border border-white/20">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    Create your account
                </h2>
                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-2 text-gray-500">or</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                <button
                    onClick={handleGoogleAuth}
                    className="w-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2 p-3 rounded transition"
                >
                    <Image
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        width={20}
                        height={20}
                    />
                    <span>Continue with Google</span>
                </button>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Log in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}