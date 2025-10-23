import type { BoardCard, UsersList, TagsList } from "../lib/api";
import { EditPencil } from "./icons/EditPencil";
import { Plus } from "./icons/Plus";
import { CardEditModal } from "./modals/CardEditModal";
import { CommentModal } from "./modals/CommentModal";
import { createSignal } from "solid-js";
import { createDraggable, createDroppable } from "@thisbeyond/solid-dnd";

interface CardProps {
  card: BoardCard;
  allUsers: UsersList;
  allTags: TagsList;
  onCardUpdate?: (cardId: string, updates: Partial<BoardCard>) => void;
  onCardDelete?: (cardId: string) => void;
}

export function Card(props: CardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = createSignal(false);

  // Make this card draggable and droppable (can drop other cards on it)
  const draggable = createDraggable(props.card.id);
  const droppable = createDroppable(props.card.id);

  const handleUpdate = (updates: Partial<BoardCard>) => {
    if (props.onCardUpdate) {
      props.onCardUpdate(props.card.id, updates);
    }
  };

  const handleDelete = () => {
    if (props.onCardDelete) {
      props.onCardDelete(props.card.id);
    }
  };

  const handleCommentAdd = (comment: { userId: string; text: string }) => {
    if (props.onCardUpdate) {
      const newComment = {
        id: crypto.randomUUID(),
        userId: comment.userId,
        text: comment.text,
        createdAt: new Date(),
      };
      props.onCardUpdate(props.card.id, {
        comments: [...props.card.comments, newComment],
      });
    }
  };

  return (
    <>
      <article
        ref={(el) => {
          draggable(el);
          droppable(el);
        }}
        class="card bg-base-100 dark:bg-neutral shadow-lg transition-all duration-300 ease-in-out"
        classList={{
          "opacity-25": draggable.isActiveDraggable,
        }}
      >
        <div class="card-body gap-3 p-4">
          <div class="flex items-start justify-between gap-2">
            <h3 class="card-title text-lg text-base-content cursor-grab active:cursor-grabbing flex-1">
              {props.card.title}
            </h3>
            {props.card.completed && (
              <span class="badge badge-success badge-outline">Done</span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              class="btn btn-ghost btn-xs btn-circle"
            >
              <EditPencil />
            </button>
          </div>

          {props.card.assigneeId && (
            <div class="badge badge-outline badge-secondary badge-sm">
              Assigned to{" "}
              {props.allUsers.find((u) => u.id === props.card.assigneeId)
                ?.name ?? "Unassigned"}
            </div>
          )}

          {props.card.description && (
            <p class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
              {props.card.description}
            </p>
          )}

          {props.card.tags.length > 0 && (
            <div class="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100">
              {props.card.tags.map((tag) => (
                <span
                  class="badge border-0 shadow font-semibold text-white"
                  style={{ "background-color": tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {props.card.comments && props.card.comments.length === 0 ? (
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-base-content/50">Comments</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                class="btn btn-ghost btn-xs btn-circle"
              >
                <Plus />
              </button>
            </div>
          ) : (
            <div class="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner relative">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-base-content/50">
                  Comments
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCommentModalOpen(true);
                  }}
                  class="btn btn-ghost btn-xs btn-circle"
                >
                  <Plus />
                </button>
              </div>
              <ul class="space-y-1 text-sm text-base-content/70">
                {props.card.comments?.map((comment) => (
                  <li>
                    <span class="font-semibold text-base-content">
                      {props.allUsers.find((u) => u.id === comment.userId)
                        ?.name ?? "Unknown"}
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
        card={props.card}
        users={props.allUsers}
        tags={props.allTags}
        isOpen={isEditModalOpen()}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <CommentModal
        card={props.card}
        users={props.allUsers}
        isOpen={isCommentModalOpen()}
        onClose={() => setIsCommentModalOpen(false)}
        onCommentAdd={handleCommentAdd}
      />
    </>
  );
}
