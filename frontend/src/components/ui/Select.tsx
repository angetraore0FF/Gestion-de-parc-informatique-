import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(({ className = "", error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full appearance-none rounded-lg border bg-white bg-[length:1.1rem] bg-[right_0.6rem_center] bg-no-repeat px-3 py-2 pr-9 min-h-[2.6rem] text-sm text-slate-900 cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:border-brand dark:bg-slate-800 dark:text-slate-100 ${
      error ? "border-red-400" : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
    } ${className}`}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
