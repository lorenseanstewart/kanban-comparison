import { createSignal, Show, For } from "solid-js";
import type { BoardCard, UsersList, TagsList } from "~/api/boards";
import { updateCard } from "~/api/card-actions";

export function CardEditModal(props: {
  card: BoardCard;
  users: UsersList;
  tags: TagsList;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedCard: Partial<BoardCard>) => void;
}) {
  const [selectedTagIds, setSelectedTagIds] = createSignal<Set<string>>(
    new Set(props.card.tags.map((t) => t.id))
  );

  const toggleTag = (tagId: string) => {
    const newSet = new Set(selectedTagIds());
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;

    // Add all selected tag IDs to form data
    selectedTagIds().forEach((tagId) => {
      formData.append("tagIds", tagId);
    });

    // Optimistically update the UI
    if (props.onUpdate) {
      const updatedTags = props.tags.filter((tag) =>
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
    await updateCard(formData);
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
          <form
            method="dialog"
            onSubmit={handleSubmit}
          >
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={props.onClose}
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Edit Card</h3>

            <input
              type="hidden"
              name="cardId"
              value={props.card.id}
            />

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                type="text"
                name="title"
                class="input input-bordered w-full"
                value={props.card.title}
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
              >
                <option value="">Unassigned</option>
                <For each={props.users}>
                  {(user) => (
                    <option
                      value={user.id}
                      selected={user.id === props.card.assigneeId}
                    >
                      {user.name}
                    </option>
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
                  {(tag) => (
                    <button
                      type="button"
                      class="badge border-2 font-semibold cursor-pointer transition-all hover:scale-105"
                      classList={{
                        "badge-outline": !selectedTagIds().has(tag.id),
                        "text-white": selectedTagIds().has(tag.id),
                      }}
                      style={
                        selectedTagIds().has(tag.id)
                          ? `background-color: ${tag.color}; border-color: ${tag.color};`
                          : `color: ${tag.color}; border-color: ${tag.color};`
                      }
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="modal-action">
              <button
                type="button"
                class="btn btn-ghost"
                onClick={props.onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}