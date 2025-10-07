"use client";

export function PieChart(props: {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}) {
  const totalValue = props.data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-4 flex flex-col items-center">
        <h3 className="card-title text-sm text-base-content mb-2 w-full">
          {props.title}
        </h3>
        <table
          className="charts-css pie mx-auto mb-3"
          style={{ height: "120px", width: "120px", "--labels-size": "0" } as React.CSSProperties}
        >
          <tbody>
            {props.data.map((item, index) => {
              let startValue = 0;
              for (let i = 0; i < index; i++) {
                startValue += props.data[i].value / totalValue;
              }
              const endValue =
                startValue + (totalValue > 0 ? item.value / totalValue : 0);

              return (
                <tr key={item.label}>
                  <td
                    style={
                      {
                        "--start": startValue,
                        "--end": endValue,
                        "--color": props.colors[index % props.colors.length],
                      } as React.CSSProperties
                    }
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Legend */}
        <div className="flex flex-col gap-1 w-full">
          {props.data.map((item, index) => {
            const percentage =
              totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <div key={item.label} className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: props.colors[index % props.colors.length],
                    }}
                  />
                  <span className="text-xs text-base-content">{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-base-content">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
