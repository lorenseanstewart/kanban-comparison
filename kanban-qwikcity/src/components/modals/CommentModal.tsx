import {
  component$,
  useSignal,
  useTask$,
  $,
  type Signal,
  type QRL,
  isServer,
} from "@builder.io/qwik";
import type { ActionStore } from "@builder.io/qwik-city";
import type { BoardCard, UsersList } from "~/db/queries";

interface CommentModalProps {
  card: BoardCard;
  users: UsersList;
  isOpen: Signal<boolean>;
  action: ActionStore<any, any, true>;
  onCommentAdd?: QRL<(comment: { userId: string; text: string }) => void>;
}

export const CommentModal = component$<CommentModalProps>(
  ({ card, users, isOpen, action, onCommentAdd }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const selectedUserId = useSignal(users[0]?.id || "");

    useTask$(({ track }) => {
      track(isOpen);

      if (isServer || !dialogRef.value) {
        return;
      }

      if (isOpen.value) {
        dialogRef.value.showModal();
      } else {
        dialogRef.value.close();
      }
    });

    const handleClose$ = $(() => {
      isOpen.value = false;
    });

    const handleSubmit$ = $(async (event: SubmitEvent) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const userId = formData.get("userId") as string;
      const text = formData.get("text") as string;

      // Optimistically update the UI
      if (onCommentAdd) {
        onCommentAdd({ userId, text });
      }

      isOpen.value = false;

      // Reset form
      form.reset();
      selectedUserId.value = users[0]?.id || "";

      // Submit to server action
      await action.submit(formData);
    });

    return (
      <>
        <dialog
          ref={dialogRef}
          open={isOpen.value}
          class="modal !mt-0"
          onClick$={(event) => {
            if (event.target === event.currentTarget) {
              handleClose$();
            }
          }}
        >
          <div class="modal-backdrop bg-black/70" />
          <div class="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick$={handleClose$}
            >
              ✕
            </button>

            <h3 class="font-bold text-lg mb-4">Comments</h3>

            {/* Existing Comments */}
            <div class="mb-6 max-h-96 overflow-y-auto">
              {card.comments.length === 0 ? (
                <div class="text-center py-8 text-base-content/60">
                  No comments yet. Be the first to add one!
                </div>
              ) : (
                <div class="space-y-3">
                  {card.comments.map((comment) => {
                    const user = users.find((u) => u.id === comment.userId);
                    return (
                      <div
                        key={comment.id}
                        class="bg-base-100 dark:bg-base-200 rounded-lg p-4"
                      >
                        <div class="flex items-center gap-2 mb-2">
                          <span class="font-semibold text-base-content">
                            {user?.name || "Unknown"}
                          </span>
                          <span class="text-xs text-base-content/50">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p class="text-sm text-base-content/80">
                          {comment.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form preventdefault:submit onSubmit$={handleSubmit$}>
              <input type="hidden" name="cardId" value={card.id} />

              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Comment as</span>
                </label>
                <select
                  name="userId"
                  class="select select-bordered w-full"
                  value={selectedUserId.value}
                  onChange$={(event) => {
                    selectedUserId.value = (
                      event.target as HTMLSelectElement
                    ).value;
                  }}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div class="form-control w-full mt-4">
                <label class="label">
                  <span class="label-text">Your comment</span>
                </label>
                <textarea
                  name="text"
                  class="textarea textarea-bordered h-24 w-full"
                  placeholder="Write your comment..."
                  required
                />
              </div>

              <div class="modal-action">
                <button
                  type="button"
                  class="btn btn-ghost"
                  onClick$={handleClose$}
                >
                  Close
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={action.isRunning}
                >
                  {action.isRunning ? "Adding..." : "Add Comment"}
                </button>
              </div>

              {action.value?.error && (
                <div class="alert alert-error mt-4">
                  <span>{action.value.error}</span>
                </div>
              )}
            </form>
          </div>
        </dialog>
      </>
    );
  },
);
