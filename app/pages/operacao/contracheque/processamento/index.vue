<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Icon name="fa7-solid:cog" class="w-6 h-6 text-[#3276b1] dark:text-[#539ce0]" />
        Processamento de Contracheque
      </h1>
      <NuxtLink to="/operacao/contracheque/importacao" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm">
        <Icon name="fa7-solid:upload" class="w-4 h-4" />
        Importação
      </NuxtLink>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <Icon name="fa7-solid:filter" class="text-gray-500 dark:text-gray-400" />
        <h2 class="font-semibold text-gray-700 dark:text-gray-200">Filtros de Pesquisa</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mês/Ano</label>
          <input v-model="filter.mesAno" v-maska data-maska="##/####" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" placeholder="mm/aaaa" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Projeto</label>
          <select v-model="filter.projeto" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value="">Todos</option>
            <option v-for="p in projetosAtivos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">{{ p.apelido }} - {{ p.descricao }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">CPF</label>
          <input v-model="filter.cpf" v-maska data-maska="###.###.###-##" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition" placeholder="___.___.___-__" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status de aprovação</label>
          <select v-model="filter.status" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value=" " class="dark:bg-gray-800">Todos</option>
            <option value="1" class="dark:bg-gray-800">Aprovado</option>
            <option value="0" class="dark:bg-gray-800">Reprovado</option>
            <option value="2" class="dark:bg-gray-800">Pendentes</option>
          </select>
        </div>
      </div>
      <div class="mt-5 flex justify-between items-center">
        <button @click="infoModalOpen = true" class="bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 border border-orange-300 dark:border-orange-700">
          <Icon name="fa7-solid:circle-info" class="w-4 h-4" />
          Informações
        </button>
        <button @click="fetchList" :disabled="loading" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50">
          <Icon v-if="loading" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
          <Icon v-else name="fa7-solid:magnifying-glass" class="w-4 h-4" />
          Filtrar
        </button>
      </div>
    </div>

    <div class="flex-1 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] transition-colors duration-300">
      <div v-if="items.length > 0 && Number(filter.status) === 2" class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button @click="processarContracheques(0)" :disabled="processing || selectedItems.length === 0" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
          <Icon v-if="processing" name="fa7-solid:spinner" class="animate-spin w-3 h-3" />
          <Icon v-else name="fa7-solid:xmark" class="w-3 h-3" />
          Reprovar Selecionados
        </button>
        <button @click="processarContracheques(1)" :disabled="processing || selectedItems.length === 0" class="bg-[#739e73] hover:bg-[#5f835f] text-white px-4 py-2 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
          <Icon v-if="processing" name="fa7-solid:spinner" class="animate-spin w-3 h-3" />
          <Icon v-else name="fa7-solid:check" class="w-3 h-3" />
          Aprovar Selecionados
        </button>
      </div>

      <div v-if="loading && !items.length" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 mb-4 text-[#3276b1] dark:text-[#539ce0]" />
        Buscando dados...
      </div>
      <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:file-lines" class="w-12 h-12 mb-3 opacity-50" />
        <p>Preencha os filtros para carregar os resultados.</p>
      </div>
      <div v-else class="overflow-x-auto h-[500px]">
        <table class="w-full text-left font-sans text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
          <thead class="text-gray-600 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 shadow-sm z-10">
            <tr>
              <th scope="col" class="px-3 py-2 text-center" style="width: 40px;">
                <input type="checkbox" @change="toggleAll" :checked="isAllSelected" class="w-4 h-4 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded" />
              </th>
              <th scope="col" class="px-3 py-2 font-semibold">Funcionário</th>
              <th scope="col" class="px-3 py-2 font-semibold">CPF</th>
              <th scope="col" class="px-3 py-2 font-semibold text-center">Projeto</th>
              <th scope="col" class="px-3 py-2 font-semibold text-right">Valor Líquido</th>
              <th scope="col" class="px-3 py-2 font-semibold text-center">Matrícula</th>
              <th scope="col" class="px-3 py-2 font-semibold text-right">13º Terceiro</th>
              <th scope="col" class="px-3 py-2 font-semibold text-right">Férias</th>
              <th scope="col" class="px-3 py-2 font-semibold text-right">Multa FGTS</th>
              <th scope="col" class="px-3 py-2 font-semibold text-right">Submódulo</th>
              <th scope="col" class="px-3 py-2 font-semibold text-right">Retenção</th>
              <th scope="col" class="px-3 py-2 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.matricula + '-' + item.codigo" class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition">
              <td class="px-3 py-2 text-center">
                <input v-if="item.statusAprovacao === 2" type="checkbox" :value="item.matricula" v-model="selectedItems" class="w-4 h-4 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded" />
              </td>
              <td class="px-3 py-2 font-medium">{{ item.funcionario }}</td>
              <td class="px-3 py-2">{{ item.cpf }}</td>
              <td class="px-3 py-2 text-center">{{ item.projeto }}</td>
              <td class="px-3 py-2 text-right text-[#3276b1] dark:text-[#539ce0] font-semibold">{{ formatCurrency(item.valorLiquido) }}</td>
              <td class="px-3 py-2 text-center">{{ item.matricula }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(item.decimoTerceiro) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(item.feriasConstitucional) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(item.multaFgts) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(item.submodulo) }}</td>
              <td class="px-3 py-2 text-right font-medium text-red-600 dark:text-red-400">{{ formatCurrency(item.valorRetencao) }}</td>
              <td class="px-3 py-2 text-center">
                <span v-if="item.statusAprovacao === 1" class="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-sm text-xs font-semibold">Fechado</span>
                <span v-else-if="item.statusAprovacao === 0" class="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-sm text-xs font-semibold">Reprovado</span>
                <span v-else class="text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded-sm text-xs font-semibold">Pendente</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ClientOnly>
      <AppModal :isOpen="infoModalOpen" title="Informações do Processamento" icon="fa7-solid:circle-info" @close="infoModalOpen = false">
        <div class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-sm text-gray-800 dark:text-gray-200 text-center mb-6 mt-[-1rem] -mx-4 uppercase font-bold text-lg leading-tight">
          Segue abaixo as informações para realizar<br/>o processamento de um contracheque:
        </div>
        <div class="space-y-6 text-center py-4">
          <div>
            <p class="text-[#739e73] dark:text-[#a8cf45] font-bold text-xl mb-1 uppercase">Aprovar</p>
            <p class="text-gray-600 dark:text-gray-300 font-medium text-base">Os contracheques selecionados<br>serão <strong>APROVADOS</strong> e processados.</p>
          </div>
          <div>
            <p class="text-red-600 dark:text-red-400 font-bold text-xl mb-1 uppercase">Reprovar</p>
            <p class="text-gray-600 dark:text-gray-300 font-medium text-base">Os contracheques selecionados<br>serão <strong>REPROVADOS</strong> e processados.</p>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-center w-full">
            <button @click="infoModalOpen = false" class="px-6 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm font-medium transition shadow-sm">Fechar</button>
          </div>
        </template>
      </AppModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

const loading = ref(false)
const processing = ref(false)
const infoModalOpen = ref(false)
const items = ref<any[]>([])
const projetosAtivos = ref<any[]>([])
const selectedItems = ref<number[]>([])

const filter = reactive({ mesAno: '', projeto: '', cpf: '', status: '2' })

const formatCurrency = (val: number | string | null) => {
  if (!val) return 'R$ 0,00'
  const num = typeof val === 'string' ? parseFloat(val) : val
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const isAllSelected = computed(() => {
  const pendentes = items.value.filter(i => i.statusAprovacao === 2)
  if (pendentes.length === 0) return false
  return selectedItems.value.length === pendentes.length
})

const toggleAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  selectedItems.value = checked ? items.value.filter(i => i.statusAprovacao === 2).map(i => i.matricula) : []
}

const loadProjetos = async () => {
  try { const data = await $fetch('/api/cadastro/projeto/ativos'); projetosAtivos.value = data?.data || [] } catch (e) { console.error(e) }
}

const fetchList = async () => {
  if (!filter.mesAno) { alert('Informe o mês/ano'); return }
  loading.value = true; selectedItems.value = []
  try {
    const data = await $fetch<any>('/api/operacao/contracheque/processamento/filtro', { method: 'POST', body: filter })
    items.value = data?.results || []
  } catch (err: any) { console.error(err); alert('Erro ao buscar contracheques') } finally { loading.value = false }
}

const processarContracheques = async (statusAprovacao: number) => {
  if (selectedItems.value.length === 0) { alert('Selecione pelo menos um contra-cheque para processar.'); return }
  processing.value = true
  try {
    const resp = await $fetch('/api/operacao/contracheque/processamento/processar', { method: 'POST', body: { matriculas: selectedItems.value, statusAprovacao } })
    if (resp.status === 'success') { alert('Operação realizada com sucesso!'); filter.status = String(statusAprovacao); await fetchList() }
    else { alert(resp.mensagem || 'Erro ao processar') }
  } catch (e: any) { console.error(e); alert('Erro na comunicação com a API') } finally { processing.value = false }
}

onMounted(() => { loadProjetos() })
</script>
