import { Show, onMount, createSignal } from "solid-js";
import type { BoardDetails } from "~/api/boards";
import { BarChart } from "./charts/BarChart";
import { PieChart } from "./charts/PieChart";
import { ErrorBoundary } from "./ErrorBoundary";

export function BoardOverview(props: { data: BoardDetails }) {
  const { data } = props;
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

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
    <section class="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6">
      {/* Header Section */}
      <div class="space-y-3">
        <div class="badge badge-secondary badge-outline">Board overview</div>
        <h1 class="text-4xl font-black text-primary">{data.title}</h1>
        <Show when={data.description}>
          {(description) => (
            <p class="text-base text-base-content/60 max-w-2xl">
              {description()}
            </p>
          )}
        </Show>
      </div>

      {/* Charts Section */}
      <Show
        when={mounted()}
        fallback={
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div class="card bg-base-100 shadow-lg">
              <div class="card-body">
                <h3 class="card-title text-base-content mb-4">
                  Cards per List
                </h3>
                <div class="flex justify-center items-center h-[250px]">
                  <span class="loading loading-spinner loading-lg text-primary" />
                </div>
              </div>
            </div>
            <div class="card bg-base-100 shadow-lg">
              <div class="card-body">
                <h3 class="card-title text-base-content mb-4">Distribution</h3>
                <div class="flex justify-center items-center h-[250px]">
                  <span class="loading loading-spinner loading-lg text-primary" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start">
          <ErrorBoundary>
            <BarChart
              data={chartData}
              colors={pastelColors}
              title="Cards per List"
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <PieChart
              data={chartData}
              colors={pastelColors}
              title="Distribution"
            />
          </ErrorBoundary>
        </div>
      </Show>
    </section>
  );
}
