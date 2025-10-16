import api from './api'
import type { Account, CreateAccountData, ApiResponse } from '@/types'

export const accountService = {
  async getAll(): Promise<Account[]> {
    try {
      const response = await api.get<ApiResponse<Account[]>>('/accounts')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar contas:', error)
      return []
    }
  },

  async getById(id: string): Promise<Account> {
    const response = await api.get<ApiResponse<Account>>(`/accounts/${id}`)
    return response.data.data
  },

  async create(data: CreateAccountData): Promise<Account> {
    const response = await api.post<ApiResponse<Account>>('/accounts', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateAccountData>): Promise<Account> {
    const response = await api.put<ApiResponse<Account>>(`/accounts/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`)
  },

  async getSummary(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/accounts/summary')
    return response.data.data
  },
}
