import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "accent";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand-hover hover:-translate-y-px active:translate-y-0 disabled:bg-brand/40 disabled:shadow-none",
  accent:
    "bg-lime text-brand-darker font-semibold shadow-sm shadow-lime/30 hover:bg-lime-hover hover:-translate-y-px active:translate-y-0",
  secondary: "bg-white text-brand ring-1 ring-brand-100 hover:bg-brand-light hover:ring-brand/30 dark:bg-slate-800 dark:text-lime dark:ring-slate-700 dark:hover:bg-slate-700",
  danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50 hover:ring-red-300 dark:bg-slate-800 dark:text-red-400 dark:ring-red-500/30 dark:hover:bg-red-500/10",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-[background-color,transform,box-shadow,color] duration-200 cursor-pointer disabled:cursor-not-allowed disabled:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
