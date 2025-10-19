import { Component, input, computed } from '@angular/core';
import type { BoardDetails } from '../../lib/types';
import {
  BarChartComponent,
  type ChartData,
} from './charts/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart.component';

@Component({
  selector: 'app-board-overview',
  standalone: true,
  imports: [BarChartComponent, PieChartComponent],
  template: `
    <section
      class="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6"
    >
      <!-- Header Section -->
      <div class="space-y-3">
        <div class="badge badge-secondary badge-outline">Board overview</div>
        <h1 class="text-4xl font-black text-primary">{{ data().title }}</h1>
        @if (data().description) {
          <p class="text-base text-base-content/60 max-w-2xl">
            {{ data().description }}
          </p>
        }
      </div>

      <!-- Charts Section -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start"
      >
        <app-bar-chart
          [data]="chartData()"
          [colors]="pastelColors"
          title="Cards per List"
        ></app-bar-chart>
        <app-pie-chart
          [data]="chartData()"
          [colors]="pastelColors"
          title="Distribution"
        ></app-pie-chart>
      </div>
    </section>
  `,
})
export class BoardOverviewComponent {
  data = input.required<BoardDetails>();

  chartData = computed<ChartData[]>(() =>
    this.data().lists.map((list) => ({
      label: list.title,
      value: list.cards.length,
    })),
  );

  pastelColors = ['#fbbf24', '#f472b6', '#a78bfa', '#60a5fa'];
}
