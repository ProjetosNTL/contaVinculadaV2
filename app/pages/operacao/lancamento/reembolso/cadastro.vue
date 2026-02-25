<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Icon name="fa7-solid:hand-holding-dollar" class="w-6 h-6 text-[#3276b1] dark:text-[#539ce0]" />
        Lançamento Reembolso
      </h1>
      <button @click="navigateTo('/operacao/lancamento/reembolso')" class="bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm">
        <Icon name="fa7-solid:backward" class="w-4 h-4" />
        Retornar
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors duration-300">
      <div class="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <Icon name="fa7-solid:file-pen" class="text-gray-500 dark:text-gray-400" />
        <h2 class="font-semibold text-gray-700 dark:text-gray-200">Dados do Reembolso</h2>
      </div>

      <form @submit.prevent="confirmarGravacao" class="space-y-6">
        <h3 class="text-gray-600 dark:text-gray-300 font-bold border-b border-gray-100 dark:border-gray-700 pb-1">Informações do lançamento</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Projeto <span class="text-red-500">*</span></label>
            <select v-model="form.projeto" @change="carregarContas" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
              <option value="" class="dark:bg-gray-800">Selecione o Projeto...</option>
              <option v-for="p in projetos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">{{ p.apelido }} - {{ p.descricao }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Conta Vinculada <span class="text-red-500">*</span></label>
            <select v-model="form.contaVinculada" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] disabled:bg-gray-100 dark:disabled:bg-gray-800/50 dark:disabled:text-gray-500 transition" :disabled="!form.projeto || loadingContas">
              <option value="" class="dark:bg-gray-800">{{ loadingContas ? 'Carregando...' : 'Selecione a Conta...' }}</option>
              <option v-for="c in contas" :key="c.codigo" :value="c.codigo" class="dark:bg-gray-800">{{ c.label }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <div class="col-span-1 border-r border-gray-100 dark:border-gray-700 pr-4">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo Movimen. <span class="text-red-500">*</span></label>
            <select v-model="form.tipoMovimentacao" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
              <option value="" class="dark:bg-gray-800">Selecione...</option>
              <option v-for="tm in tiposMov" :key="tm.codigo" :value="tm.codigo" class="dark:bg-gray-800">{{ tm.descricao }}</option>
            </select>
          </div>
          <div class="col-span-1 border-r border-gray-100 dark:border-gray-700 pr-4">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Movimen. <span class="text-red-500">*</span></label>
            <div class="relative mb-3">
              <Icon name="fa7-solid:calendar" class="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
              <input v-model="form.dataMovimentacao" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
            </div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Valor Movimen. <span class="text-red-500">*</span></label>
            <div class="relative">
              <Icon name="fa7-solid:brazilian-real-sign" class="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
              <input v-model="form.valorMovStr" @blur="formatarMoeda('valorMovimentacao', 'valorMovStr')" @focus="desformatarMoeda('valorMovStr')" type="text" placeholder="0,00" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-right" />
            </div>
          </div>
          <div class="col-span-1 xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Ofício</label>
              <div class="relative mb-3">
                <Icon name="fa7-solid:calendar" class="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input v-model="form.dataOficio" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
              </div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Valor Ofício</label>
              <div class="relative">
                <Icon name="fa7-solid:brazilian-real-sign" class="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input v-model="form.valorOficioStr" @blur="formatarMoeda('valorOficio', 'valorOficioStr')" @focus="desformatarMoeda('valorOficioStr')" type="text" placeholder="0,00" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-right" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Resposta</label>
              <div class="relative mb-3">
                <Icon name="fa7-solid:calendar" class="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input v-model="form.dataResposta" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
              </div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data Entrada</label>
              <div class="relative">
                <Icon name="fa7-solid:calendar" class="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input v-model="form.dataEntrada" v-maska data-maska="##/##/####" type="text" placeholder="__/__/____" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-8 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition text-center" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
            <select v-model="form.status" class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition">
              <option value="" class="dark:bg-gray-800">Selecione...</option>
              <option value="1" class="dark:bg-gray-800">1 - Não Enviado</option>
              <option value="2" class="dark:bg-gray-800">2 - Enviado</option>
              <option value="3" class="dark:bg-gray-800">3 - Pendente de Resposta</option>
              <option value="4" class="dark:bg-gray-800">4 - Concluído</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Motivo / Observação</label>
            <textarea v-model="form.motivo" placeholder="Descreva o motivo deste lançamento..." class="w-full border border-gray-300 dark:border-gray-600 rounded-sm p-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] resize-y min-h-[50px] bg-[#ffffc0] dark:bg-[#4a4a15] dark:placeholder-gray-400 transition"></textarea>
          </div>
        </div>

        <div class="mt-8">
          <h3 class="text-gray-600 dark:text-gray-300 font-bold border-b border-gray-100 dark:border-gray-700 pb-1 mb-4">Em caso de lançamento por funcionário(s), preencher a listagem</h3>
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1 relative">
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Buscar Funcionário</label>
              <div class="relative">
                <Icon name="fa7-solid:filter" class="absolute right-3 top-3 text-gray-400 dark:text-gray-500" />
                <input v-model="pesquisaFuncs" @input="buscarFuncionariosAutocomplete" @focus="showAutoComplete = true" type="text" placeholder="Digite o nome do funcionário..." class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-3 pr-10 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
              <div v-if="showAutoComplete && resultadoAutoComplete.length > 0" class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm shadow-lg max-h-60 overflow-y-auto">
                <ul class="py-1">
                  <li v-for="rf in resultadoAutoComplete" :key="rf.id" @click="selecionarFuncionarioBusca(rf)" class="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-[#3276b1] dark:hover:bg-[#437fb8] hover:text-white cursor-pointer transition">{{ rf.descricao }}</li>
                </ul>
              </div>
            </div>
            <div class="flex gap-2">
              <button type="button" @click="addFuncionario" class="bg-[#3276b1] dark:bg-[#539ce0] hover:bg-[#275b89] dark:hover:bg-[#3276b1] text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2"><Icon name="fa7-solid:plus" class="w-4 h-4" /> Adicionar</button>
              <button type="button" @click="removerSelecionados" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-sm font-medium transition flex items-center gap-2"><Icon name="fa7-solid:minus" class="w-4 h-4" /> Remover</button>
            </div>
          </div>
          <div class="mt-4 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden w-full lg:w-3/4">
            <table class="w-full text-left">
              <thead class="bg-gray-100/70 dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-700">
                <tr>
                  <th class="p-3 w-12 text-center"><input type="checkbox" @change="toggleAllFuncs" :checked="isAllSelected" class="dark:bg-gray-800 dark:border-gray-600" /></th>
                  <th class="p-3 font-semibold text-gray-600 dark:text-gray-300">Funcionário</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(f, i) in activeFuncs" :key="i" class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td class="p-3 text-center"><input type="checkbox" v-model="f.selected" class="dark:bg-gray-800 dark:border-gray-600" /></td>
                  <td class="p-3 text-gray-800 dark:text-gray-200">{{ f.funcionarioNome }}</td>
                </tr>
                <tr v-if="activeFuncs.length === 0"><td colspan="2" class="p-6 text-center text-gray-400 dark:text-gray-500">Nenhum funcionário adicionado à listagem.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 mt-6">
          <button type="button" @click="limpar" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-sm font-medium transition">Limpar</button>
          <button type="submit" :disabled="saving" class="bg-[#47a447] hover:bg-[#398439] text-white px-8 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50">
            <Icon v-if="saving" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
            <Icon v-else name="fa7-solid:floppy-disk" class="w-4 h-4" />
            Gravar
          </button>
        </div>
      </form>
    </div>

    <Teleport to="body">
      <div v-if="modalConf" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="modalConf = false">
        <div class="bg-white dark:bg-gray-800 rounded-md shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          <div class="p-8 text-center space-y-4">
            <Icon name="fa7-solid:triangle-exclamation" class="text-orange-500 dark:text-orange-400 w-16 h-16 mx-auto mb-4" />
            <h2 class="text-xl font-medium text-gray-800 dark:text-gray-200">Tem certeza que deseja aplicar esse reembolso para todos os funcionários do projeto?</h2>
          </div>
          <div class="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4 bg-gray-50 dark:bg-gray-900">
            <button @click="efetivarGravacao" class="bg-[#47a447] hover:bg-[#398439] text-white px-8 py-2 rounded-sm font-medium shadow-sm transition">Sim</button>
            <button @click="modalConf = false" class="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-sm font-medium shadow-sm transition">Não</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

const projetos = ref<any[]>([])
const tiposMov = ref<any[]>([])
const contas = ref<any[]>([])
const loadingContas = ref(false)
const saving = ref(false)
const modalConf = ref(false)

const form = reactive({
  codigo: 0, projeto: '', contaVinculada: '', tipoMovimentacao: '',
  valorMovStr: '', valorMovimentacao: 0, dataMovimentacao: '', motivo: '',
  dataOficio: '', valorOficioStr: '', valorOficio: 0,
  dataResposta: '', dataEntrada: '', status: '',
  funcionarios: [] as any[]
})

const activeFuncs = computed(() => form.funcionarios.filter((f: any) => f.tipoAlteracao !== 2))
const isAllSelected = computed(() => activeFuncs.value.length > 0 && activeFuncs.value.every((f: any) => f.selected))
const pesquisaFuncs = ref('')
const showAutoComplete = ref(false)
const resultadoAutoComplete = ref<any[]>([])
let debounceTimer: any = null
const funcEmEdicao = ref<any>(null)

const carregarBase = async () => {
  try {
    const [respProj, respTipos] = await Promise.all([$fetch('/api/cadastro/projeto/ativos'), $fetch('/api/tabelaBasica/tipoMovimentacao/recupera')])
    projetos.value = (respProj as any)?.data || []
    if ((respTipos as any)?.results) tiposMov.value = (respTipos as any).results
  } catch (e) { console.error(e) }
}

const carregarContas = async () => {
  form.contaVinculada = ''
  if (form.projeto) {
    loadingContas.value = true
    try {
      const resp: any = await $fetch(`/api/operacao/lancamento/manual/contas?projeto=${form.projeto}`)
      contas.value = resp.data || []
      if (contas.value.length === 1) form.contaVinculada = contas.value[0].codigo
    } catch (e) { console.error(e) } finally { loadingContas.value = false }
  } else { contas.value = [] }
}

const formatarMoeda = (propReal: 'valorMovimentacao' | 'valorOficio', propStr: 'valorMovStr' | 'valorOficioStr') => {
  let val = parseFloat(form[propStr].replace(/\./g, '').replace(',', '.'))
  if (isNaN(val)) val = 0
  form[propReal] = val
  form[propStr] = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const desformatarMoeda = (propStr: 'valorMovStr' | 'valorOficioStr') => { form[propStr] = form[propStr].replace(/\./g, '') }

const buscarFuncionariosAutocomplete = () => {
  if (pesquisaFuncs.value.length < 3) { resultadoAutoComplete.value = []; showAutoComplete.value = false; return }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      const projStr = form.projeto ? `&projeto=${form.projeto}` : ''
      const resp: any = await $fetch(`/api/cadastro/funcionario/autocomplete?q=${encodeURIComponent(pesquisaFuncs.value)}${projStr}`)
      resultadoAutoComplete.value = resp.data || []; showAutoComplete.value = true
    } catch (e) { /* silent */ }
  }, 400)
}

