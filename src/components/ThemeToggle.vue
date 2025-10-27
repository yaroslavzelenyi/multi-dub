<template>
  <button
    @click="handleToggle"
    class="relative p-2 rounded-lg transition-all duration-200 hover:scale-110"
    :class="[
      themeStore.isDark
        ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    ]"
    :aria-label="themeStore.isDark ? 'Перемкнути на світлу тему' : 'Перемкнути на темну тему'"
  >
    <SunIcon v-if="themeStore.isDark" class="w-5 h-5" />

    <MoonIcon v-else class="w-5 h-5" />
  </button>
</template>

<script setup>
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const handleToggle = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped></style>
