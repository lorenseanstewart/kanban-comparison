import { useState, useEffect } from "react";
import type { BoardCard, UsersList, TagsList } from "@/lib/api";
import { updateCard, deleteCard } from "../../utils/api";

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
  onDelete?: () => void;
}) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(card.tags.map((t: { id: string }) => t.id))
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset selected tags when card changes
  useEffect(() => {
    setSelectedTagIds(new Set(card.tags.map((t: { id: string }) => t.id)));
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCard({ data: card.id });

      if (result.success) {
        if (onDelete) {
          onDelete();
        }
        onClose();
      } else {
        alert(result.error || "Failed to delete card");
        setIsDeleting(false);
      }
    } catch (error) {
      alert("Failed to delete card. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const assigneeId = formData.get("assigneeId") as string;

    // Optimistically update the UI
    if (onUpdate) {
      const updatedTags = tags.filter((tag: { id: string; name: string; color: string }) => selectedTagIds.has(tag.id));
      onUpdate({
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        tags: updatedTags,
      });
    }

    onClose();

    // Persist to server in background
    await updateCard({
      data: {
        cardId: card.id,
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        tagIds: Array.from(selectedTagIds),
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
            >
              <option value="">Select an assignee</option>
              {users.map((user: { id: string; name: string }) => (
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
              {tags.map((tag: { id: string; name: string; color: string }) => (
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
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Card"}
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}
