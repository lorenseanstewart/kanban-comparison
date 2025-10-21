import { dragAndDrop, remapNodes } from '@formkit/drag-and-drop'
import { animations } from '@formkit/drag-and-drop'
import autoAnimate from '@formkit/auto-animate'
import type { Ref } from 'vue'

export interface DragDropState {
  dropZoneRefs: Map<string, Element>
  isUpdatingFromDrag: Ref<boolean>
  lastTransferTime: Ref<number>
  dragOverListId: Ref<string | null>
}

export function initializeDragAndDrop(
  state: DragDropState,
  boardValue: any,
  updateBoard: (updater: (board: any) => any) => void,
  onReorder: (cardIds: string[], listId: string) => Promise<void>,
  onMove: (cardId: string, targetListId: string) => Promise<void>
) {
  if (state.isUpdatingFromDrag.value) return

  const listContainers = document.querySelectorAll('[data-drop-zone]')

  listContainers.forEach((container: Element) => {
    const listElement = container.closest('[data-list-id]')
    const listId = listElement?.getAttribute('data-list-id')

    if (!listId) return

    // If already initialized, remap the nodes to pick up new cards
    if (state.dropZoneRefs.has(listId)) {
      remapNodes(container as HTMLElement)
      return
    }

    // Mark as initialized
    state.dropZoneRefs.set(listId, container)

    // Enable auto-animate for smooth card transitions
    autoAnimate(container as HTMLElement)

    // Add native dragover/dragleave event listeners for visual feedback
    const handleDragOver = (e: Event) => {
      e.preventDefault()
      state.dragOverListId.value = listId
    }

    const handleDragLeave = (e: DragEvent) => {
      const rect = (container as HTMLElement).getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY

      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        state.dragOverListId.value = null
      }
    }

    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('dragleave', handleDragLeave as EventListener)

    // Initialize drag-and-drop
    dragAndDrop({
      parent: container as HTMLElement,
      getValues: () => Array.from(container.children),
      setValues: () => {
        // The library handles DOM updates automatically
      },
      config: {
        group: 'board',
        sortable: true,
        dropZone: true,
        plugins: [animations()],
        handleEnd: () => {
          state.dragOverListId.value = null
        },
        // Handle reordering within the same list
        onSort: async ({ values }) => {
          if (state.isUpdatingFromDrag.value) return

          // Skip if this is happening right after a transfer
          const timeSinceTransfer = Date.now() - state.lastTransferTime.value
          if (timeSinceTransfer < 500) return

          state.isUpdatingFromDrag.value = true

          const cardIds = values
            .map((el) => (el as HTMLElement).getAttribute('data-card-id'))
            .filter((id): id is string => id !== null)

          // Optimistically update state
          updateBoard((board) => {
            const updatedLists = board.lists.map((list: any) => {
              if (list.id === listId) {
                const reorderedCards = cardIds
                  .map((cardId) => list.cards.find((card: any) => card.id === cardId))
                  .filter((card: any): card is NonNullable<typeof card> => card !== undefined)
                return { ...list, cards: reorderedCards }
              }
              return list
            })
            return { ...board, lists: updatedLists }
          })

          queueMicrotask(() => {
            state.isUpdatingFromDrag.value = false
          })

          // Persist to server in background
          await onReorder(cardIds, listId)
        },
        // Handle moving cards between lists
        onTransfer: async ({ sourceParent, targetParent, draggedNodes }) => {
          if (state.isUpdatingFromDrag.value) return

          state.isUpdatingFromDrag.value = true

          // Find the source and target list IDs
          let sourceListEl: HTMLElement | null = sourceParent.el.parentElement
          while (sourceListEl && !sourceListEl.hasAttribute('data-list-id')) {
            sourceListEl = sourceListEl.parentElement
          }

          let targetListEl: HTMLElement | null = targetParent.el.parentElement
          while (targetListEl && !targetListEl.hasAttribute('data-list-id')) {
            targetListEl = targetListEl.parentElement
          }

          const sourceListId = sourceListEl?.getAttribute('data-list-id')
          const targetListId = targetListEl?.getAttribute('data-list-id')
          const cardId = draggedNodes[0]?.el.getAttribute('data-card-id')

          if (!cardId || !targetListId || !sourceListId) {
            state.isUpdatingFromDrag.value = false
            return
          }

          // Optimistically update state
          updateBoard((board) => {
            let movedCard: any = null

            const listsWithoutCard = board.lists.map((list: any) => {
              if (list.id === sourceListId) {
                movedCard = list.cards.find((c: any) => c.id === cardId)
                return { ...list, cards: list.cards.filter((c: any) => c.id !== cardId) }
              }
              return list
            })

            const listsWithCard = listsWithoutCard.map((list: any) => {
              if (list.id === targetListId && movedCard) {
                return { ...list, cards: [...list.cards, movedCard] }
              }
              return list
            })

            return { ...board, lists: listsWithCard }
          })

          // Mark transfer time to prevent onSort from firing immediately
          state.lastTransferTime.value = Date.now()

          queueMicrotask(() => {
            state.isUpdatingFromDrag.value = false
          })

          // Persist to server in background
          await onMove(cardId, targetListId)
        },
      },
    })
  })
}
