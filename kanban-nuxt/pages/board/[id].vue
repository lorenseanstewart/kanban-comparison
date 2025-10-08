<script setup lang="ts">
// Remove unused import
// import { useDraggable } from '@vueuse/components';

// Re-add dynamic import for draggable
import draggable from 'vuedraggable';

// Keep useAutoAnimate
import { useAutoAnimate } from '@formkit/auto-animate/vue';

// Dynamically import heavy components for code-splitting
const BarChart = defineAsyncComponent(() => import('~/components/charts/BarChart.vue'));
const PieChart = defineAsyncComponent(() => import('~/components/charts/PieChart.vue'));

const route = useRoute();
// const store = useBoardsStore();

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

const showAddCardModal = ref(false)
const dragOverListId = ref<string | null>(null)
const draggedCard = ref<{ id: string; fromListId: string } | null>(null)

// Auto-animate for smooth transitions
const [listAnimateRef] = useAutoAnimate()

const animateRefs = ref(new Map());

// In onMounted or after board is loaded, create for each list
watch(board, (newBoard) => {
  if (newBoard) {
    newBoard.lists.forEach((list) => {
      if (!animateRefs.value.has(list.id)) {
        const [refFn] = useAutoAnimate();
        animateRefs.value.set(list.id, refFn);
      }
    });
  }
}, { immediate: true });

// Helper function to get animate ref for a list
function getAnimateRef(listId: string) {
  return animateRefs.value.get(listId);
}

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

            <div :ref="getAnimateRef(list.id)" class="space-y-3 min-h-[200px]">
              <draggable
                v-model="list.cards"
                item-key="id"
                :group="{ name: 'cards', pull: true, put: true }"
                :class="[
                  'transition-all duration-200',
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
                  <Card
                    :card="element"
                    :users="board.users"
                    :all-users="board.users"
                    :all-tags="board.tags"
                    @card-update="handleCardUpdate"
                  />
                </template>
              </draggable>
            </div>
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
