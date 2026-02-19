import { useEffect, useState, useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import { subscribeToAllOrders, updateOrderStatus, deleteOrder } from "../../services/firestore/orderService";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Plus,
  Filter,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Loader2,
  Package,
  Eye,
} from "lucide-react";
import OrderDetailsModal from "../../components/OrderDetailsModal";

const STATUS_OPTIONS = ["All", "Pending", "In Progress", "Completed", "Pending Pickup"];
const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "customer", label: "Customer" },
];

const STATUS_ICONS = {
  Pending: Clock,
  "In Progress": Loader2,
  Completed: CheckCircle,
  "Pending Pickup": Package,
};

// Day-wise grouping helpers
const getOrderDate = (order) =>
  order.createdAt?.toDate?.() || new Date(order.createdAt);
const getDayKey = (date) => date.toISOString().slice(0, 10); // YYYY-MM-DD
const formatDayLabel = (dayKey) => {
  const d = new Date(dayKey + "T12:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (getDayKey(today) === dayKey) return "Today";
  if (getDayKey(yesterday) === dayKey) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const StatusBadge = ({ status, compact }) => {
  const s = status || "Pending";
  const Icon = STATUS_ICONS[s] || Clock;
  const color =
    s === "Completed"
      ? "text-green-600 dark:text-green-400"
      : s === "In Progress"
      ? "text-blue-600 dark:text-blue-400"
      : s === "Pending Pickup"
      ? "text-amber-600 dark:text-amber-400"
      : "text-yellow-600 dark:text-yellow-400";
  return (
    <span className={`inline-flex items-center gap-1 ${color}`}>
      <Icon size={compact ? 12 : 14} className={`shrink-0 ${s === "In Progress" ? "animate-spin" : ""}`} />
      <span className="text-xs font-medium">{s}</span>
    </span>
  );
};

// Mobile: single card per order — compact for more visible on screen
const OrderCard = ({
  order,
  displayId,
  onViewDetail,
  onDoneClick,
  updatingId,
}) => {
  const isPending = order.status !== "Completed";
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-sm transition touch-manipulation">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight" title={order.userName}>
            {order.userName || "—"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
            Order #{displayId(order)}
          </p>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
          ₹{order.totalAmount ?? 0}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-slate-700 flex-wrap">
        <StatusBadge status={order.status} compact />
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewDetail(order); }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
            title="View detail"
          >
            <Eye size={12} className="opacity-70" /> View
          </button>
          {isPending && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDoneClick(e, order.id); }}
              onKeyDown={(e) => e.stopPropagation()}
              disabled={updatingId === order.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              title="Mark done"
            >
              <CheckCircle size={12} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [groupByDay, setGroupByDay] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD, empty = all dates
  const filterRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(setOrders);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    if (filterOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [filterOpen]);

  // Build searchable text from all order parameters (case-insensitive match)
  const orderToSearchText = (o) => {
    const parts = [
      o.orderNumber != null ? String(o.orderNumber) : "",
      o.id || "",
      o.userName || "",
      o.userMobile || "",
      o.totalAmount != null ? String(o.totalAmount) : "",
      o.status || "",
      o.pickupDate || "",
      o.pickupTime || "",
      o.pickupLocation?.label || "",
      o.pickupLocation?.address || "",
      o.instructions || "",
    ];
    if (o.items?.length) {
      o.items.forEach((it) => {
        parts.push(it.item || "", it.section || "", it.service || "", it.quantity != null ? String(it.quantity) : "", it.price != null ? String(it.price) : "");
      });
    }
    const date = o.createdAt?.toDate?.() || (o.createdAt ? new Date(o.createdAt) : null);
    if (date) parts.push(date.toLocaleDateString(), date.toISOString().slice(0, 10));
    return parts.join(" ").toLowerCase();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "All" && (o.status || "Pending") !== statusFilter) return false;
    if (dateFilter) {
      const orderDay = getDayKey(getOrderDate(o));
      if (orderDay !== dateFilter) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return orderToSearchText(o).includes(q);
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "date") {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      cmp = dateA - dateB;
    } else if (sortBy === "amount") {
      cmp = (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
    } else if (sortBy === "customer") {
      const nameA = (a.userName || "").toLowerCase();
      const nameB = (b.userName || "").toLowerCase();
      cmp = nameA.localeCompare(nameB);
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  // Group orders by day (newest first) for day-wise view
  const ordersByDay = (() => {
    const map = new Map();
    for (const order of sortedOrders) {
      const key = getDayKey(getOrderDate(order));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(order);
    }
    const keys = [...map.keys()].sort((a, b) => b.localeCompare(a));
    return keys.map((key) => ({ dayKey: key, orders: map.get(key) }));
  })();

  const handleMarkDone = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, "Completed");
      toast.success("Order marked as completed.");
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order.");
    }
    setUpdatingId(null);
  };

  const handleDoneClick = (e, orderId) => {
    e.stopPropagation();
    if (window.confirm("Mark this order as completed?")) {
      handleMarkDone(orderId);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Delete order #${order.orderNumber ?? order.id}? This cannot be undone.`)) return;
    setUpdatingId(order.id);
    try {
      await deleteOrder(order.id);
      toast.success("Order deleted.");
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order.");
    }
    setUpdatingId(null);
  };

  // Display: simple order number (1, 2, 3...) or fallback to last 4 chars of doc id
  const displayId = (order) =>
    order.orderNumber != null ? String(order.orderNumber) : (order.id ? String(order.id).slice(-4) : "—");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 dark:from-indigo-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative px-3 py-3 max-w-6xl mx-auto pb-20">
        {/* Top section: title + search/filter — stacked on mobile for cleaner layout */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                All Orders
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                {statusFilter !== "All" ? ` · ${statusFilter}` : ""}
                {dateFilter ? ` · ${formatDayLabel(dateFilter)}` : ""}
                {searchQuery.trim() ? " (filtered)" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1 min-w-0 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Search orders by order number, customer, phone, amount, status, date, items, etc."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-slate-600 text-sm leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition shrink-0 ${
                filterOpen
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
              title="Filters & sort"
            >
              <Filter size={14} /> Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg p-3 text-xs" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  <label className="block text-gray-500 dark:text-gray-400 font-medium">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-medium mt-2">Filter by date</label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value || "")}
                      className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    {dateFilter && (
                      <button
                        type="button"
                        onClick={() => setDateFilter("")}
                        className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Clear date filter
                      </button>
                    )}
                  </div>
                  <label className="block text-gray-500 dark:text-gray-400 font-medium mt-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                    className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 text-xs font-medium"
                  >
                    {sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </button>
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupByDay}
                      onChange={(e) => setGroupByDay(e.target.checked)}
                      className="rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Calendar size={12} /> Group by day
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Mobile: card list — no table, no horizontal scroll */}
        <div className="md:hidden">
          {sortedOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700">
              {searchQuery.trim() ? "No orders match your search." : statusFilter === "All" ? "No orders yet." : `No orders with status "${statusFilter}".`}
            </div>
          ) : groupByDay ? (
            <div className="space-y-0">
              {ordersByDay.map(({ dayKey, orders: dayOrders }, idx) => (
                <div key={dayKey} className={idx > 0 ? "pt-3 mt-3" : ""}>
                  <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-2 rounded-lg bg-gray-200 dark:bg-slate-600">
                    <Calendar size={13} className="text-gray-600 dark:text-gray-300 shrink-0" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {formatDayLabel(dayKey)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {dayOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        displayId={displayId}
                        onViewDetail={setSelectedOrder}
                        onDoneClick={handleDoneClick}
                        updatingId={updatingId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  displayId={displayId}
                  onViewDetail={setSelectedOrder}
                  onDoneClick={handleDoneClick}
                  updatingId={updatingId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: compact 3-column table — combined columns, no horizontal scroll */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-800/60 backdrop-blur border border-white/50 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {sortedOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchQuery.trim() ? "No orders match your search." : statusFilter === "All" ? "No orders yet." : `No orders with status "${statusFilter}".`}
            </div>
          ) : (
            <div className="overflow-hidden min-w-0">
              <table className="w-full text-sm border-collapse">
                <colgroup>
                  <col className="w-[1%]" />
                  <col className="w-[1%]" />
                  <col className="w-[1%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-600 text-left text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50">
                    <th className="py-2.5 px-3 font-medium">Order · Customer</th>
                    <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupByDay
                    ? ordersByDay.map(({ dayKey, orders: dayOrders }, idx) => (
                        <Fragment key={dayKey}>
                          <tr
                            className={idx > 0 ? "border-t-2 border-gray-300 dark:border-slate-500" : ""}
                          >
                            <td colSpan={3} className="py-2.5 px-3 font-semibold text-gray-800 dark:text-gray-200 text-xs bg-gray-200 dark:bg-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar size={12} className="opacity-80 shrink-0" />
                                {formatDayLabel(dayKey)}
                                <span className="text-gray-600 dark:text-gray-400 font-normal">
                                  ({dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""})
                                </span>
                              </span>
                            </td>
                          </tr>
                          {dayOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition"
                            >
                              <td className="py-2 px-3 min-w-0">
                                <span className="text-gray-500 dark:text-gray-400 font-mono text-xs mr-2">#{displayId(order)}</span>
                                <span className="font-medium text-gray-900 dark:text-white truncate inline-block max-w-[200px] align-bottom" title={order.userName}>
                                  {order.userName || "—"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                ₹{order.totalAmount ?? 0}
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <StatusBadge status={order.status} />
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                                    title="View detail"
                                  >
                                    <Eye size={12} className="opacity-70" /> View
                                  </button>
                                  {order.status !== "Completed" && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDoneClick(e, order.id)}
                                      disabled={updatingId === order.id}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                      title="Mark done"
                                    >
                                      <CheckCircle size={12} /> Done
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))
                    : sortedOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition"
                        >
                          <td className="py-2 px-3 min-w-0">
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs mr-2">#{displayId(order)}</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate inline-block max-w-[200px] align-bottom" title={order.userName}>
                              {order.userName || "—"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            ₹{order.totalAmount ?? 0}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={order.status} />
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                                title="View detail"
                              >
                                <Eye size={12} className="opacity-70" /> View
                              </button>
                              {order.status !== "Completed" && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDoneClick(e, order.id)}
                                  disabled={updatingId === order.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                  title="Mark done"
                                >
                                  <CheckCircle size={12} /> Done
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Create Order – bottom right */}
      <Link
        to="/admin/create-order"
        className="fixed bottom-20 right-5 md:bottom-5 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition"
        title="Create order"
      >
        <Plus size={22} />
      </Link>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onEdit
          onDelete={handleDeleteOrder}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
