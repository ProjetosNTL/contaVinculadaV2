<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:file-alt" class="mr-2" />
        Parâmetros de Ofício
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <h2 class="text-lg font-semibold mb-4 border-b pb-2 cursor-pointer" @click="filtroAberto = !filtroAberto">
        Filtro <Icon :name="filtroAberto ? 'fa-solid:angle-up' : 'fa-solid:angle-down'" class="float-right mt-1" />
      </h2>
      
      <div v-show="filtroAberto" class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
          <input v-model="filtro.projetoNome" type="text" placeholder="Digite o projeto..." class="w-full border rounded-md p-2" />
        </div>
      </div>
      
      <div v-show="filtroAberto" class="mt-4 flex justify-between items-center">
        <div class="flex gap-2">
            <button @click="novoRegistro" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
            <span>Novo</span>
            <Icon name="fa-solid:file" class="ml-2" />
            </button>
            <button @click="abrirModalPadrao" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center font-semibold">
            <span>Redação Padrão</span>
            <Icon name="fa-solid:pen-to-square" class="ml-2" />
            </button>
        </div>
        <button @click="buscarOficios" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
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
            <th class="p-3 border-b text-center">Histórico</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="oficios.length === 0">
            <td colspan="2" class="p-4 text-center text-gray-500 font-bold">Nenhum parâmetro de ofício encontrado</td>
          </tr>
          <tr v-for="item in oficios" :key="item.codigo" class="hover:bg-gray-50 border-b">
            <td class="p-3">
              <NuxtLink :to="`/configuracao/parametros/oficio/cadastro?id=${item.codigo}`" class="text-blue-600 hover:underline font-semibold">
                {{ item.apelido }} - {{ item.projeto }}
              </NuxtLink>
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

    <AppModal :isOpen="modalPadraoAberto" title="Editar Redação Padrão" @close="modalPadraoAberto = false" size="4xl">
        <div class="p-6 bg-gray-50">
            <div class="mb-6 flex gap-4 items-end">
                <div class="w-1/2">
                    <label class="block text-sm font-bold text-gray-700 uppercase mb-2">Selecione o Modelo</label>
                    <select v-model="padrao.tipoSaldo" @change="carregarModeloPadrao" class="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-800 font-semibold shadow-sm">
                        <option value="0">Sem Saldo (Lista Simples)</option>
                        <option value="1">Com Saldo (Cita Valores)</option>
                    </select>
                </div>
                <div class="w-1/2 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-2 rounded text-sm flex items-center h-10">
                    <Icon name="fa-solid:info-circle" class="mr-2 text-lg" />
                    <b>Este texto servirá como base para novos ofícios.</b>
                </div>
            </div>

            <hr class="my-4 border-gray-300" />

            <div class="mb-6">
                <label class="block text-sm font-bold text-gray-700 uppercase mb-2">
                    <Icon name="fa-solid:tags" /> Variáveis Disponíveis
                </label>
                <div class="bg-white border rounded-md p-4 shadow-sm grid grid-cols-3 gap-2 text-xs">
                    <div v-for="(variavel, idx) in variaveis" :key="idx" 
                         @click="copiarVariavel(variavel.codigo)"
                         class="cursor-pointer bg-gray-50 border border-gray-200 rounded p-2 flex items-center hover:bg-green-50 transition-colors"
                         title="Clique para copiar">
                        <code class="text-red-600 font-bold font-mono mr-2">{{ variavel.codigo }}</code>
                        <span class="text-gray-600">{{ variavel.desc }}</span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 italic mt-2 text-right">
                    <Icon name="fa-solid:info-circle" /> Clique na variável para copiar e cole no conteúdo do ofício.
                </p>
            </div>

            <div>
                <label class="block text-sm font-bold text-gray-700 uppercase mb-2">Conteúdo do Ofício</label>
                <textarea 
                    v-model="padrao.texto" 
                    rows="10" 
                    class="w-full border border-gray-300 rounded-md p-4 bg-yellow-50 resize-y text-gray-800 leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Comece a digitar o ofício aqui... Utilize as variáveis acima para preenchimento automático.">
                </textarea>
            </div>

            <div class="flex justify-end gap-4 mt-6 border-t pt-4">
                <button @click="modalPadraoAberto = false" class="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 font-semibold">Cancelar</button>
                <button @click="gravarModeloPadrao" :disabled="salvandoPadrao" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold flex items-center disabled:opacity-50">
                    <span>{{ salvandoPadrao ? 'Salvando...' : 'Gravar' }}</span>
                    <Icon v-if="!salvandoPadrao" name="fa-solid:save" class="ml-2" />
                </button>
            </div>
        </div>
    </AppModal>

    <AppModal :isOpen="modalHistoricoAberto" title="Histórico de alterações do Ofício" @close="modalHistoricoAberto = false">
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

