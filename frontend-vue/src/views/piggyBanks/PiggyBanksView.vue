<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePiggyBankStore } from '@/stores/piggyBank'

const store = usePiggyBankStore()

const showInactive = ref(false)

const displayedPiggyBanks = computed(() => 
  showInactive.value ? store.piggyBanks : store.activePiggyBanks
)

onMounted(async () => {
  await store.fetchAll(showInactive.value)
})

async function toggleShowInactive() {
  showInactive.value = !showInactive.value
  await store.fetchAll(showInactive.value)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function calculateProgress(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100)
}

async function deletePiggyBank(id: string) {
  if (confirm('Tem certeza que deseja excluir este cofrinho?')) {
    try {
      await store.remove(id)
    } catch (error) {
      console.error('Erro ao excluir cofrinho:', error)
    }
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Cofrinhos</h1>
      <router-link
        to="/piggy-banks/new"
        class="btn btn-primary"
      >
        + Novo Cofrinho
      </router-link>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Cofrinhos</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.piggyBanks.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Ativos</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.activePiggyBanks.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total Economizado</p>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(store.totalSaved) }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Meta Total</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(store.totalTarget) }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="showInactive"
            @change="toggleShowInactive"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-gray-700">Mostrar inativos</span>
        </label>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Cofrinhos -->
    <div v-else-if="displayedPiggyBanks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="piggyBank in displayedPiggyBanks"
        :key="piggyBank.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ piggyBank.name }}</h3>
            <p class="text-sm text-gray-600">Meta de economia</p>
          </div>
          <span
            v-if="!piggyBank.active"
            class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
          >
            Inativo
          </span>
        </div>

        <!-- Progresso -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">Progresso</span>
            <span class="text-sm font-medium text-gray-900">
              {{ calculateProgress(piggyBank.currentAmount, piggyBank.targetAmount) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${calculateProgress(piggyBank.currentAmount, piggyBank.targetAmount)}%` }"
            ></div>
          </div>
        </div>

        <!-- Valores -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-xs text-gray-600">Atual</p>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(piggyBank.currentAmount) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-600">Meta</p>
            <p class="text-lg font-bold text-gray-900">{{ formatCurrency(piggyBank.targetAmount) }}</p>
          </div>
        </div>

        <!-- Ações -->
        <div class="flex items-center space-x-2">
          <router-link
            :to="`/piggy-banks/${piggyBank.id}`"
            class="flex-1 btn btn-sm btn-secondary"
          >
            Ver Detalhes
          </router-link>
          <button
            @click="deletePiggyBank(piggyBank.id)"
            class="btn btn-sm btn-danger"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <span class="text-6xl mb-4 block">🐷</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum cofrinho cadastrado</h3>
      <p class="text-gray-600 mb-6">Crie seu primeiro cofrinho para começar a economizar!</p>
      <router-link to="/piggy-banks/new" class="btn btn-primary">
        + Criar Primeiro Cofrinho
      </router-link>
    </div>
  </div>
</template>
