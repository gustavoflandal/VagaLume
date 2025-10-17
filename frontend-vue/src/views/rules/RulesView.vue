<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRuleStore } from '@/stores/rule'

const store = useRuleStore()

const selectedGroupId = ref<string | null>(null)

onMounted(async () => {
  await store.fetchAllGroups()
})

async function deleteGroup(id: string) {
  if (confirm('Tem certeza que deseja excluir este grupo? Todas as regras serão excluídas.')) {
    try {
      await store.deleteGroup(id)
    } catch (error) {
      console.error('Erro ao excluir grupo:', error)
    }
  }
}

async function selectGroup(groupId: string) {
  selectedGroupId.value = groupId
  await store.fetchGroupById(groupId)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Regras de Automação</h1>
      <div class="flex items-center space-x-2">
        <router-link to="/rules/groups/new" class="btn btn-secondary">
          + Novo Grupo
        </router-link>
        <router-link to="/rules/new" class="btn btn-primary">
          + Nova Regra
        </router-link>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Grupos</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.ruleGroups.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Grupos Ativos</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.activeRuleGroups.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Regras</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.totalRules }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Grupos -->
    <div v-else-if="store.activeRuleGroups.length > 0" class="space-y-4">
      <div
        v-for="group in store.activeRuleGroups"
        :key="group.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ group.title }}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                Ordem: {{ group.order }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-4">{{ group.description }}</p>
            <button
              @click="selectGroup(group.id)"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver regras deste grupo →
            </button>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <router-link
              :to="`/rules/groups/${group.id}/edit`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteGroup(group.id)"
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
      <span class="text-6xl mb-4 block">⚙️</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum grupo de regras cadastrado</h3>
      <p class="text-gray-600 mb-6">Crie um grupo para organizar suas regras de automação!</p>
      <router-link to="/rules/groups/new" class="btn btn-primary">
        + Criar Primeiro Grupo
      </router-link>
    </div>
  </div>
</template>
