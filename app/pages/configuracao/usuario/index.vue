<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Icon name="fa7-solid:user" class="w-6 h-6 text-[#3276b1] dark:text-[#539ce0]" />
        Usuários
      </h1>
      <NuxtLink 
        to="/configuracao/usuario/detalhe"
        class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm"
      >
        <Icon name="fa7-solid:plus" class="w-4 h-4" />
        Novo
      </NuxtLink>
    </div>

    <!-- Filtro -->
    <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <Icon name="fa7-solid:filter" class="text-gray-500 dark:text-gray-400" />
        <h2 class="font-semibold text-gray-700 dark:text-gray-200">Filtros de Pesquisa</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Login</label>
          <input v-model="filter.login" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" placeholder="Digite o login..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nome do Usuário</label>
          <input v-model="filter.nome" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" placeholder="Digite o nome..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">CPF</label>
          <input v-model="filter.cpf" v-maska data-maska="###.###.###-##" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" placeholder="___.___.___-__" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status Ativo</label>
          <select v-model="filter.ativo" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
            <option value="" class="dark:bg-gray-800">Todos</option>
            <option value="1" class="dark:bg-gray-800">Ativo</option>
            <option value="0" class="dark:bg-gray-800">Inativo</option>
          </select>
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button 
          @click="fetchList"
          :disabled="loading"
          class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
        >
          <Icon v-if="loading" name="fa7-solid:spinner" class="animate-spin w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Icon v-else name="fa7-solid:magnifying-glass" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          Buscar
        </button>
      </div>
    </div>

    <!-- Tabela de Resultados -->
    <div class="flex-1 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] transition-colors duration-300">
      <div v-if="loading && !users.length" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 mb-4 text-[#3276b1] dark:text-[#539ce0]" />
        Buscando dados...
      </div>
      
      <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:folder-open" class="w-12 h-12 mb-3 opacity-50" />
        <p>Nenhum resultado encontrado.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left font-sans text-sm text-gray-700 dark:text-gray-300">
          <thead class="text-xs text-gray-600 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">Login</th>
              <th scope="col" class="px-4 py-3 font-semibold">Nome</th>
              <th scope="col" class="px-4 py-3 font-semibold">CPF</th>
              <th scope="col" class="px-4 py-3 font-semibold">Status</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.codigo" class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <td class="px-4 py-3 font-medium text-[#3276b1] dark:text-[#539ce0]"><NuxtLink :to="`/configuracao/usuario/detalhe?codigo=${user.codigo}`" class="hover:underline">{{ user.login }}</NuxtLink></td>
              <td class="px-4 py-3 text-gray-800 dark:text-gray-200">{{ user.nomeUsuario }}</td>
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ user.cpf }}</td>
              <td class="px-4 py-3">
                <span :class="user.ativo ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40' : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40'" class="px-2 py-1 rounded-sm text-xs font-semibold">
                  {{ user.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right flex justify-end">
                  <NuxtLink :to="`/configuracao/usuario/detalhe?codigo=${user.codigo}`" class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-1.5 rounded transition">
                    <Icon name="fa7-solid:pen-to-square" class="w-4 h-4 block" />
                  </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const loading = ref(false)
const users = ref<any[]>([])

const filter = reactive({
  login: '',
  nome: '',
  cpf: '',
  ativo: '1'
})

const fetchList = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/configuracao/usuario/filtro', {
      method: 'POST',
      body: filter
    })
    users.value = data?.results || []
  } catch (err: any) {
    console.error(err)
    alert('Erro ao buscar usuários')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>
