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
    <div className="overflow-x-auto border rounded-lg" aria-busy={isLoading || undefined}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-left">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-3 py-2.5 font-medium font-heading">
                {col.header}
              </th>
            ))}
            {actions && <th className="px-3 py-2.5" />}
          </tr>
        </thead>
        <tbody className="divide-y">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {Array.from({ length: colSpan }).map((__, j) => (
                  <td key={j} className="px-3 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${60 + ((i + j) % 3) * 15}%` }} />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading &&
            rows.map((row) => (
              <tr
                key={row.id}
                className={
                  onRowClick
                    ? "hover:bg-slate-50 cursor-pointer focus-visible:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                    : ""
                }
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
                {columns.map((col) => (
                  <td key={col.header} className={`px-3 py-2.5 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}

          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="px-3 py-10 text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <InboxIcon className="w-9 h-9 text-slate-300" />
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
