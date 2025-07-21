import { Bell } from "lucide-react";
import PageHeader from "../components/PageHeader";

const SettingPage = () => {
  const cardStyles =
    "rounded-2xl border bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-md p-5 transition hover:shadow-lg";

  return (
    <div className="p-4">
      <PageHeader title="Settings" />

      <div className="mt-6 grid gap-6">
        {/* 🔔 Notification Preferences */}
        <div className={cardStyles}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
            <Bell className="text-yellow-500 dark:text-yellow-400" size={20} />
            Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Order updates
              </span>
              <input
                type="checkbox"
                className="toggle toggle-success"
                defaultChecked
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Promotional emails
              </span>
              <input type="checkbox" className="toggle toggle-info" />
            </label>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default SettingPage;
