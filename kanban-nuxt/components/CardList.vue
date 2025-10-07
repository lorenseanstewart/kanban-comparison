<script setup lang="ts">
import type { Tag, User, Comment } from '../drizzle/schema'

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

const props = defineProps<{
  list: BoardList
  users: User[]
  allUsers: User[]
  allTags: Tag[]
}>()

const emit = defineEmits<{
  cardUpdate: [cardId: string, updates: Partial<BoardCard>]
}>()
</script>

<template>
  <article class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl">
    <div class="card-body gap-4">
      <header class="flex items-center justify-between">
        <h2 class="card-title text-base-content">{{ list.title }}</h2>
        <div class="badge badge-primary badge-outline badge-lg shadow">
          {{ list.cards.length }} cards
        </div>
      </header>

      <div class="min-h-[200px]">
        <div v-if="list.cards.length === 0" class="alert alert-info text-sm">
          <span>No cards yet</span>
        </div>
        <div v-else class="space-y-3">
          <Card
            v-for="card in list.cards"
            :key="card.id"
            :card="card"
            :users="users"
            :all-users="allUsers"
            :all-tags="allTags"
            @card-update="emit('cardUpdate', $event[0], $event[1])"
          />
        </div>
      </div>
    </div>
  </article>
</template>
