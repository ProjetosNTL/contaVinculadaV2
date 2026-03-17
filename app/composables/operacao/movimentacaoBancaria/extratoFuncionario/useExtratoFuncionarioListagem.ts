import { ref, reactive, computed, onMounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useExtratoFuncionarioListagem() {
  const { width } = useWindowSize()
  
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  
  const modalFiltroAvancadoAberto = ref(false)
  const modalExibicaoAberto = ref(false)

  const placeholderDinamico = computed(() => {
    if (width.value < 640) return 'Buscar funcionário...'
    return 'Digite o nome ou CPF...'
  })

  const filtro = reactive({
    nomeParam: '', // Termo de busca principal
    projetoParam: '',
    funcionarioParam: ''
  })

  const colunasVisiveis = reactive({
    funcionario: true,
    cpf: true,
    projeto: true,
    saldo: true,
    acoes: true
  })

  const labelsColunas = {
    funcionario: 'Funcionário',
    cpf: 'CPF',
    projeto: 'Projeto',
    saldo: 'Saldo Atual',
    acoes: 'Ações'
  }

  const colunasTemp = reactive({ ...colunasVisiveis })

  const listaCompleta = ref<any[]>([])
  
  // Paginação Front-End
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const projetosAtivos = ref<any[]>([])
  const funcionariosAtivos = ref<any[]>([])

  const carregarCombos = async () => {
    try {
      const [resProj, resFunc] = await Promise.all([
        $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos'),
        $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
      ])
      projetosAtivos.value = resProj.data || []
      funcionariosAtivos.value = resFunc.data || []
    } catch (error) {
       console.error("Erro combos extrato funcionario", error)
    }
  }

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<{ status: string, data: any[] }>('/api/operacao/movimentacaoBancaria/extratoFuncionario/listagem', {
        method: 'POST', 
        body: {
          projeto: filtro.projetoParam,
          funcionarioId: filtro.funcionarioParam,
          termo: filtro.nomeParam
        }
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro listagem extrato funcionario', error)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => { modalFiltroAvancadoAberto.value = true }
  const aplicarFiltroAvancado = () => { modalFiltroAvancadoAberto.value = false; buscarLista() }
  const limparFiltrosAvancados = () => {
    filtro.projetoParam = ''
    filtro.funcionarioParam = ''
    modalFiltroAvancadoAberto.value = false
    buscarLista()
  }

  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  // Lógica do Modal de Extrato
  const modalExtratoAberto = ref(false)
  const funcionarioSelecionado = ref<number | undefined>(undefined)

  const abrirModalExtrato = (id: number) => {
    funcionarioSelecionado.value = id
    modalExtratoAberto.value = true
  }

  const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  onMounted(() => {
    carregarCombos()
    buscarLista()
  })

  return {
    carregando: carregandoTela,
    buscaRealizada,
    visaoAtual,
    filtro,
    placeholderDinamico,
    buscarLista,
    abrirModalFiltroAvancado,
    modalFiltroAvancadoAberto,
    limparFiltrosAvancados,
    aplicarFiltroAvancado,
    abrirModalExibicao,
    modalExibicaoAberto,
    colunas: colunasVisiveis,
    labels: labelsColunas,
    colunasTemp,
    aplicarExibicao,
    projetosAtivos,
    funcionariosAtivos,
    
    // Extrato
    modalExtratoAberto,
    funcionarioSelecionado,
    abrirModalExtrato,
    
    formatarMoeda,

    // Paginação
    dados: paginacao.listaPaginada,
    paginaAtual: paginacao.paginaAtual,
    itensPorPagina: paginacao.itensPorPagina,
    totalRegistros: paginacao.totalRegistros,
    totalPaginas: paginacao.totalPaginas,
    registroInicial: paginacao.registroInicial,
    registroFinal: paginacao.registroFinal,
    paginasExibidas: paginacao.paginasExibidas,
    mudarPagina: paginacao.mudarPagina,
    mudarItensPorPagina: paginacao.mudarItensPorPagina
  }
}
