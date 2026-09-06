import { useEffect, useState, useRef, useCallback, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  updateOrderStatus,
  deleteOrder,
  getOrdersFirstPage,
  getOrdersPageAfter,
} from "../../services/firestore/orderService";
import { toast } from "react-hot-toast";
import { toWhatsAppNumber } from "../../utils/phone";
import { buildOrderCompletedMessage } from "../../utils/whatsappMessage";
import usePullToRefresh from "../../hooks/usePullToRefresh";
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
  RefreshCw,
} from "lucide-react";
import OrderDetailsModal from "../../components/OrderDetailsModal";

const PAGE_SIZE = 30;
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
      ? "text-teal-700 dark:text-teal-400"
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
    <div className="flex flex-col gap-0.5 p-2.5 rounded-2xl bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-700 dark:border-opacity-60 hover:border-indigo-200 dark:hover:border-indigo-400 dark:hover:border-opacity-40 transition touch-manipulation">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-tight" title={order.userName}>
            {order.userName || "—"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
            Order #{displayId(order)}
          </p>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 shrink-0">
          ₹{order.totalAmount ?? 0}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-700 flex-wrap">
        <StatusBadge status={order.status} compact />
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewDetail(order); }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
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
  // No live listener — orders are fetched once per filter change, and
  // refreshed only on explicit user action (pull-to-refresh / Refresh
  // button / "Load more"), so reads are bounded to what's actually requested.
  const [orders, setOrders] = useState([]);
  const [cursorDoc, setCursorDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
  const requestIdRef = useRef(0);

  const fetchFirstPage = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const { data, lastDoc, hasMore: more } = await getOrdersFirstPage(
        { status: statusFilter, dayKey: dateFilter || null },
        PAGE_SIZE
      );
      if (requestId !== requestIdRef.current) return; // a newer request superseded this one
      setOrders(data);
      setCursorDoc(lastDoc);
      setHasMore(more);
    } catch (err) {
      console.error(err);
      if (requestId === requestIdRef.current) toast.error("Failed to load orders.");
    }
  }, [statusFilter, dateFilter]);

  // Fetch fresh whenever status/date filters change.
  useEffect(() => {
    setLoading(true);
    fetchFirstPage().finally(() => setLoading(false));
  }, [fetchFirstPage]);

  const { pullDistance, refreshing, threshold } = usePullToRefresh(fetchFirstPage);

  const handleRefreshClick = () => {
    if (!refreshing && !loading) fetchFirstPage();
  };

  const handleLoadMore = async () => {
    if (!cursorDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data, lastDoc, hasMore: more } = await getOrdersPageAfter(
        { status: statusFilter, dayKey: dateFilter || null },
        cursorDoc,
        PAGE_SIZE
      );
      setOrders((prev) => [...prev, ...data]);
      setCursorDoc(lastDoc);
      setHasMore(more);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load more orders.");
    }
    setLoadingMore(false);
  };

  // Optimistically reflect this session's own mutations, since nothing is
  // live-subscribed anymore.
  const patchOrderLocally = (orderId, patch) => {
    const matchesFilter = (o) => statusFilter === "All" || (patch.status ?? o.status) === statusFilter;
    setOrders((prev) =>
      prev
        .map((o) => (o.id === orderId ? { ...o, ...patch } : o))
        .filter((o) => o.id !== orderId || matchesFilter(o))
    );
  };

  const removeOrderLocally = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

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

  // Status/date filtering already happened in the Firestore query itself
  // (see getOrdersFirstPage) — only free-text search applies client-side,
  // scoped to whatever's currently loaded.
  const filteredOrders = orders.filter((o) => {
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
    const order = orders.find((o) => o.id === orderId);
    // Open the tab synchronously (before any await) so browsers still treat
    // it as opened in direct response to the click, not a blocked popup.
    const waWindow = window.open("", "_blank");
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, "Completed");
      patchOrderLocally(orderId, { status: "Completed" });
      toast.success("Order marked as completed.");
      setSelectedOrder(null);

      const waNumber = order && toWhatsAppNumber(order.userMobile);
      if (waNumber) {
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(
          buildOrderCompletedMessage(order)
        )}`;
        if (waWindow) {
          waWindow.location.href = url;
        } else {
          // Popup was blocked — offer a manual link instead of failing silently.
          toast((t) => (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={() => toast.dismiss(t.id)}
              className="underline font-medium"
            >
              Popup blocked — tap to send WhatsApp update
            </a>
          ));
        }
      } else {
        waWindow?.close();
        toast.error("Customer has no valid mobile number — WhatsApp message not sent.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order.");
      waWindow?.close();
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
      removeOrderLocally(order.id);
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
    <div className="w-full transition-colors duration-300">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height]"
          style={{ height: refreshing ? 40 : Math.min(pullDistance, 40) }}
        >
          <RefreshCw
            size={18}
            className={`text-indigo-500 dark:text-indigo-400 ${refreshing || pullDistance >= threshold ? "animate-spin" : ""}`}
          />
        </div>
      )}
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        {/* Top section: title + search/filter — stacked on mobile for cleaner layout */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Orders
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {filteredOrders.length}{hasMore && !searchQuery.trim() ? "+" : ""} order{filteredOrders.length !== 1 ? "s" : ""}
                {statusFilter !== "All" ? ` · ${statusFilter}` : ""}
                {dateFilter ? ` · ${formatDayLabel(dateFilter)}` : ""}
                {searchQuery.trim() ? " (filtered)" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={loading || refreshing}
              title="Refresh orders"
              aria-label="Refresh orders"
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading || refreshing ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1 min-w-0 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full h-9 pl-3 pr-8 rounded-xl border border-white border-opacity-60 dark:border-gray-700 dark:border-opacity-60 bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter text-gray-900 dark:text-gray-100 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Search orders by order number, customer, phone, amount, status, date, items, etc."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-600 text-sm leading-none"
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
              className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium transition shrink-0 ${
                filterOpen
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-700 dark:text-indigo-400"
                  : "border-white border-opacity-60 dark:border-gray-700 dark:border-opacity-60 bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
              title="Filters & sort"
            >
              <Filter size={14} /> Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-2xl border border-white border-opacity-60 dark:border-gray-700 dark:border-opacity-60 bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 backdrop-blur-xl backdrop-filter shadow-xl p-3 text-xs" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-2">
                  <label className="block text-gray-500 dark:text-gray-400 font-medium">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                    className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs font-medium"
                  >
                    {sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </button>
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupByDay}
                      onChange={(e) => setGroupByDay(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
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
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 rounded-2xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60">
              Loading orders…
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 rounded-2xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60">
              {searchQuery.trim() ? "No orders match your search." : statusFilter === "All" ? "No orders yet." : `No orders with status "${statusFilter}".`}
            </div>
          ) : groupByDay ? (
            <div className="space-y-0">
              {ordersByDay.map(({ dayKey, orders: dayOrders }, idx) => (
                <div key={dayKey} className={idx > 0 ? "pt-3 mt-3" : ""}>
                  <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-2 rounded-xl bg-gray-100 bg-opacity-80 dark:bg-gray-700 dark:bg-opacity-80">
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
        <div className="hidden md:block bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 rounded-3xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading orders…
            </div>
          ) : sortedOrders.length === 0 ? (
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
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-600 dark:text-gray-400 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30">
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
                            className={idx > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}
                          >
                            <td colSpan={3} className="py-2.5 px-3 font-semibold text-gray-800 dark:text-gray-200 text-xs bg-gray-100 bg-opacity-80 dark:bg-gray-700 dark:bg-opacity-80">
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
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-30 transition"
                            >
                              <td className="py-2 px-3 min-w-0">
                                <span className="text-gray-500 dark:text-gray-400 font-mono text-xs mr-2">#{displayId(order)}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate inline-block max-w-[200px] align-bottom" title={order.userName}>
                                  {order.userName || "—"}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                ₹{order.totalAmount ?? 0}
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <StatusBadge status={order.status} />
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-30 transition"
                        >
                          <td className="py-2 px-3 min-w-0">
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs mr-2">#{displayId(order)}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate inline-block max-w-[200px] align-bottom" title={order.userName}>
                              {order.userName || "—"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            ₹{order.totalAmount ?? 0}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={order.status} />
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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

        {hasMore && !loading && (
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {loadingMore && <Loader2 size={14} className="animate-spin" />}
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Floating New Order button – bottom right */}
      <Link
        to="/admin/create-order"
        className="fixed bottom-20 right-5 md:bottom-5 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition hover:opacity-90"
        title="New order"
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
