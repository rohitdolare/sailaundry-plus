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
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAllUsers,
  getUserProfile,
  addOrder,
  updateOrder,
  getOrderById,
  getCatalog,
  createWalkinUser,
} from "../../services/firestore";

const DEBOUNCE_MS = 350;

const AdminPlaceOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!orderId;

  const [users, setUsers] = useState([]);
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

  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "",
    instructions: "",
  });

  const [catalog, setCatalog] = useState([]);
  const [items, setItems] = useState([
    { section: "", item: "", service: "", quantity: 1, price: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [userList, catalogData] = await Promise.all([
          getAllUsers(),
          getCatalog(),
        ]);
        setUsers(Array.isArray(userList) ? userList.filter((u) => u.role !== "admin") : []);
        setCatalog(Array.isArray(catalogData) ? catalogData : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users or catalog.");
        setUsers([]);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "service" || field === "item" || field === "section") {
      const section = catalog.find((s) => s.name === updated[index].section);
      const item = section?.items?.find((i) => i.name === updated[index].item);
      const service = item?.services?.find((s) => s.type === updated[index].service);
      updated[index].price = service?.price || 0;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { section: "", item: "", service: "", quantity: 1, price: 0 }]);
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
      userName: (customerName || selectedUserProfile?.name || "").trim(),
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

    if (items.some((i) => !i.section || !i.item || !i.service)) {
      toast.error("Please fill all item details.");
      return;
    }

    const name = customerName.trim();
    const mobile = customerMobile.trim();
    if (!name || !mobile) {
      toast.error("Please enter customer name and mobile.");
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
          setUsers((prev) => [
            ...prev,
            {
              uid,
              name,
              mobile,
              role: "customer",
              isWalkIn: true,
              locations: customerAddress.trim() ? [{ label: "Default", address: customerAddress.trim() }] : [],
            },
          ]);
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
        toast.success("Order updated successfully!");
        navigate("/admin/orders");
      } else {
        await addOrder(orderData);
        toast.success("Order created successfully!");
        setFormData({ pickupDate: "", pickupTime: "", instructions: "" });
        setItems([{ section: "", item: "", service: "", quantity: 1, price: 0 }]);
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 dark:from-indigo-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isEditMode ? "Edit Order" : "Create Order (Admin)"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isEditMode ? "Update order details" : "Search for a customer or enter details for a new one"}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 p-8 shadow-xl"
        >
          {/* Single customer flow: search → select or enter new */}
          <div className="space-y-4">
            <div className="relative space-y-3" ref={customerListRef}>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User size={18} className="text-indigo-600 dark:text-indigo-400" />
                Customer
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerListOpen(true);
                    if (selectedUserId) {
                      setSelectedUserId("");
                      setCustomerName("");
                      setCustomerMobile("");
                      setCustomerAddress("");
                    }
                  }}
                  onFocus={() => setCustomerListOpen(true)}
                  onClick={() => setCustomerListOpen(true)}
                  placeholder="Search by name or mobile..."
                  className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>
              {customerListOpen && (() => {
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
                  <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-lg">
                    {filtered.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        {q.length < 2 ? "Type at least 2 characters to search" : "No customer found — enter details below as new customer"}
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
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-slate-600 last:border-0 text-sm transition ${
                            selectedUserId === u.uid
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
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

            {selectedUserId && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-medium text-gray-900 dark:text-white">{customerName || "—"} · {customerMobile || "—"}</span>
                {" · "}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserId("");
                    setCustomerSearch("");
                    setCustomerName("");
                    setCustomerMobile("");
                    setCustomerAddress("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Change customer
                </button>
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mobile</label>
                <input
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {locations.length > 0 ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin size={18} /> Pickup location
                </label>
                <select
                  value={selectedLocationIndex}
                  onChange={(e) => setSelectedLocationIndex(parseInt(e.target.value))}
                  className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
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
                  className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
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
                className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
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
                className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-slate-600">
              <ShoppingCart size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order items</h3>
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 sm:grid-cols-5 items-end bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-600"
              >
                <select
                  value={item.section}
                  onChange={(e) => handleItemChange(index, "section", e.target.value)}
                  className="rounded-lg bg-white dark:bg-slate-600 px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-indigo-500"
                >
                  <option value="">Section</option>
                  {catalog.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={item.item}
                  onChange={(e) => handleItemChange(index, "item", e.target.value)}
                  className="rounded-lg bg-white dark:bg-slate-600 px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-indigo-500"
                >
                  <option value="">Item</option>
                  {catalog.find((s) => s.name === item.section)?.items?.map((it) => (
                    <option key={it.name} value={it.name}>{it.name}</option>
                  ))}
                </select>
                <select
                  value={item.service}
                  onChange={(e) => handleItemChange(index, "service", e.target.value)}
                  className="rounded-lg bg-white dark:bg-slate-600 px-3 py-2 text-gray-900 dark:text-white text-sm focus:border-indigo-500"
                >
                  <option value="">Service</option>
                  {catalog.find((s) => s.name === item.section)?.items?.find((i) => i.name === item.item)?.services?.map((srv) => (
                    <option key={srv.type} value={srv.type}>{srv.type} (₹{srv.price})</option>
                  ))}
                </select>
                <div className="flex items-center gap-0.5 rounded-lg bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleItemChange(index, "quantity", Math.max(1, (item.quantity || 1) - 1))}
                    disabled={(item.quantity || 1) <= 1}
                    className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-500 disabled:opacity-50 disabled:pointer-events-none transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[1.75rem] text-center text-sm font-semibold text-gray-900 dark:text-white">
                    {item.quantity || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleItemChange(index, "quantity", (item.quantity || 1) + 1)}
                    className="p-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-500 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add another item
            </button>
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
              placeholder="Optional notes..."
              className="w-full rounded-xl border-2 border-transparent bg-gray-50 dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Total & submit */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700/50 rounded-2xl p-6 border border-indigo-200 dark:border-slate-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              ₹{items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || loadingOrder}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
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
