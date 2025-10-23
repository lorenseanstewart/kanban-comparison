import type { BoardDetails } from "../lib/api";
import { BoardHeader } from "./BoardHeader";
import { BarChart } from "./charts/BarChart";
import { PieChart } from "./charts/PieChart";

export function BoardOverview(props: { data: BoardDetails }) {
  // DaisyUI pastel colors matching the theme
  const pastelColors = [
    "#fbbf24", // amber (warning)
    "#f472b6", // pink (secondary)
    "#a78bfa", // purple (primary)
    "#60a5fa", // blue (info)
  ];

  // Prepare data for charts
  const chartData = props.data.lists.map((list) => ({
    label: list.title,
    value: list.cards.length,
  }));

  return (
    <section class="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6">
      <BoardHeader data={props.data} />

      {/* Charts Section */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start">
        <BarChart
          data={chartData}
          colors={pastelColors}
          title="Cards per List"
        />
        <PieChart data={chartData} colors={pastelColors} title="Distribution" />
      </div>
    </section>
  );
}