const filtro = ref({ projetoNome: '' })

interface Oficio { codigo: number; projeto: string; apelido: string }
interface Historico { codigo: number; dataAlteracao: string; usuarioAlteracao: string; alteracoes: string[] }

const oficios = ref<Oficio[]>([])
const modalHistoricoAberto = ref(false)
const historicoData = ref<Historico[]>([])

// Variaveis e estados do Modal de Redação Padrão
const modalPadraoAberto = ref(false)
const salvandoPadrao = ref(false)
const padrao = ref({ tipoSaldo: '1', texto: '' })

const variaveis = [
    { codigo: '$cidadeData$', desc: 'Cidade/Data' },
    { codigo: '$nomeOrgao$', desc: 'Nome do Órgão' },
    { codigo: '$enderecoCompleto$', desc: 'Endereço' },
    { codigo: '$numContrato$', desc: 'Nº Contrato' },
    { codigo: '$numeroOficio$', desc: 'Nº Ofício' },
    { codigo: '$anoOficio$', desc: 'Ano Atual' },
    { codigo: '$assunto$', desc: 'Assunto' },
    { codigo: '$cnpj$', desc: 'CNPJ' },
    { codigo: '$periodoReferencia$', desc: 'Mês/Ano' },
    { codigo: '$signatarioNome$', desc: 'Quem assina' },
    { codigo: '$setor$', desc: 'Setor Resp.' },
    { codigo: '$valor$', desc: 'Valor (R$)' },
    { codigo: '$valorExtenso$', desc: 'Valor Extenso' }
]

const copiarVariavel = (texto: string) => {
    navigator.clipboard.writeText(texto)
    // Mostra um toast ou alerta rápido
    alert(`Copiado: ${texto}`)
}

const abrirModalPadrao = () => {
    padrao.value.tipoSaldo = '1' // Inicia com saldo (1)
    carregarModeloPadrao()
    modalPadraoAberto.value = true
}

const carregarModeloPadrao = async () => {
    try {
        const { data } = await $fetch<{data: string}>('/api/configuracao/parametros/oficio/recuperaPadrao', {
            method: 'POST',
            body: { tipoSaldo: Number(padrao.value.tipoSaldo) }
        })
        padrao.value.texto = data || ''
    } catch (error) {
        console.error('Erro ao buscar modelo padrão', error)
        padrao.value.texto = ''
    }
}

const gravarModeloPadrao = async () => {
    if(!padrao.value.texto) return alert("O texto padrão não pode ficar vazio.")
    salvandoPadrao.value = true
    try {
        const res = await $fetch<{status: string, mensagem: string}>('/api/configuracao/parametros/oficio/gravaPadrao', {
            method: 'POST',
            body: padrao.value
        })
        if(res.status === 'success'){
            alert("Modelo padrão gravado com sucesso!")
            modalPadraoAberto.value = false
        } else {
            alert(res.mensagem)
        }
    } catch (error) {
        alert("Erro ao gravar modelo padrão.")
    } finally {
        salvandoPadrao.value = false
    }
}

const buscarOficios = async () => {
  try {
    const response = await $fetch<{ data: Oficio[] }>('/api/configuracao/parametros/oficio/listagem', {
      method: 'POST', body: filtro.value
    })
    oficios.value = response.data || []
  } catch (error) {
    console.error('Erro ao buscar ofícios', error)
  }
}

const abrirHistorico = async (id: number) => {
  try {
    const response = await $fetch<{ data: Historico[] }>('/api/configuracao/parametros/oficio/historico', {
      method: 'POST', body: { parametroOficio: id }
    })
    historicoData.value = response.data || []
    modalHistoricoAberto.value = true
  } catch (error) {
    console.error('Erro ao buscar histórico', error)
  }
}

const novoRegistro = () => router.push('/configuracao/parametros/oficio/cadastro?id=0')

buscarOficios()
</script>