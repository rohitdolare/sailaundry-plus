import { DAY_NAMES } from "../../utils/date";

const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21];

// Discrete 6-step indigo ramp so light/dark can each supply fixed colors
// instead of computing continuous HSL interpolation.
const HEAT_STEPS = [
  { min: 0, light: "#eef2ff", dark: "#1e1b4b" },
  { min: 0.15, light: "#c7d2fe", dark: "#312e81" },
  { min: 0.35, light: "#a5b4fc", dark: "#3730a3" },
  { min: 0.55, light: "#818cf8", dark: "#4338ca" },
  { min: 0.75, light: "#6366f1", dark: "#4f46e5" },
  { min: 0.9, light: "#4338ca", dark: "#6366f1" },
];

const getStep = (ratio) => {
  let step = HEAT_STEPS[0];
  for (const s of HEAT_STEPS) {
    if (ratio >= s.min) step = s;
  }
  return step;
};

const PeakHoursHeatmap = ({ data, loading }) => {
  const max = Math.max(1, ...data.flat());

  if (loading) {
    return (
      <div className="animate-pulse h-56 rounded-xl bg-gray-100 dark:bg-gray-800" />
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Hour axis */}
        <div className="flex pl-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center">
              {HOUR_LABELS.includes(h) && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{h}:00</span>
              )}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="flex flex-col gap-1 mt-1">
          {DAY_NAMES.map((day, dow) => (
            <div key={day} className="flex items-center gap-0">
              <span className="w-10 shrink-0 text-[11px] font-medium text-gray-500 dark:text-gray-400">{day}</span>
              <div className="flex flex-1 gap-[2px]">
                {Array.from({ length: 24 }, (_, hour) => {
                  const value = data[dow]?.[hour] || 0;
                  const ratio = value / max;
                  const step = getStep(ratio);
                  return (
                    <div
                      key={hour}
                      className="flex-1 aspect-square rounded-[3px] cursor-default light-cell dark-cell"
                      style={{ "--cell-light": step.light, "--cell-dark": step.dark }}
                      title={`${day} ${String(hour).padStart(2, "0")}:00 · ${value} order${value === 1 ? "" : "s"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .light-cell.dark-cell { background-color: var(--cell-light); }
        .dark .light-cell.dark-cell { background-color: var(--cell-dark); }
      `}</style>
    </div>
  );
};

export default PeakHoursHeatmap;
