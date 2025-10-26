import type { BoardCard, UsersList, TagsList } from "@/lib/api";
import { updateCard, deleteCard } from "../../utils/api";
import { createEffect, createSignal, Show, For } from "solid-js";

export function CardEditModal(props: {
  card: BoardCard;
  users: UsersList;
  tags: TagsList;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedCard: Partial<BoardCard>) => void;
  onDelete?: () => void;
}) {
  const [selectedTagIds, setSelectedTagIds] = createSignal<Set<string>>(
    new Set(props.card.tags.map((t: { id: string }) => t.id))
  );
  const [isDeleting, setIsDeleting] = createSignal(false);

  // Reset selected tags when card changes
  createEffect(() => {
    setSelectedTagIds(
      new Set(props.card.tags.map((t: { id: string }) => t.id))
    );
  });

  const toggleTag = (tagId: string) => {
    const newSet = new Set(selectedTagIds());
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCard({ data: props.card.id });

      if (result.success) {
        if (props.onDelete) {
          props.onDelete();
        }
        props.onClose();
      } else {
        alert(result.error || "Failed to delete card");
        setIsDeleting(false);
      }
    } catch (error) {
      alert("Failed to delete card. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;

    // Optimistically update the UI
    if (props.onUpdate) {
      const updatedTags = props.tags.filter(
        (tag: { id: string; name: string; color: string }) =>
          selectedTagIds().has(tag.id)
      );
      props.onUpdate({
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        tags: updatedTags,
      });
    }

    props.onClose();

    // Persist to server in background
    await updateCard({
      data: {
        cardId: props.card.id,
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        tagIds: Array.from(selectedTagIds()),
      },
    });
  };

  return (
    <Show when={props.isOpen}>
      <dialog
        class="modal modal-open !mt-0"
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
            <h3 class="font-bold text-lg mb-4">Edit Card</h3>

            <input type="hidden" name="cardId" value={props.card.id} />

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                type="text"
                name="title"
                class="input input-bordered w-full"
                value={props.card.title}
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                name="description"
                class="textarea textarea-bordered h-24 w-full"
                value={props.card.description || ""}
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Assignee</span>
              </label>
              <select
                name="assigneeId"
                class="select select-bordered w-full"
                value={props.card.assigneeId || ""}
              >
                <option value="">Select an assignee</option>
                <For each={props.users}>
                  {(user: { id: string; name: string }) => (
                    <option value={user.id}>{user.name}</option>
                  )}
                </For>
              </select>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Tags</span>
              </label>
              <div class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
                <For each={props.tags}>
                  {(tag: { id: string; name: string; color: string }) => (
                    <button
                      type="button"
                      class={`badge border-2 font-semibold cursor-pointer transition-all hover:scale-105 ${
                        selectedTagIds().has(tag.id)
                          ? "text-white"
                          : "badge-outline"
                      }`}
                      style={
                        selectedTagIds().has(tag.id)
                          ? {
                              "background-color": tag.color,
                              "border-color": tag.color,
                            }
                          : {
                              color: tag.color,
                              "border-color": tag.color,
                            }
                      }
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="modal-action justify-between">
              <button
                type="button"
                class="btn btn-error"
                onClick={handleDelete}
                disabled={isDeleting()}
              >
                {isDeleting() ? "Deleting..." : "Delete Card"}
              </button>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="btn btn-ghost"
                  onClick={props.onClose}
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}
