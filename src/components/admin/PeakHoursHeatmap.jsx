import { Fragment, useMemo } from "react";
import { DAY_NAMES, formatHour } from "../../utils/date";

const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21];

// Discrete 7-step ramp so light/dark can each supply fixed colors instead of
// computing continuous HSL interpolation. Step 0 is a neutral gray (not a
// pale tint) so "no orders" reads as empty rather than "a little colored."
const HEAT_STEPS = [
  { min: 0, light: "#f3f4f6", dark: "#1f2937" },
  { min: 0.12, light: "#e0e7ff", dark: "#312e81" },
  { min: 0.3, light: "#c7d2fe", dark: "#3730a3" },
  { min: 0.5, light: "#a5b4fc", dark: "#4338ca" },
  { min: 0.7, light: "#818cf8", dark: "#4f46e5" },
  { min: 0.85, light: "#6366f1", dark: "#6366f1" },
  { min: 0.95, light: "#4338ca", dark: "#818cf8" },
];

const getStep = (ratio) => {
  let step = HEAT_STEPS[0];
  for (const s of HEAT_STEPS) {
    if (ratio >= s.min) step = s;
  }
  return step;
};

const LIGHT_GRADIENT = `linear-gradient(to right, ${HEAT_STEPS.map((s) => s.light).join(", ")})`;
const DARK_GRADIENT = `linear-gradient(to right, ${HEAT_STEPS.map((s) => s.dark).join(", ")})`;

const PeakHoursHeatmap = ({ data, loading }) => {
  const max = Math.max(1, ...data.flat());

  const topSlots = useMemo(() => {
    const flat = [];
    data.forEach((row, dow) =>
      row.forEach((count, hour) => {
        if (count > 0) flat.push({ dow, hour, count });
      })
    );
    flat.sort((a, b) => b.count - a.count);
    return flat.slice(0, 3);
  }, [data]);

  if (loading) {
    return <div className="animate-pulse h-56 rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Plain-language takeaway before the grid, so the grid is supporting detail, not the only answer */}
      {topSlots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topSlots.map((slot, i) => (
            <span
              key={`${slot.dow}-${slot.hour}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
            >
              <span className="font-bold">#{i + 1}</span>
              {DAY_NAMES[slot.dow]} {formatHour(slot.hour)} · {slot.count} orders
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="min-w-[640px] grid gap-[3px]"
          style={{ gridTemplateColumns: "2.5rem repeat(24, minmax(0, 1fr))" }}
        >
          {/* Hour axis header */}
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="text-center">
              {HOUR_LABELS.includes(h) && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {formatHour(h)}
                </span>
              )}
            </div>
          ))}

          {/* Day rows */}
          {DAY_NAMES.map((day, dow) => (
            <Fragment key={day}>
              <span className="flex items-center text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {day}
              </span>
              {Array.from({ length: 24 }, (_, hour) => {
                const value = data[dow]?.[hour] || 0;
                const ratio = value / max;
                const step = getStep(ratio);
                return (
                  <div
                    key={hour}
                    className="h-4 sm:h-5 rounded-[3px] cursor-default heat-cell"
                    style={{ "--cell-light": step.light, "--cell-dark": step.dark }}
                    title={`${day} ${formatHour(hour)} · ${value} order${value === 1 ? "" : "s"}`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Fewer orders</span>
        <div className="h-2 w-28 rounded-full dark:hidden" style={{ background: LIGHT_GRADIENT }} />
        <div className="h-2 w-28 rounded-full hidden dark:block" style={{ background: DARK_GRADIENT }} />
        <span className="text-[10px] text-gray-400 dark:text-gray-500">More orders</span>
      </div>

      <style>{`
        .heat-cell { background-color: var(--cell-light); }
        .dark .heat-cell { background-color: var(--cell-dark); }
      `}</style>
    </div>
  );
};

export default PeakHoursHeatmap;
