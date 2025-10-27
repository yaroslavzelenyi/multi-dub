import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // Стан теми: 'light' або 'dark'
  const currentTheme = ref('light')

  // Computed властивість для перевірки чи темна тема активна
  const isDark = computed(() => currentTheme.value === 'dark')

  // Ініціалізація теми при завантаженні
  const initializeTheme = () => {
    // Перевіряємо збережену тему в localStorage
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      // Якщо є збережена тема - використовуємо її
      currentTheme.value = savedTheme
    } else {
      // Якщо немає - перевіряємо системні налаштування
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }

    // Застосовуємо тему до документа
    applyThemeToDocument()

    // Слухаємо зміни системних налаштувань
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Змінюємо тему тільки якщо користувач не встановив свою preference
      if (!localStorage.getItem('theme')) {
        currentTheme.value = e.matches ? 'dark' : 'light'
        applyThemeToDocument()
      }
    })
  }

  // Застосування теми до HTML документа
  const applyThemeToDocument = () => {
    const htmlElement = document.documentElement

    if (currentTheme.value === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  // Перемикання між темами
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'

    // Зберігаємо вибір користувача
    localStorage.setItem('theme', currentTheme.value)

    // Застосовуємо нову тему
    applyThemeToDocument()
  }

  // Встановлення конкретної теми
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
