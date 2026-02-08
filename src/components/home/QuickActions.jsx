import { useNavigate } from "react-router-dom";
import { PackageOpen, User, Layers, ArrowRight } from "lucide-react";

const actions = [
  {
    icon: PackageOpen,
    label: "Track Orders",
    path: "/orders",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    description: "View status & updates",
  },
  {
    icon: User,
    label: "Manage Profile",
    path: "/profile",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    description: "Settings & preferences",
  },
  {
    icon: Layers,
    label: "View Catalog",
    path: "/catalog",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    description: "Browse services",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Access everything you need in one place
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`${action.bgColor} dark:bg-slate-800/50 group relative overflow-hidden rounded-2xl p-6 border border-white/50 dark:border-slate-700/60 backdrop-blur-sm transition duration-300 hover:shadow-lg dark:hover:shadow-purple-500/10 transform hover:scale-105 text-left`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition duration-300`} />

              <div className="relative space-y-4">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Label */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {action.label}
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

