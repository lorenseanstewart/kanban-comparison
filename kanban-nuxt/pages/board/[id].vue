<script setup lang="ts">
import { initializeDragAndDrop, type DragDropState } from '../lib/drag-and-drop'

const route = useRoute();

const { data: serverData, pending, error, refresh } = await useAsyncData(
  `board-${route.params.id}`,
  () => $fetch(`/api/boards/${route.params.id}`),
  {
    // Cache for 60 seconds
    dedupe: 'defer',
    default: () => null,
    getCachedData: (key) => useNuxtData(key).data.value,
  }
);

// Local mutable copy for optimistic updates
const board = ref(null);

// Initialize from server data
board.value = serverData.value;

// Sync local state with server data when serverData changes
watch(serverData, (newBoard) => {
  board.value = newBoard;
});

// Set dynamic meta tags based on board data
watchEffect(() => {
  if (board.value) {
    useHead({
      title: `${board.value.board.title} - Kanban`,
      meta: [
        {
          name: 'description',
          content: board.value.board.description || `Manage tasks on the ${board.value.board.title} board.`
        },
        { property: 'og:title', content: `${board.value.board.title} - Kanban` },
        {
          property: 'og:description',
          content: board.value.board.description || `Manage tasks on the ${board.value.board.title} board.`
        },
      ],
    });
  }
});

const showAddCardModal = ref(false)

// Drag and drop state
const dragDropState: DragDropState = {
  dropZoneRefs: new Map<string, Element>(),
  isUpdatingFromDrag: ref(false),
  lastTransferTime: ref(0),
  dragOverListId: ref<string | null>(null),
}

// Helper to update board state
function updateBoard(updater: (board: any) => any) {
  if (board.value) {
    board.value = updater(board.value)
  }
}

// API handlers
async function handleReorder(cardIds: string[], listId: string) {
  try {
    await $fetch('/api/cards/reorder', {
      method: 'POST',
      body: { cardIds, listId },
    })
  } catch (error) {
    console.error('Failed to update card positions:', error)
    refresh()
  }
}

async function handleMove(cardId: string, targetListId: string) {
  try {
    await $fetch('/api/cards/move', {
      method: 'POST',
      body: { cardId, targetListId },
    })
  } catch (error) {
    console.error('Failed to move card:', error)
    refresh()
  }
}

// Initialize drag and drop on mount
onMounted(() => {
  if (board.value) {
    initializeDragAndDrop(dragDropState, board.value, updateBoard, handleReorder, handleMove)
  }
})

// Watch for board changes to reinitialize drag-and-drop
watch(
  () => board.value?.lists,
  () => {
    if (!dragDropState.isUpdatingFromDrag.value && board.value) {
      nextTick(() => {
        if (!dragDropState.isUpdatingFromDrag.value) {
          initializeDragAndDrop(dragDropState, board.value, updateBoard, handleReorder, handleMove)
        }
      })
    }
  },
  { deep: true, flush: 'post' }
)

// Handle optimistic card updates
function handleCardUpdate(cardId: string, updates: Partial<BoardCard>) {
  if (!board.value) return

  const updatedLists = board.value.lists.map((list) => ({
    ...list,
    cards: list.cards.map((card) =>
      card.id === cardId ? { ...card, ...updates } : card
    ),
  }))

  board.value = {
    ...board.value,
    lists: updatedLists,
  }
}

// Handle optimistic card deletion
function handleCardDelete(cardId: string) {
  if (!board.value) return

  // Optimistically remove card from UI
  const updatedLists = board.value.lists.map((list) => ({
    ...list,
    cards: list.cards.filter((card) => card.id !== cardId)
  }))

  board.value = {
    ...board.value,
    lists: updatedLists,
  }

  // Refresh in background to sync with server
  refresh()
}

