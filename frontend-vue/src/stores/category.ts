import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryService } from '@/services/category.service'
import type { Category, CreateCategoryData } from '@/types'

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeCategories = computed(() => 
    categories.value.filter(category => category.isActive !== false)
  )

  const rootCategories = computed(() => 
    activeCategories.value.filter(category => !category.parentId)
  )

  const getCategoryById = computed(() => (id: string) => 
    categories.value.find(category => category.id === id)
  )

  const getSubcategories = computed(() => (parentId: string) => 
    activeCategories.value.filter(category => category.parentId === parentId)
  )

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      categories.value = await categoryService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar categorias'
      console.error('Erro ao buscar categorias:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentCategory.value = await categoryService.getById(id)
      return currentCategory.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar categoria'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateCategoryData) {
    try {
      isLoading.value = true
      error.value = null
      const newCategory = await categoryService.create(data)
      categories.value.unshift(newCategory)
      return newCategory
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar categoria'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateCategoryData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedCategory = await categoryService.update(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      if (currentCategory.value?.id === id) {
        currentCategory.value = updatedCategory
      }
      return updatedCategory
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar categoria'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await categoryService.delete(id)
      categories.value = categories.value.filter(c => c.id !== id)
      if (currentCategory.value?.id === id) {
        currentCategory.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir categoria'
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
    categories,
    currentCategory,
    isLoading,
    error,
    // Getters
    activeCategories,
    rootCategories,
    getCategoryById,
    getSubcategories,
    // Actions
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError,
  }
})
