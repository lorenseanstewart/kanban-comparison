import { createSignal, Show, For, createMemo, createEffect } from "solid-js";
import type { BoardCard, UsersList, TagsList } from "~/api/boards";
import { updateCardAction, deleteCardAction } from "~/api/card-actions";
import { useSubmission, useNavigate } from "@solidjs/router";

export function CardEditModal(props: {
  card: BoardCard;
  users: UsersList;
  tags: TagsList;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedCard: Partial<BoardCard>) => void;
  onDelete?: (cardId: string) => void;
  boardId?: string;
}) {
  const navigate = useNavigate();
  const [selectedTagIds, setSelectedTagIds] = createSignal<Set<string>>(
    new Set(props.card.tags.map((t) => t.id))
  );
  const submission = useSubmission(updateCardAction);
  const deleteSubmission = useSubmission(deleteCardAction);

  createEffect(() => {
    const result = submission.result;
    if (!result?.success) return;

    if (props.onUpdate) {
      const updatedTags = props.tags.filter((tag) => selectedTagIds().has(tag.id));
      const input = submission.input?.[0] as FormData | undefined;
      props.onUpdate({
        title: (input?.get("title") as string) ?? props.card.title,
        description: (input?.get("description") as string) || null,
        assigneeId: ((input?.get("assigneeId") as string) || "") || null,
        tags: updatedTags,
      });
    }

    submission.clear();
    props.onClose();
  });

  createEffect(() => {
    const result = deleteSubmission.result;
    if (!result?.success) return;

    if (props.onDelete) {
      props.onDelete(props.card.id);
    }

    deleteSubmission.clear();
    props.onClose();
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
    await deleteCardAction(props.card.id);
  };

  const errorMessage = createMemo(() => submission.error?.error ?? submission.error ?? deleteSubmission.error?.error ?? deleteSubmission.error);
  const pending = () => submission.pending || deleteSubmission.pending;

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
          <form method="post" action={updateCardAction}>
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={props.onClose}
              disabled={pending()}
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Edit Card</h3>

            <Show when={errorMessage()}>
              <div class="alert alert-error mb-4">
                <span>{errorMessage()}</span>
              </div>
            </Show>

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
                value={props.card.description || ""}
                disabled={pending()}
              />
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Assignee</span>
              </label>
              <select
                name="assigneeId"
                class="select select-bordered w-full"
                disabled={pending()}
              >
                <option value="">Unassigned</option>
                <For each={props.users}>
                  {(user) => (
                    <option value={user.id} selected={user.id === props.card.assigneeId}>
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
                      disabled={pending()}
                    >
                      {tag.name}
                    </button>
                  )}
                </For>
              </div>
              <For each={Array.from(selectedTagIds())}>
                {(tagId) => <input type="hidden" name="tagIds" value={tagId} />}
              </For>
            </div>

            <div class="modal-action justify-between">
              <button
                type="button"
                class="btn btn-error"
                onClick={handleDelete}
                disabled={pending()}
              >
                {deleteSubmission.pending ? "Deleting..." : "Delete Card"}
              </button>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="btn btn-ghost"
                  onClick={props.onClose}
                  disabled={pending()}
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" disabled={pending()}>
                  {submission.pending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}