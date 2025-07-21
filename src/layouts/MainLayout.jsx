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
  User,
  PackagePlus,
} from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
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
    { path: "/profile", label: "Profile", icon: <User size={18} /> },
    { path: "/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
    { path: "/place-order", label: "Place Order", icon: <PackagePlus size={18} /> },
    { path: "/catalog", label: "Service Catalog", icon: <Tags size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { path: "/contact", label: "Help & Support", icon: <Phone size={18} /> },
  ];

  return (
    <div className="bg-slate-50 flex min-h-screen flex-col text-gray-800 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 md:flex-row">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow dark:bg-gray-800 md:hidden">
        <h2 className="text-sky-600 dark:text-sky-400 text-lg font-bold">
          SaiLaundry+
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="transition hover:scale-105"
          >
            <User size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={toggleTheme}
            className="transition hover:scale-105"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <Sun size={22} className="text-yellow-400" />
            ) : (
              <Moon size={22} className="text-gray-700" />
            )}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Open Menu"
          >
            <Menu size={24} className="text-sky-700 dark:text-sky-300" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-30 min-h-screen w-64 transform space-y-4 border-r border-gray-200 bg-white p-5 text-gray-900 shadow-lg transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:block md:translate-x-0`}
      >
        <h2 className="text-sky-600 dark:text-sky-400 mb-6 hidden text-2xl font-extrabold tracking-tight md:block">
          SaiLaundry+
        </h2>

        {/* Desktop Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="bg-sky-50 hover:bg-sky-100 mb-4 flex items-center gap-2 rounded-lg px-3 py-2 transition dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <nav
          className="space-y-1"
          role="navigation"
          aria-label="Main Navigation"
        >
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
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
          className="mt-10 flex w-full items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-left text-white hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white pt-16 transition-colors duration-300 dark:bg-gray-900 md:pt-6">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
