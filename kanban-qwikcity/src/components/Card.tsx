import { component$, useSignal, $, useContext, type QRL } from "@builder.io/qwik";
import type { ActionStore } from "@builder.io/qwik-city";
import type { BoardCard, UsersList, TagsList } from "~/db/queries";
import { EditPencil } from "./icons/EditPencil";
import { Plus } from "./icons/Plus";
import { CardEditModal } from "./modals/CardEditModal";
import { CommentModal } from "./modals/CommentModal";
import { DraggedCardContext } from "~/routes/board/[id]/index";

interface CardProps {
  card: BoardCard;
  users: UsersList | undefined;
  allUsers: UsersList;
  allTags: TagsList;
  onCardUpdate?: QRL<(cardId: string, updates: Partial<BoardCard>) => void>;
  updateCardAction?: ActionStore<any, any, true>;
  createCommentAction?: ActionStore<any, any, true>;
}

export const Card = component$<CardProps>(({ card, users, allUsers, allTags, onCardUpdate, updateCardAction, createCommentAction }) => {
  const isEditModalOpen = useSignal(false);
  const isCommentModalOpen = useSignal(false);
  const draggedCardId = useContext(DraggedCardContext);

  const handleEditClick$ = $((e: MouseEvent) => {
    e.stopPropagation();
    isEditModalOpen.value = true;
  });

  const handleCommentClick$ = $((e: MouseEvent) => {
    e.stopPropagation();
    isCommentModalOpen.value = true;
  });

  const handleUpdate$ = $((updates: Partial<BoardCard>) => {
    if (onCardUpdate) {
      onCardUpdate(card.id, updates);
    }
  });

  const handleCommentAdd$ = $((comment: { userId: string; text: string }) => {
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
  });

  return (
    <>
      <article
        draggable={true}
        data-id={card.id}
        class="card bg-base-100 dark:bg-neutral shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out"
        style={{ viewTransitionName: `card-${card.id}` }}
        onDragStart$={$((event: DragEvent) => {
          const target = event.target as HTMLElement;
          const cardId = target.getAttribute("data-id");
          if (cardId) {
            draggedCardId.value = cardId;
          }
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
          }
        })}
      >
        <div class="card-body gap-3 p-4">
          <div class="flex items-start justify-between gap-2">
            <h3 class="card-title text-lg text-base-content">{card.title}</h3>
            {card.completed && (
              <span class="badge badge-success badge-outline">Done</span>
            )}
            <button
              type="button"
              onClick$={handleEditClick$}
              class="btn btn-ghost btn-xs btn-circle"
            >
              <EditPencil />
            </button>
          </div>

          {card.assigneeId && (
            <div class="badge badge-outline badge-secondary badge-sm">
              Assigned to{" "}
              {users?.find((u) => u.id === card.assigneeId)?.name ?? "Unassigned"}
            </div>
          )}

          {card.description && (
            <p class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
              {card.description}
            </p>
          )}

          {card.tags.length > 0 && (
            <div class="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100">
              {card.tags.map((tag) => (
                <span
                  key={tag.id}
                  class="badge border-0 shadow font-semibold text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {card.comments.length === 0 ? (
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-base-content/50">Comments</p>
              <button
                type="button"
                onClick$={handleCommentClick$}
                class="btn btn-ghost btn-xs btn-circle"
              >
                <Plus />
              </button>
            </div>
          ) : (
            <div class="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner relative">
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold text-base-content/50">Comments</p>
                <button
                  type="button"
                  onClick$={handleCommentClick$}
                  class="btn btn-ghost btn-xs btn-circle"
                >
                  <Plus />
                </button>
              </div>
              <ul class="space-y-1 text-sm text-base-content/70">
                {card.comments.map((comment) => (
                  <li key={comment.id}>
                    <span class="font-semibold text-base-content">
                      {users?.find((u) => u.id === comment.userId)?.name ?? "Unknown"}
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
      {updateCardAction && (
        <CardEditModal
          card={card}
          users={allUsers}
          tags={allTags}
          isOpen={isEditModalOpen}
          action={updateCardAction}
          onUpdate={handleUpdate$}
        />
      )}
      {createCommentAction && (
        <CommentModal
          card={card}
          users={allUsers}
          isOpen={isCommentModalOpen}
          action={createCommentAction}
          onCommentAdd={handleCommentAdd$}
        />
      )}
    </>
  );
});
