import type { BoardDetails } from "@/lib/api";
import { BoardHeader } from "./BoardHeader";
import { ChartsSection } from "./ChartsSection";

export function BoardOverview({ data }: { data: BoardDetails }) {
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
      <BoardHeader data={data} />
      <ChartsSection chartData={chartData} colors={pastelColors} />
    </section>
  );
}

