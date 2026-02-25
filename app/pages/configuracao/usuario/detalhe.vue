<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Icon name="fa7-solid:user-gear" class="w-6 h-6 text-[#3276b1] dark:text-[#539ce0]" />
        {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
      </h1>
      <button 
        @click="navigateTo('/configuracao/usuario')"
        class="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
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
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Dados Pessoais e Login</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Usuário <span class="text-red-500">*</span></label>
            <input 
              v-model="form.nomeUsuario" 
              type="text" 
              required
              maxlength="60"
              class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" 
              placeholder="Digite o nome..." 
            />
          </div>
          
          <div class="md:col-span-3">
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <Icon name="fa7-solid:phone" />
              </div>
              <input 
                v-model="form.telefone" 
                v-maska data-maska="['(##) ####-####', '(##) #####-####']"
                type="text" 
                class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition placeholder-gray-400 dark:placeholder-gray-500" 
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div class="md:col-span-3">
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

          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Login (Acesso) <span class="text-red-500">*</span></label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Icon name="fa7-solid:user" />
                </div>
                <input 
                v-model="form.login" 
                type="text" 
                required
                maxlength="100"
                class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition" 
                />
            </div>
          </div>

           <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Senha {{ isEditing ? '(Opcional)' : '*' }}
            </label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Icon name="fa7-solid:lock" />
                </div>
                <input 
                v-model="form.senha" 
                :type="pwdVisible ? 'text' : 'password'" 
                :required="!isEditing"
                autocomplete="new-password"
                class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-10 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition" 
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" @click="pwdVisible = !pwdVisible">
                    <Icon :name="pwdVisible ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" />
                </div>
            </div>
          </div>

          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmação de Senha</label>
             <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Icon name="fa7-solid:lock" />
                </div>
                <input 
                v-model="senhaConfirma" 
                :type="pwdVisibleConf ? 'text' : 'password'" 
                :required="!isEditing || !!form.senha"
                autocomplete="new-password"
                class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm pl-10 pr-10 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition" 
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" @click="pwdVisibleConf = !pwdVisibleConf">
                    <Icon :name="pwdVisibleConf ? 'fa7-solid:eye-slash' : 'fa7-solid:eye'" />
                </div>
            </div>
          </div>

          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exigir Trocar Senha?</label>
            <select 
              v-model="form.restauraSenha" 
              class="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#3276b1] dark:focus:border-[#539ce0] transition"
            >
              <option :value="1" class="dark:bg-gray-800">Sim</option>
              <option :value="0" class="dark:bg-gray-800">Não</option>
            </select>
          </div>
        </div>

        <!-- Projetos do Usuário -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div class="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 flex items-center gap-2">
                <Icon name="fa7-solid:diagram-project" class="text-gray-500 dark:text-gray-400" />
                <h2 class="font-semibold text-gray-700 dark:text-gray-200">Projetos Atribuídos ao Usuário</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
                <label v-for="p in projetosAtivos" :key="p.codigo" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                    <input 
                        type="checkbox" 
                        :value="p.codigo" 
                        v-model="form.projetos"
                        class="w-4 h-4 text-[#3276b1] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-sm focus:ring-[#3276b1] focus:ring-2"
                    >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ p.apelido }} - {{ p.descricao }}</span>
                </label>
            </div>
        </div>

        <div class="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between bg-gray-50 dark:bg-gray-900/30 -mx-6 -mb-6 p-6 rounded-b-sm">
          <div>
            <button 
              v-if="isEditing" 
              type="button" 
              @click="confirmDelete"
              class="bg-red-50 dark:bg-red-900/20 hover:bg-red-600 dark:hover:bg-red-700 text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-800 hover:border-red-600 dark:hover:border-red-700 px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Icon name="fa7-solid:trash" class="w-4 h-4" />
              Excluir
            </button>
          </div>
          <div class="flex gap-3">
            <button 
              type="button" 
              @click="clearForm"
              class="text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 px-5 py-2 rounded-sm font-medium transition flex items-center gap-2 shadow-sm"
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

    <!-- Delete Confirm Modal -->
    <AppModal 
      :isOpen="deleteModalOpen" 
      title="Atenção" 
      icon="fa7-solid:triangle-exclamation"
      @close="deleteModalOpen = false"
    >
      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-sm border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
         <p class="text-lg py-4 text-center font-semibold">CONFIRMA A EXCLUSÃO DESTE REGISTRO?</p>
      </div>

      <template #footer>
        <button 
          @click="deleteModalOpen = false" 
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-sm transition shadow-sm"
        >
          Cancelar
        </button>
        <button 
          @click="executeDelete" 
          :disabled="loadingDelete"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition shadow-sm flex items-center gap-2"
        >
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

