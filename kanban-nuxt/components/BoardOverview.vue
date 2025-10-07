<script setup lang="ts">
import BarChart from './charts/BarChart.vue'
import PieChart from './charts/PieChart.vue'
import type { Tag, Comment } from '../drizzle/schema'

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
}

const props = defineProps<{
  data: BoardDetails
}>()

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

// DaisyUI pastel colors matching the theme
const pastelColors = [
  '#fbbf24', // amber (warning)
  '#f472b6', // pink (secondary)
  '#a78bfa', // purple (primary)
  '#60a5fa', // blue (info)
]

// Prepare data for charts
const chartData = computed(() =>
  props.data.lists.map((list) => ({
    label: list.title,
    value: list.cards.length,
  }))
)
</script>

<template>
  <section class="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6">
    <!-- Header Section -->
    <div class="space-y-3">
      <div class="badge badge-secondary badge-outline">Board overview</div>
      <h1 class="text-4xl font-black text-primary">{{ data.board.title }}</h1>
      <p
        v-if="data.board.description"
        class="text-base text-base-content/60 max-w-2xl"
      >
        {{ data.board.description }}
      </p>
    </div>

    <!-- Charts Section -->
    <div v-if="!mounted" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-base-content mb-4">Cards per List</h3>
          <div class="flex justify-center items-center h-[250px]">
            <span class="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-base-content mb-4">Distribution</h3>
          <div class="flex justify-center items-center h-[250px]">
            <span class="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start"
    >
      <BarChart :data="chartData" :colors="pastelColors" title="Cards per List" />
      <PieChart :data="chartData" :colors="pastelColors" title="Distribution" />
    </div>
  </section>
</template>
