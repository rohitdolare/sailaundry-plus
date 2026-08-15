import { useNavigate } from "react-router-dom";
import { PackageOpen, User, Layers, ArrowRight } from "lucide-react";

const actions = [
  {
    icon: PackageOpen,
    label: "Track Orders",
    path: "/orders",
    description: "View status & updates",
  },
  {
    icon: User,
    label: "Profile",
    path: "/profile",
    description: "Settings & preferences",
  },
  {
    icon: Layers,
    label: "Services",
    path: "/catalog",
    description: "Browse pricing & options",
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
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
              className="group relative overflow-hidden rounded-2xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 shadow-lg dark:bg-gray-900 dark:bg-opacity-60 dark:border-gray-800 dark:border-opacity-60 p-6 transition duration-300 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500 text-left"
            >
              <div className="relative space-y-4">
                {/* Icon */}
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600">
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
