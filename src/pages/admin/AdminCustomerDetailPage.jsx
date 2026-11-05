import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  IndianRupee,
  Package,
  TrendingUp,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Shirt,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { saveContact } from "../../utils/contact";
import { useAdminData } from "../../contexts/AdminDataContext";
import { getCustomerStats, ORDER_STATUSES } from "../../utils/customerStats";
import { getOrderDate } from "../../utils/date";
import { formatCurrency } from "../../utils/format";
import StatCard from "../../components/admin/StatCard";
import OrderDetailsModal from "../../components/OrderDetailsModal";

const PAGE_SIZE = 20;
// Verified/Walk-in badges hidden for now (matches the Customers list).
const SHOW_STATUS = false;

const STATUS_STYLES = {
  Pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Pending Pickup": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "In Progress": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

const CARD =
  "rounded-3xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-lg";

const fmtDate = (d) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const daysAgo = (d) => {
  if (!d) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
};

const AdminCustomerDetailPage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { orders, ordersLoading, customers, customersLoading } = useAdminData();
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const stats = useMemo(() => getCustomerStats(orders, uid), [orders, uid]);
  const customer = useMemo(() => (customers || []).find((c) => c.uid === uid) || null, [customers, uid]);

  useEffect(() => setPage(1), [uid]);

  const loading = ordersLoading || customersLoading;
  // Fall back to the name/mobile stored on orders (e.g. deleted profile).
  const name = customer?.name || stats.orders[0]?.userName || "Unknown customer";
  const mobile = customer?.mobile || stats.orders[0]?.userMobile || "";

  const handleSaveContact = async () => {
    const ok = await saveContact({ ...customer, name, mobile });
    if (!ok) toast.error("Invalid mobile number.");
  };

  const totalPages = Math.max(1, Math.ceil(stats.orders.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedOrders = stats.orders.slice(pageStart, pageStart + PAGE_SIZE);

  const notFound = !loading && !customer && stats.orderCount === 0;

  return (
    <div className="w-full transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-4 lg:gap-6">
        {/* Header */}
        <header className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/admin/customers"))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          {!notFound && (
            <>
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                {getInitials(name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
                    {loading ? "Loading…" : name}
                  </h1>
                  {SHOW_STATUS && customer?.isWalkIn && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0 font-medium">
                      Walk-in
                    </span>
                  )}
                  {SHOW_STATUS && customer && !customer.isWalkIn && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                        customer.verified === true
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      }`}
                    >
                      {customer.verified === true ? "Verified" : "Pending"}
                    </span>
                  )}
                </div>
                {mobile && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{mobile}</p>}
              </div>
              {mobile && (
                <a
                  href={`tel:${String(mobile).replace(/\D/g, "")}`}
                  aria-label={`Call ${name}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition shrink-0"
                >
                  <Phone size={14} /> <span className="hidden sm:inline">Call</span>
                </a>
              )}
              {mobile && (
                <button
                  type="button"
                  onClick={handleSaveContact}
                  aria-label={`Save ${name} to contacts`}
                  title="Save to contacts"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition shrink-0"
                >
                  <UserPlus size={14} /> <span className="hidden sm:inline">Save</span>
                </button>
              )}
            </>
          )}
        </header>

        {notFound ? (
          <section className={`${CARD} px-6 py-12 flex flex-col items-center text-center gap-3`}>
            <UserX size={28} className="text-gray-400" />
            <p className="font-heading font-semibold text-gray-900 dark:text-gray-100">Customer not found</p>
            <button
              type="button"
              onClick={() => navigate("/admin/customers")}
              className="mt-1 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
            >
              Back to customers
            </button>
          </section>
        ) : (
          <>
            {/* Stat tiles */}
            <section className="shrink-0 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <StatCard
                loading={loading}
                icon={IndianRupee}
                iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                iconClass="text-indigo-600 dark:text-indigo-400"
                label="Total spend"
                value={formatCurrency(stats.totalSpend)}
              />
              <StatCard
                loading={loading}
                icon={Package}
                iconBg="bg-sky-100 dark:bg-sky-900/40"
                iconClass="text-sky-600 dark:text-sky-400"
                label="Total orders"
                value={stats.orderCount}
              />
              <StatCard
                loading={loading}
                icon={TrendingUp}
                iconBg="bg-violet-100 dark:bg-violet-900/40"
                iconClass="text-violet-600 dark:text-violet-400"
                label="Avg order"
                value={formatCurrency(stats.avgOrder)}
              />
              <StatCard
                loading={loading}
                icon={CalendarDays}
                iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                iconClass="text-emerald-600 dark:text-emerald-400"
                label={`This month · ${stats.thisMonthOrders} orders`}
                value={formatCurrency(stats.thisMonthSpend)}
              />
              <StatCard
                loading={loading}
                icon={CalendarCheck}
                iconBg="bg-amber-100 dark:bg-amber-900/40"
                iconClass="text-amber-600 dark:text-amber-400"
                label="Customer since"
                value={<span className="text-lg">{fmtDate(stats.firstOrderAt)}</span>}
              />
              <StatCard
                loading={loading}
                icon={CalendarClock}
                iconBg="bg-rose-100 dark:bg-rose-900/40"
                iconClass="text-rose-600 dark:text-rose-400"
                label={`Last order${stats.lastOrderAt ? ` · ${daysAgo(stats.lastOrderAt)}` : ""}`}
                value={<span className="text-lg">{fmtDate(stats.lastOrderAt)}</span>}
              />
            </section>

            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Status + top items */}
                <div className="flex flex-col gap-4 lg:gap-6">
                  <section className={`${CARD} px-5 py-4`}>
                    <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      Order status
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {ORDER_STATUSES.map((s) => (
                        <span key={s} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${STATUS_STYLES[s]}`}>
                          {s} · {stats.statusCounts[s] || 0}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className={`${CARD} px-5 py-4`}>
                    <div className="flex items-baseline justify-between mb-3">
                      <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100">Top items</h2>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{stats.itemCount} pcs total</span>
                    </div>
                    {stats.topItems.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No items yet.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {stats.topItems.map((it) => (
                          <li key={`${it.item}|${it.service}`} className="flex items-center gap-3 text-sm">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Shirt size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{it.item}</p>
                              {it.service && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{it.service}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">×{it.quantity}</p>
                              <p className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{formatCurrency(it.spend)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>

                {/* Order history */}
                <section className={`${CARD} lg:col-span-2 overflow-hidden flex flex-col`}>
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80 flex items-center justify-between gap-3 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30">
                    <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100">Order history</h2>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stats.orderCount} orders</p>
                  </div>
                  {pagedOrders.length === 0 ? (
                    <p className="py-10 px-5 text-center text-sm text-gray-500 dark:text-gray-400">
                      This customer hasn&apos;t placed any orders yet.
                    </p>
                  ) : (
                    <ul>
                      {pagedOrders.map((o) => {
                        const qty = (o.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                        return (
                          <li key={o.id} className="border-b border-gray-50 dark:border-gray-800 dark:border-opacity-50 last:border-0">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40 transition"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                  Order #{o.orderNumber ?? o.id.slice(0, 6)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {fmtDate(getOrderDate(o))} · {qty} pcs
                                </p>
                              </div>
                              <span
                                className={`hidden sm:inline px-2 py-1 rounded-lg text-[11px] font-semibold shrink-0 ${
                                  STATUS_STYLES[o.status] || STATUS_STYLES.Pending
                                }`}
                              >
                                {o.status || "Pending"}
                              </span>
                              <span className="font-heading font-semibold tabular-nums text-indigo-600 dark:text-indigo-400 shrink-0">
                                {formatCurrency(o.totalAmount)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 dark:border-opacity-80 flex items-center justify-between gap-3 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={16} /> Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onEdit />
      )}
    </div>
  );
};

export default AdminCustomerDetailPage;
