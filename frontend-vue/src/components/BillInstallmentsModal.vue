<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { X, Calendar, DollarSign, Check, Edit, Trash2 } from 'lucide-vue-next'
import { useBillStore } from '@/stores/bill'
import type { BillInstallment } from '@/services/bill.service'

const props = defineProps<{
  billId: string
  billName: string
}>()

const emit = defineEmits<{
  close: []
  editInstallment: [installment: BillInstallment]
  deleteInstallment: [installmentId: string]
}>()

const store = useBillStore()
const installments = ref<BillInstallment[]>([])
const isLoading = ref(true)

const totalAmount = computed(() => 
  installments.value.reduce((sum, inst) => sum + Number(inst.amount), 0)
)

const paidAmount = computed(() => 
  installments.value.filter(inst => inst.paid).reduce((sum, inst) => sum + Number(inst.amountPaid), 0)
)

const pendingAmount = computed(() => totalAmount.value - paidAmount.value)

const paidCount = computed(() => installments.value.filter(inst => inst.paid).length)
const pendingCount = computed(() => installments.value.filter(inst => !inst.paid).length)

// Encontrar a maior sequência (última parcela)
const maxSequence = computed(() => {
  if (installments.value.length === 0) return 0
  return Math.max(...installments.value.map(inst => inst.installmentSequence))
})

// Verificar se uma parcela pode ser excluída (apenas a última e não paga)
function canDeleteInstallment(installment: BillInstallment): boolean {
  return !installment.paid && installment.installmentSequence === maxSequence.value
}

onMounted(async () => {
  await loadInstallments()
})

// Recarregar quando billId mudar ou quando store.bills mudar
watch([() => props.billId, () => store.bills], async () => {
  await loadInstallments()
})

async function loadInstallments() {
  try {
    isLoading.value = true
    // Buscar parcelas diretamente da API para garantir dados atualizados
    const { billService } = await import('@/services/bill.service')
    installments.value = await billService.getInstallments(props.billId)
  } catch (error) {
    console.error('Erro ao carregar parcelas:', error)
  } finally {
    isLoading.value = false
  }
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

function handleEdit(installment: BillInstallment) {
  emit('editInstallment', installment)
}

function handleDelete(installmentId: string) {
  // Apenas emitir evento, a view cuida da confirmação e exclusão
  emit('deleteInstallment', installmentId)
}

function getStatusColor(paid: boolean): string {
  return paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
}

function getStatusText(paid: boolean): string {
  return paid ? 'Pago' : 'Pendente'
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Parcelas</h2>
          <p class="text-sm text-gray-600 mt-1">{{ billName }}</p>
        </div>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div class="text-center">
          <p class="text-sm text-gray-600">Total de Parcelas</p>
          <p class="text-2xl font-bold text-gray-900">{{ installments.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Pagas</p>
          <p class="text-2xl font-bold text-green-600">{{ paidCount }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Pendentes</p>
          <p class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Valor Total</p>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalAmount) }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <!-- Lista de Parcelas -->
      <div v-else class="flex-1 overflow-y-auto p-6">
        <div v-if="installments.length === 0" class="text-center py-12 text-gray-500">
          Nenhuma parcela encontrada
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="installment in installments"
            :key="installment.id"
            class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <!-- Info da Parcela -->
            <div class="flex items-center space-x-4 flex-1">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-lg font-bold text-primary-600">{{ installment.installmentSequence }}</span>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-medium text-gray-900">Parcela {{ installment.installmentSequence }}</span>
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(installment.paid)]">
                    {{ getStatusText(installment.paid) }}
                  </span>
                </div>
                
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <div class="flex items-center space-x-1">
                    <Calendar class="w-4 h-4" />
                    <span>Vencimento: {{ formatDate(installment.dueDate) }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <DollarSign class="w-4 h-4" />
                    <span>{{ formatCurrency(installment.amount) }}</span>
                  </div>
                </div>

                <div v-if="installment.paid && installment.paidAt" class="text-xs text-green-600 mt-1">
                  Pago em {{ formatDate(installment.paidAt) }}
                </div>
              </div>
            </div>

            <!-- Ações -->
            <div class="flex items-center space-x-2">
              <button
                v-if="!installment.paid"
                @click="handleEdit(installment)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar parcela"
              >
                <Edit class="w-5 h-5" />
              </button>

              <button
                v-if="canDeleteInstallment(installment)"
                @click="handleDelete(installment.id)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir última parcela"
              >
                <Trash2 class="w-5 h-5" />
              </button>

              <div
                v-else-if="!installment.paid && installment.installmentSequence !== maxSequence"
                class="p-2 text-gray-300"
                title="Apenas a última parcela pode ser excluída"
              >
                <Trash2 class="w-5 h-5" />
              </div>

              <div v-if="installment.paid" class="p-2 text-green-600">
                <Check class="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-600">
          <span class="font-medium">Pago:</span> {{ formatCurrency(paidAmount) }} | 
          <span class="font-medium">Pendente:</span> {{ formatCurrency(pendingAmount) }}
        </div>
        <button @click="emit('close')" class="btn btn-secondary">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>
