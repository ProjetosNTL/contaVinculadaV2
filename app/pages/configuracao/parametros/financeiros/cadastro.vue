<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:percent" class="mr-2" />
        Parâmetros Financeiros - Cadastro
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto <span class="text-red-500">*</span></label>
          <select v-model="form.projeto" class="w-full border rounded-md p-2 bg-white">
            <option value="">Selecione um projeto...</option>
            <option v-for="proj in projetos" :key="proj.codigo" :value="proj.codigo">
              {{ proj.apelido }} - {{ proj.descricao }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dia do Pagamento <span class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.diaPagamento" @blur="validarDia" type="text" maxlength="2" placeholder="Ex: 05" class="w-full border rounded-md p-2 pl-10" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Décimo Terceiro <span class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:percent" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.decimoTerceiro" @input="formatarNumero('decimoTerceiro')" type="text" class="w-full border rounded-md p-2 pl-10" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Férias 1/3 <span class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:percent" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.ferias" @input="formatarNumero('ferias')" type="text" class="w-full border rounded-md p-2 pl-10" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Multa FGTS <span class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:percent" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.multaFgts" @input="formatarNumero('multaFgts')" type="text" class="w-full border rounded-md p-2 pl-10" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Submódulo <span class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:percent" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.submodulo" @input="formatarNumero('submodulo')" type="text" class="w-full border rounded-md p-2 pl-10" />
          </div>
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
const ehEdicao = computed(() => registroId !== '0' && registroId !== undefined && registroId !== '')

const salvando = ref(false)
const modalExclusao = ref(false)

const projetos = ref<any[]>([])

const form = ref({
  codigo: registroId || '0',
  projeto: '',
  diaPagamento: '',
  decimoTerceiro: '',
  ferias: '',
  multaFgts: '',
  submodulo: ''
})

const carregarDados = async () => {
  try {
    const projResponse = await $fetch<{ data: any[] }>('/api/tabelaBasica/projeto/listarAtivos')
    projetos.value = projResponse.data || []

    if (ehEdicao.value) {
      const { data } = await $fetch<{ data: any }>('/api/configuracao/parametros/financeiros/recupera', {
        method: 'POST',
        body: { id: registroId }
      })
      if (data) {
        form.value.projeto = data.projeto
        form.value.diaPagamento = String(data.diaPagamento).padStart(2, '0')
        form.value.decimoTerceiro = data.decimoTerceiro
        form.value.ferias = data.ferias
        form.value.multaFgts = data.multaFgts
        form.value.submodulo = data.submodulo
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
}

const formatarNumero = (campo: keyof typeof form.value) => {
  let valor = String(form.value[campo]).replace(/[^0-9.,]/g, "")
  form.value[campo] = valor
}

const validarDia = () => {
  let valor = form.value.diaPagamento.replace(/\D/g, "")
  if (valor.length === 1) {
    alert("Digite dois números (ex: 01).")
    form.value.diaPagamento = ""
    return
  }
  if (valor !== "") {
    let diaNum = parseInt(valor, 10)
    if (diaNum < 1 || diaNum > 31) {
      alert("O pagamento deve ser entre dia 01 e 31.")
      form.value.diaPagamento = ""
    } else {
      form.value.diaPagamento = valor
    }
  }
}

const gravar = async () => {
  if (!form.value.projeto) return alert("Informe o Projeto")
  if (!form.value.diaPagamento) return alert("Informe o Dia do Pagamento")
  if (!form.value.decimoTerceiro) return alert("Informe o Décimo Terceiro")
  if (!form.value.ferias) return alert("Informe a Férias 1/3 Constitucional")
  if (!form.value.multaFgts) return alert("Informe a Multa FGTS")
  if (!form.value.submodulo) return alert("Informe o Submódulo")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/configuracao/parametros/financeiros/gravar', {
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

const confirmarExclusao = () => {
  modalExclusao.value = true
}

const excluir = async () => {
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/configuracao/parametros/financeiros/excluir', {
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
    alert('Erro ao excluir.')
  }
}

const novo = () => {
  router.push('/configuracao/parametros/financeiros/cadastro?id=0')
  form.value = { codigo: '0', projeto: '', diaPagamento: '', decimoTerceiro: '', ferias: '', multaFgts: '', submodulo: '' }
}

const voltar = () => {
  router.push('/configuracao/parametros/financeiros')
}

carregarDados()
</script>