import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { User, LoginCredentials, RegisterData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // Actions
  async function login(credentials: LoginCredentials) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.login(credentials)
      
      user.value = response.user
      accessToken.value = response.tokens.accessToken
      refreshToken.value = response.tokens.refreshToken

      localStorage.setItem('accessToken', response.tokens.accessToken)
      localStorage.setItem('refreshToken', response.tokens.refreshToken)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao fazer login'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterData) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.register(data)
      
      user.value = response.user
      accessToken.value = response.tokens.accessToken
      refreshToken.value = response.tokens.refreshToken

      localStorage.setItem('accessToken', response.tokens.accessToken)
      localStorage.setItem('refreshToken', response.tokens.refreshToken)

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao registrar'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await authService.logout()
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async function refreshTokenAction() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const tokens = await authService.refreshToken(refreshToken.value)
      
      accessToken.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken

      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
    } catch (err) {
      await logout()
      throw err
    }
  }

  async function checkAuth() {
    if (!accessToken.value) {
      return
    }

    try {
      const profile = await authService.getProfile()
      user.value = profile
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err)
      await logout()
    }
  }

  async function updateProfile(data: Partial<User>) {
    try {
      isLoading.value = true
      error.value = null

      const updatedUser = await authService.updateProfile(data)
      user.value = updatedUser

      return updatedUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar perfil'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      isLoading.value = true
      error.value = null

      await authService.changePassword(currentPassword, newPassword)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao alterar senha'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    refreshAccessToken: refreshTokenAction,
    checkAuth,
    updateProfile,
    changePassword,
  }
})
