import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { webhookService } from '@/services/webhook.service'
import type { Webhook, CreateWebhookData, WebhookStatistics } from '@/services/webhook.service'

export const useWebhookStore = defineStore('webhook', () => {
  // State
  const webhooks = ref<Webhook[]>([])
  const currentWebhook = ref<Webhook | null>(null)
  const webhookHistory = ref<any[]>([])
  const statistics = ref<WebhookStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeWebhooks = computed(() => 
    webhooks.value.filter(w => w.active)
  )

  const webhooksByTrigger = computed(() => {
    const grouped: Record<string, Webhook[]> = {}
    webhooks.value.forEach(webhook => {
      if (!grouped[webhook.trigger]) {
        grouped[webhook.trigger] = []
      }
      grouped[webhook.trigger].push(webhook)
    })
    return grouped
  })

  // Actions
  async function fetchAll(includeInactive = false) {
    try {
      isLoading.value = true
      error.value = null
      webhooks.value = await webhookService.getAll(includeInactive)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar webhooks'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentWebhook.value = await webhookService.getById(id)
      return currentWebhook.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar webhook'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateWebhookData) {
    try {
      isLoading.value = true
      error.value = null
      const newWebhook = await webhookService.create(data)
      webhooks.value.push(newWebhook)
      return newWebhook
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar webhook'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateWebhookData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedWebhook = await webhookService.update(id, data)
      const index = webhooks.value.findIndex(w => w.id === id)
      if (index !== -1) {
        webhooks.value[index] = updatedWebhook
      }
      if (currentWebhook.value?.id === id) {
        currentWebhook.value = updatedWebhook
      }
      return updatedWebhook
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar webhook'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await webhookService.delete(id)
      webhooks.value = webhooks.value.filter(w => w.id !== id)
      if (currentWebhook.value?.id === id) {
        currentWebhook.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir webhook'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function test(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await webhookService.test(id)
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao testar webhook'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function retry(id: string, messageId: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await webhookService.retry(id, messageId)
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao reenviar webhook'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchHistory(id: string, limit = 50) {
    try {
      isLoading.value = true
      error.value = null
      webhookHistory.value = await webhookService.getHistory(id, limit)
      return webhookHistory.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar histórico'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function processPending() {
    try {
      isLoading.value = true
      error.value = null
      const result = await webhookService.processPending()
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao processar webhooks pendentes'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      isLoading.value = true
      error.value = null
      statistics.value = await webhookService.getStatistics()
      return statistics.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar estatísticas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    webhooks,
    currentWebhook,
    webhookHistory,
    statistics,
    isLoading,
    error,
    // Getters
    activeWebhooks,
    webhooksByTrigger,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    test,
    retry,
    fetchHistory,
    processPending,
    fetchStatistics,
    clearError,
  }
})