const selecionarFuncionarioBusca = (f: any) => { funcEmEdicao.value = f; pesquisaFuncs.value = f.descricao; showAutoComplete.value = false }

const addFuncionario = () => {
  if (!funcEmEdicao.value) { alert("Selecione um funcionário válido buscando pelo nome primeiro."); return }
  if (activeFuncs.value.find((f: any) => f.funcionarioId === funcEmEdicao.value.id)) { alert("Funcionário já listado."); return }
  form.funcionarios.push({ sequencialFuncionario: form.funcionarios.length + 1, codigoFuncionario: 0, funcionarioId: funcEmEdicao.value.id, funcionarioNome: funcEmEdicao.value.descricao, tipoAlteracao: 1, selected: false })
  funcEmEdicao.value = null; pesquisaFuncs.value = ''
}

const removerSelecionados = () => {
  let excluiu = false
  for (let i = form.funcionarios.length - 1; i >= 0; i--) {
    if (form.funcionarios[i].selected && form.funcionarios[i].tipoAlteracao !== 2) { form.funcionarios[i].tipoAlteracao = 2; excluiu = true }
  }
  if (!excluiu) alert("Selecione pelo menos 1 funcionário para remover.")
}

const toggleAllFuncs = (e: any) => { const val = e.target.checked; activeFuncs.value.forEach((f: any) => f.selected = val) }

