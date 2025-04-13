"use client";

import { LayoutDashboard, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function SideBar() {
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    // Set initial hash
    setCurrentHash(window.location.hash);

    // Update hash on hash change
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "#dashboard" },
    { name: "Profile", icon: User, href: "#profile" },
    { name: "Settings", icon: Settings, href: "#settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex md:flex-col">
      <div className="p-6 pb-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-2xl font-bold text-gray-800 dark:text-white">Task Flow</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentHash === item.href; // Check if the hash matches
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 rounded-md transition-colors
                ${isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Footer items */}
      </div>
    </aside>
  );
}
