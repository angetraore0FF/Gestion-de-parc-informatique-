import type { ReactNode } from "react";

type Status = "neutral" | "good" | "warning" | "serious" | "critical";

// Palette de statut fixe. La couleur ne porte jamais le sens seule :
// chaque tuile associe systématiquement une icône et un libellé.
const statusColor: Record<Status, string> = {
  neutral: "var(--color-primary)",
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
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-3">
      <span
        className="mt-0.5 shrink-0"
        style={{ color: statusColor[status] }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-heading text-2xl font-semibold text-slate-900 leading-tight">{value}</div>
        <div className="text-sm text-slate-600">{label}</div>
        {hint && <div className="text-xs text-slate-400 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
