import api from './api'
import type { ApiResponse } from '@/types'

export interface RuleGroup {
  id: string
  title: string
  description?: string
  order: number
  active: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Rule {
  id: string
  ruleGroupId: string
  title: string
  description?: string
  order: number
  active: boolean
  strict: boolean
  stopProcessing: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateRuleGroupData {
  title: string
  description?: string
  order?: number
}

export interface CreateRuleData {
  ruleGroupId: string
  title: string
  description?: string
  order?: number
  strict?: boolean
  stopProcessing?: boolean
}

export interface CreateTriggerData {
  ruleId: string
  type: string
  value: string
  stopProcessing?: boolean
  order?: number
}

export interface CreateActionData {
  ruleId: string
  type: string
  value: string
  stopProcessing?: boolean
  order?: number
}

export const ruleService = {
  // Rule Groups
  async getAllGroups(includeInactive = false): Promise<RuleGroup[]> {
    try {
      const response = await api.get<ApiResponse<RuleGroup[]>>('/rules/groups', {
        params: { includeInactive },
      })
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Erro ao buscar grupos de regras:', error)
      return []
    }
  },

  async getGroupById(id: string): Promise<RuleGroup> {
    const response = await api.get<ApiResponse<RuleGroup>>(`/rules/groups/${id}`)
    return response.data.data
  },

  async createGroup(data: CreateRuleGroupData): Promise<RuleGroup> {
    const response = await api.post<ApiResponse<RuleGroup>>('/rules/groups', data)
    return response.data.data
  },

  async updateGroup(id: string, data: Partial<CreateRuleGroupData>): Promise<RuleGroup> {
    const response = await api.put<ApiResponse<RuleGroup>>(`/rules/groups/${id}`, data)
    return response.data.data
  },

  async deleteGroup(id: string): Promise<void> {
    await api.delete(`/rules/groups/${id}`)
  },

  // Rules
  async getRuleById(id: string): Promise<Rule> {
    const response = await api.get<ApiResponse<Rule>>(`/rules/${id}`)
    return response.data.data
  },

  async createRule(data: CreateRuleData): Promise<Rule> {
    const response = await api.post<ApiResponse<Rule>>('/rules', data)
    return response.data.data
  },

  async updateRule(id: string, data: Partial<CreateRuleData>): Promise<Rule> {
    const response = await api.put<ApiResponse<Rule>>(`/rules/${id}`, data)
    return response.data.data
  },

  async deleteRule(id: string): Promise<void> {
    await api.delete(`/rules/${id}`)
  },

  async testRule(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/rules/${id}/test`)
    return response.data.data
  },

  async applyRule(id: string, transactionId: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/rules/${id}/apply`, { transactionId })
    return response.data.data
  },

  // Triggers
  async addTrigger(data: CreateTriggerData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/rules/triggers', data)
    return response.data.data
  },

  async removeTrigger(id: string): Promise<void> {
    await api.delete(`/rules/triggers/${id}`)
  },

  // Actions
  async addAction(data: CreateActionData): Promise<any> {
    const response = await api.post<ApiResponse<any>>('/rules/actions', data)
    return response.data.data
  },

  async removeAction(id: string): Promise<void> {
    await api.delete(`/rules/actions/${id}`)
  },
}
