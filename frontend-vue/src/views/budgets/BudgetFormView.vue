<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBudgetStore } from '@/stores/budget'
import { useCategoryStore } from '@/stores/category'
import { ArrowLeft, Save, Plus, Trash2, Calendar } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useBudgetStore()
const categoryStore = useCategoryStore()

const isEditing = computed(() => !!route.params.id)
const budgetId = computed(() => route.params.id as string)

const isLoading = ref(false)
const error = ref('')

// Formulário principal
const form = ref({
  name: '',
  type: 'GENERAL' as 'GENERAL' | 'CATEGORY',
  active: true,
  order: 0
})

const categories = computed(() => categoryStore.categories)

// Limites
const limits = ref<any[]>([])
const showLimitForm = ref(false)
const limitForm = ref({
  categoryId: '',
  amount: 0,
  startDate: '',
  endDate: '',
  currency: 'BRL'
})

// Auto-Budget
const showAutoBudget = ref(false)
const autoBudgetForm = ref({
  type: 'RESET',
  amount: 0,
  period: 'MONTHLY',
  currency: 'BRL'
})

onMounted(async () => {
  // Carregar categorias
  await categoryStore.fetchAll()
  
  if (isEditing.value) {
    await loadBudget()
  } else {
    // Definir período padrão (mês atual)
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    limitForm.value.startDate = firstDay.toISOString().split('T')[0]
    limitForm.value.endDate = lastDay.toISOString().split('T')[0]
  }
})

