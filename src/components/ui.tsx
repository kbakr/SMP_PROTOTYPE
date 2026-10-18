import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-rose-600 via-orange-500 to-teal-500 text-white shadow-lg shadow-rose-500/25 cta-shimmer hover:brightness-110",
    secondary: "bg-slate-900 text-white hover:bg-slate-800",
    ghost: "bg-white/70 text-slate-900 border border-white/60 hover:bg-white",
    danger: "bg-rose-700 text-white hover:bg-rose-800",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-rose-600 via-orange-500 to-teal-500 text-white shadow-lg shadow-rose-500/25",
    secondary: "bg-slate-900 text-white",
    ghost: "bg-white/70 border border-white/60",
  }[variant];
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:brightness-110",
        styles,
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "live" | "soon" | "closed" | "demo";
}) {
  const map = {
    neutral: "bg-slate-900/10 text-slate-800",
    live: "bg-emerald-500/15 text-emerald-800",
    soon: "bg-amber-400/20 text-amber-900",
    closed: "bg-slate-500/15 text-slate-700",
    demo: "bg-yellow-300/30 text-yellow-950",
  }[tone];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide", map)}>
      {children}
    </span>
  );
}

export function Section({
  id,
  title,
  subtitle,
  children,
  action,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-slate-900 sm:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass rounded-2xl px-6 py-10 text-center text-slate-600">{message}</div>
  );
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-display text-2xl text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
