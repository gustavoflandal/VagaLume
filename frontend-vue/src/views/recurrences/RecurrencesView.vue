<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRecurrenceStore } from '@/stores/recurrence'

const store = useRecurrenceStore()

const showInactive = ref(false)

onMounted(async () => {
  await store.fetchAll(showInactive.value)
})

async function toggleShowInactive() {
  showInactive.value = !showInactive.value
  await store.fetchAll(showInactive.value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

async function deleteRecurrence(id: string) {
  if (confirm('Tem certeza que deseja excluir esta recorrência?')) {
    try {
      await store.remove(id)
    } catch (error) {
      console.error('Erro ao excluir recorrência:', error)
    }
  }
}

async function generateAll() {
  if (confirm('Gerar todas as transações recorrentes pendentes?')) {
    try {
      await store.generateAll()
      alert('Transações geradas com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar transações:', error)
    }
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Transações Recorrentes</h1>
      <div class="flex items-center space-x-2">
        <button
          @click="generateAll"
          class="btn btn-secondary"
        >
          🔄 Gerar Todas
        </button>
        <router-link to="/recurrences/new" class="btn btn-primary">
          + Nova Recorrência
        </router-link>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Recorrências</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.recurrences.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Recorrências Ativas</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.activeRecurrences.length }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="showInactive"
          @change="toggleShowInactive"
          class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="text-sm text-gray-700">Mostrar inativas</span>
      </label>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Recorrências -->
    <div v-else-if="store.activeRecurrences.length > 0" class="space-y-4">
      <div
        v-for="recurrence in store.activeRecurrences"
        :key="recurrence.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ recurrence.title }}</h3>
              <span
                v-if="recurrence.applyRules"
                class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600"
              >
                Aplica Regras
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ recurrence.description }}</p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Primeira Data</p>
                <p class="font-medium text-gray-900">{{ formatDate(recurrence.firstDate) }}</p>
              </div>
              <div v-if="recurrence.repeatUntil">
                <p class="text-gray-600">Repetir Até</p>
                <p class="font-medium text-gray-900">{{ formatDate(recurrence.repeatUntil) }}</p>
              </div>
              <div v-if="recurrence.repetitions">
                <p class="text-gray-600">Repetições</p>
                <p class="font-medium text-gray-900">{{ recurrence.repetitions }}x</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <router-link
              :to="`/recurrences/${recurrence.id}`"
              class="btn btn-sm btn-primary"
            >
              Ver Próximas
            </router-link>
            <router-link
              :to="`/recurrences/${recurrence.id}/edit`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteRecurrence(recurrence.id)"
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
      <span class="text-6xl mb-4 block">🔄</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma recorrência cadastrada</h3>
      <p class="text-gray-600 mb-6">Crie sua primeira transação recorrente!</p>
      <router-link to="/recurrences/new" class="btn btn-primary">
        + Criar Primeira Recorrência
      </router-link>
    </div>
  </div>
</template>
