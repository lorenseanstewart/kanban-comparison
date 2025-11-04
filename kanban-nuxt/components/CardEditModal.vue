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
  tags: Tag[]
}>()

const emit = defineEmits<{
  close: []
  update: [updates: Partial<BoardCard>]
  delete: []
}>()

const selectedTagIds = ref(new Set(props.card.tags.map((t) => t.id)))
const isDeleting = ref(false)
const isSaving = ref(false)

// Reset selected tags when card changes
watch(
  () => props.card,
  (newCard) => {
    selectedTagIds.value = new Set(newCard.tags.map((t) => t.id))
  }
)

function toggleTag(tagId: string) {
  const newSet = new Set(selectedTagIds.value)
  if (newSet.has(tagId)) {
    newSet.delete(tagId)
  } else {
    newSet.add(tagId)
  }
  selectedTagIds.value = newSet
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this card?')) {
    return
  }

  isDeleting.value = true

  try {
    await $fetch(`/api/cards/${props.card.id}`, {
      method: 'DELETE',
    })

    emit('delete')
    emit('close')
  } catch (error: any) {
    console.error('Failed to delete card:', error)
    alert('Failed to delete card. Please try again.')
    isDeleting.value = false
  }
}

async function handleSubmit(e: Event) {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assigneeId') as string

  const updatedTags = props.tags.filter((tag) => selectedTagIds.value.has(tag.id))

  // Optimistic update
  emit('update', {
    title,
    description: description || null,
    assigneeId: assigneeId || null,
    tags: updatedTags,
  })

  isSaving.value = true

  try {
    const payload = {
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      tagIds: Array.from(selectedTagIds.value),
    }

    const response = await $fetch(`/api/cards/${props.card.id}`, {
      method: 'POST',
      body: payload,
    })

    // Success - close the modal
    emit('close')
  } catch (error: any) {
    // Revert optimistic change on failure
    selectedTagIds.value = new Set(props.card.tags.map((t) => t.id))
    emit('update', {
      title: props.card.title,
      description: props.card.description,
      assigneeId: props.card.assigneeId,
      tags: props.card.tags,
    })
    console.error('Failed to update card:', error)
    alert('Failed to update card. Please try again.')
  } finally {
    isSaving.value = false
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
        <h3 class="font-bold text-lg mb-4">Edit Card</h3>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Title</span>
          </label>
          <input
            type="text"
            name="title"
            class="input input-bordered w-full"
            :value="card.title"
            required
          />
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            name="description"
            class="textarea textarea-bordered h-24 w-full"
            :value="card.description || ''"
          />
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Assignee</span>
          </label>
          <select
            name="assigneeId"
            class="select select-bordered w-full"
            :value="card.assigneeId || ''"
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

        <div class="modal-action justify-between">
          <button
            type="button"
            class="btn btn-error"
            @click="handleDelete"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Card' }}
          </button>
          <div class="flex gap-2">
            <button type="button" class="btn btn-ghost" @click="emit('close')" :disabled="isSaving">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </dialog>
</template>
