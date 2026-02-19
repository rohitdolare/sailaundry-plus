import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserVerified,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../../services/firestore";
import { toast } from "react-hot-toast";
import { Users, Loader2, MapPin, Plus, Trash2, X, Phone } from "lucide-react";

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (editingUser) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [editingUser]);

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
      return false;
    }
    setDeletingUid(u.uid);
    try {
      await deleteUserProfile(u.uid);
      setUsers((prev) => prev.filter((x) => x.uid !== u.uid));
      toast.success("Customer deleted.");
      setDeletingUid(null);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete customer.");
      setDeletingUid(null);
      return false;
    }
  };

  // Filter customers by search (name, email, mobile, address)
  const customerToSearchText = (u) => {
    const parts = [
      u.name || "",
      u.email || "",
      u.mobile || "",
      ...(u.locations || []).flatMap((l) => [l.label || "", l.address || ""]),
    ];
    return parts.join(" ").toLowerCase();
  };
  const filteredUsers = !searchQuery.trim()
    ? users
    : users.filter((u) =>
        customerToSearchText(u).includes(searchQuery.trim().toLowerCase())
      );

  // Onboarding date from user (createdAt)
  const getOnboardingDate = (u) => {
    const ts = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
    return ts ? ts.getTime() : 0;
  };
  const getOnboardingDateKey = (u) => {
    const ts = u.createdAt?.toDate?.() || (u.createdAt ? new Date(u.createdAt) : null);
    if (!ts) return "Unknown date";
    return ts.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  // Group by onboarding date, recent first; within each group, recent first
  const sortedForGrouping = [...filteredUsers].sort((a, b) => getOnboardingDate(b) - getOnboardingDate(a));
  const groupedByDate = sortedForGrouping.reduce((acc, u) => {
    const key = getOnboardingDateKey(u);
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});
  const orderedGroupKeys = Object.keys(groupedByDate).sort((a, b) => {
    if (a === "Unknown date") return 1;
    if (b === "Unknown date") return -1;
    const usersA = groupedByDate[a];
    const usersB = groupedByDate[b];
    const dateA = getOnboardingDate(usersA[0]);
    const dateB = getOnboardingDate(usersB[0]);
    return dateB - dateA;
  });

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
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-indigo-500 shrink-0" />
            <h1 className="text-base font-semibold text-gray-700 dark:text-gray-300">Customers</h1>
          </div>
          {users.length > 0 && (
            <div
              className="flex items-center justify-center min-w-[3rem] h-9 px-3 rounded-xl bg-indigo-600 text-white font-bold text-lg tabular-nums"
              aria-label="Total customers"
            >
              {searchQuery.trim() ? `${filteredUsers.length}/${users.length}` : users.length}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Verified customers can log in.<br />
          Turn the switch on to verify.
        </p>

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, mobile, or address..."
            className="w-full h-10 pl-3 pr-9 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            aria-label="Search customers"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-slate-600"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 p-12 text-center">
            <Users className="mx-auto mb-3 text-gray-400 dark:text-slate-500" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No customers yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {searchQuery.trim() && filteredUsers.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                No customers match &quot;{searchQuery.trim()}&quot;.
              </p>
            )}
            {orderedGroupKeys.map((dateKey) => (
              <section key={dateKey} className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky top-0 bg-gray-50 dark:bg-slate-900 py-1 z-10">
                  {dateKey}
                  <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal">
                    ({groupedByDate[dateKey].length})
                  </span>
                </h2>
                <div className="space-y-2">
                  {groupedByDate[dateKey].map((u) => (
                    <div
                      key={u.uid}
                      className={`relative overflow-hidden rounded-xl border bg-white dark:bg-slate-800 shadow-sm transition hover:shadow dark:shadow-none dark:hover:bg-slate-800/90 ${
                        u.verified === true
                          ? "border-l-2 border-l-green-500 border-gray-200 dark:border-slate-700"
                          : "border-l-2 border-l-amber-500 border-gray-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="px-3 py-2 flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="min-w-0 flex-1 text-left rounded-lg -m-1 p-1 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-inset"
                        >
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {u.name || "—"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-2">
                            <span className="truncate">{u.email || u.mobile || "No contact"}</span>
                            {u.isWalkIn && (
                              <span className="text-[8px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                                Walk-in
                              </span>
                            )}
                          </p>
                        </button>
                        <div
                          className="shrink-0 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                          role="group"
                          aria-label={u.verified === true ? "Verified – click to unverify" : "Pending – click to verify"}
                        >
                          {(u.mobile || u.phone) && (
                            <a
                              href={`tel:${(u.mobile || u.phone || "").replace(/\D/g, "")}`}
                              className="flex items-center justify-center w-9 h-9 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                              aria-label={`Call ${u.name || "customer"}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone size={18} />
                            </a>
                          )}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={u.verified === true}
                            disabled={updatingUid === u.uid}
                            onClick={() => handleToggleVerified(u)}
                            className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                              u.verified === true ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
                            }`}
                          >
                            <span className="sr-only">
                              {u.verified === true ? "Verified" : "Pending verification"}
                            </span>
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                                u.verified === true ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                            {updatingUid === u.uid && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={14} className="animate-spin text-white" />
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
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
                <div className="flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex gap-2">
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
                  <button
                    type="button"
                    onClick={async () => {
                      if (editingUser && (await handleDelete(editingUser))) closeEditModal();
                    }}
                    disabled={deletingUid === editingUser?.uid}
                    className="w-full py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingUid === editingUser?.uid ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Trash2 size={16} /> Delete customer
                      </>
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
