import type { ReactNode } from "react";
import EChart from "./Echart";
import type { EChartsOption } from "echarts";

interface DashboardChartCardProps {
  title: string;
  description?: string;
  option: EChartsOption;
  height?: number;
  children?: ReactNode;
}

export function DashboardChartCard({
  title,
  description,
  option,
  height = 320,
  children,
}: DashboardChartCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
      <EChart option={option} height={height} />
    </div>
  );
}
