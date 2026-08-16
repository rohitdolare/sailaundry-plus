import { useEffect, useMemo, useState } from "react";
import { Trophy, Package, IndianRupee, Medal, ChevronLeft, ChevronRight } from "lucide-react";
import { subscribeToAllOrders } from "../../services/firestore/orderService";
import { getAllCustomers } from "../../services/firestore/userService";

const getOrderDate = (order) => {
  const t = order?.createdAt;
  if (!t) return null;
  return t?.toDate ? t.toDate() : new Date(t);
};

const isSameMonth = (d1, d2) =>
  d1 &&
  d2 &&
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth();

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const RANGE = { THIS_MONTH: "this_month", MONTH: "month", OVERALL: "overall" };
const METRIC = { ORDERS: "orders", SPEND: "spend" };

const RANK_STYLES = [
  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:bg-opacity-40 dark:text-amber-400",
  "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:bg-opacity-40 dark:text-orange-400",
];

const PAGE_SIZE = 20;

const AdminLeaderboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [range, setRange] = useState(RANGE.OVERALL);
  const [metric, setMetric] = useState(METRIC.ORDERS);
  const [chosenMonth, setChosenMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(setOrders);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getAllCustomers().then((c) => setCustomers(Array.isArray(c) ? c : []));
  }, []);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - i);
  }, []);

  const targetMonthStart = useMemo(() => {
    if (range === RANGE.THIS_MONTH) {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    if (range === RANGE.MONTH && chosenMonth) {
      const [y, m] = chosenMonth.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return null;
  }, [range, chosenMonth]);

  const filteredOrders = useMemo(() => {
    if (!targetMonthStart) return orders;
    return orders.filter((o) => isSameMonth(getOrderDate(o), targetMonthStart));
  }, [orders, targetMonthStart]);

  const customerByUid = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.uid] = c;
    });
    return map;
  }, [customers]);

  const leaderboard = useMemo(() => {
    const byUid = {};
    filteredOrders.forEach((o) => {
      if (!o.uid) return;
      if (!byUid[o.uid]) byUid[o.uid] = { uid: o.uid, orders: 0, spend: 0, name: o.userName };
      byUid[o.uid].orders += 1;
      byUid[o.uid].spend += o.totalAmount || 0;
    });

    return Object.values(byUid)
      .map((row) => ({
        ...row,
        name: customerByUid[row.uid]?.name || row.name || "Unknown",
        mobile: customerByUid[row.uid]?.mobile || "",
      }))
      .sort((a, b) => (metric === METRIC.SPEND ? b.spend - a.spend : b.orders - a.orders));
  }, [filteredOrders, customerByUid, metric]);

  useEffect(() => {
    setPage(1);
  }, [range, metric, chosenMonth]);

  const totalPages = Math.max(1, Math.ceil(leaderboard.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedRows = leaderboard.slice(pageStart, pageStart + PAGE_SIZE);

  const rangeLabel =
    range === RANGE.OVERALL
      ? "All time"
      : range === RANGE.THIS_MONTH
      ? "This month"
      : targetMonthStart
      ? `${MONTH_NAMES[targetMonthStart.getMonth()]} ${targetMonthStart.getFullYear()}`
      : "—";

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="w-full transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-4 lg:gap-6">
        <header className="shrink-0 flex items-center gap-2">
          <Trophy size={22} className="text-amber-500 dark:text-amber-400" />
          <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Leaderboard
          </h1>
        </header>

        {/* Controls */}
        <section className="shrink-0 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: RANGE.OVERALL, label: "Overall" },
              { key: RANGE.THIS_MONTH, label: "This month" },
              { key: RANGE.MONTH, label: "Month" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  range === key
                    ? "bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    : "bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 border-opacity-80 dark:border-gray-600 dark:border-opacity-80"
                }`}
              >
                {label}
              </button>
            ))}
            {range === RANGE.MONTH && (
              <span className="flex gap-1.5">
                <select
                  value={chosenMonth ? chosenMonth.slice(5, 7) : "01"}
                  onChange={(e) => setChosenMonth(`${chosenMonth.slice(0, 4)}-${e.target.value.padStart(2, "0")}`)}
                  className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                  ))}
                </select>
                <select
                  value={chosenMonth ? chosenMonth.slice(0, 4) : new Date().getFullYear()}
                  onChange={(e) => setChosenMonth(`${e.target.value}-${(chosenMonth || "").slice(5, 7) || "01"}`)}
                  className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </span>
            )}
          </div>
        </section>

        {/* Top 3 podium cards */}
        {top3.length > 0 && (
          <section className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((row, i) => (
              <div
                key={row.uid}
                className="relative rounded-3xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter shadow-lg px-5 py-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${RANK_STYLES[i]}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-gray-900 dark:text-gray-100 truncate">{row.name}</p>
                    {row.mobile && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.mobile}</p>
                    )}
                  </div>
                  {i === 0 && <Medal size={20} className="text-amber-500 dark:text-amber-400 ml-auto shrink-0" />}
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Package size={14} /> {row.orders} orders
                  </span>
                  <span className="flex items-center gap-1 font-heading font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    <IndianRupee size={14} /> {row.spend.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Full ranked table */}
        <section className="rounded-3xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-lg overflow-hidden min-h-0 flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80 flex flex-wrap items-center justify-between gap-3 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
                Rankings · {rangeLabel}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{leaderboard.length} customers</p>
            </div>

            <div className="flex items-center gap-1 rounded-full p-1 bg-gradient-to-r from-indigo-500 from-opacity-10 to-violet-500 to-opacity-10 dark:from-indigo-400 dark:from-opacity-10 dark:to-violet-400 dark:to-opacity-10 border border-indigo-100 dark:border-indigo-900 dark:border-opacity-60 shrink-0">
              <span className="pl-2 pr-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-400 dark:text-indigo-500 hidden sm:inline">
                Sort
              </span>
              {[
                { key: METRIC.ORDERS, label: "Orders", icon: Package },
                { key: METRIC.SPEND, label: "Spend", icon: IndianRupee },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMetric(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    metric === key
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                      : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:bg-opacity-10"
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto min-h-0 flex-1">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80">
                  <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">#</th>
                  <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-right py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Orders</th>
                  <th className="text-right py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Spend</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-5 text-center text-gray-500 dark:text-gray-400">
                      No orders in this period.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row, i) => (
                    <tr key={row.uid} className="border-b border-gray-50 dark:border-gray-800 dark:border-opacity-50 last:border-0">
                      <td className="py-2 px-5 font-medium text-gray-500 dark:text-gray-400 tabular-nums">{pageStart + i + 1}</td>
                      <td className="py-2 px-5">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{row.name}</p>
                        {row.mobile && <p className="text-xs text-gray-500 dark:text-gray-400">{row.mobile}</p>}
                      </td>
                      <td className="py-2 px-5 text-right tabular-nums text-gray-800 dark:text-gray-200">{row.orders}</td>
                      <td className="py-2 px-5 text-right tabular-nums font-medium text-indigo-600 dark:text-indigo-400">
                        ₹{row.spend.toLocaleString("en-IN")}
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
      </div>
    </div>
  );
};

export default AdminLeaderboardPage;
