// src/pages/HomePage.jsx
import { PackageCheck, Clock3, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const HomePage = () => {
  const navigate = useNavigate();
  const userName = "Rohit"; // TODO: get from context

  const stats = [
    {
      icon: <PackageCheck className="text-blue-600" size={28} />,
      title: "Ongoing Orders",
      value: 2,
    },
    {
      icon: <Clock3 className="text-green-600" size={28} />,
      title: "Scheduled Pickups",
      value: 1,
    },
    {
      icon: <CalendarPlus className="text-yellow-600" size={28} />,
      title: "New Orders This Week",
      value: 4,
    },
  ];

  const actions = [
    { label: "Place Order", icon: "🧺", path: "/place-order" },
    { label: "Track Orders", icon: "📦", path: "/orders" },
    { label: "Manage Settings", icon: "⚙️", path: "/settings" },
    
  ];

  return (
    <div className="p-4">
      <PageHeader title={`Welcome,`} subtitle={userName} />

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
          >
            <div className="mb-3">{item.icon}</div>
            <h3 className="text-lg font-semibold text-gray-700">
              {item.title}
            </h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(action.path);
              }}
              className="rounded-xl bg-indigo-50 p-4 text-left font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-100"
            >
              <span className="mr-2 text-2xl">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
