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
    { path: "/place-order", label: "New Order", icon: <PackagePlus size={18} /> },
    { path: "/catalog", label: "Services", icon: <Tags size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { path: "/contact", label: "Support", icon: <Phone size={18} /> },
  ];

  // Most used pages for mobile bottom bar (4 items like typical apps)
  const bottomBarItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/place-order", label: "New Order", icon: PackagePlus },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 md:flex-row">
      {/* Decorative background mesh (fixed, sits behind all glass surfaces) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300 bg-opacity-30 blur-3xl dark:bg-opacity-20" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-indigo-300 bg-opacity-30 blur-3xl dark:bg-opacity-20" />
      </div>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white border-opacity-60 bg-white bg-opacity-70 px-3 py-3 backdrop-blur-xl backdrop-filter dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-70 md:hidden">
        <h2 className="font-heading text-base font-bold truncate text-indigo-600 dark:text-indigo-400">
          Sai Laundry+
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            aria-label="Go to profile"
            className="flex h-11 w-11 items-center justify-center transition hover:opacity-70"
          >
            <User size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Open Menu"
            className="flex h-11 w-11 items-center justify-center"
          >
            <Menu size={24} className="text-indigo-600 dark:text-indigo-300" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-30 min-h-screen w-64 transform overflow-y-auto border-r border-white border-opacity-60 bg-white bg-opacity-60 shadow-xl backdrop-blur-xl backdrop-filter transition-transform duration-300 dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:block md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 md:py-8 text-white">
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight truncate">
            Sai Laundry+
          </h2>
          <p className="text-xs md:text-sm text-white text-opacity-80 mt-1">Laundry Management</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1" role="navigation" aria-label="Main Navigation">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200 ${
                activePath === path
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-white hover:bg-opacity-60 dark:hover:bg-gray-800 dark:hover:bg-opacity-60"
              }`}
            >
              <span className={`${activePath === path ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-white bg-opacity-60 text-red-600 font-semibold transition duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-2xl border border-white border-opacity-60 bg-white bg-opacity-50 p-4 backdrop-blur-xl backdrop-filter dark:border-gray-700 dark:border-opacity-60 dark:bg-gray-800 dark:bg-opacity-40">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
              Simplify Your Laundry
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
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-white border-opacity-60 bg-white bg-opacity-70 backdrop-blur-xl backdrop-filter dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-70 pb-[env(safe-area-inset-bottom)] md:hidden"
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
