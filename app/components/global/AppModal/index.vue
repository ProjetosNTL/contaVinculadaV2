<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[999] flex flex-col justify-center items-center bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm p-4" @click.self="$emit('close')">
        <div 
          class="bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-modal-in"
          :class="{
            'max-w-md': tamanho === 'sm',
            'max-w-lg': tamanho === 'md',
            'max-w-2xl': tamanho === 'lg',
            'max-w-4xl': tamanho === 'xl'
          }"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-xl font-bold text-gray-800 dark:text-white tracking-wide flex items-center gap-2">
              <Icon v-if="icon" :name="icon" class="text-emerald-500 w-6 h-6" />
              {{ title }}
            </h3>
            <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
              <Icon name="fa7-solid:xmark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6" :class="semScroll ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-2xl flex gap-3" :class="rodapeEntre ? 'justify-between' : 'justify-end'">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  tamanho: { type: String, default: 'md' }, // sm, md, lg, xl
  rodapeEntre: { type: Boolean, default: false },
  semScroll: { type: Boolean, default: false }
})

defineEmits(['close'])
</script>

<style scoped src="./style.css"></style>