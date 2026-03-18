import { ref, reactive, computed, onMounted } from 'vue'

export function usePermissaoUsuarioListagem() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive({
    login: '',
    nomeUsuario: '',
    cpf: ''
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const buscarUsuarios = async () => {
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/configuracao/permissaoUsuario/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = response.data || []
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar usuários', error)
    } finally {
      carregando.value = false
    }
  }

  const modalHistoricoAberto = ref(false)
  const historicoData = ref<any[]>([])
  const abrirHistorico = async (usuarioId: number) => {
    try {
      const response = await $fetch<any>('/api/configuracao/permissaoUsuario/historico', {
        method: 'POST',
        body: { usuarioId }
      })
      historicoData.value = response.data || []
      modalHistoricoAberto.value = true
    } catch (error) {
      console.error('Erro ao buscar histórico', error)
    }
  }

  onMounted(() => {
    buscarUsuarios()
  })

  return {
    carregando,
    buscaRealizada,
    visaoAtual,
    filtro,
    buscarUsuarios,
    modalHistoricoAberto,
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
