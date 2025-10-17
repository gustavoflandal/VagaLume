import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionLinkService } from '@/services/transactionLink.service'
import type { TransactionLink, TransactionLinkType, CreateTransactionLinkData, CreateLinkTypeData } from '@/services/transactionLink.service'

export const useTransactionLinkStore = defineStore('transactionLink', () => {
  // State
  const transactionLinks = ref<TransactionLink[]>([])
  const currentTransactionLink = ref<TransactionLink | null>(null)
  const linkTypes = ref<TransactionLinkType[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const editableLinkTypes = computed(() => 
    linkTypes.value.filter(type => type.editable)
  )

  const systemLinkTypes = computed(() => 
    linkTypes.value.filter(type => !type.editable)
  )

  const totalLinks = computed(() => transactionLinks.value.length)

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      transactionLinks.value = await transactionLinkService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar vínculos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentTransactionLink.value = await transactionLinkService.getById(id)
      return currentTransactionLink.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchByTransaction(transactionId: string) {
    try {
      isLoading.value = true
      error.value = null
      const links = await transactionLinkService.getByTransaction(transactionId)
      return links
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar vínculos da transação'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateTransactionLinkData) {
    try {
      isLoading.value = true
      error.value = null
      const newLink = await transactionLinkService.create(data)
      transactionLinks.value.push(newLink)
      return newLink
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateTransactionLinkData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedLink = await transactionLinkService.update(id, data)
      const index = transactionLinks.value.findIndex(l => l.id === id)
      if (index !== -1) {
        transactionLinks.value[index] = updatedLink
      }
      if (currentTransactionLink.value?.id === id) {
        currentTransactionLink.value = updatedLink
      }
      return updatedLink
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await transactionLinkService.delete(id)
      transactionLinks.value = transactionLinks.value.filter(l => l.id !== id)
      if (currentTransactionLink.value?.id === id) {
        currentTransactionLink.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Link Types
  async function fetchAllTypes() {
    try {
      isLoading.value = true
      error.value = null
      linkTypes.value = await transactionLinkService.getAllTypes()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar tipos de vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createType(data: CreateLinkTypeData) {
    try {
      isLoading.value = true
      error.value = null
      const newType = await transactionLinkService.createType(data)
      linkTypes.value.push(newType)
      return newType
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar tipo de vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateType(id: string, data: Partial<CreateLinkTypeData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedType = await transactionLinkService.updateType(id, data)
      const index = linkTypes.value.findIndex(t => t.id === id)
      if (index !== -1) {
        linkTypes.value[index] = updatedType
      }
      return updatedType
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar tipo de vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteType(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await transactionLinkService.deleteType(id)
      linkTypes.value = linkTypes.value.filter(t => t.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir tipo de vínculo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function seedDefaultTypes() {
    try {
      isLoading.value = true
      error.value = null
      const defaultTypes = await transactionLinkService.seedDefaultTypes()
      linkTypes.value = [...linkTypes.value, ...defaultTypes]
      return defaultTypes
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar tipos padrão'
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
    transactionLinks,
    currentTransactionLink,
    linkTypes,
    isLoading,
    error,
    // Getters
    editableLinkTypes,
    systemLinkTypes,
    totalLinks,
    // Actions
    fetchAll,
    fetchById,
    fetchByTransaction,
    create,
    update,
    remove,
    fetchAllTypes,
    createType,
    updateType,
    deleteType,
    seedDefaultTypes,
    clearError,
  }
})
