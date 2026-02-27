<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:university" class="mr-2" />
        Importação de Bancos (Brasil API)
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <p class="text-gray-600">Selecione os bancos abaixo que deseja importar para o sistema.</p>
        <button @click="marcarDesmarcarTodos" :class="todosMarcados ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'" class="text-white px-4 py-2 rounded flex items-center">
          <Icon :name="todosMarcados ? 'fa-solid:times' : 'fa-solid:check'" class="mr-2" />
          {{ todosMarcados ? 'Desmarcar todos' : 'Marcar todos' }}
        </button>
      </div>

      <div class="overflow-y-auto max-h-96 border rounded-md">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="p-3 border-b w-12 text-center">#</th>
              <th class="p-3 border-b w-32">Código</th>
              <th class="p-3 border-b">Nome da Instituição</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="carregandoBancos">
              <td colspan="3" class="p-4 text-center text-gray-500 font-bold">Buscando bancos na Brasil API...</td>
            </tr>
            <tr v-for="(banco, index) in bancosDaApi" :key="index" class="hover:bg-gray-50 border-b">
              <td class="p-3 text-center">
                <input type="checkbox" v-model="banco.selecionado" class="w-4 h-4 cursor-pointer" />
              </td>
              <td class="p-3 font-semibold">{{ banco.code }}</td>
              <td class="p-3">{{ banco.fullName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button @click="gravarEmLote" :disabled="salvando" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {{ salvando ? 'Importando...' : 'Gravar Selecionados' }} <Icon v-if="!salvando" name="fa-solid:save" class="ml-1" />
      </button>
      <button @click="voltar" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Retornar <Icon name="fa-solid:backward" class="ml-1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const router = useRouter()
const bancosDaApi = ref<any[]>([])
const carregandoBancos = ref(true)
const salvando = ref(false)

const todosMarcados = computed(() => bancosDaApi.value.length > 0 && bancosDaApi.value.every(b => b.selecionado))

const removerAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

const buscarBancosApiExterna = async () => {
  try {
    const data: any = await $fetch('https://brasilapi.com.br/api/banks/v1')
    
    bancosDaApi.value = data
      .filter((b: any) => b.code != null)
      .sort((a: any, b: any) => {
        let nomeA = removerAcentos(a.fullName.toLowerCase())
        let nomeB = removerAcentos(b.fullName.toLowerCase())
        if (nomeA < nomeB) return -1
        if (nomeA > nomeB) return 1
        return 0
      })
      .map((b: any) => ({ ...b, selecionado: false }))
      
  } catch (error) {
    console.error("Erro ao buscar Brasil API", error)
    alert("Falha ao comunicar com a Brasil API.")
  } finally {
    carregandoBancos.value = false
  }
}

const marcarDesmarcarTodos = () => {
  const novoEstado = !todosMarcados.value
  bancosDaApi.value.forEach(b => b.selecionado = novoEstado)
}

const gravarEmLote = async () => {
  const selecionados = bancosDaApi.value.filter(b => b.selecionado).map(b => ({
    codigoBanco: b.code,
    nomeBanco: b.fullName
  }))

  if (selecionados.length === 0) return alert("Selecione pelo menos um banco para importar.")

  salvando.value = true
  try {
    const res = await $fetch<{ status: string, mensagem: string }>('/api/tabelaBasica/bancos/gravarLote', {
      method: 'POST',
      body: { bancos: selecionados }
    })
    
    if (res.status === 'success') {
      alert('Importação realizada com sucesso!')
      voltar()
    } else {
      alert(res.mensagem)
    }
  } catch (error) {
    console.error('Erro ao importar bancos:', error)
    alert('Erro ao realizar importação.')
  } finally {
    salvando.value = false
  }
}

const voltar = () => router.push('/tabelaBasica/bancos')

buscarBancosApiExterna()
</script>