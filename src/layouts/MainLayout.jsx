import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * MainLayout - Shared layout for all routes
 * Responsive sidebar navigation for mobile and desktop
 * Automatically closes mobile sidebar on outside click
 */
const MainLayout = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  // Close sidebar when clicked outside (mobile only)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSidebarOpen]);

   // Logout handler
  const handleLogout = () => {
   logout()
  navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row bg-gray-100">
      {/* Mobile Topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white shadow z-10 flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-bold text-gray-800">SaiLaundry+</h2>
        <button
          className="text-gray-600 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 min-h-screen w-56 bg-gray-800 text-white p-4 space-y-4 z-20 transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block md:shadow-lg
        `}
      >
        <h2 className="text-xl font-bold mb-6 hidden md:block">SaiLaundry+</h2>
        <nav className="space-y-2">
          {[
            { path: "/", label: "Home" },
            { path: "/orders", label: "Orders" },
            { path: "/settings", label: "Settings" },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-3 py-2 rounded ${
                activePath === path ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
         {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-10 block w-full text-left px-3 py-2 rounded bg-gray-700 hover:bg-red-600 text-white font-medium"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-6 min-h-screen overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
