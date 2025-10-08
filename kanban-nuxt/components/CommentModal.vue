<script setup lang="ts">
import type { User, Comment } from '../drizzle/schema'

interface BoardCard {
  id: string
  title: string
  description: string | null
  assigneeId: string | null
  position: number
  completed: boolean
  tags: any[]
  comments: Comment[]
}

const props = defineProps<{
  card: BoardCard
  users: User[]
}>()

const emit = defineEmits<{
  close: []
  commentAdd: [comment: { userId: string; text: string; id: string; cardId: string; createdAt: string }]
}>()

const selectedUserId = ref(props.users[0]?.id || '')

const error = ref<string | null>(null)
const isSubmitting = ref(false)

async function handleSubmit(e: Event) {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)

  const userId = formData.get('userId') as string
  const content = formData.get('content') as string

  error.value = null
  isSubmitting.value = true

  try {
    const response = await $fetch<{ success: boolean; comment: { id: string; userId: string; text: string; cardId: string; createdAt: string } }>(
      `/api/cards/${props.card.id}/comments`,
      {
        method: 'POST',
        body: { userId, content },
      }
    )

    if (!response.success) {
      throw createError({ statusMessage: 'Failed to add comment' })
    }

    emit('commentAdd', {
      userId: response.comment.userId,
      text: response.comment.text,
      id: response.comment.id,
      cardId: response.comment.cardId,
      createdAt: response.comment.createdAt,
    })

    form.reset()
    selectedUserId.value = props.users[0]?.id || ''
    emit('close')
  } catch (err: any) {
    error.value = err?.statusMessage || 'Failed to add comment'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <dialog class="modal modal-open !mt-0" @click.self="emit('close')">
    <div class="modal-backdrop bg-black/70" />
    <div class="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
      <button
        type="button"
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="emit('close')"
      >
        ✕
      </button>

      <h3 class="font-bold text-lg mb-4">Comments</h3>

      <!-- Existing Comments -->
      <div class="mb-6 max-h-96 overflow-y-auto">
        <div
          v-if="card.comments.length === 0"
          class="text-center py-8 text-base-content/60"
        >
          No comments yet. Be the first to add one!
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="comment in card.comments"
            :key="comment.id"
            class="bg-base-100 dark:bg-base-200 rounded-lg p-4"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="font-semibold text-base-content">
                {{ users.find((u) => u.id === comment.userId)?.name || 'Unknown' }}
              </span>
              <span class="text-xs text-base-content/50">
                {{ new Date(comment.createdAt).toLocaleDateString() }}
              </span>
            </div>
            <p class="text-sm text-base-content/80">{{ comment.text }}</p>
          </div>
        </div>
      </div>

      <!-- Add Comment Form -->
      <form @submit="handleSubmit">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Comment as</span>
          </label>
          <select
            name="userId"
            class="select select-bordered w-full"
            v-model="selectedUserId"
          >
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div class="form-control w-full mt-4">
          <label class="label">
            <span class="label-text">Your comment</span>
          </label>
          <textarea
            name="content"
            class="textarea textarea-bordered h-24 w-full"
            placeholder="Write your comment..."
            required
          />
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">
            Close
          </button>
          <button type="submit" class="btn btn-primary">Add Comment</button>
        </div>
      </form>
    </div>
  </dialog>
</template>
