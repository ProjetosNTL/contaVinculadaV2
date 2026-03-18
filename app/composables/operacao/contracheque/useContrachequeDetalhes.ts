import { ref, reactive, computed, onMounted } from 'vue'

export function useContrachequeDetalhes() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive({
    mesAno: '',
    projeto: '',
    funcionarioId: '',
    status: '' 
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const projetos = ref<any[]>([])
  const funcionarios = ref<any[]>([])
  const detalhesVerba = ref<any[]>([])
  const modalDetalhesAberto = ref(false)

  const carregarCombos = async () => {
    try {
      const [resProj, resFunc] = await Promise.all([
        $fetch<any>('/api/cadastro/projeto/ativos'),
        $fetch<any>('/api/cadastro/funcionario/ativos')
      ])
      projetos.value = resProj.data || []
      funcionarios.value = resFunc.data || []
    } catch (e) {
      console.error('Erro ao carregar combos:', e)
    }
  }

  const buscarRegistros = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/detalhes/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar contracheques:', error)
    } finally {
      carregando.value = false
    }
  }

  const abrirModalDetalhes = async (id: number) => {
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/processamento/detalhes', {
        method: 'POST',
        body: { codigoContracheque: id }
      })
      detalhesVerba.value = response.data || []
      modalDetalhesAberto.value = true
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
    }
  }

  onMounted(() => {
    carregarCombos()
  })

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarRegistros,
    projetos,
    funcionarios,
    detalhesVerba,
    modalDetalhesAberto,
    abrirModalDetalhes,
    
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
