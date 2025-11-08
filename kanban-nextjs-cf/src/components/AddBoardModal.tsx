"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddBoardModal({
  onBoardAdd,
}: {
  onBoardAdd?: (board: { id: string; title: string; description: string | null }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setError(null);
    setIsSubmitting(true);

    try {
      // Call API route
      const response = await fetch('/api/boards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
        }),
      });

      const result = await response.json() as { success: boolean; error?: string; data?: { id: string; title: string; description: string | null } };

      if (!result.success) {
        setError(result.error || "An error occurred");
        setIsSubmitting(false);
        return;
      }

      // Update UI with server-generated ID
      if (onBoardAdd && result.data) {
        onBoardAdd({
          id: result.data.id,
          title: result.data.title,
          description: result.data.description ?? null,
        });
      }

      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Add Board
      </button>

      {isOpen && (
        <dialog
          className="modal modal-open !mt-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="modal-backdrop bg-black/70" />
          <div className="modal-box bg-base-200 dark:bg-base-300">
            <form method="dialog" onSubmit={handleSubmit}>
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
              <h3 className="font-bold text-lg mb-4">Add New Board</h3>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="Enter board title"
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
                  placeholder="Enter board description (optional)"
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Board"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
}
