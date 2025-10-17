import { useState } from "react";
import type { BoardCard, UsersList } from "../lib/api";
import { addComment } from "../../utils/api";

export function CommentModal({
  card,
  users,
  isOpen,
  onClose,
  onCommentAdd,
}: {
  card: BoardCard;
  users: UsersList;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdd?: (comment: { userId: string; text: string }) => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const userId = formData.get("userId") as string;
    const text = formData.get("text") as string;

    // Optimistically update the UI
    if (onCommentAdd) {
      onCommentAdd({ userId, text });
    }

    onClose();

    // Reset form
    form.reset();
    setSelectedUserId(users[0]?.id || "");

    // Persist to server in background
    await addComment({
      data: {
        cardId: card.id,
        userId,
        text,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <dialog
      className="modal modal-open !mt-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-backdrop bg-black/70" />
      <div className="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4">Comments</h3>

        {/* Existing Comments */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          {card.comments.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No comments yet. Be the first to add one!
            </div>
          ) : (
            <div className="space-y-3">
              {card.comments.map((comment) => {
                const user = users.find((u) => u.id === comment.userId);
                return (
                  <div
                    key={comment.id}
                    className="bg-base-100 dark:bg-base-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-base-content">
                        {user?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-base-content/50">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80">{comment.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="cardId" value={card.id} />

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Comment as</span>
            </label>
            <select
              name="userId"
              className="select select-bordered w-full"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.currentTarget.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Your comment</span>
            </label>
            <textarea
              name="text"
              className="textarea textarea-bordered h-24 w-full"
              placeholder="Write your comment..."
              required
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn btn-primary">
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
