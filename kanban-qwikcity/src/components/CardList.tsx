import { component$, useSignal, $, useContext, type QRL } from "@builder.io/qwik";
import type { ActionStore } from "@builder.io/qwik-city";
import type { BoardList, BoardCard, UsersList, TagsList } from "~/db/queries";
import { Card } from "./Card";
import { DraggedCardContext } from "~/routes/board/[id]/index";

interface CardListProps {
  list: BoardList;
  users: UsersList | undefined;
  allUsers: UsersList;
  allTags: TagsList;
  onCardUpdate?: QRL<(cardId: string, updates: Partial<BoardCard>) => void>;
  onCardDrop?: QRL<(cardId: string, targetListId: string, newPosition: number) => void>;
  updateCardAction?: ActionStore<any, any, true>;
  createCommentAction?: ActionStore<any, any, true>;
}

export const CardList = component$<CardListProps>(({
  list,
  users,
  allUsers,
  allTags,
  onCardUpdate,
  onCardDrop,
  updateCardAction,
  createCommentAction
}) => {
  const draggedCardId = useContext(DraggedCardContext);
  const isDragOver = useSignal(false);

  const handleDrop = $((event: DragEvent, target: HTMLElement) => {
    event.preventDefault();
    const cardId = draggedCardId.value;

    if (!cardId || !onCardDrop) {
      return;
    }

    // Remove drag-over styling from the element
    if (target && target.classList) {
      target.classList.remove("drag-over");
    }

    // Get the drop zone element
    const dropZone = target.querySelector(".drop-zone");
    if (!dropZone) {
      return;
    }

    // Calculate drop position
    let targetPosition = list.cards.length;

    // Find the card element that was dropped on
    const afterElement = getDragAfterElement(dropZone as HTMLElement, event.clientY);

    if (afterElement) {
      const afterCardId = afterElement.getAttribute("data-id");
      const afterCardIndex = list.cards.findIndex((c) => c.id === afterCardId);
      if (afterCardIndex !== -1) {
        targetPosition = afterCardIndex;
      }
    }

    // Trigger the callback to update the card
    onCardDrop(cardId, list.id, targetPosition);

    // Clear the dragged card context and drag over state
    draggedCardId.value = "";
    isDragOver.value = false;
  });

  const handleDragOver = $((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    isDragOver.value = true;
  });

  const handleDragLeave = $(() => {
    isDragOver.value = false;
  });

  return (
    <section
      class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl"
      onDragOver$={handleDragOver}
      onDragLeave$={handleDragLeave}
      onDrop$={handleDrop}
    >
      <div class="card-body gap-4">
        <header class="flex items-center justify-between">
          <h2 class="card-title text-base-content">{list.title}</h2>
          <div class="badge badge-primary badge-outline badge-lg shadow">
            {list.cards.length} cards
          </div>
        </header>

        <div
          class={`drop-zone min-h-[200px] transition-all duration-200 rounded-lg ${
            isDragOver.value
              ? "ring-4 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]"
              : ""
          }`}
        >
          {list.cards.length === 0 ? (
            <div class="alert alert-info text-sm">
              <span>No cards yet</span>
            </div>
          ) : (
            <div class="space-y-3">
              {list.cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  users={users}
                  allUsers={allUsers}
                  allTags={allTags}
                  onCardUpdate={onCardUpdate}
                  updateCardAction={updateCardAction}
                  createCommentAction={createCommentAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

// Helper function to determine which card element the dragged item is after
function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
  const draggableElements = Array.from(
    container.querySelectorAll('[data-id]:not(.dragging)')
  ) as HTMLElement[];

  return draggableElements.reduce<{ offset: number; element: HTMLElement | null }>(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}
