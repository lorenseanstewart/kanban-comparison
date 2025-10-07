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
import type { BoardCard, UsersList, TagsList } from "~/db/queries";

interface CardEditModalProps {
  card: BoardCard;
  users: UsersList;
  tags: TagsList;
  isOpen: Signal<boolean>;
  action: ActionStore<any, any, true>;
  onUpdate?: QRL<(updatedCard: Partial<BoardCard>) => void>;
}

export const CardEditModal = component$<CardEditModalProps>(
  ({ card, users, tags, isOpen, action, onUpdate }) => {
    const dialogRef = useSignal<HTMLDialogElement>();
    const selectedTagIds = useSignal<Set<string>>(
      new Set(card.tags.map((t) => t.id))
    );

    useTask$(({ track }) => {
      track(() => isOpen.value);

      if (isServer || !dialogRef.value) {
        return;
      }

      if (isOpen.value) {
        dialogRef.value.showModal();
      } else {
        dialogRef.value.close();
      }
    });

    useTask$(({ track }) => {
      const currentCardId = track(() => card.id);
      if (!isServer && currentCardId) {
        selectedTagIds.value = new Set(card.tags.map((t) => t.id));
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
    });

    const handleSubmit$ = $(async (event: SubmitEvent) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const assigneeId = formData.get("assigneeId") as string;
      const tagIdsArray = Array.from(selectedTagIds.value);

      // Add tagIds to formData as JSON string for server action
      formData.set("tagIds", JSON.stringify(tagIdsArray));

      // Optimistically update the UI
      if (onUpdate) {
        const updatedTags = tags.filter((tag) =>
          selectedTagIds.value.has(tag.id)
        );
        onUpdate({
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          tags: updatedTags,
        });
      }

      // Submit to server action
      await action.submit(formData);

      // Close modal and reset after submission
      isOpen.value = false;
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
              <form method="dialog" preventdefault:submit onSubmit$={handleSubmit$}>
                <button
                  type="button"
                  class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick$={handleClose$}
                >
                  ✕
                </button>
                <h3 class="font-bold text-lg mb-4">Edit Card</h3>

                <input type="hidden" name="cardId" value={card.id} />

                <div class="form-control w-full mb-4">
                  <label class="label">
                    <span class="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    class="input input-bordered w-full"
                    value={card.title}
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
                    value={card.description || ""}
                  />
                </div>

                <div class="form-control w-full mb-4">
                  <label class="label">
                    <span class="label-text">Assignee</span>
                  </label>
                  <select
                    name="assigneeId"
                    class="select select-bordered w-full"
                    value={card.assigneeId || ""}
                  >
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
                  <button type="button" class="btn btn-ghost" onClick$={handleClose$}>
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" disabled={action.isRunning}>
                    {action.isRunning ? "Saving..." : "Save Changes"}
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
  }
);
