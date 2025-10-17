<script setup lang="ts">
const emit = defineEmits<{
  close: []
  boardAdd: [board: { id: string; title: string; description: string | null }]
}>()

const title = ref('')
const description = ref('')
const error = ref<string | null>(null)
const isSubmitting = ref(false)

async function handleSubmit() {
  error.value = null
  isSubmitting.value = true

  try {
    const response = await $fetch<{ success: boolean; boardId?: string; title: string; description: string | null }>('/api/boards', {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value || null,
      },
    })

    if (!response.success || !response.boardId) {
      error.value = 'Failed to create board'
      return
    }

    emit('boardAdd', {
      id: response.boardId,
      title: response.title,
      description: response.description,
    })
    title.value = ''
    description.value = ''
    emit('close')
  } catch (err: any) {
    error.value = err?.statusMessage || err?.message || 'Failed to create board'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <dialog class="modal modal-open !mt-0" @click.self="emit('close')">
    <div class="modal-backdrop bg-black/70" />
    <div class="modal-box bg-base-200 dark:bg-base-300">
      <form @submit.prevent="handleSubmit">
        <button
          type="button"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="emit('close')"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">Add New Board</h3>

        <div v-if="error" class="alert alert-error mb-4">
          <span>{{ error }}</span>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Title</span>
          </label>
          <input
            v-model="title"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter board title"
            required
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            v-model="description"
            class="textarea textarea-bordered h-24 w-full"
            placeholder="Enter board description (optional)"
            :disabled="isSubmitting"
          />
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
            {{ isSubmitting ? 'Adding...' : 'Add Board' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>
