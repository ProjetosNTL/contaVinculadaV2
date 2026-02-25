<template>
  <div class="h-full flex flex-col gap-6">

    <!-- Faixa de boas-vindas -->
    <div class="w-full text-center py-6 px-6 bg-[#22262e] dark:bg-[#1a1c23] rounded-sm shadow-sm">
      <h2 class="text-3xl font-bold text-white mb-1">{{ userName }}</h2>
      <div class="text-[#a8cf45] font-semibold text-lg">━━━ Bem-vindo ao ContaVinculada ━━━</div>
    </div>

    <!-- Cards de métricas com dados reais -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      <!-- Funcionários Ativos -->
      <NuxtLink to="/cadastro/funcionario" class="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 border-t-4 border-t-blue-500 dark:border-t-blue-400 p-5 shadow-sm hover:shadow-md transition group">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Funcionários Ativos</p>
            <div v-if="loading" class="mt-2 h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.funcionariosAtivos }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Icon name="fa7-solid:users" class="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition">
          Total: {{ stats.funcionariosTotal }} funcionários cadastrados →
        </p>
      </NuxtLink>

      <!-- Contracheques -->
      <NuxtLink to="/operacao/contracheque/processamento" class="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 border-t-4 border-t-indigo-500 dark:border-t-indigo-400 p-5 shadow-sm hover:shadow-md transition group">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Contracheques</p>
            <div v-if="loading" class="mt-2 h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.totalContracheques }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Icon name="fa7-solid:file-invoice-dollar" class="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">
          Acessar processamento →
        </p>
      </NuxtLink>

      <!-- Lançamentos Manuais -->
      <NuxtLink to="/operacao/lancamento/manual" class="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 border-t-4 border-t-amber-500 dark:border-t-amber-400 p-5 shadow-sm hover:shadow-md transition group">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lançamentos em Lote</p>
            <div v-if="loading" class="mt-2 h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.totalLancamentosManuais }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Icon name="fa7-solid:cash-register" class="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-400 dark:text-gray-500 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition">
          Acessar lançamentos manuais →
        </p>
      </NuxtLink>

      <!-- Reembolsos -->
      <NuxtLink to="/operacao/lancamento/reembolso" class="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 border-t-4 border-t-green-500 dark:border-t-green-400 p-5 shadow-sm hover:shadow-md transition group">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lançamentos Reembolso</p>
            <div v-if="loading" class="mt-2 h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <h3 v-else class="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{{ stats.totalReembolsos }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <Icon name="fa7-solid:hand-holding-dollar" class="w-5 h-5 text-green-500 dark:text-green-400" />
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition">
          Acessar lançamentos de reembolso →
        </p>
      </NuxtLink>

    </div>

    <!-- Acesso Rápido -->
    <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Acesso Rápido</h3>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/cadastro/funcionario/detalhe" class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-sm text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
          <Icon name="fa7-solid:user-plus" class="w-4 h-4" />
          Novo Funcionário
        </NuxtLink>
        <NuxtLink to="/operacao/lancamento/manual/cadastro" class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 rounded-sm text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition">
          <Icon name="fa7-solid:plus" class="w-4 h-4" />
          Novo Lançamento Manual
        </NuxtLink>
        <NuxtLink to="/operacao/lancamento/reembolso/cadastro" class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 rounded-sm text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition">
          <Icon name="fa7-solid:plus" class="w-4 h-4" />
          Novo Reembolso
        </NuxtLink>
        <NuxtLink to="/operacao/contracheque/importacao" class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-sm text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <Icon name="fa7-solid:upload" class="w-4 h-4" />
          Importar Contracheque
        </NuxtLink>
        <NuxtLink to="/configuracao/usuario" class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-sm text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition">
          <Icon name="fa7-solid:gear" class="w-4 h-4" />
          Configurações
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const userName = ref('Usuário')
const loading = ref(true)

const stats = ref({
  funcionariosAtivos: 0,
  funcionariosTotal: 0,
  totalContracheques: 0,
  totalLancamentosManuais: 0,
  totalReembolsos: 0,
})

onMounted(async () => {
  // Lê o nome do usuário logado
  if (process.client) {
    try {
      const userRaw = localStorage.getItem('user')
      if (userRaw) {
        const user = JSON.parse(userRaw)
        userName.value = user.nome || user.login || 'Usuário'
      }
    } catch {}
  }

  // Busca estatísticas do backend
  try {
    const data = await $fetch<any>('/api/dashboard/stats')
    if (data?.status === 'success') {
      stats.value = data.data
    }
  } catch (e) {
    console.error('Erro ao buscar stats do dashboard:', e)
  } finally {
    loading.value = false
  }
})
</script>