// Handle card creation with optimistic update
async function handleCardAdd(cardData: {
  id: string
  title: string
  description: string | null
  assigneeId: string | null
  tagIds: string[]
}) {
  showAddCardModal.value = false

  if (!board.value) return

  // Find the Todo list
  const todoList = board.value.lists.find(list => list.title === 'Todo')
  if (!todoList) return

  // Get the highest position in the Todo list
  const maxPosition = todoList.cards.length > 0
    ? Math.max(...todoList.cards.map(c => c.position))
    : -1

  // Create optimistic card with populated tags
  const optimisticCard = {
    id: cardData.id,
    title: cardData.title,
    description: cardData.description,
    assigneeId: cardData.assigneeId,
    listId: todoList.id,
    position: maxPosition + 1,
    completed: false,
    createdAt: new Date(),
    tags: cardData.tagIds.map(tagId => {
      const tag = board.value!.tags.find(t => t.id === tagId)
      return tag ? { tagId, tag } : null
    }).filter(Boolean),
    comments: []
  }

  // Optimistically add card to the Todo list
  const updatedLists = board.value.lists.map(list => {
    if (list.id === todoList.id) {
      return {
        ...list,
        cards: [...list.cards, optimisticCard]
      }
    }
    return list
  })

  board.value = {
    ...board.value,
    lists: updatedLists
  }

  // Refresh in background to sync with server
  refresh()
}
</script>

<template>
  <main
    v-if="board"
    class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl"
  >
    <div class="breadcrumbs text-sm">
      <ul>
        <li>
          <NuxtLink to="/" class="link link-hover">Boards</NuxtLink>
        </li>
        <li>
          <span class="text-base-content/60">{{ board.board.title }}</span>
        </li>
      </ul>
    </div>

    <div class="space-y-8">
      <BoardOverview :data="board" />

      <div class="flex justify-start mb-4">
        <button
          type="button"
          class="btn btn-primary"
          @click="showAddCardModal = true"
        >
          Add Card
        </button>
      </div>

      <section class="flex gap-7 overflow-x-auto pb-8">
        <div
          v-if="board.lists.length === 0"
          class="card bg-base-200 dark:bg-base-300 shadow-xl w-full max-w-md mx-auto"
        >
          <div class="card-body items-center text-center">
            <h2 class="card-title text-secondary">No lists yet</h2>
            <p class="text-base-content/60">
              Add a list to begin organizing work on this board.
            </p>
          </div>
        </div>

        <article
          v-for="list in board.lists"
          :key="list.id"
          :data-list-id="list.id"
          class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl"
        >
          <div class="card-body gap-4">
            <header class="flex items-center justify-between">
              <h2 class="card-title text-base-content">{{ list.title }}</h2>
              <div class="badge badge-primary badge-outline badge-lg shadow">
                {{ list.cards.length }} cards
              </div>
            </header>

            <div
              data-drop-zone
              :class="[
                'space-y-3 min-h-[600px] transition-all duration-200 rounded-lg p-2',
                dragDropState.dragOverListId.value === list.id
                  ? 'ring-4 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]'
                  : ''
              ]"
            >
              <div
                v-for="card in list.cards"
                :key="card.id"
                :data-card-id="card.id"
                data-draggable-card
              >
                <Card
                  :card="card"
                  :users="board.users"
                  :all-users="board.users"
                  :all-tags="board.tags"
                  @card-update="handleCardUpdate"
                  @card-delete="handleCardDelete"
                />
              </div>

              <div
                v-if="list.cards.length === 0"
                class="alert alert-info text-sm mt-2"
              >
                <span>No cards yet</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>

    <AddCardModal
      v-if="showAddCardModal"
      :board-id="board.board.id"
      :users="board.users"
      :tags="board.tags"
      @close="showAddCardModal = false"
      @card-add="handleCardAdd"
    />
  </main>

  <main
    v-else
    class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl"
  >
    <div class="flex justify-center py-16">
      <span
        class="loading loading-spinner loading-lg text-primary"
        aria-label="Loading board"
      />
    </div>
  </main>
</template>
