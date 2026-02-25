<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:cog" class="mr-2" />
        Permissões do Usuário
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Login</label>
          <input v-model="filtro.login" type="text" placeholder="Digite o login..." class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Usuário</label>
          <input v-model="filtro.nomeUsuario" type="text" placeholder="Digite o nome..." class="w-full border rounded-md p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
          <input v-model="filtro.cpf" v-maska data-maska="###.###.###-##" type="text" placeholder="___.___.___-__" class="w-full border rounded-md p-2" />
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-end">
        <button @click="buscarUsuarios" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Filtrar</span>
          <Icon name="fa-solid:search" class="ml-2" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b">Login</th>
            <th class="p-3 border-b">Nome Login</th>
            <th class="p-3 border-b">CPF</th>
            <th class="p-3 border-b text-center">Histórico</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usuarios.length === 0">
            <td colspan="4" class="p-4 text-center text-gray-500 font-bold">Nenhum usuário encontrado</td>
          </tr>
          <tr v-for="user in usuarios" :key="user.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3">
              <NuxtLink :to="`/configuracao/permissaoUsuario/${user.codigo}`" class="text-blue-600 hover:underline">
                {{ user.login }}
              </NuxtLink>
            </td>
            <td class="p-3">{{ user.nomeUsuario }}</td>
            <td class="p-3">{{ user.cpf }}</td>
            <td class="p-3 text-center">
              <button @click="abrirHistorico(user.codigo)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:history" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :isOpen="modalHistoricoAberto" title="Histórico de alterações de Permissões" @close="modalHistoricoAberto = false">
      <div class="max-h-96 overflow-y-auto p-4">
        <div v-for="hist in historicoData" :key="hist.codigo" class="mb-4 border rounded">
          <div class="bg-gray-100 p-3 font-semibold border-b cursor-pointer flex justify-between">
            {{ hist.dataAlteracao }} - {{ hist.usuarioAlteracao }}
          </div>
          <div class="p-3">
            <p v-for="(alt, idx) in hist.alteracoes" :key="idx" class="font-bold mb-1">{{ alt }}</p>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Criei o estado reativo pro filtro
const filtroAberto = ref(true)
const filtro = ref({
  login: '',
  nomeUsuario: '',
  cpf: ''
})

// Defini as tipagens pra deixar o TypeScript safo
interface Usuario {
  codigo: number
  login: string
  nomeUsuario: string
  cpf: string
}

interface Historico {
  codigo: number
  dataAlteracao: string
  usuarioAlteracao: string
  alteracoes: string[]
}

const usuarios = ref<Usuario[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<Historico[]>([])

// Ajustei a chamada pra tipar o retorno da API. Isso mata o erro vermelho no 'data' e no template
const buscarUsuarios = async () => {
  try {
    const response = await $fetch<{ data: Usuario[] }>('/api/configuracao/permissaoUsuario/listagem', {
      method: 'POST',
      body: filtro.value
    })
    usuarios.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar usuários', error)
  }
}

// Fiz a mesma fita aqui no histórico, passando a tipagem correta
const abrirHistorico = async (usuarioId: number) => {
  try {
    const response = await $fetch<{ data: Historico[] }>('/api/configuracao/permissaoUsuario/historico', {
      method: 'POST',
      body: { usuarioId }
    })
    historicoData.value = response.data || []
    modalHistoricoAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar histórico', error)
  }
}

// Já puxo os dados assim que a tela abre
buscarUsuarios()
</script>