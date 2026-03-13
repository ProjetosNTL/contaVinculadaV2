<template>
  <div class="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
      <Icon :name="icone" class="text-gray-500 dark:text-gray-400 w-5 h-5" />
    </div>
    <h2 class="font-extrabold text-xl text-gray-800 dark:text-gray-200 tracking-tight">
      <slot />
    </h2>
  </div>
</template>

<script setup lang="ts">
defineProps({
  icone: {
    type: String,
    default: 'fa7-solid:file-lines'
  }
})
</script>
