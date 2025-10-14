"use client";

import { useState, useEffect } from "react";
import type { BoardCard, UsersList, TagsList } from "@/lib/api";
import { updateCard, deleteCard } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function CardEditModal({
  card,
  users,
  tags,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: {
  card: BoardCard;
  users: UsersList;
  tags: TagsList;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedCard: Partial<BoardCard>) => void;
  onDelete?: (cardId: string) => void;
}) {
  const router = useRouter();
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(card.tags.map((t) => t.id))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset selected tags when card changes
  useEffect(() => {
    setSelectedTagIds(new Set(card.tags.map((t) => t.id)));
    setError(null);
    setIsDeleting(false);
  }, [card]);

  const toggleTag = (tagId: string) => {
    const newSet = new Set(selectedTagIds);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;

    // Add all selected tag IDs to form data
    selectedTagIds.forEach((tagId) => {
      formData.append("tagIds", tagId);
    });

    setIsSubmitting(true);
    setError(null);

    try {
      // Persist to server
      const result = await updateCard(formData);

      if (!result.success) {
        setError(result.error || "Failed to update card");
        setIsSubmitting(false);
        return;
      }

      // Update the UI after successful server update
      if (onUpdate) {
        const updatedTags = tags.filter((tag) => selectedTagIds.has(tag.id));
        onUpdate({
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          tags: updatedTags,
        });
      }

      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCard(card.id);

      if (!result.success) {
        setError(result.error || "Failed to delete card");
        setIsDeleting(false);
        return;
      }

      // Notify parent component
      if (onDelete) {
        onDelete(card.id);
      }

      onClose();
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
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
      <div className="modal-box bg-base-200 dark:bg-base-300">
        <form method="dialog" onSubmit={handleSubmit}>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4">Edit Card</h3>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <input type="hidden" name="cardId" value={card.id} />

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              defaultValue={card.title}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              className="textarea textarea-bordered h-24 w-full"
              defaultValue={card.description || ""}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Assignee</span>
            </label>
            <select
              name="assigneeId"
              className="select select-bordered w-full"
              defaultValue={card.assigneeId || ""}
              disabled={isSubmitting}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Tags</span>
            </label>
            <div className="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`badge border-2 font-semibold cursor-pointer transition-all hover:scale-105 ${
                    selectedTagIds.has(tag.id) ? "text-white" : "badge-outline"
                  }`}
                  style={
                    selectedTagIds.has(tag.id)
                      ? {
                          backgroundColor: tag.color,
                          borderColor: tag.color,
                        }
                      : {
                          color: tag.color,
                          borderColor: tag.color,
                        }
                  }
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-action justify-between">
            <button
              type="button"
              className="btn btn-error"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Card"}
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting || isDeleting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}
