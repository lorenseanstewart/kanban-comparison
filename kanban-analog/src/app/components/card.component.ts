import { Component, input, output, signal } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import type { BoardCard, UsersList, TagsList } from '../../lib/types';
import { EditPencilIconComponent } from './icons/edit-pencil.component';
import { PlusIconComponent } from './icons/plus.component';
import { CardEditModalComponent } from './modals/card-edit-modal.component';
import { CommentModalComponent } from './modals/comment-modal.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CdkDrag,
    EditPencilIconComponent,
    PlusIconComponent,
    CardEditModalComponent,
    CommentModalComponent,
  ],
  template: `
    <div
      cdkDrag
      [cdkDragData]="card()"
      class="card mt-2 bg-base-100 dark:bg-neutral shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out"
    >
      <div class="card-body gap-3 p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="card-title text-lg text-base-content">
            {{ card().title }}
          </h3>
          @if (card().completed) {
            <span class="badge badge-success badge-outline">Done</span>
          }
          <button
            type="button"
            (click)="isEditModalOpen.set(true)"
            class="btn btn-ghost btn-xs btn-circle"
          >
            <app-edit-pencil-icon></app-edit-pencil-icon>
          </button>
        </div>

        @if (card().assigneeId) {
          <div class="badge badge-outline badge-secondary badge-sm">
            Assigned to {{ getUserName(card().assigneeId) }}
          </div>
        }

        @if (card().description) {
          <p
            class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2"
          >
            {{ card().description }}
          </p>
        }

        @if (card().tags.length > 0) {
          <div
            class="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100"
          >
            @for (tag of card().tags; track tag.id) {
              <span
                class="badge border-0 shadow font-semibold text-white"
                [style.backgroundColor]="tag.color"
              >
                {{ tag.name }}
              </span>
            }
          </div>
        }

        @if (card().comments.length === 0) {
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-base-content/50">Comments</p>
            <button
              type="button"
              (click)="isCommentModalOpen.set(true)"
              class="btn btn-ghost btn-xs btn-circle"
            >
              <app-plus-icon></app-plus-icon>
            </button>
          </div>
        } @else {
          <div
            class="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner relative"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-base-content/50">Comments</p>
              <button
                type="button"
                (click)="isCommentModalOpen.set(true)"
                class="btn btn-ghost btn-xs btn-circle"
              >
                <app-plus-icon></app-plus-icon>
              </button>
            </div>
            <ul class="space-y-1 text-sm text-base-content/70">
              @for (comment of card().comments; track comment.id) {
                <li>
                  <span class="font-semibold text-base-content">
                    {{ getUserName(comment.userId) }}:
                  </span>
                  {{ comment.text }}
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </div>

    <app-card-edit-modal
      [card]="card()"
      [users]="allUsers()"
      [tags]="allTags()"
      [isOpen]="isEditModalOpen()"
      (onClose)="isEditModalOpen.set(false)"
      (cardUpdated)="handleUpdate($event)"
      (cardDeleted)="handleDelete()"
    ></app-card-edit-modal>

    <app-comment-modal
      [card]="card()"
      [users]="allUsers()"
      [isOpen]="isCommentModalOpen()"
      (onClose)="isCommentModalOpen.set(false)"
      (commentAdded)="handleCommentAdd($event)"
    ></app-comment-modal>
  `,
})
export class CardComponent {
  card = input.required<BoardCard>();
  allUsers = input.required<UsersList>();
  allTags = input.required<TagsList>();
  cardUpdate = output<{ cardId: string; updates: Partial<BoardCard> }>();
  cardDeleted = output<string>();

  isEditModalOpen = signal(false);
  isCommentModalOpen = signal(false);

  getUserName(userId: string | null): string {
    if (!userId) return 'Unknown';
    return this.allUsers().find((u) => u.id === userId)?.name ?? 'Unknown';
  }

  handleUpdate(updates: Partial<BoardCard>) {
    this.cardUpdate.emit({ cardId: this.card().id, updates });
  }

  handleDelete() {
    this.cardDeleted.emit(this.card().id);
  }

  handleCommentAdd(comment: { userId: string; text: string }) {
    const newComment = {
      id: crypto.randomUUID(),
      userId: comment.userId,
      text: comment.text,
      createdAt: new Date(),
    };
    this.cardUpdate.emit({
      cardId: this.card().id,
      updates: { comments: [...this.card().comments, newComment] },
    });
  }
}
