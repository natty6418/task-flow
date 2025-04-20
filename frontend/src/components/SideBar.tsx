"use client";

import { LayoutDashboard, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "./Loader";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentPath, setCurrentPath] = useState(pathname);
  const { projects, loadingProjects } = useAuth();

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex md:flex-col">
      <div className="p-6 pb-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-2xl font-bold text-gray-800 dark:text-white">Task Flow</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
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

        <div className="pt-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Projects</p>
          <div className="mt-2 space-y-1">
            {loadingProjects ? (
              <div className="flex items-center justify-center">
                <Loader />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-gray-400 text-sm px-4">No projects found</p>
            ) : (
              projects.map((project) => {
                const isActive = currentPath === `/project/${project.id}`;
                return (
                  <button
                    key={project.id}
                    onClick={() => router.push(`/project/${project.id}`)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors
                      ${isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    {project.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
