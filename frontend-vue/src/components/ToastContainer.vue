<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'

const { toasts, remove } = useToast()

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-start p-4 rounded-lg border shadow-lg',
          colorMap[toast.type],
        ]"
      >
        <component
          :is="iconMap[toast.type]"
          :class="['h-5 w-5 mr-3 flex-shrink-0', iconColorMap[toast.type]]"
        />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="remove(toast.id)"
          class="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

