import { useNavigate } from "react-router-dom";

const actions = [
  { icon: "📦", label: "Track Orders", path: "/orders" },
  { icon: "🛠️", label: "Manage Profile", path: "/profile" },
  { icon: "🧾", label: "View Catalog", path: "/catalog" },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="flex items-center justify-center gap-3 rounded-xl bg-gray-100 p-4 transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

