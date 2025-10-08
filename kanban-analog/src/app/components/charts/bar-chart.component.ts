import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body p-4">
        <h3 class="card-title text-sm text-base-content mb-4">{{ title() }}</h3>
        <table class="charts-css column show-labels show-primary-axis show-data-axes data-spacing-10">
          <tbody>
            @for (item of data(); track item.label) {
              <tr>
                <th scope="row">{{ item.label }}</th>
                <td [style.--size]="getSize(item.value)" [style.--color]="colors()[($index % colors().length)]">
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
  `,
})
export class BarChartComponent {
  data = input.required<ChartData[]>();
  colors = input.required<string[]>();
  title = input.required<string>();

  getSize(value: number): string {
    const max = Math.max(...this.data().map(d => d.value), 1);
    return (value / max).toString();
  }
}
