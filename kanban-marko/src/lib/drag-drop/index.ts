import { dragAndDrop, remapNodes } from "@formkit/drag-and-drop";
import { animations } from "@formkit/drag-and-drop";
import autoAnimate from "@formkit/auto-animate";
import type { BoardDetails } from "../api";

interface DragDropState {
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
  console.log("Initializing drag and drop for", listContainers.length, "drop zones");

  listContainers.forEach((container: Element) => {
    const listElement = container.closest("[data-list-id]");
    const listId = listElement?.getAttribute("data-list-id");

    if (!listId) {
      console.warn("No list ID found for container", container);
      return;
    }

    // If already initialized, remap the nodes to pick up new cards
    if (state.dropZoneRefs.has(listId)) {
      console.log("Remapping nodes for list", listId);
      remapNodes(container as HTMLElement);
      return;
    }

    console.log("Setting up drag and drop for list", listId);

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
        const children = Array.from(container.children);
        console.log("getValues for list", listId, "found", children.length, "children");
        return children;
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
          console.log("Drag ended");
          setDragOverListId(null);

          // Reset z-index on all cards to fix modal layering issues
          document.querySelectorAll("[data-draggable-card]").forEach((card) => {
            (card as HTMLElement).style.zIndex = "";
          });
        },

        // Handle reordering within the same list
        onSort: async ({ values }) => {
          console.log("onSort triggered for list", listId, "with", values.length, "items");
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
          queueMicrotask(() => {
            state.isUpdatingFromDrag = false;
          });

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
          console.log("onTransfer triggered");
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

          console.log("Transfer from", sourceListId, "to", targetListId, "card", cardId);

          if (!cardId || !targetListId || !sourceListId) {
            console.warn("Missing required IDs for transfer");
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
          queueMicrotask(() => {
            state.isUpdatingFromDrag = false;
          });

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
