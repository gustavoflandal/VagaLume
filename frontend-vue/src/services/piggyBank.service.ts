import api from './api'
import type { ApiResponse } from '@/types'

export interface PiggyBank {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  startDate?: string
  targetDate?: string
  order: number
  active: boolean
  userId: string
  accountId?: string
  objectGroupId?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePiggyBankData {
  name: string
  targetAmount: number
  startDate?: string
  targetDate?: string
  accountId?: string
  objectGroupId?: string
}

export interface PiggyBankStatistics {
  total: number
  active: number
  completed: number
  totalSaved: number
  totalTarget: number
  averageProgress: number
}

export const piggyBankService = {
  async getAll(includeInactive = false): Promise<PiggyBank[]> {
    try {
      const response = await api.get<ApiResponse<PiggyBank[]>>('/piggy-banks', {
        params: { includeInactive },
      })
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar cofrinhos:', error)
      return []
    }
  },

  async getById(id: string): Promise<PiggyBank> {
    const response = await api.get<ApiResponse<PiggyBank>>(`/piggy-banks/${id}`)
    return response.data.data
  },

  async create(data: CreatePiggyBankData): Promise<PiggyBank> {
    const response = await api.post<ApiResponse<PiggyBank>>('/piggy-banks', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreatePiggyBankData>): Promise<PiggyBank> {
    const response = await api.put<ApiResponse<PiggyBank>>(`/piggy-banks/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/piggy-banks/${id}`)
  },

  async addMoney(id: string, amount: number, date?: string): Promise<PiggyBank> {
    const response = await api.post<ApiResponse<PiggyBank>>(`/piggy-banks/${id}/add-money`, {
      amount,
      date,
    })
    return response.data.data
  },

  async removeMoney(id: string, amount: number, date?: string): Promise<PiggyBank> {
    const response = await api.post<ApiResponse<PiggyBank>>(`/piggy-banks/${id}/remove-money`, {
      amount,
      date,
    })
    return response.data.data
  },

  async getStatistics(): Promise<PiggyBankStatistics> {
    const response = await api.get<ApiResponse<PiggyBankStatistics>>('/piggy-banks/statistics')
    return response.data.data
  },
}
