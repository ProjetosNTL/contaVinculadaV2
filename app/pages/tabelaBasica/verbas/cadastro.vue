<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:money-bill" 
      :links="[{ label: 'Verbas', to: '/tabelaBasica/verbas' }]"
      :paginaAtual="ehEdicao ? form.descricao || 'Editando Verba' : 'Nova Verba'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoDados" mensagem="Buscando dados da verba..." />

      <form v-if="!carregandoDados" @submit.prevent="gravar" class="space-y-10 relative z-0">
        <AppFormularioSecao icone="fa7-solid:clipboard-list">
          Definição da Verba Bancária
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
          <div class="md:col-span-3">
            <AppInputTexto v-model="form.codigoReferencia" label="Cód. Referência" placeholder="Ex: 100" type="number" required icone="fa7-solid:hashtag" />
          </div>
          <div class="md:col-span-6">
            <AppInputTexto v-model="form.descricao" label="Descrição da Verba" placeholder="Ex: Salários, Encargos..." required maxlength="255" icone="fa7-solid:font" />
          </div>
          <div class="md:col-span-3">
            <AppSelect 
              v-model="form.tipo" 
              label="Tipo de Verba" 
              placeholder="Selecione..." 
              :opcoes="[{ codigo: '1', descricao: 'Crédito (+)' }, { codigo: '0', descricao: 'Débito (-)' }]" 
              required 
            />
          </div>
          <div class="md:col-span-12">
            <div class="w-full">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Observações Adicionais <span class="text-red-500">*</span>
              </label>
              <textarea 
                v-model="form.observacao" 
                rows="4" 
                class="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/70 rounded-xl p-4 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400"
                placeholder="Descreva detalhes específicos desta verba..."
              ></textarea>
            </div>
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="ehEdicao" 
          :carregandoGravar="salvando"
          labelExcluir="Remover Verba"
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
      title="Atenção: Exclusão de Registro" 
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
          Remover Verba?
        </h4>
        
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
          Confirma a exclusão de <strong class="text-gray-800 dark:text-gray-200">{{ form.descricao }}</strong>? Esta ação não pode ser desfeita.
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalExclusao = false">
          Cancelar
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

const form = ref({
  codigo: registroId || '0',
  codigoReferencia: '',
  descricao: '',
  tipo: '',
  observacao: ''
})

const mostrarAlerta = (titulo: string, mensagem: string) => {
  modalAlertaTitulo.value = titulo
  modalAlertaMensagem.value = mensagem
  modalAlertaAberto.value = true
}

const buscarDados = async () => {
  if (ehEdicao.value) {
    carregandoDados.value = true
    try {
      const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/verbas/recupera', {
        method: 'POST',
        body: { id: registroId }
      })
      if (data) {
        form.value.codigoReferencia = data.codigoReferencia
        form.value.descricao = data.descricao
        form.value.tipo = data.tipo?.toString() || ''
        form.value.observacao = data.observacao
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      carregandoDados.value = false
    }
  }
}

const gravar = async () => {
  if (!form.value.codigoReferencia) return mostrarAlerta("Campo Obrigatório", "Informe o código de referência da verba.")
  if (!form.value.descricao) return mostrarAlerta("Campo Obrigatório", "Informe uma descrição clara para a verba.")
  if (form.value.tipo === '') return mostrarAlerta("Campo Obrigatório", "Selecione o tipo de transação (Crédito ou Débito).")
  if (!form.value.observacao) return mostrarAlerta("Campo Obrigatório", "Informe as observações necessárias.")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/verbas/gravar', {
      method: 'POST',
      body: form.value
    })
    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro ao Gravar", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao gravar dados:', error)
    mostrarAlerta("Erro Interno", "Falha inesperada ao salvar o registro.")
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = () => modalExclusao.value = true

const excluir = async () => {
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/verbas/excluir', {
      method: 'POST',
      body: { codigo: form.value.codigo }
    })
    if (res.status === 'success') {
      voltar()
    } else {
      mostrarAlerta("Erro ao Excluir", res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao excluir:', error)
    mostrarAlerta("Erro Interno", "Erro ao tentar remover o registro.")
  } finally {
    modalExclusao.value = false
  }
}

const novo = () => {
  router.push('/tabelaBasica/verbas/cadastro?id=0')
  form.value = { codigo: '0', codigoReferencia: '', descricao: '', tipo: '', observacao: '' }
}

const voltar = () => router.push('/tabelaBasica/verbas')

onMounted(() => {
  buscarDados()
})
</script>