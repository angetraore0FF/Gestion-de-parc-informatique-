import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  ({ className = "", error, ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border bg-white px-3 py-2 min-h-[2.6rem] text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:border-brand ${
        error ? "border-red-400" : "border-slate-200 hover:border-slate-300"
      } ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
