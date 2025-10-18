<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next'
import LucideIcon from '@/components/LucideIcon.vue'
import { accountService } from '@/services/account.service'
import { transactionService } from '@/services/transaction.service'
import { categoryService } from '@/services/category.service'
import type { Account, Transaction, Category } from '@/types'

// Registrar componentes do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const router = useRouter()

const accounts = ref<Account[]>([])
const monthTransactions = ref<Transaction[]>([])
const yearTransactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const loadingYearData = ref(true)

const totalBalance = ref(0)
const totalIncome = ref(0)
const totalExpense = ref(0)
const currentYear = new Date().getFullYear()

async function calculateAccountBalance(accountId: string): Promise<number> {
  try {
    const response = await transactionService.getAll({ accountId, limit: 1000 })
    const transactions = Array.isArray(response?.data) ? response.data : []
    
    if (!transactions.length) return 0
    
    // Ordenar por data e calcular saldo
    const sorted = transactions.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
    
    let balance = 0
    sorted.forEach(transaction => {
      if (transaction.fromAccountId === accountId) {
        balance -= Number(transaction.amount)
      } else if (transaction.toAccountId === accountId) {
        balance += Number(transaction.amount)
      }
    })
    
    return balance
  } catch (error) {
    console.error('Erro ao calcular saldo da conta:', accountId, error)
    return 0
  }
}

async function calculateMonthSummary() {
  try {
    // Calcular primeiro e último dia do mês corrente
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const startDate = firstDay.toISOString().split('T')[0]
    const endDate = lastDay.toISOString().split('T')[0]
    
    // Buscar todas as transações do mês
    const response = await transactionService.getAll({ 
      startDate, 
      endDate,
      limit: 1000 
    })
    
    const transactions = Array.isArray(response?.data) ? response.data : []
    monthTransactions.value = transactions
    
    let income = 0
    let expense = 0
    
    transactions.forEach(transaction => {
      if (transaction.type === 'INCOME') {
        income += Number(transaction.amount)
      } else if (transaction.type === 'EXPENSE') {
        expense += Number(transaction.amount)
      }
      // Transferências não contam no total (apenas movem entre contas)
    })
    
    totalIncome.value = income
    totalExpense.value = expense
  } catch (error) {
    console.error('Erro ao calcular resumo do mês:', error)
    totalIncome.value = 0
    totalExpense.value = 0
  }
}

// Agrupar transações por categoria
const categoryTotals = computed(() => {
  const totals: Record<string, { name: string; total: number; count: number; color: string }> = {}
  
  monthTransactions.value.forEach(transaction => {
    // Apenas despesas (receitas geralmente não têm categorias específicas)
    if (transaction.type === 'EXPENSE' && transaction.categoryId) {
      const category = categories.value.find(c => c.id === transaction.categoryId)
      const categoryName = category?.name || 'Sem categoria'
      const categoryColor = category?.color || '#6B7280'
      
      if (!totals[transaction.categoryId]) {
        totals[transaction.categoryId] = {
          name: categoryName,
          total: 0,
          count: 0,
          color: categoryColor
        }
      }
      
      totals[transaction.categoryId].total += Number(transaction.amount)
      totals[transaction.categoryId].count += 1
    }
  })
  
  // Converter para array e ordenar por total (maior para menor)
  return Object.values(totals).sort((a, b) => b.total - a.total)
})

// Calcular o total máximo para a escala do gráfico
const maxCategoryTotal = computed(() => {
  if (categoryTotals.value.length === 0) return 0
  return Math.max(...categoryTotals.value.map(c => c.total))
})

// Carregar transações do ano corrente
async function loadYearTransactions() {
  try {
    loadingYearData.value = true
    
    const startDate = `${currentYear}-01-01`
    const endDate = `${currentYear}-12-31`
    
    const response = await transactionService.getAll({ 
      startDate, 
      endDate,
      limit: 10000
    })
    
    yearTransactions.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error('Erro ao carregar transações do ano:', error)
    yearTransactions.value = []
  } finally {
    loadingYearData.value = false
  }
}

// Dados para o gráfico de receitas por categoria
const incomeChartData = computed(() => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  
  // Agrupar receitas por categoria e mês
  const dataByCategory: Record<string, number[]> = {}
  
  // Inicializar todas as categorias com zeros
  categories.value.forEach(category => {
    dataByCategory[category.id] = Array(12).fill(0)
  })
  
  // Adicionar categoria para receitas sem categoria
  dataByCategory['no-category'] = Array(12).fill(0)
  
  // Processar transações de receita
  yearTransactions.value
    .filter(t => t.type === 'INCOME')
    .forEach(transaction => {
      const month = new Date(transaction.date).getMonth()
      const categoryId = transaction.categoryId || 'no-category'
      
      if (!dataByCategory[categoryId]) {
        dataByCategory[categoryId] = Array(12).fill(0)
      }
      
      dataByCategory[categoryId][month] += Number(transaction.amount)
    })
  
  // Criar datasets para o gráfico (apenas categorias com valores)
  const datasets = Object.entries(dataByCategory)
    .filter(([_, values]) => values.some(v => v > 0))
    .map(([categoryId, values]) => {
      const category = categories.value.find(c => c.id === categoryId)
      return {
        label: category?.name || 'Sem categoria',
        data: values,
        backgroundColor: category?.color || '#6B7280',
        borderColor: category?.color || '#6B7280',
        borderWidth: 1
      }
    })
  
  return {
    labels: monthNames,
    datasets
  }
})

