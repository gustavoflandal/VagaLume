<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBillStore } from '@/stores/bill'
import { Plus, Calendar, DollarSign, TrendingUp, Link, Pencil, Trash2, FileText, List, AlertCircle, CreditCard, CheckCircle, Clock } from 'lucide-vue-next'
import BillInstallmentsModal from '@/components/BillInstallmentsModal.vue'
import EditInstallmentModal from '@/components/EditInstallmentModal.vue'
import type { BillInstallment } from '@/services/bill.service'

const router = useRouter()
const store = useBillStore()

const showInstallmentsModal = ref(false)
const showEditInstallmentModal = ref(false)
const selectedBillId = ref('')
const selectedBillName = ref('')
const selectedInstallment = ref<BillInstallment | null>(null)
const modalKey = ref(0) // Key para forçar remontagem do modal

const showUpcoming = ref(false)
const activeTab = ref<'bills' | 'upcoming' | 'installments'>('bills')

// Parcelas do mês atual
const monthInstallments = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return store.installments
    .filter(inst => {
      // Extrair data sem timezone
      const dateOnly = inst.dueDate.split('T')[0]
      const [year, month, day] = dateOnly.split('-')
      const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
    })
    .sort((a, b) => {
      const dateA = a.dueDate.split('T')[0]
      const dateB = b.dueDate.split('T')[0]
      return dateA.localeCompare(dateB)
    })
})

// Parcelas do próximo mês
const nextMonthInstallments = computed(() => {
  const now = new Date()
  const nextMonth = now.getMonth() + 1
  const nextYear = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear()
  const targetMonth = nextMonth > 11 ? 0 : nextMonth
  
  return store.installments
    .filter(inst => {
      // Extrair data sem timezone
      const dateOnly = inst.dueDate.split('T')[0]
      const [year, month, day] = dateOnly.split('-')
      const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return dueDate.getMonth() === targetMonth && dueDate.getFullYear() === nextYear
    })
    .sort((a, b) => {
      const dateA = a.dueDate.split('T')[0]
      const dateB = b.dueDate.split('T')[0]
      return dateA.localeCompare(dateB)
    })
})

onMounted(async () => {
  await store.fetchAll()
  if (showUpcoming.value) {
    await store.fetchUpcoming(30)
  }
})

async function toggleUpcoming() {
  showUpcoming.value = !showUpcoming.value
  // Não precisa mais buscar do backend, usamos as parcelas já carregadas
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  // Extrair apenas a data sem conversão de timezone
  const dateOnly = date.split('T')[0]
  const [year, month, day] = dateOnly.split('-')
  return `${day}/${month}/${year}`
}

