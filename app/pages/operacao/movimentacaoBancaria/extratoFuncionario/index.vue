<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:print" class="mr-2" />
        Extrato Funcionário
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
          <select v-model="filtro.funcionarioId" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option v-for="func in funcionarios" :key="func.codigo" :value="func.codigo">
              {{ func.nomeCompleto }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
          <select v-model="filtro.projeto" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option v-for="proj in projetos" :key="proj.codigo" :value="proj.codigo">
              {{ proj.apelido }} - {{ proj.descricao }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-between">
        <button @click="router.push('/operacao/movimentacaoBancaria/extratoProjeto')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Extrato Projeto</span>
        </button>
        <button @click="buscarSaldos" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Filtrar</span>
          <Icon name="fa-solid:search" class="ml-2" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b">Funcionário</th>
            <th class="p-3 border-b">CPF</th>
            <th class="p-3 border-b text-center">Projeto</th>
            <th class="p-3 border-b text-center">Saldo</th>
            <th class="p-3 border-b text-center">Extrato Funcionário</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="lista.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500 font-bold">Nenhum funcionário encontrado</td>
          </tr>
          <tr v-for="item in lista" :key="item.codigoFuncionario" class="hover:bg-gray-50 border-b">
            <td class="p-3">{{ item.nomeCompleto }}</td>
            <td class="p-3">{{ item.cpf }}</td>
            <td class="p-3 text-center">{{ item.apelido }} - {{ item.projeto }}</td>
            <td class="p-3 text-center text-lg font-bold" :class="item.saldo >= 0 ? 'text-green-600' : 'text-red-600'">
              R$ {{ formatarMoeda(item.saldo) }}
            </td>
            <td class="p-3 text-center">
              <button @click="abrirModalExtrato(item.codigoFuncionario)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:history" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ExtratoFuncionarioModal 
      :isOpen="modalExtratoAberto" 
      :funcionarioId="funcionarioSelecionado" 
      @close="modalExtratoAberto = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const filtroAberto = ref(true)

const filtro = ref({ projeto: '', funcionarioId: '' })
const lista = ref<any[]>([])
const projetos = ref<any[]>([])
const funcionarios = ref<any[]>([])

const modalExtratoAberto = ref(false)
const funcionarioSelecionado = ref<number | undefined>(undefined)

const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const carregarCombos = async () => {
  try {
    const resProj = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos')
    projetos.value = resProj.data || []
    
    const resFunc = await $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
    funcionarios.value = resFunc.data || []
  } catch (error) {
    console.error('Erro combos', error)
  }
}

const buscarSaldos = async () => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/operacao/movimentacaoBancaria/extratoFuncionario/listagem', {
      method: 'POST', body: filtro.value
    })
    lista.value = response.data || []
  } catch (error) {
    console.error('Erro listagem', error)
  }
}

const abrirModalExtrato = (id: number) => {
  funcionarioSelecionado.value = id
  modalExtratoAberto.value = true
}

carregarCombos()
buscarSaldos()
</script>