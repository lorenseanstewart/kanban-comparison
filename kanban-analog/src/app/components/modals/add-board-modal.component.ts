import { Component, signal, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../lib/api.service';
import type { BoardSummary } from '../../../lib/types';

@Component({
  selector: 'app-add-board-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <button type="button" class="btn btn-primary" (click)="isOpen.set(true)">
      Add Board
    </button>

    @if (isOpen()) {
      <dialog class="modal modal-open !mt-0" (click)="closeOnBackdrop($event)">
        <div class="modal-backdrop bg-black/70"></div>
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form #boardForm="ngForm" (ngSubmit)="handleSubmit(boardForm)">
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              (click)="close()"
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Add New Board</h3>

            @if (error()) {
              <div class="alert alert-error mb-4">
                <span>{{ error() }}</span>
              </div>
            }

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                type="text"
                name="title"
                [(ngModel)]="formData.title"
                class="input input-bordered w-full"
                placeholder="Enter board title"
                required
                [disabled]="isSubmitting()"
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                name="description"
                [(ngModel)]="formData.description"
                class="textarea textarea-bordered h-24 w-full"
                placeholder="Enter board description (optional)"
                [disabled]="isSubmitting()"
              ></textarea>
            </div>

            <div class="modal-action">
              <button
                type="button"
                class="btn btn-ghost"
                (click)="close()"
                [disabled]="isSubmitting()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="isSubmitting() || !boardForm.valid"
              >
                {{ isSubmitting() ? 'Adding...' : 'Add Board' }}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    }
  `,
})
export class AddBoardModalComponent {
  private apiService = inject(ApiService);

  isOpen = signal(false);
  error = signal<string | null>(null);
  isSubmitting = signal(false);
  boardAdded = output<BoardSummary>();

  formData = {
    title: '',
    description: '',
  };

  close() {
    this.isOpen.set(false);
    this.error.set(null);
    this.formData = { title: '', description: '' };
  }

  closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  handleSubmit(form: any) {
    if (!form.valid) return;

    this.error.set(null);
    this.isSubmitting.set(true);

    this.apiService
      .createBoard({
        title: this.formData.title,
        description: this.formData.description || null,
      })
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.boardAdded.emit(result.data);
            form.resetForm();
            this.close();
          } else {
            this.error.set('Failed to create board');
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.error.set('An unexpected error occurred. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }
}
