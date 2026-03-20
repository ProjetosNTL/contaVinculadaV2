<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">

    <AppBarraNavegacao icone="fa7-solid:file-import" :links="[{ label: 'Bancos', to: '/tabelaBasica/bancos' }]"
      paginaAtual="Importar Bancos" />

    <AppCartaoFormulario>
      <div class="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 relative z-10">
        <h2 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
            <Icon name="fa7-solid:university" class="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
          </div>
          Instituições Disponíveis
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Consulte a lista oficial de bancos ativos abaixo.</p>
      </div>

      <!-- Barra de Controle da Lista -->
      <div class="flex flex-col sm:flex-row items-center gap-4 mb-6 animate-slide-up">
        <!-- 1. Autocomplete (Busca) -->
        <AppInputAutocomplete 
          v-model="filtroBusca"
          placeholder="Pesquisar por nome ou código..."
          :sugestoes="sugestoesBusca"
          :mostrarMenu="false"
          @buscar="paginaAtual = 1"
        />

        <!-- 2. Marcar/Desmarcar Todos -->
        <AppBotao :variacao="todosMarcados ? 'perigo' : 'sucesso'"
          :icone="todosMarcados ? 'fa7-solid:xmark' : 'fa7-solid:check-double'" @click="marcarDesmarcarTodos"
          class="!h-11 !px-6 !text-xs !rounded-xl shadow-sm w-full sm:w-auto">
          {{ todosMarcados ? 'Desmarcar Todos' : 'Marcar Todos' }}
        </AppBotao>
        
        <!-- 3. Contador -->
        <span class="hidden lg:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800 whitespace-nowrap">
          <Icon name="fa7-solid:list-check" class="text-emerald-500 w-3 h-3" />
          {{ bancosFiltrados.length }} de {{ bancosDaApi.length }} bancos
        </span>
      </div>

      <div class="relative min-h-0 flex flex-col transition-all duration-300">
        <AppContainerListagem
          :lista="bancosPaginados"
          :carregando="carregandoBancos"
          :buscaRealizada="true"
          :totalRegistros="bancosFiltrados.length"
          :registroInicial="(paginaAtual - 1) * itensPorPagina + 1"
          :registroFinal="Math.min(paginaAtual * itensPorPagina, bancosFiltrados.length)"
          :totalPaginas="totalPaginas"
          :paginaAtual="paginaAtual"
          :itensPorPagina="itensPorPagina"
          :paginasExibidas="paginasExibidas"
          class="flex-1"
          @mudarPagina="pag => paginaAtual = pag"
          @mudarItensPorPagina="qtd => { itensPorPagina = qtd; paginaAtual = 1 }"
        >
          <template #cabecalho-tabela>
            <th class="p-4 w-20 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Sel.</th>
            <th class="p-4 w-32 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
            <th class="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Instituição Bancária</th>
          </template>

          <template #linhas-tabela="{ item }">
            <td class="p-4 text-center cursor-pointer" @click.stop="item.selecionado = !item.selecionado">
              <div class="flex items-center justify-center">
                <AppCheckbox v-model="item.selecionado" />
              </div>
            </td>
            <td class="p-4 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
              <span class="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 min-w-[60px]">
                {{ item.code }}
              </span>
            </td>
            <td class="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {{ item.fullName }}
            </td>
          </template>
        </AppContainerListagem>
      </div>

      <AppRodapeFormulario :carregandoGravar="salvando" labelVoltar="Cancelar" labelGravar="Importar Selecionados"
        iconeExcluir="fa7-solid:trash-can" :editando="false" @voltar="voltar" @gravar="gravarEmLote" />
    </AppCartaoFormulario>

    <!-- Modal de Alerta -->
    <AppModal :isOpen="modalAlertaAberto" :title="modalAlertaTitulo" icon="fa7-solid:circle-exclamation"
      @close="modalAlertaAberto = false">
      <div
        class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 text-amber-900 dark:text-amber-200">
        <p class="text-base text-center font-bold">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="modalAlertaAberto = false" class="w-full sm:w-auto">
          Ok, Entendido
        </AppBotao>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const bancosDaApi = ref<any[]>([])
