<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:pencil-square-o" class="mr-2" />
        Lançamento Manual - Cadastro
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2">Informações do lançamento</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto <span
              class="text-red-500">*</span></label>
          <select v-model="form.projeto" @change="carregarContas(form.projeto)"
            class="w-full border rounded-md p-2 bg-white">
            <option value=""></option>
            <option v-for="proj in projetos" :key="proj.codigo" :value="proj.codigo">
              {{ proj.apelido }} - {{ proj.descricao }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Conta Vinculada <span
              class="text-red-500">*</span></label>
          <select v-model="form.contaVinculada" @change="carregarProjetoDaConta(form.contaVinculada)"
            class="w-full border rounded-md p-2 bg-white">
            <option value=""></option>
            <option v-for="conta in contasVinculadas" :key="conta.codigo" :value="conta.codigo">
              {{ conta.conta }} - {{ conta.banco }}
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo da Movimentação <span
              class="text-red-500">*</span></label>
          <select v-model="form.tipoMovimentacao" class="w-full border rounded-md p-2 bg-white">
            <option value=""></option>
            <option v-for="tipo in tiposMovimentacao" :key="tipo.codigo" :value="tipo.codigo">
              {{ tipo.descricao }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor da Movimentação <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:usd" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.valorMovimentacao" @input="formatarValor" type="text"
              class="w-full border rounded-md p-2 pl-10" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data da Movimentação <span
              class="text-red-500">*</span></label>
          <div class="relative">
            <Icon name="fa-solid:calendar" class="absolute left-3 top-3 text-gray-400" />
            <input v-model="form.dataMovimentacao" v-maska data-maska="##/##/####" placeholder="dd/mm/aaaa" type="text"
              class="w-full border rounded-md p-2 pl-10 text-center" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Classificação <span
              class="text-red-500">*</span></label>
          <select v-model="form.classificacao" class="w-full border rounded-md p-2 bg-white">
            <option value=""></option>
            <option v-for="classe in classificacoes" :key="classe.codigo" :value="classe.codigo">
              {{ classe.descricao }}
            </option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Motivo <span class="text-red-500">*</span></label>
        <textarea v-model="form.motivo" rows="4"
          class="w-full border rounded-md p-2 bg-yellow-50 resize-none"></textarea>
      </div>

      <h2 class="text-lg font-semibold mb-4 border-b pb-2">Em caso de lançamento por funcionário(s), preencher a
        listagem</h2>

      <div class="flex gap-4 mb-4 items-end">
        <div class="flex-grow">
          <label class="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
          <select v-model="funcionarioTemp" class="w-full border rounded-md p-2 bg-white">
            <option value=""></option>
            <option v-for="func in funcionariosAtivos" :key="func.codigo" :value="func">
              {{ func.nomeCompleto }}
            </option>
          </select>
        </div>
        <button @click="addFuncionario"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <span>Adicionar</span>
          <Icon name="fa-solid:plus" class="ml-2" />
        </button>
        <button @click="removerFuncionario"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center">
          <span>Remover</span>
          <Icon name="fa-solid:minus" class="ml-2" />
        </button>
      </div>

      <div class="border rounded-md max-h-48 overflow-y-auto w-1/2">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="p-2 border-b w-10 text-center"></th>
              <th class="p-2 border-b">Funcionário</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in form.funcionarios.filter(f => f.tipoAlteracao !== 2)" :key="index"
              class="hover:bg-gray-50 border-b">
              <td class="p-2 text-center">
                <input type="checkbox" v-model="item.selecionadoParaRemover" class="w-4 h-4 cursor-pointer" />
              </td>
              <td class="p-2">{{ item.funcionarioNome }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button @click="tentarGravar" :disabled="salvando"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {{ salvando ? 'Aguarde...' : 'Gravar' }}
        <Icon v-if="!salvando" name="fa-solid:save" class="ml-1" />
      </button>
      <button @click="novo" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Novo
        <Icon name="fa-solid:file" class="ml-1" />
      </button>
      <button @click="voltar" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Retornar
        <Icon name="fa-solid:backward" class="ml-1" />
      </button>
    </div>

    <AppModal :isOpen="modalConfirmaProjeto" title="Atenção" @close="modalConfirmaProjeto = false">
      <div class="p-4 text-center">
        <p class="text-lg mb-6">Tem certeza que deseja aplicar esse lançamento para <strong>todos</strong> os
          funcionários do projeto?</p>
        <div class="flex justify-center gap-4">
          <button @click="gravar" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Sim</button>
          <button @click="modalConfirmaProjeto = false"
            class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Não</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const router = useRouter()
const salvando = ref(false)
const modalConfirmaProjeto = ref(false)

const form = ref({
  codigo: '0',
  projeto: '',
  contaVinculada: '',
  tipoMovimentacao: '',
  valorMovimentacao: '',
  dataMovimentacao: '',
  classificacao: '',
  motivo: '',
  funcionarios: [] as any[] // Array para XML
})

const projetos = ref<any[]>([])
const contasVinculadas = ref<any[]>([])
const tiposMovimentacao = ref<any[]>([])
const classificacoes = ref<any[]>([])
const funcionariosAtivos = ref<any[]>([])
const funcionarioTemp = ref<any>('')

const formatarValor = () => {
  form.value.valorMovimentacao = String(form.value.valorMovimentacao).replace(/[^0-9.,]/g, "")
}

const carregarCombos = async () => {
  const [resProj, resTipo, resClass, resFunc] = await Promise.all([
    $fetch<{ data: any[] }>('/api/cadastro/projeto/ativos'),
    $fetch<any[]>('/api/tabelaBasica/tipoMovimentacao/ativos'),
    $fetch<{ data: any[] }>('/api/tabelaBasica/classificacao/ativos'), // Supondo q você criou
    $fetch<{ data: any[] }>('/api/cadastro/funcionario/ativos')
  ])
  projetos.value = resProj.data || []
  tiposMovimentacao.value = resTipo || []
  classificacoes.value = resClass.data || []
  funcionariosAtivos.value = resFunc.data || []
}

const carregarContas = async (idProjeto: string) => {
  try {
    const res = await $fetch<any[]>('/api/operacao/movimentacaoBancaria/lancamentoManual/contasPorProjeto', {
      method: 'POST', body: { projeto: idProjeto }
    })
    contasVinculadas.value = res || []
    if (res.length === 1) form.value.contaVinculada = res[0].codigo
  } catch (e) { console.error(e) }
}

const carregarProjetoDaConta = async (idConta: string) => {
  try {
    const res = await $fetch<{ projeto: number }>('/api/operacao/movimentacaoBancaria/lancamentoManual/projetoPorConta', {
      method: 'POST', body: { conta: idConta }
    })
    if (res.projeto) form.value.projeto = String(res.projeto)
  } catch (e) { console.error(e) }
}

const addFuncionario = () => {
  if (!funcionarioTemp.value) return alert("Selecione um funcionário.")

  const existe = form.value.funcionarios.some(f => f.funcionarioId === funcionarioTemp.value.codigo && f.tipoAlteracao !== 2)
  if (existe) return alert("Funcionário já listado.")

  form.value.funcionarios.push({
    codigoFuncionario: 0,
    funcionarioId: funcionarioTemp.value.codigo,
    funcionarioNome: funcionarioTemp.value.nomeCompleto,
    tipoAlteracao: 1,
    selecionadoParaRemover: false
  })
  funcionarioTemp.value = ''
}

const removerFuncionario = () => {
  form.value.funcionarios.forEach(f => {
    if (f.selecionadoParaRemover) f.tipoAlteracao = 2
  })
}

const tentarGravar = () => {
  if (!form.value.projeto) return alert("Informe o Projeto")
  if (!form.value.contaVinculada) return alert("Informe a Conta vinculada")
  if (!form.value.tipoMovimentacao) return alert("Informe o Tipo de movimentação")
  if (!form.value.valorMovimentacao) return alert("Informe o Valor de movimentação")
  if (!form.value.dataMovimentacao) return alert("Informe a Data de movimentação")
  if (!form.value.classificacao) return alert("Informe a Classificação")
  if (!form.value.motivo) return alert("Informe o Motivo")

  const temFuncionario = form.value.funcionarios.some(f => f.tipoAlteracao !== 2)
  if (!temFuncionario) {
    modalConfirmaProjeto.value = true
  } else {
    gravar()
  }
}

const gravar = async () => {
  modalConfirmaProjeto.value = false
  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/operacao/movimentacaoBancaria/lancamentoManual/gravar', {
      method: 'POST', body: form.value
    })
    if (res.status === 'success') {
      alert('Operação realizada com sucesso!')
      voltar()
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao gravar:', error)
    alert('Erro ao gravar dados.')
  } finally {
    salvando.value = false
  }
}

const novo = () => {
  router.push('/operacao/movimentacaoBancaria/lancamentoManual/cadastro?id=0')
  form.value = { codigo: '0', projeto: '', contaVinculada: '', tipoMovimentacao: '', valorMovimentacao: '', dataMovimentacao: '', classificacao: '', motivo: '', funcionarios: [] }
}

const voltar = () => router.push('/operacao/movimentacaoBancaria/lancamentoManual')

carregarCombos()
</script>