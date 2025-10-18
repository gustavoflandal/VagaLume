import api from './api'
import type { ApiResponse } from '@/types'

export interface Bill {
  id: string
  name: string
  amount: number
  date: string
  repeatFreq: string
  numberOfInstallments: number
  isFixedDay: boolean
  active: boolean
  categoryId?: string
  accountId?: string
  userId: string
  objectGroupId?: string
  createdAt: string
  updatedAt: string
  _count?: {
    installments: number
  }
}

export interface CreateBillData {
  name: string
  amount: number
  date: string
  repeatFreq: string
  numberOfInstallments: number
  isFixedDay?: boolean
  categoryId?: string
  accountId?: string
  objectGroupId?: string
}

export interface BillInstallment {
  id: string
  billId: string
  installmentSequence: number
  dueDate: string
  amount: number
  amountPaid: number
  paid: boolean
  paidAt?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
  bill?: {
    id: string
    name: string
    amount: number
    repeatFreq: string
    categoryId?: string
    accountId?: string
  }
}

export interface UpdateInstallmentData {
  dueDate?: string
  amount?: number
  amountPaid?: number
  paid?: boolean
  paidAt?: string
  transactionId?: string
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

  // Métodos de parcelas
  async getInstallments(billId: string): Promise<BillInstallment[]> {
    const response = await api.get<ApiResponse<BillInstallment[]>>(`/bills/${billId}/installments`)
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async getAllInstallments(): Promise<BillInstallment[]> {
    const response = await api.get<ApiResponse<BillInstallment[]>>('/bills/installments/all')
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async updateInstallment(installmentId: string, data: UpdateInstallmentData): Promise<BillInstallment> {
    const response = await api.put<ApiResponse<BillInstallment>>(`/bills/installments/${installmentId}`, data)
    return response.data.data
  },

  async payInstallment(installmentId: string, transactionId: string): Promise<BillInstallment> {
    const response = await api.post<ApiResponse<BillInstallment>>(`/bills/installments/${installmentId}/pay`, {
      transactionId,
    })
    return response.data.data
  },

  async deleteInstallment(installmentId: string): Promise<void> {
    await api.delete(`/bills/installments/${installmentId}`)
  },

  async regenerateInstallments(billId: string): Promise<{ count: number }> {
    const response = await api.post<ApiResponse<{ count: number }>>(`/bills/${billId}/regenerate-installments`)
    return response.data.data
  },
}
