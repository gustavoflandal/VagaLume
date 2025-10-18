<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { categoryService } from '@/services/category.service'
import type { Category } from '@/types'
import { X, Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-vue-next'
import IconPicker from '@/components/IconPicker.vue'
import LucideIcon from '@/components/LucideIcon.vue'

const categories = ref<Category[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const showSubcategoryModal = ref(false)
const editingCategory = ref<Category | null>(null)
const parentCategoryForSub = ref<Category | null>(null)
const expandedCategories = ref<Set<string>>(new Set())

const form = ref({
  name: '',
  color: '#6366f1',
  icon: 'Folder',
  parentId: ''
})

const subcategoryForm = ref({
  name: '',
  color: '#6366f1',
  icon: 'Folder'
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

onMounted(async () => {
  await loadCategories()
})

// Categorias principais (sem parent)
const mainCategories = computed(() => {
  return categories.value.filter(c => !c.parentId)
})

// Obter subcategorias de uma categoria
function getSubcategories(parentId: string): Category[] {
  return categories.value.filter(c => c.parentId === parentId)
}

// Toggle expansão de categoria
function toggleCategory(categoryId: string) {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

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
    icon: 'Folder',
    parentId: ''
  }
  showModal.value = true
}

function openSubcategoryModal(parentCategory: Category) {
  parentCategoryForSub.value = parentCategory
  subcategoryForm.value = {
    name: '',
    color: parentCategory.color || '#6366f1',
    icon: parentCategory.icon || 'Folder'
  }
  showSubcategoryModal.value = true
}

function closeSubcategoryModal() {
  showSubcategoryModal.value = false
  parentCategoryForSub.value = null
}

function openEditModal(category: Category) {
  editingCategory.value = category
  form.value = {
    name: category.name,
    color: category.color || '#6366f1',
    icon: category.icon || 'Folder',
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

async function handleSubcategorySubmit() {
  try {
    if (!parentCategoryForSub.value) return
    
    const data = {
      ...subcategoryForm.value,
      parentId: parentCategoryForSub.value.id
    }
    
    await categoryService.create(data)
    await loadCategories()
    
    // Expandir a categoria pai automaticamente
    expandedCategories.value.add(parentCategoryForSub.value.id)
    
    closeSubcategoryModal()
  } catch (error) {
    console.error('Erro ao criar subcategoria:', error)
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
        <Plus class="h-5 w-5" />
        <span>Nova Categoria</span>
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <div v-else-if="!categories || categories.length === 0" class="card text-center py-12">
      <p class="text-gray-500 mb-4">Nenhuma categoria cadastrada</p>
      <button @click="openCreateModal" class="btn-primary inline-flex items-center space-x-2">
        <Plus class="h-5 w-5" />
        <span>Criar primeira categoria</span>
      </button>
    </div>

    <div v-else-if="categories && categories.length > 0" class="space-y-4">
      <!-- Categorias Principais -->
      <div
        v-for="parentCategory in mainCategories"
        :key="parentCategory.id"
        class="card"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <!-- Bot\u00e3o de expandir/recolher -->
            <button
              v-if="getSubcategories(parentCategory.id).length > 0"
              @click="toggleCategory(parentCategory.id)"
              class="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown 
                v-if="expandedCategories.has(parentCategory.id)" 
                class="h-5 w-5 text-gray-500"
              />
              <ChevronRight 
                v-else 
                class="h-5 w-5 text-gray-500"
              />
            </button>
            <div v-else class="w-7"></div>
            
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: parentCategory.color + '20' }"
            >
              <LucideIcon :name="parentCategory.icon || 'Folder'" :size="28" class="text-gray-700" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ parentCategory.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ getSubcategories(parentCategory.id).length }} subcategoria(s)
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="openSubcategoryModal(parentCategory)"
              class="p-2 text-gray-400 hover:text-green-500 transition-colors"
              title="Adicionar subcategoria"
            >
              <Plus class="h-5 w-5" />
            </button>
            <button
              @click="openEditModal(parentCategory)"
              class="p-2 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Pencil class="h-5 w-5" />
            </button>
            <button
              @click="handleDelete(parentCategory.id)"
              class="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Subcategorias (expans\u00edvel) -->
        <div
          v-if="expandedCategories.has(parentCategory.id) && getSubcategories(parentCategory.id).length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200"
        >
          <div
            v-for="childCategory in getSubcategories(parentCategory.id)"
            :key="childCategory.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div class="flex items-center space-x-2">
              <LucideIcon :name="childCategory.icon || 'Folder'" :size="20" class="text-gray-700" />
              <span class="text-sm font-medium text-gray-900">{{ childCategory.name }}</span>
            </div>
            <div class="flex space-x-1">
              <button
                @click="openEditModal(childCategory)"
                class="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Pencil class="h-4 w-4" />
              </button>
              <button
                @click="handleDelete(childCategory.id)"
                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 class="h-4 w-4" />
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
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: orphanCategory.color + '20' }"
            >
              <LucideIcon :name="orphanCategory.icon || 'Folder'" :size="28" class="text-gray-700" />
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
              <Pencil class="h-5 w-5" />
            </button>
            <button
              @click="handleDelete(orphanCategory.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 class="h-5 w-5" />
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
            <X class="h-6 w-6" />
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
            <IconPicker v-model="form.icon" />
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

    <!-- Modal de Nova Subcategoria -->
    <div
      v-if="showSubcategoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeSubcategoryModal"
    >
      <div class="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            Nova Subcategoria de "{{ parentCategoryForSub?.name }}"
          </h2>
          <button @click="closeSubcategoryModal" class="text-gray-400 hover:text-gray-600">
            <X class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubcategorySubmit" class="space-y-4">
          <div>
            <label for="subname" class="block text-sm font-medium text-gray-700 mb-1">
              Nome da subcategoria
            </label>
            <input
              id="subname"
              v-model="subcategoryForm.name"
              type="text"
              required
              class="input"
              placeholder="Ex: Restaurantes, Supermercado..."
            />
          </div>

          <div>
            <label for="subicon" class="block text-sm font-medium text-gray-700 mb-1">
              Ícone
            </label>
            <IconPicker v-model="subcategoryForm.icon" />
          </div>

          <div>
            <label for="subcolor" class="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="colorOption in colorOptions"
                :key="colorOption.value"
                type="button"
                @click="subcategoryForm.color = colorOption.value"
                :class="[
                  'w-10 h-10 rounded-full transition-transform hover:scale-110',
                  subcategoryForm.color === colorOption.value ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                ]"
                :style="{ backgroundColor: colorOption.value }"
                :title="colorOption.label"
              ></button>
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeSubcategoryModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              Criar Subcategoria
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

