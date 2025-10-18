import { component$ } from "@builder.io/qwik";

interface PieChartProps {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}

export const PieChart = component$<PieChartProps>(({ data, colors, title }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4 flex flex-col items-center">
        <h3 class="card-title text-sm text-base-content mb-2 w-full">
          {title}
        </h3>
        <table
          class="charts-css pie mx-auto mb-3"
          style={{
            height: "120px",
            width: "120px",
            "--labels-size": "0",
          }}
        >
          <tbody>
            {data.map((item, index) => {
              let startValue = 0;
              for (let i = 0; i < index; i++) {
                startValue += data[i].value / totalValue;
              }
              const endValue =
                startValue + (totalValue > 0 ? item.value / totalValue : 0);

              return (
                <tr key={item.label}>
                  <td
                    style={{
                      "--start": startValue.toString(),
                      "--end": endValue.toString(),
                      "--color": colors[index % colors.length],
                    }}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Legend */}
        <div class="flex flex-col gap-1 w-full">
          {data.map((item, index) => {
            const percentage =
              totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <div
                key={item.label}
                class="flex items-center gap-2 justify-between"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span class="text-xs text-base-content">{item.label}</span>
                </div>
                <span class="text-xs font-semibold text-base-content">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
