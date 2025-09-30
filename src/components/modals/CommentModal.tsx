import { createSignal, Show, For } from "solid-js";
import type { BoardCard, UsersList } from "~/api/boards";
import { addComment } from "~/api/card-actions";

export function CommentModal(props: {
  card: BoardCard;
  users: UsersList;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdd?: (comment: { userId: string; text: string }) => void;
}) {
  const [selectedUserId, setSelectedUserId] = createSignal(props.users[0]?.id || "");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const userId = formData.get("userId") as string;
    const text = formData.get("text") as string;

    // Optimistically update the UI
    if (props.onCommentAdd) {
      props.onCommentAdd({ userId, text });
    }

    props.onClose();

    // Reset form
    form.reset();
    setSelectedUserId(props.users[0]?.id || "");

    // Persist to server in background
    await addComment(formData);
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
        <div class="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={props.onClose}
          >
            ✕
          </button>

          <h3 class="font-bold text-lg mb-4">Comments</h3>

          {/* Existing Comments */}
          <div class="mb-6 max-h-96 overflow-y-auto">
            <Show
              when={props.card.comments.length > 0}
              fallback={
                <div class="text-center py-8 text-base-content/60">
                  No comments yet. Be the first to add one!
                </div>
              }
            >
              <div class="space-y-3">
                <For each={props.card.comments}>
                  {(comment) => {
                    const user = props.users.find((u) => u.id === comment.userId);
                    return (
                      <div class="bg-base-100 dark:bg-base-200 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="font-semibold text-base-content">
                            {user?.name || "Unknown"}
                          </span>
                          <span class="text-xs text-base-content/50">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p class="text-sm text-base-content/80">{comment.text}</p>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="cardId" value={props.card.id} />

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">Comment as</span>
              </label>
              <select
                name="userId"
                class="select select-bordered w-full"
                value={selectedUserId()}
                onChange={(e) => setSelectedUserId(e.currentTarget.value)}
              >
                <For each={props.users}>
                  {(user) => <option value={user.id}>{user.name}</option>}
                </For>
              </select>
            </div>

            <div class="form-control w-full mt-4">
              <label class="label">
                <span class="label-text">Your comment</span>
              </label>
              <textarea
                name="text"
                class="textarea textarea-bordered h-24 w-full"
                placeholder="Write your comment..."
                required
              />
            </div>

            <div class="modal-action">
              <button type="button" class="btn btn-ghost" onClick={props.onClose}>
                Close
              </button>
              <button type="submit" class="btn btn-primary">
                Add Comment
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}