import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DepartmentStats } from "../../types";

interface Props {
  data: DepartmentStats[];
}

export function DepartmentStatsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="department" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        <Radar
          name="Total"
          dataKey="totalCases"
          stroke="hsl(221 83% 53%)"
          fill="hsl(221 83% 53%)"
          fillOpacity={0.25}
        />
        <Radar
          name="Critical"
          dataKey="criticalCases"
          stroke="hsl(0 84% 60%)"
          fill="hsl(0 84% 60%)"
          fillOpacity={0.2}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            fontSize: "12px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}