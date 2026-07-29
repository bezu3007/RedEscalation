import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface Props {
  option: EChartsOption;
  height?: number;
}

export default function EChart({
  option,
  height = 350,
}: Props) {
  return (
    <ReactECharts
      option={option}
      style={{
        height,
        width: "100%",
      }}
      opts={{
        renderer: "canvas",
      }}
    />
  );
}