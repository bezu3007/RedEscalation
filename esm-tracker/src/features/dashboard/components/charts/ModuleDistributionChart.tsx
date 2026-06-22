import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ModuleDistribution } from "../../types";

interface Props {
  data: ModuleDistribution[];
}

export function ModuleDistributionChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.caseCount - a.caseCount).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 80, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="moduleName"
          tick={{ fontSize: 11 }}
          width={78}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="caseCount" name="Cases" fill="hsl(262 83% 58%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}