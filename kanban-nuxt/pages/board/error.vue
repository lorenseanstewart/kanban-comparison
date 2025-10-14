<template>
  <main
    class="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl"
  >
    <div class="card bg-error/10">
      <div class="card-body items-center text-center">
        <h1 class="card-title text-2xl text-error">Board Error</h1>
        <p class="text-base-content/70">
          {{ error?.message || 'Failed to load this board. It may not exist or there was an error.' }}
        </p>
        <div class="card-actions justify-center gap-4 mt-4">
          <button @click="handleError" class="btn btn-primary">Try Again</button>
          <NuxtLink to="/" class="btn btn-ghost">Back to Boards</NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: Error;
}>();

const handleError = () => clearError({ redirect: '/board/' + useRoute().params.id });
</script>
