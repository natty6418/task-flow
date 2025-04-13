"use client";
import { useAuth } from "@/contexts/AuthContext";

import DashboardCard from "@/components/DashboardCard";
import SideBar from "@/components/SideBar"; // Example sidebar component
import Header from "@/components/Header";
import Projects from "@/components/Projects";
// A reusable Card component

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Unauthorized</p>; // or redirect to login page
  }

  // Placeholder for sidebar navigation items

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Welcome, {user?.name || user?.email || "User"}!
          </h2>
          <Projects />

          {/* Add more sections/components here */}
          <div className="mt-8">
            <DashboardCard title="Another Section">
              This section can hold tables, forms, or other complex components.
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  );
}
