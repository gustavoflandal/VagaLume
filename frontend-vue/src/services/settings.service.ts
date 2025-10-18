import api from './api'
import type { UserSettings, UpdateSettingsData, ChangePasswordData, RefreshToken } from '@/types/settings'

class SettingsService {
  /**
   * Busca configurações do usuário
   */
  async getSettings(): Promise<UserSettings> {
    const response = await api.get('/settings')
    return response.data.data
  }

  /**
   * Atualiza configurações do usuário
   */
  async updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
    const response = await api.put('/settings', data)
    return response.data.data
  }

  /**
   * Reseta configurações para valores padrão
   */
  async resetSettings(): Promise<UserSettings> {
    const response = await api.post('/settings/reset')
    return response.data.data
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.put('/users/me/password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  }

  /**
   * Busca sessões ativas (refresh tokens)
   */
  async getActiveSessions(): Promise<RefreshToken[]> {
    // TODO: Implementar endpoint no backend
    // Por enquanto retorna array vazio
    return []
  }

  /**
   * Revoga uma sessão específica
   */
  async revokeSession(tokenId: string): Promise<void> {
    // TODO: Implementar endpoint no backend
    console.log('Revoking session:', tokenId)
  }

  /**
   * Revoga todas as sessões exceto a atual
   */
  async revokeAllSessions(): Promise<void> {
    // TODO: Implementar endpoint no backend
    console.log('Revoking all sessions')
  }

  /**
   * Exporta todos os dados do usuário
   */
  async exportData(): Promise<any> {
    const response = await api.get('/users/me/export')
    return response.data
  }

  /**
   * Desativa conta do usuário
   */
  async deactivateAccount(): Promise<void> {
    await api.delete('/users/me')
  }
}

export default new SettingsService()
