import { dragAndDrop, remapNodes } from "@formkit/drag-and-drop";
import { animations } from "@formkit/drag-and-drop";
import autoAnimate from "@formkit/auto-animate";
import type { BoardDetails } from "../api";

export interface DragDropState {
  dropZoneRefs: Map<string, Element>;
  isUpdatingFromDrag: boolean;
}

export function createDragDropState(): DragDropState {
  return {
    dropZoneRefs: new Map(),
    isUpdatingFromDrag: false,
  };
}

export function initializeDragAndDrop(
  state: DragDropState,
  getBoard: () => BoardDetails,
  setBoard: (board: BoardDetails) => void,
  setDragOverListId: (id: string | null) => void
) {
  // Don't re-initialize if we're in the middle of a drag state update
  if (state.isUpdatingFromDrag) return;

  const listContainers = document.querySelectorAll("[data-drop-zone]");

  listContainers.forEach((container: Element) => {
    const listElement = container.closest("[data-list-id]");
    const listId = listElement?.getAttribute("data-list-id");

    if (!listId) {
      return;
    }

    // If already initialized, remap the nodes to pick up new cards
    if (state.dropZoneRefs.has(listId)) {
      remapNodes(container as HTMLElement);
      return;
    }

    // Set up a MutationObserver to watch for new cards being added
    const observer = new MutationObserver((mutations) => {
      // Only remap if we're not in a drag operation and nodes were actually added
      if (!state.isUpdatingFromDrag) {
        const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
        if (hasAddedNodes) {
          remapNodes(container as HTMLElement);
        }
      }
    });
    observer.observe(container, { childList: true });


    // Mark as initialized
    state.dropZoneRefs.set(listId, container);

    // Enable auto-animate for smooth card transitions
    autoAnimate(container as HTMLElement);

    // Add native dragover/dragleave event listeners for visual feedback
    const listEl = container.closest("[data-list-id]");
    const currentListId = listEl?.getAttribute("data-list-id");

    const handleDragOver = (e: Event) => {
      e.preventDefault();
      if (currentListId) {
        setDragOverListId(currentListId);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      // Only clear if we're leaving the container and not entering a child
      const rect = (container as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Check if the mouse is outside the container bounds
      if (
        x < rect.left ||
        x >= rect.right ||
        y < rect.top ||
        y >= rect.bottom
      ) {
        setDragOverListId(null);
      }
    };

    // Add listeners to the container
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave as EventListener);

    // Also add dragover to all cards in this list so they trigger the parent's hover state
    const cards = container.querySelectorAll("[data-draggable-card]");
    cards.forEach((card) => {
      card.addEventListener("dragover", handleDragOver);
    });

    dragAndDrop({
      parent: container as HTMLElement,

      getValues: () => {
        // Return all direct children - library needs exact match
        return Array.from(container.children);
      },

      setValues: () => {
        // The library handles DOM updates automatically
        // This function is required but can be empty
      },

      config: {
        group: "board",
        sortable: true,
        dropZone: true,
        plugins: [animations()],

        handleEnd: () => {
          // Clear hover state when drag ends
          setDragOverListId(null);

          // Reset z-index on all cards to fix modal layering issues
          document.querySelectorAll("[data-draggable-card]").forEach((card) => {
            (card as HTMLElement).style.zIndex = "";
          });
        },

        // Handle reordering within the same list
        onSort: async ({ values }) => {
          // Skip if we're already updating from a drag operation (like onTransfer)
          if (state.isUpdatingFromDrag) {
            return;
          }

          const cardIds = values
            .map((el) => (el as HTMLElement).getAttribute("data-card-id"))
            .filter((id): id is string => id !== null);

          // Update client state to reflect the new order
          state.isUpdatingFromDrag = true;

          // Get the current board state
          const currentBoard = getBoard();
          const updatedBoard: BoardDetails = {
            ...currentBoard,
            lists: currentBoard.lists.map((list) => {
              if (list.id === currentListId) {
                // Reorder cards based on the new cardIds order
                const reorderedCards = cardIds
                  .map((cardId) =>
                    list.cards.find((card) => card.id === cardId)
                  )
                  .filter(
                    (card): card is NonNullable<typeof card> =>
                      card !== undefined
                  );

                return {
                  ...list,
                  cards: reorderedCards,
                };
              }
              return list;
            }),
          };

          setBoard(updatedBoard);

          // Allow re-initialization after state update completes
          setTimeout(() => {
            state.isUpdatingFromDrag = false;
          }, 100);

          // Persist to server
          try {
            await fetch("/api/cards/reorder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cardIds }),
            });
          } catch (error) {
            console.error("Failed to update card positions:", error);
          }
        },

        // Handle moving cards between lists
        onTransfer: async ({ sourceParent, targetParent, draggedNodes }) => {
          // Prevent duplicate calls during the same drag operation
          if (state.isUpdatingFromDrag) {
            return;
          }

          let sourceListEl: HTMLElement | null = sourceParent.el.parentElement;
          while (sourceListEl && !sourceListEl.hasAttribute("data-list-id")) {
            sourceListEl = sourceListEl.parentElement;
          }

          let targetListEl: HTMLElement | null = targetParent.el.parentElement;
          while (targetListEl && !targetListEl.hasAttribute("data-list-id")) {
            targetListEl = targetListEl.parentElement;
          }

          const sourceListId = sourceListEl?.getAttribute("data-list-id");
          const targetListId = targetListEl?.getAttribute("data-list-id");
          const cardId = draggedNodes[0]?.el.getAttribute("data-card-id");

          if (!cardId || !targetListId || !sourceListId) {
            return;
          }

          // Update client state to sync with the DOM that the library already moved
          state.isUpdatingFromDrag = true;

          // Get the current board state
          const currentBoard = getBoard();

          // Find the card data and move it between lists in state
          let movedCard: BoardDetails["lists"][number]["cards"][number] | null =
            null;
          let updatedBoard: BoardDetails = {
            ...currentBoard,
            lists: currentBoard.lists.map((list) => {
              if (list.id === sourceListId) {
                // Remove card from source list
                const cardToMove = list.cards.find((c) => c.id === cardId);
                if (cardToMove) movedCard = cardToMove;
                return {
                  ...list,
                  cards: list.cards.filter((c) => c.id !== cardId),
                };
              }
              return list;
            }),
          };

          // Add card to target list
          if (movedCard) {
            updatedBoard = {
              ...updatedBoard,
              lists: updatedBoard.lists.map((list) => {
                if (list.id === targetListId) {
                  return {
                    ...list,
                    cards: [...list.cards, movedCard!],
                  };
                }
                return list;
              }),
            };
          }

          setBoard(updatedBoard);

          // Allow re-initialization after state update completes
          // Use setTimeout to give the drag-and-drop library time to finish all DOM updates
          setTimeout(() => {
            state.isUpdatingFromDrag = false;
          }, 100);

          // Persist to server
          try {
            await fetch("/api/cards/move", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cardId, targetListId }),
            });
          } catch (error) {
            console.error("Failed to move card:", error);
          }
        },
      },
    });
  });
}
