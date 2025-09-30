import { Show } from "solid-js";
import { createBoard } from "~/api/board-actions";

export function AddBoardModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onBoardAdd?: (board: { title: string; description: string | null }) => void;
}) {
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    // Optimistically update the UI
    if (props.onBoardAdd) {
      props.onBoardAdd({
        title,
        description: description || null,
      });
    }

    props.onClose();

    // Reset form
    form.reset();

    // Persist to server in background
    await createBoard(formData);
  };

  return (
    <Show when={props.isOpen}>
      <dialog
        class="modal modal-open"
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose();
        }}
      >
        <div class="modal-backdrop bg-black/70" />
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form method="dialog" onSubmit={handleSubmit}>
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={props.onClose}
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Add New Board</h3>

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
              />
            </div>

            <div class="modal-action">
              <button
                type="button"
                class="btn btn-ghost"
                onClick={props.onClose}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Add Board
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}
