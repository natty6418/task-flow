"use client";

import { LayoutDashboard, Settings, User, Bell, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import Loader from "../common/Loader";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentPath, setCurrentPath] = useState(pathname);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const { projects, loadingProjects } = useApp();

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Auto-expand projects if we're on a project page
  useEffect(() => {
    if (pathname.startsWith('/project/')) {
      setIsProjectsExpanded(true);
    }
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Notifications", icon: Bell, href: "/notifications" },
    // { name: "Profile", icon: User, href: "/profile" },
    // { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex md:flex-col border-r border-gray-200 dark:border-gray-700">
     
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

        {/* Projects Section */}
        <div className="pt-2">
          <div className={`flex items-center rounded-md transition-colors ${currentPath === '/project' 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
            <button
              onClick={() => router.push('/project')}
              className="flex-1 flex items-center px-4 py-2 "
            >
              <FolderOpen className="w-5 h-5 mr-3" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {isProjectsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Project List */}
          {isProjectsExpanded && (
            <div className="mt-2 ml-6 space-y-1">
              {/* Individual Projects */}
              {loadingProjects ? (
                <div className="flex items-center justify-center py-2">
                  <Loader />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-gray-400 text-sm px-4 py-2">No projects found</p>
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
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      {project.name}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
