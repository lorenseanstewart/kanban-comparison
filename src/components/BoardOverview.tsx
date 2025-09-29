import { Show, For, onMount, createSignal } from "solid-js";
import type { BoardDetails } from "~/api/boards";
import "charts.css";

export function BoardOverview(props: { data: BoardDetails }) {
  const { data } = props;
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  // Calculate total cards and percentages
  const totalCards = data.lists.reduce(
    (total, list) => total + list.cards.length,
    0
  );
  const maxCards = Math.max(...data.lists.map((list) => list.cards.length), 1);

  // DaisyUI pastel colors matching the theme
  const pastelColors = [
    "#fbbf24", // amber (warning)
    "#f472b6", // pink (secondary)
    "#a78bfa", // purple (primary)
    "#60a5fa", // blue (info)
  ];

  return (
    <section class="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6">
      {/* Header Section */}
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
        <div class="stats bg-base-100 shadow-lg">
          <div class="stat">
            <div class="stat-title">Lists</div>
            <div class="stat-value text-primary">{data.lists.length}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Cards</div>
            <div class="stat-value text-secondary">{totalCards}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <Show
        when={mounted()}
        fallback={
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto">
          {/* Bar Chart */}
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body p-4">
              <h3 class="card-title text-sm text-base-content mb-2">
                Cards per List
              </h3>
              <table
                class="charts-css column show-labels show-data-axes data-spacing-1 w-full mx-auto"
                style="height: 148px;"
              >
                <tbody>
                  <For each={data.lists}>
                    {(list, index) => (
                      <tr>
                        <th
                          scope="row"
                          class="text-xs"
                        >
                          {list.title}
                        </th>
                        <td
                          style={`--size: ${list.cards.length / maxCards}; --color: ${pastelColors[index() % pastelColors.length]};`}
                        >
                          <span class="data text-xs">{list.cards.length}</span>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie Chart */}
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body p-4 flex flex-col items-center">
              <h3 class="card-title text-sm text-base-content mb-2 w-full">
                Distribution
              </h3>
              <table
                class="charts-css pie mx-auto mb-3"
                style="height: 120px; width: 120px;"
              >
                <tbody>
                  <For each={data.lists}>
                    {(list, index) => {
                      let startValue = 0;
                      for (let i = 0; i < index(); i++) {
                        startValue += data.lists[i].cards.length / totalCards;
                      }
                      const endValue =
                        startValue +
                        (totalCards > 0 ? list.cards.length / totalCards : 0);

                      return (
                        <tr>
                          <td
                            style={`--start: ${startValue}; --end: ${endValue}; --color: ${pastelColors[index() % pastelColors.length]};`}
                          />
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
              {/* Legend */}
              <div class="flex flex-col gap-1 w-full">
                <For each={data.lists}>
                  {(list, index) => {
                    const percentage =
                      totalCards > 0
                        ? (list.cards.length / totalCards) * 100
                        : 0;
                    return (
                      <div class="flex items-center gap-2 justify-between">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={`background-color: ${pastelColors[index() % pastelColors.length]};`}
                          />
                          <span class="text-xs text-base-content">
                            {list.title}
                          </span>
                        </div>
                        <span class="text-xs font-semibold text-base-content">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </section>
  );
}
