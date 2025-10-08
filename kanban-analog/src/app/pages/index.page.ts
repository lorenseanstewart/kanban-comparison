import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectLoad, RouteMeta } from '@analogjs/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../lib/api.service';
import type { BoardSummary } from '../../lib/types';
import { AddBoardModalComponent } from '../components/modals/add-board-modal.component';

export const routeMeta: RouteMeta = {
  title: 'Kanban Boards',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AddBoardModalComponent],
  template: `
    <main class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
      <header class="text-center space-y-3">
        <p class="text-sm uppercase tracking-wide text-secondary">
          Your workspace
        </p>
        <h1 class="text-4xl font-black text-primary">Boards</h1>
        <p class="text-base text-base-content/60">
          Choose a board to jump into your Kanban flow.
        </p>
      </header>

      <div class="flex justify-end">
        <app-add-board-modal (boardAdded)="handleBoardAdd($event)" />
      </div>

      <section class="grid gap-8 md:grid-cols-2">
        @if (boards().length === 0) {
          <div class="card bg-base-200 dark:bg-base-300 shadow-xl">
            <div class="card-body items-center text-center">
              <h2 class="card-title text-secondary">No boards yet</h2>
              <p class="text-base-content/60">
                Create your first board to get started.
              </p>
            </div>
          </div>
        } @else {
          @for (board of boards(); track board.id) {
            <a
              [routerLink]="['/board', board.id]"
              class="card bg-base-200 dark:bg-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <div class="card-body">
                <h2 class="card-title text-primary">{{ board.title }}</h2>
                @if (board.description) {
                  <p class="text-sm text-base-content/60">
                    {{ board.description }}
                  </p>
                } @else {
                  <p class="badge badge-secondary badge-outline w-fit shadow">
                    No description
                  </p>
                }
                <div class="card-actions justify-end">
                  <span class="btn btn-secondary btn-sm shadow-lg">
                    Open board
                  </span>
                </div>
              </div>
            </a>
          }
        }
      </section>
    </main>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 2rem 1rem;
    }
  `,
})
export default class HomeComponent {
  private apiService = inject(ApiService);

  // Load data from server
  data = toSignal(injectLoad<typeof import('./index.server').load>(), {
    requireSync: true
  });

  boards = signal<BoardSummary[]>(this.data()?.boards || []);

  handleBoardAdd(boardData: BoardSummary) {
    this.boards.update(boards => [...boards, boardData]);
  }
}
