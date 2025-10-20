import { Component, output, input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../lib/api.service';
import type { BoardCard, UsersList } from '../../../lib/types';

@Component({
  selector: 'app-comment-modal',
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <dialog class="modal modal-open !mt-0" (click)="closeOnBackdrop($event)">
        <div class="modal-backdrop bg-black/70"></div>
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form #commentForm="ngForm" (ngSubmit)="handleSubmit(commentForm)">
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              (click)="close()"
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Add Comment</h3>

            <div class="form-control w-full mb-4">
              <label class="label"><span class="label-text">User</span></label>
              <select
                name="userId"
                [(ngModel)]="formData.userId"
                class="select select-bordered w-full"
                required
              >
                <option value="">Select a user</option>
                @for (user of users(); track user.id) {
                  <option [value]="user.id">{{ user.name }}</option>
                }
              </select>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label"
                ><span class="label-text">Comment</span></label
              >
              <textarea
                name="text"
                [(ngModel)]="formData.text"
                class="textarea textarea-bordered h-24 w-full"
                placeholder="Enter your comment"
                required
              ></textarea>
            </div>

            <div class="modal-action">
              <button type="button" class="btn btn-ghost" (click)="close()">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!commentForm.valid"
              >
                Add Comment
              </button>
            </div>
          </form>
        </div>
      </dialog>
    }
  `,
})
export class CommentModalComponent {
  private apiService = inject(ApiService);

  card = input.required<BoardCard>();
  users = input.required<UsersList>();
  isOpen = input.required<boolean>();
  onClose = output<void>();
  commentAdded = output<{ userId: string; text: string }>();

  formData = {
    userId: '',
    text: '',
  };

  close() {
    this.onClose.emit();
    this.formData = { userId: '', text: '' };
  }

  closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  handleSubmit(form: any) {
    if (!form.valid) return;

    // Optimistic update
    this.commentAdded.emit({
      userId: this.formData.userId,
      text: this.formData.text,
    });

    this.close();
    form.resetForm();

    // Persist to server
    this.apiService
      .addComment(this.card().id, {
        userId: this.formData.userId,
        text: this.formData.text,
      })
      .subscribe();
  }
}
