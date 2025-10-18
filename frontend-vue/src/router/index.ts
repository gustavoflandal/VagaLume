import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('@/views/accounts/AccountsView.vue'),
      },
      {
        path: 'accounts/:id',
        name: 'AccountDetails',
        component: () => import('@/views/accounts/AccountDetailsView.vue'),
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/transactions/TransactionsView.vue'),
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/CategoriesView.vue'),
      },
      {
        path: 'bills',
        name: 'Bills',
        component: () => import('@/views/bills/BillsView.vue'),
      },
      {
        path: 'bills/new',
        name: 'BillNew',
        component: () => import('@/views/bills/BillFormView.vue'),
      },
      {
        path: 'bills/:id',
        name: 'BillEdit',
        component: () => import('@/views/bills/BillFormView.vue'),
      },
      {
        path: 'budgets',
        name: 'Budgets',
        component: () => import('@/views/budgets/BudgetsView.vue'),
      },
      {
        path: 'budgets/new',
        name: 'BudgetNew',
        component: () => import('@/views/budgets/BudgetsView.vue'), // Temporário
      },
      {
        path: 'rules',
        name: 'Rules',
        component: () => import('@/views/rules/RulesView.vue'),
      },
      {
        path: 'rules/new',
        name: 'RuleNew',
        component: () => import('@/views/rules/RulesView.vue'), // Temporário
      },
      {
        path: 'rules/groups/new',
        name: 'RuleGroupNew',
        component: () => import('@/views/rules/RulesView.vue'), // Temporário
      },
      {
        path: 'recurrences',
        name: 'Recurrences',
        component: () => import('@/views/recurrences/RecurrencesView.vue'),
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('@/views/tags/TagsView.vue'),
      },
      {
        path: 'webhooks',
        name: 'Webhooks',
        component: () => import('@/views/webhooks/WebhooksView.vue'),
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/ReportsView.vue'),
      },
      {
        path: 'reports/expenses-by-category',
        name: 'ReportExpensesByCategory',
        component: () => import('@/views/reports/ReportsView.vue'), // Temporário
      },
      {
        path: 'reports/income-vs-expenses',
        name: 'ReportIncomeVsExpenses',
        component: () => import('@/views/reports/ReportsView.vue'), // Temporário
      },
      {
        path: 'reports/budget-analysis',
        name: 'ReportBudgetAnalysis',
        component: () => import('@/views/reports/ReportsView.vue'), // Temporário
      },
      {
        path: 'reports/recurring-bills',
        name: 'ReportRecurringBills',
        component: () => import('@/views/reports/ReportsView.vue'), // Temporário
      },
      {
        path: 'reports/tags',
        name: 'ReportTags',
        component: () => import('@/views/reports/ReportsView.vue'), // Temporário
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
