import { PackageCheck, Clock3, CalendarPlus } from "lucide-react";

const cardStyle =
  "rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition";

export const StatsSection = ({ ongoing, upcoming, thisWeek }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={cardStyle}>
        <PackageCheck className="text-sky-500 mb-2" size={28} />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ongoing Orders
        </p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {ongoing}
        </h2>
      </div>
      <div className={cardStyle}>
        <Clock3 className="text-emerald-500 mb-2" size={28} />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Upcoming Pickups
        </p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {upcoming}
        </h2>
      </div>
      <div className={cardStyle}>
        <CalendarPlus className="mb-2 text-yellow-500" size={28} />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Orders This Week
        </p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {thisWeek}
        </h2>
      </div>
    </div>
  );
};

