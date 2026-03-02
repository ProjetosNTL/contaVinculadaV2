<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <Icon name="fa-solid:cog" class="mr-2" />
        Permissões do Usuário - Edição
      </h1>
    </div>

    <div class="bg-white rounded-lg shadow-md mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
          <input v-model="usuarioNome" type="text" disabled class="w-full border rounded-md p-2 bg-gray-100 cursor-not-allowed" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Escolha de Permissão por Menu</label>
          <select v-model="menuSelecionado" @change="buscarPermissoesDoMenu" class="w-full border rounded-md p-2">
            <option value="">Selecione...</option>
            <option v-for="menu in menusDisponiveis" :key="menu.codigo" :value="menu.codigo">
              {{ menu.descricao }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="menuSelecionado" class="mt-4">
        <button @click="marcarDesmarcarTodos" class="bg-green-600 text-white px-4 py-2 rounded mb-3 hover:bg-green-700">
          Marcar/Desmarcar todos <Icon name="fa-solid:check" class="ml-1" />
        </button>

        <div class="border rounded-md overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-100 border-b">
              <tr>
                <th class="p-2 w-10 text-center">#</th>
                <th class="p-2">Funcionalidade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in permissoes" :key="perm.idFuncionalidade" class="border-b hover:bg-gray-50">
                <td class="p-2 text-center">
                  <input type="checkbox" v-model="perm.marcado" class="w-4 h-4 cursor-pointer" />
                </td>
                <td class="p-2">
                  {{ perm.nomeCompleto || perm.descricaoFuncionalidade }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button @click="confirmarExclusao" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Excluir <Icon name="fa-solid:trash" class="ml-1" />
      </button>
      <button @click="gravarPermissoes" :disabled="salvando" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
        {{ salvando ? 'Aguarde...' : 'Gravar' }} <Icon v-if="!salvando" name="fa-solid:save" class="ml-1" />
      </button>
      <button @click="voltar" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Retornar <Icon name="fa-solid:backward" class="ml-1" />
      </button>
    </div>

    <AppModal :isOpen="modalExclusao" title="Atenção" @close="modalExclusao = false">
      <div class="p-4 text-center">
        <p class="text-lg mb-6">Tem certeza que deseja excluir as permissões selecionadas?</p>
        <div class="flex justify-center gap-4">
          <button @click="excluirPermissoes" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Sim</button>
          <button @click="modalExclusao = false" class="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Não</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()

// Peguei o ID do usuário direto da URL
const usuarioId = route.params.id

const usuarioNome = ref('')
const menuSelecionado = ref('')
const menusDisponiveis = ref<any[]>([])
const permissoes = ref<any[]>([])
const salvando = ref(false)
const modalExclusao = ref(false)

const todosMarcados = computed(() => permissoes.value.length > 0 && permissoes.value.every(p => p.marcado))

const carregarDadosIniciais = async () => {
  try {
    // Tipifiquei o retorno aqui pra avisar o TS que vem um 'data' com 'login'
    const { data: userData } = await $fetch<{ data: { login: string } }>('/api/configuracao/permissaoUsuario/recuperaUsuario', {
      method: 'POST',
      body: { id: usuarioId }
    })
    if (userData) usuarioNome.value = userData.login

    // Tipifiquei o retorno dos menus como um array genérico
    const { data: menus } = await $fetch<{ data: any[] }>('/api/tabelaBasica/menuItem/listarAtivos')
    menusDisponiveis.value = menus || []
  } catch (error) {
    console.error('Erro ao buscar dados', error)
  }
}

const marcarDesmarcarTodos = () => {
  const novoEstado = !todosMarcados.value
  permissoes.value.forEach(p => p.marcado = novoEstado)
}

const buscarPermissoesDoMenu = async () => {
  if (!menuSelecionado.value) {
    permissoes.value = []
    return
  }
  
  try {
    // Tipifiquei o retorno das permissões
    const { data } = await $fetch<{ data: any[] }>('/api/configuracao/permissaoUsuario/permissoesPorMenu', {
      method: 'POST',
      body: { menuItem: menuSelecionado.value, usuario: usuarioId }
    })
    
    // Converti o 1 ou 0 do banco pra true/false do checkbox
    permissoes.value = (data || []).map((p: any) => ({
      ...p,
      marcado: p.marcado === 1
    }))
  } catch (error) {
    console.error('Erro ao buscar permissoes', error)
  }
}

const gravarPermissoes = async () => {
  const selecionadas = permissoes.value.filter(p => p.marcado)
  if (selecionadas.length === 0) {
    alert('Nenhuma permissão selecionada.')
    return
  }

  salvando.value = true
  try {
    await $fetch('/api/configuracao/permissaoUsuario/gravar', {
      method: 'POST',
      body: { 
        usuarioId, 
        menuItem: menuSelecionado.value, 
        permissoes: selecionadas.map(p => ({ ...p, marcado: 1 })) 
      }
    })
    alert('Permissões gravadas com sucesso!')
    voltar()
  } catch (error) {
    alert('Erro ao gravar.')
  } finally {
    salvando.value = false
  }
}

const confirmarExclusao = () => {
  const selecionadas = permissoes.value.filter(p => p.marcado)
  if (selecionadas.length === 0) {
    alert('Selecione as permissões que deseja excluir.')
    return
  }
  modalExclusao.value = true
}

const excluirPermissoes = async () => {
  const selecionadas = permissoes.value.filter(p => p.marcado)
  try {
    await $fetch('/api/configuracao/permissaoUsuario/excluir', {
      method: 'POST',
      body: { 
        usuarioId, 
        menuItem: menuSelecionado.value, 
        permissoes: selecionadas 
      }
    })
    alert('Permissões excluídas com sucesso!')
    modalExclusao.value = false
    buscarPermissoesDoMenu() 
  } catch (error) {
    alert('Erro ao excluir.')
  }
}

const voltar = () => {
  router.push('/configuracao/permissaoUsuario')
}

carregarDadosIniciais()
</script>