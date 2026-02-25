<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Icon name="fa7-solid:cash-register" class="w-6 h-6 text-[#3276b1] dark:text-[#539ce0]" />
        Lançamento Manual
      </h1>
      <button 
        @click="navigateTo('/operacao/lancamento/manual/cadastro')"
        class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm"
      >
        <Icon name="fa7-solid:plus" class="w-4 h-4" />
        Novo
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <Icon name="fa7-solid:filter" class="text-gray-500 dark:text-gray-400" />
        <h2 class="font-semibold text-gray-700 dark:text-gray-200">Filtro de Busca</h2>
      </div>

      <form @submit.prevent="filtrar" class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div class="lg:col-span-3">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Projeto</label>
          <select v-model="filter.projeto" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value="" class="dark:bg-gray-800">Selecione...</option>
            <option v-for="p in projetos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">{{ p.apelido }} - {{ p.descricao }}</option>
          </select>
        </div>
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo da Movimentação</label>
          <select v-model="filter.tipoMovimentacao" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value="" class="dark:bg-gray-800">Selecione...</option>
            <option v-for="tm in tiposMov" :key="tm.codigo" :value="tm.codigo" class="dark:bg-gray-800">{{ tm.descricao }}</option>
          </select>
        </div>
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data da Mov.</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="fa7-solid:calendar" class="text-gray-400 dark:text-gray-500" />
            </div>
            <input v-model="filter.dataMovimentacao" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
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

    <div class="flex-1 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
      <div v-if="loading" class="flex-1 flex items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 mb-4 text-[#3276b1] dark:text-[#539ce0]" />
      </div>
      <div v-else-if="lancamentos.length === 0 && buscou" class="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 dark:text-gray-500">
        <p class="text-lg">Nenhum lançamento encontrado para os filtros informados.</p>
      </div>
      <div v-else-if="!buscou" class="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 dark:text-gray-500">
        <Icon name="fa7-solid:file-invoice" class="w-12 h-12 mb-3 opacity-30" />
        <p>Preencha os filtros e clique em Filtrar.</p>
      </div>
      <div v-else-if="lancamentos.length > 0" class="flex-1 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-100/70 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
              <th class="p-3 font-semibold">Projeto</th>
              <th class="p-3 font-semibold">Conta Vinculada</th>
              <th class="p-3 font-semibold">Tipo de Movimentação</th>
              <th class="p-3 font-semibold text-center">Data Mov.</th>
              <th class="p-3 font-semibold text-right">Valor Mov.</th>
              <th class="p-3 font-semibold text-center w-28">Funcionários</th>
              <th class="p-3 font-semibold text-center w-28">Detalhes</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="lan in lancamentos" :key="lan.codigo" class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <td class="p-3 text-gray-800 dark:text-gray-200">{{ lan.projeto }}</td>
              <td class="p-3 text-gray-600 dark:text-gray-400">{{ lan.contaVinculada }}</td>
              <td class="p-3 text-gray-600 dark:text-gray-400">{{ lan.tipoMovimentacao }}</td>
              <td class="p-3 text-gray-600 dark:text-gray-400 text-center">{{ formatarData(lan.dataMovimentacao) }}</td>
              <td class="p-3 text-right font-medium text-blue-600 dark:text-blue-400">R$ {{ formatarValor(lan.valorMovimentacao) }}</td>
              <td class="p-3 text-center">
                <button @click="abrirModalFuncionario(lan)" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white w-8 h-8 rounded-sm inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition" :disabled="lan.funcionario !== 1" title="Listar Funcionários">
                  <Icon name="fa7-solid:user" class="w-4 h-4" />
                </button>
              </td>
              <td class="p-3 text-center">
                <button @click="abrirModalDetalhes(lan)" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white w-8 h-8 rounded-sm inline-flex items-center justify-center transition" title="Ver Detalhes">
                  <Icon name="fa7-solid:list" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalFunc" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="modalFunc = false">
        <div class="bg-white dark:bg-gray-800 rounded-md shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          <div class="bg-[#22262e] dark:bg-gray-900 px-4 py-3 flex justify-between items-center text-white">
            <h3 class="font-medium text-lg">Funcionários do Lançamento</h3>
            <button @click="modalFunc = false" class="text-gray-400 hover:text-white transition"><Icon name="fa7-solid:xmark" class="w-5 h-5" /></button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-gray-800">
            <div v-if="loadingFunc" class="flex justify-center py-8"><Icon name="fa7-solid:spinner" class="animate-spin w-8 h-8 text-[#3276b1] dark:text-[#539ce0]" /></div>
            <table v-else class="w-full text-left border-collapse border border-gray-200 dark:border-gray-700">
              <tbody>
                <tr v-for="(f, i) in currentFuncs" :key="i" class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="p-3 text-gray-800 dark:text-gray-200 text-center font-medium">{{ f.funcionario }}</td>
                </tr>
                <tr v-if="currentFuncs.length === 0">
                  <td class="p-4 text-center text-gray-500 dark:text-gray-400">Nenhum funcionário vinculado.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button @click="modalFunc = false" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-sm font-medium transition">Fechar</button>
          </div>
        </div>
      </div>
      <div v-if="modalDet" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="modalDet = false">
        <div class="bg-white dark:bg-gray-800 rounded-md shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h3 class="font-bold text-lg text-gray-700 dark:text-gray-200">Detalhes do Lançamento</h3>
            <button @click="modalDet = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"><Icon name="fa7-solid:xmark" class="w-5 h-5" /></button>
          </div>
          <div class="p-6 bg-white dark:bg-gray-800 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">- Motivo:</label>
              <textarea readonly class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm p-3 text-gray-700 dark:text-gray-200 focus:outline-none resize-y min-h-[120px]">{{ currentDet.motivo }}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">- Usuário Cadastro:</label>
              <input type="text" readonly class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none" :value="currentDet.usuarioCadastro" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">- Data Cadastro:</label>
              <input type="text" readonly class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none" :value="formatarDataHora(currentDet.dataCadastro)" />
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <button @click="modalDet = false" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-8 py-2 rounded-sm font-bold shadow-sm transition">Fechar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const buscou = ref(false)
const projetos = ref<any[]>([])
const tiposMov = ref<any[]>([])
const lancamentos = ref<any[]>([])
const modalFunc = ref(false)
const loadingFunc = ref(false)
const currentFuncs = ref<any[]>([])
const modalDet = ref(false)
const currentDet = ref<any>({})

const filter = reactive({ projeto: '', tipoMovimentacao: '', dataMovimentacao: '' })

const carregarFiltros = async () => {
  try {
    const respProj: any = await $fetch('/api/cadastro/projeto/ativos')
    const respTipos: any = await $fetch('/api/tabelaBasica/tipoMovimentacao/recupera')
    projetos.value = respProj?.data || []
    if (respTipos?.results) tiposMov.value = respTipos.results
  } catch (e) { console.error(e) }
}

const formatarData = (dt: string) => { if (!dt) return ''; return new Date(dt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }
const formatarDataHora = (dt: string) => { if (!dt) return ''; return new Date(dt).toLocaleString('pt-BR') }
const formatarValor = (valor: number) => { if (!valor && valor !== 0) return '0,00'; return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const filtrar = async () => {
  loading.value = true; buscou.value = true
  try {
    const resp: any = await $fetch('/api/operacao/lancamento/manual/listagem', { method: 'POST', body: filter })
    lancamentos.value = resp?.results || []
  } catch (e) { console.error(e); alert('Falha ao buscar lançamentos manuais') } finally { loading.value = false }
}

const abrirModalFuncionario = async (lanc: any) => {
  modalFunc.value = true; loadingFunc.value = true; currentFuncs.value = []
  try {
    const resp: any = await $fetch('/api/operacao/lancamento/manual/recuperaFuncionario', { method: 'POST', body: { lancamentoManual: lanc.codigo } })
    if (resp.status === 'success') currentFuncs.value = resp.data
  } catch (e) { console.error(e) } finally { loadingFunc.value = false }
}

const abrirModalDetalhes = (lanc: any) => { currentDet.value = { ...lanc }; modalDet.value = true }

onMounted(() => { carregarFiltros(); filtrar() })
</script>
