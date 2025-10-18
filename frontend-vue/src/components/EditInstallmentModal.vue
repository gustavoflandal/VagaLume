<script setup lang="ts">
import { ref } from 'vue'
import { X, Save } from 'lucide-vue-next'
import { useBillStore } from '@/stores/bill'
import type { BillInstallment } from '@/services/bill.service'

const props = defineProps<{
  installment: BillInstallment
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const store = useBillStore()

const form = ref({
  dueDate: props.installment.dueDate.split('T')[0],
  amount: props.installment.amount,
})

const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  try {
    error.value = ''
    isLoading.value = true

    if (!form.value.amount || form.value.amount <= 0) {
      error.value = 'Valor deve ser maior que zero'
      return
    }

    await store.updateInstallment(props.installment.id, form.value)
    emit('updated')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao atualizar parcela'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Editar Parcela {{ installment.installmentSequence }}</h2>
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

        <!-- Data de Vencimento -->
        <div>
          <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
            Data de Vencimento *
          </label>
          <input
            id="dueDate"
            v-model="form.dueDate"
            type="date"
            required
            class="input"
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

        <!-- Botões -->
        <div class="flex items-center justify-end space-x-3 pt-4">
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
