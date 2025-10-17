import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { objectGroupService } from '@/services/objectGroup.service'
import type { ObjectGroup, CreateObjectGroupData } from '@/services/objectGroup.service'

export const useObjectGroupStore = defineStore('objectGroup', () => {
  // State
  const objectGroups = ref<ObjectGroup[]>([])
  const currentObjectGroup = ref<ObjectGroup | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedGroups = computed(() => 
    [...objectGroups.value].sort((a, b) => a.order - b.order)
  )

  const totalGroups = computed(() => objectGroups.value.length)

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      objectGroups.value = await objectGroupService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar grupos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentObjectGroup.value = await objectGroupService.getById(id)
      return currentObjectGroup.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateObjectGroupData) {
    try {
      isLoading.value = true
      error.value = null
      const newGroup = await objectGroupService.create(data)
      objectGroups.value.push(newGroup)
      return newGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateObjectGroupData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedGroup = await objectGroupService.update(id, data)
      const index = objectGroups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        objectGroups.value[index] = updatedGroup
      }
      if (currentObjectGroup.value?.id === id) {
        currentObjectGroup.value = updatedGroup
      }
      return updatedGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await objectGroupService.delete(id)
      objectGroups.value = objectGroups.value.filter(g => g.id !== id)
      if (currentObjectGroup.value?.id === id) {
        currentObjectGroup.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function reorder(groupIds: string[]) {
    try {
      isLoading.value = true
      error.value = null
      await objectGroupService.reorder(groupIds)
      // Recarrega os grupos para refletir a nova ordem
      await fetchAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao reordenar grupos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function linkPiggyBank(groupId: string, piggyBankId: string) {
    try {
      isLoading.value = true
      error.value = null
      await objectGroupService.linkPiggyBank(groupId, piggyBankId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao vincular cofrinho ao grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function unlinkPiggyBank(groupId: string, piggyBankId: string) {
    try {
      isLoading.value = true
      error.value = null
      await objectGroupService.unlinkPiggyBank(groupId, piggyBankId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao desvincular cofrinho do grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function linkBill(groupId: string, billId: string) {
    try {
      isLoading.value = true
      error.value = null
      await objectGroupService.linkBill(groupId, billId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao vincular conta ao grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function unlinkBill(groupId: string, billId: string) {
    try {
      isLoading.value = true
      error.value = null
      await objectGroupService.unlinkBill(groupId, billId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao desvincular conta do grupo'
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
    objectGroups,
    currentObjectGroup,
    isLoading,
    error,
    // Getters
    sortedGroups,
    totalGroups,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    reorder,
    linkPiggyBank,
    unlinkPiggyBank,
    linkBill,
    unlinkBill,
    clearError,
  }
})
