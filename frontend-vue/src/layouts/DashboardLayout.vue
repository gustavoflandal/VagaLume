<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  TagIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon as PiggyBankIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CogIcon,
  DocumentChartBarIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Contas', to: '/accounts', icon: BanknotesIcon },
  { name: 'Transações', to: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Categorias', to: '/categories', icon: TagIcon },
  { name: 'Contas Recorrentes', to: '/bills', icon: DocumentTextIcon },
  { name: 'Orçamentos', to: '/budgets', icon: ChartBarIcon },
  { name: 'Relatórios', to: '/reports', icon: DocumentChartBarIcon },
  { name: 'Configurações', to: '/settings', icon: CogIcon },
  { name: 'Perfil', to: '/profile', icon: UserCircleIcon },
]

const userName = computed(() => authStore.user?.name || 'Usuário')
const userEmail = computed(() => authStore.user?.email || '')

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar Desktop -->
    <aside
      :class="[
        'hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 transition-all duration-300',
        isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <img src="@/assets/logo.png" alt="VagaLume" class="h-16" />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          active-class="bg-primary-50 text-primary-700 font-medium"
        >
          <component :is="item.icon" class="w-6 h-6 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="ml-3">{{ item.name }}</span>
        </RouterLink>
      </nav>

      <!-- User Menu -->
      <div class="p-4 border-t border-gray-200">
        <div v-if="isSidebarOpen" class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
        </div>
        
        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          <span v-if="isSidebarOpen" class="ml-3">Sair</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header Mobile -->
      <header class="lg:hidden bg-white border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-600">
            <Bars3Icon v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
          <div class="flex items-center justify-center flex-1">
            <img src="@/assets/logo.png" alt="VagaLume" class="h-13" />
          </div>
          <div class="w-6"></div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="isMobileMenuOpen" class="border-t border-gray-200 p-4 space-y-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            active-class="bg-primary-50 text-primary-700 font-medium"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span class="ml-3">{{ item.name }}</span>
          </RouterLink>
          
          <button
            @click="handleLogout"
            class="flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon class="w-6 h-6" />
            <span class="ml-3">Sair</span>
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView :key="route.fullPath" />
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
