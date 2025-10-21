import {
  Component,
  signal,
  inject,
  computed,
  afterNextRender,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectLoad, RouteMeta } from '@analogjs/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CdkDragDrop,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ApiService } from '../../../lib/api.service';
import type {
  BoardDetails,
  UsersList,
  TagsList,
  BoardCard,
} from '../../../lib/types';
import { BoardOverviewComponent } from '../../components/board-overview.component';
import { CardListComponent } from '../../components/card-list.component';
import { AddCardModalComponent } from '../../components/modals/add-card-modal.component';

export const routeMeta: RouteMeta = {
  title: 'Board',
};

@Component({
  selector: 'app-board',
  imports: [
    RouterLink,
    CdkDropListGroup,
    BoardOverviewComponent,
    CardListComponent,
    AddCardModalComponent,
  ],
  template: `
    @if (errorLoading()) {
      <main
        class="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl"
      >
        <div class="card bg-error/10">
          <div class="card-body items-center text-center">
            <h1 class="card-title text-2xl text-error">Board Error</h1>
            <p class="text-base-content/70">
              {{
                errorMessage() ||
                  'Failed to load this board. It may not exist or there was an error.'
              }}
            </p>
            <div class="card-actions justify-center gap-4 mt-4">
              <button (click)="retry()" class="btn btn-primary">
                Try Again
              </button>
              <a routerLink="/" class="btn btn-ghost"> Back to Boards </a>
            </div>
          </div>
        </div>
      </main>
    } @else if (board(); as boardData) {
      <main
        class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl"
      >
        <div class="breadcrumbs text-sm">
          <ul>
            <li>
              <a routerLink="/" class="link link-hover">Boards</a>
            </li>
            <li>
              <span class="text-base-content/60">{{ boardData.title }}</span>
            </li>
          </ul>
        </div>

        <div class="space-y-8">
          <!-- Board Overview with Charts -->
          <app-board-overview [data]="boardData"></app-board-overview>

          <button
            type="button"
            class="btn btn-primary"
            (click)="isAddCardModalOpen.set(true)"
          >
            Add Card
          </button>

          <!-- Lists with Drag & Drop -->
          <section cdkDropListGroup class="flex gap-7 overflow-x-auto pb-8">
            @if (boardData.lists.length === 0) {
              <div
                class="card bg-base-200 dark:bg-base-300 shadow-xl w-full max-w-md mx-auto"
              >
                <div class="card-body items-center text-center">
                  <h2 class="card-title text-secondary">No lists yet</h2>
                  <p class="text-base-content/60">
                    Add a list to begin organizing work on this board.
                  </p>
                </div>
              </div>
            } @else {
              @for (list of boardData.lists; track list.id) {
                <app-card-list
                  [list]="list"
                  [allUsers]="allUsers()"
                  [allTags]="allTags()"
                  (onDrop)="handleDrop($event)"
                  (cardUpdate)="handleCardUpdate($event)"
                  (cardDeleted)="handleCardDelete($event)"
                ></app-card-list>
              }
            }
          </section>
        </div>
      </main>
    } @else {
      <main
        class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl"
      >
        <div class="flex justify-center py-16">
          <span
            class="loading loading-spinner loading-lg text-primary"
            aria-label="Loading board"
          ></span>
        </div>
      </main>
    }

    <app-add-card-modal
      [boardId]="board()?.id || ''"
      [users]="allUsers()"
      [tags]="allTags()"
      [isOpen]="isAddCardModalOpen()"
      (onClose)="isAddCardModalOpen.set(false)"
      (cardAdded)="handleCardAdded($event)"
    ></app-add-card-modal>
  `,
  styles: `
    :host {
      display: block;
      padding: 2rem 1rem;
    }
  `,
})
export default class BoardPageComponent {
  private apiService = inject(ApiService);

  data = toSignal(injectLoad<typeof import('./[id].server').load>(), {
    requireSync: true,
  });

  board = signal<BoardDetails | null>(this.data()?.board ?? null);
  allUsers = computed<UsersList>(() => this.data()?.allUsers ?? []);
  allTags = computed<TagsList>(() => this.data()?.allTags ?? []);
  isAddCardModalOpen = signal(false);
  errorLoading = computed<boolean>(() => !this.data()?.board);
  errorMessage = computed<string>(() =>
    !this.data()?.board ? 'Board not found' : ''
  );

  constructor() {
    // Keep board in sync with data changes
    effect(() => {
      const loadedBoard = this.data()?.board ?? null;
      if (loadedBoard) {
        this.board.set(loadedBoard);
      }
    });
  }

  retry() {
    afterNextRender(() => {
      window.location.reload();
    });
  }

  handleDrop(event: CdkDragDrop<BoardCard[]>) {
    const board = this.board();
    if (!board) return;

    if (event.previousContainer === event.container) {
      // Reorder within same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Update board signal to trigger change detection
      this.board.set({ ...board });

      // Persist to server
      const listId = event.container.id;
      const cardIds = event.container.data.map((card) => card.id);
      this.apiService.reorderCards(listId, cardIds).subscribe();
    } else {
      // Move to different list
      const movedCard = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Update board signal to trigger change detection
      this.board.set({ ...board });

      // Persist to server
      const newListId = event.container.id;
      this.apiService
        .moveCard(movedCard.id, { newListId, newPosition: event.currentIndex })
        .subscribe();
    }
  }

  handleCardUpdate(update: { cardId: string; updates: Partial<BoardCard> }) {
    const board = this.board();
    if (!board) return;

    // Optimistic update
    const updatedBoard = {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === update.cardId ? { ...card, ...update.updates } : card,
        ),
      })),
    };

    this.board.set(updatedBoard);
  }

  handleCardDelete(cardId: string) {
    const board = this.board();
    if (!board) return;

    // Remove card from all lists
    const updatedBoard = {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      })),
    };

    this.board.set(updatedBoard);
  }

  handleCardAdded(newCard: {
    id: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }) {
    const board = this.board();
    if (!board || board.lists.length === 0) return;

    // Add to first list (Todo)
    const firstList = board.lists[0];
    const tags = this.allTags().filter((tag) =>
      newCard.tagIds.includes(tag.id),
    );

    const card: BoardCard = {
      id: newCard.id,
      title: newCard.title,
      description: newCard.description,
      assigneeId: newCard.assigneeId,
      position: firstList.cards.length,
      completed: false,
      tags,
      comments: [],
    };

    const updatedBoard = {
      ...board,
      lists: board.lists.map((list) =>
        list.id === firstList.id
          ? { ...list, cards: [...list.cards, card] }
          : list,
      ),
    };

    this.board.set(updatedBoard);
  }
}
