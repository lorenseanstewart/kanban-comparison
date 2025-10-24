<script setup lang="ts">
import type { Tag, Comment } from '../drizzle/schema'
import BarChart from './charts/BarChart.vue'
import PieChart from './charts/PieChart.vue'

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

    <!-- Charts Section - eager loaded to prevent CLS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start">
      <BarChart :data="chartData" :colors="pastelColors" title="Cards per List" />
      <PieChart :data="chartData" :colors="pastelColors" title="Distribution" />
    </div>
  </section>
</template>
