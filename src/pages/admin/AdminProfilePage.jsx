import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "../../services/firestore/userService";
import { Pencil, Save, X, User, Mail, Phone, Shield } from "lucide-react";

const AdminProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: "", mobile: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      getUserProfile(user.uid).then((data) => {
        setProfile(data || {});
        setFormData({
          name: data?.name ?? user?.name ?? "",
          mobile: data?.mobile ?? "",
        });
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
      });
      setProfile((prev) => ({ ...prev, name: formData.name.trim(), mobile: formData.mobile.trim() }));
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#f8f9fb] dark:bg-[#0f1114] flex items-center justify-center p-6 text-slate-500 dark:text-slate-400">
        Loading...
      </div>
    );
  }

  const displayProfile = profile ?? {};
  const displayName = displayProfile.name || user.name || "—";
  const displayMobile = displayProfile.mobile || "—";
  const displayEmail = user.email || "—";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] dark:bg-[#0f1114] transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-4 lg:gap-6">
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">
          Profile
        </h1>

        <section className="rounded-2xl bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
          <div className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-600/50">
                    <Shield size={12} />
                    Admin
                  </span>
                </div>
              </div>
              {!editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-600/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/80 p-4">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  <User size={14} />
                  Full Name
                </label>
                {editMode ? (
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{displayName}</p>
                )}
              </div>

              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/80 p-4">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  <Phone size={14} />
                  Mobile
                </label>
                {editMode ? (
                  <input
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mobile number"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{displayMobile}</p>
                )}
              </div>

              <div className="sm:col-span-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/80 p-4">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  <Mail size={14} />
                  Email
                </label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{displayEmail}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email is managed by your login account.</p>
              </div>
            </div>

            {editMode && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({ name: displayProfile.name ?? "", mobile: displayProfile.mobile ?? "" });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-60 transition"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminProfilePage;
