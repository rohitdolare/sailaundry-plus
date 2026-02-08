import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  TrendingUp,
  IndianRupee,
  Calendar,
  CalendarDays,
} from "lucide-react";
import { subscribeToAllOrders } from "../../services/firestore/orderService";

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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PERIOD = { TODAY: "today", DAY: "day", THIS_MONTH: "this_month", MONTH: "month" };

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState(PERIOD.TODAY);
  const [chosenDate, setChosenDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [chosenMonth, setChosenMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(setOrders);
    return () => unsubscribe();
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

  const { revenue, total, pending, periodLabel } = useMemo(() => {
    if (targetDay) {
      const dayOrders = orders.filter((o) => isSameDay(getOrderDate(o), targetDay));
      const revenue = dayOrders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const total = dayOrders.length;
      const pending = dayOrders.filter((o) => o.status !== "Completed").length;
      const label =
        period === PERIOD.TODAY
          ? "Today"
          : targetDay.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      return { revenue, total, pending, periodLabel: label };
    }
    if (targetMonthStart) {
      const monthOrders = orders.filter((o) => isSameMonth(getOrderDate(o), targetMonthStart));
      const revenue = monthOrders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const total = monthOrders.length;
      const pending = monthOrders.filter((o) => o.status !== "Completed").length;
      const label = `${MONTH_NAMES[targetMonthStart.getMonth()]} ${targetMonthStart.getFullYear()}`;
      return { revenue, total, pending, periodLabel: label };
    }
    return { revenue: 0, total: 0, pending: 0, periodLabel: "—" };
  }, [orders, targetDay, targetMonthStart, period]);

  const last6Months = useMemo(() => {
    const byMonth = {};
    orders.forEach((o) => {
      const d = getOrderDate(o);
      if (!d) return;
      const key = getMonthKey(d);
      if (!byMonth[key]) byMonth[key] = { revenue: 0, orders: 0 };
      byMonth[key].orders += 1;
      if (o.status === "Completed") byMonth[key].revenue += o.totalAmount || 0;
    });
    return Object.entries(byMonth)
      .map(([key, data]) => {
        const [y, m] = key.split("-").map(Number);
        return { key, label: `${MONTH_NAMES[m - 1]} ${y}`, ...data };
      })
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 6);
  }, [orders]);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - i);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#e5e7eb] dark:bg-slate-900 transition-colors">
      <div className="px-3 py-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-[#111827] dark:text-white">
            Dashboard
          </h1>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] dark:text-indigo-400"
          >
            <TrendingUp size={14} /> Orders
          </Link>
        </div>

        {/* Period pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: PERIOD.TODAY, label: "Today", icon: CalendarDays },
            { key: PERIOD.DAY, label: "Day", icon: Calendar },
            { key: PERIOD.THIS_MONTH, label: "This month", icon: null },
            { key: PERIOD.MONTH, label: "Month", icon: null },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border-2 transition ${
                period === key
                  ? "bg-[#eff6ff] dark:bg-indigo-900/40 border-[#2563eb] dark:border-indigo-500 text-[#1d4ed8] dark:text-indigo-200"
                  : "bg-white dark:bg-slate-800 border-[#9ca3af] dark:border-slate-600 text-[#374151] dark:text-slate-200 hover:border-[#6b7280] dark:hover:border-slate-500"
              }`}
            >
              {Icon && <Icon size={12} />}
              {label}
            </button>
          ))}
        </div>

        {period === PERIOD.DAY && (
          <div className="mb-4">
            <input
              type="date"
              value={chosenDate}
              onChange={(e) => setChosenDate(e.target.value)}
              className="w-full rounded-lg border-2 border-[#9ca3af] bg-white dark:bg-slate-800 dark:border-slate-600 px-3 py-2 text-sm text-[#111827] dark:text-white"
            />
          </div>
        )}

        {period === PERIOD.MONTH && (
          <div className="flex gap-2 mb-4">
            <select
              value={chosenMonth ? chosenMonth.slice(5, 7) : "01"}
              onChange={(e) => setChosenMonth(`${chosenMonth.slice(0, 4)}-${e.target.value.padStart(2, "0")}`)}
              className="flex-1 rounded-lg border-2 border-[#9ca3af] bg-white dark:bg-slate-800 dark:border-slate-600 px-3 py-2 text-sm text-[#111827] dark:text-white"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={chosenMonth ? chosenMonth.slice(0, 4) : new Date().getFullYear()}
              onChange={(e) => setChosenMonth(`${e.target.value}-${(chosenMonth || "").slice(5, 7) || "01"}`)}
              className="flex-1 rounded-lg border-2 border-[#9ca3af] bg-white dark:bg-slate-800 dark:border-slate-600 px-3 py-2 text-sm text-[#111827] dark:text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        <p className="text-xs font-medium text-[#4b5563] dark:text-slate-400 mb-3">
          {periodLabel}
        </p>

        {/* Stat cards – white with colored left border + dark text (high contrast light mode) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div
            className="bg-white dark:bg-slate-800 rounded-xl border-2 border-[#d1d5db] dark:border-slate-600 border-l-4 border-l-[#059669] dark:border-l-emerald-500 p-4 shadow-md"
            title="Revenue (completed)"
          >
            <IndianRupee size={20} className="text-[#059669] dark:text-emerald-400 mb-1" />
            <p className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white truncate">
              ₹{revenue}
            </p>
          </div>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl border-2 border-[#d1d5db] dark:border-slate-600 border-l-4 border-l-[#2563eb] dark:border-l-indigo-400 p-4 shadow-md"
            title="Orders"
          >
            <Package size={20} className="text-[#2563eb] dark:text-indigo-400 mb-1" />
            <p className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white">
              {total}
            </p>
          </div>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl border-2 border-[#d1d5db] dark:border-slate-600 border-l-4 border-l-[#d97706] dark:border-l-amber-400 p-4 shadow-md"
            title="Pending"
          >
            <Clock size={20} className="text-[#d97706] dark:text-amber-400 mb-1" />
            <p className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white">
              {pending}
            </p>
          </div>
        </div>

        {/* Last 6 months */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-[#d1d5db] dark:border-slate-600 shadow-md overflow-hidden">
          <div className="px-3 py-2.5 border-b-2 border-[#e5e7eb] dark:border-slate-700 flex items-center gap-2 bg-[#f3f4f6] dark:bg-slate-700/50">
            <Calendar size={14} className="text-[#2563eb] dark:text-indigo-400" />
            <span className="text-xs font-semibold text-[#111827] dark:text-white">
              Last 6 months
            </span>
          </div>
          <div className="divide-y divide-[#e5e7eb] dark:divide-slate-700">
            {last6Months.length === 0 ? (
              <p className="px-3 py-4 text-xs text-[#6b7280] dark:text-slate-400 text-center">
                No data
              </p>
            ) : (
              last6Months.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-[#f9fafb] dark:hover:bg-slate-700/30"
                >
                  <span className="text-sm font-medium text-[#111827] dark:text-white">
                    {row.label}
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-semibold text-[#111827] dark:text-white">
                      ₹{row.revenue}
                    </span>
                    <span className="text-[#6b7280] dark:text-slate-400">
                      {row.orders} orders
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
