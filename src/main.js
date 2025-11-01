import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import messages from './locales/index.js'
import { useThemeStore } from './stores/theme'

const i18n = createI18n({
  legacy: false,
  locale: 'uk',
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

const themeStore = useThemeStore()
themeStore.initializeTheme()

app.mount('#app')
