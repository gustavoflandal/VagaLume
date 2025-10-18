<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { X, Save } from 'lucide-vue-next'
import { transactionService } from '@/services/transaction.service'
import { accountService } from '@/services/account.service'
import { categoryService } from '@/services/category.service'
import { TransactionType, TransactionStatus, type Account, type Category } from '@/types'

interface TransactionFormData {
  type: TransactionType
  amount: number
  description: string
  date: string
  fromAccountId?: string
  toAccountId?: string
  categoryId?: string
  status: TransactionStatus
}

const props = defineProps<{
  initialData?: Partial<TransactionFormData>
  title?: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(false)
const error = ref('')

const form = ref<TransactionFormData>({
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
  await Promise.all([loadAccounts(), loadCategories()])
  
  // Aplicar dados iniciais se fornecidos
  if (props.initialData) {
    form.value = {
      ...form.value,
      ...props.initialData
    }
  }
})

async function loadAccounts() {
  try {
    const accountsData = await accountService.getAll()
    accounts.value = Array.isArray(accountsData) ? accountsData : []
    
    // Se não tem conta selecionada, seleciona a primeira
    if (!form.value.fromAccountId && accounts.value.length > 0) {
      form.value.fromAccountId = accounts.value[0].id
    }
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

async function handleSubmit() {
  try {
    error.value = ''
    isLoading.value = true

    if (!form.value.amount || form.value.amount <= 0) {
      error.value = 'Valor deve ser maior que zero'
      return
    }

    if (!form.value.description) {
      error.value = 'Descrição é obrigatória'
      return
    }

    const data: any = { ...form.value }
    
    // Garantir que amount seja number
    data.amount = Number(data.amount)
    
    // Guardar installmentId se existir (será usado após criar transação)
    const installmentId = data._installmentId
    delete data._installmentId
    
    // Limpar campos não usados baseado no tipo
    if (data.type === TransactionType.INCOME) {
      // Receita: apenas toAccountId (conta de destino)
      data.toAccountId = data.fromAccountId
      delete data.fromAccountId
    } else if (data.type === TransactionType.EXPENSE) {
      // Despesa: apenas fromAccountId (conta de origem)
      delete data.toAccountId
    }
    // Transfer: mantém ambos fromAccountId e toAccountId
    
    // Remover campos vazios
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === undefined || data[key] === null) {
        delete data[key]
      }
    })
    
    const transaction = await transactionService.create(data)
    
    // Se tem installmentId, vincular transação com parcela
    if (installmentId && transaction?.id) {
      const { billService } = await import('@/services/bill.service')
      await billService.payInstallment(installmentId, transaction.id)
    }
    
    emit('saved')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar transação'
  } finally {
    isLoading.value = false
  }
}

// Observar mudanças no tipo para ajustar campos
watch(() => form.value.type, (newType) => {
  if (newType === TransactionType.INCOME) {
    form.value.toAccountId = form.value.fromAccountId
  } else if (newType === TransactionType.TRANSFER) {
    form.value.toAccountId = ''
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
        <h2 class="text-xl font-bold text-gray-900">{{ title || 'Nova Transação' }}</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Erro -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <select
            v-model="form.type"
            class="input"
            required
          >
            <option :value="TransactionType.EXPENSE">Despesa</option>
            <option :value="TransactionType.INCOME">Receita</option>
            <option :value="TransactionType.TRANSFER">Transferência</option>
          </select>
        </div>

        <!-- Descrição -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <input
            id="description"
            v-model="form.description"
            type="text"
            required
            class="input"
            placeholder="Ex: Pagamento de conta"
          />
        </div>

        <!-- Valor -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
            Valor *
          </label>
          <input
            id="amount"
            v-model.number="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            class="input"
            placeholder="0,00"
          />
        </div>

        <!-- Data -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
            Data *
          </label>
          <input
            id="date"
            v-model="form.date"
            type="date"
            required
            class="input"
          />
        </div>

        <!-- Conta de Origem (Despesa e Transferência) -->
        <div v-if="form.type === TransactionType.EXPENSE || form.type === TransactionType.TRANSFER">
          <label for="fromAccount" class="block text-sm font-medium text-gray-700 mb-2">
            {{ form.type === TransactionType.TRANSFER ? 'Conta de Origem *' : 'Conta *' }}
          </label>
          <select
            id="fromAccount"
            v-model="form.fromAccountId"
            class="input"
            required
          >
            <option value="">Selecione uma conta</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </div>

        <!-- Conta de Destino (Receita) -->
        <div v-if="form.type === TransactionType.INCOME">
          <label for="toAccountIncome" class="block text-sm font-medium text-gray-700 mb-2">
            Conta *
          </label>
          <select
            id="toAccountIncome"
            v-model="form.fromAccountId"
            class="input"
            required
          >
            <option value="">Selecione uma conta</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </div>

        <!-- Conta de Destino (Transferência) -->
        <div v-if="form.type === TransactionType.TRANSFER">
          <label for="toAccountTransfer" class="block text-sm font-medium text-gray-700 mb-2">
            Conta de Destino *
          </label>
          <select
            id="toAccountTransfer"
            v-model="form.toAccountId"
            class="input"
            required
          >
            <option value="">Selecione uma conta</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </div>

        <!-- Categoria (Despesa e Receita) -->
        <div v-if="form.type !== TransactionType.TRANSFER">
          <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            id="category"
            v-model="form.categoryId"
            class="input"
          >
            <option value="">Sem categoria</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            v-model="form.status"
            class="input"
            required
          >
            <option :value="TransactionStatus.COMPLETED">Concluída</option>
            <option :value="TransactionStatus.PENDING">Pendente</option>
            <option :value="TransactionStatus.CANCELLED">Cancelada</option>
          </select>
        </div>

        <!-- Botões -->
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="emit('close')"
            class="btn btn-secondary"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isLoading"
          >
            <Save class="w-5 h-5 mr-2" />
            {{ isLoading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
