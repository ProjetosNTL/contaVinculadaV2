import { ref, reactive, computed, onMounted } from 'vue'

export function useContrachequeProcessamento() {
  const carregando = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')

  const filtro = reactive({
    mesAno: '',
    projeto: '',
    funcionarioId: '',
    status: '2' // Pendentes por padrão
  })

  const listaCompleta = ref<any[]>([])
  const paginacao = usePaginacaoFrontEnd(listaCompleta, visaoAtual)

  const projetos = ref<any[]>([])
  const funcionarios = ref<any[]>([])
  const detalhesVerba = ref<any[]>([])
  const modalDetalhesAberto = ref(false)
  const modalInfoAberto = ref(false)

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

  const buscarProcessamentos = async () => {
    if (!filtro.mesAno) return alert("Informe o mês/ano no filtro.")
    
    carregando.value = true
    buscaRealizada.value = true
    try {
      const response = await $fetch<any>('/api/operacao/contracheque/processamento/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = (response.data || []).map((item: any) => ({ ...item, selecionado: true }))
      paginacao.mudarPagina(1)
    } catch (error) {
      console.error('Erro ao buscar contracheques:', error)
    } finally {
      carregando.value = false
    }
  }

  const marcarDesmarcarTodos = () => {
    const todosMarcados = paginacao.listaPaginada.value.filter(i => i.statusAprovacao === 2).every(i => i.selecionado)
    const novoEstado = !todosMarcados
    paginacao.listaPaginada.value.forEach(item => {
      if (item.statusAprovacao === 2) item.selecionado = novoEstado
    })
  }

  const processarContracheque = async (statusAprovacao: number) => {
    const matriculasSelecionadas = listaCompleta.value
      .filter(item => item.statusAprovacao === 2 && item.selecionado)
      .map(item => item.matricula)

    if (matriculasSelecionadas.length === 0) return alert("Selecione pelo menos um contracheque para processar.")

    carregando.value = true
    try {
      const res = await $fetch<any>('/api/operacao/contracheque/processamento/gravar', {
        method: 'POST',
        body: { 
          matriculas: matriculasSelecionadas,
          statusAprovacao: statusAprovacao 
        }
      })

      if (res.status === 'success') {
        filtro.status = statusAprovacao.toString()
        buscarProcessamentos()
      } else {
        alert(res.mensagem)
      }
    } catch (error) {
      alert('Erro ao processar contracheques.')
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
    buscarProcessamentos,
    projetos,
    funcionarios,
    detalhesVerba,
    modalDetalhesAberto,
    modalInfoAberto,
    abrirModalDetalhes,
    processarContracheque,
    marcarDesmarcarTodos,
    
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
