<template>
  <div class="relative overflow-hidden rounded-3xl shadow-sm bg-white dark:bg-[#1a1c23] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 group transition-all duration-500 hover:shadow-lg">
    <!-- Efeitos de glassmorphism de fundo -->
    <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full border-[30px] border-emerald-500/5 dark:border-emerald-500/5 blur-sm pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
    <div class="absolute -right-10 top-20 w-32 h-32 rounded-full border-[15px] border-emerald-500/10 dark:border-emerald-500/10 blur-sm pointer-events-none group-hover:-translate-y-4 transition-all duration-700"></div>

    <div class="relative z-10 flex flex-col gap-1">
      <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 shadow-inner shrink-0 transform group-hover:rotate-6 transition-transform">
          <Icon :name="icone" class="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
        </div>
        <span class="opacity-80">{{ tituloFino }}</span>
        <span class="text-emerald-500 dark:text-emerald-400 drop-shadow-sm">{{ tituloGrosso }}</span>
      </h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium flex items-center gap-2 mt-1 sm:ml-16 opacity-90">
        {{ descricao }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  tituloFino: { type: String, required: true },  
  tituloGrosso: { type: String, required: true }, 
  descricao: { type: String, required: true },
  icone: { type: String, required: true }
})
</script>