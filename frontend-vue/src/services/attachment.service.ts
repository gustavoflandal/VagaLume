import api from './api'
import type { ApiResponse } from '@/types'

export interface Attachment {
  id: string
  filename: string
  title?: string
  description?: string
  md5: string
  size: number
  mimeType: string
  uploaded: boolean
  attachableType: string
  attachableId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateAttachmentData {
  filename: string
  title?: string
  description?: string
  md5: string
  size: number
  mimeType: string
  attachableType: string
  attachableId: string
}

export interface AttachmentStatistics {
  total: number
  totalSize: number
  byType: Record<string, number>
}

export const attachmentService = {
  async getAll(): Promise<Attachment[]> {
    try {
      const response = await api.get<ApiResponse<Attachment[]>>('/attachments')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar anexos:', error)
      return []
    }
  },

  async getById(id: string): Promise<Attachment> {
    const response = await api.get<ApiResponse<Attachment>>(`/attachments/${id}`)
    return response.data.data
  },

  async getByEntity(type: string, id: string): Promise<Attachment[]> {
    const response = await api.get<ApiResponse<Attachment[]>>(`/attachments/entity/${type}/${id}`)
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async create(data: CreateAttachmentData): Promise<Attachment> {
    const response = await api.post<ApiResponse<Attachment>>('/attachments', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateAttachmentData>): Promise<Attachment> {
    const response = await api.put<ApiResponse<Attachment>>(`/attachments/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/attachments/${id}`)
  },

  async markAsUploaded(id: string): Promise<Attachment> {
    const response = await api.post<ApiResponse<Attachment>>(`/attachments/${id}/uploaded`)
    return response.data.data
  },

  async getStatistics(): Promise<AttachmentStatistics> {
    const response = await api.get<ApiResponse<AttachmentStatistics>>('/attachments/statistics')
    return response.data.data
  },
}
