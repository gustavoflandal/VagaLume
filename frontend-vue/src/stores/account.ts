import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountService } from '@/services/account.service'
import type { Account, CreateAccountData } from '@/types'

export const useAccountStore = defineStore('account', () => {
  // State
  const accounts = ref<Account[]>([])
  const currentAccount = ref<Account | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeAccounts = computed(() => 
    accounts.value.filter(account => account.isActive !== false)
  )

  const totalBalance = computed(() => 
    activeAccounts.value.reduce((sum, account) => sum + (account.balance || 0), 0)
  )

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      accounts.value = await accountService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar contas'
      console.error('Erro ao buscar contas:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentAccount.value = await accountService.getById(id)
      return currentAccount.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar conta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateAccountData) {
    try {
      isLoading.value = true
      error.value = null
      const newAccount = await accountService.create(data)
      accounts.value.unshift(newAccount)
      return newAccount
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar conta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateAccountData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedAccount = await accountService.update(id, data)
      const index = accounts.value.findIndex(a => a.id === id)
      if (index !== -1) {
        accounts.value[index] = updatedAccount
      }
      if (currentAccount.value?.id === id) {
        currentAccount.value = updatedAccount
      }
      return updatedAccount
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
      await accountService.delete(id)
      accounts.value = accounts.value.filter(a => a.id !== id)
      if (currentAccount.value?.id === id) {
        currentAccount.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir conta'
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
    accounts,
    currentAccount,
    isLoading,
    error,
    // Getters
    activeAccounts,
    totalBalance,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError,
  }
})
