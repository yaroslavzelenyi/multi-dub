<template>
  <div
    id="app"
    class="min-h-screen transition-colors duration-200"
    :class="[themeStore.isDark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900']"
  >
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>
