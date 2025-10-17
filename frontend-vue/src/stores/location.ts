import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { locationService } from '@/services/location.service'
import type { Location, CreateLocationData, NearbyLocation } from '@/services/location.service'

export const useLocationStore = defineStore('location', () => {
  // State
  const locations = ref<Location[]>([])
  const currentLocation = ref<Location | null>(null)
  const nearbyLocations = ref<NearbyLocation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalLocations = computed(() => locations.value.length)

  const locationsByType = computed(() => {
    const grouped: Record<string, Location[]> = {}
    locations.value.forEach(location => {
      if (!grouped[location.locatableType]) {
        grouped[location.locatableType] = []
      }
      grouped[location.locatableType].push(location)
    })
    return grouped
  })

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      locations.value = await locationService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar localizações'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentLocation.value = await locationService.getById(id)
      return currentLocation.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar localização'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchByEntity(type: string, id: string) {
    try {
      isLoading.value = true
      error.value = null
      const location = await locationService.getByEntity(type, id)
      return location
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar localização da entidade'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateLocationData) {
    try {
      isLoading.value = true
      error.value = null
      const newLocation = await locationService.create(data)
      locations.value.push(newLocation)
      return newLocation
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar localização'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateLocationData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedLocation = await locationService.update(id, data)
      const index = locations.value.findIndex(l => l.id === id)
      if (index !== -1) {
        locations.value[index] = updatedLocation
      }
      if (currentLocation.value?.id === id) {
        currentLocation.value = updatedLocation
      }
      return updatedLocation
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar localização'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await locationService.delete(id)
      locations.value = locations.value.filter(l => l.id !== id)
      if (currentLocation.value?.id === id) {
        currentLocation.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir localização'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function upsert(data: CreateLocationData) {
    try {
      isLoading.value = true
      error.value = null
      const location = await locationService.upsert(data)
      const existingIndex = locations.value.findIndex(
        l => l.locatableType === data.locatableType && l.locatableId === data.locatableId
      )
      if (existingIndex !== -1) {
        locations.value[existingIndex] = location
      } else {
        locations.value.push(location)
      }
      return location
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao salvar localização'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function findNearby(latitude: number, longitude: number, radiusKm = 5) {
    try {
      isLoading.value = true
      error.value = null
      nearbyLocations.value = await locationService.findNearby(latitude, longitude, radiusKm)
      return nearbyLocations.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar localizações próximas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    locations,
    currentLocation,
    nearbyLocations,
    isLoading,
    error,
    // Getters
    totalLocations,
    locationsByType,
    // Actions
    fetchAll,
    fetchById,
    fetchByEntity,
    create,
    update,
    remove,
    upsert,
    findNearby,
    clearError,
  }
})
