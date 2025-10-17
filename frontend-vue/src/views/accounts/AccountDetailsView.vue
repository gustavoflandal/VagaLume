<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { transactionService } from '@/services/transaction.service'
import { accountService } from '@/services/account.service'
import { categoryService } from '@/services/category.service'
import { TransactionType, TransactionStatus, type Transaction, type Account, type Category } from '@/types'
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const accountId = route.params.id as string
const account = ref<Account | null>(null)
const transactions = ref<Transaction[]>([])
const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const showMovementModal = ref(false)
const showTransferModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const movementForm = ref({
  type: TransactionType.EXPENSE,
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
  status: TransactionStatus.COMPLETED
})

const transferForm = ref({
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  toAccountId: '',
  status: TransactionStatus.COMPLETED
})

onMounted(async () => {
  await Promise.all([
    loadAccount(),
    loadTransactions(),
    loadAccounts(),
    loadCategories()
  ])
})

async function loadAccount() {
  try {
    account.value = await accountService.getById(accountId)
  } catch (error) {
    console.error('Erro ao carregar conta:', error)
    toast.error('Erro ao carregar conta')
    router.push('/accounts')
  }
}

async function loadTransactions() {
  try {
    isLoading.value = true
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      accountId: accountId
    }

    const response = await transactionService.getAll(params)
    transactions.value = Array.isArray(response?.data) 
      ? response.data 
      : []
    pagination.value = response?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  } catch (error) {
    console.error('Erro ao carregar movimentações:', error)
    transactions.value = []
  } finally {
    isLoading.value = false
  }
}

async function loadAccounts() {
  try {
    const accountsData = await accountService.getAll()
    accounts.value = Array.isArray(accountsData) 
      ? accountsData.filter(acc => acc.id !== accountId) 
      : []
  } catch (error) {
    console.error('Erro ao carregar contas:', error)
  }
}

