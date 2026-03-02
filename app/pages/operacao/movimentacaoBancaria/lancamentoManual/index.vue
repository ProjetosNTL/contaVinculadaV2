<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:pencil-square-o" class="mr-2" />
        Lançamento Manual
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
          <select v-model="filtro.projeto" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option v-for="proj in projetos" :key="proj.codigo" :value="proj.codigo">
              {{ proj.apelido }} - {{ proj.descricao }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo da Movimentação</label>
          <select v-model="filtro.tipoMovimentacao" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option v-for="tipo in tiposMovimentacao" :key="tipo.codigo" :value="tipo.codigo">
              {{ tipo.descricao }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data da Movimentação</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input 
              v-model="filtro.dataMovimentacao" 
              v-maska data-maska="##/##/####" 
              placeholder="dd/mm/aaaa" 
              type="text" 
              class="w-full border rounded-md p-2 pl-10 text-center" 
            />
          </div>
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-between">
        <button @click="novoRegistro" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Novo</span>
          <Icon name="fa-solid:file" class="ml-2" />
        </button>
        <button @click="buscarLancamentos" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Filtrar</span>
          <Icon name="fa-solid:search" class="ml-2" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border-b">Projeto</th>
            <th class="p-3 border-b">Conta Vinculada</th>
            <th class="p-3 border-b text-center">Valor da Movimentação</th>
            <th class="p-3 border-b">Tipo da Movimentação</th>
            <th class="p-3 border-b text-center">Classificação</th>
            <th class="p-3 border-b text-center">Data da Movimentação</th>
            <th class="p-3 border-b text-center">Funcionários</th>
            <th class="p-3 border-b text-center">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="lista.length === 0">
            <td colspan="8" class="p-4 text-center text-gray-500 font-bold">Nenhum lançamento manual encontrado</td>
          </tr>
          <tr v-for="item in lista" :key="item.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3">{{ item.projeto }}</td>
            <td class="p-3">{{ item.contaVinculada }}</td>
            <td class="p-3 text-center font-semibold text-blue-800">R$ {{ formatarMoeda(item.valorMovimentacao) }}</td>
            <td class="p-3">{{ item.tipoMovimentacao }}</td>
            <td class="p-3 text-center">{{ item.classificacao }}</td>
            <td class="p-3 text-center">{{ item.dataMovimentacao }}</td>
            <td class="p-3 text-center">
              <button @click="abrirModalFuncionarios(item.codigo)" :class="item.funcionario === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'" class="text-white p-2 rounded">
                <Icon name="fa-solid:users" />
              </button>
            </td>
            <td class="p-3 text-center">
              <button @click="abrirModalDetalhes(item.codigo)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:list" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :isOpen="modalDetalhesAberto" title="Detalhes" @close="modalDetalhesAberto = false" size="lg">
      <div class="p-4">
        <div class="mb-4">
          <label class="font-bold block mb-1">- Motivo:</label>
          <textarea v-model="detalhes.motivo" class="w-full bg-gray-100 border p-2 rounded resize-none" rows="4" readonly></textarea>
        </div>
        <div class="mb-4">
          <label class="font-bold block mb-1">- Usuário Cadastro:</label>
          <input v-model="detalhes.usuarioCadastro" class="w-full bg-gray-100 border p-2 rounded" readonly />
        </div>
        <div>
          <label class="font-bold block mb-1">- Data Cadastro:</label>
          <input v-model="detalhes.dataCadastro" class="w-full bg-gray-100 border p-2 rounded" readonly />
        </div>
        <div class="mt-6 flex justify-center">
          <button @click="modalDetalhesAberto = false" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Fechar</button>
        </div>
      </div>
    </AppModal>

    <AppModal :isOpen="modalFuncionarioAberto" title="Funcionários" @close="modalFuncionarioAberto = false">
      <div class="p-4">
        <table class="w-full text-center border-collapse">
          <tbody v-if="listaFuncionariosModal.length > 0">
            <tr v-for="(func, index) in listaFuncionariosModal" :key="index" class="border-b">
              <td class="p-3">{{ func.funcionario }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="p-8 text-lg font-bold text-gray-500">Lançamento feito para todos funcionários do projeto.</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-6 flex justify-center">
          <button @click="modalFuncionarioAberto = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Fechar</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const filtroAberto = ref(true)

const filtro = ref({ projeto: '', tipoMovimentacao: '', dataMovimentacao: '' })

const lista = ref<any[]>([])
const projetos = ref<any[]>([])
const tiposMovimentacao = ref<any[]>([])

const modalDetalhesAberto = ref(false)
const detalhes = ref({ motivo: '', usuarioCadastro: '', dataCadastro: '' })

const modalFuncionarioAberto = ref(false)
const listaFuncionariosModal = ref<any[]>([])

const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const carregarCombos = async () => {
  try {
    const resProj = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos')
    projetos.value = resProj.data || []
    
    const resTipo = await $fetch<any[]>('/api/tabelaBasica/tipoMovimentacao/recupera')
    tiposMovimentacao.value = resTipo || []
  } catch (error) {
    console.error("Erro combos", error)
  }
}

const buscarLancamentos = async () => {
  try {
    const response = await $fetch<{ data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoManual/listagem', {
      method: 'POST', body: filtro.value
    })
    lista.value = response.data || []
  } catch (error) {
    console.error('Erro listagem', error)
  }
}

const abrirModalDetalhes = async (id: number) => {
  try {
    const response = await $fetch<any>('/api/operacao/movimentacaoBancaria/lancamentoManual/detalhes', {
      method: 'POST', body: { lancamentoManual: id }
    })
    detalhes.value = response
    modalDetalhesAberto.value = true
  } catch (error) {
    console.error("Erro detalhes", error)
  }
}

const abrirModalFuncionarios = async (id: number) => {
  try {
    const response = await $fetch<any[]>('/api/operacao/movimentacaoBancaria/lancamentoManual/funcionarios', {
      method: 'POST', body: { lancamentoManual: id }
    })
    listaFuncionariosModal.value = response || []
    modalFuncionarioAberto.value = true
  } catch (error) {
    console.error("Erro func", error)
  }
}

const novoRegistro = () => router.push('/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=0')

carregarCombos()
buscarLancamentos()
</script>