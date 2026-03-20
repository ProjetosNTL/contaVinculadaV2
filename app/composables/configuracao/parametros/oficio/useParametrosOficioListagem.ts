import { ref, reactive, computed, onMounted } from 'vue'

export function useParametrosOficioListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive({
    projetoNome: '',
    comSaldo: ''
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  // Controle de colunas e Exibição
  const colunasVisiveis = reactive({
    projeto: true,
    comSaldo: true,
    historico: true
  })
  const colunasTemp = reactive({ ...colunasVisiveis })
  const labelsColunas = {
    projeto: 'Nome do Projeto',
    comSaldo: 'Contém Saldo',
    historico: 'Histórico de Alterações'
  }
  const modalExibicaoAberto = ref(false)
  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }
  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  // Filtros Avançados
  const modalFiltroAvancadoAberto = ref(false)
  const abrirModalFiltroAvancado = () => modalFiltroAvancadoAberto.value = true
  const limparFiltrosAvancados = () => {
    Object.assign(filtro, { projetoNome: '', comSaldo: '' })
    buscarLista()
  }
  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    buscarLista()
  }

  const buscarLista = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/listagem', {
        method: 'POST', body: filtro
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar ofícios', error)
    } finally {
      carregando.value = false
    }
  }

  // Histórico
  const modalHistoricoAberto = ref(false)
  const carregandoHistorico = ref(false)
  const historicoData = ref<any[]>([])
  const abrirHistorico = async (id: number) => {
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/parametros/oficio/historico', {
        method: 'POST', body: { parametroOficio: id }
      })
      
      // Mapeamento para o padrão esperado pelo componente AppModalHistorico
      historicoData.value = (response.data || []).map((item: any) => ({
        ...item,
        usuario: item.usuarioAlteracao,
        dataHora: item.dataAlteracao,
        alteracoes: (item.alteracoes || []).map((alt: any) => {
          if (typeof alt === 'string') return { mensagem: alt }
          return alt
        })
      }))
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    } finally {
      carregandoHistorico.value = false
    }
  }

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarLista,
    
    // Filtros e Exibição
    modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
    modalExibicaoAberto, abrirModalExibicao, aplicarExibicao,
    colunas: colunasVisiveis, colunasTemp, labels: labelsColunas,
    
    // Histórico
    modalHistoricoAberto,
    carregandoHistorico,
    historicoData,
    abrirHistorico,



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
