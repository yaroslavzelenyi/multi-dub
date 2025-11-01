import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('light')

  const isDark = computed(() => currentTheme.value === 'dark')

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      currentTheme.value = savedTheme
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }

    applyThemeToDocument()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        currentTheme.value = e.matches ? 'dark' : 'light'
        applyThemeToDocument()
      }
    })
  }

  const applyThemeToDocument = () => {
    const htmlElement = document.documentElement

    if (currentTheme.value === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'

    localStorage.setItem('theme', currentTheme.value)

    applyThemeToDocument()
  }

  const setTheme = (theme) => {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Invalid theme. Use "light" or "dark"')
      return
    }

    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyThemeToDocument()
  }

  return {
    currentTheme,
    isDark,
    initializeTheme,
    toggleTheme,
    setTheme,
  }
})
