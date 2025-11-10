import {
  component$,
  useSignal,
  useTask$,
  $,
  type Signal,
  type QRL,
  isServer,
} from "@builder.io/qwik";
import { type ActionStore } from "@builder.io/qwik-city";

interface AddBoardModalProps {
  isOpen: Signal<boolean>;
  action: ActionStore<
    { success: boolean; boardId?: string; error?: string },
    Record<string, any>,
    any
  >;
  onBoardAdd?: QRL<
    (board: { id: string; title: string; description: string | null }) => void
  >;
}

export const AddBoardModal = component$<AddBoardModalProps>(
  ({ isOpen, action, onBoardAdd }) => {
    const dialogRef = useSignal<HTMLDialogElement>();

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
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      // Submit to server action and wait for response
      const result = await action.submit(formData);

      // Close modal and reset form if server action succeeded
      if (result.value?.success) {
        // Call optional callback if provided
        if (result.value.boardId && onBoardAdd) {
          onBoardAdd({
            id: result.value.boardId,
            title,
            description: description || null,
          });
        }

        isOpen.value = false;
        form.reset();
      }
      // Errors are displayed via action.value.error in the template
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
          <div class="modal-box bg-base-200 dark:bg-base-300">
            <form
              method="dialog"
              preventdefault:submit
              onSubmit$={handleSubmit$}
            >
              <button
                type="button"
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick$={handleClose$}
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
                  onClick$={handleClose$}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={action.isRunning}
                >
                  {action.isRunning ? "Creating..." : "Add Board"}
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
