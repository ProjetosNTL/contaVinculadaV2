<template>
  <div class="bg-white dark:bg-[#1e2029] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm relative">
    <!-- Camada de máscara para a linha decorativa respeitar o arredondamento do card -->
    <div class="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_1px_10px_rgba(16,185,129,0.2)]"></div>
    </div>
    
    <slot />
  </div>
</template>

<script setup lang="ts">
// Componente de container padronizado para formulários
</script>
