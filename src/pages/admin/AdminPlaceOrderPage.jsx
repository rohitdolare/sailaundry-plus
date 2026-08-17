import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Shirt,
  StickyNote,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  User,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getUserProfile,
  addOrder,
  updateOrder,
  getOrderById,
  getCatalog,
  createWalkinUser,
} from "../../services/firestore";
import { useAdminData } from "../../contexts/AdminDataContext";

const DEBOUNCE_MS = 350;

function getDefaultPickupDateTime() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(oneHourLater.getHours()).padStart(2, "0");
  const min = String(oneHourLater.getMinutes()).padStart(2, "0");
  return {
    pickupDate: `${y}-${m}-${d}`,
    pickupTime: `${h}:${min}`,
  };
}

const AdminPlaceOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!orderId;

  const { customers } = useAdminData();
  const users = customers || [];
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerListOpen, setCustomerListOpen] = useState(false);
  const customerListRef = useRef(null);
  const isPopulatingFromOrderRef = useRef(false);

  // Selected customer (from search) or new: name/mobile/address always in form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [formData, setFormData] = useState(() => {
    const { pickupDate, pickupTime } = getDefaultPickupDateTime();
    return { pickupDate, pickupTime, instructions: "" };
  });

  const [catalog, setCatalog] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const catalogData = await getCatalog();
        setCatalog(Array.isArray(catalogData) ? catalogData : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load catalog.");
        setCatalog([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserProfile(null);
      setLocations([]);
      return;
    }
    if (isPopulatingFromOrderRef.current) return;
    const load = async () => {
      try {
        const profile = await getUserProfile(selectedUserId);
        setSelectedUserProfile(profile);
        const locs = profile?.locations || [];
        setLocations(locs);
        setSelectedLocationIndex(0);
        // Prefill address for display; if they have no locations we use customerAddress
        const firstAddr = locs[0]?.address || "";
        setCustomerAddress((prev) => (prev || firstAddr));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customer profile.");
      }
    };
    load();
  }, [selectedUserId]);

  useEffect(() => {
    if (!orderId || !catalog.length) return;
    isPopulatingFromOrderRef.current = true;
    const load = async () => {
      setLoadingOrder(true);
      try {
        const order = await getOrderById(orderId);
        if (!order) {
          toast.error("Order not found.");
          navigate("/admin/orders");
          return;
        }
        const isWalkin = order.pickupLocation?.label === "Walk-in";
        setFormData({
          pickupDate: order.pickupDate || "",
          pickupTime: order.pickupTime || "",
          instructions: order.instructions || "",
        });
        setItems(
          order.items?.length
            ? order.items.map((i) => ({
                section: i.section || "",
                item: i.item || "",
                service: i.service || "",
                quantity: i.quantity || 1,
                price: i.price || 0,
              }))
            : [{ section: "", item: "", service: "", quantity: 1, price: 0 }]
        );
        setCustomerName(order.userName || "");
        setCustomerMobile(order.userMobile || "");
        setCustomerAddress(order.pickupLocation?.address || "");
        if (isWalkin) {
          setSelectedUserId(order.uid || "");
          setSelectedUserProfile(null);
          setLocations([]);
        } else {
          setSelectedUserId(order.uid || "");
          const profile = await getUserProfile(order.uid);
          const locs = profile?.locations || [];
          setSelectedUserProfile(profile);
          setLocations(locs);
          const matchIdx = locs.findIndex(
            (l) =>
              (l.address || "") === (order.pickupLocation?.address || "") &&
              (l.label || "") === (order.pickupLocation?.label || "")
          );
          setSelectedLocationIndex(matchIdx >= 0 ? matchIdx : 0);
        }
        setEditingOrder(order);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order.");
        navigate("/admin/orders");
      }
      setLoadingOrder(false);
      isPopulatingFromOrderRef.current = false;
    };
    load();
  }, [orderId, catalog.length, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerListRef.current && !customerListRef.current.contains(e.target)) {
        setCustomerListOpen(false);
      }
    };
    if (customerListOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [customerListOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(customerSearch), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleQuickAdd = (sectionName, itemName, service) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.section === sectionName && i.item === itemName && i.service === service.type
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: (updated[idx].quantity || 1) + 1 };
        return updated;
      }
      return [
        ...prev,
        { section: sectionName, item: itemName, service: service.type, quantity: 1, price: service.price || 0 },
      ];
    });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getOrderPayload = (uid) => {
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const hasSavedLocation = selectedUserId && locations.length > 0;
    const pickupLocation = hasSavedLocation
      ? locations[selectedLocationIndex]
      : { label: "Walk-in", address: (customerAddress || "").trim() };
    return {
      uid,
      userName: (selectedUserId ? (customerName || selectedUserProfile?.name) : customerSearch || "").trim(),
      userMobile: (customerMobile || selectedUserProfile?.mobile || "").trim(),
      pickupLocation,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      instructions: formData.instructions,
      status: "Pending",
      createdAt: new Date(),
      items,
      totalAmount,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }

    const name = (selectedUserId ? customerName : customerSearch).trim();
    const mobile = customerMobile.trim();
    if (!name || !mobile) {
      toast.error("Please enter the customer's name and mobile number.");
      return;
    }

    setLoading(true);
    let uid = selectedUserId;
    if (!uid) {
      const existingByMobile = users.find((u) => (u.mobile || "").replace(/\s/g, "") === mobile.replace(/\s/g, ""));
      if (existingByMobile) {
        uid = existingByMobile.uid;
      } else {
        try {
          uid = await createWalkinUser({
            name,
            mobile,
            address: customerAddress.trim() || undefined,
          });
        } catch (err) {
          console.error(err);
          toast.error("Failed to create customer.");
          setLoading(false);
          return;
        }
      }
    }

    const orderData = getOrderPayload(uid);
    try {
      if (isEditMode) {
        const payload = { ...orderData, status: editingOrder?.status ?? orderData.status };
        await updateOrder(orderId, payload);
        toast.success("Order updated successfully.");
        navigate("/admin/orders");
      } else {
        await addOrder(orderData);
        toast.success("Order created successfully.");
        const { pickupDate, pickupTime } = getDefaultPickupDateTime();
        setFormData({ pickupDate, pickupTime, instructions: "" });
        setItems([]);
        setCustomerName("");
        setCustomerMobile("");
        setCustomerAddress("");
        setCustomerSearch("");
        setSelectedUserId("");
      }
    } catch (err) {
      console.error(err);
      toast.error(isEditMode ? "Failed to update order." : "Failed to create order.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full transition-colors duration-300">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {isEditMode ? "Edit Order" : "New Order"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isEditMode ? "Update order details" : "Search for an existing customer or add a new one"}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-lg p-8 max-w-3xl"
        >
          {/* Single customer input: search by name/mobile or type new customer name */}
          <div className="space-y-4">
            <div className="relative space-y-3" ref={customerListRef}>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                Customer
              </label>
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={selectedUserId ? `${customerName || "—"} · ${customerMobile || "—"}` : customerSearch}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (selectedUserId) {
                      setSelectedUserId("");
                      setCustomerName("");
                      setCustomerMobile("");
                      setCustomerAddress("");
                      setCustomerSearch(v);
                    } else {
                      setCustomerSearch(v);
                    }
                    setCustomerListOpen(true);
                  }}
                  onFocus={() => !selectedUserId && setCustomerListOpen(true)}
                  onClick={() => !selectedUserId && setCustomerListOpen(true)}
                  readOnly={!!selectedUserId}
                  placeholder="Search by name or mobile, or type a new customer name"
                  className={`w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition ${selectedUserId ? "cursor-default" : ""}`}
                />
                {selectedUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId("");
                      setCustomerSearch("");
                      setCustomerName("");
                      setCustomerMobile("");
                      setCustomerAddress("");
                      setCustomerListOpen(true);
                    }}
                    className="shrink-0 rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition"
                  >
                    Change
                  </button>
                )}
              </div>
              {customerListOpen && !selectedUserId && (() => {
                const q = (debouncedSearch || "").trim().toLowerCase();
                const filtered =
                  q.length < 2
                    ? []
                    : users.filter(
                        (u) =>
                          (u.name || "").toLowerCase().includes(q) ||
                          (u.mobile || "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))
                      );
                return (
                  <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-2xl border border-white border-opacity-60 dark:border-gray-700 dark:border-opacity-60 bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 backdrop-blur-xl backdrop-filter shadow-xl">
                    {filtered.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {q.length < 2 ? "Type at least 2 characters to search" : "No match — will create a new customer"}
                      </p>
                    ) : (
                      filtered.map((u) => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.uid);
                            setCustomerName(u.name || "");
                            setCustomerMobile(u.mobile || "");
                            setCustomerAddress(u.locations?.[0]?.address || "");
                            setCustomerListOpen(false);
                            setCustomerSearch("");
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-600 last:border-0 text-sm transition ${
                            selectedUserId === u.uid
                              ? "bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-40 text-indigo-700 dark:text-indigo-400 font-medium"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {u.name || "—"} · {u.mobile || "—"}
                        </button>
                      ))
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mobile</label>
              <input
                type="tel"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="10-digit mobile (required)"
                className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>

            {locations.length > 0 ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin size={18} /> Pickup location
                </label>
                <select
                  value={selectedLocationIndex}
                  onChange={(e) => setSelectedLocationIndex(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                >
                  {locations.map((loc, i) => (
                    <option key={i} value={i}>
                      {loc.label} – {loc.address}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Pickup address (optional)"
                  className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
            )}
          </div>

          {/* Date & time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={18} /> Pickup date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={18} /> Pickup time
              </label>
              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <ShoppingCart size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100">Order items</h3>
            </div>

            {/* Catalog quick-add picker */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search items to add..."
                  className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 p-4">
                {(() => {
                  const q = catalogSearch.trim().toLowerCase();
                  const filteredCatalog = catalog
                    .map((section) => ({
                      ...section,
                      items: section.items?.filter((it) => !q || it.name.toLowerCase().includes(q)) || [],
                    }))
                    .filter((section) => section.items.length > 0);
                  if (filteredCatalog.length === 0) {
                    return (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        {catalog.length === 0 ? "Loading catalog..." : "No items match your search"}
                      </p>
                    );
                  }
                  return filteredCatalog.map((section) => (
                    <div key={section.name} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {section.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {section.items.map((it) =>
                          it.services?.map((srv) => {
                            const existing = items.find(
                              (i) => i.section === section.name && i.item === it.name && i.service === srv.type
                            );
                            return (
                              <button
                                key={`${it.name}-${srv.type}`}
                                type="button"
                                onClick={() => handleQuickAdd(section.name, it.name, srv)}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                                  existing
                                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-300"
                                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                                }`}
                              >
                                <Plus size={14} />
                                {it.name} · {srv.type}
                                <span className="text-gray-400 dark:text-gray-500">₹{srv.price}</span>
                                {existing && (
                                  <span className="ml-0.5 flex items-center justify-center min-w-[1.1rem] h-[1.1rem] rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1">
                                    {existing.quantity}
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Added items */}
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                  No items added yet — tap items above to add them
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1 min-w-[10rem]">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.item}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.section} · {item.service} · ₹{item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, "quantity", Math.max(1, (item.quantity || 1) - 1))}
                        disabled={(item.quantity || 1) <= 1}
                        className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[1.75rem] text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, "quantity", (item.quantity || 1) + 1)}
                        className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="rounded-xl border border-red-200 bg-white text-red-600 p-2 flex items-center justify-center transition duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <StickyNote size={18} /> Special instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes"
              className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          {/* Total & submit */}
          <div className="bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="font-heading text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || loadingOrder}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Shirt size={20} />
            <span>
              {loadingOrder ? "Loading..." : loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update order" : "Create order"}
            </span>
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPlaceOrderPage;
