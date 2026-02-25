<template>
  <aside :class="['bg-white dark:bg-[#1a1c23] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 shadow-sm z-40', collapsed ? 'w-16' : 'w-64']">
    <nav class="flex-1 overflow-y-auto py-4 space-y-1">
      <NuxtLink to="/" class="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:house" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Home</span>
      </NuxtLink>

      <NuxtLink to="/cadastro/funcionario" class="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:users" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Funcionários</span>
      </NuxtLink>

      <div class="px-4 pt-4 pb-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        <span v-if="!collapsed">Operações</span>
      </div>
      
      <NuxtLink to="/operacao/contracheque/processamento" class="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:money-check-dollar" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Contracheques</span>
      </NuxtLink>

      <div class="px-4 py-2 mt-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
         <span v-if="!collapsed">Lançamentos</span>
      </div>
      <NuxtLink to="/operacao/lancamento/manual" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:cash-register" class="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors ml-1" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Lançamento Lote</span>
      </NuxtLink>
      <NuxtLink to="/operacao/lancamento/reembolso" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:hand-holding-dollar" class="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors ml-1" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Lanc. Reembolso</span>
      </NuxtLink>

      <div class="px-4 py-2 mt-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
         <span v-if="!collapsed">Extratos</span>
      </div>
      <NuxtLink to="/operacao/extrato/funcionario" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:list" class="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors ml-1" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Por Funcionário</span>
      </NuxtLink>
      <NuxtLink to="/operacao/extrato/projeto" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:list-check" class="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors ml-1" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Por Projeto</span>
      </NuxtLink>

      <div class="px-4 pt-4 pb-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        <span v-if="!collapsed">Ajustes</span>
      </div>
      
      <NuxtLink to="/configuracao/usuario" class="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#3276b1] dark:hover:text-white transition group border-l-4 border-transparent hover:border-[#3276b1]" active-class="bg-blue-50 dark:bg-gray-800/80 text-[#3276b1] dark:text-white border-[#3276b1]">
        <Icon name="fa7-solid:gear" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap">Config. de Usuário</span>
      </NuxtLink>
    </nav>

    <!-- Rodapé: Toggle Theme -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1c23]">
      <button @click="toggleTheme()" class="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#3276b1] dark:hover:text-white transition group w-full text-left" :title="theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'">
        <Icon :name="theme === 'dark' ? 'fa7-solid:sun' : 'fa7-solid:moon'" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:text-[#3276b1] transition-colors" />
        <span v-if="!collapsed" class="font-medium whitespace-nowrap text-sm">Tema {{ theme === 'dark' ? 'Claro' : 'Escuro' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { toggleTheme, theme } = useTheme()

defineProps<{
  collapsed: boolean
}>()
</script>
