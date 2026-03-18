<template>
  <div class="w-full">
    <label v-if="label" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
      <Icon v-if="icone" :name="icone" class="w-3.5 h-3.5" />
      {{ label }} {{ required ? '*' : '' }}
    </label>
    
    <div 
        @dragover.prevent="isDragging = true" 
        @dragleave.prevent="isDragging = false" 
        @drop.prevent="handleDrop"
        :class="[
            'relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center h-[180px]',
            isDragging ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-500/5'
        ]"
        @click="$refs.fileInput.click()"
    >
        <input 
          ref="fileInput" 
          type="file" 
          class="hidden" 
          :accept="accept" 
          @change="handleFileChange" 
        />

        <div v-if="!modelValue" class="space-y-2">
            <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all">
                <Icon :name="iconePrincipal" class="w-6 h-6" />
            </div>
            <div>
                <p class="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Arraste ou clique para selecionar</p>
                <p class="text-[10px] text-gray-500 font-medium mt-1">Formatos aceitos: {{ accept }}</p>
            </div>
        </div>

        <div v-else class="space-y-2 animate-fade-in w-full px-4">
            <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
                <Icon name="fa7-solid:file-circle-check" class="w-6 h-6" />
            </div>
            <div class="w-full">
                <p class="text-xs font-black text-gray-900 dark:text-white truncate" :title="modelValue.name">
                    {{ modelValue.name }}
                </p>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {{ (modelValue.size / 1024).toFixed(1) }} KB
                </p>
            </div>
            <button @click.stop="clearFile" class="mt-2 text-[10px] font-black uppercase tracking-tighter text-rose-500 hover:text-rose-600 hover:scale-105 transition-all flex items-center gap-1 mx-auto">
                <Icon name="fa7-solid:trash-can" class="w-3 h-3" /> Remover Arquivo
            </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Object as () => File | null, default: null },
  label: { type: String, default: '' },
  icone: { type: String, default: '' },
  iconePrincipal: { type: String, default: 'fa7-solid:cloud-arrow-up' },
  accept: { type: String, default: '.txt' },
  required: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    emit('update:modelValue', target.files[0])
    emit('change', target.files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    emit('update:modelValue', e.dataTransfer.files[0])
    emit('change', e.dataTransfer.files[0])
  }
}

const clearFile = () => {
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}
</script>
