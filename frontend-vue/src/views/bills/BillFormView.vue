<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBillStore } from '@/stores/bill'
import { useAccountStore } from '@/stores/account'
import { useCategoryStore } from '@/stores/category'
import { ArrowLeft, Save } from 'lucide-vue-next'
import type { CreateBillData } from '@/services/bill.service'

const router = useRouter()
const route = useRoute()
const billStore = useBillStore()
const accountStore = useAccountStore()
const categoryStore = useCategoryStore()

const billId = route.params.id as string | undefined
const isEditing = ref(!!billId)
const isLoading = ref(false)
const error = ref('')

const form = ref<CreateBillData>({
  name: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  repeatFreq: 'monthly',
  numberOfInstallments: 1,
  isFixedDay: true,
  categoryId: '',
  accountId: '',
})

const frequencyOptions = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'half-year', label: 'Semestral' },
  { value: 'yearly', label: 'Anual' },
]

onMounted(async () => {
  // Carregar contas e categorias
  await Promise.all([
    accountStore.fetchAll(),
    categoryStore.fetchAll()
  ])

  if (isEditing.value && billId) {
    try {
      isLoading.value = true
      const bill = await billStore.fetchById(billId)
      form.value = {
        name: bill.name,
        amount: bill.amount,
        date: bill.date.split('T')[0],
        repeatFreq: bill.repeatFreq,
        numberOfInstallments: bill.numberOfInstallments,
        isFixedDay: bill.isFixedDay,
        categoryId: bill.categoryId || '',
        accountId: bill.accountId || '',
      }
    } catch (err) {
      error.value = 'Erro ao carregar conta recorrente'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
})

async function handleSubmit() {
  try {
    error.value = ''
    isLoading.value = true

    // Validações
    if (!form.value.name.trim()) {
      error.value = 'Nome é obrigatório'
      return
    }

    if (form.value.amount <= 0) {
      error.value = 'Valor da parcela deve ser maior que zero'
      return
    }

    if (form.value.numberOfInstallments < 1) {
      error.value = 'Número de parcelas deve ser pelo menos 1'
      return
    }

    if (isEditing.value && billId) {
      await billStore.update(billId, form.value)
    } else {
      await billStore.create(form.value)
    }

    router.push('/bills')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar conta recorrente'
  } finally {
    isLoading.value = false
  }
}

function handleCancel() {
  router.push('/bills')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button @click="handleCancel" class="btn btn-secondary">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditing ? 'Editar' : 'Nova' }} Conta Recorrente
        </h1>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && isEditing" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Formulário -->
    <div v-else class="max-w-2xl">
      <form @submit.prevent="handleSubmit" class="card space-y-6">
        <!-- Erro -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Nome -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Nome da Conta *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="input"
            placeholder="Ex: Aluguel, Conta de Luz, Netflix"
          />
          <p class="mt-1 text-xs text-gray-500">
            Dê um nome descritivo para identificar facilmente esta conta
          </p>
        </div>

        <!-- Valor e Número de Parcelas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
              Valor da Parcela *
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
            <p class="mt-1 text-xs text-gray-500">
              Valor de cada parcela
            </p>
          </div>

          <div>
            <label for="numberOfInstallments" class="block text-sm font-medium text-gray-700 mb-2">
              Número de Parcelas *
            </label>
            <input
              id="numberOfInstallments"
              v-model.number="form.numberOfInstallments"
              type="number"
              min="1"
              required
              class="input"
              placeholder="1"
            />
            <p class="mt-1 text-xs text-gray-500">
              Quantas parcelas serão geradas
            </p>
          </div>
        </div>

        <!-- Data e Frequência -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
              Data de Vencimento *
            </label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
              class="input"
            />
            <p class="mt-1 text-xs text-gray-500">
              Primeira data de vencimento
            </p>
          </div>

          <div>
            <label for="repeatFreq" class="block text-sm font-medium text-gray-700 mb-2">
              Frequência *
            </label>
            <select
              id="repeatFreq"
              v-model="form.repeatFreq"
              required
              class="input"
            >
              <option v-for="option in frequencyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Com que frequência esta conta se repete
            </p>
          </div>
        </div>

        <!-- Categoria e Conta -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="categoryId"
              v-model="form.categoryId"
              class="input"
            >
              <option value="">Selecione uma categoria (opcional)</option>
              <option v-for="category in categoryStore.activeCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Categoria padrão para as transações geradas
            </p>
          </div>

          <div>
            <label for="accountId" class="block text-sm font-medium text-gray-700 mb-2">
              Conta
            </label>
            <select
              id="accountId"
              v-model="form.accountId"
              class="input"
            >
              <option value="">Selecione uma conta (opcional)</option>
              <option v-for="account in accountStore.activeAccounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Conta padrão para débito das transações
            </p>
          </div>
        </div>

        <!-- Tipo de Data -->
        <div class="flex items-center">
          <input
            id="isFixedDay"
            v-model="form.isFixedDay"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label for="isFixedDay" class="ml-2 block text-sm text-gray-700">
            Data específica (dia fixo do mês)
          </label>
        </div>
        <p class="text-xs text-gray-500 -mt-4 ml-6">
          Marcado: sempre no mesmo dia do mês (ex: dia 15). Desmarcado: dias corridos (ex: a cada 30 dias)
        </p>

        <!-- Botões -->
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="handleCancel"
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

      <!-- Informações Adicionais -->
      <div class="card mt-6 bg-blue-50 border-blue-200">
        <h3 class="font-bold text-blue-900 mb-2">ℹ️ Como funciona?</h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• <strong>Parcelas:</strong> Ao criar a conta, todas as parcelas serão geradas automaticamente</li>
          <li>• <strong>Data específica:</strong> Mantém o dia do mês (ex: todo dia 15)</li>
          <li>• <strong>Dias corridos:</strong> Intervalo fixo entre parcelas (ex: a cada 30 dias)</li>
          <li>• <strong>Categoria e Conta:</strong> Serão usadas como padrão ao gerar transações de pagamento</li>
          <li>• <strong>Visualização:</strong> Após criar, clique no ícone de lista para ver todas as parcelas</li>
        </ul>
      </div>
    </div>
  </div>
</template>
