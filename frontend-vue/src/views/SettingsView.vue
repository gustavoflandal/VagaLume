<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import SessionsModal from '@/components/SessionsModal.vue'
import settingsService from '@/services/settings.service'

const router = useRouter()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const activeTab = ref('general')
const showPasswordModal = ref(false)
const showSessionsModal = ref(false)
const saving = ref(false)
const successMessage = ref<string | null>(null)

const tabs = [
  { id: 'general', label: 'Geral', icon: '⚙️' },
  { id: 'security', label: 'Segurança', icon: '🔒' },
  { id: 'notifications', label: 'Notificações', icon: '🔔' },
  { id: 'integrations', label: 'Integrações', icon: '🔗' },
]

const currencyOptions = [
  { value: 'BRL', label: 'BRL - Real Brasileiro' },
  { value: 'USD', label: 'USD - Dólar Americano' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - Libra Esterlina' },
  { value: 'JPY', label: 'JPY - Iene Japonês' },
]

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const languageOptions = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
]


onMounted(async () => {
  await settingsStore.fetchSettings()
})

const settings = computed(() => settingsStore.settings)

async function saveSettings() {
  if (!settings.value) return
  
  saving.value = true
  successMessage.value = null
  try {
    await settingsStore.updateSettings({
      currency: settings.value.currency,
      dateFormat: settings.value.dateFormat,
      language: settings.value.language,
      notifyBillsDue: settings.value.notifyBillsDue,
      notifyBudgetExceeded: settings.value.notifyBudgetExceeded,
      notifyRecurrences: settings.value.notifyRecurrences,
      billsDueDays: settings.value.billsDueDays,
    })
    successMessage.value = 'Configurações salvas com sucesso!'
    setTimeout(() => successMessage.value = null, 3000)
  } catch (err) {
    console.error('Erro ao salvar configurações:', err)
  } finally {
    saving.value = false
  }
}

async function resetSettings() {
  if (!confirm('Deseja realmente resetar todas as configurações para os valores padrão?')) return
  
  try {
    await settingsStore.resetSettings()
    successMessage.value = 'Configurações resetadas com sucesso!'
    setTimeout(() => successMessage.value = null, 3000)
  } catch (err) {
    console.error('Erro ao resetar configurações:', err)
  }
}

function handlePasswordChanged() {
  successMessage.value = 'Senha alterada com sucesso!'
  setTimeout(() => successMessage.value = null, 3000)
}

async function exportData() {
  try {
    const data = await settingsService.exportData()
    
    // Converter para JSON string
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // Criar link de download
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vagalume-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    
    // Limpar
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    successMessage.value = 'Dados exportados com sucesso!'
    setTimeout(() => successMessage.value = null, 3000)
  } catch (err) {
    console.error('Erro ao exportar dados:', err)
    alert('Erro ao exportar dados. Verifique o console para mais detalhes.')
  }
}

async function deactivateAccount() {
  if (!confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nDeseja realmente excluir sua conta e todos os seus dados?')) return
  if (!confirm('Tem certeza absoluta? Todos os seus dados serão perdidos permanentemente.')) return
  
  try {
    await settingsService.deactivateAccount()
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Erro ao desativar conta:', err)
    alert('Erro ao excluir conta. Tente novamente.')
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>

    <!-- Tabs -->
    <div class="card mb-6">
      <div class="flex border-b border-gray-200 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-3 font-medium text-sm whitespace-nowrap',
            activeTab === tab.id
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
      {{ successMessage }}
    </div>

    <!-- Loading -->
    <div v-if="settingsStore.loading && !settings" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="text-gray-600 mt-4">Carregando configurações...</p>
    </div>

    <!-- Conteúdo das Tabs -->
    <div v-else-if="settings" class="space-y-6">
      <!-- Geral -->
      <div v-if="activeTab === 'general'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Configurações Gerais</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Moeda Padrão
            </label>
            <select v-model="settings.currency" class="input">
              <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Formato de Data
            </label>
            <select v-model="settings.dateFormat" class="input">
              <option v-for="opt in dateFormatOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select v-model="settings.language" class="input">
              <option v-for="opt in languageOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="pt-4 flex justify-between">
            <button @click="resetSettings" class="btn btn-secondary">
              Restaurar Padrões
            </button>
            <button @click="saveSettings" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Segurança -->
      <div v-if="activeTab === 'security'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Segurança</h2>
        <div class="space-y-4">
          <div>
            <button @click="showPasswordModal = true" class="btn btn-primary">
              Alterar Senha
            </button>
          </div>
          <div>
            <button @click="showSessionsModal = true" class="btn btn-secondary">
              Ver Sessões Ativas
            </button>
          </div>
        </div>
      </div>

      <!-- Notificações -->
      <div v-if="activeTab === 'notifications'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Notificações</h2>
        <div class="space-y-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="settings.notifyBillsDue"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Notificar quando uma conta estiver próxima do vencimento</span>
          </label>
          <div v-if="settings.notifyBillsDue" class="ml-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dias de antecedência
            </label>
            <input
              v-model.number="settings.billsDueDays"
              type="number"
              min="0"
              max="30"
              class="input w-32"
            />
          </div>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="settings.notifyBudgetExceeded"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Notificar quando um orçamento for excedido</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="settings.notifyRecurrences"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Notificar sobre transações recorrentes geradas</span>
          </label>
          <div class="pt-4 flex justify-end">
            <button @click="saveSettings" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>


      <!-- Integrações -->
      <div v-if="activeTab === 'integrations'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Integrações</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🔗</span>
              <div>
                <p class="font-medium text-gray-900">Webhooks</p>
                <p class="text-sm text-gray-600">Integre com sistemas externos</p>
              </div>
            </div>
            <router-link to="/webhooks" class="btn btn-sm btn-primary">
              Gerenciar
            </router-link>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📊</span>
              <div>
                <p class="font-medium text-gray-900">API</p>
                <p class="text-sm text-gray-600">Acesse seus dados via API</p>
              </div>
            </div>
            <router-link to="/api-docs" class="btn btn-sm btn-secondary">
              Ver Documentação
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div v-if="settings" class="card mt-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Zona de Perigo</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">Exportar Todos os Dados</p>
            <p class="text-sm text-gray-600">Baixe uma cópia de todos os seus dados</p>
          </div>
          <button @click="exportData" class="btn btn-secondary">
            Exportar
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-red-600">Excluir Conta</p>
            <p class="text-sm text-gray-600">Exclua permanentemente sua conta e todos os dados</p>
          </div>
          <button @click="deactivateAccount" class="btn btn-danger">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChangePasswordModal
      v-if="showPasswordModal"
      @close="showPasswordModal = false"
      @success="handlePasswordChanged"
    />
    <SessionsModal
      v-if="showSessionsModal"
      @close="showSessionsModal = false"
    />
  </div>
</template>
