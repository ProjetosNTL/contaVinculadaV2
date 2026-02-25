<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Icon name="fa7-solid:list-check" class="w-6 h-6 text-[#3276b1] dark:text-[#539ce0]" />
        Extrato Projeto
      </h1>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <Icon name="fa7-solid:filter" class="text-gray-500 dark:text-gray-400" />
        <h2 class="font-semibold text-gray-700 dark:text-gray-200">Filtro de Extrato (Projetos)</h2>
      </div>
      <form @submit.prevent="filtrar" class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Projeto</label>
          <select v-model="filter.projeto" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value="" class="dark:bg-gray-800">Selecione um projeto</option>
            <option v-for="p in projetos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">{{ p.apelido }} - {{ p.descricao }}</option>
          </select>
        </div>
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Conta Vinculada</label>
          <select v-model="filter.contaVinculada" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value="" class="dark:bg-gray-800">Selecione a conta</option>
            <option v-for="p in projetos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">{{ p.apelido }} - {{ p.descricao }}</option>
          </select>
        </div>
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Inicial</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="fa7-solid:calendar-days" class="text-gray-400 dark:text-gray-500" /></div>
            <input v-model="filter.dataInicial" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
          </div>
        </div>
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Final</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="fa7-solid:calendar-days" class="text-gray-400 dark:text-gray-500" /></div>
            <input v-model="filter.dataFinal" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
          </div>
        </div>
      </form>
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <button @click="filtrar" :disabled="loading" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50">
          <Icon v-if="loading" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
          <Icon v-else name="fa7-solid:magnifying-glass" class="w-4 h-4" />
          Filtrar
        </button>
      </div>
    </div>

    <div class="flex-1 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] transition-colors duration-300">
      <div v-if="loading" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 mb-4 text-[#3276b1] dark:text-[#539ce0]" />
        Buscando extratos do projeto...
      </div>
      <div v-else-if="!buscou" class="flex flex-col items-center justify-center p-12 text-gray-400 dark:text-gray-500">
        <Icon name="fa7-solid:file-invoice" class="w-12 h-12 mb-3 opacity-30 dark:opacity-40" />
        <p>Preencha os filtros para carregar o extrato do projeto.</p>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:box-open" class="w-12 h-12 mb-3 text-orange-400 opacity-80" />
        <p class="font-semibold text-lg text-gray-700 dark:text-gray-200">Nenhuma movimentação encontrada</p>
        <p class="text-sm">O módulo de banco em projetos ainda não foi concluído no código fonte original.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const buscou = ref(false)
const projetos = ref<any[]>([])

const filter = reactive({ projeto: '', contaVinculada: '', dataInicial: '', dataFinal: '' })

const carregarProjetos = async () => {
  try { const resp = await $fetch('/api/cadastro/projeto/ativos'); projetos.value = resp?.data || [] } catch (e) { console.error(e) }
}

const filtrar = () => {
  loading.value = true
  setTimeout(() => { loading.value = false; buscou.value = true }, 600)
}

onMounted(() => { carregarProjetos() })
</script>
