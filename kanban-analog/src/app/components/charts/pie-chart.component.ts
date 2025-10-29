import { Component, input, computed } from '@angular/core';

export interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-pie-chart',
  imports: [],
  template: `
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4 flex flex-col items-center">
        <h3 class="card-title text-sm text-base-content mb-2 w-full">
          {{ title() }}
        </h3>
        <table class="charts-css pie mx-auto mb-3" [style]="tableStyle">
          <tbody>
            @for (item of data(); track item.label; let i = $index) {
              <tr>
                <td
                  [style.--start]="getStart(i)"
                  [style.--end]="getEnd(i)"
                  [style.--color]="colors()[i % colors().length]"
                ></td>
              </tr>
            }
          </tbody>
        </table>
        <!-- Legend -->
        <div class="flex flex-col gap-1 w-full">
          @for (item of data(); track item.label; let i = $index) {
            <div class="flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  [style.backgroundColor]="colors()[i % colors().length]"
                ></div>
                <span class="text-xs text-base-content">{{ item.label }}</span>
              </div>
              <span class="text-xs font-semibold text-base-content"
                >{{ getPercentage(item.value) }}%</span
              >
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PieChartComponent {
  data = input.required<ChartData[]>();
  colors = input.required<string[]>();
  title = input.required<string>();

  tableStyle = {
    height: '120px',
    width: '120px',
    '--labels-size': '0',
  };

  total = computed(() => this.data().reduce((sum, d) => sum + d.value, 0));

  getStart(index: number): string {
    const total = this.total();
    if (total === 0) return '0';

    let start = 0;
    for (let i = 0; i < index; i++) {
      start += this.data()[i].value / total;
    }
    return start.toString();
  }

  getEnd(index: number): string {
    const total = this.total();
    const start = parseFloat(this.getStart(index));
    const size = total > 0 ? this.data()[index].value / total : 0;
    return (start + size).toString();
  }

  getPercentage(value: number): string {
    const total = this.total();
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return percentage.toFixed(0);
  }
}
