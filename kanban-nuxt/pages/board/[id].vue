<script setup lang="ts">
// Lazy load heavy dependencies with explicit chunk names
const draggable = defineAsyncComponent({
  loader: () => import('vuedraggable'),
})
const BoardOverview = defineAsyncComponent({
  loader: () => import('~/components/BoardOverview.vue'),
})
const Card = defineAsyncComponent({
  loader: () => import('~/components/Card.vue'),
})
const AddCardModal = defineAsyncComponent({
  loader: () => import('~/components/AddCardModal.vue'),
})

import { useAutoAnimate } from '@formkit/auto-animate/vue'
import type { Tag, User, Comment } from '../../drizzle/schema'

interface BoardCard {
  id: string
  title: string
  description: string | null
  assigneeId: string | null
  position: number
  completed: boolean
  tags: Tag[]
  comments: Comment[]
}

interface BoardList {
  id: string
  title: string
  cards: BoardCard[]
}

interface BoardDetails {
  board: {
    id: string
    title: string
    description: string | null
  }
  lists: BoardList[]
  users: User[]
  tags: Tag[]
}

const route = useRoute()
const boardId = route.params.id as string

const { $fetch } = useNuxtApp()

const { data: initialBoard, refresh } = await useAsyncData(
  () => `board-${boardId}`,
  () => $fetch<BoardDetails>(`/api/boards/${boardId}`),
  { server: true }
)

// Local mutable copy for optimistic updates
const board = ref<BoardDetails | null>(initialBoard.value)

// Sync local state with server data when initialBoard changes
watch(initialBoard, (newBoard) => {
  board.value = newBoard
})

const showAddCardModal = ref(false)
const dragOverListId = ref<string | null>(null)
const draggedCard = ref<{ id: string; fromListId: string } | null>(null)

// Auto-animate for smooth transitions
const [listAnimateRef] = useAutoAnimate()

function onDragStart(listId: string, cardId: string) {
  draggedCard.value = { id: cardId, fromListId: listId }
}

function onDragOver(listId: string) {
  dragOverListId.value = listId
}

function onDragLeave() {
  dragOverListId.value = null
}

async function onDragEnd(listId: string, event: any) {
  dragOverListId.value = null

  if (!board.value || !draggedCard.value) {
    return
  }

  const { fromListId, id: cardId } = draggedCard.value
  draggedCard.value = null

  const { oldIndex, newIndex } = event
  if (oldIndex === newIndex && fromListId === listId) return

  try {
    const response = await $fetch('/api/cards/move', {
      method: 'POST',
      body: {
        cardId,
        sourceListId: fromListId,
        targetListId: listId,
        newPosition: newIndex,
      },
    })

    if (response?.success) {
      await refresh()
    }
  } catch (error) {
    await refresh()
  }
}

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

// Handle card creation with server-generated ID
async function handleCardAdd(cardData: {
  id: string
  title: string
  description: string | null
  assigneeId: string | null
  tagIds: string[]
}) {
  showAddCardModal.value = false
  await refresh()
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
          class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl"
        >
          <div class="card-body gap-4">
            <header class="flex items-center justify-between">
              <h2 class="card-title text-base-content">{{ list.title }}</h2>
              <div class="badge badge-primary badge-outline badge-lg shadow">
                {{ list.cards.length }} cards
              </div>
            </header>

            <draggable
              v-model="list.cards"
              item-key="id"
              :group="{ name: 'cards', pull: true, put: true }"
              :class="[
                'min-h-[200px] transition-all duration-200',
                dragOverListId === list.id
                  ? 'ring-4 ring-primary ring-offset-2 bg-primary/5 scale-[1.02]'
                  : ''
              ]"
              @start="onDragStart(list.id, $event.item?.__draggable_context?.element?.id ?? '')"
              @end="onDragEnd(list.id, $event)"
              @dragover="onDragOver(list.id)"
              @dragleave="onDragLeave"
            >
              <template #item="{ element }">
                <div :ref="listAnimateRef" class="space-y-3">
                  <Card
                    :card="element"
                    :users="board.users"
                    :all-users="board.users"
                    :all-tags="board.tags"
                    @card-update="handleCardUpdate"
                  />
                </div>
              </template>
            </draggable>
            <div
              v-if="list.cards.length === 0"
              class="alert alert-info text-sm"
            >
              <span>No cards yet</span>
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
