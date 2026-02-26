<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:file-text" class="mr-2" />
        Parâmetros de Ofício - Cadastro
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto <span class="text-red-500">*</span></label>
          <select v-model="form.projeto" @change="buscarModeloPadrao" class="w-full border rounded-md p-2 bg-white">
            <option value="">Selecione um projeto...</option>
            <option v-for="proj in projetos" :key="proj.codigo" :value="proj.codigo">
              {{ proj.apelido }} - {{ proj.descricao }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4">
         <label class="block text-sm font-medium text-gray-700 mb-1">Redação do Ofício <span class="text-red-500">*</span></label>
         <textarea v-model="form.texto" rows="12" class="w-full border rounded-md p-2" placeholder="Digite a redação do ofício..."></textarea>
      </div>
      
      <div class="mt-4">
          <p class="text-sm text-gray-600"><strong>Dica:</strong> Utilize as variáveis abaixo para preenchimento automático no PDF:</p>
          <p class="text-xs text-gray-500 mt-1">
            $nomeOrgao$, $cnpj$, $enderecoCompleto$, $numContrato$, $numeroOficio$, $anoOficio$, $assunto$, $periodoReferencia$, $valor$, $valorExtenso$, $cidadeData$
          </p>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button v-if="ehEdicao" @click="confirmarExclusao" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Excluir <Icon name="fa-solid:trash" class="ml-1" />
      </button>
      <button @click="gravar" :disabled="salvando" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {{ salvando ? 'Aguarde...' : 'Gravar' }} <Icon v-if="!salvando" name="fa-solid:save" class="ml-1" />
      </button>
      <button @click="novo" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Novo <Icon name="fa-solid:file" class="ml-1" />
      </button>
      <button @click="voltar" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Retornar <Icon name="fa-solid:backward" class="ml-1" />
      </button>
    </div>

    <AppModal :isOpen="modalExclusao" title="Atenção" @close="modalExclusao = false">
      <div class="p-4 text-center">
        <p class="text-lg mb-6">Tem certeza que deseja excluir este registro?</p>
        <div class="flex justify-center gap-4">
          <button @click="excluir" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Sim, Excluir</button>
          <button @click="modalExclusao = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()

// Puxando o ID via query na URL (?id=123)
const registroId = route.query.id as string
const ehEdicao = computed(() => registroId !== '0' && registroId !== undefined && registroId !== '')

const salvando = ref(false)
const modalExclusao = ref(false)

const projetos = ref<any[]>([])

const form = ref({
  codigo: registroId || '0',
  projeto: '',
  texto: ''
})

const carregarDados = async () => {
  try {
    const projResponse = await $fetch<{ data: any[] }>('/api/tabelaBasica/projeto/listarAtivos')
    projetos.value = projResponse.data || []

    if (ehEdicao.value) {
      const { data } = await $fetch<{ data: any }>('/api/configuracao/parametros/oficio/recupera', {
        method: 'POST',
        body: { id: registroId }
      })
      if (data) {
        form.value.projeto = data.projeto
        form.value.texto = data.texto
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados', error)
  }
}

// Busca a redação padrão quando seleciona um projeto novo
const buscarModeloPadrao = async () => {
    if(!form.value.projeto || ehEdicao.value) return;
    
    try {
        const { data } = await $fetch<{ data: any }>('/api/configuracao/parametros/oficio/recuperaModelo', {
            method: 'POST',
            body: { projeto: form.value.projeto }
        });
        if(data && data.texto) {
            form.value.texto = data.texto;
        }
    } catch (error) {
        console.error('Erro ao buscar modelo padrão', error)
    }
}

const gravar = async () => {
  if (!form.value.projeto) return alert("Informe o Projeto")
  if (!form.value.texto) return alert("A redação não pode estar vazia")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/configuracao/parametros/oficio/gravar', {
      method: 'POST',
      body: form.value
    })
    if (res.status === 'success') {
      alert('Operação realizada com sucesso!')
      voltar()
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    alert('Erro ao gravar dados.')
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = () => {
  modalExclusao.value = true
}

const excluir = async () => {
  try {
    await $fetch('/api/configuracao/parametros/oficio/excluir', {
      method: 'POST',
      body: { codigo: form.value.codigo }
    })
    alert('Registro excluído com sucesso!')
    voltar()
  } catch (error) {
    alert('Erro ao excluir.')
  }
}

const novo = () => {
  router.push('/configuracao/parametros/oficio/cadastro?id=0')
  form.value = { codigo: '0', projeto: '', texto: '' }
}

const voltar = () => {
  router.push('/configuracao/parametros/oficio')
}

carregarDados()
</script>