// Dados para o gráfico de despesas totais
const expenseChartData = computed(() => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const monthlyExpenses = Array(12).fill(0)
  
  // Processar transações de despesa
  yearTransactions.value
    .filter(t => t.type === 'EXPENSE')
    .forEach(transaction => {
      const month = new Date(transaction.date).getMonth()
      monthlyExpenses[month] += Number(transaction.amount)
    })
  
  return {
    labels: monthNames,
    datasets: [{
      label: 'Despesas Totais',
      data: monthlyExpenses,
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      borderWidth: 1
    }]
  }
})

// Calcular total de receitas do ano
const totalYearIncome = computed(() => {
  return yearTransactions.value
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

// Calcular total de despesas do ano
const totalYearExpense = computed(() => {
  return yearTransactions.value
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

// Opções do gráfico de receitas
const incomeChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 10,
        font: {
          size: 11
        }
      }
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
      stacked: true,
      grid: {
        display: false
      }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        callback: (value: any) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
        }
      }
    }
  }
}))

// Opções do gráfico de despesas
const expenseChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `Despesas: ${formatCurrency(context.parsed.y)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
        }
      }
    }
  }
}))

onMounted(async () => {
  try {
    isLoading.value = true
    
    // Carregar contas
    const accountsData = await accountService.getAll()
    
    if (!Array.isArray(accountsData)) {
      accounts.value = []
      return
    }
    
    // Calcular saldo real de cada conta baseado nas transações
    const accountsWithBalance = await Promise.all(
      accountsData.map(async (account) => {
        try {
          const calculatedBalance = await calculateAccountBalance(account.id)
          return { ...account, balance: calculatedBalance }
        } catch (error) {
          console.error(`Erro ao calcular saldo da conta ${account.name}:`, error)
          return account
        }
      })
    )
    
    accounts.value = accountsWithBalance
    
    // Calcular saldo total
    totalBalance.value = accounts.value.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    
    // Carregar categorias
    const categoriesData = await categoryService.getAll()
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
    
    // Calcular receitas e despesas do mês corrente
    await calculateMonthSummary()
    
    // Carregar dados do ano para os gráficos
    await loadYearTransactions()
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    accounts.value = []
    monthTransactions.value = []
  } finally {
    isLoading.value = false
  }
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <div v-else>
      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Receitas do Mês -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Receitas do Mês</p>
              <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalIncome) }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <!-- Despesas do Mês -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Despesas do Mês</p>
              <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalExpense) }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <!-- Saldo Total -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Saldo Total</p>
              <p 
                class="text-2xl font-bold"
                :class="totalBalance >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(totalBalance) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Contas e Transações Recentes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Minhas Contas -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Minhas Contas</h2>
            <router-link to="/accounts" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Ver todas →
            </router-link>
          </div>

          <div v-if="!accounts || accounts.length === 0" class="text-center py-8 text-gray-500">
            Nenhuma conta cadastrada
          </div>

          <div v-else-if="accounts && accounts.length > 0" class="space-y-3">
            <div
              v-for="account in accounts"
              :key="account.id"
              @click="router.push(`/accounts/${account.id}`)"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <LucideIcon :name="account.icon || 'Wallet'" class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ account.name }}</p>
                  <p class="text-xs text-gray-500">{{ account.type }}</p>
                </div>
              </div>
              <p 
                class="font-bold"
                :class="account.balance >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(account.balance) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Despesas por Categoria -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Despesas por Categoria</h2>
            <router-link to="/transactions" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Ver transações →
            </router-link>
          </div>

          <div v-if="categoryTotals.length === 0" class="text-center py-8 text-gray-500">
            <p>Nenhuma despesa registrada este mês</p>
            <p class="text-xs mt-2">As despesas aparecerão aqui agrupadas por categoria</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="category in categoryTotals"
              :key="category.name"
              class="space-y-2"
            >
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: category.color }"
                  ></div>
                  <span class="font-medium text-gray-700">{{ category.name }}</span>
                  <span class="text-gray-400">({{ category.count }})</span>
                </div>
                <span class="font-bold text-gray-900">{{ formatCurrency(category.total) }}</span>
              </div>
              
              <!-- Barra de progresso -->
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{
                    width: `${(category.total / maxCategoryTotal) * 100}%`,
                    backgroundColor: category.color
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos de Evolução Anual -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gráfico de Receitas por Categoria -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Receitas por Categoria ({{ currentYear }})</h2>
            <div v-if="!loadingYearData && totalYearIncome > 0" class="text-right">
              <p class="text-xs text-gray-500">Total</p>
              <p class="text-lg font-bold text-green-600">{{ formatCurrency(totalYearIncome) }}</p>
            </div>
          </div>
          
          <div v-if="loadingYearData" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
          
          <div v-else-if="incomeChartData.datasets.length === 0" class="text-center py-8 text-gray-500">
            <p>Nenhuma receita registrada em {{ currentYear }}</p>
            <p class="text-xs mt-2">As receitas aparecerão aqui agrupadas por categoria e mês</p>
          </div>
          
          <Bar v-else :data="incomeChartData" :options="incomeChartOptions" />
        </div>

        <!-- Gráfico de Despesas Totais -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Despesas Totais ({{ currentYear }})</h2>
            <div v-if="!loadingYearData && totalYearExpense > 0" class="text-right">
              <p class="text-xs text-gray-500">Total</p>
              <p class="text-lg font-bold text-red-600">{{ formatCurrency(totalYearExpense) }}</p>
            </div>
          </div>
          
          <div v-if="loadingYearData" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
          
          <div v-else-if="expenseChartData.datasets[0].data.every((v: number) => v === 0)" class="text-center py-8 text-gray-500">
            <p>Nenhuma despesa registrada em {{ currentYear }}</p>
            <p class="text-xs mt-2">As despesas totais por mês aparecerão aqui</p>
          </div>
          
          <Bar v-else :data="expenseChartData" :options="expenseChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
