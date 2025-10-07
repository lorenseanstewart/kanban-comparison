<script setup lang="ts">
// Lazy load the modal component
const AddBoardModal = defineAsyncComponent({
  loader: () => import('~/components/AddBoardModal.vue'),
})

interface BoardSummary {
  id: string
  title: string
  description: string | null
  cardCount: number
  listCount: number
}

const { $fetch } = useNuxtApp()

const { data: boards, refresh } = await useAsyncData('boards', () =>
  $fetch<BoardSummary[]>('/api/boards')
)

const showAddBoardModal = ref(false)

function handleBoardAdd(boardData: { id: string; title: string; description: string | null }) {
  if (boards.value) {
    boards.value = [
      ...boards.value,
      {
        ...boardData,
        cardCount: 0,
        listCount: 0,
      },
    ]
  }
  showAddBoardModal.value = false
}
</script>

<template>
  <main class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
    <header class="text-center space-y-3">
      <p class="text-sm uppercase tracking-wide text-secondary">
        Your workspace
      </p>
      <h1 class="text-4xl font-black text-primary">Boards</h1>
      <p class="text-base text-base-content/60">
        Choose a board to jump into your Kanban flow.
      </p>
    </header>

    <div class="flex justify-end">
      <button
        type="button"
        @click="showAddBoardModal = true"
        class="btn btn-primary"
      >
        Add Board
      </button>
    </div>

    <section class="grid gap-8 md:grid-cols-2">
      <div
        v-if="!boards || boards.length === 0"
        class="card bg-base-200 dark:bg-base-300 shadow-xl"
      >
        <div class="card-body items-center text-center mx-auto">
          <h2 class="card-title text-secondary">No boards yet</h2>
          <p class="text-base-content/60">
            Create your first board to get started.
          </p>
        </div>
      </div>

      <NuxtLink
        v-for="board in boards"
        :key="board.id"
        :to="`/board/${board.id}`"
        class="card bg-base-200 dark:bg-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
      >
        <div class="card-body">
          <h2 class="card-title text-primary">{{ board.title }}</h2>
          <p v-if="board.description" class="text-sm text-base-content/60">
            {{ board.description }}
          </p>
          <p v-else class="badge badge-secondary badge-outline w-fit shadow">
            No description
          </p>
          <div class="card-actions justify-end">
            <span class="btn btn-secondary btn-sm shadow-lg">
              Open board
            </span>
          </div>
        </div>
      </NuxtLink>
    </section>

    <AddBoardModal
      v-if="showAddBoardModal"
      @close="showAddBoardModal = false"
      @board-add="handleBoardAdd"
    />
  </main>
</template>
