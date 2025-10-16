<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { transactionService } from '@/services/transaction.service'
import { accountService } from '@/services/account.service'
import { categoryService } from '@/services/category.service'
import { TransactionType, TransactionStatus, type Transaction, type Account, type Category } from '@/types'
import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon, FunnelIcon } from '@heroicons/vue/24/outline'

const transactions = ref<Transaction[]>([])
const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const showFilters = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const filters = ref({
  type: '',
  status: '',
  fromAccountId: '',
  toAccountId: '',
  categoryId: '',
  startDate: '',
  endDate: ''
})

const form = ref({
  type: TransactionType.EXPENSE,
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  fromAccountId: '',
  toAccountId: '',
  categoryId: '',
  status: TransactionStatus.COMPLETED
})

onMounted(async () => {
  await Promise.all([
    loadTransactions(),
    loadAccounts(),
    loadCategories()
  ])
})

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(v => v !== '')
})

async function loadTransactions() {
  try {
    isLoading.value = true
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    if (filters.value.type) params.type = filters.value.type
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.fromAccountId) params.fromAccountId = filters.value.fromAccountId
    if (filters.value.toAccountId) params.toAccountId = filters.value.toAccountId
    if (filters.value.categoryId) params.categoryId = filters.value.categoryId
    if (filters.value.startDate) params.startDate = filters.value.startDate
    if (filters.value.endDate) params.endDate = filters.value.endDate

    const response = await transactionService.getAll(params)
    transactions.value = Array.isArray(response?.data) 
      ? response.data 
      : Array.isArray(response) 
        ? response 
        : []
    pagination.value = response?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  } catch (error) {
    console.error('Erro ao carregar transações:', error)
    transactions.value = []
  } finally {
    isLoading.value = false
  }
}

async function loadAccounts() {
  try {
    const accountsData = await accountService.getAll()
    accounts.value = Array.isArray(accountsData) ? accountsData : []
  } catch (error) {
    console.error('Erro ao carregar contas:', error)
    accounts.value = []
  }
}

async function loadCategories() {
  try {
    const categoriesData = await categoryService.getAll()
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    categories.value = []
  }
}

function openCreateModal() {
  editingTransaction.value = null
  form.value = {
    type: TransactionType.EXPENSE,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    fromAccountId: accounts.value[0]?.id || '',
    toAccountId: '',
    categoryId: '',
    status: TransactionStatus.COMPLETED
  }
  showModal.value = true
}

function openEditModal(transaction: Transaction) {
  editingTransaction.value = transaction
  form.value = {
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date.split('T')[0],
    fromAccountId: transaction.fromAccountId || '',
    toAccountId: transaction.toAccountId || '',
    categoryId: transaction.categoryId || '',
    status: transaction.status
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTransaction.value = null
}

async function handleSubmit() {
  try {
    const data = { ...form.value }
    
    // Limpar campos não usados baseado no tipo
    if (data.type === TransactionType.INCOME) {
      data.toAccountId = data.fromAccountId
      data.fromAccountId = ''
    } else if (data.type === TransactionType.EXPENSE) {
      data.toAccountId = ''
    }
    
    if (editingTransaction.value) {
      await transactionService.update(editingTransaction.value.id, data)
    } else {
      await transactionService.create(data)
    }
    await loadTransactions()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar transação:', error)
  }
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) return

  try {
    await transactionService.delete(id)
    await loadTransactions()
  } catch (error) {
    console.error('Erro ao excluir transação:', error)
  }
}

function applyFilters() {
  pagination.value.page = 1
  loadTransactions()
  showFilters.value = false
}

