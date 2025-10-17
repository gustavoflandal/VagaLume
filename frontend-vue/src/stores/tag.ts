import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tagService } from '@/services/tag.service'
import type { Tag, CreateTagData, TagStatistics } from '@/services/tag.service'

export const useTagStore = defineStore('tag', () => {
  // State
  const tags = ref<Tag[]>([])
  const currentTag = ref<Tag | null>(null)
  const tagCloud = ref<any[]>([])
  const statistics = ref<TagStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalTags = computed(() => tags.value.length)

  const tagsWithLocation = computed(() => 
    tags.value.filter(tag => tag.latitude && tag.longitude)
  )

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      tags.value = await tagService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar tags'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentTag.value = await tagService.getById(id)
      return currentTag.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar tag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateTagData) {
    try {
      isLoading.value = true
      error.value = null
      const newTag = await tagService.create(data)
      tags.value.push(newTag)
      return newTag
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar tag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateTagData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedTag = await tagService.update(id, data)
      const index = tags.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }
      if (currentTag.value?.id === id) {
        currentTag.value = updatedTag
      }
      return updatedTag
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar tag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await tagService.delete(id)
      tags.value = tags.value.filter(t => t.id !== id)
      if (currentTag.value?.id === id) {
        currentTag.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir tag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCloud() {
    try {
      isLoading.value = true
      error.value = null
      tagCloud.value = await tagService.getCloud()
      return tagCloud.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar nuvem de tags'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function search(query: string) {
    try {
      isLoading.value = true
      error.value = null
      const results = await tagService.search(query)
      return results
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar tags'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function linkToTransaction(tagId: string, transactionId: string) {
    try {
      isLoading.value = true
      error.value = null
      await tagService.linkToTransaction(tagId, transactionId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao vincular tag à transação'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function unlinkFromTransaction(tagId: string, transactionId: string) {
    try {
      isLoading.value = true
      error.value = null
      await tagService.unlinkFromTransaction(tagId, transactionId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao desvincular tag da transação'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      isLoading.value = true
      error.value = null
      statistics.value = await tagService.getStatistics()
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
    tags,
    currentTag,
    tagCloud,
    statistics,
    isLoading,
    error,
    // Getters
    totalTags,
    tagsWithLocation,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    fetchCloud,
    search,
    linkToTransaction,
    unlinkFromTransaction,
    fetchStatistics,
    clearError,
  }
})
