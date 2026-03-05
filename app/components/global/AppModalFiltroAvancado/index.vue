<template>
  <Teleport to="body">
    <Transition 
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 sm:scale-100"
      leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div v-if="aberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="fechar"></div>

        <div class="relative w-full max-w-3xl bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl flex flex-col">
          
          <div class="bg-gray-50 dark:bg-[#1a1c23] p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between rounded-t-2xl">
            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Icon name="fa7-solid:filter" class="w-4 h-4" />
              </div>
              Filtros Avançados
            </h2>
            <button @click="fechar" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 relative">
            
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Documento (CPF)</label>
              <div class="relative">
                <Icon name="fa7-solid:address-card" class="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                <input 
                  v-model="filtroObj.cpfParam" 
                  @keyup.enter="aplicar"
                  type="text" 
                  class="w-full bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
                  placeholder="Digite o CPF..." 
                />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Matrícula</label>
              <div class="relative">
                <Icon name="fa7-solid:id-badge" class="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                <input 
                  v-model="filtroObj.matriculaParam" 
                  @keyup.enter="aplicar"
                  type="text" 
                  class="w-full bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
                  placeholder="Ex: 31758" 
                />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Projeto / Alocação</label>
              <div class="relative">
                
                <div 
                  @click="dropdownProjetoAberto = !dropdownProjetoAberto"
                  class="w-full bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700/80 rounded-xl pl-11 pr-10 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                  :class="{'ring-2 ring-emerald-500/50 border-emerald-500': dropdownProjetoAberto}"
                >
                  <Icon name="fa7-solid:building" class="absolute left-4 top-3 text-gray-400 w-4 h-4 z-10" />
                  <span class="truncate block w-full text-left font-medium">{{ nomeProjetoSelecionado }}</span>
                  <Icon name="fa7-solid:chevron-down" class="absolute right-4 top-3.5 w-3 h-3 text-gray-400 transition-transform duration-200" :class="{'rotate-180': dropdownProjetoAberto}" />
                </div>

                <div v-if="dropdownProjetoAberto" class="fixed inset-0 z-40" @click="dropdownProjetoAberto = false"></div>

                <Transition name="dropdown">
                  <div v-if="dropdownProjetoAberto" class="absolute z-[100] w-full mt-2 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-2xl max-h-56 overflow-y-auto scrollbar-custom backdrop-blur-xl">
                    <ul class="py-1.5">
                      <li 
                        @click="selecionarProjeto('')"
                        class="px-4 py-2.5 text-sm cursor-pointer transition-colors"
                        :class="!filtroObj.projetoParam ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'"
                      >
                        Todos os Projetos
                      </li>
                      <li 
                        v-for="proj in projetos" 
                        :key="proj.codigo"
                        @click="selecionarProjeto(proj.codigo)"
                        class="px-4 py-2.5 text-sm cursor-pointer transition-colors"
                        :class="filtroObj.projetoParam === proj.codigo ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'"
                      >
                        {{ proj.descricao }}
                      </li>
                    </ul>
                  </div>
                </Transition>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300">E-mail</label>
              <div class="relative">
                <Icon name="fa7-solid:envelope" class="absolute left-4 top-3 text-gray-400 w-4 h-4" />
                <input 
                  v-model="filtroObj.emailParam" 
                  @keyup.enter="aplicar"
                  type="email" 
                  class="w-full bg-white dark:bg-[#15171e] border border-gray-200 dark:border-gray-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-gray-400" 
                  placeholder="email@empresa.com" 
                />
              </div>
            </div>

          </div>

          <div class="bg-gray-50 dark:bg-[#1a1c23] border-t border-gray-200 dark:border-gray-800 p-5 flex items-center justify-between gap-4 rounded-b-2xl">
            <button @click="limpar" class="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
              <Icon name="fa7-solid:trash-can" class="w-4 h-4" /> Limpar Filtros
            </button>
            
            <div class="flex gap-3">
              <button @click="fechar" class="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-200 dark:border-gray-700">
                Cancelar
              </button>
              <button @click="aplicar" class="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                <Icon name="fa7-solid:magnifying-glass" class="w-4 h-4" /> Consultar
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  aberto: {
    type: Boolean,
    default: false
  },
  filtroObj: {
    type: Object,
    required: true
  },
  projetos: {
    type: Array as () => any[],
    default: () => []
  }
})

const emit = defineEmits(['close', 'aplicar', 'limpar'])

const fechar = () => emit('close')
const aplicar = () => emit('aplicar')
const limpar = () => emit('limpar')

const dropdownProjetoAberto = ref(false)

const nomeProjetoSelecionado = computed(() => {
  if (!props.filtroObj.projetoParam) return 'Todos os Projetos'
  const proj = props.projetos.find(p => p.codigo === props.filtroObj.projetoParam)
  return proj ? proj.descricao : 'Todos os Projetos'
})

const selecionarProjeto = (codigo: string | number) => {
  props.filtroObj.projetoParam = codigo
  dropdownProjetoAberto.value = false 
}
</script>