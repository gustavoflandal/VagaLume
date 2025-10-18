<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, Download } from 'lucide-vue-next'
import { transactionService } from '@/services/transaction.service'
import { categoryService } from '@/services/category.service'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'
import type { Category } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const router = useRouter()

interface CategoryExpense {
  category: Category
  total: number
  count: number
  percentage: number
}

const isLoading = ref(true)
const categories = ref<Category[]>([])
const expenses = ref<CategoryExpense[]>([])
const totalExpenses = ref(0)

// Filtros
const startDate = ref('')
const endDate = ref('')

// Definir período padrão (mês atual)
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
startDate.value = firstDay.toISOString().split('T')[0]
endDate.value = lastDay.toISOString().split('T')[0]

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    isLoading.value = true
    
    // Carregar categorias
    const categoriesData = await categoryService.getAll()
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
    
    // Carregar transações de despesa
    const params: any = {
      type: 'EXPENSE',
      startDate: startDate.value,
      endDate: endDate.value,
      limit: 1000 // Buscar todas
    }
    
    const response = await transactionService.getAll(params)
    const transactions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
    
    // Agrupar por categoria
    const categoryMap = new Map<string, { total: number; count: number }>()
    
    transactions.forEach(transaction => {
      if (transaction.categoryId) {
        const existing = categoryMap.get(transaction.categoryId) || { total: 0, count: 0 }
        existing.total += Number(transaction.amount)
        existing.count += 1
        categoryMap.set(transaction.categoryId, existing)
      }
    })
    
    // Calcular total
    totalExpenses.value = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.total, 0)
    
    // Criar array de despesas por categoria
    expenses.value = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => {
        const category = categories.value.find(c => c.id === categoryId)
        return {
          category: category || { id: categoryId, name: 'Sem Categoria', color: '#999999', icon: 'help-circle' } as Category,
          total: data.total,
          count: data.count,
          percentage: totalExpenses.value > 0 ? (data.total / totalExpenses.value) * 100 : 0
        }
      })
      .sort((a, b) => b.total - a.total)
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    isLoading.value = false
  }
}

// Dados do gráfico de pizza
const pieChartData = computed(() => ({
  labels: expenses.value.map(e => e.category.name),
  datasets: [{
    data: expenses.value.map(e => e.total),
    backgroundColor: expenses.value.map(e => e.category.color),
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
}))

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed
          const percentage = ((value / totalExpenses.value) * 100).toFixed(1)
          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  }
}

// Dados do gráfico de barras
const barChartData = computed(() => ({
  labels: expenses.value.map(e => e.category.name),
  datasets: [{
    label: 'Gastos',
    data: expenses.value.map(e => e.total),
    backgroundColor: expenses.value.map(e => e.category.color),
    borderRadius: 8
  }]
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `Gastos: ${formatCurrency(context.parsed.y)}`
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

function formatDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function exportCSV() {
  const headers = ['Categoria', 'Total', 'Quantidade', 'Percentual']
  const rows = expenses.value.map(e => [
    e.category.name,
    e.total.toFixed(2),
    e.count.toString(),
    e.percentage.toFixed(2) + '%'
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `gastos-por-categoria-${startDate.value}-${endDate.value}.csv`
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
          <h1 class="text-3xl font-bold text-gray-900">Gastos por Categoria</h1>
          <p class="text-gray-600 mt-1">Análise detalhada dos seus gastos</p>
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
      <!-- Total -->
      <div class="card mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-100 mb-1">Total de Despesas</p>
            <p class="text-4xl font-bold">{{ formatCurrency(totalExpenses) }}</p>
            <p class="text-red-100 mt-2">
              Período: {{ formatDate(startDate) }} a {{ formatDate(endDate) }}
            </p>
          </div>
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span class="text-4xl">💸</span>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Gráfico de Pizza -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Distribuição por Categoria</h2>
          <div class="h-80">
            <Pie :data="pieChartData" :options="pieChartOptions" />
          </div>
        </div>

        <!-- Gráfico de Barras -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Comparação de Gastos</h2>
          <div class="h-80">
            <Bar :data="barChartData" :options="barChartOptions" />
          </div>
        </div>
      </div>

      <!-- Tabela Detalhada -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Detalhamento por Categoria</h2>
        
        <div v-if="expenses.length === 0" class="text-center py-12 text-gray-500">
          Nenhuma despesa encontrada no período selecionado
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transações
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentual
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="expense in expenses" :key="expense.category.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: expense.category.color }"
                    ></div>
                    <span class="font-medium text-gray-900">{{ expense.category.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                  {{ formatCurrency(expense.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                  {{ expense.count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full"
                        :style="{
                          width: `${expense.percentage}%`,
                          backgroundColor: expense.category.color
                        }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">
                      {{ expense.percentage.toFixed(1) }}%
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                  {{ formatCurrency(expense.total / expense.count) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
