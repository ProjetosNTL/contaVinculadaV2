<template>
  <div class="h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-normal text-gray-700 flex items-center gap-2">
        <Icon name="fa7-solid:upload" class="w-6 h-6 text-[#3276b1]" />
        Importação de Contracheques
      </h1>
      <button 
        @click="navigateTo('/operacao/contracheque/processamento')"
        class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-sm font-medium transition flex items-center gap-2 text-gray-700 border border-gray-300 shadow-sm"
      >
        <Icon name="fa7-solid:backward" class="w-4 h-4" />
        Voltar ao Processamento
      </button>
    </div>

    <!-- Container Principal do Form -->
    <div class="bg-white rounded-sm border border-gray-200 border-t-4 border-t-[#3276b1] p-6 shadow-sm">
      <div class="border-b border-gray-200 pb-4 mb-4 flex items-center gap-2">
        <Icon name="fa7-solid:file-invoice" class="text-gray-500" />
        <h2 class="font-semibold text-gray-700">Selecione o arquivo TXT da Folha de Pagamento</h2>
      </div>

      <form @submit.prevent="importar" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-1 border border-gray-200 p-4 bg-gray-50 rounded-sm">
            <label class="block text-sm font-medium text-gray-700 mb-2">Mês/Ano de Referência <span class="text-red-500">*</span></label>
            <input 
              v-model="mesAno" 
              v-maska data-maska="##/####"
              type="text" 
              class="w-full bg-white border border-gray-300 rounded-sm px-3 py-3 text-lg font-bold text-center text-gray-800 focus:outline-none focus:border-[#3276b1] transition" 
              placeholder="00/0000" 
              required
            />
          </div>
          
          <div class="lg:col-span-3 border border-gray-200 p-4 bg-gray-50 rounded-sm">
            <label class="block text-sm font-medium text-gray-700 mb-2">Arquivo TXT <span class="text-red-500">*</span></label>
            <div class="flex items-center gap-3">
              <input 
                type="file" 
                ref="fileInput"
                accept=".txt"
                @change="handleFile"
                class="hidden" 
                required
              />
              <button 
                type="button"
                @click="triggerFileInput"
                class="bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-800 px-4 py-3 rounded-sm font-medium transition flex items-center gap-2"
              >
                <Icon name="fa7-solid:folder-open" class="text-gray-600" />
                Procurar...
              </button>
              <div class="flex-1 bg-white border border-gray-300 rounded-sm px-3 py-3 text-gray-600 truncate">
                 {{ fileName || 'Nenhum arquivo selecionado' }}
              </div>
            </div>
            <p v-if="fileName" class="text-xs text-gray-500 mt-2">
              Tamanho: {{ fileSizeFormatted }}
            </p>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-end bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-sm">
            <button 
              type="submit" 
              :disabled="loading || !file || !mesAno"
              class="bg-[#739e73] hover:bg-[#5f835f] text-white px-8 py-3 rounded-sm font-bold text-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Icon v-if="loading" name="fa7-solid:spinner" class="animate-spin w-5 h-5" />
              <Icon v-else name="fa7-solid:file-import" class="w-5 h-5" />
              Realizar Importação
            </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const mesAno = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const fileName = ref('')
const fileSizeFormatted = ref('')

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const f = target.files[0]
    
    if (!f.name.toLowerCase().endsWith('.txt')) {
      alert('Selecione apenas arquivos de texto (.txt)')
      target.value = ''
      return
    }

    // Validação 2MB
    if (f.size > 2097152) {
      alert('Arquivo ultrapassou o valor máximo permitido (2MB)')
      target.value = ''
      return
    }

    file.value = f
    fileName.value = f.name
    fileSizeFormatted.value = (f.size / 1024).toFixed(2) + ' KB'
  }
}

const importar = async () => {
  if (!file.value || !mesAno.value) {
    alert('Preencha os dados corretamente.')
    return
  }
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('ano', mesAno.value)
    formData.append('xmlNota', file.value)

    const resp = await $fetch('/api/operacao/contracheque/importacao/processar', {
      method: 'POST',
      body: formData
    })

    if (resp.status === 'success') {
      alert(resp.mensagem)
      navigateTo('/operacao/contracheque/processamento')
    } else {
      alert(resp.mensagem || 'Erro ao importar arquivo.')
    }
  } catch (e: any) {
    console.error(e)
    alert('Erro de comunicação com o servidor ao importar arquivo. ' + (e.message || ''))
  } finally {
    loading.value = false
  }
}

</script>
