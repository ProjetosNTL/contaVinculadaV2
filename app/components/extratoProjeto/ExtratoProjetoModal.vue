<template>
  <AppModal :isOpen="isOpen" title="Extrato do Projeto" @close="fechar" size="4xl">
    <div class="p-4 bg-gray-50 border rounded-md mb-4 shadow-sm">
      <div class="flex items-center gap-4 mb-4">
        <span class="font-bold text-sm text-gray-700">Visualizar:</span>
        <div class="flex gap-2">
          <button @click="mudarTipo(0)" :class="filtro.tipo === 0 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'" class="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors">Todas</button>
          <button @click="mudarTipo(1)" :class="filtro.tipo === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'" class="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors">Entradas</button>
          <button @click="mudarTipo(2)" :class="filtro.tipo === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'" class="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors">Saídas</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Período específico</label>
          <select v-model="filtro.periodoAtalho" @change="aplicarAtalhoPeriodo" class="w-full border rounded p-1.5 text-sm bg-white">
            <option value="">Selecione</option>
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Data Inicial</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-2 top-2 text-gray-400 text-xs" />
            <input v-model="filtro.dataInicial" v-maska data-maska="##/##/####" type="text" class="w-full border rounded p-1.5 pl-7 text-sm text-center" placeholder="__/__/____" @blur="buscarDetalhes" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Data Final</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-2 top-2 text-gray-400 text-xs" />
            <input v-model="filtro.dataFinal" v-maska data-maska="##/##/####" type="text" class="w-full border rounded p-1.5 pl-7 text-sm text-center" placeholder="__/__/____" @blur="buscarDetalhes" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Agrupar Lançamentos</label>
          <select v-model="filtro.agrupar" @change="buscarDetalhes" class="w-full border rounded p-1.5 text-sm bg-white">
            <option value="1">Sim (Totalizado)</option>
            <option value="0">Não (Por Func.)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Ordenar por</label>
          <select v-model="filtro.ordenar" @change="buscarDetalhes" class="w-full border rounded p-1.5 text-sm bg-white">
            <option value="1">Mais recente</option>
            <option value="0">Mais antigo</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-gray-600 mb-1">Lançamento / Detalhar</label>
          <div class="flex gap-2">
            <select v-model="filtro.lancamento" @change="buscarDetalhes" class="w-2/3 border rounded p-1.5 text-sm bg-white">
              <option value="">Todos</option>
              <option value="1">Contracheque</option>
              <option value="2">Lançamento Manual</option>
              <option value="3">Lançamento Reembolso</option>
              <option value="5">Décimo Terceiro</option>
              <option value="6">Férias</option>
              <option value="7">Multa FGTS</option>
              <option value="8">Submódulo</option>
            </select>
            <select v-model="filtro.detalhar" @change="buscarDetalhes" class="w-1/3 border rounded p-1.5 text-sm bg-white">
              <option value="0">Não</option>
              <option value="1">Sim</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-y-auto max-h-[400px] border rounded-md mb-4 shadow-sm relative">
      <table class="w-full text-left border-collapse whitespace-nowrap text-sm">
        <thead class="bg-[#2F5597] text-white sticky top-0 z-10">
          <tr>
            <th class="p-2 border-b">Funcionário</th>
            <th class="p-2 border-b">Usuário</th>
            <th class="p-2 border-b">Lançamento / Descrição</th>
            <th class="p-2 border-b text-center">Data</th>
            <th class="p-2 border-b text-right">Valor</th>
            <th class="p-2 border-b text-right">Saldo Projeto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="carregando">
            <td colspan="6" class="p-8 text-center text-gray-500 font-bold">Buscando extrato...</td>
          </tr>
          <tr v-else-if="detalhes.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-500">Nenhum lançamento encontrado para este filtro.</td>
          </tr>
          <tr v-for="(item, idx) in detalhes" :key="idx" class="hover:bg-gray-100 border-b even:bg-gray-50">
            <td class="p-2 truncate max-w-[200px]" :title="item.nomeFuncionario">{{ item.nomeFuncionario }}</td>
            <td class="p-2">{{ item.usuarioCadastro || '-' }}</td>
            <td class="p-2 truncate max-w-[200px]" :title="item.detalhes || item.tipoLancamentoDesc">
              {{ item.detalhes || item.tipoLancamentoDesc }}
            </td>
            <td class="p-2 text-center">{{ item.dataCadastroFormatada }}</td>
            <td class="p-2 text-right font-semibold" :class="item.tipoMovimentacao === 1 ? 'text-green-600' : 'text-red-600'">
              {{ item.tipoMovimentacao === 1 ? '+' : '-' }} R$ {{ formatarMoeda(item.valorMovimentacao) }}
            </td>
            <td class="p-2 text-right font-bold" :class="item.saldoAcumulado >= 0 ? 'text-green-700' : 'text-red-700'">
              R$ {{ formatarMoeda(item.saldoAcumulado) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-between items-center mt-4 border-t pt-4">
      <button @click="exportarExcel" :disabled="gerandoExcel || detalhes.length === 0" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center disabled:opacity-50">
        <span>{{ gerandoExcel ? 'Gerando...' : 'Exportar Excel' }}</span>
        <Icon v-if="!gerandoExcel" name="fa-solid:file-excel" class="ml-2" />
      </button>
      <button @click="fechar" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 font-bold">Fechar</button>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  projetoId: Number
})

