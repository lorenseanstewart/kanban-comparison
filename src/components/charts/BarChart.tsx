import { For } from "solid-js";

export function BarChart(props: {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}) {
  const maxValue = Math.max(...props.data.map((item) => item.value), 1);

  return (
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4">
        <h3 class="card-title text-sm text-base-content mb-4">{props.title}</h3>

        {/* Pure CSS Grid layout - everything in normal flow */}
        <div class="grid gap-4" style={`grid-template-columns: repeat(${props.data.length}, 1fr);`}>
          <For each={props.data}>
            {(item, index) => {
              const heightPercent = (item.value / maxValue) * 100;
              return (
                <div class="flex flex-col items-center gap-2">
                  {/* Bar container - grows from bottom */}
                  <div class="w-full flex flex-col justify-end" style="height: 150px;">
                    <div
                      class="w-full rounded-t transition-all"
                      style={`height: ${heightPercent}%; background-color: ${props.colors[index() % props.colors.length]};`}
                    >
                      <div class="text-xs text-white font-semibold text-center pt-1">
                        {item.value}
                      </div>
                    </div>
                  </div>
                  {/* Label below bar */}
                  <div class="text-xs text-base-content text-center font-medium">
                    {item.label}
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
}