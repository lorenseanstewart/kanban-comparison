import { createSignal, Show, For, createMemo, createEffect } from "solid-js";
import type { BoardCard, UsersList } from "~/api/boards";
import { addCommentAction } from "~/api/card-actions";
import { useSubmission } from "@solidjs/router";

export function CommentModal(props: {
  card: BoardCard;
  users: UsersList;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdd?: (comment: { userId: string; text: string; id: string; cardId: string }) => void;
}) {
  const [selectedUserId, setSelectedUserId] = createSignal(props.users[0]?.id || "");
  const submission = useSubmission(addCommentAction);
  const [submittedComment, setSubmittedComment] = createSignal<{ userId: string; text: string } | null>(null);

  createEffect(() => {
    const result = submission.result;
    if (!result) return;

    // Only proceed if submission was successful
    if (!result.success) {
      // Error will be displayed via errorMessage() memo
      return;
    }

    const pendingComment = submittedComment();
    if (pendingComment && props.onCommentAdd) {
      props.onCommentAdd({
        userId: pendingComment.userId,
        text: pendingComment.text,
        id: result.data?.commentId ?? "",
        cardId: props.card.id,
      });
    }

    setSelectedUserId(props.users[0]?.id || "");
    setSubmittedComment(null);
    submission.clear();
    props.onClose();
  });

  const errorMessage = createMemo(() => {
    // Check submission result error first
    const result = submission.result;
    if (result && !result.success) {
      return result.error;
    }

    // Check submission.error
    if (submission.error) {
      return typeof submission.error === 'string' ? submission.error : submission.error?.error;
    }

    return null;
  });
  const pending = () => submission.pending;

  const handleSubmit = (event: SubmitEvent) => {
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const userId = (formData.get("userId") as string) || selectedUserId();
    const text = (formData.get("text") as string) || "";
    setSubmittedComment({ userId, text });
  };

  return (
    <Show when={props.isOpen}>
      <dialog
        class="modal modal-open !mt-0"
        onClick={(e) => {
          if (e.target === e.currentTarget && !pending()) props.onClose();
        }}
      >
        <div class="modal-backdrop bg-black/70" />
        <div class="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => !pending() && props.onClose()}
            disabled={pending()}
          >
            ✕
          </button>

          <h3 class="font-bold text-lg mb-4">Comments</h3>

          <Show when={errorMessage()}>
            <div class="alert alert-error mb-4">
              <span>{errorMessage()}</span>
            </div>
          </Show>

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
          <form method="post" action={addCommentAction} onSubmit={handleSubmit}>
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
                disabled={pending()}
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
                disabled={pending()}
              />
            </div>

            <div class="modal-action">
              <button type="button" class="btn btn-ghost" onClick={() => !pending() && props.onClose()} disabled={pending()}>
                Close
              </button>
              <button type="submit" class="btn btn-primary" disabled={pending()}>
                {pending() ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </Show>
  );
}