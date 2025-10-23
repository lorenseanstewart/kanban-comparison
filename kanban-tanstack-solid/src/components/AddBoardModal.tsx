import { createSignal } from "solid-js";
import { createBoard } from "../utils/api";
import { useRouter } from "@tanstack/solid-router";

export function AddBoardModal(props: {
  onBoardAdd?: (board: {
    id: string;
    title: string;
    description: string | null;
  }) => void;
}) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const router = useRouter();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    setError(null);
    setIsSubmitting(true);

    try {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      // Wait for server response to get the real ID
      const result = await createBoard({
        data: {
          title,
          description: description || null,
        },
      });

      if (!result.success) {
        setError(result.error || "An error occurred");
        setIsSubmitting(false);
        return;
      }

      // Update UI with server-generated ID
      if (props.onBoardAdd && result.data) {
        props.onBoardAdd({
          id: result.data.id,
          title: result.data.title,
          description: result.data.description ?? null,
        });
      }

      setIsOpen(false);
      form.reset();
      router.invalidate();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        class="btn btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Add Board
      </button>

      {isOpen() && (
        <dialog
          class="modal modal-open !mt-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div class="modal-backdrop bg-black/70" />
          <div class="modal-box bg-base-200 dark:bg-base-300">
            <form method="dialog" onSubmit={handleSubmit}>
              <button
                type="button"
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
              <h3 class="font-bold text-lg mb-4">Add New Board</h3>

              {error() && (
                <div class="alert alert-error mb-4">
                  <span>{error()}</span>
                </div>
              )}

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
                  disabled={isSubmitting()}
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
                  disabled={isSubmitting()}
                />
              </div>

              <div class="modal-action">
                <button
                  type="button"
                  class="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={isSubmitting()}
                >
                  {isSubmitting() ? "Adding..." : "Add Board"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
}
