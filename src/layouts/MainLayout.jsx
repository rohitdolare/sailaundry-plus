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

  // Most used pages for mobile bottom bar (4 items like typical apps)
  const bottomBarItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/place-order", label: "Place Order", icon: PackagePlus },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="bg-slate-50 flex min-h-screen flex-col text-gray-800 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 md:flex-row">
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between bg-white px-3 py-3 shadow dark:bg-gray-800 md:hidden">
        <h2 className="text-sky-600 dark:text-sky-400 text-base font-bold truncate">
          Sai Laundry+
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="transition hover:scale-105"
          >
            <User size={22} className="text-gray-700 dark:text-gray-300" />
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
        className={`fixed left-0 top-0 z-30 min-h-screen w-64 transform overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:block md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-6 md:py-8 text-white shadow-lg">
          <h2 className="text-xl md:text-2xl font-black tracking-tight truncate">
            Sai Laundry+
          </h2>
          <p className="text-xs md:text-sm text-white/80 mt-1">Laundry Management</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2" role="navigation" aria-label="Main Navigation">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-300 transform hover:scale-105 ${
                activePath === path
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
              }`}
            >
              <span className={`${activePath === path ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-slate-600" />

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-4 border border-indigo-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
              ✨ Simplify Your Laundry
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content - pt-14 on mobile for header, pb-20 for bottom bar */}
      <main className="flex-1 overflow-auto pt-14 pb-20 md:pt-0 md:pb-0 transition-colors duration-300">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar - most used pages */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Main navigation"
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

export default MainLayout;
