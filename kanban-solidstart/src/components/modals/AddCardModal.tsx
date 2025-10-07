import { createSignal, Show, For, createMemo, createEffect } from "solid-js";
import type { UsersList, TagsList } from "~/api/boards";
import { createCardAction } from "~/api/card-actions";
import { useSubmission } from "@solidjs/router";

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
  const [selectedTagIds, setSelectedTagIds] = createSignal<Set<string>>(new Set());
  const submission = useSubmission(createCardAction);
  const [submittedTagIds, setSubmittedTagIds] = createSignal<string[]>([]);

  const toggleTag = (tagId: string) => {
    const next = new Set(selectedTagIds());
    if (next.has(tagId)) {
      next.delete(tagId);
    } else {
      next.add(tagId);
    }
    setSelectedTagIds(next);
  };

  createEffect(() => {
    const result = submission.result;
    if (!result?.success) {
      return;
    }

    if (props.onCardAdd) {
      const input = submission.input as FormData | undefined;
      const title = (input?.get("title") as string) ?? "";
      const description = (input?.get("description") as string) || null;
      const assigneeId = (input?.get("assigneeId") as string) || null;
      const tagIds = submittedTagIds();
      props.onCardAdd({
        id: result.data?.id ?? "",
        title,
        description,
        assigneeId,
        tagIds,
      });
    }

    setSelectedTagIds(new Set());
    setSubmittedTagIds([]);
    submission.clear();
    props.onClose();
  });

  const errorMessage = createMemo(() => submission.error?.error ?? submission.error);
  const pending = () => submission.pending;

  const handleSubmit = () => {
    const tagIds = Array.from(selectedTagIds());
    setSubmittedTagIds(tagIds);
  };

  return (
    <Show when={props.isOpen}>
      <dialog
        class="modal modal-open !mt-0"
        onClick={(e) => {
          if (e.target === e.currentTarget && !pending()) {
            props.onClose();
          }
        }}
      >
        <div class="modal-backdrop bg-black/70" />
        <div class="modal-box bg-base-200 dark:bg-base-300">
          <form method="post" action={createCardAction} onSubmit={handleSubmit}>
            <input type="hidden" name="boardId" value={props.boardId} />
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => !pending() && props.onClose()}
              disabled={pending()}
            >
              ✕
            </button>
            <h3 class="font-bold text-lg mb-4">Add New Card</h3>

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
                placeholder="Enter card title"
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
                placeholder="Enter card description (optional)"
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
                <For each={props.users}>{(user) => <option value={user.id}>{user.name}</option>}</For>
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

            <div class="modal-action">
              <button
                type="button"
                class="btn btn-ghost"
                onClick={() => !pending() && props.onClose()}
                disabled={pending()}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" disabled={pending()}>
                {pending() ? "Adding..." : "Add Card"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}
