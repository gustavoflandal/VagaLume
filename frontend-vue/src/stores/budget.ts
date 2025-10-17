import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { budgetService } from '@/services/budget.service'
import type { Budget, CreateBudgetData, CreateBudgetLimitData, CreateAutoBudgetData } from '@/services/budget.service'

export const useBudgetStore = defineStore('budget', () => {
  // State
  const budgets = ref<Budget[]>([])
  const currentBudget = ref<Budget | null>(null)
  const exceededBudgets = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeBudgets = computed(() => 
    budgets.value.filter(budget => budget.active)
  )

  const totalBudgeted = computed(() => 
    activeBudgets.value.length
  )

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      budgets.value = await budgetService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar orçamentos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentBudget.value = await budgetService.getById(id)
      return currentBudget.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar orçamento'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateBudgetData) {
    try {
      isLoading.value = true
      error.value = null
      const newBudget = await budgetService.create(data)
      budgets.value.push(newBudget)
      return newBudget
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar orçamento'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateBudgetData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedBudget = await budgetService.update(id, data)
      const index = budgets.value.findIndex(b => b.id === id)
      if (index !== -1) {
        budgets.value[index] = updatedBudget
      }
      if (currentBudget.value?.id === id) {
        currentBudget.value = updatedBudget
      }
      return updatedBudget
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar orçamento'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await budgetService.delete(id)
      budgets.value = budgets.value.filter(b => b.id !== id)
      if (currentBudget.value?.id === id) {
        currentBudget.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir orçamento'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function checkExceeded(budgetId: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await budgetService.checkExceeded(budgetId)
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao verificar orçamento excedido'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createLimit(data: CreateBudgetLimitData) {
    try {
      isLoading.value = true
      error.value = null
      const limit = await budgetService.createLimit(data)
      // Atualiza o orçamento atual se necessário
      if (currentBudget.value?.id === data.budgetId) {
        await fetchById(data.budgetId)
      }
      return limit
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar limite'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateLimit(limitId: string, data: Partial<CreateBudgetLimitData>) {
    try {
      isLoading.value = true
      error.value = null
      const limit = await budgetService.updateLimit(limitId, data)
      return limit
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar limite'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteLimit(limitId: string) {
    try {
      isLoading.value = true
      error.value = null
      await budgetService.deleteLimit(limitId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir limite'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function setAutoBudget(budgetId: string, data: CreateAutoBudgetData) {
    try {
      isLoading.value = true
      error.value = null
      const autoBudget = await budgetService.setAutoBudget(budgetId, data)
      // Atualiza o orçamento atual se necessário
      if (currentBudget.value?.id === budgetId) {
        await fetchById(budgetId)
      }
      return autoBudget
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao configurar auto-budget'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeAutoBudget(budgetId: string) {
    try {
      isLoading.value = true
      error.value = null
      await budgetService.removeAutoBudget(budgetId)
      // Atualiza o orçamento atual se necessário
      if (currentBudget.value?.id === budgetId) {
        await fetchById(budgetId)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover auto-budget'
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
    budgets,
    currentBudget,
    exceededBudgets,
    isLoading,
    error,
    // Getters
    activeBudgets,
    totalBudgeted,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    checkExceeded,
    createLimit,
    updateLimit,
    deleteLimit,
    setAutoBudget,
    removeAutoBudget,
    clearError,
  }
})
