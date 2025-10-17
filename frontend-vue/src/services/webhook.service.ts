import api from './api'
import type { ApiResponse } from '@/types'

export interface Webhook {
  id: string
  title: string
  trigger: string
  response: string
  delivery: string
  active: boolean
  url: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateWebhookData {
  title: string
  trigger: string
  response: string
  delivery: string
  url: string
}

export interface WebhookStatistics {
  total: number
  active: number
  totalMessages: number
  successRate: number
}

export const webhookService = {
  async getAll(includeInactive = false): Promise<Webhook[]> {
    try {
      const response = await api.get<ApiResponse<Webhook[]>>('/webhooks', {
        params: { includeInactive },
      })
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error)
      return []
    }
  },

  async getById(id: string): Promise<Webhook> {
    const response = await api.get<ApiResponse<Webhook>>(`/webhooks/${id}`)
    return response.data.data
  },

  async create(data: CreateWebhookData): Promise<Webhook> {
    const response = await api.post<ApiResponse<Webhook>>('/webhooks', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateWebhookData>): Promise<Webhook> {
    const response = await api.put<ApiResponse<Webhook>>(`/webhooks/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/webhooks/${id}`)
  },

  async test(id: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/webhooks/${id}/test`)
    return response.data.data
  },

  async retry(id: string, messageId: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/webhooks/${id}/retry`, { messageId })
    return response.data.data
  },

  async getHistory(id: string, limit = 50): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/webhooks/${id}/history`, {
      params: { limit },
    })
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async processPending(): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/webhooks/process-pending')
    return response.data.data
  },

  async getStatistics(): Promise<WebhookStatistics> {
    const response = await api.get<ApiResponse<WebhookStatistics>>('/webhooks/statistics')
    return response.data.data
  },
}
