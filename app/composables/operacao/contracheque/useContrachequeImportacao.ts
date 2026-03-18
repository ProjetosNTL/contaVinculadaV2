import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useContrachequeImportacao() {
  const router = useRouter()
  
  const form = reactive({
    ano: ''
  })
  
  const arquivoSelecionado = ref<File | null>(null)
  const ultimaImportacao = ref('')
  const importando = ref(false)
  const modalImportadosAberto = ref(false)

  const carregarUltimaImportacao = async () => {
    try {
      const { data } = await $fetch<any>('/api/operacao/contracheque/importacao/ultimaImportacao')
      ultimaImportacao.value = data || 'Nenhuma importação registrada'
    } catch (error) {
      console.error('Erro ao buscar última importação:', error)
    }
  }

  const aoSelecionarArquivo = (file: File) => {
    if (file.size > 1048576) {
      alert('Atenção: O arquivo ultrapassou o valor máximo permitido (1MB).')
      return false
    }
    
    // Check extension manually if needed, but AppInputFile should handle it via accept
    arquivoSelecionado.value = file
    return true
  }

  const importarArquivo = async () => {
    if (!form.ano) return alert('Informe o Mês/Ano de referência.')
    if (!arquivoSelecionado.value) return alert('É necessário selecionar um arquivo TXT.')

    importando.value = true
    const formData = new FormData()
    formData.append('ano', form.ano)
    formData.append('arquivo', arquivoSelecionado.value)

    try {
      const res = await $fetch<any>('/api/operacao/contracheque/importacao/upload', {
        method: 'POST',
        body: formData
      })

      if (res.status === 'success') {
        modalImportadosAberto.value = true
      } else {
        alert(res.mensagem || 'Erro ao importar.')
      }
    } catch (error) {
      alert('Erro ao realizar a importação do arquivo.')
    } finally {
      importando.value = false
    }
  }

  const irParaProcessamento = () => {
    modalImportadosAberto.value = false
    router.push('/operacao/contracheque/processamento') 
  }

  onMounted(() => {
    carregarUltimaImportacao()
  })

  return {
    form,
    arquivoSelecionado,
    ultimaImportacao,
    importando,
    modalImportadosAberto,
    aoSelecionarArquivo,
    importarArquivo,
    irParaProcessamento
  }
}
