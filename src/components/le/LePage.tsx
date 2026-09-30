import { ReactNode } from "react";

export const LePage = ({ eyebrow, title, subtitle, action, children }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) => (
  <div className="w-full max-w-[1400px] px-4 py-6 font-body sm:px-8 sm:py-7">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-primary">{eyebrow}</p>
        <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const Card = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div className={`rounded-lg border border-border bg-card shadow-sm ${className}`}>{children}</div>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

export const inputCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";
