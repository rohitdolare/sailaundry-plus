import { useEffect, useState, useMemo } from "react";
import {
  Package,
  Clock,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { subscribeToAllOrders } from "../../services/firestore/orderService";
import { getAllUsers } from "../../services/firestore/userService";

const getOrderDate = (order) => {
  const t = order?.createdAt;
  if (!t) return null;
  return t?.toDate ? t.toDate() : new Date(t);
};

const isSameDay = (d1, d2) =>
  d1 &&
  d2 &&
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isSameMonth = (d1, d2) =>
  d1 &&
  d2 &&
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth();

const getMonthKey = (date) =>
  date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "";

const getDayKey = (date) =>
  date ? date.toISOString().slice(0, 10) : "";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PERIOD = { TODAY: "today", DAY: "day", THIS_MONTH: "this_month", MONTH: "month" };

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [customerCount, setCustomerCount] = useState(null);
  const [period, setPeriod] = useState(PERIOD.TODAY);
  const [chosenDate, setChosenDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [chosenMonth, setChosenMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [revenueRange, setRevenueRange] = useState("6months"); // "6months" | "6days"

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(setOrders);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getAllUsers().then((users) => {
      const customersOnly = Array.isArray(users) ? users.filter((u) => u.role !== "admin") : [];
      setCustomerCount(customersOnly.length);
    });
  }, []);

  const targetDay = useMemo(() => {
    if (period === PERIOD.TODAY) return new Date();
    if (period === PERIOD.DAY && chosenDate) return new Date(chosenDate);
    return null;
  }, [period, chosenDate]);

  const targetMonthStart = useMemo(() => {
    if (period === PERIOD.THIS_MONTH) {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    if (period === PERIOD.MONTH && chosenMonth) {
      const [y, m] = chosenMonth.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return null;
  }, [period, chosenMonth]);

  const { revenue, total, pending, periodLabel, prevRevenue, prevTotal } = useMemo(() => {
    if (targetDay) {
      const dayOrders = orders.filter((o) => isSameDay(getOrderDate(o), targetDay));
      const revenue = dayOrders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const total = dayOrders.length;
      const pending = dayOrders.filter((o) => o.status !== "Completed").length;
      const prevDay = new Date(targetDay);
      prevDay.setDate(prevDay.getDate() - 1);
      const prevDayOrders = orders.filter((o) => isSameDay(getOrderDate(o), prevDay));
      const prevRevenue = prevDayOrders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const prevTotal = prevDayOrders.length;
      const label =
        period === PERIOD.TODAY
          ? "Today"
          : targetDay.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      return { revenue, total, pending, periodLabel: label, prevRevenue, prevTotal };
    }
    if (targetMonthStart) {
      const monthOrders = orders.filter((o) => isSameMonth(getOrderDate(o), targetMonthStart));
      const revenue = monthOrders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const total = monthOrders.length;
      const pending = monthOrders.filter((o) => o.status !== "Completed").length;
      const prevMonthStart = new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth() - 1, 1);
      const prevMonthOrders = orders.filter((o) => isSameMonth(getOrderDate(o), prevMonthStart));
      const prevRevenue = prevMonthOrders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const prevTotal = prevMonthOrders.length;
      const label = `${MONTH_NAMES[targetMonthStart.getMonth()]} ${targetMonthStart.getFullYear()}`;
      return { revenue, total, pending, periodLabel: label, prevRevenue, prevTotal };
    }
    return { revenue: 0, total: 0, pending: 0, periodLabel: "—", prevRevenue: 0, prevTotal: 0 };
  }, [orders, targetDay, targetMonthStart, period]);

  const last6MonthsData = useMemo(() => {
    const now = new Date();
    const byMonth = {};
    orders.forEach((o) => {
      const d = getOrderDate(o);
      if (!d) return;
      const key = getMonthKey(d);
      if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0 };
      byMonth[key].orders += 1;
      if (o.status === "Completed") byMonth[key].revenue += o.totalAmount || 0;
    });
    const result = [];
    for (let i = 0; i <= 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d);
      const data = byMonth[key] || { revenue: 0, orders: 0 };
      result.push({
        key,
        label: MONTH_NAMES[d.getMonth()],
        ...data,
      });
    }
    return result;
  }, [orders]);

  const last6DaysData = useMemo(() => {
    const now = new Date();
    const byDay = {};
    orders.forEach((o) => {
      const d = getOrderDate(o);
      if (!d) return;
      const key = getDayKey(d);
      if (!byDay[key]) byDay[key] = { revenue: 0, orders: 0 };
      byDay[key].orders += 1;
      if (o.status === "Completed") byDay[key].revenue += o.totalAmount || 0;
    });
    const result = [];
    for (let i = 0; i <= 5; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = getDayKey(d);
      const data = byDay[key] || { revenue: 0, orders: 0 };
      const dayName = DAY_NAMES[d.getDay()];
      const dateStr = d.getDate();
      const monthStr = MONTH_NAMES[d.getMonth()];
      result.push({
        key,
        label: `${dayName} ${dateStr} ${monthStr}`,
        shortLabel: `${dayName} ${dateStr}`,
        ...data,
      });
    }
    return result;
  }, [orders]);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - i);
  }, []);

  const revenueTrend = prevRevenue != null && prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null;
  const ordersTrend = prevTotal != null && prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null;
  const sixMonthTotal = useMemo(
    () => last6MonthsData.reduce((s, r) => s + r.revenue, 0),
    [last6MonthsData]
  );
  const sixDayTotal = useMemo(
    () => last6DaysData.reduce((s, r) => s + r.revenue, 0),
    [last6DaysData]
  );

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb] dark:bg-[#0f1114] transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-4 lg:gap-6">
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight shrink-0">
          Dashboard
        </h1>

        {/* Period + primary metric */}
        <section className="shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              Overview
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: PERIOD.TODAY, label: "Today" },
                { key: PERIOD.DAY, label: "Date" },
                { key: PERIOD.THIS_MONTH, label: "This month" },
                { key: PERIOD.MONTH, label: "Custom" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    period === key
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-600/50 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-600/80"
                  }`}
                >
                  {label}
                </button>
              ))}
              {(period === PERIOD.DAY || period === PERIOD.MONTH) && (
                period === PERIOD.DAY ? (
                  <input
                    type="date"
                    value={chosenDate}
                    onChange={(e) => setChosenDate(e.target.value)}
                    className="rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200"
                  />
                ) : (
                  <span className="flex gap-1.5">
                    <select
                      value={chosenMonth ? chosenMonth.slice(5, 7) : "01"}
                      onChange={(e) => setChosenMonth(`${chosenMonth.slice(0, 4)}-${e.target.value.padStart(2, "0")}`)}
                      className="rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
                    >
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={chosenMonth ? chosenMonth.slice(0, 4) : new Date().getFullYear()}
                      onChange={(e) => setChosenMonth(`${e.target.value}-${(chosenMonth || "").slice(5, 7) || "01"}`)}
                      className="rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
            <div className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                Revenue · {periodLabel}
              </p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums text-slate-900 dark:text-white">
                  ₹{revenue.toLocaleString("en-IN")}
                </span>
                {revenueTrend != null && (
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      revenueTrend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {revenueTrend >= 0 ? <ArrowUp size={18} className="text-emerald-600 dark:text-emerald-400" /> : <ArrowDown size={18} className="text-red-600 dark:text-red-400" />}
                    {revenueTrend >= 0 ? "+" : ""}{revenueTrend.toFixed(1)}% vs previous
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Supporting stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 shrink-0">
          <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-sm border-t-[3px] border-t-indigo-400/60 dark:border-t-indigo-500/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Orders
              </span>
              <Package size={18} className="text-indigo-400/80 dark:text-indigo-400/70" />
            </div>
            <p className="mt-1.5 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{total}</p>
            {ordersTrend != null && (
              <p className={`mt-0.5 text-xs font-medium ${ordersTrend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {ordersTrend >= 0 ? "+" : ""}{ordersTrend.toFixed(0)}%
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-sm border-t-[3px] border-t-amber-400/60 dark:border-t-amber-500/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pending
              </span>
              <Clock size={18} className="text-amber-500/80" />
            </div>
            <p className="mt-1.5 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{pending}</p>
          </div>
          {customerCount != null && (
            <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-sm border-t-[3px] border-t-emerald-400/60 dark:border-t-emerald-500/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Customers
                </span>
                <Users size={18} className="text-emerald-500/80 dark:text-emerald-400/70" />
              </div>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{customerCount}</p>
            </div>
          )}
          {/* Spacer when 3 cards so layout doesn't break */}
          {customerCount == null && <div className="hidden lg:block" />}
        </section>

        {/* Last 6 months / Last 6 days – table with switch */}
        <section className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden min-h-0 flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500/80 dark:text-indigo-400/70" />
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                {revenueRange === "6months" ? "Last 6 months" : "Last 6 days"}
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-200/80 dark:bg-slate-700/80 p-1">
              <button
                type="button"
                onClick={() => setRevenueRange("6days")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  revenueRange === "6days"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Last 6 days
              </button>
              <button
                type="button"
                onClick={() => setRevenueRange("6months")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  revenueRange === "6months"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Last 6 months
              </button>
            </div>
          </div>
          <div className="overflow-x-auto min-h-0 flex-1">
            <table className="w-full text-sm min-w-[280px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/80">
                  <th className="text-left py-2 px-5 font-semibold text-slate-500 dark:text-slate-400">
                    {revenueRange === "6months" ? "Month" : "Day"}
                  </th>
                  <th className="text-right py-2 px-5 font-semibold text-slate-500 dark:text-slate-400">Revenue</th>
                  <th className="text-right py-2 px-5 font-semibold text-slate-500 dark:text-slate-400">Orders</th>
                </tr>
              </thead>
              <tbody>
                {(revenueRange === "6months" ? last6MonthsData : last6DaysData).map((row) => (
                  <tr key={row.key} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                    <td className="py-2 px-5 font-medium text-slate-800 dark:text-slate-200">
                      {revenueRange === "6months" ? row.label : row.label}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-slate-800 dark:text-slate-200">
                      ₹{row.revenue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-slate-600 dark:text-slate-300">{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/80 shrink-0">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Total · ₹{(revenueRange === "6months" ? sixMonthTotal : sixDayTotal).toLocaleString("en-IN")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
