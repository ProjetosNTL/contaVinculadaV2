<template>
  <div 
    class="relative flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-300 pointer-events-none group-hover:scale-105"
    :class="[
      modelValue 
        ? 'bg-emerald-500 border-emerald-500 scale-100 dark:bg-emerald-600 dark:border-emerald-600' 
        : 'bg-transparent border-gray-200 dark:border-gray-700 shadow-inner'
    ]"
  >
    <div 
      class="absolute inset-0 bg-emerald-400 dark:bg-emerald-500 rounded-lg scale-0 transition-transform duration-300 pointer-events-none opacity-20"
      :class="modelValue ? 'scale-150 opacity-0' : ''"></div>

    <transition name="pop">
      <Icon 
        v-if="modelValue" 
        name="fa7-solid:check" 
        class="w-3.5 h-3.5 text-white drop-shadow-sm" 
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.pop-enter-active {
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop 0.2s reverse ease-in;
}

@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
