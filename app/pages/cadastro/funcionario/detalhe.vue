<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm">
        <Icon name="fa7-solid:users" class="w-4 h-4 text-[#3276b1] dark:text-[#539ce0]" />
        <span>/</span>
        <NuxtLink to="/cadastro/funcionario" class="hover:text-[#3276b1] dark:hover:text-[#539ce0] transition">Funcionários</NuxtLink>
        <span>/</span>
        <span class="text-gray-800 dark:text-gray-200 font-semibold">{{ isEditing ? form.nomeCompleto || 'Editar' : 'Novo' }}</span>
      </div>
      <button 
        @click="navigateTo('/cadastro/funcionario')"
        class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm text-sm"
      >
        <Icon name="fa7-solid:backward" class="w-4 h-4" />
        Retornar
      </button>
    </div>

    <div class="flex-1 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-[#3276b1] dark:border-t-[#539ce0] p-6 shadow-sm transition-colors duration-300">
      <div v-if="loadingModel" class="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <Icon name="fa7-solid:spinner" class="animate-spin w-10 h-10 mb-4 text-[#3276b1] dark:text-[#539ce0]" />
        Carregando dados...
      </div>

      <form v-else @submit.prevent="save" class="space-y-6">
        <div class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 flex items-center gap-2">
          <Icon name="fa7-solid:file-lines" class="text-gray-500 dark:text-gray-400" />
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Dados Principais</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo <span class="text-red-500">*</span></label>
            <input 
              v-model="form.nomeCompleto" 
              type="text" 
              required
              maxlength="60"
              class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" 
              placeholder="Digite o nome..." 
            />
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon name="fa7-solid:id-card" />
              </div>
              <input 
                v-model="form.cpf" 
                v-maska data-maska="###.###.###-##"
                type="text" 
                required
                class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" 
                placeholder="___.___.___-__" 
              />
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matrícula <span class="text-red-500">*</span></label>
            <input 
              v-model="form.matricula" 
              type="text" 
              required
              class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition" 
            />
          </div>

          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon name="fa7-solid:at" />
              </div>
              <input 
                v-model="form.email" 
                type="email" 
                required
                maxlength="50"
                class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" 
                placeholder="email@exemplo.com" 
              />
            </div>
          </div>

          <div class="md:col-span-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projeto Responsável <span class="text-red-500">*</span></label>
            <select 
              v-model="form.projeto" 
              required
              class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition"
            >
              <option value="" disabled class="dark:bg-gray-800">Selecione um projeto</option>
              <option v-for="p in projetosAtivos" :key="p.codigo" :value="p.codigo" class="dark:bg-gray-800">
                {{ p.apelido }} - {{ p.descricao }}
              </option>
            </select>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between bg-gray-50 dark:bg-gray-900/50 -mx-6 -mb-6 p-6 rounded-b-sm">
          <div>
            <button 
              v-if="isEditing" 
              type="button" 
              @click="confirmDelete"
              class="bg-red-50 dark:bg-red-900/20 hover:bg-red-600 dark:hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-900/50 hover:border-red-600 px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Icon name="fa7-solid:trash" class="w-4 h-4" />
              Excluir
            </button>
          </div>
          <div class="flex gap-3">
            <button 
              type="button" 
              @click="clearForm"
              class="text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Icon name="fa7-solid:file" class="w-4 h-4" />
              Novo
            </button>
            <button 
              type="submit" 
              :disabled="loadingSave"
              class="bg-[#739e73] hover:bg-[#5f835f] text-white px-6 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Icon v-if="loadingSave" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
              <Icon v-else name="fa7-solid:floppy-disk" class="w-4 h-4" />
              Gravar
            </button>
          </div>
        </div>
      </form>
    </div>

    <AppModal 
      :isOpen="deleteModalOpen" 
      title="Atenção" 
      icon="fa7-solid:triangle-exclamation"
      @close="deleteModalOpen = false"
    >
      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-sm border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-400">
         <p class="text-lg py-4 text-center font-semibold">CONFIRMA A EXCLUSÃO DESTE REGISTRO?</p>
      </div>
      <template #footer>
        <button @click="deleteModalOpen = false" class="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-sm transition shadow-sm">Cancelar</button>
        <button @click="executeDelete" :disabled="loadingDelete" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition shadow-sm flex items-center gap-2">
          <Icon v-if="loadingDelete" name="fa7-solid:spinner" class="animate-spin w-4 h-4" />
          Excluir Registro
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

const route = useRoute()
const codigoRaw = route.query.codigo

const isEditing = computed(() => !!form.codigo)

const form = reactive({
  codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
  nomeCompleto: '',
  cpf: '',
  matricula: '',
  email: '',
  projeto: ''
})

const projetosAtivos = ref<any[]>([])
const loadingModel = ref(false)
const loadingSave = ref(false)
const loadingDelete = ref(false)
const deleteModalOpen = ref(false)

const loadProjetos = async () => {
  try {
    const data = await $fetch('/api/cadastro/projeto/ativos')
    projetosAtivos.value = data?.data || []
  } catch (e) { console.error(e) }
}

const loadData = async () => {
  if (form.codigo) {
    loadingModel.value = true
    try {
      const data = await $fetch<any>(`/api/cadastro/funcionario/recupera?codigo=${form.codigo}`)
      if (data && data.status === 'success') {
        const d = data.data
        form.nomeCompleto = d.nomeCompleto
        form.cpf = d.cpf
        form.matricula = d.matricula
        form.email = d.email
        form.projeto = d.projeto
      } else {
        alert(data?.mensagem || 'Erro ao carregar dados.')
      }
    } catch (e) { console.error(e) } finally { loadingModel.value = false }
  }
}

const clearForm = () => {
  navigateTo('/cadastro/funcionario/detalhe')
  form.codigo = 0
  form.nomeCompleto = ''
  form.cpf = ''
  form.matricula = ''
  form.email = ''
  form.projeto = ''
}

const save = async () => {
  loadingSave.value = true
  try {
    const data = await $fetch<any>('/api/cadastro/funcionario/grava', { method: 'POST', body: form })
    if (data.status === 'success') {
      alert('Operação realizada com sucesso!')
      navigateTo('/cadastro/funcionario')
    } else { alert(data.mensagem || 'Erro desconhecido.') }
  } catch (e: any) { alert(e.data?.statusMessage || 'Erro ao gravar') } finally { loadingSave.value = false }
}

const confirmDelete = () => { deleteModalOpen.value = true }

const executeDelete = async () => {
  loadingDelete.value = true
  try {
    const data = await $fetch<any>('/api/cadastro/funcionario/excluir', { method: 'POST', body: { codigo: form.codigo } })
    if (data.status === 'success') { alert(data.mensagem); navigateTo('/cadastro/funcionario') }
    else { alert(data.mensagem) }
  } catch (e: any) { alert(e.data?.statusMessage || 'Erro ao excluir') } finally { loadingDelete.value = false; deleteModalOpen.value = false }
}

onMounted(() => { loadProjetos(); loadData() })
</script>
