import { PackageCheck, Clock3, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || "Guest";

  const stats = [
    {
      icon: <PackageCheck className="text-blue-500 dark:text-blue-400" size={28} />,
      title: "Ongoing Orders",
      value: 2,
    },
    {
      icon: <Clock3 className="text-emerald-500 dark:text-emerald-400" size={28} />,
      title: "Scheduled Pickups",
      value: 1,
    },
    {
      icon: <CalendarPlus className="text-yellow-500 dark:text-yellow-400" size={28} />,
      title: "New Orders This Week",
      value: 4,
    },
  ];

  const actions = [
    { label: "Place Order", icon: "🧺", path: "/place-order" },
    { label: "Track Orders", icon: "📦", path: "/orders" },
    { label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  const cardStyles = `rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 
    border border-gray-200 dark:border-gray-700 
    shadow-md backdrop-blur-md transition-all hover:shadow-lg`;

  return (
    <div className="p-4">
      {/* 🌟 Welcome & Brand */}
      <div className="text-center md:text-left">
        <PageHeader title="Welcome to SaiLaundry+," subtitle={userName} />
        <p className="text-gray-700 dark:text-gray-300 mt-2 max-w-xl mx-auto md:mx-0">
          Experience hassle-free laundry with smart pickup, fast delivery, and trusted care.
        </p>
      </div>

      {/* 📊 Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, index) => (
          <div key={index} className={cardStyles}>
            <div className="mb-3">{item.icon}</div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.title}
            </h3>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ⚡ Quick Actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 rounded-xl px-5 py-4 font-medium
                text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 
                hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-sm"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-base">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🧼 Service Catalog Teaser */}
      <div className="mt-12 bg-gradient-to-r from-blue-100/60 via-indigo-100/60 to-purple-100/60 
          dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 
          rounded-2xl p-6 shadow-inner backdrop-blur-md border border-gray-300/30 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🧾 Explore Our Services & Pricing
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          See what we offer, from basic washes to premium dry cleaning.
        </p>
        <button
          onClick={() => navigate("/catalog")}
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg transition"
        >
          View Service Catalog
        </button>
      </div>
    </div>
  );
};

export default HomePage;
