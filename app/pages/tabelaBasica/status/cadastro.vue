<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:spinner" class="mr-2" />
        Status - Cadastro
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição <span class="text-red-500">*</span></label>
          <input v-model="form.descricao" type="text" maxlength="255" class="w-full border rounded-md p-2" />
        </div>
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

const registroId = route.query.id as string
const ehEdicao = computed(() => registroId !== '0' && !!registroId)

const salvando = ref(false)
const modalExclusao = ref(false)

const form = ref({
  codigo: registroId || '0',
  descricao: ''
})

const carregarDados = async () => {
  if (ehEdicao.value) {
    try {
      const { data } = await $fetch<{ data: any }>('/api/tabelaBasica/status/recupera', {
        method: 'POST',
        body: { id: registroId }
      })
      if (data) {
        form.value.descricao = data.descricao
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }
}

const gravar = async () => {
  if (!form.value.descricao) return alert("Informe a Descrição.")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/status/gravar', {
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
    console.error('Erro ao gravar dados:', error)
    alert('Erro ao gravar dados.')
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = () => modalExclusao.value = true

const excluir = async () => {
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/status/excluir', {
      method: 'POST',
      body: { codigo: form.value.codigo }
    })
    if (res.status === 'success') {
      alert('Registro excluído com sucesso!')
      voltar()
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao excluir:', error)
    alert('Erro ao excluir registro.')
  }
}

const novo = () => {
  router.push('/tabelaBasica/status/cadastro?id=0')
  form.value = { codigo: '0', descricao: '' }
}

const voltar = () => router.push('/tabelaBasica/status')

carregarDados()
</script>