const confirmarGravacao = () => {
  if (!form.projeto) return alert("Informe o Projeto.")
  if (!form.contaVinculada) return alert("Informe a Conta Vinculada.")
  if (!form.tipoMovimentacao) return alert("Informe o Tipo de Movimentação.")
  if (!form.dataMovimentacao) return alert("Informe a Data de Movimentação.")
  if (activeFuncs.value.length === 0) modalConf.value = true
  else efetivarGravacao()
}

const efetivarGravacao = async () => {
  modalConf.value = false; saving.value = true
  try {
    const resp: any = await $fetch('/api/operacao/lancamento/reembolso/grava', { method: 'POST', body: { ...form, funcionarios: form.funcionarios.filter((f: any) => f.tipoAlteracao !== 2) } })
    if (resp.status === 'success') { alert("Operação Gravada com Sucesso"); navigateTo('/operacao/lancamento/reembolso') }
    else { alert(resp.mensagem || "Falha na Gravação") }
  } catch (err) { console.error(err); alert('Erro inesperado ao gravar.') } finally { saving.value = false }
}

const limpar = () => {
  form.projeto = ''; form.contaVinculada = ''; form.tipoMovimentacao = ''; form.valorMovStr = ''; form.valorMovimentacao = 0
  form.dataMovimentacao = ''; form.motivo = ''; form.dataOficio = ''; form.valorOficioStr = ''; form.valorOficio = 0
  form.dataResposta = ''; form.dataEntrada = ''; form.status = ''; form.funcionarios = []; pesquisaFuncs.value = ''; carregarContas()
}

onMounted(() => { carregarBase() })
</script>
