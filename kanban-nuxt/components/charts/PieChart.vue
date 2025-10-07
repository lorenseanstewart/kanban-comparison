<script setup lang="ts">
const props = defineProps<{
  data: Array<{ label: string; value: number }>
  colors: string[]
  title: string
}>()

const totalValue = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))
</script>

<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body p-4 flex flex-col items-center">
      <h3 class="card-title text-sm text-base-content mb-2 w-full">
        {{ title }}
      </h3>
      <table
        class="charts-css pie mx-auto mb-3"
        :style="{ height: '120px', width: '120px', '--labels-size': '0' }"
      >
        <tbody>
          <tr
            v-for="(item, index) in data"
            :key="item.label"
          >
            <td
              :style="{
                '--start': data.slice(0, index).reduce((sum, d) => sum + d.value / totalValue, 0),
                '--end': data.slice(0, index + 1).reduce((sum, d) => sum + d.value / totalValue, 0),
                '--color': colors[index % colors.length],
              }"
            />
          </tr>
        </tbody>
      </table>
      <!-- Legend -->
      <div class="flex flex-col gap-1 w-full">
        <div
          v-for="(item, index) in data"
          :key="item.label"
          class="flex items-center gap-2 justify-between"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              :style="{ backgroundColor: colors[index % colors.length] }"
            />
            <span class="text-xs text-base-content">{{ item.label }}</span>
          </div>
          <span class="text-xs font-semibold text-base-content">
            {{ totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(0) : 0 }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
