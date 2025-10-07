import { component$ } from "@builder.io/qwik";

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}

export const BarChart = component$<BarChartProps>(({ data, colors, title }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4">
        <h3 class="card-title text-sm text-base-content mb-4">{title}</h3>

        {/* Pure CSS Grid layout - everything in normal flow */}
        <div
          class="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
        >
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            const color = colors[index % colors.length];

            return (
              <BarColumn
                key={item.label}
                label={item.label}
                value={item.value}
                heightPercent={heightPercent}
                color={color}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

interface BarColumnProps {
  label: string;
  value: number;
  heightPercent: number;
  color: string;
}

const BarColumn = component$<BarColumnProps>(({ label, value, heightPercent, color }) => {

  return (
    <div class="flex flex-col items-center gap-2">
      {/* Bar container - grows from bottom */}
      <div class="w-full flex flex-col justify-end" style={{ height: "150px" }}>
        <div
          class="w-full rounded-t"
          style={{
            height: `${heightPercent}%`,
            backgroundColor: color,
          }}
        >
          <div class="text-xs text-white font-semibold text-center pt-1">
            {value}
          </div>
        </div>
      </div>
      {/* Label below bar */}
      <div class="text-xs text-base-content text-center font-medium pt-3">
        {label}
      </div>
    </div>
  );
});
