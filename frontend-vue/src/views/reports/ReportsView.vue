<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // Carregar dados dos relatórios
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Relatórios</h1>
    </div>

    <!-- Cards de Tipos de Relatórios -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Relatório de Gastos por Categoria -->
      <router-link
        to="/reports/expenses-by-category"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Gastos por Categoria</h3>
            <p class="text-sm text-gray-600">Análise detalhada dos gastos</p>
          </div>
        </div>
      </router-link>

      <!-- Relatório de Receitas vs Despesas -->
      <router-link
        to="/reports/income-vs-expenses"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">📈</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Receitas vs Despesas</h3>
            <p class="text-sm text-gray-600">Comparativo mensal</p>
          </div>
        </div>
      </router-link>

      <!-- Relatório de Orçamentos -->
      <router-link
        to="/reports/budget-analysis"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Análise de Orçamentos</h3>
            <p class="text-sm text-gray-600">Performance dos orçamentos</p>
          </div>
        </div>
      </router-link>

      <!-- Relatório de Cofrinhos -->
      <router-link
        to="/reports/piggy-banks"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">🐷</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Evolução dos Cofrinhos</h3>
            <p class="text-sm text-gray-600">Progresso das metas</p>
          </div>
        </div>
      </router-link>

      <!-- Relatório de Contas Recorrentes -->
      <router-link
        to="/reports/recurring-bills"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">📄</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Contas Recorrentes</h3>
            <p class="text-sm text-gray-600">Análise de gastos fixos</p>
          </div>
        </div>
      </router-link>

      <!-- Relatório de Tags -->
      <router-link
        to="/reports/tags"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">🏷️</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Análise por Tags</h3>
            <p class="text-sm text-gray-600">Gastos por tags</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Seção de Exportação -->
    <div class="card mt-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Exportar Dados</h2>
      <div class="flex items-center space-x-4">
        <button class="btn btn-secondary">
          📥 Exportar CSV
        </button>
        <button class="btn btn-secondary">
          📑 Exportar PDF
        </button>
        <button class="btn btn-secondary">
          📊 Exportar Excel
        </button>
      </div>
    </div>
  </div>
</template>
