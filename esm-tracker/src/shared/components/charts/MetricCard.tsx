import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accentClassName?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accentClassName,
}: MetricCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${accentClassName ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {icon ? (
          <div className="rounded-full bg-slate-100 p-3 text-slate-700">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}
