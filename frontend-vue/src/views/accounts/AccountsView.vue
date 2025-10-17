<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { accountService } from '@/services/account.service'
import { transactionService } from '@/services/transaction.service'
import { AccountType, type Account } from '@/types'
import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const accounts = ref<Account[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const editingAccount = ref<Account | null>(null)

const form = ref({
  name: '',
  type: AccountType.CHECKING,
  balance: 0,
  initialBalance: 0,
  description: ''
})

onMounted(async () => {
  console.log('AccountsView montado')
  await loadAccounts()
})

// Recarregar quando a view for ativada (útil para keep-alive)
onActivated(async () => {
  console.log('AccountsView ativado')
  await loadAccounts()
})

async function loadAccounts() {
  try {
    isLoading.value = true
    console.log('Carregando contas...')
    const accountsData = await accountService.getAll()
    console.log('Contas recebidas:', accountsData)
    
    if (!Array.isArray(accountsData)) {
      console.warn('accountsData não é um array')
      accounts.value = []
      return
    }
    
    // Calcular saldo real de cada conta baseado nas transações
    console.log('Calculando saldos...')
    const accountsWithBalance = await Promise.all(
      accountsData.map(async (account) => {
        try {
          console.log(`Calculando saldo para conta: ${account.name}`)
          const calculatedBalance = await calculateAccountBalance(account.id)
          console.log(`Saldo calculado para ${account.name}: ${calculatedBalance}`)
          return { ...account, balance: calculatedBalance }
        } catch (error) {
          console.error(`Erro ao calcular saldo da conta ${account.name}:`, error)
          return account // Retorna a conta com o saldo original em caso de erro
        }
      })
    )
    
    console.log('Contas com saldo calculado:', accountsWithBalance)
    accounts.value = accountsWithBalance
  } catch (error) {
    console.error('Erro ao carregar contas:', error)
    accounts.value = []
  } finally {
    isLoading.value = false
    console.log('Carregamento finalizado. Total de contas:', accounts.value.length)
  }
}

async function calculateAccountBalance(accountId: string): Promise<number> {
  try {
    console.log(`Buscando transações para conta: ${accountId}`)
    
    // Timeout de 5 segundos para evitar travamento
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao buscar transações')), 5000)
    )
    
    const response = await Promise.race([
      transactionService.getAll({ accountId, limit: 1000 }),
      timeoutPromise
    ])
    
    console.log(`Resposta recebida para conta ${accountId}:`, response)
    const transactions = Array.isArray(response?.data) ? response.data : []
    
    if (!transactions.length) {
      console.log(`Nenhuma transação encontrada para conta ${accountId}`)
      return 0
    }
    
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
    
    console.log(`Saldo final calculado para conta ${accountId}: ${balance}`)
    return balance
  } catch (error) {
    console.error('Erro ao calcular saldo da conta:', accountId, error)
    return 0
  }
}

function openCreateModal() {
  editingAccount.value = null
  form.value = {
    name: '',
    type: AccountType.CHECKING,
    balance: 0,
    initialBalance: 0,
    description: ''
  }
  showModal.value = true
}

function openEditModal(account: Account) {
  editingAccount.value = account
  form.value = {
    name: account.name,
    type: account.type,
    balance: account.balance,
    initialBalance: account.initialBalance || 0,
    description: account.description || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingAccount.value = null
}

async function handleSubmit() {
  try {
    if (editingAccount.value) {
      await accountService.update(editingAccount.value.id, form.value)
    } else {
      await accountService.create(form.value)
    }
    await loadAccounts()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar conta:', error)
  }
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta conta?')) return

  try {
    await accountService.delete(id)
    await loadAccounts()
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getAccountTypeLabel(type: AccountType): string {
  const labels: Record<AccountType, string> = {
    CHECKING: 'Conta Corrente',
    SAVINGS: 'Conta Poupança',
    CREDIT_CARD: 'Cartão de Crédito',
    INVESTMENT: 'Investimento',
    CASH: 'Dinheiro',
    OTHER: 'Outro'
  }
  return labels[type]
}

function getAccountTypeIcon(type: AccountType): string {
  const icons: Record<AccountType, string> = {
    CHECKING: '🏦',
    SAVINGS: '💰',
    CREDIT_CARD: '💳',
    INVESTMENT: '📈',
    CASH: '💵',
    OTHER: '📝'
  }
  return icons[type]
}

function viewAccountDetails(accountId: string) {
  router.push(`/accounts/${accountId}`)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Contas</h1>
      <button @click="openCreateModal" class="btn-primary flex items-center space-x-2">
        <PlusIcon class="h-5 w-5" />
        <span>Nova Conta</span>
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <div v-else-if="!accounts || accounts.length === 0" class="card text-center py-12">
      <p class="text-gray-500 mb-4">Nenhuma conta cadastrada</p>
      <button @click="openCreateModal" class="btn-primary inline-flex items-center space-x-2">
        <PlusIcon class="h-5 w-5" />
        <span>Criar primeira conta</span>
      </button>
    </div>

    <div v-else-if="accounts && accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="account in accounts"
        :key="account.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewAccountDetails(account.id)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
              {{ getAccountTypeIcon(account.type) }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ account.name }}</h3>
              <p class="text-sm text-gray-500">{{ getAccountTypeLabel(account.type) }}</p>
            </div>
          </div>
          <div class="flex space-x-2" @click.stop>
            <button
              @click="openEditModal(account)"
              class="p-1 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              @click="handleDelete(account.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="mb-3">
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(account.balance) }}</p>
        </div>

        <p v-if="account.description" class="text-sm text-gray-600">
          {{ account.description }}
        </p>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">Clique para ver movimentações</p>
        </div>
      </div>
    </div>

    <!-- Modal de Criar/Editar -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingAccount ? 'Editar Conta' : 'Nova Conta' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nome da conta
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Ex: Banco do Brasil"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de conta
            </label>
            <select id="type" v-model="form.type" required class="input">
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Conta Poupança</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="INVESTMENT">Investimento</option>
              <option value="CASH">Dinheiro</option>
            </select>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="input"
              placeholder="Observações sobre a conta..."
            ></textarea>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              {{ editingAccount ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
