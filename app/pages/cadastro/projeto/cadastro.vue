<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:briefcase" class="mr-2" />
        Projeto - Cadastro
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2">Dados Gerais</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ <span class="text-red-500">*</span></label>
          <input v-model="form.cnpj" v-maska data-maska="##.###.###/####-##" type="text" class="w-full border rounded-md p-2" @blur="verificarCnpj" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Apelido/Sigla <span class="text-red-500">*</span></label>
          <input v-model="form.apelido" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição <span class="text-red-500">*</span></label>
          <input v-model="form.descricao" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social <span class="text-red-500">*</span></label>
          <input v-model="form.razaoSocial" type="text" class="w-full border rounded-md p-2" />
        </div>
      </div>

      <h2 class="text-lg font-semibold mt-6 mb-4 border-b pb-2">Endereço</h2>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">CEP <span class="text-red-500">*</span></label>
          <input v-model="form.cep" v-maska data-maska="#####-###" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro <span class="text-red-500">*</span></label>
          <input v-model="form.logradouro" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Número <span class="text-red-500">*</span></label>
          <input v-model="form.numeroEndereco" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">UF <span class="text-red-500">*</span></label>
          <select v-model="form.uf" class="w-full border rounded-md p-2 bg-white">
            <option value="RJ">RJ</option>
            <option value="SP">SP</option>
            <option value="MG">MG</option>
            </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
          <input v-model="form.complemento" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Bairro <span class="text-red-500">*</span></label>
          <input v-model="form.bairro" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Cidade <span class="text-red-500">*</span></label>
          <input v-model="form.cidade" type="text" class="w-full border rounded-md p-2" />
        </div>
      </div>

      <h2 class="text-lg font-semibold mt-6 mb-4 border-b pb-2">Parâmetros</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nº Funcionários</label>
          <input v-model="form.numeroFuncionarios" type="number" class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Faturamento</label>
          <input v-model="form.valorFaturamento" type="text" class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cálculo <span class="text-red-500">*</span></label>
          <select v-model="form.tipoDeCalculo" class="w-full border rounded-md p-2 bg-white">
            <option value="1">Vencimento</option>
            <option value="2">Extra</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Saldo Ofício <span class="text-red-500">*</span></label>
          <select v-model="form.saldoOficio" class="w-full border rounded-md p-2 bg-white">
            <option value="1">Sim</option>
            <option value="0">Não</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button v-if="ehEdicao" @click="excluir" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Excluir <Icon name="fa-solid:trash" class="ml-1" />
      </button>
      <button @click="gravar" :disabled="salvando" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {{ salvando ? 'Aguarde...' : 'Gravar' }} <Icon v-if="!salvando" name="fa-solid:save" class="ml-1" />
      </button>
      <button @click="router.push('/cadastro/projeto')" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Retornar <Icon name="fa-solid:backward" class="ml-1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()

const registroId = route.query.id as string
const ehEdicao = computed(() => registroId !== '0' && !!registroId)

const salvando = ref(false)

const form = ref({
  codigo: registroId || '0',
  cnpj: '', apelido: '', descricao: '', razaoSocial: '',
  cep: '', logradouro: '', numeroEndereco: '', complemento: '', bairro: '', cidade: '', uf: '',
  numeroContrato: '', dataAssinatura: '', numeroFuncionarios: '', valorFaturamento: '',
  tipoDeCalculo: '', saldoOficio: '', contaVinculada: '0', dataContaVinculada: '',
  contas: [] as any[], verbas: [] as any[]
})

const carregarDados = async () => {
  if (ehEdicao.value) {
    try {
      const { data } = await $fetch<{ data: any }>('/api/cadastro/projeto/recupera', {
        method: 'POST',
        body: { id: registroId }
      })
      if (data) {
        Object.assign(form.value, data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }
}

const verificarCnpj = async () => {
  if (!form.value.cnpj || ehEdicao.value) return
  try {
    const res = await $fetch<{ status: string }>('/api/cadastro/projeto/verificaCnpj', {
      method: 'POST', body: { cnpj: form.value.cnpj }
    })
    if (res.status === 'success') {
      alert("Atenção: Já existe projeto com o CNPJ cadastrado.")
      form.value.cnpj = ''
    }
  } catch (error) {
    console.error('Erro ao verificar CNPJ:', error)
  }
}

const gravar = async () => {
  if (!form.value.apelido || !form.value.descricao || !form.value.cnpj) {
    return alert("Preencha os campos obrigatórios (CNPJ, Apelido e Descrição).")
  }

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/cadastro/projeto/gravar', {
      method: 'POST',
      body: form.value
    })
    if (res.status === 'success') {
      alert('Operação realizada com sucesso!')
      router.push('/cadastro/projeto')
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao gravar dados:', error)
    alert('Erro ao gravar projeto.')
  } finally {
    salvando.value = false
  }
}

const excluir = async () => {
  if(!confirm('Tem certeza que deseja excluir o projeto?')) return
  try {
    await $fetch('/api/cadastro/projeto/excluir', {
      method: 'POST', body: { codigo: form.value.codigo }
    })
    alert('Projeto excluído com sucesso!')
    router.push('/cadastro/projeto')
  } catch (error) {
    console.error('Erro ao excluir:', error)
    alert('Erro ao excluir projeto.')
  }
}

carregarDados()
</script>