<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import ToastContainer from '@/components/ToastContainer.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Restaura a sessão se houver token
  authStore.checkAuth()
})
</script>

<template>
  <div id="app" class="min-h-screen">
    <RouterView />
    <ToastContainer />
  </div>
</template>

<style scoped>
</style>
