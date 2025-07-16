"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard where the create project modal will be available
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Redirecting to dashboard...
        </h2>
      </div>
    </div>
  );
}
