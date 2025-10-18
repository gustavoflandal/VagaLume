<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Calendar, Download, CheckCircle, Clock, AlertCircle } from 'lucide-vue-next'
import { billService } from '@/services/bill.service'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'
import type { Bill, BillInstallment } from '@/services/bill.service'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()

interface BillAnalysis {
  bill: Bill
  totalInstallments: number
  paidInstallments: number
  pendingInstallments: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  completionRate: number
}

const isLoading = ref(true)
const bills = ref<Bill[]>([])
const installments = ref<BillInstallment[]>([])
const analysis = ref<BillAnalysis[]>([])

// Estatísticas gerais
const totalBills = computed(() => bills.value.length)
const totalInstallments = computed(() => installments.value.length)
const paidInstallments = computed(() => installments.value.filter(i => i.paid).length)
const pendingInstallments = computed(() => installments.value.filter(i => !i.paid).length)
const totalAmount = computed(() => installments.value.reduce((sum, i) => sum + Number(i.amount), 0))
const paidAmount = computed(() => installments.value.filter(i => i.paid).reduce((sum, i) => sum + Number(i.amountPaid || i.amount), 0))
const pendingAmount = computed(() => installments.value.filter(i => !i.paid).reduce((sum, i) => sum + Number(i.amount), 0))

// Filtros
const statusFilter = ref<'all' | 'active' | 'completed'>('all')
const sortBy = ref<'name' | 'amount' | 'completion'>('name')

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    isLoading.value = true
    
    // Carregar bills
    const billsData = await billService.getAll()
    bills.value = Array.isArray(billsData) ? billsData : []
    
    // Carregar todas as parcelas
    const installmentsData = await billService.getAllInstallments()
    installments.value = Array.isArray(installmentsData) ? installmentsData : []
    
    // Criar análise por bill
    analysis.value = bills.value.map(bill => {
      const billInstallments = installments.value.filter(i => i.bill?.id === bill.id)
      const paid = billInstallments.filter(i => i.paid)
      const pending = billInstallments.filter(i => !i.paid)
      
      const totalAmount = billInstallments.reduce((sum, i) => sum + Number(i.amount), 0)
      const paidAmount = paid.reduce((sum, i) => sum + Number(i.amountPaid || i.amount), 0)
      const pendingAmount = pending.reduce((sum, i) => sum + Number(i.amount), 0)
      
      return {
        bill,
        totalInstallments: billInstallments.length,
        paidInstallments: paid.length,
        pendingInstallments: pending.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        completionRate: billInstallments.length > 0 ? (paid.length / billInstallments.length) * 100 : 0
      }
    })
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    isLoading.value = false
  }
}

// Análise filtrada
const filteredAnalysis = computed(() => {
  let filtered = [...analysis.value]
  
  // Filtro de status
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(a => a.pendingInstallments > 0)
  } else if (statusFilter.value === 'completed') {
    filtered = filtered.filter(a => a.pendingInstallments === 0 && a.totalInstallments > 0)
  }
  
  // Ordenação
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.bill.name.localeCompare(b.bill.name)
      case 'amount':
        return b.totalAmount - a.totalAmount
      case 'completion':
        return b.completionRate - a.completionRate
      default:
        return 0
    }
  })
  
  return filtered
})

