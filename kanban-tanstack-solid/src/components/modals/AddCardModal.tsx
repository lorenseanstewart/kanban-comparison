import { createEffect, createSignal, Show } from "solid-js";
import type { UsersList, TagsList } from "../../lib/api";
import { createCard } from "../../utils/api";
import { useRouter } from "@tanstack/solid-router";

export function AddCardModal(props: {
  boardId: string;
  users: UsersList;
  tags: TagsList;
  isOpen: boolean;
  onClose: () => void;
  onCardAdd?: (card: {
    id: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }) => void;
}) {
  const [selectedTagIds, setSelectedTagIds] = createSignal<Set<string>>(
    new Set()
  );
  const [error, setError] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const router = useRouter();

  // Reset form state when modal opens
  createEffect(() => {
    if (props.isOpen) {
      setSelectedTagIds(new Set<string>());
      setError(null);
    }
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

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;

    // Clear any existing tagIds from form data to prevent duplicates
    formData.delete("tagIds");

    // Add all selected tag IDs to form data
    selectedTagIds().forEach((tagId) => {
      formData.append("tagIds", tagId);
    });

    setError(null);
    setIsSubmitting(true);

    try {
      // Wait for server response to get the real ID
      const result = await createCard({
        data: {
          boardId: props.boardId,
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          tagIds: Array.from(selectedTagIds()),
        },
      });

      if (!result.success) {
        setError(result.error || "An error occurred");
        setIsSubmitting(false);
        return;
      }

      // Update UI with server-generated ID
      if (props.onCardAdd && result.data) {
        props.onCardAdd({
          id: result.data.id,
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          tagIds: Array.from(selectedTagIds()),
        });
      }

      props.onClose();
      form.reset();
      setSelectedTagIds(new Set<string>());
      router.invalidate();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            <h3 class="font-bold text-lg mb-4">Add New Card</h3>

            {error() && (
              <div class="alert alert-error mb-4">
                <span>{error()}</span>
              </div>
            )}

            <input type="hidden" name="boardId" value={props.boardId} />

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
                placeholder="Enter card description (optional)"
                disabled={isSubmitting()}
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Assignee</span>
              </label>
              <select
                name="assigneeId"
                class="select select-bordered w-full"
                disabled={isSubmitting()}
              >
                <option value="">Unassigned</option>
                {props.users.map((user) => (
                  <option value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Tags</span>
              </label>
              <div class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
                {props.tags.map((tag) => (
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
                ))}
              </div>
            </div>

            <div class="modal-action">
              <button
                type="button"
                class="btn btn-ghost"
                onClick={props.onClose}
                disabled={isSubmitting()}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                disabled={isSubmitting()}
              >
                {isSubmitting() ? "Adding..." : "Add Card"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}
