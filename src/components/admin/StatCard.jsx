import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = (props) => {
  const { icon: Icon, iconBg, iconClass, label, value, trend, trendLabel, featured, loading } = props;
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 animate-pulse">
        <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800 mb-4" />
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800 mb-2" />
        <div className="h-7 w-14 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 ${
        featured
          ? "border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={18} className={iconClass} />
        </span>
        {trend != null && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
              trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p
          className={`font-heading font-bold tabular-nums text-gray-900 dark:text-gray-100 ${
            featured ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {value}
        </p>
        {trendLabel && trend != null && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{trendLabel}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
