import { useEffect, useState, useMemo } from "react";
import { Package, Clock, Users, Calendar, IndianRupee } from "lucide-react";
import { subscribeToAllOrders } from "../../services/firestore/orderService";
import { getAllCustomers } from "../../services/firestore/userService";
import StatCard from "../../components/admin/StatCard";
import { formatCurrency } from "../../utils/format";
import {
  getOrderDate,
  isSameDay,
  isSameMonth,
  getMonthKey,
  getDayKey,
  pctChange,
  MONTH_NAMES,
  DAY_NAMES,
} from "../../utils/date";

const PERIOD = { TODAY: "today", DAY: "day", THIS_MONTH: "this_month", MONTH: "month" };

const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1681264295070-dff4e16d53c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Laundry service" },
  { src: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&q=80", alt: "Laundry and cleaning" },
  { src: "https://images.unsplash.com/photo-1549037173-e3b717902c57?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGxhdW5kcnl8ZW58MHwwfDB8fHww", alt: "Fresh laundry" },
  { src: "https://plus.unsplash.com/premium_photo-1723874485367-6e8234ead9ff?q=80&w=1193&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Laundry and cleaning" },
];

const CAROUSEL_INTERVAL_MS = 4500;

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
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(setOrders);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getAllCustomers().then((customers) => {
      setCustomerCount(Array.isArray(customers) ? customers.length : 0);
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

  const sixMonthTotal = useMemo(
    () => last6MonthsData.reduce((s, r) => s + r.revenue, 0),
    [last6MonthsData]
  );
  const sixDayTotal = useMemo(
    () => last6DaysData.reduce((s, r) => s + r.revenue, 0),
    [last6DaysData]
  );

  const trend = useMemo(() => {
    if (period === PERIOD.TODAY && last6DaysData[0] && last6DaysData[1]) {
      return {
        revenue: pctChange(last6DaysData[0].revenue, last6DaysData[1].revenue),
        orders: pctChange(last6DaysData[0].orders, last6DaysData[1].orders),
        label: "vs yesterday",
      };
    }
    if (period === PERIOD.THIS_MONTH && last6MonthsData[0] && last6MonthsData[1]) {
      return {
        revenue: pctChange(last6MonthsData[0].revenue, last6MonthsData[1].revenue),
        orders: pctChange(last6MonthsData[0].orders, last6MonthsData[1].orders),
        label: "vs last month",
      };
    }
    return { revenue: null, orders: null, label: null };
  }, [period, last6DaysData, last6MonthsData]);

  const activeRangeData = revenueRange === "6months" ? last6MonthsData : last6DaysData;
  const activeRangeTotal = revenueRange === "6months" ? sixMonthTotal : sixDayTotal;
  const chartMax = Math.max(1, ...activeRangeData.map((r) => r.revenue));
  const chronological = [...activeRangeData].reverse();

  return (
    <div className="w-full transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-5 lg:gap-6">
        {/* Header */}
        <header className="shrink-0">
          <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        {/* Hero carousel - auto-rotating images */}
        <div className="w-full shrink-0 h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-200 dark:bg-gray-800 relative">
          <div className="relative w-full h-full">
            {HERO_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === carouselIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                aria-hidden={i !== carouselIndex}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="block w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-black/35 dark:bg-black/50 pointer-events-none z-20" />
            {/* Carousel dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCarouselIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === carouselIndex ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Period + stat cards */}
        <section className="shrink-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100">
              Overview
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1">
                {[
                  { key: PERIOD.TODAY, label: "Today" },
                  { key: PERIOD.DAY, label: "Day" },
                  { key: PERIOD.THIS_MONTH, label: "This month" },
                  { key: PERIOD.MONTH, label: "Month" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPeriod(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      period === key
                        ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(period === PERIOD.DAY || period === PERIOD.MONTH) && (
                period === PERIOD.DAY ? (
                  <input
                    type="date"
                    value={chosenDate}
                    onChange={(e) => setChosenDate(e.target.value)}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                  />
                ) : (
                  <span className="flex gap-1.5">
                    <select
                      value={chosenMonth ? chosenMonth.slice(5, 7) : "01"}
                      onChange={(e) => setChosenMonth(`${chosenMonth.slice(0, 4)}-${e.target.value.padStart(2, "0")}`)}
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                    >
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={chosenMonth ? chosenMonth.slice(0, 4) : new Date().getFullYear()}
                      onChange={(e) => setChosenMonth(`${e.target.value}-${(chosenMonth || "").slice(5, 7) || "01"}`)}
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
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

          {/* Stat cards: Revenue, Orders, Pending, Customers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={IndianRupee}
              iconBg="bg-indigo-100 dark:bg-indigo-900/40"
              iconClass="text-indigo-600 dark:text-indigo-400"
              label={`Revenue · ${periodLabel}`}
              value={formatCurrency(revenue)}
              trend={trend.revenue}
              trendLabel={trend.label}
              featured
            />
            <StatCard
              icon={Package}
              iconBg="bg-sky-100 dark:bg-sky-900/40"
              iconClass="text-sky-600 dark:text-sky-400"
              label="Orders"
              value={total}
              trend={trend.orders}
              trendLabel={trend.label}
            />
            <StatCard
              icon={Clock}
              iconBg="bg-amber-100 dark:bg-amber-900/40"
              iconClass="text-amber-600 dark:text-amber-400"
              label="Pending"
              value={pending}
            />
            {customerCount != null ? (
              <StatCard
                icon={Users}
                iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                iconClass="text-emerald-600 dark:text-emerald-400"
                label="Customers"
                value={customerCount}
              />
            ) : (
              <StatCard loading />
            )}
          </div>
        </section>

        {/* Revenue trend – chart + breakdown, with range switch */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden min-h-0 flex flex-col flex-1">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100">
                {revenueRange === "6months" ? "Last 6 months" : "Last 6 days"}
              </h2>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1">
              <button
                type="button"
                onClick={() => setRevenueRange("6days")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  revenueRange === "6days"
                    ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Last 6 days
              </button>
              <button
                type="button"
                onClick={() => setRevenueRange("6months")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  revenueRange === "6months"
                    ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Last 6 months
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 sm:gap-4 px-5 sm:px-6 pt-6 h-40 shrink-0">
            {chronological.map((row, i) => {
              const isCurrent = i === chronological.length - 1;
              const heightPct = row.revenue > 0 ? Math.max((row.revenue / chartMax) * 100, 4) : 2;
              return (
                <div key={row.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-colors duration-150 ${
                        isCurrent
                          ? "bg-indigo-600 dark:bg-indigo-500"
                          : "bg-indigo-200 dark:bg-indigo-900 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-800"
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${revenueRange === "6months" ? row.label : row.shortLabel} · ${formatCurrency(row.revenue)} · ${row.orders} orders`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium tabular-nums ${
                      isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {revenueRange === "6months" ? row.label : row.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Breakdown list */}
          <div className="overflow-x-auto min-h-0 flex-1 mt-2">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {activeRangeData.map((row) => (
                <div key={row.key} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{row.label}</span>
                  <span className="flex items-center gap-4 tabular-nums">
                    <span className="text-gray-400 dark:text-gray-500">{row.orders} orders</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 w-24 text-right">
                      {formatCurrency(row.revenue)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
              {formatCurrency(activeRangeTotal)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
