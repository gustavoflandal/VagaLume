<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, Download, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-vue-next'
import { budgetService } from '@/services/budget.service'
import { transactionService } from '@/services/transaction.service'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()

interface BudgetAnalysis {
  budget: any
  limit: any
  spent: number
  remaining: number
  percentage: number
  status: 'safe' | 'warning' | 'danger' | 'exceeded'
}

const isLoading = ref(true)
const budgets = ref<any[]>([])
const analysis = ref<BudgetAnalysis[]>([])
const totalBudget = ref(0)
const totalSpent = ref(0)
const totalRemaining = ref(0)

// Filtro de período (mês atual por padrão)
const now = new Date()
const startDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0])

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    isLoading.value = true
    
    // Carregar budgets
    const budgetsData = await budgetService.getAll()
    budgets.value = Array.isArray(budgetsData) ? budgetsData : []
    
    // Carregar transações de despesa do período
    const params: any = {
      type: 'EXPENSE',
      startDate: startDate.value,
      endDate: endDate.value,
      limit: 10000
    }
    
    const response = await transactionService.getAll(params)
    const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
    
    // Calcular total gasto
    const totalExpenses = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    
    // Analisar cada budget
    analysis.value = budgets.value
      .filter(budget => budget.active && budget.limits && budget.limits.length > 0)
      .map(budget => {
        // Pegar o limite mais recente que está no período
        const currentLimit = budget.limits.find((limit: any) => {
          const limitStart = new Date(limit.startDate)
          const limitEnd = new Date(limit.endDate)
          const periodStart = new Date(startDate.value)
          const periodEnd = new Date(endDate.value)
          
          return limitStart <= periodEnd && limitEnd >= periodStart
        }) || budget.limits[0]
        
        const limitAmount = currentLimit ? Number(currentLimit.amount) : 0
        const spent = totalExpenses // Simplificado: considera todas as despesas
        const remaining = limitAmount - spent
        const percentage = limitAmount > 0 ? (spent / limitAmount) * 100 : 0
        
        let status: 'safe' | 'warning' | 'danger' | 'exceeded' = 'safe'
        if (percentage >= 100) status = 'exceeded'
        else if (percentage >= 90) status = 'danger'
        else if (percentage >= 70) status = 'warning'
        
        return {
          budget,
          limit: currentLimit,
          spent,
          remaining,
          percentage,
          status
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
    
    // Calcular totais
    totalBudget.value = analysis.value.reduce((sum, a) => sum + (a.limit ? Number(a.limit.amount) : 0), 0)
    totalSpent.value = totalExpenses
    totalRemaining.value = totalBudget.value - totalSpent.value
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    isLoading.value = false
  }
}

// Gráfico de rosca (status geral)
const doughnutChartData = computed(() => ({
  labels: ['Gasto', 'Disponível'],
  datasets: [{
    data: [totalSpent.value, Math.max(0, totalRemaining.value)],
    backgroundColor: ['#EF4444', '#10B981'],
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
}))

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed
          const total = totalBudget.value
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  }
}

// Gráfico de barras (por orçamento)
const barChartData = computed(() => ({
  labels: analysis.value.map(a => a.budget.name),
  datasets: [
    {
      label: 'Gasto',
      data: analysis.value.map(a => a.spent),
      backgroundColor: '#EF4444',
      borderRadius: 8
    },
    {
      label: 'Disponível',
      data: analysis.value.map(a => Math.max(0, a.remaining)),
      backgroundColor: '#10B981',
      borderRadius: 8
    }
  ]
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        callback: (value: any) => formatCurrency(value)
      }
    }
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function getStatusColor(status: string): string {
  const colors = {
    safe: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-orange-600',
    exceeded: 'text-red-600'
  }
  return colors[status as keyof typeof colors] || 'text-gray-600'
}

function getStatusBadge(status: string): { text: string; class: string } {
  const badges = {
    safe: { text: 'Saudável', class: 'bg-green-100 text-green-700' },
    warning: { text: 'Atenção', class: 'bg-yellow-100 text-yellow-700' },
    danger: { text: 'Crítico', class: 'bg-orange-100 text-orange-700' },
    exceeded: { text: 'Estourado', class: 'bg-red-100 text-red-700' }
  }
  return badges[status as keyof typeof badges] || { text: 'Desconhecido', class: 'bg-gray-100 text-gray-700' }
}

function exportCSV() {
  const headers = ['Orçamento', 'Limite', 'Gasto', 'Disponível', 'Percentual', 'Status']
  const rows = analysis.value.map(a => [
    a.budget.name,
    (a.limit ? Number(a.limit.amount) : 0).toFixed(2),
    a.spent.toFixed(2),
    a.remaining.toFixed(2),
    a.percentage.toFixed(1) + '%',
    getStatusBadge(a.status).text
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `analise-orcamentos-${startDate.value}-${endDate.value}.csv`
  link.click()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Análise de Orçamentos</h1>
          <p class="text-gray-600 mt-1">Performance e controle de gastos</p>
        </div>
      </div>
      <button @click="exportCSV" class="btn btn-secondary">
        <Download class="w-5 h-5 mr-2" />
        Exportar CSV
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Período</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Data Inicial
          </label>
          <input
            v-model="startDate"
            type="date"
            class="input"
            @change="loadData"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Data Final
          </label>
          <input
            v-model="endDate"
            type="date"
            class="input"
            @change="loadData"
          />
        </div>
        <div class="flex items-end">
          <button @click="loadData" class="btn btn-primary w-full">
            <Calendar class="w-5 h-5 mr-2" />
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Conteúdo -->
    <div v-else>
      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Total Orçado -->
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 mb-1">Total Orçado</p>
              <p class="text-3xl font-bold">{{ formatCurrency(totalBudget) }}</p>
            </div>
            <TrendingUp class="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <!-- Total Gasto -->
        <div class="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 mb-1">Total Gasto</p>
              <p class="text-3xl font-bold">{{ formatCurrency(totalSpent) }}</p>
              <p class="text-red-100 text-sm mt-1">
                {{ totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0' }}% do orçamento
              </p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-2xl">💸</span>
            </div>
          </div>
        </div>

        <!-- Disponível -->
        <div :class="[
          'card text-white',
          totalRemaining >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
        ]">
          <div class="flex items-center justify-between">
            <div>
              <p class="opacity-90 mb-1">{{ totalRemaining >= 0 ? 'Disponível' : 'Estourado' }}</p>
              <p class="text-3xl font-bold">{{ formatCurrency(Math.abs(totalRemaining)) }}</p>
            </div>
            <component :is="totalRemaining >= 0 ? CheckCircle : AlertTriangle" class="w-12 h-12 opacity-90" />
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Gráfico de Rosca -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Visão Geral</h2>
          <div class="h-80">
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
          </div>
        </div>

        <!-- Gráfico de Barras -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Por Orçamento</h2>
          <div class="h-80">
            <Bar :data="barChartData" :options="barChartOptions" />
          </div>
        </div>
      </div>

      <!-- Lista de Orçamentos -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Detalhamento</h2>
        
        <div v-if="analysis.length === 0" class="text-center py-12 text-gray-500">
          <p class="mb-4">Nenhum orçamento ativo encontrado</p>
          <router-link to="/budgets/new" class="btn btn-primary">
            Criar Primeiro Orçamento
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in analysis"
            :key="item.budget.id"
            class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-xl font-bold text-gray-900">{{ item.budget.name }}</h3>
                  <span :class="['px-3 py-1 text-xs font-medium rounded-full', getStatusBadge(item.status).class]">
                    {{ getStatusBadge(item.status).text }}
                  </span>
                </div>
                <p class="text-sm text-gray-600" v-if="item.limit">
                  Período: {{ formatDate(item.limit.startDate.split('T')[0]) }} a {{ formatDate(item.limit.endDate.split('T')[0]) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(item.limit ? Number(item.limit.amount) : 0) }}</p>
                <p class="text-sm text-gray-600">Limite</p>
              </div>
            </div>

            <!-- Barra de Progresso -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Utilização</span>
                <span :class="['text-sm font-bold', getStatusColor(item.status)]">
                  {{ item.percentage.toFixed(1) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all duration-300"
                  :class="{
                    'bg-green-500': item.status === 'safe',
                    'bg-yellow-500': item.status === 'warning',
                    'bg-orange-500': item.status === 'danger',
                    'bg-red-500': item.status === 'exceeded'
                  }"
                  :style="{ width: `${Math.min(100, item.percentage)}%` }"
                ></div>
              </div>
            </div>

            <!-- Estatísticas -->
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Limite</p>
                <p class="text-lg font-bold text-blue-600">{{ formatCurrency(item.limit ? Number(item.limit.amount) : 0) }}</p>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Gasto</p>
                <p class="text-lg font-bold text-red-600">{{ formatCurrency(item.spent) }}</p>
              </div>
              <div :class="[
                'text-center p-3 rounded-lg',
                item.remaining >= 0 ? 'bg-green-50' : 'bg-orange-50'
              ]">
                <p class="text-sm text-gray-600 mb-1">{{ item.remaining >= 0 ? 'Disponível' : 'Excedido' }}</p>
                <p :class="[
                  'text-lg font-bold',
                  item.remaining >= 0 ? 'text-green-600' : 'text-orange-600'
                ]">
                  {{ formatCurrency(Math.abs(item.remaining)) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
