
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react"; // Example icons

export default function Header() {
      const {logout } = useAuth();
    
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
              {/* Mobile Menu Button Placeholder */}
              <button className="md:hidden mr-4 text-gray-600 dark:text-gray-400">
                  {/* Add a menu icon here (e.g., Menu from lucide-react) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </header>
    )
}