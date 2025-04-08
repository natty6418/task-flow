"use client";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LayoutDashboard, Settings, User } from "lucide-react"; // Example icons

// A reusable Card component
function DashboardCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 ease-in-out ${className}`}
    >
      {title && <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{title}</h3>}
      <div className="text-gray-600 dark:text-gray-400">{children}</div>
    </div>
  );
}


export default function Dashboard() {
  const { user, logout } = useAuth();

  // Placeholder for sidebar navigation items
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "#" },
    { name: "Profile", icon: User, href: "#" },
    { name: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex md:flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My App</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           {/* User info or other footer items can go here */}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
              {/* Mobile Menu Button Placeholder */}
              <button className="md:hidden mr-4 text-gray-600 dark:text-gray-400">
                  {/* Add a menu icon here (e.g., Menu from lucide-react) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Welcome, {user?.name || user?.email || "User"}!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Cards */}
            <DashboardCard title="Card 1">
              Some content for the first card. Maybe stats or quick links.
            </DashboardCard>
            <DashboardCard title="Card 2">
              More information can go here. Perhaps a chart placeholder.
            </DashboardCard>
            <DashboardCard title="Card 3">
              Settings or configuration snippets could live here.
            </DashboardCard>
             {/* Add more cards as needed */}
          </div>

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