import { Component, input, output, computed } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import type {
  BoardList,
  UsersList,
  TagsList,
  BoardCard,
} from '../../lib/types';
import { CardComponent } from './card.component';

@Component({
  selector: 'app-card-list',
  imports: [CdkDropList, CardComponent],
  template: `
    <article class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl">
      <div class="card-body gap-4">
        <header class="flex items-center justify-between">
          <h2 class="card-title text-base-content">{{ list().title }}</h2>
          <div class="badge badge-primary badge-outline badge-lg shadow">
            {{ cardCount() }} cards
          </div>
        </header>

        <div
          cdkDropList
          [cdkDropListData]="list().cards"
          [id]="list().id"
          class="min-h-[200px] transition-all duration-200"
          (cdkDropListDropped)="onDrop.emit($event)"
        >
          @if (list().cards.length === 0) {
            <div class="alert alert-info text-sm">
              <span>No cards yet</span>
            </div>
          } @else {
            <div class="space-y-3">
              @for (card of list().cards; track card.id) {
                <app-card
                  [card]="card"
                  [allUsers]="allUsers()"
                  [allTags]="allTags()"
                  (cardUpdate)="cardUpdate.emit($event)"
                  (cardDeleted)="cardDeleted.emit($event)"
                ></app-card>
              }
            </div>
          }
        </div>
      </div>
    </article>
  `,
})
export class CardListComponent {
  list = input.required<BoardList>();
  allUsers = input.required<UsersList>();
  allTags = input.required<TagsList>();
  onDrop = output<any>();
  cardUpdate = output<{ cardId: string; updates: Partial<BoardCard> }>();
  cardDeleted = output<string>();

  cardCount = computed(() => this.list().cards.length);
}
