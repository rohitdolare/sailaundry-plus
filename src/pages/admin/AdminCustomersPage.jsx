import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserVerified,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../../services/firestore";
import { toast } from "react-hot-toast";
import { Users, CheckCircle, Loader2, Pencil, MapPin, Plus, Trash2, X, Clock, Mail, Phone } from "lucide-react";

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", mobile: "", locations: [] });
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingUid, setDeletingUid] = useState(null);

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

  const openEditModal = async (u) => {
    setEditingUser(u);
    setEditLoading(true);
    try {
      const profile = await getUserProfile(u.uid);
      const locs = profile?.locations || [];
      setEditForm({
        name: profile?.name ?? u.name ?? "",
        mobile: profile?.mobile ?? u.mobile ?? "",
        locations: locs.length
          ? locs.map((l) => ({ label: l.label || "", address: l.address || "" }))
          : [{ label: "", address: "" }],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customer details.");
      setEditingUser(null);
    }
    setEditLoading(false);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({ name: "", mobile: "", locations: [] });
  };

  const updateEditForm = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocation = (index, field, value) => {
    setEditForm((prev) => {
      const locs = [...(prev.locations || [])];
      locs[index] = { ...locs[index], [field]: value };
      return { ...prev, locations: locs };
    });
  };

  const addLocationRow = () => {
    setEditForm((prev) => ({
      ...prev,
      locations: [...(prev.locations || []), { label: "", address: "" }],
    }));
  };

  const removeLocation = (index) => {
    setEditForm((prev) => {
      const locs = [...(prev.locations || [])];
      locs.splice(index, 1);
      return { ...prev, locations: locs.length ? locs : [{ label: "", address: "" }] };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const name = (editForm.name || "").trim();
    const mobile = (editForm.mobile || "").trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    const locations = (editForm.locations || [])
      .map((l) => ({ label: (l.label || "").trim(), address: (l.address || "").trim() }))
      .filter((l) => l.address);
    setEditSaving(true);
    try {
      await updateUserProfile(editingUser.uid, {
        name,
        mobile: mobile || null,
        locations: locations.length ? locations : [],
      });
      setUsers((prev) =>
        prev.map((x) =>
          x.uid === editingUser.uid
            ? { ...x, name, mobile: mobile || x.mobile, locations }
            : x
        )
      );
      toast.success("Customer updated.");
      closeEditModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update customer.");
    }
    setEditSaving(false);
  };

  const handleDelete = async (u) => {
    if (
      !window.confirm(
        `Delete customer "${u.name || "—"}"? This removes their profile. Existing orders will still show their info.`
      )
    ) {
      return;
    }
    setDeletingUid(u.uid);
    try {
      await deleteUserProfile(u.uid);
      setUsers((prev) => prev.filter((x) => x.uid !== u.uid));
      toast.success("Customer deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete customer.");
    }
    setDeletingUid(null);
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Only verified customers can log in. &quot;Awaiting verification&quot; means they signed up but cannot sign in until you verify them.
        </p>

        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 p-12 text-center">
            <Users className="mx-auto mb-3 text-gray-400 dark:text-slate-500" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No customers yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.uid}
                className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-800 shadow-sm transition hover:shadow-md dark:shadow-none dark:hover:bg-slate-800/90 ${
                  u.verified === true
                    ? "border-l-4 border-l-green-500 border-gray-200 dark:border-slate-700"
                    : "border-l-4 border-l-amber-500 border-gray-200 dark:border-slate-700"
                }`}
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      role="img"
                      aria-label={`Avatar for ${u.name || "Customer"}`}
                      className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white ring-2 ring-gray-300 dark:ring-slate-500"
                      style={{
                        backgroundColor: u.verified === true ? "#15803d" : "#b45309",
                      }}
                    >
                      {(u.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {u.name || "—"}
                        </p>
                        {u.isWalkIn && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                            Walk-in
                          </span>
                        )}
                      </div>
                      {u.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Mail size={14} className="flex-shrink-0 text-gray-400" />
                          {u.email}
                        </p>
                      )}
                      {u.mobile && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Phone size={14} className="flex-shrink-0 text-gray-400" />
                          {u.mobile}
                        </p>
                      )}
                      {!u.email && !u.mobile && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No contact info</p>
                      )}
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-slate-700 pt-4 sm:pt-0 sm:pl-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                        u.verified === true
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      }`}
                    >
                      {u.verified === true ? (
                        <>
                          <CheckCircle size={14} /> Verified
                        </>
                      ) : (
                        <>
                          <Clock size={14} /> Awaiting verification
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVerified(u)}
                      disabled={updatingUid === u.uid}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
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
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        disabled={deletingUid === u.uid}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition disabled:opacity-50"
                      >
                        {deletingUid === u.uid ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Trash2 size={14} /> Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Customer Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Edit customer
                </h3>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-gray-400"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {editLoading ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => updateEditForm("name", e.target.value)}
                        placeholder="Customer name"
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        value={editForm.mobile}
                        onChange={(e) => updateEditForm("mobile", e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <MapPin size={16} /> Addresses
                        </label>
                        <button
                          type="button"
                          onClick={addLocationRow}
                          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Plus size={14} /> Add address
                        </button>
                      </div>
                      {(editForm.locations || []).map((loc, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-start p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={loc.label}
                              onChange={(e) => updateLocation(idx, "label", e.target.value)}
                              placeholder="Label (e.g. Home)"
                              className="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            />
                            <input
                              type="text"
                              value={loc.address}
                              onChange={(e) => updateLocation(idx, "address", e.target.value)}
                              placeholder="Address"
                              className="rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-white sm:col-span-2"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLocation(idx)}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                            aria-label="Remove address"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {!editLoading && (
                <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={editSaving}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersPage;
