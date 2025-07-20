// src/layouts/MainLayout.jsx
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  ShoppingCart,
  Settings,
  LogOut,
  Phone,
  Menu,
  Sun,
  Moon,
  Tags,
} from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
    { path: "/catalog", label: "Service Catalog", icon: <Tags size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { path: "/contact", label: "Support", icon: <Phone size={18} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen md:flex-row bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow z-20 flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-bold text-sky-600 dark:text-sky-400">SaiLaundry+</h2>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="hover:scale-105 transition" aria-label="Toggle Theme">
            {darkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-gray-700" />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Open Menu">
            <Menu size={24} className="text-sky-700 dark:text-sky-300" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 min-h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          text-gray-900 dark:text-gray-100 z-30 p-5 space-y-4
          transform transition-transform duration-300 shadow-lg
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        <h2 className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mb-6 hidden md:block tracking-tight">
          SaiLaundry+
        </h2>

        {/* Desktop Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 dark:bg-gray-700 hover:bg-sky-100 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <nav className="space-y-1" role="navigation" aria-label="Main Navigation">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activePath === path
                  ? "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-6 overflow-auto bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
