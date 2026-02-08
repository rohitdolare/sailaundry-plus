import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { subscribeToAllOrders, updateOrderStatus } from "../../services/firestore/orderService";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Loader2,
  Package,
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

const StatusBadge = ({ status }) => {
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
      <Icon size={14} className={s === "In Progress" ? "animate-spin shrink-0" : "shrink-0"} />
      <span className="text-xs font-medium">{s}</span>
    </span>
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

  const filteredOrders = orders.filter(
    (o) => statusFilter === "All" || (o.status || "Pending") === statusFilter
  );

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

  // Display: simple order number (1, 2, 3...) or fallback to last 4 chars of doc id
  const displayId = (order) =>
    order.orderNumber != null ? String(order.orderNumber) : (order.id ? String(order.id).slice(-4) : "—");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 dark:from-indigo-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative px-3 py-4 max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
              All Orders
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
              {statusFilter !== "All" ? ` · ${statusFilter}` : ""}
            </p>
          </div>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                filterOpen
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
              title="Filters & sort"
            >
              <Filter size={14} /> Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg p-3 text-xs">
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
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur border border-white/50 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {sortedOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
              {statusFilter === "All" ? "No orders yet." : `No orders with status "${statusFilter}".`}
            </div>
          ) : (
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "2.5rem" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "3.5rem" }} />
                  <col style={{ width: "auto" }} />
                  <col style={{ width: "4rem" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-600 text-left text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50">
                    <th className="py-2 px-1 font-medium">#</th>
                    <th className="py-2 px-1 font-medium">Customer</th>
                    <th className="py-2 px-1 font-medium">₹</th>
                    <th className="py-2 px-1 font-medium">Status</th>
                    <th className="py-2 px-1 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => (
                    <tr
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedOrder(order)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedOrder(order)}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition cursor-pointer"
                    >
                      <td className="py-2 px-1 text-gray-500 dark:text-gray-400 font-mono text-[10px]">
                        {displayId(order)}
                      </td>
                      <td className="py-2 px-1 font-medium text-gray-900 dark:text-white break-words min-w-0" title={order.userName}>
                        {order.userName || "—"}
                      </td>
                      <td className="py-2 px-1 font-semibold whitespace-nowrap">₹{order.totalAmount ?? 0}</td>
                      <td className="py-2 px-1">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-2 px-1 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {order.status !== "Completed" && (
                          <button
                            type="button"
                            onClick={(e) => handleDoneClick(e, order.id)}
                            disabled={updatingId === order.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                            title="Mark done"
                          >
                            <CheckCircle size={12} /> Done
                          </button>
                        )}
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
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
