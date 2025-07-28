"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { login as loginService } from "@/services/authService";
import { fetchCurrentUser } from "@/services/userService";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth-related errors in URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'oauth_failed') {
      setError('Google authentication failed. Please try again.');
    } else if (errorParam === 'oauth_verification_failed') {
      setError('Authentication verification failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginService(email, password);
      const res = await fetchCurrentUser();
      login(res);
      router.push("/");
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleAuth = async () => {
  //   setError(null);
  //   setLoading(true);
  //   try{
  //     await API.get("/auth/google", { withCredentials: true });
  //     const res = await API.get("/user/me", { withCredentials: true });
  //     login(res.data);
  //     router.push("/");
  //   } catch (err: unknown) {
  //     setError(
  //       err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data && typeof err.response.data.message === 'string'
  //         ? err.response.data.message
  //         : "Unable to login. Please check your credentials."
  //     );
  //   }
  // };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Welcome back
        </h2>
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Logging in…" : "Login"}
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
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
