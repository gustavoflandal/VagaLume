import api from './api'
import type { ApiResponse } from '@/types'

export interface ObjectGroup {
  id: string
  title: string
  order: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateObjectGroupData {
  title: string
  order?: number
}

export const objectGroupService = {
  async getAll(): Promise<ObjectGroup[]> {
    try {
      const response = await api.get<ApiResponse<ObjectGroup[]>>('/object-groups')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar grupos:', error)
      return []
    }
  },

  async getById(id: string): Promise<ObjectGroup> {
    const response = await api.get<ApiResponse<ObjectGroup>>(`/object-groups/${id}`)
    return response.data.data
  },

  async create(data: CreateObjectGroupData): Promise<ObjectGroup> {
    const response = await api.post<ApiResponse<ObjectGroup>>('/object-groups', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateObjectGroupData>): Promise<ObjectGroup> {
    const response = await api.put<ApiResponse<ObjectGroup>>(`/object-groups/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/object-groups/${id}`)
  },

  async reorder(groupIds: string[]): Promise<void> {
    await api.post('/object-groups/reorder', { groupIds })
  },

  async linkPiggyBank(groupId: string, piggyBankId: string): Promise<void> {
    await api.post(`/object-groups/${groupId}/piggy-banks`, { piggyBankId })
  },

  async unlinkPiggyBank(groupId: string, piggyBankId: string): Promise<void> {
    await api.delete(`/object-groups/${groupId}/piggy-banks/${piggyBankId}`)
  },

  async linkBill(groupId: string, billId: string): Promise<void> {
    await api.post(`/object-groups/${groupId}/bills`, { billId })
  },

  async unlinkBill(groupId: string, billId: string): Promise<void> {
    await api.delete(`/object-groups/${groupId}/bills/${billId}`)
  },
}
