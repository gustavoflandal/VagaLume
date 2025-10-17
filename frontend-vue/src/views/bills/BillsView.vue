<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBillStore } from '@/stores/bill'

const store = useBillStore()

const showUpcoming = ref(false)

onMounted(async () => {
  await store.fetchAll()
  if (showUpcoming.value) {
    await store.fetchUpcoming(30)
  }
})

async function toggleUpcoming() {
  showUpcoming.value = !showUpcoming.value
  if (showUpcoming.value) {
    await store.fetchUpcoming(30)
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

async function deleteBill(id: string) {
  if (confirm('Tem certeza que deseja excluir esta conta?')) {
    try {
      await store.remove(id)
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
    }
  }
}

async function autoMatchBill(id: string) {
  try {
    await store.autoMatch(id)
    alert('Transações vinculadas automaticamente!')
  } catch (error) {
    console.error('Erro ao vincular transações:', error)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Contas Recorrentes</h1>
      <router-link to="/bills/new" class="btn btn-primary">
        + Nova Conta
      </router-link>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Contas</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.bills.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Contas Ativas</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.activeBills.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total Mensal</p>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(store.totalMonthlyAmount) }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="card mb-6">
      <div class="flex border-b border-gray-200">
        <button
          @click="showUpcoming = false"
          :class="[
            'px-4 py-2 font-medium text-sm',
            !showUpcoming
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Todas as Contas
        </button>
        <button
          @click="toggleUpcoming"
          :class="[
            'px-4 py-2 font-medium text-sm',
            showUpcoming
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Próximas Contas (30 dias)
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Contas -->
    <div v-else-if="!showUpcoming && store.activeBills.length > 0" class="space-y-4">
      <div
        v-for="bill in store.activeBills"
        :key="bill.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ bill.name }}</h3>
              <span
                v-if="bill.automatch"
                class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600"
              >
                Auto-match
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Valor Mínimo</p>
                <p class="font-medium text-gray-900">{{ formatCurrency(bill.amountMin) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Valor Máximo</p>
                <p class="font-medium text-gray-900">{{ formatCurrency(bill.amountMax) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Data</p>
                <p class="font-medium text-gray-900">{{ formatDate(bill.date) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Frequência</p>
                <p class="font-medium text-gray-900">{{ bill.repeatFreq }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="autoMatchBill(bill.id)"
              class="btn btn-sm btn-secondary"
              title="Vincular automaticamente"
            >
              🔗
            </button>
            <router-link
              :to="`/bills/${bill.id}`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteBill(bill.id)"
              class="btn btn-sm btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Próximas Contas -->
    <div v-else-if="showUpcoming && store.upcomingBills.length > 0" class="space-y-4">
      <div
        v-for="bill in store.upcomingBills"
        :key="bill.id"
        class="card"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ bill.name }}</h3>
            <p class="text-sm text-gray-600">Vencimento: {{ formatDate(bill.nextDate) }}</p>
          </div>
          <p class="text-xl font-bold text-red-600">{{ formatCurrency(bill.amount) }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <span class="text-6xl mb-4 block">📄</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma conta cadastrada</h3>
      <p class="text-gray-600 mb-6">Crie sua primeira conta recorrente para acompanhar seus gastos!</p>
      <router-link to="/bills/new" class="btn btn-primary">
        + Criar Primeira Conta
      </router-link>
    </div>
  </div>
</template>
