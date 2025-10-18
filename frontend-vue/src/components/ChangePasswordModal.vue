<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import settingsService from '@/services/settings.service'

const emit = defineEmits<{
  close: []
  success: []
}>()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null

  // Validações
  if (!form.value.currentPassword || !form.value.newPassword || !form.value.confirmPassword) {
    error.value = 'Todos os campos são obrigatórios'
    return
  }

  if (form.value.newPassword.length < 6) {
    error.value = 'A nova senha deve ter no mínimo 6 caracteres'
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'As senhas não coincidem'
    return
  }

  if (form.value.currentPassword === form.value.newPassword) {
    error.value = 'A nova senha deve ser diferente da senha atual'
    return
  }

  loading.value = true
  try {
    await settingsService.changePassword({
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })
    emit('success')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao alterar senha'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  if (!loading.value) {
    emit('close')
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Alterar Senha</h2>
        <button
          @click="handleClose"
          :disabled="loading"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Erro -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Senha Atual -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Senha Atual *
          </label>
          <input
            v-model="form.currentPassword"
            type="password"
            class="input"
            placeholder="Digite sua senha atual"
            :disabled="loading"
            required
          />
        </div>

        <!-- Nova Senha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nova Senha *
          </label>
          <input
            v-model="form.newPassword"
            type="password"
            class="input"
            placeholder="Digite a nova senha"
            :disabled="loading"
            required
          />
          <p class="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
        </div>

        <!-- Confirmar Senha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nova Senha *
          </label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="input"
            placeholder="Confirme a nova senha"
            :disabled="loading"
            required
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="handleClose"
            :disabled="loading"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary"
          >
            {{ loading ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
