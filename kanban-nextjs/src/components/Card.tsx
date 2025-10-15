"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardCard, UsersList, TagsList } from "@/lib/api";
import { EditPencil } from "./icons/EditPencil";
import { Plus } from "./icons/Plus";
import { CardEditModal } from "./modals/CardEditModal";
import { CommentModal } from "./modals/CommentModal";

interface CardProps {
  card: BoardCard;
  allUsers: UsersList;
  allTags: TagsList;
  onCardUpdate?: (cardId: string, updates: Partial<BoardCard>) => void;
}

export function Card({ card, allUsers, allTags, onCardUpdate }: CardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  const handleUpdate = (updates: Partial<BoardCard>) => {
    if (onCardUpdate) {
      onCardUpdate(card.id, updates);
    }
  };

  const handleCommentAdd = (comment: { userId: string; text: string }) => {
    if (onCardUpdate) {
      const newComment = {
        id: crypto.randomUUID(),
        userId: comment.userId,
        text: comment.text,
        createdAt: new Date(),
      };
      onCardUpdate(card.id, {
        comments: [...card.comments, newComment],
      });
    }
  };

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        className="card bg-base-100 dark:bg-neutral shadow-lg transition-all duration-300 ease-in-out"
        {...attributes}
      >
      <div className="card-body gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="card-title text-lg text-base-content cursor-grab active:cursor-grabbing flex-1"
            {...listeners}
          >
            {card.title}
          </h3>
          {card.completed && (
            <span className="badge badge-success badge-outline">Done</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <EditPencil />
          </button>
        </div>

        {card.assigneeId && (
          <div className="badge badge-outline badge-secondary badge-sm">
            Assigned to{" "}
            {allUsers.find((u) => u.id === card.assigneeId)?.name ??
              "Unassigned"}
          </div>
        )}

        {card.description && (
          <p className="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
            {card.description}
          </p>
        )}

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100">
            {card.tags.map((tag) => (
              <span
                key={tag.id}
                className="badge border-0 shadow font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {card.comments && card.comments.length === 0 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-base-content/50">
              Comments
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCommentModalOpen(true);
              }}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <Plus />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-base-content/50">
                Comments
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <Plus />
              </button>
            </div>
            <ul className="space-y-1 text-sm text-base-content/70">
              {card.comments?.map((comment) => (
                <li key={comment.id}>
                  <span className="font-semibold text-base-content">
                    {allUsers.find((u) => u.id === comment.userId)?.name ??
                      "Unknown"}
                    :
                  </span>{" "}
                  {comment.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
    <CardEditModal
      card={card}
      users={allUsers}
      tags={allTags}
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      onUpdate={handleUpdate}
    />
    <CommentModal
      card={card}
      users={allUsers}
      isOpen={isCommentModalOpen}
      onClose={() => setIsCommentModalOpen(false)}
      onCommentAdd={handleCommentAdd}
    />
    </>
  );
}
