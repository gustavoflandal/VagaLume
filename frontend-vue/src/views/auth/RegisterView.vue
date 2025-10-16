<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: ''
})

const errors = ref<Record<string, string>>({})

async function handleSubmit() {
  // Limpar erros
  errors.value = {}

  // Validações básicas
  if (!form.value.name) {
    errors.value.name = 'Nome é obrigatório'
  }

  if (!form.value.email) {
    errors.value.email = 'E-mail é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'E-mail inválido'
  }

  if (!form.value.password) {
    errors.value.password = 'Senha é obrigatória'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Senha deve ter no mínimo 6 caracteres'
  }

  if (form.value.password !== form.value.passwordConfirmation) {
    errors.value.passwordConfirmation = 'As senhas não conferem'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  try {
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      passwordConfirmation: form.value.passwordConfirmation
    })
    router.push('/')
  } catch (error) {
    console.error('Erro no registro:', error)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="card">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-primary-600 mb-2">VagaLume</h1>
          <p class="text-gray-600">Crie sua conta</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Nome -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Seu nome completo"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- E-mail -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              :class="{ 'border-red-500': errors.email }"
              placeholder="seu@email.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Senha -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Mínimo 6 caracteres"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <label for="passwordConfirmation" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input
              id="passwordConfirmation"
              v-model="form.passwordConfirmation"
              type="password"
              required
              class="input"
              :class="{ 'border-red-500': errors.passwordConfirmation }"
              placeholder="Digite a senha novamente"
            />
            <p v-if="errors.passwordConfirmation" class="mt-1 text-sm text-red-600">
              {{ errors.passwordConfirmation }}
            </p>
          </div>

          <!-- Erro Geral -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ authStore.error }}
          </div>

          <!-- Botão de Registro -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn-primary w-full"
          >
            <span v-if="authStore.isLoading">Criando conta...</span>
            <span v-else>Criar conta</span>
          </button>
        </form>

        <!-- Link para Login -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Já tem uma conta?
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
              Fazer login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
