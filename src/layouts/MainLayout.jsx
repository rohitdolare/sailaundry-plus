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
} from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close sidebar when clicked outside
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
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { path: "/contact", label: "Contact", icon: <Phone size={18} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen md:flex-row bg-slate-100 text-gray-800">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white shadow z-10 flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-bold text-sky-600">SaiLaundry+</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} className="text-sky-700" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 min-h-screen w-60 bg-white text-gray-900 border-r z-20 p-5 space-y-4
          transform transition-transform duration-300 shadow-md
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        <h2 className="text-xl font-extrabold text-sky-600 mb-6 hidden md:block">
          SaiLaundry+
        </h2>
        <nav className="space-y-2">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                activePath === path
                  ? "bg-sky-100 text-sky-700 font-semibold"
                  : "hover:bg-slate-100"
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
      <main className="flex-1 pt-16 md:pt-6 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
