import api from './api'
import type { ApiResponse } from '@/types'

export interface Recurrence {
  id: string
  title: string
  description?: string
  firstDate: string
  repeatUntil?: string
  repetitions?: number
  applyRules: boolean
  active: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateRecurrenceData {
  title: string
  description?: string
  firstDate: string
  repeatUntil?: string
  repetitions?: number
  applyRules?: boolean
  repetitionType: string
  repetitionMoment: string
  repetitionSkip?: number
  repetitionWeekend?: number
  transactionData: {
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    fromAccountId: string
    toAccountId: string
    categoryId?: string
    budgetId?: string
    billId?: string
  }
}

export const recurrenceService = {
  async getAll(includeInactive = false): Promise<Recurrence[]> {
    try {
      const response = await api.get<ApiResponse<Recurrence[]>>('/recurrences', {
        params: { includeInactive },
      })
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar recorrências:', error)
      return []
    }
  },

  async getById(id: string): Promise<Recurrence> {
    const response = await api.get<ApiResponse<Recurrence>>(`/recurrences/${id}`)
    return response.data.data
  },

  async create(data: CreateRecurrenceData): Promise<Recurrence> {
    const response = await api.post<ApiResponse<Recurrence>>('/recurrences', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateRecurrenceData>): Promise<Recurrence> {
    const response = await api.put<ApiResponse<Recurrence>>(`/recurrences/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recurrences/${id}`)
  },

  async getNextOccurrences(id: string, count = 5): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/recurrences/${id}/next-occurrences`, {
      params: { count },
    })
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async generateAll(): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/recurrences/generate-all')
    return response.data.data
  },
}
