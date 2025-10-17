
export function BarChart(props: {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}) {
  const maxValue = Math.max(...props.data.map((item) => item.value), 1);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-4">
        <h3 className="card-title text-sm text-base-content mb-4">{props.title}</h3>

        {/* Pure CSS Grid layout - everything in normal flow */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${props.data.length}, 1fr)` }}
        >
          {props.data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            const color = props.colors[index % props.colors.length];

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
}

function BarColumn({
  label,
  value,
  heightPercent,
  color,
}: {
  label: string;
  value: number;
  heightPercent: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Bar container - grows from bottom */}
      <div className="w-full flex flex-col justify-end" style={{ height: "150px" }}>
        <div
          className="w-full rounded-t"
          style={{
            height: `${heightPercent}%`,
            backgroundColor: color,
          }}
        >
          <div className="text-xs text-white font-semibold text-center pt-1">
            {value}
          </div>
        </div>
      </div>
      {/* Label below bar */}
      <div className="text-xs text-base-content text-center font-medium pt-3">
        {label}
      </div>
    </div>
  );
}
