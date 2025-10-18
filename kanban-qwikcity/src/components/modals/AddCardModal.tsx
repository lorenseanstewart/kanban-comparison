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
import type { UsersList, TagsList } from "~/db/queries";

interface AddCardModalProps {
  boardId: string;
  users: UsersList;
  tags: TagsList;
  isOpen: Signal<boolean>;
  action: ActionStore<
    { success: boolean; cardId?: string; error?: string },
    Record<string, any>,
    any
  >;
  onCardAdd?: QRL<
    (card: {
      id: string;
      title: string;
      description: string | null;
      assigneeId: string | null;
      tagIds: string[];
    }) => void
  >;
}

export const AddCardModal = component$<AddCardModalProps>(
  ({ boardId, users, tags, isOpen, action, onCardAdd }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const selectedTagIds = useSignal<Set<string>>(new Set());

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

    const toggleTag$ = $((tagId: string) => {
      const newSet = new Set(selectedTagIds.value);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      selectedTagIds.value = newSet;
    });

    const handleClose$ = $(() => {
      isOpen.value = false;
      selectedTagIds.value = new Set();
    });

    const handleSubmit$ = $(async (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const assigneeId = formData.get("assigneeId") as string;
      const tagIdsArray = Array.from(selectedTagIds.value);

      // Add tagIds to formData as JSON string for server action
      formData.set("tagIds", JSON.stringify(tagIdsArray));

      // Submit to server action and wait for response
      const result = await action.submit(formData);

      // Only update UI if server action succeeded
      if (result.value?.success && result.value.cardId && onCardAdd) {
        onCardAdd({
          id: result.value.cardId,
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          tagIds: tagIdsArray,
        });

        isOpen.value = false;
        form.reset();
        selectedTagIds.value = new Set();
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
              <h3 class="font-bold text-lg mb-4">Add New Card</h3>

              <input type="hidden" name="boardId" value={boardId} />

              <div class="form-control w-full mb-4">
                <label class="label">
                  <span class="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  class="input input-bordered w-full"
                  placeholder="Enter card title"
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
                  placeholder="Enter card description (optional)"
                />
              </div>

              <div class="form-control w-full mb-4">
                <label class="label">
                  <span class="label-text">Assignee</span>
                </label>
                <select name="assigneeId" class="select select-bordered w-full">
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div class="form-control w-full mb-4">
                <label class="label">
                  <span class="label-text">Tags</span>
                </label>
                <div class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      class={`badge border-2 font-semibold cursor-pointer transition-all hover:scale-105 ${
                        selectedTagIds.value.has(tag.id)
                          ? "text-white"
                          : "badge-outline"
                      }`}
                      style={
                        selectedTagIds.value.has(tag.id)
                          ? {
                              backgroundColor: tag.color,
                              borderColor: tag.color,
                            }
                          : {
                              color: tag.color,
                              borderColor: tag.color,
                            }
                      }
                      onClick$={() => toggleTag$(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
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
                  {action.isRunning ? "Creating..." : "Add Card"}
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
