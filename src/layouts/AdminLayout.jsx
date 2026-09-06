import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftOpen,
  Shield,
  Tags,
  Trophy,
  User,
  Users,
  Package,
  ShoppingCart,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const activePath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { user, logout } = useAuth();
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

  const adminNavItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
    { path: "/admin/orders", label: "Orders", icon: <Package size={18} />, exact: true },
    { path: "/admin/create-order", label: "New Order", icon: <ShoppingCart size={18} />, exact: false },
    { path: "/admin/catalog", label: "Services", icon: <Tags size={18} />, exact: true },
    { path: "/admin/customers", label: "Customers", icon: <Users size={18} />, exact: true },
    { path: "/admin/leaderboard", label: "Leaderboard", icon: <Trophy size={18} />, exact: true },
    { path: "/admin/profile", label: "Profile", icon: <User size={18} />, exact: true },
  ];

  // Mobile bottom bar – Dashboard, Orders, Customers, Profile
  const bottomBarItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "Orders", icon: Package },
    { path: "/admin/customers", label: "Customers", icon: Users },
    { path: "/admin/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50 text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 md:flex-row">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-20 flex items-center justify-between bg-indigo-900 px-4 py-3 shadow-md">
        <h2 className="font-heading text-white text-lg font-bold tracking-tight truncate flex items-center gap-2">
          <Shield size={18} /> Admin
        </h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white transition duration-200 hover:bg-white/10 active:bg-white/15 active:scale-95"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 transition-opacity duration-300" />
      )}

      {/* Icon rail (desktop quick access) */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 z-10 w-16 flex-col items-center gap-1 overflow-y-auto border-r border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-indigo-900">
        <button
          onClick={() => setIsSidebarOpen(true)}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition duration-200 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <PanelLeftOpen size={19} />
        </button>
        <div className="mx-2 mb-1 h-px w-8 bg-gray-200 dark:bg-gray-700" />
        {adminNavItems.map(({ path, label, icon, exact }) => {
          const isActive = exact ? activePath === path : activePath === path || activePath.startsWith(path + "/");
          return (
            <Link
              key={path}
              to={path}
              title={label}
              aria-label={label}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition duration-200 ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`}
            >
              {icon}
            </Link>
          );
        })}
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
        className={`fixed left-0 top-0 z-30 h-screen w-64 flex flex-col transform border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-800 dark:bg-indigo-900 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="shrink-0 bg-indigo-900 px-6 py-6 md:py-8 text-white shadow-md">
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight truncate flex items-center gap-2">
            <Shield size={22} /> Admin
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Sai Laundry+ Admin Panel
          </p>
          {user?.name && (
            <p className="text-xs text-gray-400 mt-2 truncate">{user.name}</p>
          )}
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1" role="navigation" aria-label="Admin Navigation">
          {adminNavItems.map(({ path, label, icon, exact }) => {
            const isActive = exact ? activePath === path : activePath === path || activePath.startsWith(path + "/");
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}>
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 mx-4 h-px bg-gray-200 dark:bg-gray-700" />

        <div className="shrink-0 p-4 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-white bg-opacity-60 text-red-600 font-semibold transition duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pt-16 pb-20 md:pb-0 md:ml-16 transition-colors duration-300">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 pb-[env(safe-area-inset-bottom)] md:hidden"
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
}
