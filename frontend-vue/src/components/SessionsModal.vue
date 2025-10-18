<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Monitor, Smartphone, Tablet } from 'lucide-vue-next'
import settingsService from '@/services/settings.service'
import type { RefreshToken } from '@/types/settings'

const emit = defineEmits<{
  close: []
}>()

const sessions = ref<RefreshToken[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadSessions()
})

async function loadSessions() {
  loading.value = true
  try {
    sessions.value = await settingsService.getActiveSessions()
  } catch (err) {
    console.error('Erro ao carregar sessões:', err)
  } finally {
    loading.value = false
  }
}

async function revokeSession(sessionId: string) {
  if (!confirm('Deseja realmente revogar esta sessão?')) return
  
  try {
    await settingsService.revokeSession(sessionId)
    await loadSessions()
  } catch (err) {
    console.error('Erro ao revogar sessão:', err)
  }
}

async function revokeAllSessions() {
  if (!confirm('Deseja realmente revogar todas as outras sessões? Você será desconectado de todos os outros dispositivos.')) return
  
  try {
    await settingsService.revokeAllSessions()
    await loadSessions()
  } catch (err) {
    console.error('Erro ao revogar sessões:', err)
  }
}

function getDeviceIcon(userAgent: string) {
  if (userAgent.includes('Mobile')) return Smartphone
  if (userAgent.includes('Tablet')) return Tablet
  return Monitor
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR')
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date()
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Sessões Ativas</h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="text-gray-600 mt-2">Carregando sessões...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="sessions.length === 0" class="text-center py-8">
          <p class="text-gray-600">Nenhuma sessão ativa encontrada</p>
          <p class="text-sm text-gray-500 mt-2">
            Funcionalidade em desenvolvimento
          </p>
        </div>

        <!-- Sessions List -->
        <div v-else class="space-y-4">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            :class="{ 'opacity-50': session.isRevoked || isExpired(session.expiresAt) }"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3">
                <component
                  :is="getDeviceIcon('Desktop')"
                  :size="24"
                  class="text-gray-400 mt-1"
                />
                <div>
                  <p class="font-medium text-gray-900">
                    Dispositivo Desconhecido
                  </p>
                  <p class="text-sm text-gray-600">
                    Criada em: {{ formatDate(session.createdAt) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    Expira em: {{ formatDate(session.expiresAt) }}
                  </p>
                  <div class="mt-2">
                    <span
                      v-if="session.isRevoked"
                      class="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                    >
                      Revogada
                    </span>
                    <span
                      v-else-if="isExpired(session.expiresAt)"
                      class="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                    >
                      Expirada
                    </span>
                    <span
                      v-else
                      class="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded"
                    >
                      Ativa
                    </span>
                  </div>
                </div>
              </div>
              <button
                v-if="!session.isRevoked && !isExpired(session.expiresAt)"
                @click="revokeSession(session.id)"
                class="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Revogar
              </button>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>Nota:</strong> Esta funcionalidade está em desenvolvimento. 
            Em breve você poderá visualizar e gerenciar todas as suas sessões ativas.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-6 border-t border-gray-200">
        <button
          v-if="sessions.length > 1"
          @click="revokeAllSessions"
          class="btn btn-danger"
        >
          Revogar Todas as Outras Sessões
        </button>
        <div v-else></div>
        <button
          @click="emit('close')"
          class="btn btn-secondary"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>
