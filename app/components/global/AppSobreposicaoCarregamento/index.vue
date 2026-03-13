<template>
  <Transition name="fade">
    <div v-if="carregando" class="absolute inset-0 z-10 bg-white/80 dark:bg-[#1e2029]/90 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 rounded-3xl transition-all duration-300">
      <div class="relative">
        <Icon name="fa7-solid:spinner" class="animate-spin w-12 h-12 mb-4" />
        <div class="absolute inset-0 w-12 h-12 border-4 border-emerald-500/20 rounded-full"></div>
      </div>
      <span class="font-bold tracking-wide animate-pulse">{{ mensagem }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  carregando: { type: Boolean, default: false },
  mensagem: { type: String, default: 'Carregando dados...' }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
