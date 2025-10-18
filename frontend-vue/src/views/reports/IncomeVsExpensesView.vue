<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, Download, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { transactionService } from '@/services/transaction.service'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const router = useRouter()

interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

const isLoading = ref(true)
const monthlyData = ref<MonthlyData[]>([])
const totalIncome = ref(0)
const totalExpenses = ref(0)
const totalBalance = ref(0)

// Filtros
const startDate = ref('')
const endDate = ref('')
const viewType = ref<'monthly' | 'yearly'>('monthly')

// Definir período padrão (últimos 12 meses)
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth() - 11, 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
startDate.value = firstDay.toISOString().split('T')[0]
endDate.value = lastDay.toISOString().split('T')[0]

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    isLoading.value = true
    
    // Carregar transações
    const params: any = {
      startDate: startDate.value,
      endDate: endDate.value,
      limit: 10000
    }
    
    const response = await transactionService.getAll(params)
    const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
    
    // Agrupar por mês
    const monthMap = new Map<string, { income: number; expenses: number }>()
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existing = monthMap.get(monthKey) || { income: 0, expenses: 0 }
      
      if (transaction.type === 'INCOME') {
        existing.income += Number(transaction.amount)
      } else if (transaction.type === 'EXPENSE') {
        existing.expenses += Number(transaction.amount)
      }
      
      monthMap.set(monthKey, existing)
    })
    
    // Criar array ordenado
    monthlyData.value = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
    
    // Calcular totais
    totalIncome.value = monthlyData.value.reduce((sum, item) => sum + item.income, 0)
    totalExpenses.value = monthlyData.value.reduce((sum, item) => sum + item.expenses, 0)
    totalBalance.value = totalIncome.value - totalExpenses.value
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    isLoading.value = false
  }
}

// Dados do gráfico de linha
const lineChartData = computed(() => ({
  labels: monthlyData.value.map(d => formatMonthLabel(d.month)),
  datasets: [
    {
      label: 'Receitas',
      data: monthlyData.value.map(d => d.income),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Despesas',
      data: monthlyData.value.map(d => d.expenses),
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Saldo',
      data: monthlyData.value.map(d => d.balance),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const lineChartOptions = {
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
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => formatCurrency(value)
      }
    }
  }
}

// Dados do gráfico de barras
const barChartData = computed(() => ({
  labels: monthlyData.value.map(d => formatMonthLabel(d.month)),
  datasets: [
    {
      label: 'Receitas',
      data: monthlyData.value.map(d => d.income),
      backgroundColor: '#10B981',
      borderRadius: 8
    },
    {
      label: 'Despesas',
      data: monthlyData.value.map(d => d.expenses),
      backgroundColor: '#EF4444',
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
    y: {
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

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(monthNum) - 1]}/${year}`
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function exportCSV() {
  const headers = ['Mês', 'Receitas', 'Despesas', 'Saldo']
  const rows = monthlyData.value.map(d => [
    formatMonthLabel(d.month),
    d.income.toFixed(2),
    d.expenses.toFixed(2),
    d.balance.toFixed(2)
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `receitas-vs-despesas-${startDate.value}-${endDate.value}.csv`
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
          <h1 class="text-3xl font-bold text-gray-900">Receitas vs Despesas</h1>
          <p class="text-gray-600 mt-1">Comparativo mensal de entradas e saídas</p>
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
        <!-- Total Receitas -->
        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 mb-1">Total de Receitas</p>
              <p class="text-3xl font-bold">{{ formatCurrency(totalIncome) }}</p>
            </div>
            <TrendingUp class="w-12 h-12 text-green-100" />
          </div>
        </div>

        <!-- Total Despesas -->
        <div class="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 mb-1">Total de Despesas</p>
              <p class="text-3xl font-bold">{{ formatCurrency(totalExpenses) }}</p>
            </div>
            <TrendingDown class="w-12 h-12 text-red-100" />
          </div>
        </div>

        <!-- Saldo -->
        <div :class="[
          'card text-white',
          totalBalance >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
        ]">
          <div class="flex items-center justify-between">
            <div>
              <p class="opacity-90 mb-1">Saldo do Período</p>
              <p class="text-3xl font-bold">{{ formatCurrency(totalBalance) }}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-2xl">{{ totalBalance >= 0 ? '💰' : '⚠️' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <!-- Gráfico de Linha -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Evolução Mensal</h2>
          <div class="h-96">
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
        </div>

        <!-- Gráfico de Barras -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Comparação Mensal</h2>
          <div class="h-96">
            <Bar :data="barChartData" :options="barChartOptions" />
          </div>
        </div>
      </div>

      <!-- Tabela Detalhada -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Detalhamento Mensal</h2>
        
        <div v-if="monthlyData.length === 0" class="text-center py-12 text-gray-500">
          Nenhum dado encontrado no período selecionado
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receitas
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Despesas
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa de Economia
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="data in monthlyData" :key="data.month" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {{ formatMonthLabel(data.month) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                  {{ formatCurrency(data.income) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold text-red-600">
                  {{ formatCurrency(data.expenses) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-bold" :class="data.balance >= 0 ? 'text-blue-600' : 'text-orange-600'">
                  {{ formatCurrency(data.balance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    data.income > 0 && (data.balance / data.income) >= 0.2 ? 'bg-green-100 text-green-700' :
                    data.income > 0 && (data.balance / data.income) >= 0.1 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  ]">
                    {{ data.income > 0 ? ((data.balance / data.income) * 100).toFixed(1) : '0.0' }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
