import api from './api'
import type { ApiResponse } from '@/types'

export interface Tag {
  id: string
  tag: string
  description?: string
  date?: string
  latitude?: number
  longitude?: number
  zoomLevel?: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTagData {
  tag: string
  description?: string
  date?: string
  latitude?: number
  longitude?: number
  zoomLevel?: number
}

export interface TagStatistics {
  total: number
  mostUsed: Array<{ tag: string; count: number }>
  recentlyUsed: Tag[]
}

export const tagService = {
  async getAll(): Promise<Tag[]> {
    try {
      const response = await api.get<ApiResponse<Tag[]>>('/tags')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
      return []
    }
  },

  async getById(id: string): Promise<Tag> {
    const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`)
    return response.data.data
  },

  async create(data: CreateTagData): Promise<Tag> {
    const response = await api.post<ApiResponse<Tag>>('/tags', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateTagData>): Promise<Tag> {
    const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tags/${id}`)
  },

  async getCloud(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/tags/cloud')
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async search(query: string): Promise<Tag[]> {
    const response = await api.get<ApiResponse<Tag[]>>('/tags/search', {
      params: { q: query },
    })
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async linkToTransaction(tagId: string, transactionId: string): Promise<void> {
    await api.post(`/tags/${tagId}/link`, { transactionId })
  },

  async unlinkFromTransaction(tagId: string, transactionId: string): Promise<void> {
    await api.delete(`/tags/${tagId}/unlink/${transactionId}`)
  },

  async getStatistics(): Promise<TagStatistics> {
    const response = await api.get<ApiResponse<TagStatistics>>('/tags/statistics')
    return response.data.data
  },
}
