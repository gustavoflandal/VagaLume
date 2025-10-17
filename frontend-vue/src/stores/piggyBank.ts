import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { piggyBankService } from '@/services/piggyBank.service'
import type { PiggyBank, CreatePiggyBankData, PiggyBankStatistics } from '@/services/piggyBank.service'

export const usePiggyBankStore = defineStore('piggyBank', () => {
  // State
  const piggyBanks = ref<PiggyBank[]>([])
  const currentPiggyBank = ref<PiggyBank | null>(null)
  const statistics = ref<PiggyBankStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activePiggyBanks = computed(() => 
    piggyBanks.value.filter(pb => pb.active)
  )

  const completedPiggyBanks = computed(() => 
    piggyBanks.value.filter(pb => pb.currentAmount >= pb.targetAmount)
  )

  const totalSaved = computed(() => 
    piggyBanks.value.reduce((sum, pb) => sum + pb.currentAmount, 0)
  )

  const totalTarget = computed(() => 
    piggyBanks.value.reduce((sum, pb) => sum + pb.targetAmount, 0)
  )

  // Actions
  async function fetchAll(includeInactive = false) {
    try {
      isLoading.value = true
      error.value = null
      piggyBanks.value = await piggyBankService.getAll(includeInactive)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar cofrinhos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentPiggyBank.value = await piggyBankService.getById(id)
      return currentPiggyBank.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar cofrinho'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreatePiggyBankData) {
    try {
      isLoading.value = true
      error.value = null
      const newPiggyBank = await piggyBankService.create(data)
      piggyBanks.value.push(newPiggyBank)
      return newPiggyBank
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar cofrinho'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreatePiggyBankData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedPiggyBank = await piggyBankService.update(id, data)
      const index = piggyBanks.value.findIndex(pb => pb.id === id)
      if (index !== -1) {
        piggyBanks.value[index] = updatedPiggyBank
      }
      if (currentPiggyBank.value?.id === id) {
        currentPiggyBank.value = updatedPiggyBank
      }
      return updatedPiggyBank
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar cofrinho'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await piggyBankService.delete(id)
      piggyBanks.value = piggyBanks.value.filter(pb => pb.id !== id)
      if (currentPiggyBank.value?.id === id) {
        currentPiggyBank.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir cofrinho'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addMoney(id: string, amount: number, date?: string) {
    try {
      isLoading.value = true
      error.value = null
      const updatedPiggyBank = await piggyBankService.addMoney(id, amount, date)
      const index = piggyBanks.value.findIndex(pb => pb.id === id)
      if (index !== -1) {
        piggyBanks.value[index] = updatedPiggyBank
      }
      if (currentPiggyBank.value?.id === id) {
        currentPiggyBank.value = updatedPiggyBank
      }
      return updatedPiggyBank
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao adicionar dinheiro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeMoney(id: string, amount: number, date?: string) {
    try {
      isLoading.value = true
      error.value = null
      const updatedPiggyBank = await piggyBankService.removeMoney(id, amount, date)
      const index = piggyBanks.value.findIndex(pb => pb.id === id)
      if (index !== -1) {
        piggyBanks.value[index] = updatedPiggyBank
      }
      if (currentPiggyBank.value?.id === id) {
        currentPiggyBank.value = updatedPiggyBank
      }
      return updatedPiggyBank
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover dinheiro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      isLoading.value = true
      error.value = null
      statistics.value = await piggyBankService.getStatistics()
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
    piggyBanks,
    currentPiggyBank,
    statistics,
    isLoading,
    error,
    // Getters
    activePiggyBanks,
    completedPiggyBanks,
    totalSaved,
    totalTarget,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    addMoney,
    removeMoney,
    fetchStatistics,
    clearError,
  }
})
