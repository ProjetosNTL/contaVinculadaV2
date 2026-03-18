<template>
  <aside 
    :class="[
      'bg-white dark:bg-[#1a1c23] border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 h-full overflow-hidden absolute lg:relative z-50', 
      collapsed ? 'w-0 lg:w-20 border-0 lg:border-r' : 'w-64 border-r shadow-2xl lg:shadow-sm'
    ]"
  >
    <nav class="flex-1 overflow-y-auto py-6 space-y-1 overflow-x-hidden scrollbar-hide w-64">
      <NuxtLink to="/" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Home' : ''">
        <Icon name="fa7-solid:house" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Início</span>
      </NuxtLink>

      <div v-if="!collapsed" class="menu-header">Cadastros</div>
      <div v-else class="menu-divider"></div>
      
      <NuxtLink to="/cadastro/funcionario" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Funcionários' : ''">
        <Icon name="fa7-solid:users" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Funcionários</span>
      </NuxtLink>

      <NuxtLink to="/cadastro/projeto" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Projetos' : ''">
        <Icon name="fa7-solid:briefcase" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Projetos</span>
      </NuxtLink>

      <div v-if="!collapsed" class="menu-header">Operações</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/contracheque/processamento" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Contracheques' : ''">
        <Icon name="fa7-solid:file-invoice-dollar" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Contracheques</span>
      </NuxtLink>

      <NuxtLink to="/operacao/oficio/lancamentoReembolso" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Lançamento Reembolso' : ''">
        <Icon name="fa7-solid:hand-holding-dollar" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lanc. Reembolso</span>
      </NuxtLink>

      <div v-if="!collapsed" class="menu-header mt-2">Movimentação Bancária</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoManual" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Lançamento Manual' : ''">
        <Icon name="fa7-solid:cash-register" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lançamento Manual</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/lancamentoEstorno" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Lançamento Estorno' : ''">
        <Icon name="fa7-solid:rotate-left" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Lançamento Estorno</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/extratoProjeto" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Extrato por Projeto' : ''">
        <Icon name="fa7-solid:list-check" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Extrato por Projeto</span>
      </NuxtLink>

      <NuxtLink to="/operacao/movimentacaoBancaria/extratoFuncionario" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Extrato por Funcionário' : ''">
        <Icon name="fa7-solid:list" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Extrato por Funcionário</span>
      </NuxtLink>

      <div v-if="!collapsed" class="menu-header mt-2">Ajustes & Configurações</div>
      <div v-else class="menu-divider"></div>

      <NuxtLink to="/configuracao" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Configurações' : ''">
        <Icon name="fa7-solid:gears" class="menu-icon text-emerald-500" />
        <span v-if="!collapsed" class="menu-text font-bold">Configurações</span>
      </NuxtLink>

      <NuxtLink to="/tabelaBasica" class="menu-link group" active-class="menu-active" :title="collapsed ? 'Tabelas Básicas' : ''">
        <Icon name="fa7-solid:database" class="menu-icon" />
        <span v-if="!collapsed" class="menu-text">Tabelas Básicas</span>
      </NuxtLink>

      <span class="block px-7 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500" v-if="!collapsed">Atalhos Rápidos</span>

      <NuxtLink to="/configuracao/usuario" class="menu-link group !py-2 opacity-80" active-class="menu-active" :title="collapsed ? 'Usuários' : ''">
        <Icon name="fa7-solid:user-gear" class="menu-icon !w-4 !h-4" />
        <span v-if="!collapsed" class="menu-text !text-xs">Usuários</span>
      </NuxtLink>

      <NuxtLink to="/configuracao/permissaoUsuario" class="menu-link group !py-2 opacity-80" active-class="menu-active" :title="collapsed ? 'Permissões' : ''">
        <Icon name="fa7-solid:shield-halved" class="menu-icon !w-4 !h-4" />
        <span v-if="!collapsed" class="menu-text !text-xs">Permissões</span>
      </NuxtLink>
    </nav>

    <div class="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-[#1a1c23]/50 backdrop-blur-md">
      <button @click="toggleTheme()" class="flex items-center justify-center gap-3 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group" :title="theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'">
        <Icon :name="theme === 'dark' ? 'fa7-solid:sun' : 'fa7-solid:moon'" class="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" :class="theme === 'dark' ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-emerald-500 group-hover:text-emerald-600'" />
        <span v-if="!collapsed" class="font-semibold text-sm whitespace-nowrap">Tema {{ theme === 'dark' ? 'Claro' : 'Escuro' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { toggleTheme, theme } = useTheme()

defineProps<{ collapsed: boolean }>()
</script>

<style scoped src="./style.css"></style>