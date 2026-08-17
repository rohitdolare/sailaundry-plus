import { useMemo, useState } from "react";
import {
  BarChart3,
  Clock,
  IndianRupee,
  Package,
  Users,
  MapPin,
  Repeat,
  Activity,
  ShoppingBag,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAdminData } from "../../contexts/AdminDataContext";
import StatCard from "../../components/admin/StatCard";
import PeakHoursHeatmap from "../../components/admin/PeakHoursHeatmap";
import { getOrderDate, getDayKey, getMonthKey, MONTH_NAMES } from "../../utils/date";
import { formatCurrency } from "../../utils/format";

const RANGE_OPTIONS = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "12m", label: "12 months" },
];

const STATUS_ORDER = ["Pending", "Pending Pickup", "In Progress", "Completed"];
const STATUS_STYLES = {
  Pending: { bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400" },
  "Pending Pickup": { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  "In Progress": { bar: "bg-teal-600", text: "text-teal-700 dark:text-teal-400" },
  Completed: { bar: "bg-green-600", text: "text-green-600 dark:text-green-400" },
};

const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span>{p.name}:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            {formatter ? formatter(p.value, p.dataKey) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const RankedBarList = ({ data, valueKey, formatValue, color }) => {
  if (!data.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
        <XAxis
          type="number"
          tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={112}
          tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--chart-grid)", opacity: 0.35 }}
          content={<ChartTooltip formatter={(v) => formatValue(v)} />}
        />
        <Bar dataKey={valueKey} fill={color} radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const SegmentedToggle = ({ value, onChange, options }) => (
  <div className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1">
    {options.map((opt) => (
      <button
        key={opt.key}
        type="button"
        onClick={() => onChange(opt.key)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
          value === opt.key
            ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const SectionCard = ({ title, caption, icon: Icon, action, children }) => (
  <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
            {title}
          </h2>
          {caption && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{caption}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const AdminAnalyticsPage = () => {
  const { orders, customers } = useAdminData();
  const [range, setRange] = useState("30d");
  const [trendMetric, setTrendMetric] = useState("revenue");
  const [servicesMetric, setServicesMetric] = useState("qty");

  const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
  const granularity = range === "12m" ? "month" : "day";

  const rangeStart = useMemo(() => {
    const now = new Date();
    if (range === "12m") return new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (rangeDays - 1));
    return d;
  }, [range, rangeDays]);

  const rangeLabel = RANGE_OPTIONS.find((r) => r.key === range)?.label || "";

  const invalidDateCount = useMemo(
    () => orders.filter((o) => !isValidDate(getOrderDate(o))).length,
    [orders]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const d = getOrderDate(o);
        return isValidDate(d) && d >= rangeStart;
      }),
    [orders, rangeStart]
  );

  // Single pass over the range-filtered orders — every section below reshapes
  // a slice of this instead of re-looping the raw order list.
  const coreAgg = useMemo(() => {
    const byBucket = {};
    const itemAgg = {};
    const locationAgg = {};
    const statusCounts = {};
    let totalAmountSum = 0;

    filteredOrders.forEach((o) => {
      const d = getOrderDate(o);
      const key = granularity === "month" ? getMonthKey(d) : getDayKey(d);
      if (!byBucket[key]) byBucket[key] = { revenue: 0, orders: 0 };
      byBucket[key].orders += 1;
      if (o.status === "Completed") byBucket[key].revenue += o.totalAmount || 0;

      const status = o.status || "Pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      (o.items || []).forEach((it) => {
        const name = it.item || "Unknown";
        if (!itemAgg[name]) itemAgg[name] = { qty: 0, revenue: 0 };
        itemAgg[name].qty += it.quantity || 0;
        itemAgg[name].revenue += (it.price || 0) * (it.quantity || 0);
      });

      const loc = o.pickupLocation?.label || "Unspecified";
      if (!locationAgg[loc]) locationAgg[loc] = { count: 0, revenue: 0 };
      locationAgg[loc].count += 1;
      if (o.status === "Completed") locationAgg[loc].revenue += o.totalAmount || 0;

      totalAmountSum += o.totalAmount || 0;
    });

    return { byBucket, itemAgg, locationAgg, statusCounts, totalAmountSum };
  }, [filteredOrders, granularity]);

  const bucketDefs = useMemo(() => {
    const now = new Date();
    if (granularity === "month") {
      return Array.from({ length: 12 }, (_, idx) => {
        const i = 11 - idx;
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { key: getMonthKey(d), label: MONTH_NAMES[d.getMonth()] };
      });
    }
    return Array.from({ length: rangeDays }, (_, idx) => {
      const i = rangeDays - 1 - idx;
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      return { key: getDayKey(d), label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}` };
    });
  }, [granularity, rangeDays]);

  const tickInterval = Math.max(0, Math.ceil(bucketDefs.length / 8) - 1);

  const trendData = useMemo(
    () =>
      bucketDefs.map((b) => ({
        ...b,
        ...(coreAgg.byBucket[b.key] || { revenue: 0, orders: 0 }),
      })),
    [bucketDefs, coreAgg]
  );

  const aov = filteredOrders.length ? coreAgg.totalAmountSum / filteredOrders.length : 0;
  const completedRevenueInRange = trendData.reduce((s, r) => s + r.revenue, 0);

  // Peak hours use ALL-TIME orders, deliberately ignoring the range toggle —
  // "when do customers typically order" is a stable pattern, not a period one.
  const heatmapData = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    orders.forEach((o) => {
      const d = getOrderDate(o);
      if (!isValidDate(d)) return;
      grid[d.getDay()][d.getHours()] += 1;
    });
    return grid;
  }, [orders]);

  // New-vs-returning + repeat rate use full lifetime order history to decide
  // who's "new", regardless of range — only the per-bucket counts respect range.
  const customerInsights = useMemo(() => {
    const byUid = {};
    orders.forEach((o) => {
      if (!o.uid) return;
      const d = getOrderDate(o);
      if (!isValidDate(d)) return;
      (byUid[o.uid] ??= []).push({ date: d, id: o.id });
    });
    Object.values(byUid).forEach((arr) => arr.sort((a, b) => a.date - b.date));

    const firstOrderIdByUid = {};
    Object.entries(byUid).forEach(([uid, arr]) => {
      firstOrderIdByUid[uid] = arr[0]?.id;
    });

    const totalCustomers = Object.keys(byUid).length;
    const repeatCustomers = Object.values(byUid).filter((arr) => arr.length > 1).length;
    const repeatRate = totalCustomers ? (repeatCustomers / totalCustomers) * 100 : 0;

    const buckets = {};
    filteredOrders.forEach((o) => {
      if (!o.uid) return;
      const d = getOrderDate(o);
      if (!isValidDate(d)) return;
      const key = granularity === "month" ? getMonthKey(d) : getDayKey(d);
      if (!buckets[key]) buckets[key] = { new: 0, returning: 0 };
      if (firstOrderIdByUid[o.uid] === o.id) buckets[key].new += 1;
      else buckets[key].returning += 1;
    });

    return { repeatRate, totalCustomers, buckets };
  }, [orders, filteredOrders, granularity]);

  const newVsReturningData = useMemo(
    () =>
      bucketDefs.map((b) => ({
        ...b,
        ...(customerInsights.buckets[b.key] || { new: 0, returning: 0 }),
      })),
    [bucketDefs, customerInsights]
  );

  const newCustomersInRange = newVsReturningData.reduce((s, r) => s + r.new, 0);

  const topServices = useMemo(() => {
    const entries = Object.entries(coreAgg.itemAgg).map(([name, v]) => ({ name, ...v }));
    entries.sort((a, b) => (servicesMetric === "revenue" ? b.revenue - a.revenue : b.qty - a.qty));
    const top = entries.slice(0, 8);
    const rest = entries.slice(8);
    if (rest.length) {
      const other = rest.reduce(
        (acc, r) => ({ qty: acc.qty + r.qty, revenue: acc.revenue + r.revenue }),
        { qty: 0, revenue: 0 }
      );
      top.push({ name: "Other", ...other });
    }
    return top;
  }, [coreAgg, servicesMetric]);

  const topLocations = useMemo(() => {
    const entries = Object.entries(coreAgg.locationAgg).map(([name, v]) => ({ name, ...v }));
    entries.sort((a, b) => b.count - a.count);
    const top = entries.slice(0, 8);
    const rest = entries.slice(8);
    if (rest.length) {
      const other = rest.reduce(
        (acc, r) => ({ count: acc.count + r.count, revenue: acc.revenue + r.revenue }),
        { count: 0, revenue: 0 }
      );
      top.push({ name: "Other", ...other });
    }
    return top;
  }, [coreAgg]);

  const statusFunnel = useMemo(() => {
    const total = filteredOrders.length || 1;
    return STATUS_ORDER.map((status) => ({
      status,
      count: coreAgg.statusCounts[status] || 0,
      pct: ((coreAgg.statusCounts[status] || 0) / total) * 100,
    }));
  }, [coreAgg, filteredOrders]);

  const loading = customers === null;

  return (
    <div className="w-full transition-colors overflow-auto flex flex-col">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex-1 flex flex-col gap-5 lg:gap-6">
        {/* Header */}
        <header className="shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Analytics
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Business insights to plan staffing, promotions and growth
              </p>
            </div>
          </div>
          <SegmentedToggle value={range} onChange={setRange} options={RANGE_OPTIONS} />
        </header>

        {/* KPI row — scoped to the selected range */}
        <section className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={IndianRupee}
            iconBg="bg-indigo-100 dark:bg-indigo-900/40"
            iconClass="text-indigo-600 dark:text-indigo-400"
            label={`Revenue · ${rangeLabel}`}
            value={loading ? "—" : formatCurrency(completedRevenueInRange)}
            featured
          />
          <StatCard
            icon={Package}
            iconBg="bg-sky-100 dark:bg-sky-900/40"
            iconClass="text-sky-600 dark:text-sky-400"
            label="Orders"
            value={loading ? "—" : filteredOrders.length}
          />
          <StatCard
            icon={ShoppingBag}
            iconBg="bg-violet-100 dark:bg-violet-900/40"
            iconClass="text-violet-600 dark:text-violet-400"
            label="Avg order value"
            value={loading ? "—" : formatCurrency(Math.round(aov))}
          />
          {loading ? (
            <StatCard loading />
          ) : (
            <StatCard
              icon={Repeat}
              iconBg="bg-emerald-100 dark:bg-emerald-900/40"
              iconClass="text-emerald-600 dark:text-emerald-400"
              label="Repeat customers"
              value={`${customerInsights.repeatRate.toFixed(0)}%`}
              trendLabel="all-time"
            />
          )}
        </section>

        {/* Peak hours heatmap — the headline ask, always all-time */}
        <SectionCard
          title="Peak order times"
          caption="All time · when customers actually place orders, by hour and day"
          icon={Clock}
        >
          <PeakHoursHeatmap data={heatmapData} loading={loading} />
        </SectionCard>

        {/* Revenue & order volume trend */}
        <SectionCard
          title={`${trendMetric === "revenue" ? "Revenue" : "Order volume"} trend`}
          caption={`Last ${rangeLabel.toLowerCase()}${invalidDateCount > 0 ? ` · ${invalidDateCount} orders excluded (missing date)` : ""}`}
          icon={Activity}
          action={
            <SegmentedToggle
              value={trendMetric}
              onChange={setTrendMetric}
              options={[
                { key: "revenue", label: "Revenue" },
                { key: "orders", label: "Orders" },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-series-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-series-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="label"
                interval={tickInterval}
                tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                axisLine={{ stroke: "var(--chart-axis)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) => (trendMetric === "revenue" ? formatCurrency(v) : `${v} orders`)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey={trendMetric}
                name={trendMetric === "revenue" ? "Revenue" : "Orders"}
                stroke="var(--chart-series-1)"
                fill="url(#trendFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* New vs returning customers */}
        <SectionCard
          title="New vs returning customers"
          caption={`${rangeLabel} · ${newCustomersInRange} new customers`}
          icon={Users}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={newVsReturningData} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="label"
                interval={tickInterval}
                tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                axisLine={{ stroke: "var(--chart-axis)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v} orders`} />} />
              <Area
                type="monotone"
                dataKey="new"
                name="New"
                stackId="1"
                stroke="var(--chart-series-1)"
                fill="var(--chart-series-1)"
                fillOpacity={0.55}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="returning"
                name="Returning"
                stackId="1"
                stroke="var(--chart-series-2)"
                fill="var(--chart-series-2)"
                fillOpacity={0.55}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--chart-series-1)" }} />
              New
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--chart-series-2)" }} />
              Returning
            </span>
          </div>
        </SectionCard>

        {/* Top services */}
        <SectionCard
          title="Top services"
          caption={rangeLabel}
          icon={ShoppingBag}
          action={
            <SegmentedToggle
              value={servicesMetric}
              onChange={setServicesMetric}
              options={[
                { key: "qty", label: "By quantity" },
                { key: "revenue", label: "By revenue" },
              ]}
            />
          }
        >
          <RankedBarList
            data={topServices}
            valueKey={servicesMetric}
            formatValue={(v) => (servicesMetric === "revenue" ? formatCurrency(v) : `${v} pcs`)}
            color="var(--chart-series-1)"
          />
        </SectionCard>

        {/* Order status funnel */}
        <SectionCard title="Order status breakdown" caption={rangeLabel} icon={Activity}>
          <div className="flex flex-col gap-3">
            {statusFunnel.map(({ status, count, pct }) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`w-28 shrink-0 text-xs font-medium ${STATUS_STYLES[status].text}`}>
                  {status}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STATUS_STYLES[status].bar}`}
                    style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                  {count} · {pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top pickup locations */}
        <SectionCard title="Top pickup areas" caption={rangeLabel} icon={MapPin}>
          <RankedBarList
            data={topLocations}
            valueKey="count"
            formatValue={(v) => `${v} orders`}
            color="var(--chart-series-2)"
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
