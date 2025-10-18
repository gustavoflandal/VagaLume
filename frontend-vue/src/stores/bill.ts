import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { billService } from '@/services/bill.service'
import type { Bill, CreateBillData, BillStatistics, BillInstallment } from '@/services/bill.service'

export const useBillStore = defineStore('bill', () => {
  // State
  const bills = ref<Bill[]>([])
  const currentBill = ref<Bill | null>(null)
  const upcomingBills = ref<any[]>([])
  const statistics = ref<BillStatistics | null>(null)
  const installments = ref<BillInstallment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeBills = computed(() => 
    bills.value.filter(bill => bill.active)
  )

  const totalMonthlyAmount = computed(() => 
    activeBills.value.reduce((sum, bill) => {
      // Soma o valor total de todas as parcelas cadastradas
      const installmentCount = bill._count?.installments ?? 0
      return sum + (bill.amount * installmentCount)
    }, 0)
  )

  // Valor do mês: parcelas vincendas no mês + atrasadas não pagas
  const monthlyDueAmount = computed(() => {
    if (!installments.value || installments.value.length === 0) return 0
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return installments.value
      .filter(inst => {
        if (!inst || inst.paid) return false
        const dueDate = new Date(inst.dueDate)
        // Parcelas do mês atual ou atrasadas
        return dueDate <= new Date(currentYear, currentMonth + 1, 0)
      })
      .reduce((sum, inst) => {
        const amount = Number(inst.amount)
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
  })

  // Parcelas vencidas (passadas e não pagas)
  const overdueAmount = computed(() => {
    if (!installments.value || installments.value.length === 0) return 0
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    return installments.value
      .filter(inst => {
        if (!inst || inst.paid) return false
        const dueDate = new Date(inst.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < now
      })
      .reduce((sum, inst) => {
        const amount = Number(inst.amount)
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
  })

  const overdueCount = computed(() => {
    if (!installments.value || installments.value.length === 0) return 0
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    return installments.value.filter(inst => {
      if (!inst || inst.paid) return false
      const dueDate = new Date(inst.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < now
    }).length
  })

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      bills.value = await billService.getAll()
      // Buscar também todas as parcelas para cálculos
      await fetchAllInstallments()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar contas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllInstallments() {
    try {
      installments.value = await billService.getAllInstallments()
    } catch (err: any) {
      console.error('Erro ao carregar parcelas:', err)
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
      await billService.update(id, data)
      // Recarregar todos os dados para garantir sincronização
      await fetchAll()
      return bills.value.find(b => b.id === id)
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

  async function updateInstallment(installmentId: string, data: any) {
    try {
      isLoading.value = true
      error.value = null
      await billService.updateInstallment(installmentId, data)
      // Recarregar todos os dados após atualizar parcela
      await fetchAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar parcela'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteInstallment(installmentId: string) {
    try {
      isLoading.value = true
      error.value = null
      await billService.deleteInstallment(installmentId)
      // Recarregar todos os dados após excluir parcela
      await fetchAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir parcela'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function regenerateInstallments(billId: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await billService.regenerateInstallments(billId)
      // Recarregar todos os dados após regenerar parcelas
      await fetchAll()
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao regenerar parcelas'
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
    installments,
    isLoading,
    error,
    // Getters
    activeBills,
    totalMonthlyAmount,
    monthlyDueAmount,
    overdueAmount,
    overdueCount,
    // Actions
    fetchAll,
    fetchAllInstallments,
    fetchById,
    create,
    update,
    remove,
    fetchUpcoming,
    autoMatch,
    linkTransaction,
    fetchStatistics,
    updateInstallment,
    deleteInstallment,
    regenerateInstallments,
    clearError,
  }
})
