<script setup lang="ts">
const props = defineProps<{
  data: Array<{ label: string; value: number }>
  colors: string[]
  title: string
}>()

const maxValue = computed(() => Math.max(...props.data.map((item) => item.value), 1))
const barRefs = ref<HTMLDivElement[]>([])

const animateBars = () => {
  props.data.forEach((item, index) => {
    const barEl = barRefs.value[index]
    if (barEl) {
      const heightPercent = (item.value / maxValue.value) * 100
      const color = props.colors[index % props.colors.length]

      // Set initial state without transition
      barEl.style.transition = 'none'
      barEl.style.height = '0%'
      barEl.style.backgroundColor = color

      // Trigger animation after a brief delay
      requestAnimationFrame(() => {
        if (barEl) {
          barEl.style.transition = 'height 500ms ease-out, background-color 500ms ease-out'
          barEl.style.height = `${heightPercent}%`
        }
      })
    }
  })
}

onMounted(() => {
  animateBars()
})

// Watch for data changes and re-animate
watch(() => props.data.map(item => item.value), () => {
  animateBars()
}, { deep: true })
</script>

<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body p-4">
      <h3 class="card-title text-sm text-base-content mb-4">{{ title }}</h3>

      <!-- Pure CSS Grid layout -->
      <div
        class="grid gap-4"
        :style="{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }"
      >
        <div
          v-for="(item, index) in data"
          :key="item.label"
          class="flex flex-col items-center gap-2"
        >
          <!-- Bar container - grows from bottom -->
          <div class="w-full flex flex-col justify-end" style="height: 150px">
            <div
              :ref="(el) => (barRefs[index] = el as HTMLDivElement)"
              class="w-full rounded-t"
              style="height: 0%"
            >
              <div class="text-xs text-white font-semibold text-center pt-1">
                {{ item.value }}
              </div>
            </div>
          </div>
          <!-- Label below bar -->
          <div class="text-xs text-base-content text-center font-medium pt-3">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
