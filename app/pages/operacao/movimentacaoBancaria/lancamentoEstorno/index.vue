<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:undo" class="mr-2" />
        Lançamento Estorno
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo do Lançamento</label>
          <select v-model="filtro.tipoLancamento" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option value="2">Lançamento Manual</option>
            <option value="3">Lançamento Reembolso</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="filtro.dataInicio" v-maska data-maska="##/##/####" placeholder="dd/mm/aaaa" type="text" class="w-full border rounded-md p-2 pl-10 text-center" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="filtro.dataFim" v-maska data-maska="##/##/####" placeholder="dd/mm/aaaa" type="text" class="w-full border rounded-md p-2 pl-10 text-center" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estornado</label>
          <select v-model="filtro.estornado" class="w-full border rounded-md p-2 bg-white">
            <option value="">Todos</option>
            <option value="0">Não</option>
            <option value="1">Sim</option>
          </select>
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-end">
        <button @click="buscarEstornos" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
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
            <th class="p-3 border-b text-center">Tipo Lançamento</th>
            <th class="p-3 border-b text-center">Tipo Movimentação</th>
            <th class="p-3 border-b text-center">Vlr Movimentação</th>
            <th class="p-3 border-b text-center">Data Movimentação</th>
            <th class="p-3 border-b">Classificação</th>
            <th class="p-3 border-b text-center">Funcionários</th>
            <th class="p-3 border-b text-center">Estornar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="lista.length === 0">
            <td colspan="9" class="p-4 text-center text-gray-500 font-bold">Nenhum registro encontrado</td>
          </tr>
          <tr v-for="item in lista" :key="`${item.tipoLancamento}-${item.codigo}`" class="hover:bg-gray-50 border-b">
            <td class="p-3">{{ item.projeto }}</td>
            <td class="p-3">{{ item.contaVinculada }}</td>
            <td class="p-3 text-center">
              <span class="bg-gray-200 px-2 py-1 rounded text-sm font-semibold">{{ item.tipoLancamento === 2 ? 'Manual' : 'Reembolso' }}</span>
            </td>
            <td class="p-3 text-center">{{ item.tipoMovimentacao }}</td>
            <td class="p-3 text-center font-semibold text-blue-800">R$ {{ formatarMoeda(item.valorMovimentacao) }}</td>
            <td class="p-3 text-center">{{ item.dataMovimentacao }}</td>
            <td class="p-3">{{ item.classificacao }}</td>
            <td class="p-3 text-center">
              <button @click="abrirModalFuncionario(item.codigo, item.tipoLancamento)" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                <Icon name="fa-solid:user" />
              </button>
            </td>
            <td class="p-3 text-center">
              <button v-if="item.estorno === 0" @click="prepararEstorno(item)" class="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                <Icon name="fa-solid:undo" />
              </button>
              <button v-else disabled class="bg-gray-400 text-white p-2 rounded cursor-not-allowed" title="Já estornado">
                <Icon name="fa-solid:ban" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal :isOpen="modalFuncionarioAberto" title="Funcionários Vinculados" @close="modalFuncionarioAberto = false">
      <div class="p-4">
        <table class="w-full text-center border-collapse">
          <tbody v-if="listaFuncionariosModal.length > 0">
            <tr v-for="(func, index) in listaFuncionariosModal" :key="index" class="border-b">
              <td class="p-3">{{ func.funcionario }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td class="p-8 text-lg font-bold text-gray-500">Lançamento feito para todos os funcionários do projeto.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppModal>

    <AppModal :isOpen="modalEstornoAberto" title="Motivo do Estorno" @close="modalEstornoAberto = false">
      <div class="p-4">
        <label class="block font-bold mb-2">- Motivo do Estorno:</label>
        <textarea v-model="estornoObj.motivo" class="w-full bg-yellow-50 border p-2 rounded resize-none" rows="4"></textarea>
        
        <label class="block font-bold mb-2 mt-4">- Data do Estorno:</label>
        <input v-model="dataEstornoDisplay" class="w-full bg-gray-100 border p-2 rounded text-center font-semibold" readonly />

        <div class="mt-6 flex justify-center gap-4">
          <button @click="abrirConfirmacaoPin" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold">Avançar para PIN</button>
          <button @click="modalEstornoAberto = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </AppModal>

    <AppModal :isOpen="modalPinAberto" title="Confirmação de Segurança" @close="modalPinAberto = false">
      <div class="p-4 text-center">
        <label class="block text-lg mb-4">Digite seu PIN para confirmar o estorno:</label>
        
        <div class="relative w-64 mx-auto mb-6">
          <input :type="mostrarPin ? 'text' : 'password'" v-model="estornoObj.pin" class="w-full bg-yellow-50 border p-2 rounded text-center text-xl tracking-widest" maxlength="6" />
          <button @click="mostrarPin = !mostrarPin" class="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
            <Icon :name="mostrarPin ? 'fa-solid:eye-slash' : 'fa-solid:eye'" />
          </button>
        </div>

        <div class="flex justify-center gap-4">
          <button @click="finalizarEstorno" :disabled="processando" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-bold disabled:opacity-50">
            {{ processando ? 'Processando...' : 'Finalizar Estorno' }}
          </button>
          <button @click="modalPinAberto = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const filtroAberto = ref(true)

const filtro = ref({
  projeto: '', funcionarioId: '', tipoLancamento: '',
  dataInicio: '', dataFim: '', estornado: '0'
})

const lista = ref<any[]>([])
const projetos = ref<any[]>([])
const funcionarios = ref<any[]>([])

const modalFuncionarioAberto = ref(false)
const listaFuncionariosModal = ref<any[]>([])

const modalEstornoAberto = ref(false)
const modalPinAberto = ref(false)
const mostrarPin = ref(false)
const processando = ref(false)
const dataEstornoDisplay = ref('')
let timerRelogio: any = null

const estornoObj = ref({
  codigoLancamento: 0,
  tipoLancamento: 0,
  motivo: '',
  pin: ''
})

const formatarMoeda = (valor: number) => Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const carregarCombos = async () => {
  try {
    const resProj = await $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos')
    projetos.value = resProj.data || []
    
    const resFunc = await $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
    funcionarios.value = resFunc.data || []
  } catch (e) {
    console.error('Erro ao carregar combos', e)
  }
}

const buscarEstornos = async () => {
  if (!filtro.value.dataInicio || !filtro.value.dataFim) {
    return alert("Informe a Data Início e Data Fim para realizar a busca.")
  }

  try {
    const response = await $fetch<{ data: any[] }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/listagem', {
      method: 'POST', body: filtro.value
    })
    lista.value = response.data || []
  } catch (error) {
    console.error('Erro listagem', error)
  }
}

