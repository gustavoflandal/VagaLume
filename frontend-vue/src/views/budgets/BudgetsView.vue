<script setup lang="ts">
import { onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'

const store = useBudgetStore()

onMounted(async () => {
  await store.fetchAll()
})

async function deleteBudget(id: string) {
  if (confirm('Tem certeza que deseja excluir este orçamento?')) {
    try {
      await store.remove(id)
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)
    }
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Orçamentos</h1>
      <router-link to="/budgets/new" class="btn btn-primary">
        + Novo Orçamento
      </router-link>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Orçamentos</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.budgets.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Orçamentos Ativos</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.activeBudgets.length }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Orçamentos -->
    <div v-else-if="store.activeBudgets.length > 0" class="space-y-4">
      <div
        v-for="budget in store.activeBudgets"
        :key="budget.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ budget.name }}</h3>
            <p class="text-sm text-gray-600">Clique para gerenciar limites e auto-budgets</p>
          </div>
          <div class="flex items-center space-x-2">
            <router-link
              :to="`/budgets/${budget.id}`"
              class="btn btn-sm btn-primary"
            >
              Gerenciar
            </router-link>
            <router-link
              :to="`/budgets/${budget.id}/edit`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteBudget(budget.id)"
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
      <span class="text-6xl mb-4 block">💰</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum orçamento cadastrado</h3>
      <p class="text-gray-600 mb-6">Crie seu primeiro orçamento para controlar seus gastos!</p>
      <router-link to="/budgets/new" class="btn btn-primary">
        + Criar Primeiro Orçamento
      </router-link>
    </div>
  </div>
</template>
