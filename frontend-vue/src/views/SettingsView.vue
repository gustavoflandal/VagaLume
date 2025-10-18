<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'Geral', icon: '⚙️' },
  { id: 'security', label: 'Segurança', icon: '🔒' },
  { id: 'notifications', label: 'Notificações', icon: '🔔' },
  { id: 'preferences', label: 'Preferências', icon: '🎨' },
  { id: 'integrations', label: 'Integrações', icon: '🔗' },
]
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

    <!-- Conteúdo das Tabs -->
    <div class="space-y-6">
      <!-- Geral -->
      <div v-if="activeTab === 'general'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Configurações Gerais</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Moeda Padrão
            </label>
            <select class="input">
              <option>BRL - Real Brasileiro</option>
              <option>USD - Dólar Americano</option>
              <option>EUR - Euro</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Formato de Data
            </label>
            <select class="input">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select class="input">
              <option>Português (Brasil)</option>
              <option>English</option>
              <option>Español</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Segurança -->
      <div v-if="activeTab === 'security'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Segurança</h2>
        <div class="space-y-4">
          <div>
            <button class="btn btn-primary">
              Alterar Senha
            </button>
          </div>
          <div>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-gray-700">Autenticação de dois fatores (2FA)</span>
            </label>
          </div>
          <div>
            <button class="btn btn-secondary">
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
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Notificar quando uma conta estiver próxima do vencimento</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Notificar quando um orçamento for excedido</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Notificar sobre transações recorrentes geradas</span>
          </label>
        </div>
      </div>

      <!-- Preferências -->
      <div v-if="activeTab === 'preferences'" class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Preferências</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <select class="input">
              <option>Claro</option>
              <option>Escuro</option>
              <option>Automático</option>
            </select>
          </div>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Mostrar saldo nas contas</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700">Aplicar regras automaticamente em novas transações</span>
          </label>
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
            <button class="btn btn-sm btn-secondary">
              Ver Documentação
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="card mt-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Zona de Perigo</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">Exportar Todos os Dados</p>
            <p class="text-sm text-gray-600">Baixe uma cópia de todos os seus dados</p>
          </div>
          <button class="btn btn-secondary">
            Exportar
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-red-600">Excluir Conta</p>
            <p class="text-sm text-gray-600">Exclua permanentemente sua conta e todos os dados</p>
          </div>
          <button class="btn btn-danger">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
