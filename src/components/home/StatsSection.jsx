import { PackageCheck, Clock3, CalendarPlus, TrendingUp } from "lucide-react";

export const StatsSection = ({ ongoing, upcoming, thisWeek }) => {
  const stats = [
    {
      icon: PackageCheck,
      label: "Ongoing Orders",
      value: ongoing,
      color: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-50 dark:bg-slate-800/50",
      textColor: "text-blue-600 dark:text-blue-300",
      darkBorder: "dark:border-blue-500/20",
    },
    {
      icon: Clock3,
      label: "Upcoming Pickups",
      value: upcoming,
      color: "from-emerald-400 to-green-400",
      bgColor: "bg-emerald-50 dark:bg-slate-800/50",
      textColor: "text-emerald-600 dark:text-emerald-300",
      darkBorder: "dark:border-emerald-500/20",
    },
    {
      icon: CalendarPlus,
      label: "Orders This Week",
      value: thisWeek,
      color: "from-yellow-400 to-orange-400",
      bgColor: "bg-yellow-50 dark:bg-slate-800/50",
      textColor: "text-yellow-600 dark:text-yellow-300",
      darkBorder: "dark:border-yellow-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`${stat.bgColor} rounded-2xl p-6 border border-white/50 dark:border-slate-700/60 ${stat.darkBorder} backdrop-blur-sm shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-purple-500/10 transition duration-300 transform hover:scale-105 group`}
          >
            {/* Icon with gradient background */}
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4 shadow-lg dark:shadow-lg`}>
              <Icon className="w-full h-full text-white" />
            </div>

            {/* Label */}
            <p className={`text-sm font-medium ${stat.textColor} uppercase tracking-wider mb-2`}>
              {stat.label}
            </p>

            {/* Value with trend indicator */}
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white">
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

