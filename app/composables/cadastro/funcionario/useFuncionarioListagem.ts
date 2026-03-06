import { ref, reactive, computed } from 'vue'

export function useFuncionarioListagem() {
  const carregandoTela = ref(false)
  const buscaRealizada = ref(false)
  const visaoAtual = ref<'lista' | 'cards'>('lista')
  const modalHistoricoAberto = ref(false)
  const historicoSelecionado = ref<any[]>([])
  const carregandoHistorico = ref(false)
  const modalFiltroAvancadoAberto = ref(false)
  const projetosAtivos = ref<any[]>([])
  const modalExibicaoAberto = ref(false)

  const listaCompleta = ref<any[]>([])
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)
  const totalRegistros = computed(() => listaCompleta.value.length)
  const totalPaginas = computed(() => Math.ceil(totalRegistros.value / itensPorPagina.value))

  const filtro = reactive({
    nomeParam: '',
    cpfParam: '',
    matriculaParam: '',
    emailParam: '',
    projetoParam: '',
    ativoParam: '1'
  })

  const colunasVisiveis = reactive({
    cpf: true,
    matricula: true,
    projeto: true,
    status: true,
    historico: true
  })

  const paginasExibidas = computed(() => {
    const total = totalPaginas.value
    const atual = paginaAtual.value

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const paginas: (number | string)[] = []
    
    if (atual <= 4) {
      paginas.push(1, 2, 3, 4, 5, '...', total)
    } 
    else if (atual >= total - 3) {
      paginas.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } 
    else {
      paginas.push(1, '...', atual - 1, atual, atual + 1, '...', total)
    }

    return paginas
  })

  const colunasTemp = reactive({ ...colunasVisiveis })

  const registroInicial = computed(() => {
    if (totalRegistros.value === 0) return 0
    return ((paginaAtual.value - 1) * itensPorPagina.value) + 1
  })
  
  const registroFinal = computed(() => {
    const final = paginaAtual.value * itensPorPagina.value
    return final > totalRegistros.value ? totalRegistros.value : final
  })

  const filtrar = () => {
    paginaAtual.value = 1
    buscarLista()
  }

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas.value) {
      paginaAtual.value = novaPagina
    }
  }

  const mudarItensPorPagina = (quantidade: number) => {
    itensPorPagina.value = quantidade
    paginaAtual.value = 1
  }

  const sugestoesNome = ref<any[]>([])
  const mostrandoSugestoes = ref(false)
  const buscandoSugestoes = ref(false)
  let timerDebounce: ReturnType<typeof setTimeout>

  const buscarSugestoesNome = () => {
    const texto = filtro.nomeParam
    
    if (texto.length < 3) {
      sugestoesNome.value = []
      mostrandoSugestoes.value = false
      return
    }

    clearTimeout(timerDebounce)
    
    timerDebounce = setTimeout(async () => {
      buscandoSugestoes.value = true
      mostrandoSugestoes.value = true
      
      try {
        const resposta = await $fetch<any>(`/api/cadastro/funcionario/autocomplete?q=${texto}`)
        sugestoesNome.value = resposta?.data || [] 
      } catch (e) {
        console.error('Erro no autocomplete:', e)
      } finally {
        buscandoSugestoes.value = false
      }
    }, 400) 
  }

  const selecionarSugestao = (sugestao: any) => {
    filtro.nomeParam = sugestao.descricao
    mostrandoSugestoes.value = false
    filtrar()
  }

  const fecharSugestoesDelay = () => {
    setTimeout(() => {
      mostrandoSugestoes.value = false
    }, 200)
  }

  const destacarTexto = (texto: string, busca: string) => {
    if (!busca) return texto
    const regex = new RegExp(`(${busca})`, 'gi')
    return texto.replace(regex, '<span class="font-extrabold text-emerald-600 dark:text-emerald-400">$1</span>')
  }

  const listaRegistros = computed(() => {
    const inicio = (paginaAtual.value - 1) * itensPorPagina.value
    const fim = inicio + itensPorPagina.value
    return listaCompleta.value.slice(inicio, fim)
  })

  const buscarLista = async () => {
    carregandoTela.value = true
    buscaRealizada.value = true
    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/listagem', {
        method: 'POST',
        body: filtro
      })
      listaCompleta.value = data?.results || []
      paginaAtual.value = 1
    } catch (err: any) {
      console.error(err)
    } finally {
      carregandoTela.value = false
    }
  }

  const abrirModalFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = true
  }

  const limparFiltrosAvancados = () => {
    filtro.cpfParam = ''
    filtro.matriculaParam = ''
    filtro.emailParam = ''
    filtro.projetoParam = ''
    modalFiltroAvancadoAberto.value = false
    filtrar()
  }

  const aplicarFiltroAvancado = () => {
    modalFiltroAvancadoAberto.value = false
    filtrar()
  }

  const abrirModalExibicao = () => {
    Object.assign(colunasTemp, colunasVisiveis)
    modalExibicaoAberto.value = true
  }

  const aplicarExibicao = () => {
    Object.assign(colunasVisiveis, colunasTemp)
    modalExibicaoAberto.value = false
  }

  const abrirModalHistorico = async (codigo: number) => {
    modalHistoricoAberto.value = true
    carregandoHistorico.value = true
    historicoSelecionado.value = [] 

    try {
      const data = await $fetch<any>('/api/cadastro/funcionario/historico', {
        method: 'POST',
        body: { codigo }
      })
      
      if (data && data.status === 'success') {
        historicoSelecionado.value = data.data
      } else {
        console.error(data?.message || 'Erro ao carregar histórico')
      }
    } catch (err) {
      console.error('Falha na API de histórico:', err)
    } finally {
      carregandoHistorico.value = false
    }
  }

  const carregarProjetos = async () => {
    try {
      const data = await $fetch<any>('/api/cadastro/projeto/ativos')
      projetosAtivos.value = data?.data || data || []
    } catch (erro) {
      console.error('Erro ao buscar projetos para o filtro:', erro)
    }
  }

  return {
    carregandoTela,
    buscaRealizada,
    listaRegistros,
    filtro,
    sugestoesNome,
    mostrandoSugestoes,
    buscandoSugestoes,
    buscarSugestoesNome,
    selecionarSugestao,
    fecharSugestoesDelay,
    destacarTexto,
    buscarLista,
    visaoAtual,
    abrirModalFiltroAvancado,
    abrirModalExibicao,
    modalHistoricoAberto,
    historicoSelecionado,
    carregandoHistorico,
    abrirModalHistorico,
    modalFiltroAvancadoAberto,
    aplicarFiltroAvancado,
    projetosAtivos,
    carregarProjetos,
    modalExibicaoAberto,
    colunasVisiveis,
    limparFiltrosAvancados,
    colunasTemp,
    aplicarExibicao,
    paginaAtual,
    itensPorPagina,
    totalRegistros,
    totalPaginas,
    registroInicial,
    registroFinal,
    filtrar,
    mudarPagina,
    mudarItensPorPagina ,
    paginasExibidas
  }
}