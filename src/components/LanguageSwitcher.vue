<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      :class="[
        'flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-colors',
        themeStore.isDark
          ? 'text-gray-400 hover:text-gray-200 border-gray-700 hover:border-gray-600'
          : 'text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 bg-white',
      ]"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span>{{ currentLanguage.name }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isDropdownOpen"
      :class="[
        'absolute right-0 mt-2 w-48 border rounded-lg shadow-lg z-50 transition-colors',
        themeStore.isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
      ]"
    >
      <div class="py-1">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          :class="[
            'w-full text-left px-4 py-2 text-sm transition-colors',
            currentLanguage.code === lang.code
              ? 'bg-violet-600 text-white'
              : themeStore.isDark
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          ]"
        >
          <div class="flex items-center space-x-3">
            <span class="text-lg">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { locale } = useI18n()
const themeStore = useThemeStore()

const isDropdownOpen = ref(false)

const languages = [
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

const currentLanguage = computed(() => {
  return languages.find((lang) => lang.code === locale.value) || languages[0]
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  isDropdownOpen.value = false
  localStorage.setItem('preferred-language', langCode)
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && languages.some((lang) => lang.code === savedLanguage)) {
    locale.value = savedLanguage
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
