import { Show, createMemo, createEffect } from "solid-js";
import { createBoardAction } from "~/api/board-actions";
import { useSubmission } from "@solidjs/router";

export function AddBoardModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onBoardAdd?: (board: { id: string; title: string; description: string | null }) => void;
}) {
  const submission = useSubmission(createBoardAction);
  const errorMessage = createMemo(() => {
    // Check submission result error first
    const result = submission.result;
    if (result && !result.success) {
      return result.error;
    }

    // Check submission.error
    if (submission.error) {
      return typeof submission.error === 'string' ? submission.error : submission.error?.error;
    }

    return null;
  });
  const pending = () => submission.pending;

  createEffect(() => {
    const result = submission.result;
    if (!result) {
      return;
    }

    // Only proceed if submission was successful
    if (!result.success) {
      // Error will be displayed via errorMessage() memo
      return;
    }

    if (props.onBoardAdd && result.data) {
      props.onBoardAdd(result.data);
    }

    props.onClose();
    submission.clear();
  });

  const handleClose = () => {
    if (pending()) return;
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <dialog
        class="modal modal-open !mt-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div class="modal-backdrop bg-black/70" />
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form method="post" action={createBoardAction}>
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleClose}
              disabled={pending()}
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Add New Board</h3>

            <Show when={errorMessage()}>
              <div class="alert alert-error mb-4">
                <span>{errorMessage()}</span>
              </div>
            </Show>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                type="text"
                name="title"
                class="input input-bordered w-full"
                placeholder="Enter board title"
                required
                disabled={pending()}
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                name="description"
                class="textarea textarea-bordered h-24 w-full"
                placeholder="Enter board description (optional)"
                disabled={pending()}
              />
            </div>

            <div class="modal-action">
              <button
                type="button"
                class="btn btn-ghost"
                onClick={handleClose}
                disabled={pending()}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" disabled={pending()}>
                {pending() ? "Adding..." : "Add Board"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}
