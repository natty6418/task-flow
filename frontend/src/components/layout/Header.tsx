'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, Mountain, User, AlertTriangle, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";

import Image from "next/image";

// Dummy dropdown components (replace with your actual UI components)
const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div className="relative inline-block text-left">{children}</div>;
const DropdownMenuTrigger = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <div onClick={onClick}>{children}</div>;
const DropdownMenuContent = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) => <a onClick={onClick} className={className}>{children}</a>;
const DropdownMenuSeparator = () => <hr className="my-1 border-gray-200 dark:border-gray-600" />;

export default function Header() {
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (!isMenuOpen) {
      // Keep logout modal state independent of dropdown menu
    }
  }, [isMenuOpen]);

  const handleLogoutClick = () => {
    setIsMenuOpen(false); // Close dropdown
    setIsLogoutModalOpen(true); // Open modal
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md px-6">
      
      {/* Left section: logo and page title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          {/* <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white font-bold text-sm">
            TF
          </div> */}
          <Image src={"/assets/logo-small.png"} alt="Logo" className="w-8 h-8 rounded-md" width={32} height={32} />
          <span className="text-xl font-bold text-gray-800 dark:text-white">Task Flow</span>
        </div>
      
      
        
        <button className="sm:hidden -ml-1 rounded-md p-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>

      {/* Right section: user dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <button className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="sr-only">Open user menu</span>
          </button>
        </DropdownMenuTrigger>

        {isMenuOpen && (
          <DropdownMenuContent className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-1">
              <DropdownMenuItem
                onClick={() => {setIsMenuOpen(false); router.push('/profile');}}
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {setIsMenuOpen(false); router.push('/settings');}}
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogoutClick}
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={cancelLogout}
          />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full border border-gray-200 dark:border-gray-700">
            {/* Close button */}
            <button
              onClick={cancelLogout}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Modal content */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Logout
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to log out?
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
