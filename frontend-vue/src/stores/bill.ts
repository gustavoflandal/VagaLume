import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { billService } from '@/services/bill.service'
import type { Bill, CreateBillData, BillStatistics } from '@/services/bill.service'

export const useBillStore = defineStore('bill', () => {
  // State
  const bills = ref<Bill[]>([])
  const currentBill = ref<Bill | null>(null)
  const upcomingBills = ref<any[]>([])
  const statistics = ref<BillStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeBills = computed(() => 
    bills.value.filter(bill => bill.active)
  )

  const paidBills = computed(() => 
    bills.value.filter(bill => bill.skip === 0)
  )

  const totalMonthlyAmount = computed(() => 
    activeBills.value.reduce((sum, bill) => sum + bill.amountMax, 0)
  )

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      bills.value = await billService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar contas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentBill.value = await billService.getById(id)
      return currentBill.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar conta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateBillData) {
    try {
      isLoading.value = true
      error.value = null
      const newBill = await billService.create(data)
      bills.value.push(newBill)
      return newBill
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar conta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateBillData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedBill = await billService.update(id, data)
      const index = bills.value.findIndex(b => b.id === id)
      if (index !== -1) {
        bills.value[index] = updatedBill
      }
      if (currentBill.value?.id === id) {
        currentBill.value = updatedBill
      }
      return updatedBill
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar conta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await billService.delete(id)
      bills.value = bills.value.filter(b => b.id !== id)
      if (currentBill.value?.id === id) {
        currentBill.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir conta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUpcoming(days = 30) {
    try {
      isLoading.value = true
      error.value = null
      upcomingBills.value = await billService.getUpcoming(days)
      return upcomingBills.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar contas próximas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function autoMatch(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await billService.autoMatch(id)
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao vincular automaticamente'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function linkTransaction(id: string, transactionId: string) {
    try {
      isLoading.value = true
      error.value = null
      await billService.linkTransaction(id, transactionId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao vincular transação'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      isLoading.value = true
      error.value = null
      statistics.value = await billService.getStatistics()
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
    bills,
    currentBill,
    upcomingBills,
    statistics,
    isLoading,
    error,
    // Getters
    activeBills,
    paidBills,
    totalMonthlyAmount,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    fetchUpcoming,
    autoMatch,
    linkTransaction,
    fetchStatistics,
    clearError,
  }
})
