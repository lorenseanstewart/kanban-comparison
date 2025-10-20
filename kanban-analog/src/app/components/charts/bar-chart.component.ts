import { Component, input, computed } from '@angular/core';

export interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  imports: [],
  template: `
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4">
        <h3 class="card-title text-sm text-base-content mb-4">{{ title() }}</h3>
        <table
          class="charts-css column show-labels show-primary-axis show-data-axes data-spacing-10"
        >
          <tbody>
            @for (item of data(); track item.label) {
              <tr>
                <th scope="row">{{ item.label }}</th>
                <td
                  [style.--size]="getSize(item.value)"
                  [style.--color]="colors()[$index % colors().length]"
                >
                  <span class="data">{{ item.value }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    @import 'charts.css';

    table {
      height: 120px;
      max-width: 100%;
      margin: 0;
    }

    td {
      transition: all 0.5s ease-in-out;
    }

    th {
      transform: translateY(10px);
    }

    .data {
      transform: translateY(2px);
    }
  `,
})
export class BarChartComponent {
  data = input.required<ChartData[]>();
  colors = input.required<string[]>();
  title = input.required<string>();

  maxValue = computed(() =>
    Math.max(...this.data().map((d) => d.value), 1)
  );

  getSize(value: number): string {
    return (value / this.maxValue()).toString();
  }
}
