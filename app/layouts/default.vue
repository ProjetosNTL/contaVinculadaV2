<template>
  <div class="min-h-screen bg-[#f3f3f4] dark:bg-[#121212] flex flex-col font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
    <!-- Navbar Topo -->
    <AppNavbar @toggle-sidebar="collapsed = !collapsed" />

    <div class="flex flex-1 overflow-hidden">
      <!-- Menu Lateral -->
      <AppSidebar :collapsed="collapsed" />

      <!-- Conteúdo da Página -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f3f3f4] dark:bg-[#121212] transition-colors duration-300">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const collapsed = ref(false)
</script>
