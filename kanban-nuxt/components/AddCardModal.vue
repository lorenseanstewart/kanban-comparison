<script setup lang="ts">
import type { Tag, User } from '../drizzle/schema'

const props = defineProps<{
  boardId: string
  users: User[]
  tags: Tag[]
}>()

const emit = defineEmits<{
  close: []
  cardAdd: [
    card: {
      id: string
      title: string
      description: string | null
      assigneeId: string | null
      tagIds: string[]
    }
  ]
}>()

const selectedTagIds = ref(new Set<string>())
const error = ref<string | null>(null)
const isSubmitting = ref(false)

function toggleTag(tagId: string) {
  const newSet = new Set(selectedTagIds.value)
  if (newSet.has(tagId)) {
    newSet.delete(tagId)
  } else {
    newSet.add(tagId)
  }
  selectedTagIds.value = newSet
}

async function handleSubmit(e: Event) {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assigneeId') as string

  error.value = null
  isSubmitting.value = true

  try {
    const response = await $fetch<{ success: boolean; cardId?: string }>('/api/cards', {
      method: 'POST',
      body: {
        title,
        description: description || null,
        boardId: props.boardId,
        assigneeId: assigneeId || null,
        tagIds: Array.from(selectedTagIds.value),
      },
    })

    if (!response.success || !response.cardId) {
      error.value = 'Failed to create card'
      return
    }

    emit('cardAdd', {
      id: response.cardId,
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      tagIds: Array.from(selectedTagIds.value),
    })

    form.reset()
    selectedTagIds.value = new Set()
    emit('close')
  } catch (err: any) {
    error.value = err?.statusMessage || 'Failed to create card'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <dialog class="modal modal-open !mt-0" @click.self="emit('close')">
    <div class="modal-backdrop bg-black/70" />
    <div class="modal-box bg-base-200 dark:bg-base-300">
      <form @submit="handleSubmit">
        <button
          type="button"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="emit('close')"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">Add New Card</h3>

        <div v-if="error" class="alert alert-error mb-4">
          <span>{{ error }}</span>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Title</span>
          </label>
          <input
            type="text"
            name="title"
            class="input input-bordered w-full"
            placeholder="Enter card title"
            required
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            name="description"
            class="textarea textarea-bordered h-24 w-full"
            placeholder="Enter card description (optional)"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Assignee</span>
          </label>
          <select
            name="assigneeId"
            class="select select-bordered w-full"
            :disabled="isSubmitting"
          >
            <option value="">Unassigned</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Tags</span>
          </label>
          <div class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
            <button
              v-for="tag in tags"
              :key="tag.id"
              type="button"
              :class="[
                'badge border-2 font-semibold cursor-pointer transition-all hover:scale-105',
                selectedTagIds.has(tag.id) ? 'text-white' : 'badge-outline',
              ]"
              :style="
                selectedTagIds.has(tag.id)
                  ? { backgroundColor: tag.color, borderColor: tag.color }
                  : { color: tag.color, borderColor: tag.color }
              "
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            @click="emit('close')"
            :disabled="isSubmitting"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Adding...' : 'Add Card' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>
