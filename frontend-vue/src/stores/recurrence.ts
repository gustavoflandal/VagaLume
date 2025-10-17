import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recurrenceService } from '@/services/recurrence.service'
import type { Recurrence, CreateRecurrenceData } from '@/services/recurrence.service'

export const useRecurrenceStore = defineStore('recurrence', () => {
  // State
  const recurrences = ref<Recurrence[]>([])
  const currentRecurrence = ref<Recurrence | null>(null)
  const nextOccurrences = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeRecurrences = computed(() => 
    recurrences.value.filter(r => r.active)
  )

  const totalRecurrences = computed(() => recurrences.value.length)

  // Actions
  async function fetchAll(includeInactive = false) {
    try {
      isLoading.value = true
      error.value = null
      recurrences.value = await recurrenceService.getAll(includeInactive)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar recorrências'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentRecurrence.value = await recurrenceService.getById(id)
      return currentRecurrence.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar recorrência'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateRecurrenceData) {
    try {
      isLoading.value = true
      error.value = null
      const newRecurrence = await recurrenceService.create(data)
      recurrences.value.push(newRecurrence)
      return newRecurrence
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar recorrência'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateRecurrenceData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedRecurrence = await recurrenceService.update(id, data)
      const index = recurrences.value.findIndex(r => r.id === id)
      if (index !== -1) {
        recurrences.value[index] = updatedRecurrence
      }
      if (currentRecurrence.value?.id === id) {
        currentRecurrence.value = updatedRecurrence
      }
      return updatedRecurrence
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar recorrência'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await recurrenceService.delete(id)
      recurrences.value = recurrences.value.filter(r => r.id !== id)
      if (currentRecurrence.value?.id === id) {
        currentRecurrence.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir recorrência'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchNextOccurrences(id: string, count = 5) {
    try {
      isLoading.value = true
      error.value = null
      nextOccurrences.value = await recurrenceService.getNextOccurrences(id, count)
      return nextOccurrences.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao calcular próximas ocorrências'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function generateAll() {
    try {
      isLoading.value = true
      error.value = null
      const result = await recurrenceService.generateAll()
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao gerar transações recorrentes'
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
    recurrences,
    currentRecurrence,
    nextOccurrences,
    isLoading,
    error,
    // Getters
    activeRecurrences,
    totalRecurrences,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    fetchNextOccurrences,
    generateAll,
    clearError,
  }
})