const carregandoBancos = ref(true)
const salvando = ref(false)

const modalAlertaAberto = ref(false)
const modalAlertaTitulo = ref('')
const modalAlertaMensagem = ref('')

const filtroBusca = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

const bancosFiltrados = computed(() => {
  if (!filtroBusca.value) return bancosDaApi.value
  const termo = removerAcentos(filtroBusca.value.toLowerCase())
  return bancosDaApi.value.filter(b => 
    removerAcentos(b.fullName.toLowerCase()).includes(termo) || 
    b.code?.toString().includes(termo)
  )
})

const sugestoesBusca = computed(() => {
  return bancosFiltrados.value.slice(0, 10).map(b => ({
    id: b.code,
    descricao: `${b.code} - ${b.fullName}`
  }))
})

const bancosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value
  const fim = inicio + itensPorPagina.value
  return bancosFiltrados.value.slice(inicio, fim)
})

const totalPaginas = computed(() => Math.ceil(bancosFiltrados.value.length / itensPorPagina.value))

const paginasExibidas = computed(() => {
  const paginas: (number | string)[] = []
  const maxBotoes = 7
  const total = totalPaginas.value

  if (total <= maxBotoes) {
    for (let i = 1; i <= total; i++) paginas.push(i)
  } else {
    paginas.push(1)
    
    let inicio = Math.max(2, paginaAtual.value - 1)
    let fim = Math.min(total - 1, paginaAtual.value + 1)

    if (paginaAtual.value <= 4) {
      fim = 5
    } else if (paginaAtual.value >= total - 3) {
      inicio = total - 4
    }

    if (inicio > 2) paginas.push('...')
    for (let i = inicio; i <= fim; i++) paginas.push(i)
    if (fim < total - 1) paginas.push('...')
    
    paginas.push(total)
  }
  return paginas
})

watch(filtroBusca, () => {
  paginaAtual.value = 1
})

const todosMarcados = computed(() => {
  const lista = bancosPaginados.value
  if (lista.length === 0) return false
  return lista.every(b => b.selecionado)
})

const mostrarAlerta = (titulo: string, mensagem: string) => {
  modalAlertaTitulo.value = titulo
  modalAlertaMensagem.value = mensagem
  modalAlertaAberto.value = true
}

const removerAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

const buscarBancosApiExterna = async () => {
  try {
    const data: any = await $fetch('https://brasilapi.com.br/api/banks/v1')

    bancosDaApi.value = data
      .filter((b: any) => b.code != null)
      .sort((a: any, b: any) => {
        let nomeA = removerAcentos(a.fullName.toLowerCase())
        let nomeB = removerAcentos(b.fullName.toLowerCase())
        if (nomeA < nomeB) return -1
        if (nomeA > nomeB) return 1
        return 0
      })
      .map((b: any) => ({ ...b, selecionado: false }))

  } catch (error) {
    console.error("Erro ao buscar Brasil API", error)
    mostrarAlerta("Erro de Conexão", "Não foi possível obter a lista de bancos da Brasil API.")
  } finally {
    carregandoBancos.value = false
  }
}

const marcarDesmarcarTodos = () => {
  const estadoAtual = todosMarcados.value
  bancosPaginados.value.forEach(b => b.selecionado = !estadoAtual)
}

const gravarEmLote = async () => {
  const selecionados = bancosDaApi.value.filter(b => b.selecionado).map(b => ({
    codigoBanco: b.code,
    nomeBanco: b.fullName
  }))

  if (selecionados.length === 0) {
    return mostrarAlerta("Nenhuma Seleção", "Por favor, selecione ao menos um banco para realizar a importação.")
  }

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/bancos/gravarLote', {
      method: 'POST',
      body: { bancos: selecionados }
    })

    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro na Importação", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao importar bancos:', error)
    mostrarAlerta("Erro Interno", "Houve uma falha técnica ao processar a importação em lote.")
  } finally {
    salvando.value = false
  }
}

const voltar = () => router.push('/tabelaBasica/bancos')

onMounted(() => {
  buscarBancosApiExterna()
})
</script>