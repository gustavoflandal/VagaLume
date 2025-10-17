<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWebhookStore } from '@/stores/webhook'

const store = useWebhookStore()

const showInactive = ref(false)

onMounted(async () => {
  await store.fetchAll(showInactive.value)
})

async function toggleShowInactive() {
  showInactive.value = !showInactive.value
  await store.fetchAll(showInactive.value)
}

async function deleteWebhook(id: string) {
  if (confirm('Tem certeza que deseja excluir este webhook?')) {
    try {
      await store.remove(id)
    } catch (error) {
      console.error('Erro ao excluir webhook:', error)
    }
  }
}

async function testWebhook(id: string) {
  try {
    await store.test(id)
    alert('Webhook testado com sucesso!')
  } catch (error) {
    console.error('Erro ao testar webhook:', error)
  }
}

async function processPending() {
  if (confirm('Processar todos os webhooks pendentes?')) {
    try {
      await store.processPending()
      alert('Webhooks processados com sucesso!')
    } catch (error) {
      console.error('Erro ao processar webhooks:', error)
    }
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Webhooks</h1>
      <div class="flex items-center space-x-2">
        <button
          @click="processPending"
          class="btn btn-secondary"
        >
          🔄 Processar Pendentes
        </button>
        <router-link to="/webhooks/new" class="btn btn-primary">
          + Novo Webhook
        </router-link>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Total de Webhooks</p>
        <p class="text-2xl font-bold text-gray-900">{{ store.webhooks.length }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-600 mb-1">Webhooks Ativos</p>
        <p class="text-2xl font-bold text-primary-600">{{ store.activeWebhooks.length }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="showInactive"
          @change="toggleShowInactive"
          class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="text-sm text-gray-700">Mostrar inativos</span>
      </label>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Lista de Webhooks -->
    <div v-else-if="store.activeWebhooks.length > 0" class="space-y-4">
      <div
        v-for="webhook in store.activeWebhooks"
        :key="webhook.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900">{{ webhook.title }}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                {{ webhook.trigger }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ webhook.url }}</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Resposta</p>
                <p class="font-medium text-gray-900">{{ webhook.response }}</p>
              </div>
              <div>
                <p class="text-gray-600">Entrega</p>
                <p class="font-medium text-gray-900">{{ webhook.delivery }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="testWebhook(webhook.id)"
              class="btn btn-sm btn-secondary"
              title="Testar webhook"
            >
              🧪
            </button>
            <router-link
              :to="`/webhooks/${webhook.id}/history`"
              class="btn btn-sm btn-secondary"
            >
              Histórico
            </router-link>
            <router-link
              :to="`/webhooks/${webhook.id}/edit`"
              class="btn btn-sm btn-secondary"
            >
              Editar
            </router-link>
            <button
              @click="deleteWebhook(webhook.id)"
              class="btn btn-sm btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card text-center py-12">
      <span class="text-6xl mb-4 block">🔗</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum webhook cadastrado</h3>
      <p class="text-gray-600 mb-6">Crie seu primeiro webhook para integrar com sistemas externos!</p>
      <router-link to="/webhooks/new" class="btn btn-primary">
        + Criar Primeiro Webhook
      </router-link>
    </div>
  </div>
</template>
