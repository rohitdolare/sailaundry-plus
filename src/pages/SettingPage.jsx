import {
  User,
  Bell,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SettingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-4">
      <PageHeader title="Settings" />

      <div className="grid gap-6 mt-6">
        {/* 👤 Profile Info */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User className="text-indigo-500" size={20} /> Profile
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium text-gray-800">{user?.name || "Guest User"}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium text-gray-800">{user?.email || "Not Available"}</span>
            </div>
          </div>
        </div>

        {/* 🔔 Notification Preferences */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Bell className="text-yellow-500" size={20} /> Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Order updates</span>
              <input type="checkbox" className="toggle toggle-success" defaultChecked />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Promotional emails</span>
              <input type="checkbox" className="toggle toggle-info" />
            </label>
          </div>
        </div>

        {/* 📞 Support */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Phone className="text-blue-500" size={20} /> Contact Support
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-500" /> <span>+91-9876543210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-500" /> <span>support@sailaundry.com</span>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default SettingPage;
