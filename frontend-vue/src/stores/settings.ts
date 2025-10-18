import { defineStore } from 'pinia'
import { ref } from 'vue'
import settingsService from '@/services/settings.service'
import type { UserSettings, UpdateSettingsData } from '@/types/settings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<UserSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      settings.value = await settingsService.getSettings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar configurações'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(data: UpdateSettingsData) {
    loading.value = true
    error.value = null
    try {
      settings.value = await settingsService.updateSettings(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar configurações'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetSettings() {
    loading.value = true
    error.value = null
    try {
      settings.value = await settingsService.resetSettings()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao resetar configurações'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    settings,
    loading,
    error,
    
    // Actions
    fetchSettings,
    updateSettings,
    resetSettings,
  }
})
