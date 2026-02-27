<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:university" class="mr-2" />
        Bancos
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Código do Banco</label>
          <input v-model="filtro.codigoBanco" type="number" placeholder="Digite o código..." class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Instituição</label>
          <input v-model="filtro.nomeBanco" type="text" placeholder="Digite o nome..." class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ativo</label>
          <select v-model="filtro.ativo" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option value="1">Sim</option>
            <option value="0">Não</option>
          </select>
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-between">
        <div class="flex gap-2">
          <button @click="novoRegistro" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
            <span>Novo</span>
            <Icon name="fa-solid:file" class="ml-2" />
          </button>
          <button @click="importarApi" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center">
            <span>Listar Bancos (API)</span>
            <Icon name="fa-solid:list" class="ml-2" />
          </button>
        </div>
        <button @click="buscarBancos" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Filtrar</span>
          <Icon name="fa-solid:search" class="ml-2" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b">Código do Banco</th>
            <th class="p-3 border-b">Instituição</th>
            <th class="p-3 border-b text-center">Ativo</th>
            <th class="p-3 border-b text-center">Histórico</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="bancos.length === 0">
            <td colspan="4" class="p-4 text-center text-gray-500 font-bold">Nenhum banco encontrado</td>
          </tr>
          <tr v-for="item in bancos" :key="item.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3">
              <NuxtLink :to="`/tabelaBasica/bancos/cadastro?id=${item.codigo}`" class="text-blue-600 hover:underline">
                {{ item.codigoBanco }}
              </NuxtLink>
            </td>
            <td class="p-3">{{ item.nomeBanco }}</td>
            <td class="p-3 text-center">
              <span :class="item.ativo === 1 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                {{ item.ativo === 1 ? 'Sim' : 'Não' }}
              </span>
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

    <AppModal :isOpen="modalHistoricoAberto" title="Histórico de alterações do Banco" @close="modalHistoricoAberto = false">
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
  codigoBanco: '',
  nomeBanco: '',
  ativo: '1'
})

const bancos = ref<any[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<any[]>([])

const buscarBancos = async () => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/tabelaBasica/bancos/listagem', {
      method: 'POST',
      body: filtro.value
    })
    bancos.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar bancos:', error)
  }
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/tabelaBasica/bancos/historico', {
      method: 'POST',
      body: { banco: id }
    })
    historicoData.value = response.data || []
    modalHistoricoAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
  }
}

const novoRegistro = () => router.push('/tabelaBasica/bancos/cadastro?id=0')
const importarApi = () => router.push('/tabelaBasica/bancos/importar')

buscarBancos()
</script>