"use client";

import { useIsClient } from "@/lib/board-utils";
import { BarChart } from "./charts/BarChart";
import { PieChart } from "./charts/PieChart";

export function ChartsSection({
  chartData,
  colors,
}: {
  chartData: Array<{ label: string; value: number }>;
  colors: string[];
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4">Cards per List</h3>
            <div className="flex justify-center items-center h-[250px]">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4">Distribution</h3>
            <div className="flex justify-center items-center h-[250px]">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start">
      <BarChart data={chartData} colors={colors} title="Cards per List" />
      <PieChart data={chartData} colors={colors} title="Distribution" />
    </div>
  );
}
