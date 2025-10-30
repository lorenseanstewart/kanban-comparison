"use client";

import { BarChart } from "./charts/BarChart";
import { PieChart } from "./charts/PieChart";

export function ChartsSection({
  chartData,
  colors,
}: {
  chartData: Array<{ label: string; value: number }>;
  colors: string[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start">
      <BarChart data={chartData} colors={colors} title="Cards per List" />
      <PieChart data={chartData} colors={colors} title="Distribution" />
    </div>
  );
}
