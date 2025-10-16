import api from './api'
import type { Category, CreateCategoryData, ApiResponse } from '@/types'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`)
    return response.data.data
  },

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>('/categories', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
