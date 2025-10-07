import { For } from "solid-js";
import "charts.css";

export function PieChart(props: {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}) {
  const totalValue = props.data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4 flex flex-col items-center">
        <h3 class="card-title text-sm text-base-content mb-2 w-full">
          {props.title}
        </h3>
        <table
          class="charts-css pie mx-auto mb-3"
          style="height: 120px; width: 120px; --labels-size: 0;"
        >
          <tbody>
            <For each={props.data}>
              {(item, index) => {
                let startValue = 0;
                for (let i = 0; i < index(); i++) {
                  startValue += props.data[i].value / totalValue;
                }
                const endValue =
                  startValue + (totalValue > 0 ? item.value / totalValue : 0);

                return (
                  <tr>
                    <td
                      style={`--start: ${startValue}; --end: ${endValue}; --color: ${props.colors[index() % props.colors.length]};`}
                    />
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
        {/* Legend */}
        <div class="flex flex-col gap-1 w-full">
          <For each={props.data}>
            {(item, index) => {
              const percentage =
                totalValue > 0 ? (item.value / totalValue) * 100 : 0;
              return (
                <div class="flex items-center gap-2 justify-between">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={`background-color: ${props.colors[index() % props.colors.length]};`}
                    />
                    <span class="text-xs text-base-content">{item.label}</span>
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
  );
}