const pwdVisible = ref(false)
const pwdVisibleConf = ref(false)

const form = reactive({
  codigo: codigoRaw ? parseInt(codigoRaw as string) : 0,
  nomeUsuario: '',
  cpf: '',
  telefone: '',
  email: '',
  login: '',
  senha: '',
  restauraSenha: 0,
  projetos: [] as number[]
})

const senhaConfirma = ref('')

const projetosAtivos = ref<any[]>([])
const loadingModel = ref(false)
const loadingSave = ref(false)
const loadingDelete = ref(false)
const deleteModalOpen = ref(false)

const loadProjetos = async () => {
  try {
    const data = await $fetch('/api/cadastro/projeto/ativos')
    projetosAtivos.value = data?.data || []
  } catch (e) {
    console.error(e)
  }
}

const loadData = async () => {
  if (form.codigo) {
    loadingModel.value = true
    try {
      const data = await $fetch(`/api/configuracao/usuario/recupera?codigo=${form.codigo}`)
      if (data && data.status === 'success') {
        const d = data.data
        form.nomeUsuario = d.nomeUsuario
        form.cpf = d.cpf
        form.telefone = d.telefone || ''
        form.email = d.email
        form.login = d.login
        form.restauraSenha = d.restauraSenha
        form.projetos = d.projetos || []
      } else {
        alert(data?.mensagem || 'Erro ao carregar dados.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      loadingModel.value = false
    }
  }
}

const clearForm = () => {
  navigateTo('/configuracao/usuario/detalhe')
  form.codigo = 0
  form.nomeUsuario = ''
  form.cpf = ''
  form.telefone = ''
  form.email = ''
  form.login = ''
  form.senha = ''
  senhaConfirma.value = ''
  form.restauraSenha = 0
  form.projetos = []
}

const save = async () => {
  if (form.senha && form.senha !== senhaConfirma.value) {
    alert('A confirmação da senha deve ser igual à senha.')
    return
  }

  loadingSave.value = true
  try {
    const data = await $fetch('/api/configuracao/usuario/grava', {
      method: 'POST',
      body: form
    })
    if (data.status === 'success') {
      alert('Operação realizada com sucesso!')
      navigateTo('/configuracao/usuario')
    } else {
      alert(data.mensagem || 'Erro desconhecido.')
    }
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Erro ao gravar')
  } finally {
    loadingSave.value = false
  }
}

const confirmDelete = () => {
  deleteModalOpen.value = true
}

const executeDelete = async () => {
  loadingDelete.value = true
  try {
    const data = await $fetch('/api/configuracao/usuario/excluir', {
      method: 'POST',
      body: { codigo: form.codigo }
    })
    if (data.status === 'success') {
      alert(data.mensagem)
      navigateTo('/configuracao/usuario')
    } else {
      alert(data.mensagem)
    }
  } catch (e: any) {
    alert(e.data?.statusMessage || 'Erro ao excluir')
  } finally {
    loadingDelete.value = false
    deleteModalOpen.value = false
  }
}

onMounted(() => {
  loadProjetos()
  loadData()
})
</script>
