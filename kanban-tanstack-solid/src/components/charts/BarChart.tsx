import { For, createEffect } from "solid-js";

export function BarChart(props: {
  data: Array<{ label: string; value: number }>;
  colors: string[];
  title: string;
}) {
  const maxValue = () => Math.max(...props.data.map((item) => item.value), 1);

  return (
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4">
        <h3 class="card-title text-sm text-base-content mb-4">{props.title}</h3>

        {/* Pure CSS Grid layout - everything in normal flow */}
        <div
          class="grid gap-4"
          style={{
            "grid-template-columns": `repeat(${props.data.length}, 1fr)`,
          }}
        >
          <For each={props.data}>
            {(item, index) => {
              let barRef: HTMLDivElement | undefined;
              let isInitialized = false;

              createEffect(() => {
                if (barRef) {
                  const heightPercent = (item.value / maxValue()) * 100;

                  if (!isInitialized) {
                    // First render - set immediately without transition
                    barRef.style.transition = "none";
                    barRef.style.height = `${heightPercent}%`;
                    barRef.style.backgroundColor =
                      props.colors[index() % props.colors.length];

                    // Re-enable transitions after initial render
                    requestAnimationFrame(() => {
                      if (barRef) {
                        barRef.style.transition =
                          "height 500ms ease-out, background-color 500ms ease-out";
                        isInitialized = true;
                      }
                    });
                  } else {
                    // Subsequent updates - animate
                    barRef.style.height = `${heightPercent}%`;
                    barRef.style.backgroundColor =
                      props.colors[index() % props.colors.length];
                  }
                }
              });

              return (
                <div class="flex flex-col items-center gap-2">
                  {/* Bar container - grows from bottom */}
                  <div
                    class="w-full flex flex-col justify-end"
                    style={{ height: "150px" }}
                  >
                    <div
                      ref={barRef}
                      class="w-full rounded-t"
                      style={{ height: "0%" }}
                    >
                      <div class="text-xs text-white font-semibold text-center pt-1">
                        {item.value}
                      </div>
                    </div>
                  </div>
                  {/* Label below bar */}
                  <div class="text-xs text-base-content text-center font-medium pt-3">
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
