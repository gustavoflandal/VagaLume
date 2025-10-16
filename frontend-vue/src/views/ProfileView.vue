<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const profileForm = ref({
  name: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileError = ref('')
const passwordError = ref('')
const profileSuccess = ref(false)
const passwordSuccess = ref(false)
const isLoadingProfile = ref(false)
const isLoadingPassword = ref(false)

onMounted(() => {
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name,
      email: authStore.user.email
    }
  }
})

async function handleUpdateProfile() {
  profileError.value = ''
  profileSuccess.value = false

  if (!profileForm.value.name || !profileForm.value.email) {
    profileError.value = 'Todos os campos são obrigatórios'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    profileError.value = 'E-mail inválido'
    return
  }

  try {
    isLoadingProfile.value = true
    await authStore.updateProfile(profileForm.value)
    profileSuccess.value = true
    setTimeout(() => {
      profileSuccess.value = false
    }, 3000)
  } catch (error: any) {
    profileError.value = error.message || 'Erro ao atualizar perfil'
  } finally {
    isLoadingProfile.value = false
  }
}

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    passwordError.value = 'Todos os campos são obrigatórios'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'A nova senha deve ter no mínimo 6 caracteres'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'As senhas não conferem'
    return
  }

  try {
    isLoadingPassword.value = true
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    passwordSuccess.value = true
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    setTimeout(() => {
      passwordSuccess.value = false
    }, 3000)
  } catch (error: any) {
    passwordError.value = error.message || 'Erro ao alterar senha'
  } finally {
    isLoadingPassword.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Informações do Perfil -->
      <div class="card">
        <div class="flex items-center space-x-4 mb-6">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-2xl font-bold text-primary-600">
              {{ authStore.user?.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ authStore.user?.name }}</h2>
            <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</h3>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              id="name"
              v-model="profileForm.name"
              type="text"
              required
              class="input"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              v-model="profileForm.email"
              type="email"
              required
              class="input"
              placeholder="seu@email.com"
            />
          </div>

          <div v-if="profileError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ profileError }}
          </div>

          <div v-if="profileSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Perfil atualizado com sucesso!
          </div>

          <button
            type="submit"
            :disabled="isLoadingProfile"
            class="btn-primary w-full"
          >
            <span v-if="isLoadingProfile">Salvando...</span>
            <span v-else>Salvar Alterações</span>
          </button>
        </form>
      </div>

      <!-- Alterar Senha -->
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Alterar Senha</h3>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Senha atual
            </label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="input"
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              required
              class="input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="input"
              placeholder="Digite a nova senha novamente"
            />
          </div>

          <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ passwordError }}
          </div>

          <div v-if="passwordSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Senha alterada com sucesso!
          </div>

          <button
            type="submit"
            :disabled="isLoadingPassword"
            class="btn-primary w-full"
          >
            <span v-if="isLoadingPassword">Alterando...</span>
            <span v-else>Alterar Senha</span>
          </button>
        </form>
      </div>

      <!-- Informações da Conta -->
      <div class="card lg:col-span-2">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Informações da Conta</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Status da Conta</p>
            <p class="font-medium text-gray-900">
              {{ authStore.user?.isActive ? 'Ativa' : 'Inativa' }}
            </p>
          </div>

          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Membro desde</p>
            <p class="font-medium text-gray-900">
              {{ authStore.user?.createdAt ? new Date(authStore.user.createdAt).toLocaleDateString('pt-BR') : '-' }}
            </p>
          </div>

          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Última atualização</p>
            <p class="font-medium text-gray-900">
              {{ authStore.user?.updatedAt ? new Date(authStore.user.updatedAt).toLocaleDateString('pt-BR') : '-' }}
            </p>
          </div>

          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">ID do Usuário</p>
            <p class="font-mono text-xs text-gray-900">
              {{ authStore.user?.id }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