function clearFilters() {
  filters.value = {
    type: '',
    status: '',
    fromAccountId: '',
    toAccountId: '',
    categoryId: '',
    startDate: '',
    endDate: ''
  }
  pagination.value.page = 1
  loadTransactions()
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

function getStatusLabel(status: TransactionStatus): string {
  const labels = {
    [TransactionStatus.PENDING]: 'Pendente',
    [TransactionStatus.COMPLETED]: 'Concluída',
    [TransactionStatus.CANCELLED]: 'Cancelada'
  }
  return labels[status]
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Transações</h1>
      <div class="flex space-x-3">
        <button
          @click="showFilters = !showFilters"
          class="btn-secondary flex items-center space-x-2"
          :class="{ 'bg-primary-50 text-primary-600': hasActiveFilters }"
        >
          <FunnelIcon class="h-5 w-5" />
          <span>Filtros</span>
          <span v-if="hasActiveFilters" class="bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs">
            Ativos
          </span>
        </button>
        <button @click="openCreateModal" class="btn-primary flex items-center space-x-2">
          <PlusIcon class="h-5 w-5" />
          <span>Nova Transação</span>
        </button>
      </div>
    </div>

    <!-- Painel de Filtros -->
    <div v-if="showFilters" class="card mb-6">
      <h3 class="font-bold text-gray-900 mb-4">Filtros</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select v-model="filters.type" class="input">
            <option value="">Todos</option>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
            <option value="TRANSFER">Transferência</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" class="input">
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select v-model="filters.categoryId" class="input">
            <option value="">Todas</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input v-model="filters.startDate" type="date" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <input v-model="filters.endDate" type="date" class="input" />
        </div>
      </div>
      <div class="flex space-x-3 mt-4">
        <button @click="clearFilters" class="btn-secondary">Limpar</button>
        <button @click="applyFilters" class="btn-primary">Aplicar Filtros</button>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <div v-else-if="!transactions || transactions.length === 0" class="card text-center py-12">
      <p class="text-gray-500 mb-4">Nenhuma transação encontrada</p>
      <button @click="openCreateModal" class="btn-primary inline-flex items-center space-x-2">
        <PlusIcon class="h-5 w-5" />
        <span>Criar primeira transação</span>
      </button>
    </div>

    <div v-else-if="transactions && transactions.length > 0">
      <!-- Lista de Transações -->
      <div class="card overflow-hidden">
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
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
                      'bg-green-100 text-green-800': transaction.type === TransactionType.INCOME,
                      'bg-red-100 text-red-800': transaction.type === TransactionType.EXPENSE,
                      'bg-blue-100 text-blue-800': transaction.type === TransactionType.TRANSFER
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getTypeLabel(transaction.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  <span
                    :class="{
                      'text-green-600': transaction.type === TransactionType.INCOME,
                      'text-red-600': transaction.type === TransactionType.EXPENSE,
                      'text-blue-600': transaction.type === TransactionType.TRANSFER
                    }"
                  >
                    {{ transaction.type === TransactionType.INCOME ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'bg-yellow-100 text-yellow-800': transaction.status === TransactionStatus.PENDING,
                      'bg-green-100 text-green-800': transaction.status === TransactionStatus.COMPLETED,
                      'bg-gray-100 text-gray-800': transaction.status === TransactionStatus.CANCELLED
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusLabel(transaction.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="openEditModal(transaction)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <button
                    @click="handleDelete(transaction.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
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
    </div>

    <!-- Modal de Criar/Editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingTransaction ? 'Editar Transação' : 'Nova Transação' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select id="type" v-model="form.type" required class="input">
              <option :value="TransactionType.INCOME">Receita</option>
              <option :value="TransactionType.EXPENSE">Despesa</option>
              <option :value="TransactionType.TRANSFER">Transferência</option>
            </select>
          </div>

          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              required
              class="input"
              placeholder="0,00"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              id="description"
              v-model="form.description"
              type="text"
              required
              class="input"
              placeholder="Ex: Salário, Compra de mercado..."
            />
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
              class="input"
            />
          </div>

          <div v-if="form.type === TransactionType.EXPENSE || form.type === TransactionType.TRANSFER">
            <label for="fromAccount" class="block text-sm font-medium text-gray-700 mb-1">
              {{ form.type === TransactionType.TRANSFER ? 'De (conta)' : 'Conta' }}
            </label>
            <select id="fromAccount" v-model="form.fromAccountId" required class="input">
              <option value="">Selecione uma conta</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>

          <div v-if="form.type === TransactionType.INCOME || form.type === TransactionType.TRANSFER">
            <label for="toAccount" class="block text-sm font-medium text-gray-700 mb-1">
              {{ form.type === TransactionType.TRANSFER ? 'Para (conta)' : 'Conta' }}
            </label>
            <select
              id="toAccount"
              v-model="form.toAccountId"
              :required="form.type === TransactionType.TRANSFER"
              class="input"
            >
              <option value="">Selecione uma conta</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>

          <div v-if="form.type !== TransactionType.TRANSFER">
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Categoria (opcional)
            </label>
            <select id="category" v-model="form.categoryId" class="input">
              <option value="">Sem categoria</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select id="status" v-model="form.status" required class="input">
              <option :value="TransactionStatus.PENDING">Pendente</option>
              <option :value="TransactionStatus.COMPLETED">Concluída</option>
              <option :value="TransactionStatus.CANCELLED">Cancelada</option>
            </select>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              {{ editingTransaction ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
