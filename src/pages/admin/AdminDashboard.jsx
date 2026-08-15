import { useEffect, useState, useMemo } from "react";
import { Package, Clock, Users, Calendar } from "lucide-react";
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

  return (
    <div className="w-full transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-4 lg:gap-6">
        {/* Header */}
        <header className="shrink-0">
          <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Dashboard
          </h1>
        </header>

        {/* Hero carousel - auto-rotating images */}
        <div className="w-full shrink-0 h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden rounded-3xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 bg-gray-200 dark:bg-gray-700 relative shadow-lg">
          <div className="relative w-full h-full rounded-3xl">
            {HERO_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 rounded-3xl transition-opacity duration-700 ease-in-out ${
                  i === carouselIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                aria-hidden={i !== carouselIndex}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="block w-full h-full object-cover rounded-3xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
            <div className="absolute inset-0 rounded-3xl bg-gray-900 bg-opacity-40 dark:bg-opacity-60 pointer-events-none z-20" />
            {/* Carousel dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCarouselIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === carouselIndex
                      ? "bg-white scale-125"
                      : "bg-white bg-opacity-60 hover:bg-opacity-80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Period + primary metric */}
        <section className="shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide">
              Overview
            </p>
            <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    period === key
                      ? "bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                      : "bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 border-opacity-80 dark:border-gray-600 dark:border-opacity-80"
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
                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                  />
                ) : (
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
                )
              )}
            </div>
          </div>

          {/* Overview card: Revenue, Orders, Pending, Total Customers */}
          <div className="relative rounded-3xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 overflow-hidden bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter shadow-lg">
            <div className="px-5 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-200 border-opacity-60 dark:border-gray-700 dark:border-opacity-80">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                Revenue · {periodLabel}
              </p>
              <span className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                ₹{revenue.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
              <div className="flex items-center gap-3 px-5 sm:px-6 lg:px-8 py-3.5 border-r border-gray-200 border-opacity-60 dark:border-gray-700 dark:border-opacity-80 border-t border-gray-200 border-opacity-60 dark:border-gray-700 dark:border-opacity-80">
                <Package size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Orders
                  </p>
                  <p className="font-heading text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{total}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 sm:px-6 lg:px-8 py-3.5 border-r border-gray-200 border-opacity-60 dark:border-gray-700 dark:border-opacity-80 sm:border-r border-t border-gray-200 border-opacity-60 dark:border-gray-700 dark:border-opacity-80">
                <Clock size={20} className="text-amber-500 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="font-heading text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{pending}</p>
                </div>
              </div>
              {customerCount != null && (
                <div className="flex items-center gap-3 px-5 sm:px-6 lg:px-8 py-3.5 border-t border-gray-200 border-opacity-60 dark:border-gray-700 dark:border-opacity-80 sm:col-span-1 col-span-2 sm:border-l-0">
                  <Users size={20} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Customers
                    </p>
                    <p className="font-heading text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{customerCount}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Last 6 months / Last 6 days – table with switch */}
        <section className="rounded-3xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-lg overflow-hidden min-h-0 flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80 flex flex-wrap items-center justify-between gap-3 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100">
                {revenueRange === "6months" ? "Last 6 months" : "Last 6 days"}
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 bg-opacity-80 dark:bg-gray-700 dark:bg-opacity-80 p-1">
              <button
                type="button"
                onClick={() => setRevenueRange("6days")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  revenueRange === "6days"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Last 6 days
              </button>
              <button
                type="button"
                onClick={() => setRevenueRange("6months")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  revenueRange === "6months"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Last 6 months
              </button>
            </div>
          </div>
          <div className="overflow-x-auto min-h-0 flex-1">
            <table className="w-full text-sm min-w-[280px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80">
                  <th className="text-left py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">
                    {revenueRange === "6months" ? "Month" : "Day"}
                  </th>
                  <th className="text-right py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Revenue</th>
                  <th className="text-right py-2 px-5 font-semibold text-gray-500 dark:text-gray-400">Orders</th>
                </tr>
              </thead>
              <tbody>
                {(revenueRange === "6months" ? last6MonthsData : last6DaysData).map((row) => (
                  <tr key={row.key} className="border-b border-gray-50 dark:border-gray-800 dark:border-opacity-50 last:border-0">
                    <td className="py-2 px-5 font-medium text-gray-800 dark:text-gray-200">
                      {revenueRange === "6months" ? row.label : row.label}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-gray-800 dark:text-gray-200">
                      ₹{row.revenue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-gray-600 dark:text-gray-300">{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-40 border-t border-gray-100 dark:border-gray-800 dark:border-opacity-80 shrink-0">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total · ₹{(revenueRange === "6months" ? sixMonthTotal : sixDayTotal).toLocaleString("en-IN")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
