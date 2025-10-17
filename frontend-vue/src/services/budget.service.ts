import api from './api'
import type { ApiResponse } from '@/types'

export interface Budget {
  id: string
  name: string
  active: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface BudgetLimit {
  id: string
  budgetId: string
  amount: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface AutoBudget {
  id: string
  budgetId: string
  type: 'RESET' | 'ROLLOVER' | 'ADJUSTED'
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
  amount: number
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetData {
  name: string
}

export interface CreateBudgetLimitData {
  budgetId: string
  amount: number
  startDate: string
  endDate: string
}

export interface CreateAutoBudgetData {
  type: 'RESET' | 'ROLLOVER' | 'ADJUSTED'
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
  amount: number
}

export const budgetService = {
  async getAll(includeInactive = false): Promise<Budget[]> {
    try {
      const response = await api.get<ApiResponse<Budget[]>>('/budgets', {
        params: { includeInactive },
      })
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar budgets:', error)
      return []
    }
  },

  async getById(id: string): Promise<Budget> {
    const response = await api.get<ApiResponse<Budget>>(`/budgets/${id}`)
    return response.data.data
  },

  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateBudgetData>): Promise<Budget> {
    const response = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
  },

  async checkExceeded(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/budgets/${id}/check`)
    return response.data.data
  },

  // Budget Limits
  async createLimit(data: CreateBudgetLimitData): Promise<BudgetLimit> {
    const response = await api.post<ApiResponse<BudgetLimit>>('/budgets/limits', data)
    return response.data.data
  },

  async updateLimit(id: string, data: Partial<CreateBudgetLimitData>): Promise<BudgetLimit> {
    const response = await api.put<ApiResponse<BudgetLimit>>(`/budgets/limits/${id}`, data)
    return response.data.data
  },

  async deleteLimit(id: string): Promise<void> {
    await api.delete(`/budgets/limits/${id}`)
  },

  // Auto-Budget
  async setAutoBudget(budgetId: string, data: CreateAutoBudgetData): Promise<AutoBudget> {
    const response = await api.post<ApiResponse<AutoBudget>>(`/budgets/${budgetId}/auto-budget`, data)
    return response.data.data
  },

  async removeAutoBudget(budgetId: string): Promise<void> {
    await api.delete(`/budgets/${budgetId}/auto-budget`)
  },
}
