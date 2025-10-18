<script setup lang="ts">
import { computed } from 'vue'
import { icons } from 'lucide-vue-next'

interface Props {
  name: string
  size?: number
  strokeWidth?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2,
  class: ''
})

// Verificar se é um emoji
const isEmoji = computed(() => {
  return props.name && props.name.length <= 2 && !/^[a-zA-Z]+$/.test(props.name)
})

// Obter componente do ícone
const iconComponent = computed(() => {
  if (isEmoji.value) return null
  return icons[props.name as keyof typeof icons]
})
</script>

<template>
  <component
    v-if="iconComponent"
    :is="iconComponent"
    :size="size"
    :stroke-width="strokeWidth"
    :class="class"
  />
  <span v-else-if="isEmoji" :class="class" :style="{ fontSize: `${size}px` }">
    {{ name }}
  </span>
  <span v-else :class="class" class="text-gray-400">?</span>
</template>
