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
  PanelLeftOpen,
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
      {/* Decorative background (fixed, sits behind all glass surfaces) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gray-50 dark:bg-gray-950" />

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between bg-blueGray-800 px-4 py-3 shadow-md">
        <h2 className="font-heading text-lg font-bold tracking-tight truncate text-white">
          Sai Laundry+
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            aria-label="Go to profile"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-300 transition duration-200 hover:bg-white/10 active:bg-white/15 active:scale-95"
          >
            <User size={20} />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition duration-200 hover:bg-white/10 active:bg-white/15 active:scale-95"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 transition-opacity duration-300" />
      )}

      {/* Icon rail (desktop quick access) */}
      <aside className="hidden md:flex fixed left-0 top-14 bottom-0 z-10 w-16 flex-col items-center gap-1 overflow-y-auto border-r border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-blueGray-800">
        <button
          onClick={() => setIsSidebarOpen(true)}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition duration-200 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <PanelLeftOpen size={19} />
        </button>
        <div className="mx-2 mb-1 h-px w-8 bg-gray-200 dark:bg-gray-700" />
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            title={label}
            aria-label={label}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition duration-200 ${
              activePath === path
                ? "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            }`}
          >
            {icon}
          </Link>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-red-500 transition duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-30 min-h-screen w-64 transform overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-800 dark:bg-blueGray-800 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 z-10 bg-blueGray-800 px-6 py-6 md:py-8 text-white shadow-md">
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight truncate">
            Sai Laundry+
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Laundry Management</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1" role="navigation" aria-label="Main Navigation">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                activePath === path
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className={`${activePath === path ? "text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
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
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
              Simplify Your Laundry
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content - pt-14 for fixed header, pb-20 on mobile for bottom bar */}
      <main className="flex-1 overflow-auto pt-14 pb-20 md:pb-0 md:ml-16 transition-colors duration-300">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar - most used pages */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 pb-[env(safe-area-inset-bottom)] md:hidden"
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
                  ? "text-teal-600 dark:text-teal-400"
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