async function loadBudget() {
  try {
    isLoading.value = true
    const budget = await store.fetchById(budgetId.value)
    
    form.value = {
      name: budget.name,
      type: budget.type || 'GENERAL',
      active: budget.active,
      order: budget.order
    }
    
    limits.value = budget.limits || []
    
    if (budget.autoBudget) {
      showAutoBudget.value = true
      autoBudgetForm.value = {
        type: budget.autoBudget.type,
        amount: Number(budget.autoBudget.amount),
        period: budget.autoBudget.period,
        currency: budget.autoBudget.currency
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar orçamento'
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  try {
    error.value = ''
    isLoading.value = true
    
    if (!form.value.name) {
      error.value = 'Nome é obrigatório'
      return
    }
    
    let savedBudgetId = budgetId.value
    
    // 1. Salvar orçamento
    console.log('1. Salvando orçamento...', form.value)
    if (isEditing.value) {
      await store.update(budgetId.value, form.value)
      console.log('Orçamento atualizado:', budgetId.value)
    } else {
      const newBudget = await store.create(form.value)
      savedBudgetId = newBudget.id
      console.log('Orçamento criado com ID:', savedBudgetId)
    }
    
    // 2. Salvar limites
    if (limits.value.length > 0) {
      console.log('2. Salvando limites...', limits.value.length, 'limites')
      for (let i = 0; i < limits.value.length; i++) {
        const limit = limits.value[i]
        console.log(`Processando limite ${i + 1}:`, limit)
        
        try {
          // Se o limite já tem ID, atualizar; senão, criar
          if (limit.id) {
            console.log('Atualizando limite existente:', limit.id)
            const updateData: any = {
              amount: limit.amount,
              startDate: limit.startDate,
              endDate: limit.endDate,
              currency: limit.currency
            }
            
            // Adicionar categoryId se existir
            if (limit.categoryId) {
              updateData.categoryId = limit.categoryId
            }
            
            await store.updateLimit(limit.id, updateData)
          } else {
            console.log('Criando novo limite para budget:', savedBudgetId)
            // Converter strings de data para Date objects
            const startDate = new Date(limit.startDate + 'T12:00:00')
            const endDate = new Date(limit.endDate + 'T12:00:00')
            
            const limitData: any = {
              budgetId: savedBudgetId,
              amount: Number(limit.amount),
              startDate: startDate,
              endDate: endDate,
              currency: limit.currency || 'BRL'
            }
            
            // Adicionar categoryId se existir (orçamento por categoria)
            if (limit.categoryId) {
              limitData.categoryId = limit.categoryId
            }
            
            console.log('Dados do limite a serem enviados:', limitData)
            const createdLimit = await store.createLimit(limitData)
            console.log('Limite criado:', createdLimit)
          }
        } catch (limitError: any) {
          console.error(`Erro ao salvar limite ${i + 1}:`, limitError)
          throw new Error(`Erro ao salvar limite ${i + 1}: ${limitError.message}`)
        }
      }
      console.log('Todos os limites foram salvos com sucesso')
    } else {
      console.log('Nenhum limite para salvar')
    }
    
    // 3. Salvar/Remover Auto-Budget
    if (showAutoBudget.value && autoBudgetForm.value.amount > 0) {
      console.log('3. Configurando auto-budget...', autoBudgetForm.value)
      await store.setAutoBudget(savedBudgetId, {
        type: autoBudgetForm.value.type,
        amount: autoBudgetForm.value.amount,
        period: autoBudgetForm.value.period,
        currency: autoBudgetForm.value.currency || 'BRL'
      })
      console.log('Auto-budget configurado')
    } else if (!showAutoBudget.value && isEditing.value) {
      // Remover auto-budget se foi desativado
      try {
        console.log('3. Removendo auto-budget...')
        await store.removeAutoBudget(savedBudgetId)
        console.log('Auto-budget removido')
      } catch (err) {
        console.log('Auto-budget não existia ou já foi removido')
      }
    }
    
    console.log('Orçamento salvo com sucesso! Redirecionando...')
    router.push('/budgets')
  } catch (err: any) {
    console.error('Erro ao salvar orçamento:', err)
    error.value = err.message || 'Erro ao salvar orçamento'
  } finally {
    isLoading.value = false
  }
}

function addLimit() {
  console.log('[addLimit] Validando limite...', limitForm.value)
  
  if (!limitForm.value.amount || limitForm.value.amount <= 0) {
    error.value = 'Valor do limite deve ser maior que zero'
    console.error('[addLimit] Erro: Valor inválido')
    return
  }
  
  if (!limitForm.value.startDate || !limitForm.value.endDate) {
    error.value = 'Datas são obrigatórias'
    console.error('[addLimit] Erro: Datas faltando')
    return
  }
  
  const newLimit = { ...limitForm.value }
  limits.value.push(newLimit)
  console.log('[addLimit] Limite adicionado ao array local:', newLimit)
  console.log('[addLimit] Total de limites no array:', limits.value.length)
  console.log('[addLimit] Array completo:', limits.value)
  
  // Reset form
  limitForm.value = {
    categoryId: '',
    amount: 0,
    startDate: '',
    endDate: '',
    currency: 'BRL'
  }
  showLimitForm.value = false
  error.value = ''
  
  console.log('[addLimit] ⚠️ IMPORTANTE: Limite adicionado apenas localmente!')
  console.log('[addLimit] ⚠️ Clique em "Salvar Orçamento" no final da página para persistir no banco!')
}

function removeLimit(index: number) {
  limits.value.splice(index, 1)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

function getCategoryName(categoryId: string): string {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? `${category.icon} ${category.name}` : 'Categoria não encontrada'
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
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditing ? 'Editar Orçamento' : 'Novo Orçamento' }}
          </h1>
          <p class="text-gray-600 mt-1">Configure limites e controle seus gastos</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && isEditing" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Formulário -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Erro -->
      <div v-if="error" class="card bg-red-50 border border-red-200">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Informações Básicas -->
      <div class="card">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Informações Básicas</h2>
        
        <div class="space-y-4">
          <!-- Nome -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Nome do Orçamento *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Ex: Orçamento Mensal 2025"
            />
          </div>

          <!-- Tipo de Orçamento -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Orçamento *
            </label>
            <select
              id="type"
              v-model="form.type"
              class="input"
              required
            >
              <option value="GENERAL">Geral (Todas as Categorias)</option>
              <option value="CATEGORY">Por Categoria</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              <strong>Geral:</strong> controla gastos totais. 
              <strong>Por Categoria:</strong> define limites específicos por categoria.
            </p>
          </div>

          <!-- Ativo -->
          <div class="flex items-center">
            <input
              id="active"
              v-model="form.active"
              type="checkbox"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="active" class="ml-2 text-sm text-gray-700">
              Orçamento ativo
            </label>
          </div>

          <!-- Ordem -->
          <div>
            <label for="order" class="block text-sm font-medium text-gray-700 mb-2">
              Ordem de Exibição
            </label>
            <input
              id="order"
              v-model.number="form.order"
              type="number"
              min="0"
              class="input"
              placeholder="0"
            />
            <p class="text-xs text-gray-500 mt-1">Menor número aparece primeiro</p>
          </div>
        </div>
      </div>

      <!-- Limites -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">Limites de Orçamento</h2>
          <button
            type="button"
            @click="showLimitForm = !showLimitForm"
            class="btn btn-secondary btn-sm"
          >
            <Plus class="w-4 h-4 mr-2" />
            Adicionar Limite
          </button>
        </div>

        <!-- Formulário de Limite -->
        <div v-if="showLimitForm" class="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 class="font-medium text-gray-900 mb-3">Novo Limite</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Categoria (apenas se tipo = CATEGORY) -->
            <div v-if="form.type === 'CATEGORY'" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select v-model="limitForm.categoryId" class="input" required>
                <option value="">Selecione uma categoria</option>
                <option 
                  v-for="category in categories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Selecione a categoria que terá este limite de gastos
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Valor do Limite *
              </label>
              <input
                v-model.number="limitForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="input"
                placeholder="0,00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Moeda
              </label>
              <select v-model="limitForm.currency" class="input">
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial *
              </label>
              <input
                v-model="limitForm.startDate"
                type="date"
                required
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Data Final *
              </label>
              <input
                v-model="limitForm.endDate"
                type="date"
                required
                class="input"
              />
            </div>
          </div>
          <div class="flex items-center space-x-2 mt-4">
            <button type="button" @click="addLimit" class="btn btn-primary btn-sm">
              Adicionar
            </button>
            <button type="button" @click="showLimitForm = false" class="btn btn-secondary btn-sm">
              Cancelar
            </button>
          </div>
        </div>

        <!-- Lista de Limites -->
        <div v-if="limits.length > 0" class="space-y-2">
          <div
            v-for="(limit, index) in limits"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <p class="font-medium text-gray-900">{{ formatCurrency(Number(limit.amount)) }}</p>
                <span v-if="limit.categoryId" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {{ getCategoryName(limit.categoryId) }}
                </span>
              </div>
              <p class="text-sm text-gray-600">
                <Calendar class="w-4 h-4 inline mr-1" />
                {{ formatDate(limit.startDate) }} a {{ formatDate(limit.endDate) }}
              </p>
            </div>
            <button
              type="button"
              @click="removeLimit(index)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500 text-center py-4">
          Nenhum limite configurado
        </p>
      </div>

      <!-- Auto-Budget -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Auto-Budget</h2>
            <p class="text-sm text-gray-600">Ajuste automático do orçamento</p>
          </div>
          <div class="flex items-center">
            <input
              id="autoBudget"
              v-model="showAutoBudget"
              type="checkbox"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="autoBudget" class="ml-2 text-sm text-gray-700">
              Ativar Auto-Budget
            </label>
          </div>
        </div>

        <div v-if="showAutoBudget" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select v-model="autoBudgetForm.type" class="input" required>
                <option value="RESET">Reset (Reseta no início)</option>
                <option value="ROLLOVER">Rollover (Transfere saldo)</option>
                <option value="ADJUSTED">Adjusted (Ajusta baseado no gasto)</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                <span v-if="autoBudgetForm.type === 'RESET'">Volta para o valor definido todo período</span>
                <span v-if="autoBudgetForm.type === 'ROLLOVER'">Saldo não usado é transferido</span>
                <span v-if="autoBudgetForm.type === 'ADJUSTED'">Ajusta baseado no gasto anterior</span>
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Período *
              </label>
              <select v-model="autoBudgetForm.period" class="input" required>
                <option value="DAILY">Diário</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensal</option>
                <option value="QUARTERLY">Trimestral</option>
                <option value="HALF_YEAR">Semestral</option>
                <option value="YEARLY">Anual</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Valor Base *
              </label>
              <input
                v-model.number="autoBudgetForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="input"
                placeholder="0,00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Moeda
              </label>
              <select v-model="autoBudgetForm.currency" class="input">
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerta -->
      <div v-if="limits.length > 0 || showAutoBudget" class="card bg-blue-50 border border-blue-200">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-blue-800">
              Não esqueça de salvar!
            </p>
            <p class="text-sm text-blue-700 mt-1">
              Você configurou {{ limits.length }} limite(s){{ showAutoBudget ? ' e auto-budget' : '' }}. 
              Clique em <strong>"Salvar Orçamento"</strong> abaixo para persistir as alterações no banco de dados.
            </p>
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex items-center justify-end space-x-3">
        <button
          type="button"
          @click="router.back()"
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
          {{ isLoading ? 'Salvando...' : 'Salvar Orçamento' }}
        </button>
      </div>
    </form>
  </div>
</template>
