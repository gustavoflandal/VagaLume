import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { attachmentService } from '@/services/attachment.service'
import type { Attachment, CreateAttachmentData, AttachmentStatistics } from '@/services/attachment.service'

export const useAttachmentStore = defineStore('attachment', () => {
  // State
  const attachments = ref<Attachment[]>([])
  const currentAttachment = ref<Attachment | null>(null)
  const statistics = ref<AttachmentStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const uploadedAttachments = computed(() => 
    attachments.value.filter(a => a.uploaded)
  )

  const totalSize = computed(() => 
    attachments.value.reduce((sum, a) => sum + a.size, 0)
  )

  const attachmentsByType = computed(() => {
    const grouped: Record<string, Attachment[]> = {}
    attachments.value.forEach(attachment => {
      if (!grouped[attachment.attachableType]) {
        grouped[attachment.attachableType] = []
      }
      grouped[attachment.attachableType].push(attachment)
    })
    return grouped
  })

  // Actions
  async function fetchAll() {
    try {
      isLoading.value = true
      error.value = null
      attachments.value = await attachmentService.getAll()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar anexos'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentAttachment.value = await attachmentService.getById(id)
      return currentAttachment.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar anexo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchByEntity(type: string, id: string) {
    try {
      isLoading.value = true
      error.value = null
      const entityAttachments = await attachmentService.getByEntity(type, id)
      return entityAttachments
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar anexos da entidade'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data: CreateAttachmentData) {
    try {
      isLoading.value = true
      error.value = null
      const newAttachment = await attachmentService.create(data)
      attachments.value.push(newAttachment)
      return newAttachment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar anexo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: string, data: Partial<CreateAttachmentData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedAttachment = await attachmentService.update(id, data)
      const index = attachments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        attachments.value[index] = updatedAttachment
      }
      if (currentAttachment.value?.id === id) {
        currentAttachment.value = updatedAttachment
      }
      return updatedAttachment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar anexo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await attachmentService.delete(id)
      attachments.value = attachments.value.filter(a => a.id !== id)
      if (currentAttachment.value?.id === id) {
        currentAttachment.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir anexo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function markAsUploaded(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const updatedAttachment = await attachmentService.markAsUploaded(id)
      const index = attachments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        attachments.value[index] = updatedAttachment
      }
      if (currentAttachment.value?.id === id) {
        currentAttachment.value = updatedAttachment
      }
      return updatedAttachment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao marcar como enviado'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStatistics() {
    try {
      isLoading.value = true
      error.value = null
      statistics.value = await attachmentService.getStatistics()
      return statistics.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar estatísticas'
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
    attachments,
    currentAttachment,
    statistics,
    isLoading,
    error,
    // Getters
    uploadedAttachments,
    totalSize,
    attachmentsByType,
    // Actions
    fetchAll,
    fetchById,
    fetchByEntity,
    create,
    update,
    remove,
    markAsUploaded,
    fetchStatistics,
    clearError,
  }
})
