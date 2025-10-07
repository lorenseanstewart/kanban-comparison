"use client";

import { useState, useEffect } from "react";
import type { BoardDetails } from "@/lib/api";
import { BarChart } from "./charts/BarChart";
import { PieChart } from "./charts/PieChart";

export function BoardOverview({ data }: { data: BoardDetails }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // DaisyUI pastel colors matching the theme
  const pastelColors = [
    "#fbbf24", // amber (warning)
    "#f472b6", // pink (secondary)
    "#a78bfa", // purple (primary)
    "#60a5fa", // blue (info)
  ];

  // Prepare data for charts
  const chartData = data.lists.map((list) => ({
    label: list.title,
    value: list.cards.length,
  }));

  return (
    <section className="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="badge badge-secondary badge-outline">Board overview</div>
        <h1 className="text-4xl font-black text-primary">{data.title}</h1>
        {data.description && (
          <p className="text-base text-base-content/60 max-w-2xl">
            {data.description}
          </p>
        )}
      </div>

      {/* Charts Section */}
      {!mounted ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-base-content mb-4">
                Cards per List
              </h3>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start">
          <BarChart
            data={chartData}
            colors={pastelColors}
            title="Cards per List"
          />
          <PieChart
            data={chartData}
            colors={pastelColors}
            title="Distribution"
          />
        </div>
      )}
    </section>
  );
}
