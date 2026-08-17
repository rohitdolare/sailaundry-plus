import { useEffect, useState } from "react";
import {
  updateUserVerified,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../../services/firestore";
import { useAdminData } from "../../contexts/AdminDataContext";
import { toast } from "react-hot-toast";
import {
  Users,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
} from "lucide-react";

const PAGE_SIZE = 20;

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "?";
};

const AdminCustomersPage = () => {
  const { customers, customersLoading } = useAdminData();
  const users = customers || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUid, setUpdatingUid] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", mobile: "", locations: [] });
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingUid, setDeletingUid] = useState(null);
  const [page, setPage] = useState(1);

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
      toast.success(newVerified ? "Customer verified. They can now sign in." : "Customer unverified.");
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

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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

  // Recent onboarding first, paginated
  const sortedUsers = [...filteredUsers].sort((a, b) => getOnboardingDate(b) - getOnboardingDate(a));
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedUsers = sortedUsers.slice(pageStart, pageStart + PAGE_SIZE);

  if (customersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="w-full transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-4 lg:gap-6">
        <header className="shrink-0 flex items-center gap-2">
          <Users size={22} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Customers
          </h1>
        </header>

        {users.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 p-12 text-center">
            <Users className="mx-auto mb-3 text-gray-400 dark:text-gray-500" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No customers yet.</p>
          </div>
        ) : (
          <section className="rounded-3xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-lg overflow-hidden min-h-0 flex flex-col flex-1">
            {/* Toolbar */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80 flex flex-wrap items-center justify-between gap-3 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, mobile, email, address"
                  className="w-full h-9 pl-9 pr-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  aria-label="Search customers"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {searchQuery.trim() ? `${filteredUsers.length} of ${users.length}` : users.length} customers
              </p>
            </div>

            <div className="overflow-x-auto min-h-0 flex-1">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80">
                    <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400 w-10">#</th>
                    <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Contact</th>
                    <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Joined</th>
                    <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    <th className="py-2 px-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-5 text-center text-gray-500 dark:text-gray-400">
                        No customers match &quot;{searchQuery.trim()}&quot;.
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((u, i) => (
                      <tr
                        key={u.uid}
                        className="border-b border-gray-50 dark:border-gray-800 dark:border-opacity-50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40 transition"
                      >
                        <td className="py-2.5 px-5 font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                          {pageStart + i + 1}
                        </td>
                        <td className="py-2.5 px-5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="flex items-center gap-3 text-left group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-600 dark:text-indigo-400 font-semibold text-xs shrink-0">
                              {getInitials(u.name)}
                            </span>
                            <span className="min-w-0 flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                {u.name || "—"}
                              </span>
                              {u.isWalkIn && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0 font-medium">
                                  Walk-in
                                </span>
                              )}
                            </span>
                          </button>
                        </td>
                        <td className="py-2.5 px-5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-700 dark:text-gray-300 truncate">
                              {u.mobile || u.email || "—"}
                            </span>
                            {(u.mobile || u.phone) && (
                              <a
                                href={`tel:${(u.mobile || u.phone || "").replace(/\D/g, "")}`}
                                className="flex items-center justify-center w-7 h-7 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-30 transition shrink-0"
                                aria-label={`Call ${u.name || "customer"}`}
                              >
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {getOnboardingDateKey(u)}
                        </td>
                        <td className="py-2.5 px-5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={u.verified === true}
                            disabled={updatingUid === u.uid}
                            onClick={() => handleToggleVerified(u)}
                            aria-label={u.verified === true ? "Verified – click to unverify" : "Pending – click to verify"}
                            className="flex items-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                          >
                            <span
                              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                                u.verified === true ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            >
                              <span
                                className={`pointer-events-none absolute top-0.5 left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                                  u.verified === true ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                              {updatingUid === u.uid && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 size={10} className="animate-spin text-white" />
                                </span>
                              )}
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                u.verified === true
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {u.verified === true ? "Verified" : "Pending"}
                            </span>
                          </button>
                        </td>
                        <td className="py-2.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            aria-label={`Edit ${u.name || "customer"}`}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900 dark:hover:bg-opacity-30 transition"
                          >
                            <Pencil size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 dark:border-opacity-80 flex items-center justify-between gap-3 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30 shrink-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Edit Customer Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 backdrop-blur-xl backdrop-filter rounded-3xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 dark:border-opacity-80">
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100">
                  Edit customer
                </h3>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
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
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
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
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
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
                          className="flex gap-2 items-start p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={loc.label}
                              onChange={(e) => updateLocation(idx, "label", e.target.value)}
                              placeholder="Label (e.g. Home)"
                              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                            />
                            <input
                              type="text"
                              value={loc.address}
                              onChange={(e) => updateLocation(idx, "address", e.target.value)}
                              placeholder="Address"
                              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLocation(idx)}
                            className="p-2 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent transition duration-200 shrink-0"
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
                <div className="flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-800 dark:border-opacity-80">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
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
                    className="w-full py-2.5 rounded-2xl border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent font-medium transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