// Dados do gráfico de pizza (Status)
const statusChartData = computed(() => ({
  labels: ['Pagas', 'Pendentes'],
  datasets: [{
    data: [paidInstallments.value, pendingInstallments.value],
    backgroundColor: ['#10B981', '#F59E0B'],
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
}))

const statusChartOptions = {
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
          const total = paidInstallments.value + pendingInstallments.value
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
          return `${context.label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}

// Dados do gráfico de barras (Top 5 bills por valor)
const topBillsChartData = computed(() => {
  const top5 = [...analysis.value]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)
  
  return {
    labels: top5.map(a => a.bill.name),
    datasets: [
      {
        label: 'Pago',
        data: top5.map(a => a.paidAmount),
        backgroundColor: '#10B981',
        borderRadius: 8
      },
      {
        label: 'Pendente',
        data: top5.map(a => a.pendingAmount),
        backgroundColor: '#F59E0B',
        borderRadius: 8
      }
    ]
  }
})

const topBillsChartOptions = {
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

function getStatusColor(completionRate: number): string {
  if (completionRate === 100) return 'text-green-600'
  if (completionRate >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function getStatusBadge(completionRate: number): { text: string; class: string } {
  if (completionRate === 100) {
    return { text: 'Concluída', class: 'bg-green-100 text-green-700' }
  }
  if (completionRate >= 50) {
    return { text: 'Em Andamento', class: 'bg-yellow-100 text-yellow-700' }
  }
  return { text: 'Iniciando', class: 'bg-blue-100 text-blue-700' }
}

function exportCSV() {
  const headers = ['Conta', 'Total Parcelas', 'Pagas', 'Pendentes', 'Valor Total', 'Valor Pago', 'Valor Pendente', 'Conclusão']
  const rows = analysis.value.map(a => [
    a.bill.name,
    a.totalInstallments.toString(),
    a.paidInstallments.toString(),
    a.pendingInstallments.toString(),
    a.totalAmount.toFixed(2),
    a.paidAmount.toFixed(2),
    a.pendingAmount.toFixed(2),
    a.completionRate.toFixed(1) + '%'
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `contas-recorrentes-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 class="text-3xl font-bold text-gray-900">Contas Recorrentes</h1>
          <p class="text-gray-600 mt-1">Análise de gastos fixos e parcelas</p>
        </div>
      </div>
      <button @click="exportCSV" class="btn btn-secondary">
        <Download class="w-5 h-5 mr-2" />
        Exportar CSV
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Conteúdo -->
    <div v-else>
      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <!-- Total de Contas -->
        <div class="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 mb-1">Total de Contas</p>
              <p class="text-4xl font-bold">{{ totalBills }}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-2xl">📄</span>
            </div>
          </div>
        </div>

        <!-- Parcelas Pagas -->
        <div class="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 mb-1">Parcelas Pagas</p>
              <p class="text-4xl font-bold">{{ paidInstallments }}</p>
              <p class="text-green-100 text-sm mt-1">{{ formatCurrency(paidAmount) }}</p>
            </div>
            <CheckCircle class="w-12 h-12 text-green-100" />
          </div>
        </div>

        <!-- Parcelas Pendentes -->
        <div class="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 mb-1">Parcelas Pendentes</p>
              <p class="text-4xl font-bold">{{ pendingInstallments }}</p>
              <p class="text-yellow-100 text-sm mt-1">{{ formatCurrency(pendingAmount) }}</p>
            </div>
            <Clock class="w-12 h-12 text-yellow-100" />
          </div>
        </div>

        <!-- Total Geral -->
        <div class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 mb-1">Valor Total</p>
              <p class="text-4xl font-bold">{{ formatCurrency(totalAmount) }}</p>
              <p class="text-blue-100 text-sm mt-1">{{ totalInstallments }} parcelas</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select v-model="statusFilter" class="input">
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select v-model="sortBy" class="input">
                <option value="name">Nome</option>
                <option value="amount">Valor</option>
                <option value="completion">Conclusão</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Gráfico de Status -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Status das Parcelas</h2>
          <div class="h-80">
            <Pie :data="statusChartData" :options="statusChartOptions" />
          </div>
        </div>

        <!-- Top 5 Contas -->
        <div class="card">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Top 5 Contas por Valor</h2>
          <div class="h-80">
            <Bar :data="topBillsChartData" :options="topBillsChartOptions" />
          </div>
        </div>
      </div>

      <!-- Lista de Contas -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Detalhamento por Conta</h2>
        
        <div v-if="filteredAnalysis.length === 0" class="text-center py-12 text-gray-500">
          Nenhuma conta encontrada com os filtros selecionados
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in filteredAnalysis"
            :key="item.bill.id"
            class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <!-- Header da Conta -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-xl font-bold text-gray-900">{{ item.bill.name }}</h3>
                  <span :class="['px-3 py-1 text-xs font-medium rounded-full', getStatusBadge(item.completionRate).class]">
                    {{ getStatusBadge(item.completionRate).text }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  {{ item.bill.numberOfInstallments }}x de {{ formatCurrency(item.bill.amount) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(item.totalAmount) }}</p>
                <p class="text-sm text-gray-600">Valor Total</p>
              </div>
            </div>

            <!-- Barra de Progresso -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Progresso de Pagamento</span>
                <span :class="['text-sm font-bold', getStatusColor(item.completionRate)]">
                  {{ item.completionRate.toFixed(1) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all duration-300"
                  :class="item.completionRate === 100 ? 'bg-green-500' : item.completionRate >= 50 ? 'bg-yellow-500' : 'bg-blue-500'"
                  :style="{ width: `${item.completionRate}%` }"
                ></div>
              </div>
            </div>

            <!-- Estatísticas -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Total Parcelas</p>
                <p class="text-lg font-bold text-gray-900">{{ item.totalInstallments }}</p>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Pagas</p>
                <p class="text-lg font-bold text-green-600">{{ item.paidInstallments }}</p>
                <p class="text-xs text-gray-600">{{ formatCurrency(item.paidAmount) }}</p>
              </div>
              <div class="text-center p-3 bg-yellow-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Pendentes</p>
                <p class="text-lg font-bold text-yellow-600">{{ item.pendingInstallments }}</p>
                <p class="text-xs text-gray-600">{{ formatCurrency(item.pendingAmount) }}</p>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Média/Parcela</p>
                <p class="text-lg font-bold text-blue-600">
                  {{ formatCurrency(item.totalInstallments > 0 ? item.totalAmount / item.totalInstallments : 0) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