const emit = defineEmits(['close'])

const detalhes = ref<any[]>([])
const carregando = ref(false)
const gerandoExcel = ref(false)

const filtro = ref({
  tipo: 0, // 0 = Todas, 1 = Entradas, 2 = Saídas
  periodoAtalho: '',
  dataInicial: '',
  dataFinal: '',
  agrupar: '1',
  detalhar: '0',
  ordenar: '1',
  lancamento: ''
})

const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const mudarTipo = (tipo: number) => {
  filtro.value.tipo = tipo
  buscarDetalhes()
}

const formatarDataInput = (dataObj: Date) => {
  const dia = String(dataObj.getDate()).padStart(2, '0')
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
  const ano = dataObj.getFullYear()
  return `${dia}/${mes}/${ano}`
}

const aplicarAtalhoPeriodo = () => {
  if (!filtro.value.periodoAtalho) {
    filtro.value.dataInicial = ''
    filtro.value.dataFinal = ''
  } else {
    const dias = parseInt(filtro.value.periodoAtalho)
    const hoje = new Date()
    const inicio = new Date()
    inicio.setDate(hoje.getDate() - dias)

    filtro.value.dataFinal = formatarDataInput(hoje)
    filtro.value.dataInicial = formatarDataInput(inicio)
  }
  buscarDetalhes()
}

const buscarDetalhes = async () => {
  if (!props.projetoId) return
  carregando.value = true
  try {
    const response = await $fetch<{ data: any[] }>('/api/operacao/movimentacaoBancaria/extratoProjeto/detalhes', {
      method: 'POST',
      body: { projeto: props.projetoId, ...filtro.value }
    })
    detalhes.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar detalhes do extrato:', error)
  } finally {
    carregando.value = false
  }
}

const exportarExcel = async () => {
  gerandoExcel.value = true
  try {
    const response: Blob = await $fetch('/api/operacao/movimentacaoBancaria/extratoProjeto/excel', {
      method: 'POST',
      body: { projeto: props.projetoId, ...filtro.value },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Extrato_Projeto_${props.projetoId}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert("Falha ao gerar o arquivo Excel.")
  } finally {
    gerandoExcel.value = false
  }
}

const fechar = () => emit('close')

// Monitora abertura do modal pra buscar os dados e resetar filtros se precisar
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    filtro.value = { tipo: 0, periodoAtalho: '', dataInicial: '', dataFinal: '', agrupar: '1', detalhar: '0', ordenar: '1', lancamento: '' }
    buscarDetalhes()
  }
})
</script>