import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  ({ className = "", error, ...props }, ref) => (
    <input
      ref={ref}
      className={`border rounded-md px-3 py-2 min-h-[2.5rem] text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
        error ? "border-red-500" : "border-slate-300"
      } ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