const abrirModalFuncionario = async (codigo: number, tipo: number) => {
  try {
    const response = await $fetch<any[]>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/funcionarios', {
      method: 'POST', body: { codigoLancamento: codigo, tipoLancamento: tipo }
    })
    listaFuncionariosModal.value = response || []
    modalFuncionarioAberto.value = true
  } catch (error) {
    console.error('Erro funcionarios', error)
  }
}

const atualizarRelogio = () => {
  const agora = new Date()
  dataEstornoDisplay.value = `${agora.toLocaleDateString('pt-BR')} - ${agora.toLocaleTimeString('pt-BR')}`
}

const prepararEstorno = (item: any) => {
  estornoObj.value.codigoLancamento = item.codigo
  estornoObj.value.tipoLancamento = item.tipoLancamento
  estornoObj.value.motivo = ''
  estornoObj.value.pin = ''
  mostrarPin.value = false
  
  atualizarRelogio()
  timerRelogio = setInterval(atualizarRelogio, 1000)
  modalEstornoAberto.value = true
}

const abrirConfirmacaoPin = () => {
  if (!estornoObj.value.motivo.trim()) return alert("Digite o motivo do estorno!")
  modalEstornoAberto.value = false
  modalPinAberto.value = true
}

const finalizarEstorno = async () => {
  if (!estornoObj.value.pin) return alert("Insira seu PIN para confirmar!")
  
  processando.value = true
  try {
    // 1. Valida PIN
    const resPin = await $fetch<{ status: string }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/validaPin', {
      method: 'POST', body: { pin: estornoObj.value.pin }
    })
    
    if (resPin.status !== 'success') {
      alert("PIN Incorreto!")
      estornoObj.value.pin = ''
      processando.value = false
      return
    }

    // 2. Grava Estorno
    const resGravar = await $fetch<{ status: string, mensagem: string }>('/api/operacao/movimentacaoBancaria/lancamentoEstorno/gravar', {
      method: 'POST', body: estornoObj.value
    })

    if (resGravar.status === 'success') {
      alert("Estorno realizado com sucesso!")
      modalPinAberto.value = false
      buscarEstornos()
    } else {
      alert(resGravar.mensagem)
    }

  } catch (error) {
    console.error('Erro ao estornar', error)
    alert("Erro interno ao realizar o estorno.")
  } finally {
    processando.value = false
  }
}

onUnmounted(() => {
  if (timerRelogio) clearInterval(timerRelogio)
})

carregarCombos()
</script>