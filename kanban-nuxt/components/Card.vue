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

const props = defineProps<{
  card: BoardCard
  users: User[]
  allUsers: User[]
  allTags: Tag[]
}>()

const emit = defineEmits<{
  cardUpdate: [cardId: string, updates: Partial<BoardCard>]
  cardDelete: [cardId: string]
}>()

const isEditModalOpen = ref(false)
const isCommentModalOpen = ref(false)

function handleUpdate(updates: Partial<BoardCard>) {
  emit('cardUpdate', props.card.id, updates)
}

function handleDelete() {
  emit('cardDelete', props.card.id)
}

function handleCommentAdd(comment: { userId: string; text: string; id: string; cardId: string; createdAt: string }) {
  emit('cardUpdate', props.card.id, {
    comments: [
      ...props.card.comments,
      {
        id: comment.id,
        userId: comment.userId,
        text: comment.text,
        createdAt: comment.createdAt,
      } as Comment,
    ],
  })
}
</script>

<template>
  <article
    class="card bg-base-100 dark:bg-neutral shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out"
  >
      <div class="card-body gap-3 p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="card-title text-lg text-base-content">{{ card.title }}</h3>
          <span
            v-if="card.completed"
            class="badge badge-success badge-outline"
          >
            Done
          </span>
          <button
            type="button"
            @click.stop="isEditModalOpen = true"
            class="btn btn-ghost btn-xs btn-circle"
          >
            <EditPencil />
          </button>
        </div>

        <div
          v-if="card.assigneeId"
          class="badge badge-outline badge-secondary badge-sm"
        >
          Assigned to {{ users.find((u) => u.id === card.assigneeId)?.name ?? 'Unassigned' }}
        </div>

        <p
          v-if="card.description"
          class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2"
        >
          {{ card.description }}
        </p>

        <div
          v-if="card.tags.length > 0"
          class="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100"
        >
          <span
            v-for="tag in card.tags"
            :key="tag.id"
            class="badge border-0 shadow font-semibold text-white"
            :style="{ backgroundColor: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>

        <div v-if="card.comments.length === 0" class="flex items-center justify-between">
          <p class="text-xs font-semibold text-base-content/50">Comments</p>
          <button
            type="button"
            @click.stop="isCommentModalOpen = true"
            class="btn btn-ghost btn-xs btn-circle"
          >
            <Plus />
          </button>
        </div>
        <div
          v-else
          class="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner relative"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-base-content/50">Comments</p>
            <button
              type="button"
              @click.stop="isCommentModalOpen = true"
              class="btn btn-ghost btn-xs btn-circle"
            >
              <Plus />
            </button>
          </div>
          <ul class="space-y-1 text-sm text-base-content/70">
            <li v-for="comment in card.comments" :key="comment.id">
              <span class="font-semibold text-base-content">
                {{ users.find((u) => u.id === comment.userId)?.name ?? 'Unknown' }}:
              </span>
              {{ comment.text }}
            </li>
          </ul>
      </div>
    </div>
  </article>

  <CardEditModal
      v-if="isEditModalOpen"
      :card="card"
      :users="allUsers"
      :tags="allTags"
      @close="isEditModalOpen = false"
      @update="handleUpdate"
      @delete="handleDelete"
    />
    <CommentModal
      v-if="isCommentModalOpen"
      :card="card"
      :users="allUsers"
      @close="isCommentModalOpen = false"
      @comment-add="handleCommentAdd"
  />
</template>
