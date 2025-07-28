"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exchangeSessionForToken } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const VerifyPage = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyAndLogin = async () => {
            try {
                // Make the API call to your backend to exchange the session for a JWT.
                // withCredentials: true is ESSENTIAL for sending the session cookie.
                const userData = await exchangeSessionForToken();

                // If successful, the 'jwt' cookie is now set by the browser.
                // Update the auth context with the user data
                login(userData);

                // Redirect to the dashboard (this will happen in the login function)
                // but we'll also do it here as a fallback
                router.replace('/dashboard');

            } catch (err) {
                console.error("Verification failed", err);
                setError("Authentication failed. Please try again.");
                
                // Redirect back to the login page on failure with error
                setTimeout(() => {
                    router.replace('/login?error=oauth_verification_failed');
                }, 2000);
            }
        };

        verifyAndLogin();
    }, [router, login]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Authentication Failed
                        </h2>
                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Render a loading spinner while verification is in progress
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verifying Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please wait while we complete your login...
                    </p>
                    <div className="mt-4">
                        {/* Simple loading spinner */}
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;
