import api from './api'
import type {
  Transaction,
  CreateTransactionData,
  ApiResponse,
  PaginatedResponse,
} from '@/types'

export const transactionService = {
  async getAll(params?: {
    page?: number
    limit?: number
    type?: string
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<Transaction>> {
    try {
      const response = await api.get<any>('/transactions', {
        params,
      })
      // Backend retorna: { success: true, data: [...], pagination: {...} }
      const result = response.data
      return {
        data: Array.isArray(result?.data) ? result.data : [],
        pagination: result?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    }
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return response.data.data
  },

  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  async getSummary(startDate?: string, endDate?: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/transactions/summary', {
      params: { startDate, endDate },
    })
    return response.data.data
  },
}
