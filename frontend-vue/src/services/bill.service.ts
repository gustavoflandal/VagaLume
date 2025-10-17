import api from './api'
import type { ApiResponse } from '@/types'

export interface Bill {
  id: string
  name: string
  amountMin: number
  amountMax: number
  date: string
  repeatFreq: string
  skip: number
  automatch: boolean
  active: boolean
  userId: string
  objectGroupId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBillData {
  name: string
  amountMin: number
  amountMax: number
  date: string
  repeatFreq: string
  skip?: number
  automatch?: boolean
  objectGroupId?: string
}

export interface BillStatistics {
  total: number
  active: number
  inactive: number
  upcoming: number
  totalAmount: number
}

export const billService = {
  async getAll(includeInactive = false): Promise<Bill[]> {
    try {
      const response = await api.get<ApiResponse<Bill[]>>('/bills', {
        params: { includeInactive },
      })
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar bills:', error)
      return []
    }
  },

  async getById(id: string): Promise<Bill> {
    const response = await api.get<ApiResponse<Bill>>(`/bills/${id}`)
    return response.data.data
  },

  async create(data: CreateBillData): Promise<Bill> {
    const response = await api.post<ApiResponse<Bill>>('/bills', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateBillData>): Promise<Bill> {
    const response = await api.put<ApiResponse<Bill>>(`/bills/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/bills/${id}`)
  },

  async getUpcoming(days = 7): Promise<Bill[]> {
    const response = await api.get<ApiResponse<Bill[]>>('/bills/upcoming', {
      params: { days },
    })
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async autoMatch(id: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/bills/${id}/auto-match`)
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async linkTransaction(id: string, transactionId: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/bills/${id}/link-transaction`, {
      transactionId,
    })
    return response.data.data
  },

  async getStatistics(): Promise<BillStatistics> {
    const response = await api.get<ApiResponse<BillStatistics>>('/bills/statistics')
    return response.data.data
  },
}
