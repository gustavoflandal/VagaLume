<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTagStore } from '@/stores/tag'

const store = useTagStore()

const searchQuery = ref('')
const searchResults = ref<any[]>([])

onMounted(async () => {
  await store.fetchAll()
  await store.fetchCloud()
})

async function handleSearch() {
  if (searchQuery.value.trim()) {
    searchResults.value = await store.search(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

async function deleteTag(id: string) {
  if (confirm('Tem certeza que deseja excluir esta tag?')) {
    try {
      await store.remove(id)
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
    }
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Tags</h1>
      <router-link to="/tags/new" class="btn btn-primary">
        + Nova Tag
      </router-link>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Tags</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.totalTags }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Tags com Localização</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.tagsWithLocation.length }}</p>
      </div>
    </div>

    <!-- Busca -->
    <div class="card mb-6">
      <div class="flex items-center space-x-4">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Buscar tags..."
          class="flex-1 input"
        />
        <button @click="handleSearch" class="btn btn-secondary">
          🔍 Buscar
        </button>
      </div>
    </div>

    <!-- Nuvem de Tags -->
    <div v-if="store.tagCloud.length > 0" class="card mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Nuvem de Tags (Top 50)</h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in store.tagCloud"
          :key="tag.tag"
          :style="{ fontSize: `${12 + tag.count / 2}px` }"
          class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 cursor-pointer transition-colors"
        >
          {{ tag.tag }} ({{ tag.count }})
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Resultados de Busca -->
    <div v-else-if="searchResults.length > 0" class="space-y-4">
      <h2 class="text-xl font-bold text-gray-900">Resultados da Busca</h2>
      <div
        v-for="tag in searchResults"
        :key="tag.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ tag.tag }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ tag.description }}</p>
            <div v-if="tag.latitude && tag.longitude" class="text-xs text-gray-500">
              📍 {{ tag.latitude }}, {{ tag.longitude }}
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <router-link
              :to="`/tags/${tag.id}/edit`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteTag(tag.id)"
              class="btn btn-sm btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Todas as Tags -->
    <div v-else-if="store.tags.length > 0" class="space-y-4">
      <h2 class="text-xl font-bold text-gray-900">Todas as Tags</h2>
      <div
        v-for="tag in store.tags"
        :key="tag.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ tag.tag }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ tag.description }}</p>
            <div v-if="tag.latitude && tag.longitude" class="text-xs text-gray-500">
              📍 {{ tag.latitude }}, {{ tag.longitude }}
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <router-link
              :to="`/tags/${tag.id}/edit`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteTag(tag.id)"
              class="btn btn-sm btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <span class="text-6xl mb-4 block">🏷️</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma tag cadastrada</h3>
      <p class="text-gray-600 mb-6">Crie sua primeira tag para organizar suas transações!</p>
      <router-link to="/tags/new" class="btn btn-primary">
        + Criar Primeira Tag
      </router-link>
    </div>
  </div>
</template>
