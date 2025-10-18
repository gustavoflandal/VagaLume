<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { Plus, Edit, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-vue-next'

const store = useBudgetStore()

onMounted(async () => {
  await store.fetchAll()
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

function getCurrentLimit(budget: any) {
  if (!budget.limits || budget.limits.length === 0) return null
  
  const now = new Date()
  return budget.limits.find((limit: any) => {
    const start = new Date(limit.startDate)
    const end = new Date(limit.endDate)
    return start <= now && end >= now
  }) || budget.limits[0]
}

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
        <Plus class="w-5 h-5 mr-2" />
        Novo Orçamento
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
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-xl font-bold text-gray-900">{{ budget.name }}</h3>
              <span v-if="budget.autoBudget" class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                Auto-Budget
              </span>
            </div>
            
            <div v-if="getCurrentLimit(budget)" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Limite Atual</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(Number(getCurrentLimit(budget).amount)) }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Período</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatDate(getCurrentLimit(budget).startDate) }} a {{ formatDate(getCurrentLimit(budget).endDate) }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3" v-if="budget.autoBudget">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Tipo Auto-Budget</p>
                  <p class="text-sm font-medium text-gray-900">{{ budget.autoBudget.type }}</p>
                </div>
              </div>
            </div>
            
            <p v-else class="text-sm text-gray-600 mt-2">Nenhum limite configurado</p>
          </div>
          
          <div class="flex items-center space-x-2">
            <router-link
              :to="`/budgets/${budget.id}/edit`"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit class="w-5 h-5" />
            </router-link>
            <button
              @click="deleteBudget(budget.id)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <DollarSign class="w-10 h-10 text-blue-600" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum orçamento cadastrado</h3>
      <p class="text-gray-600 mb-6">Crie seu primeiro orçamento para controlar seus gastos!</p>
      <router-link to="/budgets/new" class="btn btn-primary">
        <Plus class="w-5 h-5 mr-2" />
        Criar Primeiro Orçamento
      </router-link>
    </div>
  </div>
</template>
