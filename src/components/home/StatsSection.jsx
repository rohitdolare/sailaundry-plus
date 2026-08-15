import { PackageCheck, Clock3, CalendarPlus, TrendingUp } from "lucide-react";

export const StatsSection = ({ ongoing, upcoming, thisWeek }) => {
  const stats = [
    {
      icon: PackageCheck,
      label: "Ongoing Orders",
      value: ongoing,
      iconBg: "bg-gradient-to-br from-blue-600 to-indigo-600",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: Clock3,
      label: "Upcoming Pickups",
      value: upcoming,
      iconBg: "bg-green-600",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: CalendarPlus,
      label: "Orders This Week",
      value: thisWeek,
      iconBg: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 shadow-lg dark:bg-gray-900 dark:bg-opacity-60 dark:border-gray-800 dark:border-opacity-60 p-6 transition duration-300 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500 group"
          >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} p-3 mb-4`}>
              <Icon className="w-full h-full text-white" />
            </div>

            {/* Label */}
            <p className={`text-sm font-medium ${stat.textColor} uppercase tracking-wider mb-2`}>
              {stat.label}
            </p>

            {/* Value with trend indicator */}
            <div className="flex items-end gap-2">
              <h2 className="font-heading text-4xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h2>
              {stat.value > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Active
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
