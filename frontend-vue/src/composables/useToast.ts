import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function show(type: Toast['type'], message: string, duration = 5000) {
    const id = Math.random().toString(36).substring(7)
    
    toasts.value.push({
      id,
      type,
      message,
      duration,
    })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  function success(message: string, duration?: number) {
    show('success', message, duration)
  }

  function error(message: string, duration?: number) {
    show('error', message, duration)
  }

  function warning(message: string, duration?: number) {
    show('warning', message, duration)
  }

  function info(message: string, duration?: number) {
    show('info', message, duration)
  }

  function remove(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    success,
    error,
    warning,
    info,
    remove,
  }
}
