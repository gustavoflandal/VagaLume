import api from './api'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
  AuthTokens,
  User,
} from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return response.data.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken })
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/users/me')
    return response.data.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/users/me', data)
    return response.data.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/me/password', { currentPassword, newPassword })
  },
}
