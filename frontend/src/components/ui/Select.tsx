import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
>(({ className = "", error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={`border rounded-md px-3 py-2 min-h-[2.5rem] text-sm text-slate-900 bg-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
      error ? "border-red-500" : "border-slate-300"
    } ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
