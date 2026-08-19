import type { ReactNode } from "react";

type Status = "neutral" | "good" | "warning" | "serious" | "critical";

const statusColor: Record<Status, string> = {
  neutral: "var(--color-brand)",
  good: "var(--color-status-good)",
  warning: "var(--color-status-warning)",
  serious: "var(--color-status-serious)",
  critical: "var(--color-status-critical)",
};

export function StatCard({
  label,
  value,
  icon,
  status = "neutral",
  hint,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  status?: Status;
  hint?: string;
}) {
  const color = statusColor[status];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-darker/5 dark:border-slate-800 dark:bg-slate-900">
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-80"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <div className="flex items-center justify-between">
        <span className="font-heading text-3xl font-bold leading-none text-slate-900 dark:text-slate-100">{value}</span>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</div>}
    </div>
  );
}
