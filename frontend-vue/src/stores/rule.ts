import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ruleService } from '@/services/rule.service'
import type { RuleGroup, Rule, CreateRuleGroupData, CreateRuleData, CreateTriggerData, CreateActionData } from '@/services/rule.service'

export const useRuleStore = defineStore('rule', () => {
  // State
  const ruleGroups = ref<RuleGroup[]>([])
  const currentRuleGroup = ref<RuleGroup | null>(null)
  const rules = ref<Rule[]>([])
  const currentRule = ref<Rule | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeRuleGroups = computed(() => 
    ruleGroups.value.filter(group => group.active)
  )

  const activeRules = computed(() => 
    rules.value.filter(rule => rule.active)
  )

  const totalRules = computed(() => rules.value.length)

  // Actions
  async function fetchAllGroups() {
    try {
      isLoading.value = true
      error.value = null
      ruleGroups.value = await ruleService.getAllGroups()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar grupos de regras'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGroupById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentRuleGroup.value = await ruleService.getGroupById(id)
      return currentRuleGroup.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createGroup(data: CreateRuleGroupData) {
    try {
      isLoading.value = true
      error.value = null
      const newGroup = await ruleService.createGroup(data)
      ruleGroups.value.push(newGroup)
      return newGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateGroup(id: string, data: Partial<CreateRuleGroupData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedGroup = await ruleService.updateGroup(id, data)
      const index = ruleGroups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        ruleGroups.value[index] = updatedGroup
      }
      if (currentRuleGroup.value?.id === id) {
        currentRuleGroup.value = updatedGroup
      }
      return updatedGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteGroup(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await ruleService.deleteGroup(id)
      ruleGroups.value = ruleGroups.value.filter(g => g.id !== id)
      if (currentRuleGroup.value?.id === id) {
        currentRuleGroup.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir grupo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllRules() {
    try {
      isLoading.value = true
      error.value = null
      // Busca todas as regras através dos grupos
      await ruleService.getAllGroups(true)
      rules.value = []
      // Poderia fazer fetch individual das rules de cada grupo se necessário
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar regras'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRuleById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      currentRule.value = await ruleService.getRuleById(id)
      return currentRule.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar regra'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createRule(data: CreateRuleData) {
    try {
      isLoading.value = true
      error.value = null
      const newRule = await ruleService.createRule(data)
      rules.value.push(newRule)
      return newRule
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar regra'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateRule(id: string, data: Partial<CreateRuleData>) {
    try {
      isLoading.value = true
      error.value = null
      const updatedRule = await ruleService.updateRule(id, data)
      const index = rules.value.findIndex(r => r.id === id)
      if (index !== -1) {
        rules.value[index] = updatedRule
      }
      if (currentRule.value?.id === id) {
        currentRule.value = updatedRule
      }
      return updatedRule
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar regra'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRule(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await ruleService.deleteRule(id)
      rules.value = rules.value.filter(r => r.id !== id)
      if (currentRule.value?.id === id) {
        currentRule.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir regra'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function testRule(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await ruleService.testRule(id)
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao testar regra'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function applyRule(id: string, transactionId: string) {
    try {
      isLoading.value = true
      error.value = null
      const result = await ruleService.applyRule(id, transactionId)
      return result
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao aplicar regra'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addTrigger(data: CreateTriggerData) {
    try {
      isLoading.value = true
      error.value = null
      const trigger = await ruleService.addTrigger(data)
      // Atualiza a regra atual se necessário
      if (currentRule.value?.id === data.ruleId) {
        await fetchRuleById(data.ruleId)
      }
      return trigger
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao adicionar gatilho'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeTrigger(triggerId: string) {
    try {
      isLoading.value = true
      error.value = null
      await ruleService.removeTrigger(triggerId)
      // Recarrega a regra atual se houver
      if (currentRule.value?.id) {
        await fetchRuleById(currentRule.value.id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover gatilho'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addAction(data: CreateActionData) {
    try {
      isLoading.value = true
      error.value = null
      const action = await ruleService.addAction(data)
      // Atualiza a regra atual se necessário
      if (currentRule.value?.id === data.ruleId) {
        await fetchRuleById(data.ruleId)
      }
      return action
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao adicionar ação'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeAction(actionId: string) {
    try {
      isLoading.value = true
      error.value = null
      await ruleService.removeAction(actionId)
      // Recarrega a regra atual se houver
      if (currentRule.value?.id) {
        await fetchRuleById(currentRule.value.id)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover ação'
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
    ruleGroups,
    currentRuleGroup,
    rules,
    currentRule,
    isLoading,
    error,
    // Getters
    activeRuleGroups,
    activeRules,
    totalRules,
    // Actions
    fetchAllGroups,
    fetchGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchAllRules,
    fetchRuleById,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    applyRule,
    addTrigger,
    removeTrigger,
    addAction,
    removeAction,
    clearError,
  }
})
