import { dragAndDrop } from "@formkit/drag-and-drop";
import { animations } from "@formkit/drag-and-drop";
import autoAnimate from "@formkit/auto-animate";

/**
 * Extract drag-and-drop values from event for HTMX request
 */
export function getDragDropValues(event: any): Record<string, any> {
  const vals: Record<string, any> = {};
  // Only process if event.detail exists (drag-and-drop events)
  if (!event || !event.detail) return vals;

  if (event.detail.cardIds)
    vals.cardIds = JSON.stringify(event.detail.cardIds);
  if (event.detail.listId) vals.listId = event.detail.listId;
  if (event.detail.cardId) vals.cardId = event.detail.cardId;
  if (event.detail.sourceListId)
    vals.sourceListId = event.detail.sourceListId;
  if (event.detail.targetListId)
    vals.targetListId = event.detail.targetListId;
  return vals;
}

/**
 * Initialize drag-and-drop functionality for all drop zones
 */
export function initializeDragAndDrop(): void {
  const dropZones = Array.from(document.querySelectorAll("[data-drop-zone]"));

  // Track which list is being dragged over (shared across all drop zones)
  let dragOverListId: string | null = null;

  // Track if we're in the middle of a transfer to prevent duplicate calls
  // This must be shared across all drop zones
  let isTransferring = false;
  let transferTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialize drag-and-drop for each drop zone
  dropZones.forEach((container) => {
    const listElement = container.closest("[data-list-id]");
    const listId = listElement?.getAttribute("data-list-id");

    if (!listId) return;

    // Enable auto-animate for smooth card transitions
    autoAnimate(container as HTMLElement);

    // Add hover state listeners with proper boundary checking
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (dragOverListId !== listId) {
        dragOverListId = listId;
        container.classList.add(
          "ring-4",
          "ring-primary",
          "ring-offset-2",
          "bg-primary/5",
          "scale-[1.02]"
        );
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      // Check if we're actually leaving the container bounds
      const rect = container.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (
        x < rect.left ||
        x >= rect.right ||
        y < rect.top ||
        y >= rect.bottom
      ) {
        dragOverListId = null;
        container.classList.remove(
          "ring-4",
          "ring-primary",
          "ring-offset-2",
          "bg-primary/5",
          "scale-[1.02]"
        );
      }
    };

    container.addEventListener("dragover", handleDragOver as EventListener);
    container.addEventListener("dragleave", handleDragLeave as EventListener);

    // Also add dragover to all cards so they trigger the parent's hover state
    const cards = container.querySelectorAll("[data-draggable-card]");
    cards.forEach((card) => {
      card.addEventListener("dragover", handleDragOver as EventListener);
    });

    // Initialize drag-and-drop with separate handlers for sort and transfer
    dragAndDrop({
      parent: container as HTMLElement,
      getValues: () => {
        // Return all direct children - library needs exact match
        return Array.from(container.children);
      },
      setValues: () => {
        // The library handles DOM updates automatically
        // This function is required but can be empty - we just let the library work
      },
      config: {
        group: "board",
        sortable: true,
        dropZone: true,
        plugins: [animations()],
        handleEnd: () => {
          // Clear hover state when drag ends
          dragOverListId = null;
          document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
            zone.classList.remove(
              "ring-4",
              "ring-primary",
              "ring-offset-2",
              "bg-primary/5",
              "scale-[1.02]"
            );
          });

          // Update placeholders for all lists after drag completes
          document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
            requestAnimationFrame(() => {
              const cards = zone.querySelectorAll(
                "[data-draggable-card]"
              ).length;
              const placeholder = zone.querySelector(".empty-placeholder");
              if (placeholder) {
                (placeholder as HTMLElement).style.display =
                  cards > 0 ? "none" : "block";
              }
            });
          });
        },
        // Handle reordering within the same list
        onSort: async ({ values }: { values: any[] }) => {
          // Skip if we're in the middle of a transfer
          // (onTransfer handles the persistence)
          if (isTransferring) {
            return;
          }

          const cardIds = values
            .map((el: any) => el.getAttribute("data-card-id"))
            .filter((id): id is string => id !== null);

          // Dispatch custom event with reorder data
          container.dispatchEvent(
            new CustomEvent("reorder", {
              bubbles: true,
              detail: { cardIds, listId },
            })
          );
        },
        // Handle moving cards between lists
        onTransfer: async ({
          sourceParent,
          targetParent,
          draggedNodes,
        }: {
          sourceParent: any;
          targetParent: any;
          draggedNodes: any[];
        }) => {
          // Prevent duplicate calls - onTransfer can fire multiple times
          if (isTransferring) {
            return;
          }

          isTransferring = true;

          // Clear any existing timeout
          if (transferTimeout) {
            clearTimeout(transferTimeout);
          }

          let sourceListEl: HTMLElement | null =
            sourceParent.el.parentElement;
          while (sourceListEl && !sourceListEl.hasAttribute("data-list-id")) {
            sourceListEl = sourceListEl.parentElement;
          }

          let targetListEl: HTMLElement | null =
            targetParent.el.parentElement;
          while (targetListEl && !targetListEl.hasAttribute("data-list-id")) {
            targetListEl = targetListEl.parentElement;
          }

          const sourceListId = sourceListEl?.getAttribute("data-list-id");
          const targetListId = targetListEl?.getAttribute("data-list-id");
          const cardId = draggedNodes[0]?.el.getAttribute("data-card-id");

          if (!cardId || !targetListId || !sourceListId) {
            isTransferring = false;
            return;
          }

          // Dispatch custom event with transfer data
          targetParent.el.dispatchEvent(
            new CustomEvent("cardTransfer", {
              bubbles: true,
              detail: { cardId, sourceListId, targetListId },
            })
          );

          // Reset flag after a short delay
          transferTimeout = setTimeout(() => {
            isTransferring = false;
            transferTimeout = null;
          }, 200);
        },
      },
    });
  });
}

/**
 * Handler for HTMX after-swap event
 */
export function handleAfterSwap(event: any): void {
  if (event.detail.target.id === "board-cards-section") {
    initializeDragAndDrop();
  }
}
