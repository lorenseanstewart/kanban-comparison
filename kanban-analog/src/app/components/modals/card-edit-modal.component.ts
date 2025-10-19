import {
  Component,
  signal,
  output,
  input,
  inject,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../lib/api.service';
import type { BoardCard, UsersList, TagsList } from '../../../lib/types';

@Component({
  selector: 'app-card-edit-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <dialog class="modal modal-open !mt-0" (click)="closeOnBackdrop($event)">
        <div class="modal-backdrop bg-black/70"></div>
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form #editForm="ngForm" (ngSubmit)="handleSubmit(editForm)">
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              (click)="close()"
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Edit Card</h3>

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">Title</span></label>
              <input
                type="text"
                name="title"
                [(ngModel)]="formData.title"
                class="input input-bordered w-full"
                required
                [disabled]="isDeleting()"
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"
                ><span class="label-text">Description</span></label
              >
              <textarea
                name="description"
                [(ngModel)]="formData.description"
                class="textarea textarea-bordered h-24 w-full"
                required
                [disabled]="isDeleting()"
              ></textarea>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"
                ><span class="label-text">Assignee</span></label
              >
              <select
                name="assigneeId"
                [(ngModel)]="formData.assigneeId"
                class="select select-bordered w-full"
                required
                [disabled]="isDeleting()"
              >
                <option [ngValue]="null" disabled>Select an assignee</option>
                @for (user of users(); track user.id) {
                  <option [value]="user.id">{{ user.name }}</option>
                }
              </select>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">Tags</span></label>
              <div
                class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg"
              >
                @for (tag of tags(); track tag.id) {
                  <button
                    type="button"
                    class="badge border-2 font-semibold cursor-pointer transition-all hover:scale-105"
                    [class.text-white]="selectedTagIds().has(tag.id)"
                    [class.badge-outline]="!selectedTagIds().has(tag.id)"
                    [style.backgroundColor]="
                      selectedTagIds().has(tag.id) ? tag.color : ''
                    "
                    [style.borderColor]="tag.color"
                    [style.color]="
                      !selectedTagIds().has(tag.id) ? tag.color : ''
                    "
                    (click)="toggleTag(tag.id)"
                  >
                    {{ tag.name }}
                  </button>
                }
              </div>
            </div>

            <div class="modal-action justify-between">
              <button
                type="button"
                class="btn btn-error"
                (click)="handleDelete()"
                [disabled]="isDeleting()"
              >
                {{ isDeleting() ? 'Deleting...' : 'Delete Card' }}
              </button>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="btn btn-ghost"
                  (click)="close()"
                  [disabled]="isDeleting()"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="!editForm.valid || isDeleting()"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
    }
  `,
})
export class CardEditModalComponent {
  private apiService = inject(ApiService);

  card = input.required<BoardCard>();
  users = input.required<UsersList>();
  tags = input.required<TagsList>();
  isOpen = input.required<boolean>();
  onClose = output<void>();
  cardUpdated = output<Partial<BoardCard>>();
  cardDeleted = output<void>();

  selectedTagIds = signal<Set<string>>(new Set());
  isDeleting = signal(false);
  formData = {
    title: '',
    description: '',
    assigneeId: null as string | null,
  };

  constructor() {
    effect(() => {
      const card = this.card();
      this.formData.title = card.title;
      this.formData.description = card.description || '';
      this.formData.assigneeId = card.assigneeId;
      this.selectedTagIds.set(new Set(card.tags.map((t) => t.id)));
    });
  }

  handleDelete() {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    this.isDeleting.set(true);

    this.apiService.deleteCard(this.card().id).subscribe({
      next: (result) => {
        if (result.success) {
          this.cardDeleted.emit();
          this.close();
        } else {
          alert(result.error || 'Failed to delete card');
          this.isDeleting.set(false);
        }
      },
      error: (err) => {
        alert('Failed to delete card. Please try again.');
        this.isDeleting.set(false);
      },
    });
  }

  close() {
    this.onClose.emit();
  }

  closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  toggleTag(tagId: string) {
    const newSet = new Set(this.selectedTagIds());
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    this.selectedTagIds.set(newSet);
  }

  handleSubmit(form: any) {
    if (!form.valid) return;

    const updatedTags = this.tags().filter((tag) =>
      this.selectedTagIds().has(tag.id),
    );

    // Optimistic update
    this.cardUpdated.emit({
      title: this.formData.title,
      description: this.formData.description || null,
      assigneeId: this.formData.assigneeId || null,
      tags: updatedTags,
    });

    this.close();

    // Persist to server
    this.apiService
      .updateCard({
        cardId: this.card().id,
        title: this.formData.title,
        description: this.formData.description || null,
        assigneeId: this.formData.assigneeId || null,
        tagIds: Array.from(this.selectedTagIds()),
      })
      .subscribe();
  }
}
