import api from './api'
import type { ApiResponse } from '@/types'

export interface TransactionLinkType {
  id: string
  name: string
  inward: string
  outward: string
  editable: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionLink {
  id: string
  linkTypeId: string
  sourceTransactionId: string
  targetTransactionId: string
  comment?: string
  userId: string
  createdAt: string
  updatedAt: string
  linkType?: TransactionLinkType
}

export interface CreateTransactionLinkData {
  linkTypeId: string
  sourceTransactionId: string
  targetTransactionId: string
  comment?: string
}

export interface CreateLinkTypeData {
  name: string
  inward: string
  outward: string
  editable?: boolean
}

export const transactionLinkService = {
  async getAll(): Promise<TransactionLink[]> {
    try {
      const response = await api.get<ApiResponse<TransactionLink[]>>('/transaction-links')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar vínculos:', error)
      return []
    }
  },

  async getById(id: string): Promise<TransactionLink> {
    const response = await api.get<ApiResponse<TransactionLink>>(`/transaction-links/${id}`)
    return response.data.data
  },

  async getByTransaction(transactionId: string): Promise<TransactionLink[]> {
    const response = await api.get<ApiResponse<TransactionLink[]>>(`/transaction-links/transaction/${transactionId}`)
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async create(data: CreateTransactionLinkData): Promise<TransactionLink> {
    const response = await api.post<ApiResponse<TransactionLink>>('/transaction-links', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateTransactionLinkData>): Promise<TransactionLink> {
    const response = await api.put<ApiResponse<TransactionLink>>(`/transaction-links/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transaction-links/${id}`)
  },

  async getAllTypes(): Promise<TransactionLinkType[]> {
    try {
      const response = await api.get<ApiResponse<TransactionLinkType[]>>('/transaction-links/types')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar tipos de vínculo:', error)
      return []
    }
  },

  async createType(data: CreateLinkTypeData): Promise<TransactionLinkType> {
    const response = await api.post<ApiResponse<TransactionLinkType>>('/transaction-links/types', data)
    return response.data.data
  },

  async updateType(id: string, data: Partial<CreateLinkTypeData>): Promise<TransactionLinkType> {
    const response = await api.put<ApiResponse<TransactionLinkType>>(`/transaction-links/types/${id}`, data)
    return response.data.data
  },

  async deleteType(id: string): Promise<void> {
    await api.delete(`/transaction-links/types/${id}`)
  },

  async seedDefaultTypes(): Promise<TransactionLinkType[]> {
    const response = await api.post<ApiResponse<TransactionLinkType[]>>('/transaction-links/types/seed-defaults')
    return Array.isArray(response.data.data) ? response.data.data : []
  },
}
