import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export function useParametrosOficioPadrao() {
  const router = useRouter()
  
  const carregandoTela = ref(false)
  const salvando = ref(false)

  const erros = ref(new Set<string>())
  const modalAlertaAberto = ref(false)
  const modalAlertaTitulo = ref('')
  const modalAlertaMensagem = ref('')
  const modalSucessoAberto = ref(false)

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    modalAlertaTitulo.value = titulo
    modalAlertaMensagem.value = mensagem
    modalAlertaAberto.value = true
  }

  const fecharModalAlerta = () => {
    modalAlertaAberto.value = false
  }

  const padrao = reactive({ tipoSaldo: '1', texto: '' })

  const variaveis = [
    { codigo: '$cidadeData$', desc: 'Cidade/Data' },
    { codigo: '$nomeOrgao$', desc: 'Nome do Órgão' },
    { codigo: '$enderecoCompleto$', desc: 'Endereço' },
    { codigo: '$numContrato$', desc: 'Nº Contrato' },
    { codigo: '$numeroOficio$', desc: 'Nº Ofício' },
    { codigo: '$anoOficio$', desc: 'Ano Atual' },
    { codigo: '$assunto$', desc: 'Assunto' },
    { codigo: '$cnpj$', desc: 'CNPJ' },
    { codigo: '$periodoReferencia$', desc: 'Mês/Ano' },
    { codigo: '$signatarioNome$', desc: 'Quem assina' },
    { codigo: '$setor$', desc: 'Setor Resp.' },
    { codigo: '$valor$', desc: 'Valor (R$)' },
    { codigo: '$valorExtenso$', desc: 'Valor Extenso' }
  ]

  const carregarModelo = async () => {
    carregandoTela.value = true
    try {
      const res = await $fetch<any>('/api/configuracao/parametros/oficio/recuperaModelo', {
        method: 'POST',
        body: { tipoSaldo: Number(padrao.tipoSaldo) }
      })
      
      await new Promise(resolve => setTimeout(resolve, 500))

      padrao.texto = res.data || ''
    } catch (error) {
      console.error('Erro ao buscar modelo padrão', error)
      padrao.texto = ''
      mostrarAlerta('Erro de Comunicação', 'Falha ao processar Sincronismo da base Matriz.')
    } finally {
      carregandoTela.value = false
    }
  }

  const gravar = async () => {
    erros.value.clear()
    if (!padrao.texto || padrao.texto.trim() === '') erros.value.add('texto')

    if (erros.value.size > 0) {
      mostrarAlerta('Formatação Necessária', 'A matriz de texto do Ofício nunca deve ficar vazia.')
      return
    }

    salvando.value = true
    try {
      const res = await $fetch<any>('/api/configuracao/parametros/oficio/gravarPadrao', {
        method: 'POST',
        body: padrao
      })
      if (res.status === 'success') {
        modalSucessoAberto.value = true
      } else {
        mostrarAlerta('Bloqueio no Banco', res.mensagem || 'Falha de gravação sistêmica desconhecida.')
      }
    } catch (error) {
      mostrarAlerta('Erro Server API', "Erro de postagem Http impediu que a matriz padrão fosse confirmada.")
    } finally {
      salvando.value = false
    }
  }

  const copiarVariavel = (texto: string) => {
    navigator.clipboard.writeText(texto)
  }

  const voltar = () => {
    router.push('/configuracao/parametros/oficio')
  }

  watch(() => padrao.tipoSaldo, () => {
    carregarModelo()
  })

  onMounted(() => {
    carregarModelo()
  })

  return {
    carregandoTela,
    salvando,
    padrao,
    variaveis,
    erros,
    modalAlertaAberto,
    modalAlertaTitulo,
    modalAlertaMensagem,
    modalSucessoAberto,
    fecharModalAlerta,
    carregarModelo,
    gravar,
    copiarVariavel,
    voltar
  }
}
