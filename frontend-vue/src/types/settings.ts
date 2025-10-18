export interface UserSettings {
  id: string
  userId: string
  
  // Configurações Gerais
  currency: string
  dateFormat: string
  language: string
  timezone: string
  
  // Preferências de Interface
  theme: string
  showBalance: boolean
  autoApplyRules: boolean
  
  // Notificações
  notifyBillsDue: boolean
  notifyBudgetExceeded: boolean
  notifyRecurrences: boolean
  billsDueDays: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsData {
  // Configurações Gerais
  currency?: string
  dateFormat?: string
  language?: string
  timezone?: string
  
  // Preferências de Interface
  theme?: string
  showBalance?: boolean
  autoApplyRules?: boolean
  
  // Notificações
  notifyBillsDue?: boolean
  notifyBudgetExceeded?: boolean
  notifyRecurrences?: boolean
  billsDueDays?: number
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword?: string
}

export interface RefreshToken {
  id: string
  token: string
  userId: string
  expiresAt: string
  isRevoked: boolean
  createdAt: string
}
