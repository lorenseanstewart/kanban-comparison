"use client";

import { useState, useCallback, useEffect } from "react";
import type { UsersList, TagsList } from "@/lib/api";
import { createCard } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function AddCardModal({
  boardId,
  users,
  tags,
  isOpen,
  onClose,
  onCardAdd,
}: {
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
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTagIds(new Set());
      setError(null);
    }
  }, [isOpen]);

  const toggleTag = (tagId: string) => {
    const newSet = new Set(selectedTagIds);
    if (newSet.has(tagId)) {
      newSet.delete(tagId);
    } else {
      newSet.add(tagId);
    }
    setSelectedTagIds(newSet);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;

    // Clear any existing tagIds from form data to prevent duplicates
    formData.delete("tagIds");

    // Add all selected tag IDs to form data
    selectedTagIds.forEach((tagId) => {
      formData.append("tagIds", tagId);
    });

    setError(null);
    setIsSubmitting(true);

    try {
      // Wait for server response to get the real ID
      const result = await createCard(formData);

      if (!result.success) {
        setError(result.error || "An error occurred");
        setIsSubmitting(false);
        return;
      }

      // Update UI with server-generated ID
      if (onCardAdd && result.data) {
        onCardAdd({
          id: result.data.id,
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          tagIds: Array.from(selectedTagIds),
        });
      }

      onClose();
      form.reset();
      setSelectedTagIds(new Set<string>());
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTagIds, onCardAdd, onClose, router]);

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
          <h3 className="font-bold text-lg mb-4">Add New Card</h3>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <input type="hidden" name="boardId" value={boardId} />

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              placeholder="Enter card title"
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
              placeholder="Enter card description (optional)"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Assignee</span>
            </label>
            <select name="assigneeId" className="select select-bordered w-full" disabled={isSubmitting}>
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

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
