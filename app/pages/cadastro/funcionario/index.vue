<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm">
        <Icon name="fa7-solid:users" class="w-4 h-4 text-[#3276b1] dark:text-[#539ce0]" />
        <span>/</span>
        <span class="text-gray-800 dark:text-gray-200 font-semibold">Funcionários</span>
      </div>
      <NuxtLink 
        to="/cadastro/funcionario/detalhe"
        class="bg-[#3276b1] hover:bg-[#275b89] dark:bg-[#539ce0] dark:hover:bg-[#3276b1] text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm text-sm"
      >
        <Icon name="fa7-solid:plus" class="w-4 h-4" />
        Novo Funcionário
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
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nome Completo</label>
          <input v-model="filter.nomeParam" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">CPF</label>
          <input v-model="filter.cpfParam" v-maska data-maska="###.###.###-##" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Matrícula</label>
          <input v-model="filter.matriculaParam" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">E-mail</label>
          <input v-model="filter.emailParam" type="text" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status Ativo</label>
          <select v-model="filter.ativoParam" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
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
          class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
        >
          <Icon v-if="loading" name="fa7-solid:spinner" class="animate-spin w-4 h-4 text-gray-500 dark:text-gray-400" />
          <Icon v-else name="fa7-solid:magnifying-glass" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          Buscar
        </button>
      </div>
    </div>

    <!-- Tabela de Resultados -->
    <div class="flex-1 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] transition-colors duration-300">
      <div v-if="loading && !items.length" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 mb-4 text-[#3276b1] dark:text-[#539ce0]" />
        Buscando funcionários...
      </div>
      
      <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:folder-open" class="w-12 h-12 mb-3 opacity-50" />
        <p>Nenhum resultado encontrado.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left font-sans text-sm text-gray-700 dark:text-gray-300">
          <thead class="text-xs text-gray-600 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">Nome</th>
              <th scope="col" class="px-4 py-3 font-semibold">Projeto</th>
              <th scope="col" class="px-4 py-3 font-semibold">CPF</th>
              <th scope="col" class="px-4 py-3 font-semibold">Matrícula</th>
              <th scope="col" class="px-4 py-3 font-semibold">Email</th>
              <th scope="col" class="px-4 py-3 font-semibold">Status</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.codigo" class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <td class="px-4 py-3 font-medium text-[#3276b1] dark:text-[#539ce0]">
                <NuxtLink :to="`/cadastro/funcionario/detalhe?codigo=${item.codigo}`" class="hover:underline">{{ item.nomeCompleto }}</NuxtLink>
              </td>
              <td class="px-4 py-3">{{ item.projeto || '-' }}</td>
              <td class="px-4 py-3">{{ item.cpf }}</td>
              <td class="px-4 py-3">{{ item.matricula }}</td>
              <td class="px-4 py-3">{{ item.email }}</td>
              <td class="px-4 py-3">
                <span :class="item.ativo ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40' : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40'" class="px-2 py-1 rounded-sm text-xs font-semibold">
                  {{ item.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right flex justify-end">
                <NuxtLink :to="`/cadastro/funcionario/detalhe?codigo=${item.codigo}`" class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-1.5 rounded transition">
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
const items = ref<any[]>([])

const filter = reactive({
  nomeParam: '',
  cpfParam: '',
  matriculaParam: '',
  emailParam: '',
  projetoParam: '',
  ativoParam: '1'
})

const fetchList = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/cadastro/funcionario/filtro', {
      method: 'POST',
      body: filter
    })
    items.value = data?.results || []
  } catch (err: any) {
    console.error(err)
    alert('Erro ao buscar funcionários')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>