async function loadCategories() {
  try {
    const categoriesData = await categoryService.getAll()
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

function openMovementModal() {
  editingTransaction.value = null
  movementForm.value = {
    type: TransactionType.EXPENSE,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    status: TransactionStatus.COMPLETED
  }
  showMovementModal.value = true
}

function openTransferModal() {
  editingTransaction.value = null
  transferForm.value = {
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    toAccountId: '',
    status: TransactionStatus.COMPLETED
  }
  showTransferModal.value = true
}

function openEditTransfer(transaction: Transaction) {
  editingTransaction.value = transaction
  transferForm.value = {
    amount: Number(transaction.amount),
    description: transaction.description || '',
    date: transaction.date.split('T')[0],
    toAccountId: transaction.toAccountId || '',
    status: transaction.status
  }
  showTransferModal.value = true
}

function closeModals() {
  showMovementModal.value = false
  showTransferModal.value = false
  editingTransaction.value = null
}

async function handleMovementSubmit() {
  try {
    const data: any = {
      ...movementForm.value,
      [movementForm.value.type === TransactionType.INCOME ? 'toAccountId' : 'fromAccountId']: accountId
    }

    if (editingTransaction.value) {
      await transactionService.update(editingTransaction.value.id, data)
      toast.success('Movimentação atualizada com sucesso')
    } else {
      await transactionService.create(data)
      toast.success('Movimentação criada com sucesso')
    }
    
    await Promise.all([loadTransactions(), loadAccount()])
    closeModals()
  } catch (error: any) {
    console.error('Erro ao salvar movimentação:', error)
    const message = error.response?.data?.message || 'Erro ao salvar movimentação'
    toast.error(message)
  }
}

async function handleTransferSubmit() {
  try {
    const data: any = {
      type: TransactionType.TRANSFER,
      amount: transferForm.value.amount,
      description: transferForm.value.description || 'Transferência entre contas',
      date: transferForm.value.date,
      fromAccountId: accountId,
      toAccountId: transferForm.value.toAccountId,
      status: transferForm.value.status
    }

    if (editingTransaction.value) {
      await transactionService.update(editingTransaction.value.id, data)
      toast.success('Transferência atualizada com sucesso')
    } else {
      await transactionService.create(data)
      toast.success('Transferência realizada com sucesso')
    }
    
    await Promise.all([loadTransactions(), loadAccount()])
    closeModals()
  } catch (error: any) {
    console.error('Erro ao realizar transferência:', error)
    const message = error.response?.data?.message || 'Erro ao realizar transferência'
    toast.error(message)
  }
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return

  try {
    await transactionService.delete(id)
    toast.success('Movimentação excluída com sucesso')
    await Promise.all([loadTransactions(), loadAccount()])
  } catch (error: any) {
    console.error('Erro ao excluir movimentação:', error)
    toast.error('Erro ao excluir movimentação')
  }
}

function goBack() {
  router.push('/accounts')
}

function nextPage() {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    loadTransactions()
  }
}

function prevPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadTransactions()
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

function getTypeLabel(type: TransactionType): string {
  const labels = {
    [TransactionType.INCOME]: 'Receita',
    [TransactionType.EXPENSE]: 'Despesa',
    [TransactionType.TRANSFER]: 'Transferência'
  }
  return labels[type]
}

// Calcular saldo acumulado (mostrando da mais antiga para a mais recente)
const transactionsWithBalance = computed(() => {
  if (!transactions.value.length || !account.value) return []
  
  // Ordenar transações por data (mais antiga primeiro para exibição)
  const sorted = [...transactions.value].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  
  // Começar do zero (sem saldo inicial)
  let balance = 0
  
  const result = sorted.map((transaction) => {
    // Aplicar a movimentação
    if (transaction.fromAccountId === accountId) {
      // Saída de dinheiro
      balance -= Number(transaction.amount)
    } else if (transaction.toAccountId === accountId) {
      // Entrada de dinheiro
      balance += Number(transaction.amount)
    }
    
    // O saldo mostrado é o saldo APÓS esta transação
    return {
      ...transaction,
      runningBalance: balance
    }
  })
  
  return result
})

// Saldo atual é o saldo da última transação (ou 0 se não houver transações)
const currentBalance = computed(() => {
  if (!transactionsWithBalance.value.length) return 0
  return transactionsWithBalance.value[transactionsWithBalance.value.length - 1].runningBalance
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button @click="goBack" class="btn-secondary flex items-center space-x-2 mb-4">
        <ArrowLeftIcon class="h-5 w-5" />
        <span>Voltar</span>
      </button>

      <div v-if="account" class="card">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ account.name }}</h1>
            <p class="text-gray-500 mt-1">{{ account.type }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Saldo Atual</p>
            <p class="text-3xl font-bold" :class="currentBalance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(currentBalance) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex space-x-3 mb-6">
      <button @click="openTransferModal" class="btn-primary flex items-center space-x-2">
        <ArrowsRightLeftIcon class="h-5 w-5" />
        <span>Transferir</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!transactions || transactions.length === 0" class="card text-center py-12">
      <p class="text-gray-500">Nenhuma movimentação encontrada</p>
      <p class="text-sm text-gray-400 mt-2">As movimentações desta conta aparecerão aqui</p>
    </div>

    <!-- Transactions Table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in transactionsWithBalance" :key="transaction.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ transaction.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.category?.name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="{
                    'bg-green-100 text-green-800': transaction.type === TransactionType.INCOME || transaction.toAccountId === accountId,
                    'bg-red-100 text-red-800': transaction.type === TransactionType.EXPENSE || transaction.fromAccountId === accountId,
                    'bg-blue-100 text-blue-800': transaction.type === TransactionType.TRANSFER
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getTypeLabel(transaction.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                <span
                  :class="{
                    'text-green-600': transaction.toAccountId === accountId,
                    'text-red-600': transaction.fromAccountId === accountId
                  }"
                >
                  {{ transaction.toAccountId === accountId ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                <span
                  :class="{
                    'text-green-600': transaction.runningBalance >= 0,
                    'text-red-600': transaction.runningBalance < 0
                  }"
                >
                  {{ formatCurrency(transaction.runningBalance) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <!-- Botões: apenas para transferências de saída -->
                  <template v-if="transaction.type === TransactionType.TRANSFER && transaction.fromAccountId === accountId">
                    <button
                      @click="openEditTransfer(transaction)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="handleDelete(transaction.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </template>
                  <span v-else class="text-gray-400 text-xs">-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Mostrando <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
          a <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
          de <span class="font-medium">{{ pagination.total }}</span> resultados
        </div>
        <div class="flex space-x-2">
          <button
            @click="prevPage"
            :disabled="pagination.page === 1"
            class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page >= pagination.totalPages"
            class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Movimentação (Receita/Despesa) -->
    <div
      v-if="showMovementModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModals"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Nova Movimentação</h2>
          <button @click="closeModals" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleMovementSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select v-model="movementForm.type" class="input" required>
              <option :value="TransactionType.INCOME">Receita</option>
              <option :value="TransactionType.EXPENSE">Despesa</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input v-model="movementForm.description" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input v-model.number="movementForm.amount" type="number" step="0.01" min="0" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input v-model="movementForm.date" type="date" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select v-model="movementForm.categoryId" class="input">
              <option value="">Sem categoria</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModals" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Transferência -->
    <div
      v-if="showTransferModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModals"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingTransaction ? 'Editar Transferência' : 'Transferir para Outra Conta' }}
          </h2>
          <button @click="closeModals" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleTransferSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Conta de Destino</label>
            <select v-model="transferForm.toAccountId" class="input" required>
              <option value="">Selecione uma conta</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name }} - {{ formatCurrency(acc.balance) }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input v-model.number="transferForm.amount" type="number" step="0.01" min="0" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input v-model="transferForm.date" type="date" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <input v-model="transferForm.description" type="text" class="input" placeholder="Transferência entre contas" />
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModals" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
