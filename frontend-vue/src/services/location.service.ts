import api from './api'
import type { ApiResponse } from '@/types'

export interface Location {
  id: string
  latitude: number
  longitude: number
  zoomLevel?: number
  locatableType: string
  locatableId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateLocationData {
  latitude: number
  longitude: number
  zoomLevel?: number
  locatableType: string
  locatableId: string
}

export interface NearbyLocation extends Location {
  distance: number
}

export const locationService = {
  async getAll(): Promise<Location[]> {
    try {
      const response = await api.get<ApiResponse<Location[]>>('/locations')
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar localizações:', error)
      return []
    }
  },

  async getById(id: string): Promise<Location> {
    const response = await api.get<ApiResponse<Location>>(`/locations/${id}`)
    return response.data.data
  },

  async getByEntity(type: string, id: string): Promise<Location | null> {
    const response = await api.get<ApiResponse<Location>>(`/locations/entity/${type}/${id}`)
    return response.data.data
  },

  async create(data: CreateLocationData): Promise<Location> {
    const response = await api.post<ApiResponse<Location>>('/locations', data)
    return response.data.data
  },

  async update(id: string, data: Partial<CreateLocationData>): Promise<Location> {
    const response = await api.put<ApiResponse<Location>>(`/locations/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/locations/${id}`)
  },

  async upsert(data: CreateLocationData): Promise<Location> {
    const response = await api.post<ApiResponse<Location>>('/locations/upsert', data)
    return response.data.data
  },

  async findNearby(latitude: number, longitude: number, radiusKm = 5): Promise<NearbyLocation[]> {
    const response = await api.get<ApiResponse<NearbyLocation[]>>('/locations/nearby', {
      params: { latitude, longitude, radiusKm },
    })
    return Array.isArray(response.data.data) ? response.data.data : []
  },
}
