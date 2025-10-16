<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoryService } from '@/services/category.service'
import type { Category } from '@/types'
import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'

const categories = ref<Category[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const editingCategory = ref<Category | null>(null)

const form = ref({
  name: '',
  color: '#6366f1',
  icon: '📁',
  parentId: ''
})

const colorOptions = [
  { value: '#6366f1', label: 'Índigo' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#f97316', label: 'Laranja' },
  { value: '#eab308', label: 'Amarelo' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#14b8a6', label: 'Turquesa' },
  { value: '#06b6d4', label: 'Ciano' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#64748b', label: 'Cinza' }
]

const iconOptions = [
  '📁', '🏠', '🚗', '🍔', '💊', '🎓', '🎮', '🎬', '🏋️', '✈️',
  '🛒', '💼', '💰', '💳', '🎁', '📱', '💻', '🔧', '🎨', '📚',
  '🍕', '☕', '🏥', '⚡', '🎵', '👕', '🏦', '🎯', '📈', '🔑'
]

onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
  try {
    isLoading.value = true
    const categoriesData = await categoryService.getAll()
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  editingCategory.value = null
  form.value = {
    name: '',
    color: '#6366f1',
    icon: '📁',
    parentId: ''
  }
  showModal.value = true
}

function openEditModal(category: Category) {
  editingCategory.value = category
  form.value = {
    name: category.name,
    color: category.color || '#6366f1',
    icon: category.icon || '📁',
    parentId: category.parentId || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function handleSubmit() {
  try {
    const data = {
      ...form.value,
      parentId: form.value.parentId || undefined
    }
    
    if (editingCategory.value) {
      await categoryService.update(editingCategory.value.id, data)
    } else {
      await categoryService.create(data)
    }
    await loadCategories()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar categoria:', error)
  }
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

  try {
    await categoryService.delete(id)
    await loadCategories()
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
  }
}

function getParentCategories() {
  return categories.value.filter(cat => !cat.parentId)
}

function getChildCategories(parentId: string) {
  return categories.value.filter(cat => cat.parentId === parentId)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Categorias</h1>
      <button @click="openCreateModal" class="btn-primary flex items-center space-x-2">
        <PlusIcon class="h-5 w-5" />
        <span>Nova Categoria</span>
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <div v-else-if="!categories || categories.length === 0" class="card text-center py-12">
      <p class="text-gray-500 mb-4">Nenhuma categoria cadastrada</p>
      <button @click="openCreateModal" class="btn-primary inline-flex items-center space-x-2">
        <PlusIcon class="h-5 w-5" />
        <span>Criar primeira categoria</span>
      </button>
    </div>

    <div v-else-if="categories && categories.length > 0" class="space-y-6">
      <!-- Categorias Principais -->
      <div
        v-for="parentCategory in getParentCategories()"
        :key="parentCategory.id"
        class="card"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :style="{ backgroundColor: parentCategory.color + '20' }"
            >
              {{ parentCategory.icon }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ parentCategory.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ getChildCategories(parentCategory.id).length }} subcategoria(s)
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="openEditModal(parentCategory)"
              class="p-1 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              @click="handleDelete(parentCategory.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Subcategorias -->
        <div
          v-if="getChildCategories(parentCategory.id).length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200"
        >
          <div
            v-for="childCategory in getChildCategories(parentCategory.id)"
            :key="childCategory.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <span class="text-xl">{{ childCategory.icon }}</span>
              <span class="text-sm font-medium text-gray-900">{{ childCategory.name }}</span>
            </div>
            <div class="flex space-x-1">
              <button
                @click="openEditModal(childCategory)"
                class="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click="handleDelete(childCategory.id)"
                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categorias sem Pai -->
      <div
        v-for="orphanCategory in categories.filter(cat => cat.parentId && !categories.find(p => p.id === cat.parentId))"
        :key="orphanCategory.id"
        class="card"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :style="{ backgroundColor: orphanCategory.color + '20' }"
            >
              {{ orphanCategory.icon }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ orphanCategory.name }}</h3>
              <p class="text-sm text-gray-500">Categoria órfã</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="openEditModal(orphanCategory)"
              class="p-1 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              @click="handleDelete(orphanCategory.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criar/Editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingCategory ? 'Editar Categoria' : 'Nova Categoria' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nome da categoria
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Ex: Alimentação, Transporte..."
            />
          </div>

          <div>
            <label for="icon" class="block text-sm font-medium text-gray-700 mb-1">
              Ícone
            </label>
            <div class="grid grid-cols-10 gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                type="button"
                @click="form.icon = icon"
                :class="[
                  'p-2 text-2xl rounded-lg hover:bg-gray-100 transition-colors',
                  form.icon === icon ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-gray-50'
                ]"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <div>
            <label for="color" class="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="colorOption in colorOptions"
                :key="colorOption.value"
                type="button"
                @click="form.color = colorOption.value"
                :class="[
                  'w-10 h-10 rounded-full transition-transform hover:scale-110',
                  form.color === colorOption.value ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                ]"
                :style="{ backgroundColor: colorOption.value }"
                :title="colorOption.label"
              ></button>
            </div>
          </div>

          <div>
            <label for="parentId" class="block text-sm font-medium text-gray-700 mb-1">
              Categoria pai (opcional)
            </label>
            <select id="parentId" v-model="form.parentId" class="input">
              <option value="">Categoria principal</option>
              <option
                v-for="category in getParentCategories()"
                :key="category.id"
                :value="category.id"
                :disabled="editingCategory?.id === category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              {{ editingCategory ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
