<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:pen-to-square" 
      :links="[{ label: 'Lançamentos', to: '/tabelaBasica/lancamento' }]"
      :paginaAtual="ehEdicao ? form.descricao || 'Editando Lançamento' : 'Novo Lançamento'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoDados" mensagem="Buscando dados do lançamento..." />

      <form v-if="!carregandoDados" @submit.prevent="gravar" class="space-y-10 relative z-0">
        <AppFormularioSecao icone="fa7-solid:file-pen">
          Configuração de Tipo de Lançamento
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
          <div class="md:col-span-12">
            <AppInputTexto 
              v-model="form.descricao" 
              label="Descrição do Lançamento" 
              placeholder="Digite o nome ou descrição do tipo de lançamento..." 
              required 
              maxlength="255" 
              icone="fa7-solid:font"
              @input="formatarDescricao"
            />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          labelExcluir="Remover Lançamento"
          iconeExcluir="fa7-solid:trash-can"
          @voltar="voltar"
          @excluir="confirmarExclusao"
          @limpar="novo"
          @gravar="gravar"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal de Exclusão (Padrão) -->
    <AppModal 
      :isOpen="modalExclusao" 
      title="Atenção: Confirmar Exclusão" 
      icon="fa7-solid:triangle-exclamation"
      @close="modalExclusao = false"
    >
      <div class="flex flex-col items-center py-4 text-center">
        <div class="relative mb-6">
          <div class="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
          <div class="relative w-20 h-20 bg-gradient-to-tr from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-full flex items-center justify-center shadow-xl">
            <Icon name="fa7-solid:trash-can" class="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-3">
          Deseja Excluir?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Esta ação é irreversível. O lançamento <strong class="text-gray-800 dark:text-gray-200">{{ form.descricao }}</strong> será removido permanentemente.
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusao = false">
          Não, Manter
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:trash-can" @click="excluir">
          Sim, Excluir Agora
        </AppBotao>
      </template>
    </AppModal>

    <!-- Modal de Alerta -->
    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="modalAlertaAberto = false"
    >
      <div class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 text-amber-900 dark:text-amber-200">
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

const route = useRoute()
const router = useRouter()

const registroId = route.query.id as string
const ehEdicao = computed(() => registroId !== '0' && !!registroId)

const salvando = ref(false)
const carregandoDados = ref(false)
const modalExclusao = ref(false)

const modalAlertaAberto = ref(false)
const modalAlertaTitulo = ref('')
const modalAlertaMensagem = ref('')

const form = ref({ codigo: registroId || '0', descricao: '' })

const mostrarAlerta = (titulo: string, mensagem: string) => {
  modalAlertaTitulo.value = titulo
  modalAlertaMensagem.value = mensagem
  modalAlertaAberto.value = true
}

const buscarDados = async () => {
  if (ehEdicao.value) {
    carregandoDados.value = true
    try {
      const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/lancamento/recupera', {
        method: 'POST', body: { id: registroId }
      })
      if (data) form.value.descricao = data.descricao
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      carregandoDados.value = false
    }
  }
}

const formatarDescricao = () => {
  let valorLimpo = form.value.descricao
    .replace(/[^a-zA-ZÀ-ÿ\s']/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
  
  form.value.descricao = valorLimpo
}

const gravar = async () => {
  if (!form.value.descricao) return mostrarAlerta("Campo Obrigatório", "Por favor, informe uma descrição para o lançamento.")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/lancamento/gravar', {
      method: 'POST', body: form.value
    })
    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro ao Gravar", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao gravar dados:', error)
    mostrarAlerta("Erro Interno", "Falha inesperada ao tentar salvar.")
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = () => modalExclusao.value = true

const excluir = async () => {
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/lancamento/excluir', {
      method: 'POST', body: { codigo: form.value.codigo }
    })
    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro ao Excluir", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao excluir:', error)
    mostrarAlerta("Erro Interno", "Erro de rede ao excluir registro.")
  } finally {
    modalExclusao.value = false
  }
}

const novo = () => {
  router.push('/tabelaBasica/lancamento/cadastro?id=0')
  form.value = { codigo: '0', descricao: '' }
}

const voltar = () => router.push('/tabelaBasica/lancamento')

onMounted(() => {
  buscarDados()
})
</script>