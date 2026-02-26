<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:briefcase" class="mr-2" />
        Projetos
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
          <input v-model="filtro.projetoId" type="text" placeholder="Código..." class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
          <input v-model="filtro.apelido" type="text" placeholder="Apelido..." class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
          <input v-model="filtro.cnpj" v-maska data-maska="##.###.###/####-##" type="text" placeholder="__.___.___/____-__" class="w-full border rounded-md p-2" />
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
        <button @click="novoRegistro" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Novo</span>
          <Icon name="fa-solid:file" class="ml-2" />
        </button>
        <button @click="buscarProjetos" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
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
            <th class="p-3 border-b">CNPJ</th>
            <th class="p-3 border-b text-center">Contas</th>
            <th class="p-3 border-b text-center">Verbas</th>
            <th class="p-3 border-b text-center">Ativo</th>
            <th class="p-3 border-b text-center">Histórico</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="projetos.length === 0">
            <td colspan="6" class="p-4 text-center text-gray-500 font-bold">Nenhum projeto encontrado</td>
          </tr>
          <tr v-for="item in projetos" :key="item.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3">
              <NuxtLink :to="`/cadastro/projeto/cadastro?id=${item.codigo}`" class="text-blue-600 hover:underline">
                {{ item.apelido }} - {{ item.descricao }}
              </NuxtLink>
            </td>
            <td class="p-3">{{ item.cnpj }}</td>
            <td class="p-3 text-center">
              <button @click="abrirModalConta(item.codigo)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:university" />
              </button>
            </td>
            <td class="p-3 text-center">
              <button @click="abrirModalVerba(item.codigo)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:list" />
              </button>
            </td>
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

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const filtroAberto = ref(true)

const filtro = ref({ projetoId: '', apelido: '', cnpj: '', ativo: '1' })
const projetos = ref<any[]>([])

const buscarProjetos = async () => {
  try {
    const res = await $fetch<{ data: any[] }>('/api/cadastro/projeto/listagem', {
      method: 'POST',
      body: filtro.value
    })
    projetos.value = res.data || []
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
  }
}

const abrirModalConta = (id: number) => { /* Lógica da Modal */ }
const abrirModalVerba = (id: number) => { /* Lógica da Modal */ }
const abrirHistorico = (id: number) => { /* Lógica do Histórico */ }

const novoRegistro = () => router.push('/cadastro/projeto/cadastro?id=0')

buscarProjetos()
</script>