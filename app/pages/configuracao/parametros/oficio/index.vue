<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:file-alt" class="mr-2" />
        Parâmetros de Ofício
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
          <input v-model="filtro.projetoNome" type="text" placeholder="Digite o projeto..." class="w-full border rounded-md p-2" />
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-between">
        <button @click="novoRegistro" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Novo</span>
          <Icon name="fa-solid:file" class="ml-2" />
        </button>
        <button @click="buscarOficios" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Filtrar</span>
          <Icon name="fa-solid:search" class="ml-2" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b">Projeto</th>
            <th class="p-3 border-b text-center">Histórico</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="oficios.length === 0">
            <td colspan="2" class="p-4 text-center text-gray-500 font-bold">Nenhum parâmetro de ofício encontrado</td>
          </tr>
          <tr v-for="item in oficios" :key="item.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3">
              <NuxtLink :to="`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`" class="text-blue-600 hover:underline">
                {{ item.apelido }} - {{ item.projeto }}
              </NuxtLink>
            </td>
            <td class="p-3 text-center">
              <button @click="abrirHistorico(item.codigo)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:history" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :isOpen="modalHistoricoAberto" title="Histórico de alterações do Ofício" @close="modalHistoricoAberto = false">
      <div class="max-h-96 overflow-y-auto p-4">
        <div v-for="hist in historicoData" :key="hist.codigo" class="mb-4 border rounded">
          <div class="bg-gray-100 p-3 font-semibold border-b cursor-pointer flex justify-between">
            {{ hist.dataAlteracao }} - {{ hist.usuarioAlteracao }}
          </div>
          <div class="p-3">
            <p v-for="(alt, idx) in hist.alteracoes" :key="idx" class="font-bold mb-1" v-html="alt"></p>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const filtroAberto = ref(true)

const filtro = ref({
  projetoNome: ''
})

interface Oficio {
  codigo: number
  projeto: string
  apelido: string
}

interface Historico {
  codigo: number
  dataAlteracao: string
  usuarioAlteracao: string
  alteracoes: string[]
}

const oficios = ref<Oficio[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<Historico[]>([])

const buscarOficios = async () => {
  try {
    const response = await $fetch<{ data: Oficio[] }>('/api/configuracao/parametros/oficio/listagem', {
      method: 'POST',
      body: filtro.value
    })
    oficios.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar ofícios', error)
  }
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: Historico[] }>('/api/configuracao/parametros/oficio/historico', {
      method: 'POST',
      body: { parametroOficio: id }
    })
    historicoData.value = response.data || []
    modalHistoricoAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar histórico', error)
  }
}

const novoRegistro = () => {
  router.push('/configuracao/parametros/oficio/cadastro?id=0')
}

buscarOficios()
</script>