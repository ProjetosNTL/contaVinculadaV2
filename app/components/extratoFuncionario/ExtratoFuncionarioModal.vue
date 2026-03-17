<template>
  <AppModal :isOpen="isOpen" title="Extrato Detalhado do Funcionário" icon="fa7-solid:user-clock" @close="fechar" tamanho="4xl">
    
    <div class="space-y-6">
      <!-- Filtros do Extrato -->
      <div class="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-5">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs font-black uppercase tracking-widest text-gray-400">Visualizar:</span>
          <div class="flex gap-2 p-1 bg-white dark:bg-[#1e2029] rounded-xl border border-gray-100 dark:border-gray-800">
            <button v-for="t in [{v:0, l:'Todas'}, {v:1, l:'Entradas'}, {v:2, l:'Saídas'}]" :key="t.v"
              @click="mudarTipo(t.v)"
              :class="filtro.tipo === t.v ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
              {{ t.l }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div class="md:col-span-2 lg:col-span-1">
            <AppSelect v-model="filtro.periodoAtalho" label="Atalho" :opcoes="[
              { codigo: '', descricao: 'Selecione...' },
              { codigo: '7', descricao: 'Últimos 7 dias' },
              { codigo: '15', descricao: 'Últimos 15 dias' },
              { codigo: '30', descricao: 'Últimos 30 dias' }
            ]" @change="aplicarAtalhoPeriodo" />
          </div>
          <AppInputTexto v-model="filtro.dataInicial" label="Data Inicial" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar" @blur="buscarDetalhes" />
          <AppInputTexto v-model="filtro.dataFinal" label="Data Final" placeholder="DD/MM/AAAA" v-maska data-maska="##/##/####" icone="fa7-solid:calendar" @blur="buscarDetalhes" />
          <AppSelect v-model="filtro.ordenar" label="Ordem" :opcoes="[{ codigo: '1', descricao: 'Mais recente' }, { codigo: '0', descricao: 'Mais antigo' }]" @change="buscarDetalhes" />
          <div class="flex items-end pb-1">
            <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarDetalhes" class="w-full">
              Filtrar
            </AppBotao>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-3">
             <AppSelect v-model="filtro.lancamento" label="Tipo de Lançamento" :opcoes="[
                { codigo: '', descricao: 'Todos os tipos' },
                { codigo: '1', descricao: 'Contracheque' },
                { codigo: '2', descricao: 'Lançamento Manual' },
                { codigo: '3', descricao: 'Reembolso' },
                { codigo: '5', descricao: 'Décimo Terceiro' },
                { codigo: '6', descricao: 'Férias' },
                { codigo: '7', descricao: 'Multa FGTS' },
                { codigo: '8', descricao: 'Submódulo' }
              ]" @change="buscarDetalhes" />
          </div>
          <AppSelect v-model="filtro.detalhar" label="Ver Detalhes?" :opcoes="[{ codigo: '0', descricao: 'Não' }, { codigo: '1', descricao: 'Sim' }]" @change="buscarDetalhes" />
        </div>
      </div>

      <!-- Tabela de Movimentações -->
      <div class="bg-white dark:bg-[#1e2029] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto max-h-[450px]">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
              <tr>
                <th class="px-5 py-3 text-[10px] font-black uppercase text-gray-400">Autor / Usuário</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase text-gray-400">Lançamento / Descrição</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase text-gray-400 text-center">Data</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase text-gray-400 text-right">Valor</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase text-gray-400 text-right">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
              <tr v-if="carregando">
                <td colspan="5" class="py-20 text-center">
                   <Icon name="fa7-solid:circle-notch" class="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                   <p class="text-sm text-gray-400 font-bold">Processando extrato...</p>
                </td>
              </tr>
              <tr v-else-if="detalhes.length === 0">
                <td colspan="5" class="py-20 text-center flex flex-col items-center">
                   <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-200">
                      <Icon name="fa7-solid:ghost" class="w-8 h-8" />
                   </div>
                   <p class="text-sm text-gray-400 font-medium">Nenhuma movimentação encontrada.</p>
                </td>
              </tr>
              <tr v-for="(item, idx) in detalhes" :key="idx" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                       <Icon name="fa7-solid:user-shield" class="w-3 h-3" />
                    </div>
                    <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ item.usuarioCadastro || '-' }}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                   <p class="text-sm text-gray-600 dark:text-gray-400 italic leading-snug truncate max-w-[250px]" :title="item.detalhes || item.tipoLancamentoDesc">
                     {{ item.detalhes || item.tipoLancamentoDesc }}
                   </p>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="text-xs font-bold text-gray-500">{{ item.dataCadastroFormatada }}</span>
                </td>
                <td class="px-5 py-4 text-right">
                  <span class="text-sm font-black" :class="item.tipoMovimentacao === 1 ? 'text-emerald-500' : 'text-red-500'">
                    {{ item.tipoMovimentacao === 1 ? '+' : '-' }} R$ {{ formatarMoeda(item.valorMovimentacao) }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                   <div class="inline-block px-3 py-1 rounded-lg font-bold text-sm bg-gray-50 dark:bg-gray-900" :class="item.saldoAcumulado >= 0 ? 'text-emerald-700' : 'text-red-700'">
                     R$ {{ formatarMoeda(item.saldoAcumulado) }}
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-between items-center gap-4">
        <AppBotao variacao="primario" icone="fa7-solid:file-excel" :carregando="gerandoExcel" :disabled="detalhes.length === 0" @click="exportarExcel">
          Exportar para Excel
        </AppBotao>
        <AppBotao variacao="padrao" @click="fechar">Fechar Extrato</AppBotao>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  funcionarioId: Number
})

const emit = defineEmits(['close'])

const detalhes = ref<any[]>([])
const carregando = ref(false)
const gerandoExcel = ref(false)

const filtro = ref({
  tipo: 0, 
  periodoAtalho: '',
  dataInicial: '',
  dataFinal: '',
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
  if (!props.funcionarioId) return
  carregando.value = true
  try {
    const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoFuncionario/detalhes', {
      method: 'POST',
      body: { funcionario: props.funcionarioId, ...filtro.value }
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
    const response: Blob = await $fetch('/api/operacao/movimentacaoBancaria/extratoFuncionario/excel', {
      method: 'POST',
      body: { funcionario: props.funcionarioId, ...filtro.value },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Extrato_Funcionario_${props.funcionarioId}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
  } finally {
    gerandoExcel.value = false
  }
}

const fechar = () => emit('close')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    filtro.value = { tipo: 0, periodoAtalho: '', dataInicial: '', dataFinal: '', detalhar: '0', ordenar: '1', lancamento: '' }
    buscarDetalhes()
  }
})
</script>