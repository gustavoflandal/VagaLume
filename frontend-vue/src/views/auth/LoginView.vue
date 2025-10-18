<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  try {
    error.value = ''
    isLoading.value = true

    await authStore.login({
      email: email.value,
      password: password.value,
    })

    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao fazer login'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <img src="@/assets/logo.png" alt="VagaLume" class="mx-auto mb-4 h-42" />
        </div>

        <!-- Formulário de Login -->
        <form @submit.prevent="handleSubmit">
          <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
          </div>

          <div class="mb-4">
            <label for="email" class="block text-gray-700 font-medium mb-2">E-mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input"
              placeholder="seu@email.com"
            />
          </div>

          <div class="mb-6">
            <label for="password" class="block text-gray-700 font-medium mb-2">Senha</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary w-full"
          >
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <!-- Link para Registro -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Não tem uma conta?
            <router-link to="/register" class="text-primary-500 hover:text-primary-600 font-medium">
              Cadastre-se
            </router-link>
          </p>
        </div>
      </div>

      <!-- Credenciais Demo -->
      <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800 font-medium mb-2">📌 Credenciais de Demonstração:</p>
        <p class="text-sm text-blue-700">
          <strong>E-mail:</strong> demo@vagalume.com.br<br>
          <strong>Senha:</strong> Demo@2025
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
