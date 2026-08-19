import { InboxIcon } from "./Icons";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function Table<T extends { id: number }>({
  columns,
  rows,
  onRowClick,
  actions,
  isLoading,
  emptyMessage = "Aucune donnée pour le moment.",
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  const colSpan = columns.length + (actions ? 1 : 0);

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-brand-darker/5"
      aria-busy={isLoading || undefined}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-slate-50">
                {Array.from({ length: colSpan }).map((__, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div
                      className="h-4 animate-pulse rounded bg-slate-100"
                      style={{ width: `${55 + ((i + j) % 3) * 15}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading &&
            rows.map((row, idx) => (
              <tr
                key={row.id}
                style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                className={`animate-fade-in border-b border-slate-50 transition-colors last:border-0 ${
                  onRowClick
                    ? "cursor-pointer hover:bg-brand-light/60 focus-visible:outline-none focus-visible:bg-brand-light focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                    : "hover:bg-slate-50/60"
                }`}
                onClick={() => onRowClick?.(row)}
                {...(onRowClick
                  ? {
                      tabIndex: 0,
                      role: "button",
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      },
                    }
                  : {})}
              >
                {columns.map((col, ci) => (
                  <td
                    key={col.header}
                    className={`px-4 py-3.5 ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"} ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}

          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="px-4 py-16 text-center text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <InboxIcon className="h-7 w-7" />
                  </span>
                  <span className="max-w-md text-sm">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