function translateFrequency(freq: string): string {
  const translations: Record<string, string> = {
    'daily': 'Diário',
    'weekly': 'Semanal',
    'monthly': 'Mensal',
    'quarterly': 'Trimestral',
    'half-year': 'Semestral',
    'yearly': 'Anual'
  }
  return translations[freq] || freq
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

function viewInstallments(billId: string, billName: string) {
  selectedBillId.value = billId
  selectedBillName.value = billName
  showInstallmentsModal.value = true
}

function handleCloseInstallmentsModal() {
  showInstallmentsModal.value = false
  // Store já recarregou os dados automaticamente
}

function handlePayInstallment(installmentId: string) {
  // TODO: Abrir modal de transação com dados preenchidos
  console.log('Pagar parcela:', installmentId)
  alert('Funcionalidade de pagamento será implementada em breve')
}

function handleEditInstallment(installment: BillInstallment) {
  selectedInstallment.value = installment
  showEditInstallmentModal.value = true
}

async function handleDeleteInstallment(installmentId: string) {
  if (!confirm('Tem certeza que deseja excluir esta parcela?')) return
  
  try {
    await store.deleteInstallment(installmentId)
    // Store já recarregou tudo automaticamente
    // Apenas incrementar key para forçar atualização do modal
    modalKey.value++
  } catch (error) {
    console.error('Erro ao excluir parcela:', error)
    alert('Erro ao excluir parcela')
  }
}

function handleInstallmentUpdated() {
  // Fechar modal de edição
  showEditInstallmentModal.value = false
  // Store já recarregou os dados automaticamente
  // Incrementar key para forçar atualização do modal de parcelas
  modalKey.value++
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Contas Recorrentes</h1>
        <p class="text-gray-600 mt-1">Gerencie suas contas fixas mensais</p>
      </div>
      <button @click="router.push('/bills/new')" class="btn btn-primary">
        <Plus class="w-5 h-5 mr-2" />
        Nova Conta
      </button>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total de Contas</p>
            <p class="text-2xl font-bold text-gray-900">{{ store.bills.length }}</p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText class="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Contas Ativas</p>
            <p class="text-2xl font-bold text-primary-600">{{ store.activeBills.length }}</p>
          </div>
          <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Vencidas</p>
            <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(store.overdueAmount) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ store.overdueCount }} parcela{{ store.overdueCount !== 1 ? 's' : '' }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle class="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Valor do Mês</p>
            <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(store.monthlyDueAmount) }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Valor Total</p>
            <p class="text-2xl font-bold text-red-600">{{ formatCurrency(store.totalMonthlyAmount) }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <DollarSign class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="card mb-6">
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'bills'"
          :class="[
            'px-4 py-2 font-medium text-sm',
            activeTab === 'bills'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Todas as Contas
        </button>
        <button
          @click="activeTab = 'installments'"
          :class="[
            'px-4 py-2 font-medium text-sm',
            activeTab === 'installments'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Parcelas do Mês
        </button>
        <button
          @click="activeTab = 'upcoming'; toggleUpcoming()"
          :class="[
            'px-4 py-2 font-medium text-sm',
            activeTab === 'upcoming'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Próximo Mês
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Contas -->
    <div v-else-if="activeTab === 'bills' && store.activeBills.length > 0" class="space-y-4">
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
                v-if="bill._count?.installments"
                class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700"
                :title="`${bill._count.installments} parcela(s) cadastrada(s)`"
              >
                {{ bill._count.installments }} parcela{{ bill._count.installments > 1 ? 's' : '' }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Valor da Parcela</p>
                <p class="font-medium text-gray-900">{{ formatCurrency(bill.amount) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Número de Parcelas</p>
                <p class="font-medium text-gray-900">{{ bill.numberOfInstallments }}x</p>
              </div>
              <div>
                <p class="text-gray-600">Data Inicial</p>
                <p class="font-medium text-gray-900">{{ formatDate(bill.date) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Frequência</p>
                <p class="font-medium text-gray-900">{{ translateFrequency(bill.repeatFreq) }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="viewInstallments(bill.id, bill.name)"
              class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Ver parcelas"
            >
              <List class="w-5 h-5" />
            </button>
            <button
              @click="router.push(`/bills/${bill.id}`)"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil class="w-5 h-5" />
            </button>
            <button
              v-if="!bill._count?.installments || bill._count.installments === 0"
              @click="deleteBill(bill.id)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 class="w-5 h-5" />
            </button>
            <div
              v-else
              class="p-2 text-gray-400"
              title="Exclua todas as parcelas antes de excluir a conta"
            >
              <Trash2 class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parcelas do Mês -->
    <div v-else-if="activeTab === 'installments'" class="space-y-4">
      <div v-if="monthInstallments.length === 0" class="text-center py-12">
        <p class="text-gray-500">Nenhuma parcela para este mês</p>
      </div>
      <div
        v-for="installment in monthInstallments"
        :key="installment.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ installment.bill?.name || 'Conta' }}</h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  installment.paid
                    ? 'bg-green-100 text-green-700'
                    : new Date(installment.dueDate) < new Date()
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                ]"
              >
                {{ installment.paid ? 'Pago' : new Date(installment.dueDate) < new Date() ? 'Vencido' : 'Pendente' }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Parcela</p>
                <p class="font-medium text-gray-900">{{ installment.installmentSequence }}</p>
              </div>
              <div>
                <p class="text-gray-600">Vencimento</p>
                <p class="font-medium text-gray-900">{{ formatDate(installment.dueDate) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Valor</p>
                <p class="font-medium text-gray-900">{{ formatCurrency(installment.amount) }}</p>
              </div>
              <div v-if="installment.paid">
                <p class="text-gray-600">Pago em</p>
                <p class="font-medium text-green-600">{{ formatDate(installment.paidAt!) }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              v-if="!installment.paid"
              @click="handlePayInstallment(installment.id)"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Pagar parcela"
            >
              <CreditCard class="w-5 h-5" />
            </button>
            <div v-else class="p-2 text-green-600">
              <CheckCircle class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Próximo Mês -->
    <div v-else-if="activeTab === 'upcoming' && nextMonthInstallments.length > 0" class="space-y-4">
      <div
        v-for="installment in nextMonthInstallments"
        :key="installment.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ installment.bill?.name || 'Conta' }}</h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  installment.paid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                ]"
              >
                {{ installment.paid ? 'Pago' : 'Próximo Mês' }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Parcela</p>
                <p class="font-medium text-gray-900">{{ installment.installmentSequence }}</p>
              </div>
              <div>
                <p class="text-gray-600">Vencimento</p>
                <p class="font-medium text-gray-900">{{ formatDate(installment.dueDate) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Valor</p>
                <p class="font-medium text-gray-900">{{ formatCurrency(installment.amount) }}</p>
              </div>
              <div v-if="installment.paid">
                <p class="text-gray-600">Pago em</p>
                <p class="font-medium text-green-600">{{ formatDate(installment.paidAt!) }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              v-if="!installment.paid"
              @click="handleEditInstallment(installment)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar parcela"
            >
              <Pencil class="w-5 h-5" />
            </button>
            <div v-else class="p-2 text-green-600">
              <CheckCircle class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State - Próximo Mês -->
    <div v-else-if="activeTab === 'upcoming' && nextMonthInstallments.length === 0" class="card text-center py-12">
      <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar class="w-10 h-10 text-blue-600" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma parcela para o próximo mês</h3>
      <p class="text-gray-600">Não há parcelas com vencimento no próximo mês.</p>
    </div>

    <!-- Empty State - Parcelas do Mês -->
    <div v-else-if="activeTab === 'installments' && monthInstallments.length === 0" class="card text-center py-12">
      <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock class="w-10 h-10 text-yellow-600" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma parcela neste mês</h3>
      <p class="text-gray-600">Não há parcelas com vencimento no mês atual.</p>
    </div>

    <!-- Empty State - Nenhuma Conta -->
    <div v-else-if="activeTab === 'bills' && store.activeBills.length === 0" class="card text-center py-12">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhuma conta cadastrada</h3>
      <p class="text-gray-600 mb-6">Crie sua primeira conta recorrente para acompanhar seus gastos fixos!</p>
      <button @click="router.push('/bills/new')" class="btn btn-primary">
        <Plus class="w-5 h-5 mr-2" />
        Criar Primeira Conta
      </button>
    </div>

    <!-- Modais -->
    <BillInstallmentsModal
      v-if="showInstallmentsModal"
      :key="modalKey"
      :bill-id="selectedBillId"
      :bill-name="selectedBillName"
      @close="handleCloseInstallmentsModal"
      @edit-installment="handleEditInstallment"
      @delete-installment="handleDeleteInstallment"
    />

    <EditInstallmentModal
      v-if="showEditInstallmentModal && selectedInstallment"
      :installment="selectedInstallment"
      @close="showEditInstallmentModal = false"
      @updated="handleInstallmentUpdated"
    />
  </div>
</template>
