<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const activeSection = ref('intro')

const sections = [
  { id: 'intro', label: 'Introdução', icon: '📖' },
  { id: 'auth', label: 'Autenticação', icon: '🔐' },
  { id: 'accounts', label: 'Contas', icon: '🏦' },
  { id: 'transactions', label: 'Transações', icon: '💰' },
  { id: 'categories', label: 'Categorias', icon: '📁' },
  { id: 'bills', label: 'Contas Recorrentes', icon: '📅' },
  { id: 'budgets', label: 'Orçamentos', icon: '📊' },
  { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
  { id: 'errors', label: 'Códigos de Erro', icon: '⚠️' },
]

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const userToken = computed(() => {
  return authStore.user ? 'seu_token_jwt_aqui' : 'Faça login para obter seu token'
})

// Exemplos de código
const examples = {
  login: `{
  "email": "usuario@example.com",
  "password": "senha123"
}`,
  register: `{
  "name": "Nome Completo",
  "email": "usuario@example.com",
  "password": "senha123"
}`,
  createAccount: `{
  "name": "Cartão de Crédito",
  "type": "CREDIT_CARD",
  "initialBalance": 0,
  "currency": "BRL",
  "color": "#FF5733"
}`,
  createTransaction: `{
  "type": "EXPENSE",
  "amount": 150.00,
  "description": "Supermercado",
  "date": "2025-10-18",
  "status": "COMPLETED",
  "fromAccountId": "cm...",
  "categoryId": "cm..."
}`,
  createCategory: `{
  "name": "Transporte",
  "type": "EXPENSE",
  "color": "#3498db",
  "icon": "🚗"
}`,
  createBill: `{
  "name": "Aluguel",
  "amount": 1500.00,
  "date": "2025-10-05",
  "repeatFreq": "MONTHLY",
  "numberOfInstallments": 12,
  "isFixedDay": true,
  "accountId": "cm...",
  "categoryId": "cm..."
}`,
  createBudget: `{
  "name": "Orçamento Mensal",
  "active": true
}`,
  createBudgetLimit: `{
  "amount": 5000.00,
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "currency": "BRL"
}`,
  createWebhook: `{
  "name": "Notificação de Transações",
  "url": "https://seu-servidor.com/webhook",
  "events": ["transaction.created", "transaction.updated"],
  "active": true
}`,
  webhookPayload: `{
  "event": "transaction.created",
  "timestamp": "2025-10-18T10:00:00Z",
  "data": {
    "id": "cm...",
    "type": "EXPENSE",
    "amount": 150.00
  }
}`
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('Copiado para a área de transferência!')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">📚 Documentação da API</h1>
      <p class="text-gray-600">Integre o VagaLume com seus sistemas externos</p>
    </div>

    <!-- Informações Importantes -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-start space-x-3">
        <span class="text-2xl">ℹ️</span>
        <div>
          <h3 class="font-semibold text-blue-900 mb-1">Informações Importantes</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• <strong>Base URL:</strong> <code class="bg-blue-100 px-2 py-1 rounded">{{ apiBaseUrl }}</code></li>
            <li>• <strong>Formato:</strong> JSON (Content-Type: application/json)</li>
            <li>• <strong>Autenticação:</strong> JWT Bearer Token</li>
            <li>• <strong>Rate Limit:</strong> 100 requisições por minuto</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="card sticky top-4">
          <h3 class="font-semibold text-gray-900 mb-3">Navegação</h3>
          <nav class="space-y-1">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                activeSection === section.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span class="mr-2">{{ section.icon }}</span>
              {{ section.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Content -->
      <div class="lg:col-span-3 space-y-6">
        
        <!-- Introdução -->
        <div v-if="activeSection === 'intro'" class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📖 Introdução</h2>
          <div class="prose max-w-none">
            <p class="text-gray-700 mb-4">
              A API REST do VagaLume permite que você integre suas aplicações com o sistema de gestão financeira.
              Você pode criar, ler, atualizar e excluir recursos como transações, contas, categorias e muito mais.
            </p>
            
            <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">Recursos Disponíveis</h3>
            <ul class="space-y-2 text-gray-700">
              <li>✅ <strong>Autenticação:</strong> Login, registro e refresh de tokens</li>
              <li>✅ <strong>Contas:</strong> Gerenciar contas bancárias e cartões</li>
              <li>✅ <strong>Transações:</strong> Criar e consultar transações financeiras</li>
              <li>✅ <strong>Categorias:</strong> Organizar transações por categorias</li>
              <li>✅ <strong>Contas Recorrentes:</strong> Gerenciar bills e parcelas</li>
              <li>✅ <strong>Orçamentos:</strong> Definir e acompanhar orçamentos</li>
              <li>✅ <strong>Webhooks:</strong> Receber notificações em tempo real</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">Começando</h3>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>Obtenha seu token JWT fazendo login na API</li>
              <li>Inclua o token no header Authorization de todas as requisições</li>
              <li>Faça requisições para os endpoints disponíveis</li>
            </ol>
          </div>
        </div>

        <!-- Autenticação -->
        <div v-if="activeSection === 'auth'" class="space-y-6">
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">🔐 Autenticação</h2>
            
            <div class="space-y-6">
              <!-- Login -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /auth/login</h3>
                <p class="text-gray-600 mb-3">Autentica um usuário e retorna tokens JWT.</p>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Request Body:</span>
                    <button @click="copyToClipboard(examples.login)" class="text-xs text-primary-600 hover:text-primary-700">
                      Copiar
                    </button>
                  </div>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.login }}</code></pre>
                </div>

                <div class="bg-green-50 rounded-lg p-4">
                  <span class="text-sm font-medium text-gray-700 block mb-2">Response (200 OK):</span>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "cm...",
      "email": "usuario@example.com",
      "name": "Nome do Usuário"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}</code></pre>
                </div>
              </div>

              <!-- Registro -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /auth/register</h3>
                <p class="text-gray-600 mb-3">Cria uma nova conta de usuário.</p>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Request Body:</span>
                    <button @click="copyToClipboard(examples.register)" class="text-xs text-primary-600 hover:text-primary-700">
                      Copiar
                    </button>
                  </div>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.register }}</code></pre>
                </div>
              </div>

              <!-- Usando o Token -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 class="font-semibold text-yellow-900 mb-2">💡 Como usar o Token</h4>
                <p class="text-sm text-yellow-800 mb-3">
                  Inclua o accessToken no header Authorization de todas as requisições protegidas:
                </p>
                <div class="bg-yellow-100 rounded p-3">
                  <code class="text-sm text-yellow-900">Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contas -->
        <div v-if="activeSection === 'accounts'" class="space-y-6">
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">🏦 Contas</h2>
            
            <div class="space-y-6">
              <!-- Listar Contas -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">GET /accounts</h3>
                <p class="text-gray-600 mb-3">Lista todas as contas do usuário.</p>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-3">
                  <span class="text-sm font-medium text-gray-700 block mb-2">Headers:</span>
                  <pre class="text-sm text-gray-800"><code>Authorization: Bearer {{ userToken }}</code></pre>
                </div>

                <div class="bg-green-50 rounded-lg p-4">
                  <span class="text-sm font-medium text-gray-700 block mb-2">Response (200 OK):</span>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{
  "success": true,
  "data": [
    {
      "id": "cm...",
      "name": "Conta Corrente",
      "type": "CHECKING",
      "balance": 5000.00,
      "currency": "BRL",
      "active": true
    }
  ]
}</code></pre>
                </div>
              </div>

              <!-- Criar Conta -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /accounts</h3>
                <p class="text-gray-600 mb-3">Cria uma nova conta.</p>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Request Body:</span>
                    <button @click="copyToClipboard(examples.createAccount)" class="text-xs text-primary-600 hover:text-primary-700">
                      Copiar
                    </button>
                  </div>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.createAccount }}</code></pre>
                </div>
              </div>

              <!-- Tipos de Conta -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-semibold text-blue-900 mb-2">Tipos de Conta Disponíveis:</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• <code>CHECKING</code> - Conta Corrente</li>
                  <li>• <code>SAVINGS</code> - Poupança</li>
                  <li>• <code>CREDIT_CARD</code> - Cartão de Crédito</li>
                  <li>• <code>INVESTMENT</code> - Investimento</li>
                  <li>• <code>CASH</code> - Dinheiro</li>
                  <li>• <code>OTHER</code> - Outro</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Transações -->
        <div v-if="activeSection === 'transactions'" class="space-y-6">
          <div class="card">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">💰 Transações</h2>
            
            <div class="space-y-6">
              <!-- Listar Transações -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">GET /transactions</h3>
                <p class="text-gray-600 mb-3">Lista transações com filtros opcionais.</p>
                
                <div class="bg-gray-50 rounded-lg p-4 mb-3">
                  <span class="text-sm font-medium text-gray-700 block mb-2">Query Parameters (opcionais):</span>
                  <pre class="text-sm text-gray-800"><code>?type=EXPENSE&startDate=2025-01-01&endDate=2025-12-31&accountId=cm...</code></pre>
                </div>

                <div class="bg-green-50 rounded-lg p-4">
                  <span class="text-sm font-medium text-gray-700 block mb-2">Response (200 OK):</span>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{
  "success": true,
  "data": [
    {
      "id": "cm...",
      "type": "EXPENSE",
      "amount": 150.00,
      "description": "Supermercado",
      "date": "2025-10-18",
      "status": "COMPLETED",
      "fromAccountId": "cm...",
      "categoryId": "cm..."
    }
  ]
}</code></pre>
                </div>
              </div>

              <!-- Criar Transação -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /transactions</h3>
                <p class="text-gray-600 mb-3">Cria uma nova transação.</p>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Request Body:</span>
                    <button @click="copyToClipboard(examples.createTransaction)" class="text-xs text-primary-600 hover:text-primary-700">
                      Copiar
                    </button>
                  </div>
                  <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.createTransaction }}</code></pre>
                </div>
              </div>

              <!-- Tipos de Transação -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-semibold text-blue-900 mb-2">Tipos de Transação:</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• <code>INCOME</code> - Receita (requer fromAccountId)</li>
                  <li>• <code>EXPENSE</code> - Despesa (requer fromAccountId)</li>
                  <li>• <code>TRANSFER</code> - Transferência (requer fromAccountId e toAccountId)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Categorias -->
        <div v-if="activeSection === 'categories'" class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📁 Categorias</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">GET /categories</h3>
              <p class="text-gray-600 mb-3">Lista todas as categorias.</p>
              
              <div class="bg-green-50 rounded-lg p-4">
                <span class="text-sm font-medium text-gray-700 block mb-2">Response:</span>
                <pre class="text-sm text-gray-800 overflow-x-auto"><code>{
  "success": true,
  "data": [
    {
      "id": "cm...",
      "name": "Alimentação",
      "type": "EXPENSE",
      "color": "#FF5733",
      "icon": "🍔"
    }
  ]
}</code></pre>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /categories</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Request Body:</span>
                  <button @click="copyToClipboard(examples.createCategory)" class="text-xs text-primary-600 hover:text-primary-700">
                    Copiar
                  </button>
                </div>
                <pre class="text-sm text-gray-800"><code>{{ examples.createCategory }}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Bills -->
        <div v-if="activeSection === 'bills'" class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📅 Contas Recorrentes</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">GET /bills</h3>
              <p class="text-gray-600 mb-3">Lista todas as contas recorrentes.</p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /bills</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Request Body:</span>
                  <button @click="copyToClipboard(examples.createBill)" class="text-xs text-primary-600 hover:text-primary-700">
                    Copiar
                  </button>
                </div>
                <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.createBill }}</code></pre>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-semibold text-blue-900 mb-2">Frequências Disponíveis:</h4>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• <code>DAILY</code> - Diário</li>
                <li>• <code>WEEKLY</code> - Semanal</li>
                <li>• <code>MONTHLY</code> - Mensal</li>
                <li>• <code>YEARLY</code> - Anual</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Budgets -->
        <div v-if="activeSection === 'budgets'" class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">📊 Orçamentos</h2>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">GET /budgets</h3>
              <p class="text-gray-600 mb-3">Lista todos os orçamentos.</p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /budgets</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Request Body:</span>
                  <button @click="copyToClipboard(examples.createBudget)" class="text-xs text-primary-600 hover:text-primary-700">
                    Copiar
                  </button>
                </div>
                <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.createBudget }}</code></pre>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /budgets/:id/limits</h3>
              <p class="text-gray-600 mb-3">Adiciona limite a um orçamento.</p>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Request Body:</span>
                  <button @click="copyToClipboard(examples.createBudgetLimit)" class="text-xs text-primary-600 hover:text-primary-700">
                    Copiar
                  </button>
                </div>
                <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.createBudgetLimit }}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Webhooks -->
        <div v-if="activeSection === 'webhooks'" class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">🔗 Webhooks</h2>
          
          <div class="space-y-6">
            <p class="text-gray-700">
              Webhooks permitem que você receba notificações em tempo real quando eventos ocorrem no sistema.
            </p>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">POST /webhooks</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Request Body:</span>
                  <button @click="copyToClipboard(examples.createWebhook)" class="text-xs text-primary-600 hover:text-primary-700">
                    Copiar
                  </button>
                </div>
                <pre class="text-sm text-gray-800 overflow-x-auto"><code>{{ examples.createWebhook }}</code></pre>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-semibold text-blue-900 mb-2">Eventos Disponíveis:</h4>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• <code>transaction.created</code></li>
                <li>• <code>transaction.updated</code></li>
                <li>• <code>transaction.deleted</code></li>
                <li>• <code>bill.created</code></li>
                <li>• <code>bill.paid</code></li>
              </ul>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-semibold text-yellow-900 mb-2">Formato do Payload:</h4>
              <pre class="text-sm text-yellow-800 overflow-x-auto"><code>{{ examples.webhookPayload }}</code></pre>
            </div>
          </div>
        </div>

        <!-- Códigos de Erro -->
        <div v-if="activeSection === 'errors'" class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">⚠️ Códigos de Erro</h2>
          
          <div class="space-y-4">
            <div class="border-l-4 border-red-500 bg-red-50 p-4">
              <h4 class="font-semibold text-red-900">400 - Bad Request</h4>
              <p class="text-sm text-red-800">Dados inválidos ou faltando campos obrigatórios.</p>
            </div>

            <div class="border-l-4 border-yellow-500 bg-yellow-50 p-4">
              <h4 class="font-semibold text-yellow-900">401 - Unauthorized</h4>
              <p class="text-sm text-yellow-800">Token inválido ou expirado.</p>
            </div>

            <div class="border-l-4 border-orange-500 bg-orange-50 p-4">
              <h4 class="font-semibold text-orange-900">403 - Forbidden</h4>
              <p class="text-sm text-orange-800">Sem permissão para acessar o recurso.</p>
            </div>

            <div class="border-l-4 border-purple-500 bg-purple-50 p-4">
              <h4 class="font-semibold text-purple-900">404 - Not Found</h4>
              <p class="text-sm text-purple-800">Recurso não encontrado.</p>
            </div>

            <div class="border-l-4 border-pink-500 bg-pink-50 p-4">
              <h4 class="font-semibold text-pink-900">429 - Too Many Requests</h4>
              <p class="text-sm text-pink-800">Limite de requisições excedido.</p>
            </div>

            <div class="border-l-4 border-gray-500 bg-gray-50 p-4">
              <h4 class="font-semibold text-gray-900">500 - Internal Server Error</h4>
              <p class="text-sm text-gray-800">Erro interno do servidor.</p>
            </div>

            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Formato de Resposta de Erro:</h3>
              <div class="bg-red-50 rounded-lg p-4">
                <pre class="text-sm text-red-800"><code>{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}</code></pre>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <div class="mt-12 text-center text-gray-600">
      <p class="mb-2">Precisa de ajuda? Entre em contato com o suporte.</p>
      <p class="text-sm">Versão da API: 1.0.0</p>
    </div>
  </div>
</template>

<style scoped>
code {
  font-family: 'Courier New', monospace;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
