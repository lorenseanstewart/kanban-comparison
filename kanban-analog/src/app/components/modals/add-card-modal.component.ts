import { Component, signal, output, input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../lib/api.service';
import type { UsersList, TagsList } from '../../../lib/types';

@Component({
  selector: 'app-add-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <dialog class="modal modal-open !mt-0" (click)="closeOnBackdrop($event)">
        <div class="modal-backdrop bg-black/70"></div>
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form #cardForm="ngForm" (ngSubmit)="handleSubmit(cardForm)">
            <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" (click)="close()">✕</button>
            <h3 class="font-bold text-lg mb-4">Add New Card</h3>

            @if (error()) {
              <div class="alert alert-error mb-4"><span>{{ error() }}</span></div>
            }

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">Title</span></label>
              <input type="text" name="title" [(ngModel)]="formData.title" class="input input-bordered w-full"
                placeholder="Enter card title" required [disabled]="isSubmitting()" />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">Description</span></label>
              <textarea name="description" [(ngModel)]="formData.description"
                class="textarea textarea-bordered h-24 w-full" placeholder="Enter card description (optional)"
                [disabled]="isSubmitting()"></textarea>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">Assignee</span></label>
              <select name="assigneeId" [(ngModel)]="formData.assigneeId" class="select select-bordered w-full"
                [disabled]="isSubmitting()">
                <option value="">Unassigned</option>
                @for (user of users(); track user.id) {
                  <option [value]="user.id">{{ user.name }}</option>
                }
              </select>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">Tags</span></label>
              <div class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
                @for (tag of tags(); track tag.id) {
                  <button type="button"
                    class="badge border-2 font-semibold cursor-pointer transition-all hover:scale-105"
                    [class.text-white]="selectedTagIds().has(tag.id)"
                    [class.badge-outline]="!selectedTagIds().has(tag.id)"
                    [style.backgroundColor]="selectedTagIds().has(tag.id) ? tag.color : ''"
                    [style.borderColor]="tag.color"
                    [style.color]="!selectedTagIds().has(tag.id) ? tag.color : ''"
                    (click)="toggleTag(tag.id)">
                    {{ tag.name }}
                  </button>
                }
              </div>
            </div>

            <div class="modal-action">
              <button type="button" class="btn btn-ghost" (click)="close()" [disabled]="isSubmitting()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting() || !cardForm.valid">
                {{ isSubmitting() ? 'Adding...' : 'Add Card' }}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    }
  `,
})
export class AddCardModalComponent {
  private apiService = inject(ApiService);

  boardId = input.required<string>();
  users = input.required<UsersList>();
  tags = input.required<TagsList>();
  isOpen = input.required<boolean>();
  onClose = output<void>();
  cardAdded = output<{ id: string; title: string; description: string | null; assigneeId: string | null; tagIds: string[] }>();

  error = signal<string | null>(null);
  isSubmitting = signal(false);
  selectedTagIds = signal<Set<string>>(new Set());

  formData = {
    title: '',
    description: '',
    assigneeId: '',
  };

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.selectedTagIds.set(new Set());
        this.error.set(null);
      }
    });
  }

  close() {
    this.onClose.emit();
    this.error.set(null);
    this.formData = { title: '', description: '', assigneeId: '' };
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

    this.error.set(null);
    this.isSubmitting.set(true);

    this.apiService
      .createCard({
        boardId: this.boardId(),
        title: this.formData.title,
        description: this.formData.description || null,
        assigneeId: this.formData.assigneeId || null,
        tagIds: Array.from(this.selectedTagIds()),
      })
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.cardAdded.emit({
              id: result.data.id,
              title: this.formData.title,
              description: this.formData.description || null,
              assigneeId: this.formData.assigneeId || null,
              tagIds: Array.from(this.selectedTagIds()),
            });
            form.resetForm();
            this.close();
          } else {
            this.error.set('Failed to create card');
          }
          this.isSubmitting.set(false);
        },
        error: () => {
          this.error.set('An unexpected error occurred. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }
}
