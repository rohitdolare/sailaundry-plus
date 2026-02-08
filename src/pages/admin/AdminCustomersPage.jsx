import { useEffect, useState } from "react";
import { getAllUsers, updateUserVerified } from "../../services/firestore";
import { toast } from "react-hot-toast";
import { Users, CheckCircle, Loader2 } from "lucide-react";

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(Array.isArray(list) ? list.filter((u) => u.role !== "admin") : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customers.");
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleVerified = async (u) => {
    const newVerified = !(u.verified === true);
    setUpdatingUid(u.uid);
    try {
      await updateUserVerified(u.uid, newVerified);
      setUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? { ...x, verified: newVerified } : x))
      );
      toast.success(newVerified ? "Customer verified. They can now login." : "Customer unverified.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update verification.");
    }
    setUpdatingUid(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white pb-20 md:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={24} className="text-indigo-500" />
          <h1 className="text-xl font-bold">Customers</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Only verified customers can login. Mark customers as verified to allow them to sign in.
        </p>

        {users.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No customers yet.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.uid}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {u.name || "—"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {u.email || "—"}
                  </p>
                  {u.mobile && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">{u.mobile}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      u.verified === true
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {u.verified === true ? (
                      <>
                        <CheckCircle size={12} /> Verified
                      </>
                    ) : (
                      <>Pending</>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleVerified(u)}
                    disabled={updatingUid === u.uid}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                      u.verified === true
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {updatingUid === u.uid ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : u.verified === true ? (
                      "Unverify"
                    ) : (
                      <>
                        <CheckCircle size={14} /> Verify
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
