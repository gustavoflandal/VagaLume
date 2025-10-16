<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { accountService } from '@/services/account.service'
import { transactionService } from '@/services/transaction.service'
import type { Account, Transaction } from '@/types'

const accounts = ref<Account[]>([])
const recentTransactions = ref<Transaction[]>([])
const isLoading = ref(true)

const totalBalance = ref(0)
const totalIncome = ref(0)
const totalExpense = ref(0)

onMounted(async () => {
  try {
    isLoading.value = true
    
    // Carregar contas
    const accountsData = await accountService.getAll()
    accounts.value = Array.isArray(accountsData) ? accountsData : []
    
    // Calcular saldo total
    totalBalance.value = accounts.value.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    
    // Carregar transações recentes
    const transactionsData = await transactionService.getAll({ limit: 5 })
    recentTransactions.value = Array.isArray(transactionsData?.data) 
      ? transactionsData.data 
      : Array.isArray(transactionsData) 
        ? transactionsData 
        : []
    
    // Carregar resumo do mês
    const summary = await transactionService.getSummary()
    totalIncome.value = summary?.totalIncome || 0
    totalExpense.value = summary?.totalExpense || 0
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    accounts.value = []
    recentTransactions.value = []
  } finally {
    isLoading.value = false
  }
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <div v-else>
      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Saldo Total -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Saldo Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalBalance) }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <!-- Receitas do Mês -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Receitas do Mês</p>
              <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalIncome) }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <!-- Despesas do Mês -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Despesas do Mês</p>
              <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalExpense) }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">📉</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contas e Transações Recentes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Minhas Contas -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Minhas Contas</h2>
            <router-link to="/accounts" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Ver todas →
            </router-link>
          </div>

          <div v-if="!accounts || accounts.length === 0" class="text-center py-8 text-gray-500">
            Nenhuma conta cadastrada
          </div>

          <div v-else-if="accounts && accounts.length > 0" class="space-y-3">
            <div
              v-for="account in accounts"
              :key="account.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-lg">🏦</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ account.name }}</p>
                  <p class="text-xs text-gray-500">{{ account.type }}</p>
                </div>
              </div>
              <p class="font-bold text-gray-900">{{ formatCurrency(account.balance) }}</p>
            </div>
          </div>
        </div>

        <!-- Transações Recentes -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Transações Recentes</h2>
            <router-link to="/transactions" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Ver todas →
            </router-link>
          </div>

          <div v-if="!recentTransactions || recentTransactions.length === 0" class="text-center py-8 text-gray-500">
            Nenhuma transação registrada
          </div>

          <div v-else-if="recentTransactions && recentTransactions.length > 0" class="space-y-3">
            <div
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  ]"
                >
                  <span class="text-lg">{{ transaction.type === 'INCOME' ? '💵' : '💸' }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(transaction.date) }}</p>
                </div>
              </div>
              <p
                :class="[
                  'font-bold',
                  transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ transaction.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
