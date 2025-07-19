import { PackageCheck, Clock3, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
    const { user } = useAuth(); // ✅ get user
  const userName = user?.name || "Guest"; // fallback to "Guest"

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
    { label: "Manage Settings", icon: "⚙️", path: "/settings" },
  ];

  const cardStyles =
    "rounded-2xl p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition";

  return (
    <div className="p-4">
      <PageHeader title="Welcome," subtitle={userName} />

      {/* 📊 Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((item, index) => (
          <div key={index} className={cardStyles}>
            <div className="mb-3">{item.icon}</div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
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
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {actions.map((action, i) => (
      <button
        key={i}
        onClick={() => navigate(action.path)}
        className="flex items-center justify-start gap-3 rounded-2xl px-5 py-4 text-left font-semibold
          text-gray-800 dark:text-white
          bg-gray-100 dark:bg-gray-800
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition shadow-sm"
      >
        <span className="text-2xl">{action.icon}</span>
        <span className="text-base">{action.label}</span>
      </button>
    ))}
  </div>
</div>



    </div>
  );
};

export default HomePage;
