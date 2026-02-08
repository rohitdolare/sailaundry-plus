import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  LogOut,
  Menu,
  Sun,
  Moon,
  Shield,
  Tags,
  Users,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { user, logout } = useAuth();
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

  const adminNavItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/admin/orders", label: "All Orders", icon: <Package size={18} /> },
    { path: "/admin/create-order", label: "Create Order", icon: <PackagePlus size={18} /> },
    { path: "/admin/catalog", label: "Catalog", icon: <Tags size={18} /> },
    { path: "/admin/customers", label: "Customers", icon: <Users size={18} /> },
  ];

  // Mobile bottom bar – most used admin pages
  const bottomBarItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "Orders", icon: Package },
    { path: "/admin/create-order", label: "Create", icon: PackagePlus },
  ];

  return (
    <div className="bg-slate-50 flex min-h-screen flex-col text-gray-800 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 md:flex-row">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between bg-white px-3 py-3 shadow dark:bg-gray-800 md:hidden">
        <h2 className="text-indigo-600 dark:text-indigo-400 text-base font-bold truncate flex items-center gap-2">
          <Shield size={18} /> Admin
        </h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Open Menu"
        >
          <Menu size={24} className="text-indigo-700 dark:text-indigo-300" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-30 min-h-screen w-64 transform overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:block md:translate-x-0`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-6 md:py-8 text-white shadow-lg">
          <h2 className="text-xl md:text-2xl font-black tracking-tight truncate flex items-center gap-2">
            <Shield size={22} /> Admin
          </h2>
          <p className="text-xs md:text-sm text-white/80 mt-1">
            Sai Laundry+ Admin Panel
          </p>
          {user?.name && (
            <p className="text-xs text-white/60 mt-2 truncate">{user.name}</p>
          )}
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={toggleTheme}
            className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/50 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-slate-700 dark:hover:to-slate-700 flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition duration-300 border border-indigo-200 dark:border-slate-600 font-medium text-gray-900 dark:text-white"
          >
            {darkMode ? (
              <>
                <Sun size={18} className="text-yellow-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={18} className="text-blue-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2" role="navigation" aria-label="Admin Navigation">
          {adminNavItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-300 ${
                activePath === path
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-slate-600" />

        <div className="p-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition"
          >
            ← Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition duration-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pt-14 pb-20 md:pt-0 md:pb-0 transition-colors duration-300">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Admin navigation"
      >
        {bottomBarItems.map(({ path, label, icon: Icon }) => {
          const isActive = activePath === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 min-w-0 text-xs font-medium transition ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon size={22} className="shrink-0 mb-0.5" />
              <span className="truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;
